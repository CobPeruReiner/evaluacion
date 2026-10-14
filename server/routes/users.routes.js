const express = require("express");

const {
  getAllUsers,
  createUser,
  login,
  checkToken,
  updateUser,
  getSupervisores,
  getAsesorCarteras,
  compareUserPersonal,
} = require("../controllers/users.controller.js");

const { protectSession } = require("../middlewares/auth.middleware");
const { enforceAccessSchedule } = require("../middlewares/accessSchedule.middleware");

const usersRouter = express.Router();

usersRouter.post("/login", login);

// Login valida su propio horario luego de identificar al usuario; lo demás exige token.
usersRouter.use(protectSession, enforceAccessSchedule);
usersRouter.get("/", getAllUsers);
usersRouter.post("/", createUser);
usersRouter.get("/supervisores", getSupervisores);
usersRouter.get("/carteras", getAsesorCarteras);
usersRouter.patch("/:username", updateUser);
usersRouter.get("/getUser", compareUserPersonal);

usersRouter.get("/check-token", checkToken);

module.exports = { usersRouter };
