const { QueryTypes } = require("sequelize");
const { db } = require("./database.util");
const { getModelRows, toModel } = require("../controllers/evaluaciones.controller");
const { calcularNota } = require("./notaEvaluacion");

// Guarda en CALIDAD.EVALUACION (+ DETALLE_EVALUACION y OBSERVACION_ITEM) cada llamada que el
// agente calificó, para que aparezca en /evaluaciones y en sus reportes junto a las manuales.
// - Monitor: el personal "SPEECH ANALYTICS" (SPEECH_ID_MONITOR, por defecto 1972).
// - Tipo de llamada: la opción del catálogo que identifica al agente (SPEECH_TIPO_LLAMADA,
//   por defecto "Speech Analytics"), creada en Opciones de evaluación.
// - Tipo de gestión y motivo de no pago: los que eligió el agente del catálogo de la cartera.
// - ID_GESTION, ID_DEUDOR: NULL (el audio no se puede enlazar con una gestión).
//   ID_GESTOR: el personal cuyo nombre coincide con el asesor de Vicidial, si es único.
// No marca gestion_tmk como revisada. Nunca lanza: devuelve { guardado, motivo }.

const ID_MONITOR = Number(process.env.SPEECH_ID_MONITOR) || 1972;
const TIPO_LLAMADA = process.env.SPEECH_TIPO_LLAMADA || "Speech Analytics";
const MAX_OBSERVACION = 250;

// Las tablas son latin1: comillas tipográficas, "…" o emojis del agente romperían el INSERT.
const latin1 = (texto) =>
  String(texto ?? "")
    .replace(/[‘’]/g, "'")
    .replace(/[“”«»]/g, '"')
    .replace(/…/g, "...")
    .replace(/[–—]/g, "-")
    .replace(/[^\u0000-ÿ]/g, "");

