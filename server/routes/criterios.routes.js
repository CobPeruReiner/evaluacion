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
  processZip,
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

const upload = multer({
  dest: path.join(__dirname, "..", "uploads"),
});

const criteriosEvaluacionRouter = express.Router();

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
criteriosEvaluacionRouter.post("/audios", upload.single("zip"), processZip);

// AUDITORIA
criteriosEvaluacionRouter.get("/auditoria", obtenerResultadosPorFechaCartera);
criteriosEvaluacionRouter.get("/auditoria/detalle", obtenerDetalleEvaluacion);

criteriosEvaluacionRouter.get("/getAll-cartera", getAllCarteras);
// criteriosEvaluacionRouter.get("/getAll-fechas", obtenerFechasDisponibles);

module.exports = { criteriosEvaluacionRouter };
