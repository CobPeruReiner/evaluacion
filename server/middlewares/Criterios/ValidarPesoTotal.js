const { QueryTypes } = require("sequelize");
const { db } = require("../../utils/database.util");

const activo = (value) => Number(value) !== 0;

async function modeloPorCartera(idCartera) {
  const rows = await db.query(
    `SELECT ID_MODELO FROM CALIDAD.MODELO_EVALUACION
     WHERE ID_CARTERA=:idCartera AND ESTADO=1 LIMIT 1`,
    { replacements: { idCartera }, type: QueryTypes.SELECT },
  );
  if (!rows.length) throw new Error("La cartera no tiene una plantilla activa.");
  return rows[0].ID_MODELO;
}

const validarPesoTotal = (tabla) => async (req, res, next) => {
  try {
    if (!activo(req.body.idEstado)) return next();
    const configuracion = {
      ITEM: { peso: "pesoItem", id: "idItem", padre: "idCartera", tabla: "ITEM", columna: "ID_MODELO", pk: "ID_ITEM" },
      CRITERIO: { peso: "pesoCriterio", id: "idCriterio", padre: "idItem", tabla: "CRITERIO", columna: "ID_ITEM", pk: "ID_CRITERIO" },
      ACCION_CRITERIO: { peso: "pesoAccion", id: "idAccion", padre: "idCriterio", tabla: "ACCION_CRITERIO", columna: "ID_CRITERIO", pk: "ID_ACCION" },
    }[tabla];
    if (!configuracion) return res.status(400).json({ ok: false, msg: "Tabla no soportada" });

    const peso = Number(req.body[configuracion.peso]);
    if (!Number.isFinite(peso) || peso <= 0)
      return res.status(400).json({ ok: false, msg: "El peso debe ser mayor a cero." });
    let padre = req.body[configuracion.padre];
    if (!padre) return next();
    if (tabla === "ITEM") padre = await modeloPorCartera(padre);

    const replacements = { padre, id: req.body[configuracion.id] || 0 };
    const [sumatoria] = await db.query(
      `SELECT COALESCE(SUM(PESO), 0) AS total FROM CALIDAD.${configuracion.tabla}
       WHERE ${configuracion.columna}=:padre AND ESTADO=1 AND ${configuracion.pk}<>:id`,
      { replacements, type: QueryTypes.SELECT },
    );
    let limite = 1;
    if (tabla === "CRITERIO") {
      const [item] = await db.query("SELECT PESO FROM CALIDAD.ITEM WHERE ID_ITEM=:padre AND ESTADO=1", { replacements: { padre }, type: QueryTypes.SELECT });
      limite = Number(item?.PESO || 0);
    }
    if (tabla === "ACCION_CRITERIO") {
      const [criterio] = await db.query("SELECT PESO FROM CALIDAD.CRITERIO WHERE ID_CRITERIO=:padre AND ESTADO=1", { replacements: { padre }, type: QueryTypes.SELECT });
      limite = Number(criterio?.PESO || 0);
    }
    if (Number(sumatoria.total) + peso > limite + 0.00001)
      return res.status(400).json({ ok: false, msg: "La suma de pesos excede el peso permitido por el elemento padre." });
    return next();
  } catch (error) {
    return res.status(400).json({ ok: false, msg: error.message || "No fue posible validar los pesos." });
  }
};

module.exports = { validarPesoTotal };
