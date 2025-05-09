// Models
const { Base } = require('../models/base.model');

// Utils
const { AppError } = require('../utils/appError.util');
const { catchAsync } = require('../utils/catchAsync.util');

const baseExists = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const base = await Base.findOne({
		where: { id, estado: 'pendiente' },
	});

	if (!base) {
		return next(new AppError('Base not found', 404));
	}

	req.base = base;
	next();
});

module.exports = { baseExists };