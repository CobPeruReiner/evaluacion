const { QueryTypes } = require("sequelize");
const { catchAsync } = require("../utils/catchAsync.util");
const { db } = require("../utils/database.util");
const { AppError } = require("../utils/appError.util");

// `fichas` is an existing, manually managed table. Keep its schema in SQL
// rather than registering a Sequelize model, so db.sync() cannot create it.
const FICHA_COLUMNS = [
  "id_evaluacion", "cartera", "tramo", "agente", "agente_dni", "mes_llamada",
  "fecha_llamada", "semana_llamada", "telefono", "dni_cliente", "resultado",
  "hora_llamada", "tmo_segundos", "tipo_llamada", "tipo_gestion", "alerta",
  "descripcion_alerta", "motivo_no_pago", "responsabilidad_no_fcr", "motivo_no_fcr",
  "fecha_monitoreo", "nombre_monitor", "rol", "hora_inicio", "hora_fin",
  "duracion_monitoreo", "saludo_11", "contactar_con_persona_12",
  "identificacion_gestor_13", "apertura", "apertura_completado",
  "brindar_informacion_21", "indagar_motivo_no_pago_22", "asesorar_23",
  "indagacion", "indagacion_completado", "mantiene_sentido_urgencia_31",
  "perseverancia_objetivo_32", "manejo", "manejo_completado", "reafirmar_acuerdos_41",
  "despedida_cliente_42", "cierre", "cierre_completado", "escucha_activa_51",
  "comunicacion_cliente_52", "amabilidad_cliente_53", "habilidades",
  "habilidades_completado", "uso_herramientas_61", "registro_gestiones_62",
  "herramientas", "herramientas_completado", "calificacion_final", "observaciones",
  "tipo_ficha", "feedback_compromiso", "feedback_recibido",
];

const selectFichas = (where = "", replacements = {}) =>
  db.query(`SELECT * FROM CALIDAD.fichas ${where}`, { replacements, type: QueryTypes.SELECT });

const createFicha = catchAsync(async (req, res) => {
  const values = Object.fromEntries(FICHA_COLUMNS.map((column) => [
    column,
    column === "feedback_recibido" ? (req.body[column] ?? 0) : (req.body[column] ?? null),
  ]));
  const columns = FICHA_COLUMNS.map((column) => `\`${column}\``).join(", ");
  const parameters = FICHA_COLUMNS.map((column) => `:${column}`).join(", ");
  const [insertResult] = await db.query(
    `INSERT INTO CALIDAD.fichas (${columns}) VALUES (${parameters})`, { replacements: values },
  );
  const [newFicha] = await selectFichas("WHERE id = :id", { id: insertResult.insertId });
  res.status(201).json({ status: "success", newFicha });
});

const getAllFichas = catchAsync(async (req, res) => {
  const fichas = await selectFichas(
    "WHERE STR_TO_DATE(fecha_monitoreo, '%d/%m/%Y') BETWEEN :firstDate AND :secondDate",
    { firstDate: req.query.firstDate, secondDate: req.query.secondDate },
  );
  const safeFichas = fichas.map(({ agente_dni, ...ficha }) => ficha);
  res.status(200).json({ status: "success", fichas: safeFichas });
});

const getFilteredlFichas = catchAsync(async (req, res) => {
  const { cliente, tramo, firstDate, secondDate, asesor } = req.query;
  const conditions = [];
  const replacements = {};
  if (firstDate && secondDate) {
    conditions.push("STR_TO_DATE(fecha_monitoreo, '%d/%m/%Y') BETWEEN :firstDate AND :secondDate");
    replacements.firstDate = firstDate;
    replacements.secondDate = secondDate;
  }
  if (cliente) { conditions.push("cartera = :cliente"); replacements.cliente = cliente; }
  if (tramo && tramo !== "TODOS") { conditions.push("tramo = :tramo"); replacements.tramo = tramo; }
  if (asesor) { conditions.push("agente_dni = :asesor"); replacements.asesor = asesor; }
  if (!conditions.length) throw new AppError("Debe proporcionar al menos un filtro.", 400);
  const fichas = await selectFichas(`WHERE ${conditions.join(" AND ")}`, replacements);
  res.status(200).json({ status: "success", fichas });
});

const getFichasByUser = catchAsync(async (req, res) => {
  const fichas = await selectFichas("WHERE agente_dni = :monitor", { monitor: req.params.monitor });
  res.status(200).json({ status: "success", fichas });
});

const getTypeOfFicha = async (req, res) => {
  try {
    const fichas = await db.query(
      `SELECT c.id, c.cartera, tc.nombre AS tramo, c.tipo,
       CASE WHEN tipo IN (1, 3, 4) THEN 'ficha02' ELSE 'ficha00' END AS ficha
       FROM SISTEMAGEST.cartera c INNER JOIN SISTEMAGEST.tipo_cartera tc ON c.tipo = tc.id
       WHERE cartera = :cartera AND c.estado = 1`,
      { replacements: { cartera: req.query.cartera }, type: QueryTypes.SELECT },
    );
    res.status(200).json({ status: "success", fichas });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

const getAsesorEvaluaciones = catchAsync(async (req, res) => {
  const fichas = await selectFichas(
    `WHERE agente_dni = :dni AND mes_llamada = :month
     AND YEAR(STR_TO_DATE(fecha_llamada, '%d/%m/%Y')) = 2024`,
    { dni: req.query.dni, month: req.query.month },
  );
  res.status(200).json({ status: "success", fichas });
});

const getPromedioAnualCalificacion = catchAsync(async (req, res) => {
  const [promedio] = await db.query(
    `SELECT AVG(calificacion_final) AS promedioCalificacionFinal FROM CALIDAD.fichas
     WHERE agente_dni = :dni
     AND STR_TO_DATE(fecha_llamada, '%d/%m/%Y') > '2024-06-01'`,
    { replacements: { dni: req.query.dni }, type: QueryTypes.SELECT },
  );
  res.status(200).json({ status: "success", promedio: promedio.promedioCalificacionFinal });
});

const addFeedbackData = catchAsync(async (req, res, next) => {
  const { idevaluacion, isFeedbackCompleted, compromiso } = req.body;
  const [updateResult] = await db.query(
    `UPDATE CALIDAD.fichas SET feedback_recibido = :feedback_recibido,
     feedback_compromiso = :feedback_compromiso WHERE id = :id`,
    { replacements: { id: idevaluacion, feedback_recibido: isFeedbackCompleted, feedback_compromiso: compromiso } },
  );
  if (!updateResult.affectedRows) return next(new AppError(`Evaluación con id ${idevaluacion} no encontrado`, 404));
  res.status(200).json({ status: "success" });
});

module.exports = {
  createFicha, getAllFichas, getFilteredlFichas, getFichasByUser, getTypeOfFicha,
  getAsesorEvaluaciones, getPromedioAnualCalificacion, addFeedbackData,
};
