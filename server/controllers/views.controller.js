const path = require('path');

const { catchAsync } = require('../utils/catchAsync.util');

const renderIndex = catchAsync(async (req, res, next) => {
	const indexPath = path.join(__dirname, '..', 'public', 'index.html');
	res.status(200).sendFile(indexPath);
});

module.exports = { renderIndex };
