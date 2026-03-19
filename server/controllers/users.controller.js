const { User } = require("../models/user.model");
const { dbWeb } = require("../utils/database.util");
const bcrypt = require("bcryptjs");
const { QueryTypes } = require("sequelize");
const { AppError } = require("../utils/appError.util");
const { catchAsync } = require("../utils/catchAsync.util");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const md5 = require("md5");

const createUser = catchAsync(async (req, res, next) => {
  const { apellidos, nombres, dni, cargo, usuario, password, supervisor } =
    req.body;

  const salt = await bcrypt.genSalt(12);
  const hashPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    apellidos,
    nombres,
    dni,
    cargo,
    usuario,
    password: hashPassword,
    supervisor,
  });

  newUser.password = undefined;

  res.status(201).json({
    status: "success",
    newUser,
  });
});

const login = async (req, res, next) => {
  const { usuario, password } = req.body;

  console.log(" =================INICIANDO SESION =================");
  console.log("Credenciales: ", req.body);

  const results = await dbWeb.query(
    `SELECT tb1.*, tb2.nombre
     FROM personal tb1
     LEFT JOIN cargo tb2
     ON tb1.CARGO = tb2.id
     WHERE DOC = :usuario AND IDESTADO = 1`,
    {
      replacements: {
        usuario,
      },
      type: QueryTypes.SELECT,
    },
  );

  if (results.length === 0) {
    return next(new AppError("Invalid user", 400));
  }

  const user = results[0];

  let isPasswordValid = false;

  if (user.PASSWORD && user.PASSWORD.startsWith("$2")) {
    isPasswordValid = await bcrypt.compare(password, user.PASSWORD);
  } else {
    isPasswordValid = user.PASSWORD === md5(password);
  }

  if (!isPasswordValid) {
    console.log("Login fallido: ", usuario);
    return next(new AppError("Invalid password", 400));
  }

  const token = await jwt.sign(
    { id: user.IDPERSONAL },
    process.env.JWT_SECRET,
    {
      expiresIn: "10h",
    },
  );

  console.log("Logeado: ", user.NOMBRES);

  res.status(200).json({
    status: "success",
    user,
    token,
  });
};

const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.findAll();

  res.status(200).json({
    status: "success",
    users,
  });
});

const updateUser = catchAsync(async (req, res, next) => {
  const { password } = req.body;
  const { username } = req.params;

  const salt = await bcrypt.genSalt(12);
  const hashPassword = await bcrypt.hash(password, salt);

  const user = await User.findOne({
    where: { usuario: username },
  });

  if (!user) return next(new AppError("User not found", 404));

  await user.update({ password: hashPassword });

  res.status(204).json({ status: "success" });
});

const getSupervisores = catchAsync(async (req, res, next) => {
  const supervisores = await dbWeb.query(
    "SELECT IDPERSONAL, APELLIDOS, NOMBRES, DOC FROM personal WHERE cargo = 16 AND idestado = 1 ORDER BY APELLIDOS",
    {
      type: QueryTypes.SELECT,
    },
  );
  res.status(200).json({
    status: "success",
    supervisores,
  });
});

const getAsesorCarteras = catchAsync(async (req, res, next) => {
  const { doc } = req.query;

  const carteras = await dbWeb.query(
    `
            SELECT tl.id_cartera AS id, ca.cartera
            FROM tabla_log tl
            JOIN asignacion_tabla a ON tl.id = a.id_tabla
            JOIN cartera ca ON tl.id_cartera = ca.id
            JOIN personal p ON a.id_usuario = p.IDPERSONAL
            WHERE p.DOC = :doc
            order by ca.cartera  asc;
        `,
    {
      replacements: { doc },
      type: QueryTypes.SELECT,
    },
  );
  res.status(200).json({
    status: "success",
    carteras,
  });
});

const checkToken = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  res.status(200).json({
    status: "success",
    user: sessionUser,
  });
});

const compareUserPersonal = async (req, res) => {
  const { nombreUser } = req.params;

  const query = `
      SELECT IDPERSONAL
      FROM PERSONAL
      WHERE LOWER(CONCAT(TRIM(APELLIDOS), ', ', TRIM(NOMBRES))) = LOWER(:nombreUser)
    `;

  try {
    const personal = await dbWeb.query(query, {
      replacements: { nombreUser },
      type: QueryTypes.SELECT,
    });

    if (personal.length > 0) {
      res.status(200).json({
        ok: true,
        personal,
      });
    } else {
      res.status(404).json({
        ok: false,
        mensaje: "No se encontró personal con ese nombre.",
      });
    }
  } catch (error) {
    console.error("Error al buscar personal:", error);
    res.status(500).json({
      ok: false,
      mensaje: "Error al buscar personal en la base de datos.",
      error: error.message,
    });
  }
};

module.exports = {
  createUser,
  login,
  getAllUsers,
  checkToken,
  updateUser,
  getSupervisores,
  getAsesorCarteras,
  compareUserPersonal,
};
