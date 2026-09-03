const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  getAllItems,
  createItem,
  updateItem,
  getAllCriterios,
  createCriterio,
  updateCriterio,
  getAllAcciones,
  createAccion,
  updateAccion,
  getAllMotivosNoPago,
  createMotivoNoPago,
  updateMotivoNoPago,
  getAllTiposGestion,
  createTipoGestion,
  updateTipoGestion,
  getAllTiposLlamada,
  createTipoLlamada,
  updateTipoLlamada,
  getAllEfectos,
  obtenerResultadosPorFechaCartera,
  enqueueSpeechJob,
  getSpeechJob,
  getAllCarteras,
  // obtenerFechasDisponibles,
  obtenerDetalleEvaluacion,
} = require("../controllers/criterios.controller");
const {
  buscarIdPersonal,
} = require("../middlewares/Criterios/BuscarIdPersonal");
const {
  validarPesoTotal,
} = require("../middlewares/Criterios/ValidarPesoTotal");
const {
  validarPesoMultiple,
} = require("../middlewares/Criterios/validarPesoMultiple");
const { listModelos, getModelo, createModelo, updateModelo, deactivateModelo } = require("../controllers/modelosEvaluacion.controller");

const upload = multer({
  dest: path.join(__dirname, "..", "uploads"),
  limits: { fileSize: Number(process.env.MAX_ZIP_UPLOAD_BYTES || 1024 * 1024 * 1024) },
  fileFilter: (_req, file, callback) => {
    if (path.extname(file.originalname).toLowerCase() !== ".zip") {
      return callback(new Error("Solo se permiten archivos ZIP."));
    }
    return callback(null, true);
  },
});

const criteriosEvaluacionRouter = express.Router();

// EDITOR DINÁMICO DE PLANTILLAS
criteriosEvaluacionRouter.get("/modelos", listModelos);
criteriosEvaluacionRouter.get("/modelos/:idModelo", getModelo);
criteriosEvaluacionRouter.post("/modelos", createModelo);
criteriosEvaluacionRouter.put("/modelos/:idModelo", updateModelo);
criteriosEvaluacionRouter.delete("/modelos/:idModelo", deactivateModelo);

// ITEMS
criteriosEvaluacionRouter.get("/items", getAllItems);

criteriosEvaluacionRouter.post(
  "/items/create",
  buscarIdPersonal,
  validarPesoMultiple("ITEM"),
  createItem,
);

criteriosEvaluacionRouter.put(
  "/items/update",
  buscarIdPersonal,
  validarPesoTotal("ITEM"),
  updateItem,
);

// CRITERIOS
criteriosEvaluacionRouter.get("/criterios", getAllCriterios);

criteriosEvaluacionRouter.post(
  "/criterios/create",
  validarPesoTotal("CRITERIO"),
  buscarIdPersonal,
  createCriterio,
);

criteriosEvaluacionRouter.put(
  "/criterios/update",
  validarPesoTotal("CRITERIO"),
  buscarIdPersonal,
  updateCriterio,
);

// ACCIONES
criteriosEvaluacionRouter.get("/acciones", getAllAcciones);

criteriosEvaluacionRouter.post(
  "/acciones/create",
  validarPesoTotal("ACCION_CRITERIO"),
  buscarIdPersonal,
  createAccion,
);

criteriosEvaluacionRouter.put(
  "/acciones/update",
  validarPesoTotal("ACCION_CRITERIO"),
  buscarIdPersonal,
  updateAccion,
);

// MOTIVNOS NO PAGO
criteriosEvaluacionRouter.get("/motivos", getAllMotivosNoPago);
criteriosEvaluacionRouter.post("/motivos/create", createMotivoNoPago);
criteriosEvaluacionRouter.put("/motivos/update", updateMotivoNoPago);

// TIPOS DE GESTION
criteriosEvaluacionRouter.get("/gestiones", getAllTiposGestion);
criteriosEvaluacionRouter.post("/gestiones/create", createTipoGestion);
criteriosEvaluacionRouter.put("/gestiones/update", updateTipoGestion);

// TIPOS DE LLAMADA
criteriosEvaluacionRouter.get("/llamadas", getAllTiposLlamada);
criteriosEvaluacionRouter.post("/llamadas/create", createTipoLlamada);
criteriosEvaluacionRouter.put("/llamadas/update", updateTipoLlamada);

// EFECTOS
criteriosEvaluacionRouter.get("/efectos", getAllEfectos);

// PROCESAR AUDIOS
criteriosEvaluacionRouter.post("/audios", upload.single("zip"), enqueueSpeechJob);
criteriosEvaluacionRouter.get("/audios/:jobId", getSpeechJob);

// AUDITORIA
criteriosEvaluacionRouter.get("/auditoria", obtenerResultadosPorFechaCartera);
criteriosEvaluacionRouter.get("/auditoria/detalle", obtenerDetalleEvaluacion);

criteriosEvaluacionRouter.get("/getAll-cartera", getAllCarteras);
// criteriosEvaluacionRouter.get("/getAll-fechas", obtenerFechasDisponibles);

module.exports = { criteriosEvaluacionRouter };
