const { QueryTypes } = require("sequelize");
const { db } = require("../../utils/database.util");
const { validarPesoTotal } = require("./ValidarPesoTotal");

const validarPesoMultiple = (tabla) => async (req, res, next) => {
  if (tabla !== "ITEM") return validarPesoTotal(tabla)(req, res, next);
  try {
    const peso = Number(req.body.pesoItem);
    const carteras = req.body.idCarteras;
    if (!Number.isFinite(peso) || peso <= 0 || !Array.isArray(carteras) || !carteras.length)
      return res.status(400).json({ ok: false, msg: "Debe indicar un peso válido y al menos una cartera." });
    for (const idCartera of carteras) {
      const [modelo] = await db.query("SELECT ID_MODELO FROM CALIDAD.MODELO_EVALUACION WHERE ID_CARTERA=:idCartera AND ESTADO=1 LIMIT 1", { replacements: { idCartera }, type: QueryTypes.SELECT });
      if (!modelo) return res.status(400).json({ ok: false, msg: "Cada cartera debe tener una plantilla activa." });
      const [suma] = await db.query("SELECT COALESCE(SUM(PESO),0) AS total FROM CALIDAD.ITEM WHERE ID_MODELO=:idModelo AND ESTADO=1", { replacements: { idModelo: modelo.ID_MODELO }, type: QueryTypes.SELECT });
      if (Number(suma.total) + peso > 1.00001) return res.status(400).json({ ok: false, msg: "La suma de pesos de ítems excede el 100% de la plantilla." });
    }
    return next();
  } catch (error) { return res.status(400).json({ ok: false, msg: error.message || "No fue posible validar los pesos." }); }
};
module.exports = { validarPesoMultiple };
