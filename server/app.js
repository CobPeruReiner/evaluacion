const express = require("express");
var cors = require("cors");
const path = require("path");

require("dotenv").config({ path: "./config.env" });

const { usersRouter } = require("./routes/users.routes");
const { fichasRouter } = require("./routes/fichas.routes");
const { baseRouter } = require("./routes/base.routes");
const { carterasRouter } = require("./routes/carteras.routes");
const { viewsRouter } = require("./routes/views.routes");
const { gestionesCycWebRouter } = require("./routes/gestionesCycWeb.routes");
const { criteriosEvaluacionRouter } = require("./routes/criterios.routes");
const { evaluacionesRouter } = require("./routes/evaluaciones.routes");

const app = express();

app.use(cors());
console.log(__dirname);

const esProduccion = process.env.NODE_ENV === "production";

const rutaAudios = esProduccion
  ? "/app/server/audios"
  : path.join(__dirname, "./audios");

// app.use("/audios", express.static(path.join(__dirname, "./audios")));
// app.use("/audios", express.static("/app/server/audios"));

app.use("/audios", express.static(rutaAudios));

app.use(express.static(path.join(__dirname, "public")));

app.use(express.json({ limit: "5mb", extended: true }));
app.use(
  express.urlencoded({ limit: "5mb", extended: true, parameterLimit: 10000 })
);

process.on("uncaughtException", function (err) {
  console.log(err);
});

app.use("/api/v1/users", usersRouter);
app.use("/api/v1/fichas", fichasRouter);
app.use("/api/v1/base", baseRouter);
app.use("/api/v1/carteras", carterasRouter);
app.use("/api/v1/gestionsCycWeb", gestionesCycWebRouter);
app.use("/api/v1/criteriosEvaluacion", criteriosEvaluacionRouter);
app.use("/api/v1/evaluaciones", evaluacionesRouter);
app.use("/*", viewsRouter);

module.exports = { app };
