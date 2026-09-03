const { QueryTypes } = require("sequelize");
const { db, dbWeb } = require("../utils/database.util");

const number = (value) => Number(value);
const mysqlDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime()))
    throw new Error("La fecha de la gestión no es válida.");
  return date.toISOString().slice(0, 19).replace("T", " ");
};

async function getMonitorId(dni) {
  const people = await dbWeb.query(
    "SELECT IDPERSONAL FROM personal WHERE DOC=:dni LIMIT 1",
    { replacements: { dni }, type: QueryTypes.SELECT },
  );
  if (!people.length)
    throw new Error("No se encontró al monitor que realiza la evaluación.");
  return people[0].IDPERSONAL;
}

async function getModelRows(idCartera, transaction) {
  const rows = await db.query(
    `SELECT m.ID_MODELO, m.NOMBRE AS NOMBRE_MODELO,
      i.ID_ITEM, i.NOMBRE AS NOMBRE_ITEM, i.PESO AS PESO_ITEM,
      c.ID_CRITERIO, c.NOMBRE AS NOMBRE_CRITERIO, c.PESO AS PESO_CRITERIO,
      a.ID_ACCION, a.NOMBRE AS NOMBRE_ACCION, a.PESO AS PESO_ACCION
    FROM CALIDAD.MODELO_EVALUACION m
    INNER JOIN CALIDAD.ITEM i ON i.ID_MODELO=m.ID_MODELO AND i.ESTADO=1
    INNER JOIN CALIDAD.CRITERIO c ON c.ID_ITEM=i.ID_ITEM AND c.ESTADO=1
    INNER JOIN CALIDAD.ACCION_CRITERIO a ON a.ID_CRITERIO=c.ID_CRITERIO AND a.ESTADO=1
    WHERE m.ID_CARTERA=:idCartera AND m.ESTADO=1
    ORDER BY i.ID_ITEM, c.ID_CRITERIO, a.ID_ACCION`,
    { replacements: { idCartera }, transaction, type: QueryTypes.SELECT },
  );
  const modelIds = [...new Set(rows.map((row) => row.ID_MODELO))];
  if (!rows.length)
    throw new Error("La cartera no tiene una plantilla de evaluación activa.");
  if (modelIds.length !== 1)
    throw new Error(
      "La cartera tiene más de una plantilla activa. Corrige la configuración antes de evaluar.",
    );
  return rows;
}

function toModel(rows) {
  const model = {
    idModelo: rows[0].ID_MODELO,
    nombre: rows[0].NOMBRE_MODELO,
    items: [],
  };
  const items = new Map();
  rows.forEach((row) => {
    if (!items.has(row.ID_ITEM)) {
      const item = {
        idItem: row.ID_ITEM,
        nombre: row.NOMBRE_ITEM,
        peso: number(row.PESO_ITEM),
        criterios: [],
      };
      items.set(row.ID_ITEM, item);
      model.items.push(item);
    }
    const item = items.get(row.ID_ITEM);
    let criterio = item.criterios.find(
      (value) => value.idCriterio === row.ID_CRITERIO,
    );
    if (!criterio) {
      criterio = {
        idCriterio: row.ID_CRITERIO,
        nombre: row.NOMBRE_CRITERIO,
        peso: number(row.PESO_CRITERIO),
        acciones: [],
      };
      item.criterios.push(criterio);
    }
    criterio.acciones.push({
      idAccion: row.ID_ACCION,
      nombre: row.NOMBRE_ACCION,
      peso: number(row.PESO_ACCION),
    });
  });
  return model;
}

const getConfiguration = async (req, res) => {
  try {
    const idCartera = Number(req.params.idCartera);
    if (!idCartera)
      return res
        .status(400)
        .json({ ok: false, msg: "La cartera es obligatoria." });
    res.json({ ok: true, modelo: toModel(await getModelRows(idCartera)) });
  } catch (error) {
    res.status(400).json({ ok: false, msg: error.message });
  }
};

