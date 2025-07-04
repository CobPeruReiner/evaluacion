const { QueryTypes } = require("sequelize");
const { db } = require("../../utils/database.util");

const validarPesoTotal = (tabla) => {
  return async (req, res, next) => {
    console.log(`============= VALIDANDO PESO TOTAL DE ${tabla} =============`);
    console.log("Validando: ", req.body);

    try {
      let campoPadre, campoPeso, campoID, campoOriginal;
      let campoPadreDB, campoPesoDB, campoIDDB;

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
        campoPeso = "pesoAccion";
        campoID = "idAccion";
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

      console.log(
        "📊 Datos clave -> pesoNuevo:",
        pesoNuevo,
        "| idPadre:",
        idPadre,
        "| idElemento:",
        idElemento
      );

      if (!idPadre || isNaN(pesoNuevo)) {
        return res.status(400).json({
          ok: false,
          msg: "Datos incompletos para validar el peso.",
        });
      }

      const cambiarDePadre = !idPadreOriginal || idPadre != idPadreOriginal;

      // === CRITERIO: Validar contra peso del ITEM ===
      if (tabla === "CRITERIO") {
        const query = `
          SELECT
            COALESCE(SUM(C.PESO_CRITERIO), 0) AS sumaTotal,
            (
              SELECT I.PESO_ITEM
              FROM calidad.ITEM I
              WHERE I.ID_ITEM = :idPadre
            ) AS pesoItem,
            (
              SELECT C2.PESO_CRITERIO
              FROM calidad.CRITERIO C2
              WHERE C2.ID_CRITERIO = :idElemento
            ) AS pesoAnterior
          FROM calidad.CRITERIO C
          WHERE C.ID_ITEM = :idPadre
        `;

        const [resultado] = await db.query(query, {
          replacements: { idPadre, idElemento },
          type: QueryTypes.SELECT,
        });

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

      // === ACCION_CRITERIO: Validar contra peso del CRITERIO ===
      if (tabla === "ACCION_CRITERIO") {
        const query = `
        SELECT
          COALESCE(SUM(A.PESO_ACCION_CRITERIO), 0) AS sumaTotal,
          (
            SELECT C.PESO_CRITERIO
            FROM calidad.CRITERIO C
            WHERE C.ID_CRITERIO = :idPadre
          ) AS pesoCriterio,
          (
            SELECT A2.PESO_ACCION_CRITERIO
            FROM calidad.ACCION_CRITERIO A2
            WHERE A2.ID_ACCION_CRITERIO = :idElemento
          ) AS pesoAnterior
           FROM calidad.ACCION_CRITERIO A
           WHERE A.ID_CRITERIO = :idPadre
        `;

        const [resultado] = await db.query(query, {
          replacements: { idPadre, idElemento },
          type: QueryTypes.SELECT,
        });

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

      // === ITEM: Comparar contra 1.00 directamente ===
      let query = `
        SELECT COALESCE(SUM(${campoPesoDB}), 0) AS sumaActual
        FROM calidad.${tabla}
        WHERE ${campoPadreDB} = :idPadre
      `;

      const replacements = { idPadre };
      if (!cambiarDePadre && idElemento) {
        query += ` AND ${campoIDDB} != :idElemento`;
        replacements.idElemento = idElemento;
      }

      // console.log("🧾 Query final:", query);
      console.log("🔧 Replacements:", replacements);

      const [resultado] = await db.query(query, {
        replacements,
        type: QueryTypes.SELECT,
      });

      const sumaTotal =
        Math.round((parseFloat(resultado.sumaActual || 0) + pesoNuevo) * 100) /
        100;

      console.log("📈 Suma total con nuevo peso:", sumaTotal);

      if (sumaTotal > 1) {
        return res.status(400).json({
          ok: false,
          msg: `La suma de pesos en ${campoPadreDB} excede el 100%`,
        });
      }

      return next();
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
