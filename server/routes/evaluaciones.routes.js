const express = require("express");
const { getConfiguration, createEvaluation, listHistory, getHistoryDetail } = require("../controllers/evaluaciones.controller");

const evaluacionesRouter = express.Router();

evaluacionesRouter.get("/configuracion/:idCartera", getConfiguration);
evaluacionesRouter.post("/", createEvaluation);
evaluacionesRouter.get("/", listHistory);
evaluacionesRouter.get("/:idEvaluacion", getHistoryDetail);

module.exports = { evaluacionesRouter };
