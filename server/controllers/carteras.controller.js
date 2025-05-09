const { Cartera } = require('../models/cartera.model');
const { catchAsync } = require('../utils/catchAsync.util');

const getAllCarteras = async (req, res, next) => {

    const carteras = await Cartera.findAll();

    res.status(200).json({
        status: 'success',
        carteras,
    });

};

const getCarteraById = catchAsync(async (req, res, next) => {
    const { carteraId } = req.params;

    const carteraFound = await Cartera.findOne({
        where: {
            idcartera: carteraId,
        }
    });

    res.status(201).json({
        status: 'success',
        carteraFound,
    });
});

module.exports = {
    getAllCarteras,
    getCarteraById
};