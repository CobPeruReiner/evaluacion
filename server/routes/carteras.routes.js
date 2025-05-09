const express = require('express');

const {
	getAllCarteras,
	getCarteraById
} = require('../controllers/carteras.controller.js');

const carterasRouter = express.Router();

carterasRouter.get('/', getAllCarteras);
carterasRouter.get('/:carteraId', getCarteraById);

module.exports = { carterasRouter };