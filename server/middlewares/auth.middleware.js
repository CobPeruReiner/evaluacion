const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const { User } = require("../models/user.model");

const { catchAsync } = require("../utils/catchAsync.util");
const { AppError } = require("../utils/appError.util");
const { dbWeb } = require("../utils/database.util");
const { QueryTypes } = require("sequelize");

dotenv.config({ path: "./config.env" });

const protectSession = catchAsync(async (req, res, next) => {
  let token;

  // Extract the token from headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("Invalid session", 403));
  }

  // Ask JWT (library), if the token is still valid
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);

  // { id, ... }

  // Check in db that user still exists
  // const user = await User.findOne({
  // 	where: { id: decoded.id, status: 'active' },
  // });

  const results = await dbWeb.query(
    `SELECT tb1.*, tb2.nombre
     FROM personal tb1
     LEFT JOIN cargo tb2
     ON tb1.CARGO = tb2.id
    WHERE IDPERSONAL = :id AND IDESTADO = 1`,
    {
      replacements: { id: decoded.id },
      type: QueryTypes.SELECT,
    }
  );

  const user = results[0];

  if (!user) {
    return next(
      new AppError("The owner of this token doesnt exist anymore", 403)
    );
  }

  // Grant access
  req.sessionUser = user;
  next();
});

module.exports = { protectSession };
