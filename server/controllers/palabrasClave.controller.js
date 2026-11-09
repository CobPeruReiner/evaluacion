const fs = require("fs");
const path = require("path");
const { QueryTypes } = require("sequelize");
const { db } = require("../utils/database.util");

// Palabras clave que el speech analytics marca en cada transcripción.
// No se crean tablas: viven en un archivo JSON dentro del volumen persistente que ya
// comparten el server y el worker (`speech-jobs` → /data/jobs). Al encolar un lote,
// se envían al worker las activas de la cartera (ver enqueueSpeechJob).
// ID_CARTERA = 0 → aplica a todas las carteras. TERMINO acepta comodín final ("yape*").

const ARCHIVO =
  process.env.PALABRAS_CLAVE_FILE ||
  path.join(process.env.SPEECH_JOBS_DIR || "/data/jobs", "_config", "palabras_clave.json");

const SEMILLA = [
  ["MEDIO DE PAGO", "yape*"], ["MEDIO DE PAGO", "plin*"], ["MEDIO DE PAGO", "transfer*"],
  ["MEDIO DE PAGO", "transfi*"], ["MEDIO DE PAGO", "deposit*"], ["MEDIO DE PAGO", "agencia"],
  ["COMPROMISO", "me comprometo"], ["COMPROMISO", "voy a pagar"], ["COMPROMISO", "le pago"],
  ["COMPROMISO", "pagaré"], ["DESCUENTO", "descuento*"], ["DESCUENTO", "campaña"],
  ["DESCUENTO", "refinanci*"], ["RIESGO", "indecopi"], ["RIESGO", "denuncia*"],
  ["RIESGO", "abogado*"], ["RIESGO", "sbs"], ["RIESGO", "infocorp"],
].map(([CATEGORIA, TERMINO], i) => ({ ID_PALABRA: i + 1, ID_CARTERA: 0, CATEGORIA, TERMINO, ID_ESTADO: 1 }));

const normalizarTermino = (v) => String(v || "").trim().toLowerCase().replace(/\s+/g, " ").slice(0, 120);
const normalizarCategoria = (v) => String(v || "").trim().toUpperCase().replace(/\s+/g, " ").slice(0, 60);

async function leer() {
  try {
    const data = JSON.parse(await fs.promises.readFile(ARCHIVO, "utf8"));
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (error.code === "ENOENT") return SEMILLA.map((p) => ({ ...p }));
    throw error;
  }
}

// Escrituras serializadas y atómicas (archivo temporal + rename) para no corromper el JSON.
let cola = Promise.resolve();
function modificar(fn) {
  const tarea = cola.then(async () => {
    const lista = await leer();
    const resultado = fn(lista);
    await fs.promises.mkdir(path.dirname(ARCHIVO), { recursive: true });
    const tmp = `${ARCHIVO}.${process.pid}.tmp`;
    await fs.promises.writeFile(tmp, JSON.stringify(lista, null, 2), "utf8");
    await fs.promises.rename(tmp, ARCHIVO);
    return resultado;
  });
  cola = tarea.catch(() => {});
  return tarea;
}

const duplicada = (lista, p, exceptoId) => lista.some((e) => e.ID_PALABRA !== exceptoId &&
  e.ID_CARTERA === p.ID_CARTERA && e.CATEGORIA === p.CATEGORIA && e.TERMINO === p.TERMINO);

/** Términos activos de la cartera más los globales, en el formato que espera el worker. */
async function terminosActivos(idCartera) {
  const id = Number(idCartera) || 0;
  return (await leer())
    .filter((p) => p.ID_ESTADO && (p.ID_CARTERA === 0 || p.ID_CARTERA === id))
    .map((p) => ({ categoria: p.CATEGORIA, termino: p.TERMINO }));
}

const getAllPalabrasClave = async (_req, res) => {
  try {
    const palabras = await leer();
    const ids = [...new Set(palabras.map((p) => p.ID_CARTERA).filter(Boolean))];
    let nombres = {};
    if (ids.length) {
      const filas = await db.query("SELECT id, cartera FROM SISTEMAGEST.cartera WHERE id IN (:ids)",
        { replacements: { ids }, type: QueryTypes.SELECT });
      nombres = Object.fromEntries(filas.map((f) => [f.id, f.cartera]));
    }
    res.json({
      ok: true,
      palabras: palabras.map((p) => ({
        ...p,
        NOMBRE_CARTERA: p.ID_CARTERA ? nombres[p.ID_CARTERA] || `Cartera ${p.ID_CARTERA}` : "Todas las carteras",
      })),
    });
  } catch (error) {
    console.error("Error al obtener palabras clave:", error);
    res.status(500).json({ ok: false, msg: "No se pudieron cargar las palabras clave." });
  }
};

const createPalabraClave = async (req, res) => {
  const nueva = {
    ID_CARTERA: Number(req.body.idCartera) || 0,
    CATEGORIA: normalizarCategoria(req.body.categoria),
    TERMINO: normalizarTermino(req.body.termino),
    ID_ESTADO: 1,
  };
  if (!nueva.CATEGORIA || !nueva.TERMINO.replace(/\*/g, "").trim())
    return res.status(400).json({ ok: false, msg: "Categoría y término son obligatorios." });
  try {
    await modificar((lista) => {
      const existente = lista.find((e) => duplicada([e], nueva, null));
      if (existente) { existente.ID_ESTADO = 1; return; }
      nueva.ID_PALABRA = lista.reduce((max, e) => Math.max(max, e.ID_PALABRA || 0), 0) + 1;
      lista.push(nueva);
    });
    res.status(201).json({ ok: true, msg: "Palabra clave guardada." });
  } catch (error) {
    console.error("Error al crear palabra clave:", error);
    res.status(500).json({ ok: false, msg: "No se pudo guardar la palabra clave." });
  }
};

const updatePalabraClave = async (req, res) => {
  const idPalabra = Number(req.body.idPalabra);
  const cambios = {
    ID_CARTERA: Number(req.body.idCartera) || 0,
    CATEGORIA: normalizarCategoria(req.body.categoria),
    TERMINO: normalizarTermino(req.body.termino),
    ID_ESTADO: req.body.idEstado ? 1 : 0,
  };
  if (!idPalabra || !cambios.CATEGORIA || !cambios.TERMINO.replace(/\*/g, "").trim())
    return res.status(400).json({ ok: false, msg: "Categoría y término son obligatorios." });
  try {
    const estado = await modificar((lista) => {
      const entrada = lista.find((e) => e.ID_PALABRA === idPalabra);
      if (!entrada) return "no_existe";
      if (duplicada(lista, cambios, idPalabra)) return "duplicada";
      Object.assign(entrada, cambios);
      return "ok";
    });
    if (estado === "no_existe") return res.status(404).json({ ok: false, msg: "La palabra clave no existe." });
    if (estado === "duplicada")
      return res.status(409).json({ ok: false, msg: "Ya existe ese término en la categoría y cartera elegidas." });
    res.json({ ok: true, msg: "Palabra clave actualizada." });
  } catch (error) {
    console.error("Error al actualizar palabra clave:", error);
    res.status(500).json({ ok: false, msg: "No se pudo actualizar la palabra clave." });
  }
};

module.exports = { getAllPalabrasClave, createPalabraClave, updatePalabraClave, terminosActivos };
