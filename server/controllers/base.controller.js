const { Base } = require('../models/base.model');
const { catchAsync } = require('../utils/catchAsync.util');

const getAvailableBase = async (req, res, next) => {

    const base = await Base.findAll({ where: { estado: 'pendiente' } });
    res.status(200).json({
        status: 'success',
        base,
    });

};

const getAllBase = async (req, res, next) => {

    const base = await Base.findAll();
    res.status(200).json({
        status: 'success',
        base,
    });

};

const getBaseById = catchAsync(async (req, res, next) => {
    const { user } = req.params;

    const userBase = await Base.findOne({
        where: {
            USUARIO: user,
            estado: 'pendiente'
        }
    });

    res.status(201).json({
        status: 'success',
        userBase,
    });
});

const createBase = catchAsync(async (req, res, next) => {
    const baseData = req.body;
    const newBase = await Base.bulkCreate(baseData);

    // newUser.password = undefined;

    res.status(201).json({
        status: 'success',
        newBase,
    });
});

const updateBases = catchAsync(async (req, res, next) => {
    const { ficha, carterasSelected } = req.body;
    const bases = await Base.update({
        FICHA: ficha
    },
    {
        where: {
            CARTERA: carterasSelected
        }
    });

    res.status(200).json({
        status: 'success',
        bases,
    });

});

const deleteBase = catchAsync(async (req, res, next) => {
	const { base } = req;
    
	/* await base.update({ ESTADO: 'REVISADO' }); */

	res.status(204).json({ status: 'success' });
});

module.exports = {
    getAllBase,
    getAvailableBase,
    createBase,
    deleteBase,
    getBaseById,
    updateBases
}