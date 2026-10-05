const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const { User } = require("../models/user.model");

const { catchAsync } = require("../utils/catchAsync.util");
const { AppError } = require("../utils/appError.util");
const { db } = require("../utils/database.util");
const { QueryTypes } = require("sequelize");

dotenv.config({ path: "./config.env" });

const protectSession = catchAsync(async (req, res, next) => {
  let token;

  const authorization = req.headers.authorization;
  if (authorization && /^Bearer\s+\S+$/i.test(authorization)) {
    token = authorization.replace(/^Bearer\s+/i, "");
  }

  if (!token) {
    return res.status(401).json({
      ok: false,
      code: "INVALID_SESSION",
      message: "Sesión inválida o vencida.",
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (_error) {
    return res.status(401).json({
      ok: false,
      code: "INVALID_SESSION",
      message: "Sesión inválida o vencida.",
    });
  }

  // { id, ... }

  // Check in db that user still exists
  // const user = await User.findOne({
  // 	where: { id: decoded.id, status: 'active' },
  // });

  const results = await db.query(
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
    return res.status(401).json({
      ok: false,
      code: "INVALID_SESSION",
      message: "La cuenta ya no está activa.",
    });
  }

  // Grant access
  req.sessionUser = user;
  next();
});

module.exports = { protectSession };
