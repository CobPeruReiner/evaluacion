const express = require('express');
const { getAllCycGestions, getClientesAndCarteras, getAllEfectos, getEfectosByCartera, getFilteredCycGestions, getPersonal } = require('../controllers/gestionesCycWeb.controller');

const gestionesCycWebRouter = express.Router();

gestionesCycWebRouter.get('/', getAllCycGestions);
gestionesCycWebRouter.get('/filteredGestions', getFilteredCycGestions);
gestionesCycWebRouter.get('/carYcli', getClientesAndCarteras);
gestionesCycWebRouter.get('/efectos', getAllEfectos);
gestionesCycWebRouter.get('/efectosByCartera', getEfectosByCartera);
gestionesCycWebRouter.get('/personal', getPersonal);

module.exports = { gestionesCycWebRouter };