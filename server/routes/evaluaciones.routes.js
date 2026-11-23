const express = require("express");
const { getConfiguration, createEvaluation, listHistory, getHistoryDetail, exportHistory } = require("../controllers/evaluaciones.controller");

const evaluacionesRouter = express.Router();

evaluacionesRouter.get("/configuracion/:idCartera", getConfiguration);
evaluacionesRouter.post("/", createEvaluation);
evaluacionesRouter.get("/", listHistory);
// Antes de /:idEvaluacion para que "exportar" no se tome como un id.
evaluacionesRouter.get("/exportar", exportHistory);
evaluacionesRouter.get("/:idEvaluacion", getHistoryDetail);

module.exports = { evaluacionesRouter };
