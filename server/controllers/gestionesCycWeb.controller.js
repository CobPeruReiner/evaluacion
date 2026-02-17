const { QueryTypes } = require("sequelize");
const { dbWeb, db } = require("../utils/database.util");
const moment = require("moment");

const getAllCycGestions = async (req, res) => {
  const filterDate1 = req.query.filterDate1;
  const filterDate2 = req.query.filterDate2;
  const cliente = req.query.cliente;
  const cartera = req.query.cartera;

  const cycGestions = await dbWeb.query(
    `
        SELECT a.id ID, fecha_tmk FECHA,x.nombre as CLIENTE,d.cartera AS CARTERA,a.IDENTIFICADOR,j.ACCION ACCION,
        e.EFECTO as EFECTO,f.MOTIVO as MOTIVO,a.OBSERVACION as OBSERVACION,i.NUMERO as TELEFONO,
        concat(b.APELLIDOS,', ',b.NOMBRES) as GESTOR, b.DOC as GESTOR_DNI, b.IDPERSONAL, a.ESTADO_REVISION as ESTADO
                FROM gestion_tmk a 
                    LEFT JOIN personal b on a.IDPERSONAL=b.IDPERSONAL 
--                    left join tabla_log c on c.id=a.id_table
                    left join cartera d on d.id=c.id_cartera
                    left join cliente x on x.id=d.idcliente
                    left join efecto e on e.IDEFECTO=a.IDEFECTO 
                    left join motivo f on f.IDMOTIVO=a.IDMOTIVO 
--                    left join telefonos i on i.IDTELEFONO=a.IDTELEFONO
                    left join telefonos_actual i on i.IDTELEFONO=a.IDTELEFONO
                    left join accion j on j.IDACCION=e.IDACCION
                
                where x.nombre = :cliente
                     AND d.cartera = :cartera
                    AND b.TIPO_PERSONAL = 'HUMANO'
                    --    AND j.idcartera = :idCarteraSelected
                    --    AND j.TIPO <> 3
                        AND j.idestado= 1
                        and fecha_tmk  BETWEEN :filterDate1 and :filterDate2
                    AND (OBSERVACION IS NULL OR OBSERVACION NOT IN ('%Corta%', '%Corto%', '%Cuelga%', '%Colgo%', '%CRT%', '%CTR%'))
                    AND (a.ESTADO_REVISION IS NULL OR a.ESTADO_REVISION = 0)
        ;
        `,
    {
      replacements: {
        filterDate1: `${filterDate1} 00:00:00`,
        filterDate2: `${filterDate2} 23:59:59`,
        cliente,
        cartera,
      },
      type: QueryTypes.SELECT,
    },
  );

  res.status(200).json({
    status: "success",
    cycGestions,
  });
};

