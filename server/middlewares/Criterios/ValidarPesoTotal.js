const { QueryTypes } = require("sequelize");
const { db } = require("../../utils/database.util");

const validarPesoTotal = (tabla) => {
  return async (req, res, next) => {
    console.log(`============= VALIDANDO PESO TOTAL DE ${tabla} =============`);
    console.log("Validando: ", req.body);

    try {
      let campoPadre, campoPeso, campoID, campoOriginal;
      let campoPadreDB, campoPesoDB, campoIDDB;

      // Configuración según la tabla
      if (tabla === "ITEM") {
        campoPadre = "idCartera";
        campoPeso = "pesoItem";
        campoID = "idItem";
        campoOriginal = "idCarteraOriginal";
        campoPadreDB = "ID_CARTERA";
        campoPesoDB = "PESO_ITEM";
        campoIDDB = "ID_ITEM";
      } else if (tabla === "CRITERIO") {
        campoPadre = "idItem";
        campoPeso = "pesoCriterio";
        campoID = "idCriterio";
        campoOriginal = "idItemOriginal";
        campoPadreDB = "ID_ITEM";
        campoPesoDB = "PESO_CRITERIO";
        campoIDDB = "ID_CRITERIO";
      } else if (tabla === "ACCION_CRITERIO") {
        campoPadre = "idCriterio";
        campoPeso = "pesoAccionCriterio";
        campoID = "idAccionCriterio";
        campoOriginal = "idCriterioOriginal";
        campoPadreDB = "ID_CRITERIO";
        campoPesoDB = "PESO_ACCION_CRITERIO";
        campoIDDB = "ID_ACCION_CRITERIO";
      } else {
        return res.status(400).json({ ok: false, msg: "Tabla no soportada" });
      }

      const pesoNuevo = parseFloat(req.body[campoPeso]);
      const idPadre = req.body[campoPadre];
      const idPadreOriginal = req.body[campoOriginal];
      const idElemento = req.body[campoID];

      if (!idPadre || isNaN(pesoNuevo)) {
        return res.status(400).json({
          ok: false,
          msg: "Datos incompletos para validar el peso.",
        });
      }

      const cambiarDePadre = !idPadreOriginal || idPadre != idPadreOriginal;

      let query = `
        SELECT COALESCE(SUM(${campoPesoDB}), 0) AS sumaActual
        FROM calidad.${tabla}
        WHERE ${campoPadreDB} = :idPadre
        ${
          !cambiarDePadre && idElemento ? `AND ${campoIDDB} != :idElemento` : ""
        };
      `;

      const replacements = { idPadre };
      if (!cambiarDePadre && idElemento) {
        replacements.idElemento = idElemento;
      }

      const [resultado] = await db.query(query, {
        replacements,
        type: QueryTypes.SELECT,
      });

      const sumaTotal = parseFloat(resultado.sumaActual) + pesoNuevo;

      if (sumaTotal > 1) {
        return res.status(400).json({
          ok: false,
          msg: `La suma de pesos en ${campoPadreDB} excede el 100%`,
        });
      }

      next();
    } catch (error) {
      console.error("❌ Error en validación de peso:", error);
      return res.status(500).json({
        ok: false,
        msg: "Error interno al validar el peso total",
      });
    }
  };
};

module.exports = { validarPesoTotal };
