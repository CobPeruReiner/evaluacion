const express = require('express');

const {
	createFicha,
	getAllFichas,
	deleteFicha,
	getFichasByUser,
	getTypeOfFicha,
	getAsesorEvaluaciones,
	getPromedioAnualCalificacion,
	addFeedbackData,
	getFilteredlFichas
} = require('../controllers/fichas.controller.js');

const fichasRouter = express.Router();

fichasRouter.get('/', getAllFichas);
fichasRouter.get('/filter', getFilteredlFichas);
fichasRouter.post('/', createFicha);
fichasRouter.get('/tipoFicha', getTypeOfFicha);
fichasRouter.get('/evaluaciones', getAsesorEvaluaciones);
fichasRouter.get('/promedioAnualCalificacion', getPromedioAnualCalificacion);
fichasRouter.get('/:monitor', getFichasByUser);
fichasRouter.patch('/', addFeedbackData);

module.exports = { fichasRouter };