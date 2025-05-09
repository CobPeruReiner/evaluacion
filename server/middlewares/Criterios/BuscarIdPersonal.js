const { QueryTypes } = require("sequelize");
const { db } = require("../../utils/database.util");

const buscarIdPersonal = async (req, res, next) => {
  try {
    const dni = req.body.idUsuarioActualizacion;

    const personal = await db.query(
      `
      SELECT IDPERSONAL
      FROM calidad.PERSONAL
      WHERE DOC = :dni;
      `,
      {
        replacements: { dni },
        type: QueryTypes.SELECT,
      }
    );

    if (!personal.length) {
      return res.status(404).json({
        ok: false,
        msg: "Usuario no encontrado",
      });
    }

    req.body.idUsuarioActualizacion = personal[0].IDPERSONAL;
    next();
  } catch (error) {
    console.error("Error al buscar IDPERSONAL:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error al validar usuario",
    });
  }
};

module.exports = { buscarIdPersonal };