const getFilteredCycGestions = async (req, res) => {
  const { p_id_cartera, p_fecha_inicio, p_fecha_fin, p_idefectos } = req.query;

  console.log("Parametros enviados: ", req.query);

  if (!p_id_cartera || !p_fecha_inicio || !p_fecha_fin) {
    return res.status(400).json({
      status: "error",
      message: "Parámetros obligatorios incompletos",
    });
  }

  const fechaFinMasUno = moment(p_fecha_fin).add(1, "day").format("YYYY-MM-DD");

  try {
    const gestiones = await dbWeb.query(
      `CALL SP_REPORTE_GESTION_CALIDAD(
        :p_id_cartera,
        :p_fecha_inicio,
        :p_fecha_fin,
        :p_idefectos
      );`,
      {
        replacements: {
          p_id_cartera,
          p_fecha_inicio,
          p_fecha_fin: fechaFinMasUno,
          p_idefectos: p_idefectos && p_idefectos !== "" ? p_idefectos : null,
        },
        type: QueryTypes.RAW,
      },
    );

    res.status(200).json({
      status: "success",
      gestiones,
    });
  } catch (err) {
    console.error("Error en getFilteredCycGestions:", err);

    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

const getClientesAndCarteras = async (_req, res) => {
  const clientesYcarteras = await dbWeb.query(
    `
            SELECT ca.id AS 'id_cartera', ca.cartera, cli.id AS 'id_cliente', cli.nombre AS 'cliente' FROM cartera ca
            INNER JOIN cliente cli
            ON ca.idcliente = cli.id
            AND cli.estado = 1 AND ca.estado = 1;
        `,
    {
      type: QueryTypes.SELECT,
    },
  );

  res.status(200).json({
    status: "success",
    clientesYcarteras,
  });
};

const getEfectosByCartera = async (req, res) => {
  const cartera = req.query.cartera;

  const efectos = await dbWeb.query(
    `
      SELECT DISTINCT
        IDEFECTO,
        EFECTO
      FROM efecto
      WHERE IDACCION IN (
        SELECT IDACCION
        FROM accion
        WHERE TIPO = 1
          AND idcartera = :cartera
          AND IDESTADO = 1
      )
        AND IDCATEGORIA IN (5, 11)
        AND IDESTADO = 1
      ORDER BY ORDEN ASC, EFECTO ASC;
    `,
    {
      replacements: { cartera },
      type: QueryTypes.SELECT,
    },
  );

  res.status(200).json({
    status: "success",
    efectos,
  });
};

const getMotivoNoPagCartera = async (req, res) => {
  try {
    const { cartera } = req.query;

    if (!cartera) {
      return res.status(400).json({
        ok: false,
        message: "Debe enviar el parámetro cartera",
      });
    }

    if (isNaN(cartera)) {
      return res.status(400).json({
        ok: false,
        message: "El parámetro cartera debe ser numérico",
      });
    }

    const carteraDb = await dbWeb.query(
      `
        SELECT id
        FROM cartera
        WHERE id = ?
          AND estado = 1
        LIMIT 1
      `,
      {
        replacements: [cartera],
        type: QueryTypes.SELECT,
      },
    );

    if (!carteraDb.length) {
      return res.status(404).json({
        ok: false,
        message: "La cartera no existe o no está activa",
      });
    }

    const motivos = await db.query(
      `
        SELECT
          ID_MOTIVO_NO_PAGO,
          NOMBRE_MOTIVO_NO_PAGO
        FROM MOTIVO_NO_PAGO
        WHERE ID_CARTERA = ?
          AND ID_ESTADO = 1
        ORDER BY NOMBRE_MOTIVO_NO_PAGO ASC
      `,
      {
        replacements: [cartera],
        type: QueryTypes.SELECT,
      },
    );

    return res.status(200).json({
      ok: true,
      data: motivos,
    });
  } catch (error) {
    console.error("getMotivoNoPagCartera:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al obtener motivos de no pago",
    });
  }
};

const getTipoGestionCartera = async (req, res) => {
  try {
    const { cartera } = req.query;

    if (!cartera) {
      return res.status(400).json({
        ok: false,
        message: "Debe enviar el parámetro cartera",
      });
    }

    if (isNaN(cartera)) {
      return res.status(400).json({
        ok: false,
        message: "El parámetro cartera debe ser numérico",
      });
    }

    const carteraDb = await dbWeb.query(
      `
        SELECT id
        FROM cartera
        WHERE id = ?
          AND estado = 1
        LIMIT 1
      `,
      {
        replacements: [cartera],
        type: QueryTypes.SELECT,
      },
    );

    if (!carteraDb.length) {
      return res.status(404).json({
        ok: false,
        message: "La cartera no existe o no está activa",
      });
    }

    const tipos = await db.query(
      `
        SELECT
          ID_TIPO_GESTION,
          NOMBRE_TIPO_GESTION
        FROM TIPO_GESTION
        WHERE ID_CARTERA = ?
          AND ID_ESTADO = 1
        ORDER BY NOMBRE_TIPO_GESTION ASC
      `,
      {
        replacements: [cartera],
        type: QueryTypes.SELECT,
      },
    );

    return res.status(200).json({
      ok: true,
      data: tipos,
    });
  } catch (error) {
    console.error("getTipoGestionCartera:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al obtener tipos de gestión",
    });
  }
};

const getPersonalAsesor = async (_req, res) => {
  try {
    const personales = await dbWeb.query(
      `
        SELECT
          IDPERSONAL,
          DOC as DNI,
          concat(TRIM(APELLIDOS), ", ", TRIM(NOMBRES)) AS 'ASESOR'
        FROM personal
        WHERE cargo IN (11,12)
          AND TIPO_PERSONAL = 'HUMANO'
          AND IDESTADO = 1
        ORDER BY APELLIDOS;
      `,
    );

    res.status(200).json({
      ok: true,
      data: personales || [],
    });
  } catch (error) {
    console.error("getPersonalAsesor:", error);
    res.status(500).json({
      ok: false,
      message: "Error al obtener personal asesor",
    });
  }
};

const getResponsableNoFCR = async (_req, res) => {
  try {
    const responsables = await db.query(
      `
        SELECT
          ID_RESPONSABLE_NO_FCR,
          NOMBRE_RESPONSABLE_NO_FCR
        FROM RESPONSABLE_NO_FCR
        WHERE ID_ESTADO = 1
        ORDER BY NOMBRE_RESPONSABLE_NO_FCR ASC
      `,
      { type: QueryTypes.SELECT },
    );

    return res.status(200).json({
      ok: true,
      data: responsables,
    });
  } catch (error) {
    console.error("getResponsableNoFCR:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al obtener responsables No FCR",
    });
  }
};