const fechaMysql = (date) => {
  const p = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())} ${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`;
};

// Fecha y hora de la llamada a partir del nombre del audio (YYYYMMDD y HHMMSS).
const fechaLlamada = ({ fecha, hora } = {}) => {
  const f = String(fecha || "");
  const h = String(hora || "").padEnd(6, "0");
  if (!/^\d{8}$/.test(f)) return null;
  const date = new Date(+f.slice(0, 4), +f.slice(4, 6) - 1, +f.slice(6, 8), +h.slice(0, 2) || 0, +h.slice(2, 4) || 0, +h.slice(4, 6) || 0);
  return Number.isNaN(date.getTime()) ? null : fechaMysql(date);
};

// TELEFONO es INT(11): se guardan los últimos 9 dígitos (celular peruano) si viene con prefijo.
const telefono = (valor) => {
  const digitos = String(valor || "").replace(/\D/g, "");
  const n = Number(digitos.length > 9 ? digitos.slice(-9) : digitos);
  return Number.isFinite(n) && n <= 2147483647 ? n : 0;
};

const unaFila = async (sql, replacements, transaction) =>
  (await db.query(sql, { replacements, type: QueryTypes.SELECT, transaction }))[0] || null;

async function idPorNombre(tabla, columnaId, columnaNombre, nombre, idCartera, transaction) {
  const filtroCartera = idCartera == null ? "" : "AND ID_CARTERA = :idCartera";
  const fila = await unaFila(
    `SELECT ${columnaId} AS id FROM CALIDAD.${tabla}
     WHERE LOWER(TRIM(${columnaNombre})) = LOWER(TRIM(:nombre)) AND ID_ESTADO = 1 ${filtroCartera} LIMIT 1`,
    { nombre, idCartera },
    transaction,
  );
  return fila?.id ?? null;
}

async function idValido(tabla, columnaId, id, idCartera, transaction) {
  if (!Number.isInteger(Number(id)) || !id) return null;
  const fila = await unaFila(
    `SELECT ${columnaId} AS id FROM CALIDAD.${tabla} WHERE ${columnaId} = :id AND ID_CARTERA = :idCartera AND ID_ESTADO = 1 LIMIT 1`,
    { id: Number(id), idCartera },
    transaction,
  );
  return fila?.id ?? null;
}

// Asesor: personal humano activo cuyo nombre completo coincide con el de Vicidial (solo si es único).
async function idGestor(nombreCompleto, transaction) {
  const nombre = String(nombreCompleto || "").trim().replace(/\s+/g, " ");
  if (!nombre) return null;
  const filas = await db.query(
    `SELECT IDPERSONAL FROM SISTEMAGEST.personal
     WHERE IDESTADO = 1 AND TIPO_PERSONAL = 'HUMANO'
       AND (UPPER(CONCAT(TRIM(NOMBRES), ' ', TRIM(APELLIDOS))) = UPPER(:nombre)
         OR UPPER(CONCAT(TRIM(APELLIDOS), ' ', TRIM(NOMBRES))) = UPPER(:nombre))
     LIMIT 2`,
    { replacements: { nombre }, type: QueryTypes.SELECT, transaction },
  );
  return filas.length === 1 ? filas[0].IDPERSONAL : null;
}

async function guardarEvaluacionSpeech(item, { idCartera }) {
  const ev = item?.evaluacion;
  if (ev?.estado !== "evaluado") return { guardado: false, motivo: "La llamada no tiene calificación del agente." };
  const rutaAudio = latin1(item.archivo);
  try {
    const existente = await unaFila(
      "SELECT ID_EVALUACION FROM CALIDAD.EVALUACION WHERE ID_MONITOR = :idMonitor AND RUTA_AUDIO = :rutaAudio LIMIT 1",
      { idMonitor: ID_MONITOR, rutaAudio },
    );
    if (existente) return { guardado: true, idEvaluacion: existente.ID_EVALUACION, duplicado: true };

    const idEvaluacion = await db.transaction(async (transaction) => {
      const modelo = toModel(await getModelRows(idCartera, transaction));
      const idModeloAgente = Number(ev.resumen_final?.id_modelo);
      if (idModeloAgente && idModeloAgente !== Number(modelo.idModelo))
        throw new Error("La plantilla activa cambió después de evaluar la llamada.");

      const idTipoLlamada = await idPorNombre("TIPO_LLAMADA", "ID_TIPO_LLAMADA", "NOMBRE_TIPO_LLAMADA", TIPO_LLAMADA, null, transaction);
      if (!idTipoLlamada) throw new Error(`Falta el tipo de llamada "${TIPO_LLAMADA}" en el catálogo.`);
      const idTipoGestion = (await idValido("TIPO_GESTION", "ID_TIPO_GESTION", ev.tipo_gestion?.id, idCartera, transaction))
        || (await idPorNombre("TIPO_GESTION", "ID_TIPO_GESTION", "NOMBRE_TIPO_GESTION", "No evaluable", idCartera, transaction));
      if (!idTipoGestion) throw new Error("La cartera no tiene tipos de gestión en el catálogo.");
      const idMotivo = (await idValido("MOTIVO_NO_PAGO", "ID_MOTIVO_NO_PAGO", ev.motivo_no_pago?.id, idCartera, transaction))
        || (await idPorNombre("MOTIVO_NO_PAGO", "ID_MOTIVO_NO_PAGO", "NOMBRE_MOTIVO_NO_PAGO", "Otros", idCartera, transaction));
      if (!idMotivo) throw new Error("La cartera no tiene motivos de no pago en el catálogo.");

      // Acción elegida por criterio → 100 a esa acción y 0 a las demás (igual que la ficha manual).
      const elegidas = new Map();
      (ev.items || []).forEach((it) => (it.criterios || []).forEach((c) => elegidas.set(Number(c.id_criterio), c)));
      const detalles = [];
      modelo.items.forEach((it) => it.criterios.forEach((c) => {
        const elegida = elegidas.get(Number(c.idCriterio));
        c.acciones.forEach((a) => detalles.push({
          idCriterio: c.idCriterio, pesoCriterio: c.peso, idAccion: a.idAccion, pesoAccion: a.peso,
          inPuntaje: elegida && Number(elegida.id_accion) === Number(a.idAccion) ? 100 : 0,
        }));
      }));
      // Misma nota que la ficha manual, con la cero tolerancia de la cartera.
      const inCalidad = calcularNota(modelo, new Map(detalles.map((d) => [Number(d.idAccion), d.inPuntaje])), idCartera).calidad;

      const segundos = Object.values(item.timings || {}).reduce((t, v) => t + (Number(v) || 0), 0);
      const fin = new Date();
      const tmo = Math.round(Math.max(0, ...(item.transcripcion || []).map((s) => Number(s.end) || 0)));
      const [nuevoId] = await db.query(
        `INSERT INTO CALIDAD.EVALUACION
        (ID_MODELO,ID_GESTION,FE_GESTION,ID_GESTOR,TELEFONO,ID_DEUDOR,RESULTADO,TMO_SEG,ID_TIPO_LLAMADA,ID_TIPO_GESTION,IN_ALERTA,ID_MOTIVO_ALERTA,ID_MOTIVO_NPG,ID_RESP_NO_FCR,ID_MOTIVO_NO_FCR,ID_MONITOR,FE_INICIO,FE_FIN,IN_CALIDAD,TI_TIPO,IN_FEEDBACK,DE_FEEDBACK,RUTA_AUDIO)
        VALUES (:idModelo,NULL,:feGestion,:idGestor,:telefono,NULL,:resultado,:tmo,:idTipoLlamada,:idTipoGestion,0,NULL,:idMotivo,NULL,NULL,:idMonitor,:feInicio,:feFin,:inCalidad,1,0,NULL,:rutaAudio)`,
        {
          replacements: {
            idModelo: modelo.idModelo,
            feGestion: fechaLlamada(item.metadatos) || fechaMysql(fin),
            idGestor: await idGestor(item.metadatos?.full_name, transaction),
            telefono: telefono(item.metadatos?.telefono),
            resultado: latin1(ev.resumen).slice(0, 2000) || null,
            tmo,
            idTipoLlamada,
            idTipoGestion,
            idMotivo,
            idMonitor: ID_MONITOR,
            feInicio: fechaMysql(new Date(fin.getTime() - segundos * 1000)),
            feFin: fechaMysql(fin),
            inCalidad,
            rutaAudio,
          },
          type: QueryTypes.INSERT,
          transaction,
        },
      );
      for (const d of detalles) {
        await db.query(
          `INSERT INTO CALIDAD.DETALLE_EVALUACION (ID_EVALUACION,ID_CRITERIO,PESO_CRITERIO,ID_ACCION,PESO_ACCION,IN_MAX_PUNTAJE,IN_PUNTAJE)
           VALUES (:idEvaluacion,:idCriterio,:pesoCriterio,:idAccion,:pesoAccion,100,:inPuntaje)`,
          { replacements: { idEvaluacion: nuevoId, ...d }, transaction },
        );
      }
      // Observación por ítem: la justificación del agente en los criterios que no cumplen al máximo.
      for (const it of modelo.items) {
        const notas = it.criterios
          .map((c) => elegidas.get(Number(c.idCriterio)))
          .filter((c) => c && !c.cumple_maximo && c.justificacion)
          .map((c) => `${c.criterio}: ${c.justificacion}`);
        if (!notas.length) continue;
        await db.query(
          "INSERT INTO CALIDAD.OBSERVACION_ITEM (ID_EVALUACION,ID_ITEM,PESO_ITEM,OBSERVACION) VALUES (:idEvaluacion,:idItem,:pesoItem,:observacion)",
          { replacements: { idEvaluacion: nuevoId, idItem: it.idItem, pesoItem: it.peso, observacion: latin1(notas.join(" | ")).slice(0, MAX_OBSERVACION) }, transaction },
        );
      }
      return nuevoId;
    });
    return { guardado: true, idEvaluacion };
  } catch (error) {
    console.error(`No se guardó en BD la evaluación de ${item.archivo}:`, error.message);
    return { guardado: false, motivo: error.message || "No se pudo guardar la evaluación." };
  }
}

module.exports = { guardarEvaluacionSpeech, ID_MONITOR, _internos: { latin1, fechaLlamada, telefono } };
