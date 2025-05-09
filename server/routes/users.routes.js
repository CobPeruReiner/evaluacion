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

const usersRouter = express.Router();

usersRouter.get("/", getAllUsers);
usersRouter.post("/", createUser);
usersRouter.post("/login", login);
usersRouter.get("/supervisores", getSupervisores);
usersRouter.get("/carteras", getAsesorCarteras);
usersRouter.patch("/:username", updateUser);
usersRouter.get("/getUser", compareUserPersonal);

usersRouter.use(protectSession);
usersRouter.get("/check-token", checkToken);

module.exports = { usersRouter };
