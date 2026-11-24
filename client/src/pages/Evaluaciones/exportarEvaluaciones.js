import moment from "moment";

const fecha = (value) => (value ? moment(value).format("DD/MM/YYYY HH:mm") : "");
const tmo = (segundos) => {
  const total = Math.max(0, Math.round(Number(segundos) || 0));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};
const numero = (value) => (value === null || value === undefined || value === "" ? "" : Number(Number(value).toFixed(2)));

/**
 * Genera el Excel del histórico con las evaluaciones visibles en la tabla:
 * hoja "Evaluaciones" (una fila por evaluación, con la nota y el % de cada ítem como columna)
 * y hoja "Detalle" (una fila por criterio y acción calificada).
 */
export async function exportarEvaluaciones({ evaluaciones, items, detalles }, idsVisibles) {
  const XLSX = await import("xlsx");
  const visibles = new Set(idsVisibles.map(Number));
  const filas = evaluaciones.filter((e) => visibles.has(Number(e.ID_EVALUACION)));

  // Columnas de ítems en el orden de la plantilla; si hay varias plantillas se unen.
  const columnasItem = [];
  const porEvaluacion = new Map();
  items.forEach((it) => {
    if (!visibles.has(Number(it.ID_EVALUACION))) return;
    if (!columnasItem.includes(it.NOMBRE_ITEM)) columnasItem.push(it.NOMBRE_ITEM);
    if (!porEvaluacion.has(it.ID_EVALUACION)) porEvaluacion.set(it.ID_EVALUACION, {});
    porEvaluacion.get(it.ID_EVALUACION)[it.NOMBRE_ITEM] = numero(it.PORCENTAJE);
  });

  const hojaEvaluaciones = filas.map((e) => {
    const fila = {
      "N° evaluación": e.ID_EVALUACION,
      "Fecha de evaluación": fecha(e.FE_REGISTRO),
      "Fecha de gestión": fecha(e.FE_GESTION),
      Cartera: e.CARTERA || "",
      Plantilla: e.MODELO || "",
      Asesor: e.ASESOR_NOMBRE || "",
      "DNI asesor": e.ASESOR_DOC || "",
      Monitor: e.MONITOR_NOMBRE || "",
      Tipo: Number(e.ES_AUTOMATICA) ? "Automática" : "Manual",
      Audio: e.RUTA_AUDIO || "",
      Teléfono: e.TELEFONO || "",
      "N° gestión": e.ID_GESTION ?? "",
      "TMO (mm:ss)": tmo(e.TMO_SEG),
      "TMO (seg)": Number(e.TMO_SEG) || 0,
      "Nota (%)": numero(e.IN_CALIDAD),
    };
    const notas = porEvaluacion.get(e.ID_EVALUACION) || {};
    columnasItem.forEach((nombre) => { fila[`${nombre} (%)`] = notas[nombre] ?? ""; });
    fila["Tipo de llamada"] = e.NOMBRE_TIPO_LLAMADA || "";
    fila["Tipo de gestión"] = e.NOMBRE_TIPO_GESTION || "";
    fila["Motivo de no pago"] = e.NOMBRE_MOTIVO_NO_PAGO || "";
    return fila;
  });

  const asesorDe = new Map(filas.map((e) => [e.ID_EVALUACION, e.ASESOR_NOMBRE || ""]));
  const hojaDetalle = detalles
    .filter((d) => visibles.has(Number(d.ID_EVALUACION)))
    .map((d) => ({
      "N° evaluación": d.ID_EVALUACION,
      Asesor: asesorDe.get(d.ID_EVALUACION) || "",
      Ítem: d.NOMBRE_ITEM,
      Criterio: d.NOMBRE_CRITERIO,
      Acción: d.NOMBRE_ACCION,
      "Peso acción (%)": numero(Number(d.PESO_ACCION) * 100),
      Resultado: Number(d.IN_PUNTAJE) >= 100 ? "Cumple" : Number(d.IN_PUNTAJE) <= 0 ? "No cumple" : `${numero(d.IN_PUNTAJE)}%`,
      Observación: d.OBSERVACION || "",
    }));

  const libro = XLSX.utils.book_new();
  const ancho = (filasHoja) => Object.keys(filasHoja[0] || {}).map((clave) => ({
    wch: Math.min(45, Math.max(clave.length, ...filasHoja.map((f) => String(f[clave] ?? "").length)) + 2),
  }));
  const h1 = XLSX.utils.json_to_sheet(hojaEvaluaciones);
  h1["!cols"] = ancho(hojaEvaluaciones);
  XLSX.utils.book_append_sheet(libro, h1, "Evaluaciones");
  const h2 = XLSX.utils.json_to_sheet(hojaDetalle);
  h2["!cols"] = ancho(hojaDetalle);
  XLSX.utils.book_append_sheet(libro, h2, "Detalle");
  XLSX.writeFile(libro, `evaluaciones_${moment().format("YYYYMMDD_HHmm")}.xlsx`);
  return filas.length;
}
