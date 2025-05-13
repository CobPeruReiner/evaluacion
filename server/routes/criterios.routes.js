const express = require("express");
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
} = require("../controllers/criterios.controller");
const {
  buscarIdPersonal,
} = require("../middlewares/Criterios/BuscarIdPersonal");
const {
  validarPesoTotal,
} = require("../middlewares/Criterios/ValidarPesoTotal");

const criteriosEvaluacionRouter = express.Router();

// ITEMS
criteriosEvaluacionRouter.get("/items", getAllItems);

criteriosEvaluacionRouter.post(
  "/items/create",
  buscarIdPersonal,
  validarPesoTotal("ITEM"),
  createItem
);

criteriosEvaluacionRouter.put(
  "/items/update",
  buscarIdPersonal,
  validarPesoTotal("ITEM"),
  updateItem
);

// CRITERIOS
criteriosEvaluacionRouter.get("/criterios", getAllCriterios);

criteriosEvaluacionRouter.post(
  "/criterios/create",
  validarPesoTotal("CRITERIO"),
  buscarIdPersonal,
  createCriterio
);

criteriosEvaluacionRouter.put(
  "/criterios/update",
  validarPesoTotal("CRITERIO"),
  buscarIdPersonal,
  updateCriterio
);

// ACCIONES
criteriosEvaluacionRouter.get("/acciones", getAllAcciones);

criteriosEvaluacionRouter.post(
  "/acciones/create",
  validarPesoTotal("ACCION_CRITERIO"),
  buscarIdPersonal,
  createAccion
);

criteriosEvaluacionRouter.put(
  "/acciones/update",
  validarPesoTotal("ACCION_CRITERIO"),
  buscarIdPersonal,
  updateAccion
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

module.exports = { criteriosEvaluacionRouter };
