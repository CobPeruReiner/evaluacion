const { QueryTypes } = require("sequelize");
const { db } = require("../../utils/database.util");

const validarPesoMultiple = (tabla) => {
  return async (req, res, next) => {
    console.log(`============= VALIDANDO PESO TOTAL DE ${tabla} =============`);
    console.log("Validando:", req.body);

    try {
      // ===================== CONFIG =====================
      let campoPeso;

      if (tabla === "ITEM") {
        campoPeso = "pesoItem";
      } else if (tabla === "CRITERIO") {
        campoPeso = "pesoCriterio";
      } else if (tabla === "ACCION_CRITERIO") {
        campoPeso = "pesoAccion";
      } else {
        return res.status(400).json({
          ok: false,
          msg: "Tabla no soportada",
        });
      }

      const pesoNuevo = parseFloat(req.body[campoPeso]);

      if (isNaN(pesoNuevo) || pesoNuevo <= 0) {
        return res.status(400).json({
          ok: false,
          msg: "El peso debe ser un número mayor a 0",
        });
      }

      // ==================================================
      // ===================== ITEM ======================
      // ==================================================
      if (tabla === "ITEM") {
        const { idCarteras } = req.body;

        if (!Array.isArray(idCarteras) || idCarteras.length === 0) {
          return res.status(400).json({
            ok: false,
            msg: "Debe seleccionar al menos una cartera",
          });
        }

        for (const idCartera of idCarteras) {
          const [resultado] = await db.query(
            `
            SELECT COALESCE(SUM(PESO_ITEM), 0) AS sumaActual
            FROM calidad.ITEM
            WHERE ID_CARTERA = :idCartera
              AND ID_ESTADO = 1
            `,
            {
              replacements: { idCartera },
              type: QueryTypes.SELECT,
            },
          );

          const sumaTotal =
            Math.round(
              (parseFloat(resultado.sumaActual || 0) + pesoNuevo) * 100,
            ) / 100;

          console.log(
            `📊 Cartera ${idCartera} → suma con nuevo peso:`,
            sumaTotal,
          );

          if (sumaTotal > 1) {
            return res.status(400).json({
              ok: false,
              msg: `La suma de pesos en la cartera ${idCartera} excede el 100%`,
            });
          }
        }

        return next();
      }

      // ==================================================
      // =================== CRITERIO =====================
      // ==================================================
      if (tabla === "CRITERIO") {
        const { idItem, idCriterio } = req.body;

        if (!idItem) {
          return res.status(400).json({
            ok: false,
            msg: "Falta el idItem para validar el criterio",
          });
        }

        const [resultado] = await db.query(
          `
          SELECT
            COALESCE(SUM(C.PESO), 0) AS sumaTotal,
            (
              SELECT I.PESO_ITEM
              FROM calidad.ITEM I
              WHERE I.ID_ITEM = :idItem
            ) AS pesoItem,
            (
              SELECT C2.PESO
              FROM calidad.CRITERIO C2
              WHERE C2.ID_CRITERIO = :idCriterio
            ) AS pesoAnterior
          FROM calidad.CRITERIO C
          WHERE C.ID_ITEM = :idItem
          `,
          {
            replacements: { idItem, idCriterio },
            type: QueryTypes.SELECT,
          },
        );

        const pesoAnterior = parseFloat(resultado.pesoAnterior || 0);
        const pesoMaximoPermitido = parseFloat(resultado.pesoItem || 0);
        const sumaExistente = parseFloat(resultado.sumaTotal || 0);

        const sumaRecalculada =
          Math.round((sumaExistente - pesoAnterior + pesoNuevo) * 100) / 100;

        if (sumaRecalculada > pesoMaximoPermitido) {
          return res.status(400).json({
            ok: false,
            msg: `La suma de pesos de los criterios (${sumaRecalculada}) excede el peso del ítem (${pesoMaximoPermitido})`,
          });
        }

        return next();
      }

      // ==================================================
      // ================ ACCION_CRITERIO =================
      // ==================================================
      if (tabla === "ACCION_CRITERIO") {
        const { idCriterio, idAccion } = req.body;

        if (!idCriterio) {
          return res.status(400).json({
            ok: false,
            msg: "Falta el idCriterio para validar la acción",
          });
        }

        const [resultado] = await db.query(
          `
          SELECT
            COALESCE(SUM(A.PESO), 0) AS sumaTotal,
            (
              SELECT C.PESO
              FROM calidad.CRITERIO C
              WHERE C.ID_CRITERIO = :idCriterio
            ) AS pesoCriterio,
            (
              SELECT A2.PESO
              FROM calidad.ACCION_CRITERIO A2
              WHERE A2.ID_ACCION = :idAccion
            ) AS pesoAnterior
          FROM calidad.ACCION_CRITERIO A
          WHERE A.ID_CRITERIO = :idCriterio
          `,
          {
            replacements: { idCriterio, idAccion },
            type: QueryTypes.SELECT,
          },
        );

        const pesoAnterior = parseFloat(resultado.pesoAnterior || 0);
        const pesoMaximoPermitido = parseFloat(resultado.pesoCriterio || 0);
        const sumaExistente = parseFloat(resultado.sumaTotal || 0);

        const sumaRecalculada =
          Math.round((sumaExistente - pesoAnterior + pesoNuevo) * 1000) / 1000;

        if (sumaRecalculada > pesoMaximoPermitido) {
          return res.status(400).json({
            ok: false,
            msg: `La suma de pesos de las acciones (${sumaRecalculada}) excede el peso del criterio (${pesoMaximoPermitido})`,
          });
        }

        return next();
      }
    } catch (error) {
      console.error("❌ Error en validación de peso:", error);
      return res.status(500).json({
        ok: false,
        msg: "Error interno al validar el peso total",
      });
    }
  };
};

module.exports = { validarPesoMultiple };
