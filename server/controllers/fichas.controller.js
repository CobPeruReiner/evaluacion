const { QueryTypes } = require("sequelize");
const { catchAsync } = require("../utils/catchAsync.util");
const { db } = require("../utils/database.util");
const { AppError } = require("../utils/appError.util");

// Compatibilidad de las rutas históricas /fichas con el modelo normalizado.
// La fuente única de evaluaciones es CALIDAD.EVALUACION; no consultar la tabla
// heredada que ya fue eliminada.
const evaluationProjection = `
  SELECT
    e.ID_EVALUACION AS id,
    e.ID_EVALUACION,
    e.FE_GESTION AS fecha_llamada,
    e.ID_GESTION AS id_gestion,
    e.ID_GESTOR,
    e.ID_DEUDOR AS dni_cliente,
    e.TELEFONO AS telefono,
    e.RESULTADO AS resultado,
    e.IN_CALIDAD AS calificacion_final,
    e.IN_FEEDBACK AS feedback_recibido,
    e.DE_FEEDBACK AS feedback_compromiso,
    e.FE_REGISTRO AS fecha_monitoreo,
    modelo.NOMBRE AS modelo,
    cartera.cartera AS cartera,
    CONCAT_WS(' ', gestor.NOMBRES, gestor.APELLIDOS) AS agente,
    gestor.DOC AS agente_dni,
    CONCAT_WS(' ', monitor.NOMBRES, monitor.APELLIDOS) AS nombre_monitor
  FROM CALIDAD.EVALUACION AS e
  INNER JOIN CALIDAD.MODELO_EVALUACION AS modelo ON modelo.ID_MODELO = e.ID_MODELO
  LEFT JOIN SISTEMAGEST.cartera AS cartera ON cartera.id = modelo.ID_CARTERA
  LEFT JOIN SISTEMAGEST.personal AS gestor ON gestor.IDPERSONAL = e.ID_GESTOR
  LEFT JOIN SISTEMAGEST.personal AS monitor ON monitor.IDPERSONAL = e.ID_MONITOR
`;

const selectEvaluaciones = (where = "", replacements = {}) =>
  db.query(`${evaluationProjection} ${where}`, {
    replacements,
    type: QueryTypes.SELECT,
  });

// El formulario antiguo enviaba columnas que ya no existen en el modelo
// normalizado. Las evaluaciones manuales se registran por POST /evaluaciones.
const createFicha = catchAsync(async (_req, _res, next) => {
  return next(
    new AppError(
      "El registro heredado fue retirado. Usa POST /api/v1/evaluaciones.",
      410,
    ),
  );
});

const getAllFichas = catchAsync(async (req, res) => {
  const { firstDate, secondDate } = req.query;
  if (!firstDate || !secondDate)
    throw new AppError("Debe indicar firstDate y secondDate.", 400);
  const fichas = await selectEvaluaciones(
    "WHERE DATE(e.FE_GESTION) BETWEEN :firstDate AND :secondDate ORDER BY e.FE_GESTION DESC",
    { firstDate, secondDate },
  );
  res.status(200).json({ status: "success", fichas });
});

const getFilteredlFichas = catchAsync(async (req, res) => {
  const { cliente, firstDate, secondDate, asesor } = req.query;
  const conditions = [];
  const replacements = {};
  if (firstDate && secondDate) {
    conditions.push("DATE(e.FE_GESTION) BETWEEN :firstDate AND :secondDate");
    replacements.firstDate = firstDate;
    replacements.secondDate = secondDate;
  }
  if (cliente) {
    conditions.push("cartera.cartera = :cliente");
    replacements.cliente = cliente;
  }
  if (asesor) {
    conditions.push("gestor.DOC = :asesor");
    replacements.asesor = asesor;
  }
  if (!conditions.length)
    throw new AppError("Debe proporcionar al menos un filtro compatible.", 400);
  const fichas = await selectEvaluaciones(
    `WHERE ${conditions.join(" AND ")} ORDER BY e.FE_GESTION DESC`,
    replacements,
  );
  res.status(200).json({ status: "success", fichas });
});

const getFichasByUser = catchAsync(async (req, res) => {
  const fichas = await selectEvaluaciones(
    "WHERE gestor.DOC = :monitor ORDER BY e.FE_GESTION DESC",
    { monitor: req.params.monitor },
  );
  res.status(200).json({ status: "success", fichas });
});

const getTypeOfFicha = catchAsync(async (req, res) => {
  const fichas = await db.query(
    `SELECT c.id, c.cartera, tc.nombre AS tramo, c.tipo,
       CASE WHEN c.tipo IN (1, 3, 4) THEN 'ficha02' ELSE 'ficha00' END AS ficha
     FROM SISTEMAGEST.cartera AS c
     INNER JOIN SISTEMAGEST.tipo_cartera AS tc ON tc.id = c.tipo
     WHERE c.cartera = :cartera AND c.estado = 1`,
    { replacements: { cartera: req.query.cartera }, type: QueryTypes.SELECT },
  );
  res.status(200).json({ status: "success", fichas });
});

const getAsesorEvaluaciones = catchAsync(async (req, res) => {
  const month = Number(req.query.month);
  const year = Number(req.query.year || new Date().getFullYear());
  if (!req.query.dni || !Number.isInteger(month) || month < 1 || month > 12)
    throw new AppError("DNI y mes numérico (1-12) son obligatorios.", 400);
  const fichas = await selectEvaluaciones(
    `WHERE gestor.DOC = :dni
       AND MONTH(e.FE_GESTION) = :month
       AND YEAR(e.FE_GESTION) = :year
     ORDER BY e.FE_GESTION DESC, e.ID_EVALUACION DESC`,
    { dni: req.query.dni, month, year },
  );
  res.status(200).json({ status: "success", fichas });
});

const getPromedioAnualCalificacion = catchAsync(async (req, res) => {
  const year = Number(req.query.year || new Date().getFullYear());
  if (!req.query.dni) throw new AppError("El DNI es obligatorio.", 400);
  const [promedio] = await db.query(
    `SELECT AVG(e.IN_CALIDAD) AS promedioCalificacionFinal
     FROM CALIDAD.EVALUACION AS e
     INNER JOIN SISTEMAGEST.personal AS gestor ON gestor.IDPERSONAL = e.ID_GESTOR
     WHERE gestor.DOC = :dni AND YEAR(e.FE_GESTION) = :year`,
    { replacements: { dni: req.query.dni, year }, type: QueryTypes.SELECT },
  );
  res.status(200).json({
    status: "success",
    promedio: promedio.promedioCalificacionFinal,
  });
});

const addFeedbackData = catchAsync(async (req, res, next) => {
  const { idevaluacion, isFeedbackCompleted, compromiso } = req.body;
  const [updateResult] = await db.query(
    `UPDATE CALIDAD.EVALUACION
     SET IN_FEEDBACK = :feedbackRecibido, DE_FEEDBACK = :feedbackCompromiso
     WHERE ID_EVALUACION = :idEvaluacion`,
    {
      replacements: {
        idEvaluacion: idevaluacion,
        feedbackRecibido: isFeedbackCompleted ? 1 : 0,
        feedbackCompromiso: compromiso?.trim() || null,
      },
    },
  );
  if (!updateResult.affectedRows)
    return next(new AppError(`Evaluación ${idevaluacion} no encontrada.`, 404));
  res.status(200).json({ status: "success" });
});

module.exports = {
  createFicha,
  getAllFichas,
  getFilteredlFichas,
  getFichasByUser,
  getTypeOfFicha,
  getAsesorEvaluaciones,
  getPromedioAnualCalificacion,
  addFeedbackData,
};
