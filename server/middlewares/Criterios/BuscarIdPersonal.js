const { QueryTypes } = require("sequelize");
const { dbWeb } = require("../../utils/database.util");

const buscarIdPersonal = async (req, res, next) => {
  console.log("Bienvenido al middleware buscarIdPersonal.");

  try {
    console.log("Buscando personal por:", req.body.idUsuarioActualizacion);

    const dni = req.body.idUsuarioActualizacion;

    const personal = await dbWeb.query(
      `
      SELECT IDPERSONAL
      FROM personal
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

    return next();
  } catch (error) {
    console.error("Error al buscar IDPERSONAL:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error al validar usuario",
    });
  }
};

module.exports = { buscarIdPersonal };