const getMotivoNoFCR = async (req, res) => {
  try {
    const { responsable } = req.query;

    if (!responsable) {
      return res.status(400).json({
        ok: false,
        message: "Debe enviar el parámetro responsable",
      });
    }

    if (isNaN(responsable)) {
      return res.status(400).json({
        ok: false,
        message: "El parámetro responsable debe ser numérico",
      });
    }

    // validar responsable activo
    const existe = await db.query(
      `
        SELECT ID_RESPONSABLE_NO_FCR
        FROM RESPONSABLE_NO_FCR
        WHERE ID_RESPONSABLE_NO_FCR = ?
          AND ID_ESTADO = 1
        LIMIT 1
      `,
      {
        replacements: [responsable],
        type: QueryTypes.SELECT,
      },
    );

    if (!existe.length) {
      return res.status(404).json({
        ok: false,
        message: "Responsable No FCR no existe o no está activo",
      });
    }

    const motivos = await db.query(
      `
        SELECT
          ID_MOTIVO_NO_FCR,
          NOMBRE_MOTIVO_NO_FCR
        FROM MOTIVO_NO_FCR
        WHERE ID_RESPONSABLE_NO_FCR = ?
          AND ID_ESTADO = 1
        ORDER BY NOMBRE_MOTIVO_NO_FCR ASC
      `,
      {
        replacements: [responsable],
        type: QueryTypes.SELECT,
      },
    );

    return res.status(200).json({
      ok: true,
      data: motivos,
    });
  } catch (error) {
    console.error("getMotivoNoFCR:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al obtener motivos No FCR",
    });
  }
};

const getMotivoAlerta = async (_req, res) => {
  try {
    const motivos = await db.query(
      `
        SELECT
          ID_MOTIVO_ALERTA,
          NOMBRE_MOTIVO_ALERTA
        FROM MOTIVO_ALERTA
        WHERE ID_ESTADO = 1
        ORDER BY NOMBRE_MOTIVO_ALERTA ASC
      `,
      { type: QueryTypes.SELECT },
    );

    return res.status(200).json({
      ok: true,
      data: motivos,
    });
  } catch (error) {
    console.error("getMotivoAlerta:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al obtener motivos de alerta",
    });
  }
};

const getCriteriosEvaluacionByCartera = async (req, res) => {
  console.log(
    "===================== OBTENIENDO ACCIONES POR CARTERA =====================",
  );

  try {
    const { cartera } = req.query;

    if (!cartera) {
      return res.status(400).json({
        ok: false,
        msg: "Debe enviar el parámetro cartera",
      });
    }

    if (isNaN(cartera)) {
      return res.status(400).json({
        ok: false,
        msg: "El parámetro cartera debe ser numérico",
      });
    }

    const acciones = await db.query(
      `
        SELECT
          tb1.ID_ACCION_CRITERIO,
          tb1.NOMBRE_ACCION_CRITERIO,
          tb1.PESO_ACCION_CRITERIO,
          tb1.ID_CRITERIO,
          tb2.NOMBRE_CRITERIO,
          tb2.PESO_CRITERIO,
          tb4.ID_ITEM,
          tb4.NOMBRE_ITEM,
          tb4.PESO_ITEM,
          tb5.cartera AS NOMBRE_CARTERA,
          tb1.ESTADO_ACCION
        FROM calidad.ACCION_CRITERIO tb1
        INNER JOIN calidad.CRITERIO tb2
          ON tb1.ID_CRITERIO = tb2.ID_CRITERIO
         AND tb2.ID_ESTADO = 1
        INNER JOIN calidad.ITEM tb4
          ON tb2.ID_ITEM = tb4.ID_ITEM
         AND tb4.ID_ESTADO = 1
        INNER JOIN SISTEMAGEST_DESARROLLO.cartera tb5
          ON tb4.ID_CARTERA = tb5.id
         AND tb5.estado = 1
        WHERE tb1.ESTADO_ACCION = 1
          AND tb4.ID_CARTERA = ?
        ORDER BY tb4.NOMBRE_ITEM ASC
      `,
      {
        replacements: [cartera],
        type: QueryTypes.SELECT,
      },
    );

    return res.status(200).json({
      ok: true,
      acciones,
    });
  } catch (error) {
    console.error("Error al obtener acciones por cartera:", error);

    return res.status(500).json({
      ok: false,
      msg: "Error al obtener acciones por cartera",
    });
  }
};

module.exports = {
  getAllCycGestions,
  getClientesAndCarteras,
  getEfectosByCartera,
  getFilteredCycGestions,
  getMotivoNoPagCartera,
  getTipoGestionCartera,
  getPersonalAsesor,
  getResponsableNoFCR,
  getMotivoNoFCR,
  getMotivoAlerta,
  getCriteriosEvaluacionByCartera,
};
