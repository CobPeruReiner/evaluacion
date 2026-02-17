const express = require("express");
const {
  getAllCycGestions,
  getClientesAndCarteras,
  getEfectosByCartera,
  getFilteredCycGestions,
  getMotivoNoPagCartera,
  getTipoGestionCartera,
  getPersonalAsesor,
  getResponsableNoFCR,
  getMotivoNoFCR,
  getMotivoAlerta,
  getCriteriosEvaluacionByCartera,
} = require("../controllers/gestionesCycWeb.controller");

const gestionesCycWebRouter = express.Router();

gestionesCycWebRouter.get("/", getAllCycGestions);

gestionesCycWebRouter.get("/filteredGestions", getFilteredCycGestions);

gestionesCycWebRouter.get("/carYcli", getClientesAndCarteras);

gestionesCycWebRouter.get("/efectosByCartera", getEfectosByCartera);

gestionesCycWebRouter.get("/mot-no-pag-cartera", getMotivoNoPagCartera);

gestionesCycWebRouter.get("/tipo-gestion-cartera", getTipoGestionCartera);

gestionesCycWebRouter.get("/responsable-no-fcr", getResponsableNoFCR);

gestionesCycWebRouter.get("/motivo-no-fcr", getMotivoNoFCR);

gestionesCycWebRouter.get("/motivo-alerta", getMotivoAlerta);

gestionesCycWebRouter.get("/personal", getPersonalAsesor);

gestionesCycWebRouter.get(
  "/criterios-evaluacion-por-cartera",
  getCriteriosEvaluacionByCartera,
);

module.exports = { gestionesCycWebRouter };