function validateSubmission(body, model) {
  const { gestion, datos, detalles, observaciones } = body;
  if (
    !gestion?.idGestion ||
    !gestion?.fechaGestion ||
    !gestion?.idGestor ||
    !gestion?.idDeudor
  )
    throw new Error("La gestión seleccionada no está completa.");
  if (!datos?.idTipoLlamada || !datos?.idTipoGestion || !datos?.idMotivoNoPago)
    throw new Error(
      "Completa tipo de llamada, tipo de gestión y motivo de no pago.",
    );
  if (!Array.isArray(detalles) || !detalles.length)
    throw new Error("Debes calificar todas las acciones de la plantilla.");
  const expected = new Map();
  model.items.forEach((item) =>
    item.criterios.forEach((criterio) =>
      criterio.acciones.forEach((accion) =>
        expected.set(`${criterio.idCriterio}:${accion.idAccion}`, {
          item,
          criterio,
          accion,
        }),
      ),
    ),
  );
  if (detalles.length !== expected.size)
    throw new Error(
      "La evaluación debe incluir todas las acciones configuradas.",
    );
  detalles.forEach((detalle) => {
    const definition = expected.get(
      `${detalle.idCriterio}:${detalle.idAccion}`,
    );
    if (!definition)
      throw new Error(
        "La evaluación incluye una acción que no pertenece a la plantilla activa.",
      );
    if (
      !Number.isFinite(number(detalle.inPuntaje)) ||
      number(detalle.inPuntaje) < 0 ||
      number(detalle.inPuntaje) > 100
    )
      throw new Error("Cada acción debe tener un puntaje entre 0 y 100.");
  });
  if (datos.inAlerta && !datos.idMotivoAlerta)
    throw new Error("Selecciona el motivo de alerta.");
  if (!datos.inAlerta && (!datos.idResponsableNoFcr || !datos.idMotivoNoFcr))
    throw new Error("Selecciona responsable y motivo No FCR.");
  const expectedItems = new Set(model.items.map((item) => item.idItem));
  if (
    !Array.isArray(observaciones) ||
    observaciones.some((observation) => !expectedItems.has(observation.idItem))
  )
    throw new Error("Las observaciones no corresponden a la plantilla activa.");
}

const createEvaluation = async (req, res) => {
  try {
    const {
      idUsuario,
      gestion,
      datos,
      detalles,
      observaciones = [],
      fechaInicio,
      fechaFin,
    } = req.body;
    if (!idUsuario || !fechaInicio || !fechaFin)
      return res
        .status(400)
        .json({ ok: false, msg: "Faltan datos de inicio, fin o monitor." });
    const idMonitor = await getMonitorId(idUsuario);
    const idEvaluacion = await db.transaction(async (transaction) => {
      const model = toModel(await getModelRows(gestion.idCartera, transaction));
      validateSubmission(req.body, model);
      const [newId] = await db.query(
        `INSERT INTO CALIDAD.EVALUACION
        (ID_MODELO,ID_GESTION,FE_GESTION,ID_GESTOR,TELEFONO,ID_DEUDOR,RESULTADO,TMO_SEG,ID_TIPO_LLAMADA,ID_TIPO_GESTION,IN_ALERTA,ID_MOTIVO_ALERTA,ID_MOTIVO_NPG,ID_RESP_NO_FCR,ID_MOTIVO_NO_FCR,ID_MONITOR,FE_INICIO,FE_FIN,IN_CALIDAD,TI_TIPO,IN_FEEDBACK,DE_FEEDBACK,RUTA_AUDIO)
        VALUES (:idModelo,:idGestion,:fechaGestion,:idGestor,:telefono,:idDeudor,:resultado,:tmoSeg,:idTipoLlamada,:idTipoGestion,:inAlerta,:idMotivoAlerta,:idMotivoNoPago,:idResponsableNoFcr,:idMotivoNoFcr,:idMonitor,:fechaInicio,:fechaFin,:inCalidad,1,0,NULL,:rutaAudio)`,
        {
          replacements: {
            idModelo: model.idModelo,
            idGestion: gestion.idGestion,
            fechaGestion: mysqlDateTime(gestion.fechaGestion),
            idGestor: gestion.idGestor,
            telefono: gestion.telefono || 0,
            idDeudor: gestion.idDeudor,
            resultado: gestion.resultado || null,
            tmoSeg: datos.tmoSeg || 0,
            idTipoLlamada: datos.idTipoLlamada,
            idTipoGestion: datos.idTipoGestion,
            inAlerta: datos.inAlerta ? 1 : 0,
            idMotivoAlerta: datos.inAlerta ? datos.idMotivoAlerta : null,
            idMotivoNoPago: datos.idMotivoNoPago,
            idResponsableNoFcr: datos.inAlerta
              ? null
              : datos.idResponsableNoFcr,
            idMotivoNoFcr: datos.inAlerta ? null : datos.idMotivoNoFcr,
            idMonitor,
            fechaInicio: mysqlDateTime(fechaInicio),
            fechaFin: mysqlDateTime(fechaFin),
            inCalidad: datos.inCalidad,
            rutaAudio: gestion.rutaAudio || "",
          },
          transaction,
          type: QueryTypes.INSERT,
        },
      );
      for (const detail of detalles) {
        const definition = model.items
          .flatMap((item) => item.criterios)
          .flatMap((criterio) =>
            criterio.acciones.map((accion) => ({ criterio, accion })),
          )
          .find(
            (entry) =>
              entry.criterio.idCriterio === detail.idCriterio &&
              entry.accion.idAccion === detail.idAccion,
          );
        await db.query(
          `INSERT INTO CALIDAD.DETALLE_EVALUACION (ID_EVALUACION,ID_CRITERIO,PESO_CRITERIO,ID_ACCION,PESO_ACCION,IN_MAX_PUNTAJE,IN_PUNTAJE) VALUES (:idEvaluacion,:idCriterio,:pesoCriterio,:idAccion,:pesoAccion,:inMaxPuntaje,:inPuntaje)`,
          {
            replacements: {
              idEvaluacion: newId,
              idCriterio: definition.criterio.idCriterio,
              pesoCriterio: definition.criterio.peso,
              idAccion: definition.accion.idAccion,
              pesoAccion: definition.accion.peso,
              inMaxPuntaje: 100,
              inPuntaje: detail.inPuntaje,
            },
            transaction,
          },
        );
      }
      for (const observation of observaciones) {
        const item = model.items.find(
          (value) => value.idItem === observation.idItem,
        );
        await db.query(
          `INSERT INTO CALIDAD.OBSERVACION_ITEM (ID_EVALUACION,ID_ITEM,PESO_ITEM,OBSERVACION) VALUES (:idEvaluacion,:idItem,:pesoItem,:observacion)`,
          {
            replacements: {
              idEvaluacion: newId,
              idItem: item.idItem,
              pesoItem: item.peso,
              observacion: observation.observacion || null,
            },
            transaction,
          },
        );
      }
      const [, updated] = await db.query(
        `UPDATE SISTEMAGEST.gestion_tmk
         SET ESTADO_REVISION = 1
         WHERE id = :idGestion AND ID_CARTERA = :idCartera`,
        {
          replacements: {
            idGestion: gestion.idGestion,
            idCartera: gestion.idCartera,
          },
          transaction,
          type: QueryTypes.UPDATE,
        },
      );
      if (!updated)
        throw new Error("No se pudo marcar la gestión como revisada.");
      return newId;
    });
    res
      .status(201)
      .json({
        ok: true,
        msg: "Evaluación registrada correctamente.",
        idEvaluacion,
      });
  } catch (error) {
    res
      .status(400)
      .json({
        ok: false,
        msg: error.message || "No fue posible registrar la evaluación.",
      });
  }
};

