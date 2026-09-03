const { QueryTypes } = require("sequelize");
const { db } = require("../../utils/database.util");

/**
 * Determina si la operación es una desactivación
 * (según cómo trabajan tus endpoints)
 */
const esDesactivacion = (tabla, body) => {
  if (tabla === "ITEM" || tabla === "CRITERIO") {
    return body.idEstado === 0;
  }

  if (tabla === "ACCION_CRITERIO") {
    return body.idEstado === 0;
  }

  return false;
};

const validarPesoTotal = (tabla) => {
  return async (req, res, next) => {
    console.log(`============= VALIDANDO PESO TOTAL DE ${tabla} =============`);
    console.log("Validando: ", req.body);

    try {
      // 🚪 1. Salida temprana si es desactivación
      if (esDesactivacion(tabla, req.body)) {
        console.log("⏭️ Desactivación detectada, se omite validación de peso");
        return next();
      }

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
        campoPesoDB = "PESO";
        campoIDDB = "ID_CRITERIO";
      } else if (tabla === "ACCION_CRITERIO") {
        campoPadre = "idCriterio";
        campoPeso = "pesoAccion";
        campoID = "idAccion";
        campoOriginal = "idCriterioOriginal";
        campoPadreDB = "ID_CRITERIO";
        campoPesoDB = "PESO";
        campoIDDB = "ID_ACCION";
      } else {
        return res.status(400).json({ ok: false, msg: "Tabla no soportada" });
      }

      const pesoNuevo =
        req.body[campoPeso] !== undefined
          ? parseFloat(req.body[campoPeso])
          : null;

      const idPadre = req.body[campoPadre];
      const idPadreOriginal = req.body[campoOriginal];
      const idElemento = req.body[campoID];

      console.log(
        "📊 Datos clave -> pesoNuevo:",
        pesoNuevo,
        "| idPadre:",
        idPadre,
        "| idElemento:",
        idElemento,
      );

      // 🚨 Validar SOLO cuando hay peso
      if (pesoNuevo === null || isNaN(pesoNuevo) || !idPadre) {
        console.log(
          "⏭️ No hay datos suficientes para validar peso (flujo CREATE parcial o UPDATE sin peso)",
        );
        return next();
      }

      const cambiarDePadre = idPadreOriginal && idPadre != idPadreOriginal;

      // ================= CRITERIO =================
      if (tabla === "CRITERIO") {
        const query = `
          SELECT
            COALESCE(SUM(C.PESO), 0) AS sumaTotal,
            (
              SELECT I.PESO_ITEM
              FROM CALIDAD.ITEM I
              WHERE I.ID_ITEM = :idPadre
                AND I.ID_ESTADO = 1
            ) AS pesoItem,
            (
              SELECT C2.PESO
              FROM CALIDAD.CRITERIO C2
              WHERE C2.ID_CRITERIO = :idElemento
                AND C2.ID_ESTADO = 1
            ) AS pesoAnterior
          FROM CALIDAD.CRITERIO C
          WHERE C.ID_ITEM = :idPadre
            AND C.ID_ESTADO = 1
        `;

        console.log("🧾 Query CRITERIO:", query);

        const [resultado] = await db.query(query, {
          replacements: { idPadre, idElemento },
          type: QueryTypes.SELECT,
        });

        console.log("📥 Resultado CRITERIO:", resultado);

        const pesoAnterior = parseFloat(resultado.pesoAnterior || 0);
        const pesoMaximoPermitido = parseFloat(resultado.pesoItem || 0);
        const sumaExistente = parseFloat(resultado.sumaTotal || 0);

        const sumaRecalculada =
          Math.round((sumaExistente - pesoAnterior + pesoNuevo) * 100) / 100;

        console.log("📐 Suma recalculada CRITERIO:", sumaRecalculada);

        if (sumaRecalculada > pesoMaximoPermitido) {
          return res.status(400).json({
            ok: false,
            msg: `La suma de pesos de los criterios (${sumaRecalculada}) excede el peso del ítem (${pesoMaximoPermitido})`,
          });
        }

        return next();
      }

      // ================= ACCION_CRITERIO =================
      if (tabla === "ACCION_CRITERIO") {
        const query = `
          SELECT
            COALESCE(SUM(A.PESO), 0) AS sumaTotal,
            (
              SELECT C.PESO
              FROM CALIDAD.CRITERIO C
              WHERE C.ID_CRITERIO = :idPadre
                AND C.ID_ESTADO = 1
            ) AS pesoCriterio,
            (
              SELECT A2.PESO
              FROM CALIDAD.ACCION_CRITERIO A2
              WHERE A2.ID_ACCION = :idElemento
                AND A2.ESTADO_ACCION = 1
            ) AS pesoAnterior
          FROM CALIDAD.ACCION_CRITERIO A
          WHERE A.ID_CRITERIO = :idPadre
            AND A.ESTADO_ACCION = 1
        `;

        console.log("🧾 Query ACCION_CRITERIO:", query);

        const [resultado] = await db.query(query, {
          replacements: { idPadre, idElemento },
          type: QueryTypes.SELECT,
        });

        console.log("📥 Resultado ACCION_CRITERIO:", resultado);

        const pesoAnterior = parseFloat(resultado.pesoAnterior || 0);
        const pesoMaximoPermitido = parseFloat(resultado.pesoCriterio || 0);
        const sumaExistente = parseFloat(resultado.sumaTotal || 0);

        const sumaRecalculada =
          Math.round((sumaExistente - pesoAnterior + pesoNuevo) * 1000) / 1000;

        console.log("📐 Suma recalculada ACCION:", sumaRecalculada);

        if (sumaRecalculada > pesoMaximoPermitido) {
          return res.status(400).json({
            ok: false,
            msg: `La suma de pesos de las acciones (${sumaRecalculada}) excede el peso del criterio (${pesoMaximoPermitido})`,
          });
        }

        return next();
      }

      // ================= ITEM =================
      let query = `
        SELECT COALESCE(SUM(${campoPesoDB}), 0) AS sumaActual
        FROM CALIDAD.${tabla}
        WHERE ${campoPadreDB} = :idPadre
          AND ID_ESTADO = 1
      `;

      const replacements = { idPadre };

      if (!cambiarDePadre && idElemento) {
        query += ` AND ${campoIDDB} != :idElemento`;
        replacements.idElemento = idElemento;
      }

      console.log("🧾 Query ITEM:", query);
      console.log("🔧 Replacements:", replacements);

      const [resultado] = await db.query(query, {
        replacements,
        type: QueryTypes.SELECT,
      });

      console.log("📥 Resultado ITEM:", resultado);

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