const listHistory = async (_req, res) => {
  try {
    const evaluaciones = await db.query(
      `SELECT e.ID_EVALUACION,e.FE_GESTION,e.ID_GESTION,e.ID_GESTOR,e.ID_DEUDOR,e.RESULTADO,e.IN_CALIDAD,e.TI_TIPO,e.FE_REGISTRO,m.NOMBRE AS MODELO FROM CALIDAD.EVALUACION e INNER JOIN CALIDAD.MODELO_EVALUACION m ON m.ID_MODELO=e.ID_MODELO ORDER BY e.FE_REGISTRO DESC`,
      { type: QueryTypes.SELECT },
    );
    res.json({ ok: true, evaluaciones });
  } catch (error) {
    res.status(500).json({ ok: false, msg: "No se pudo cargar el histórico." });
  }
};

const getHistoryDetail = async (req, res) => {
  try {
    const idEvaluacion = Number(req.params.idEvaluacion);
    if (!idEvaluacion)
      return res.status(400).json({ ok: false, msg: "La evaluación no es válida." });

    const [evaluacion, detalles, observaciones] = await Promise.all([
      db.query(
        `SELECT e.ID_EVALUACION,e.ID_GESTION,e.FE_GESTION,e.ID_GESTOR,e.ID_MONITOR,e.TELEFONO,e.ID_DEUDOR,
          e.RESULTADO,e.TMO_SEG,e.IN_ALERTA,e.ID_TIPO_LLAMADA,e.ID_TIPO_GESTION,e.ID_MOTIVO_NPG,
          e.ID_MOTIVO_ALERTA,e.ID_RESP_NO_FCR,e.ID_MOTIVO_NO_FCR,e.FE_REGISTRO,e.FE_INICIO,e.FE_FIN,
          e.IN_CALIDAD,e.TI_TIPO,m.NOMBRE AS MODELO,tl.NOMBRE_TIPO_LLAMADA,
          tg.NOMBRE_TIPO_GESTION,mnp.NOMBRE_MOTIVO_NO_PAGO,ma.NOMBRE_MOTIVO_ALERTA,
          r.NOMBRE_RESPONSABLE_NO_FCR,mf.NOMBRE_MOTIVO_NO_FCR,
          CONCAT(TRIM(gestor.APELLIDOS), ', ', TRIM(gestor.NOMBRES)) AS GESTOR_NOMBRE,
          CONCAT(TRIM(monitor.APELLIDOS), ', ', TRIM(monitor.NOMBRES)) AS MONITOR_NOMBRE
        FROM CALIDAD.EVALUACION e
        INNER JOIN CALIDAD.MODELO_EVALUACION m ON m.ID_MODELO=e.ID_MODELO
        LEFT JOIN CALIDAD.TIPO_LLAMADA tl ON tl.ID_TIPO_LLAMADA=e.ID_TIPO_LLAMADA
        LEFT JOIN CALIDAD.TIPO_GESTION tg ON tg.ID_TIPO_GESTION=e.ID_TIPO_GESTION
        LEFT JOIN CALIDAD.MOTIVO_NO_PAGO mnp ON mnp.ID_MOTIVO_NO_PAGO=e.ID_MOTIVO_NPG
        LEFT JOIN CALIDAD.MOTIVO_ALERTA ma ON ma.ID_MOTIVO_ALERTA=e.ID_MOTIVO_ALERTA
        LEFT JOIN CALIDAD.RESPONSABLE_NO_FCR r ON r.ID_RESPONSABLE_NO_FCR=e.ID_RESP_NO_FCR
        LEFT JOIN CALIDAD.MOTIVO_NO_FCR mf ON mf.ID_MOTIVO_NO_FCR=e.ID_MOTIVO_NO_FCR
        LEFT JOIN SISTEMAGEST.personal gestor ON gestor.IDPERSONAL=e.ID_GESTOR
        LEFT JOIN SISTEMAGEST.personal monitor ON monitor.IDPERSONAL=e.ID_MONITOR
        WHERE e.ID_EVALUACION=:idEvaluacion LIMIT 1`,
        { replacements: { idEvaluacion }, type: QueryTypes.SELECT },
      ),
      db.query(
        `SELECT d.ID_DETALLE,d.ID_CRITERIO,d.ID_ACCION,d.PESO_CRITERIO,d.PESO_ACCION,d.IN_MAX_PUNTAJE,d.IN_PUNTAJE,
          i.ID_ITEM,i.NOMBRE AS NOMBRE_ITEM,i.PESO AS PESO_ITEM,
          c.NOMBRE AS NOMBRE_CRITERIO,a.NOMBRE AS NOMBRE_ACCION
        FROM CALIDAD.DETALLE_EVALUACION d
        INNER JOIN CALIDAD.CRITERIO c ON c.ID_CRITERIO=d.ID_CRITERIO
        INNER JOIN CALIDAD.ITEM i ON i.ID_ITEM=c.ID_ITEM
        INNER JOIN CALIDAD.ACCION_CRITERIO a ON a.ID_ACCION=d.ID_ACCION
        WHERE d.ID_EVALUACION=:idEvaluacion
        ORDER BY i.ID_ITEM,c.ID_CRITERIO,a.ID_ACCION`,
        { replacements: { idEvaluacion }, type: QueryTypes.SELECT },
      ),
      db.query(
        `SELECT o.ID_ITEM,o.PESO_ITEM,o.OBSERVACION,i.NOMBRE AS NOMBRE_ITEM
        FROM CALIDAD.OBSERVACION_ITEM o
        INNER JOIN CALIDAD.ITEM i ON i.ID_ITEM=o.ID_ITEM
        WHERE o.ID_EVALUACION=:idEvaluacion
        ORDER BY i.ID_ITEM`,
        { replacements: { idEvaluacion }, type: QueryTypes.SELECT },
      ),
    ]);
    if (!evaluacion.length)
      return res.status(404).json({ ok: false, msg: "No se encontró la evaluación solicitada." });
    res.json({ ok: true, evaluacion: evaluacion[0], detalles, observaciones });
  } catch (error) {
    console.error("getHistoryDetail:", error);
    res.status(500).json({ ok: false, msg: "No se pudo cargar el detalle de la evaluación." });
  }
};

module.exports = { getConfiguration, createEvaluation, listHistory, getHistoryDetail };
