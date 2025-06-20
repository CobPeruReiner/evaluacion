const { QueryTypes } = require("sequelize");
const { db, dbWeb } = require("../utils/database.util");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const { obtenerNombreAgente } = require("../utils/obtener-nombre-agente");
const { obtenerConexionPorColor } = require("../utils/conexiones-vicidial");
const { obtenerColorPorIdCartera } = require("../utils/obtener-color");

const servidorPython = process.env.PATH_SERVAPLICACIONES || "localhost";
// const servidorPython = "localhost";

// ======================== ITEMS ========================
const getAllItems = async (_req, res) => {
  console.log("===================== OBTENIENDO ITEMS =====================");

  try {
    const items = await db.query(
      `
        SELECT tb1.ID_ITEM, tb1.NOMBRE_ITEM, tb1.PESO_ITEM, tb1.ID_CARTERA, tb2.NOMBRE_CARTERA, tb1.FECHA_ACTUALIZACION, tb1.USUARIO_ACTUALIZACION, CONCAT(tb3.NOMBRES, ' ', tb3.APELLIDOS) AS NOMBRE_USUARIO_ACTUALIZACION, tb1.ID_ESTADO
        FROM calidad.ITEM tb1
        LEFT JOIN calidad.CARTERA tb2
        ON tb1.ID_CARTERA = tb2.ID_CARTERA
        LEFT JOIN calidad.PERSONAL tb3
        ON tb1.USUARIO_ACTUALIZACION = tb3.IDPERSONAL
        WHERE tb2.ESTADO = 1;
      `,
      {
        type: QueryTypes.SELECT,
      }
    );

    res.status(200).json({
      ok: true,
      items,
    });
  } catch (error) {
    console.error("Error al obtener items:", error);
    res.status(500).json({
      ok: false,
      msg: "Error al obtener items",
    });
  }
};

const createItem = async (req, res) => {
  const {
    nombreItem,
    pesoItem,
    fechaActualizacion,
    idUsuarioActualizacion,
    idCartera,
  } = req.body;

  console.log("===================== CREANDO ITEM =====================");
  console.log("Creando item con: ", req.body);

  // Validación de campos obligatorios
  if (
    !nombreItem?.trim() ||
    pesoItem === undefined ||
    !fechaActualizacion ||
    !idUsuarioActualizacion ||
    !idCartera
  ) {
    return res.status(400).json({
      ok: false,
      msg: "Todos los campos son obligatorios",
    });
  }

  // Validación de tipos básicos
  if (isNaN(pesoItem)) {
    return res.status(400).json({
      ok: false,
      msg: "El peso debe ser un número",
    });
  }

  if (isNaN(Date.parse(fechaActualizacion))) {
    return res.status(400).json({
      ok: false,
      msg: "La fecha de actualización no es válida",
    });
  }

  try {
    const nombreItemUppercase = nombreItem.toUpperCase();

    await db.query(
      `
        INSERT INTO calidad.ITEM (
          NOMBRE_ITEM,
          PESO_ITEM,
          FECHA_ACTUALIZACION,
          USUARIO_ACTUALIZACION,
          ID_CARTERA,
          ID_ESTADO
        )
        VALUES (
          :nombreItem,
          :pesoItem,
          :fechaActualizacion,
          :usuarioActualizacion,
          :idCartera,
          1
        );
      `,
      {
        replacements: {
          nombreItem: nombreItemUppercase,
          pesoItem,
          fechaActualizacion,
          usuarioActualizacion: idUsuarioActualizacion,
          idCartera,
        },
        type: QueryTypes.INSERT,
      }
    );

    return res.status(201).json({
      ok: true,
      msg: "Item creado correctamente",
    });
  } catch (error) {
    console.error("Error al crear item:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error al crear item",
    });
  }
};

const updateItem = async (req, res) => {
  const {
    idItem,
    nombreItem,
    pesoItem,
    fechaActualizacion,
    idUsuarioActualizacion,
    idCartera,
    idEstado,
  } = req.body;

  console.log("===================== ACTUALIZANDO ITEM =====================");
  console.log("Actualizando item con: ", req.body);

  // Validación de campos obligatorios
  if (
    !idItem ||
    !nombreItem?.trim() ||
    pesoItem === undefined ||
    !fechaActualizacion ||
    !idUsuarioActualizacion ||
    !idCartera ||
    idEstado === undefined
  ) {
    return res.status(400).json({
      ok: false,
      msg: "Todos los campos son obligatorios",
    });
  }

  // Validación de tipos básicos
  if (isNaN(pesoItem)) {
    return res.status(400).json({
      ok: false,
      msg: "El peso debe ser un número",
    });
  }

  if (isNaN(Date.parse(fechaActualizacion))) {
    return res.status(400).json({
      ok: false,
      msg: "La fecha de actualización no es válida",
    });
  }

  try {
    const nombreItemUppercase = nombreItem.toUpperCase();

    await db.query(
      `
        UPDATE calidad.ITEM
        SET NOMBRE_ITEM = :nombreItem,
            PESO_ITEM = :pesoItem,
            FECHA_ACTUALIZACION = :fechaActualizacion,
            USUARIO_ACTUALIZACION = :usuarioActualizacion,
            ID_CARTERA = :idCartera,
            ID_ESTADO = :idEstado
        WHERE ID_ITEM = :idItem;
      `,
      {
        replacements: {
          idItem,
          nombreItem: nombreItemUppercase,
          pesoItem,
          fechaActualizacion,
          usuarioActualizacion: idUsuarioActualizacion,
          idCartera,
          idEstado,
        },
        type: QueryTypes.UPDATE,
      }
    );

    return res.status(200).json({
      ok: true,
      msg: "Item actualizado correctamente",
    });
  } catch (error) {
    console.error("Error al actualizar item:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error al actualizar item",
    });
  }
};

// ======================== CRITERIOS ========================
const getAllCriterios = async (_req, res) => {
  console.log(
    "===================== OBTENIENDO CRITERIOS ====================="
  );

  try {
    const criterios = await db.query(
      `
        SELECT
          tb1.ID_CRITERIO, tb1.NOMBRE_CRITERIO, tb1.PESO_CRITERIO, tb1.ID_ITEM, tb2.NOMBRE_ITEM, tb1.FECHA_ACTUALIZACION,
          tb1.USUARIO_ACTUALIZACION, CONCAT(tb3.NOMBRES, ' ', tb3.APELLIDOS) AS NOMBRE_USUARIO_ACTUALIZACION, tb4.NOMBRE_CARTERA, tb1.ID_ESTADO
        FROM calidad.CRITERIO tb1
        LEFT JOIN calidad.ITEM tb2
        ON tb1.ID_ITEM = tb2.ID_ITEM
        LEFT JOIN calidad.PERSONAL tb3
        ON tb1.USUARIO_ACTUALIZACION = tb3.IDPERSONAL
        LEFT JOIN calidad.CARTERA tb4
        ON tb2.ID_CARTERA = tb4.ID_CARTERA AND tb4.ESTADO = 1;
      `,
      {
        type: QueryTypes.SELECT,
      }
    );

    res.status(200).json({
      ok: true,
      criterios,
    });
  } catch (error) {
    console.error("Error al obtener criterios:", error);
    res.status(500).json({
      ok: false,
      msg: "Error al obtener criterios",
    });
  }
};

const createCriterio = async (req, res) => {
  const {
    nombreCriterio,
    pesoCriterio,
    fechaActualizacion,
    idUsuarioActualizacion,
    idItem,
  } = req.body;

  console.log("===================== CREANDO CRITERIO =====================");
  console.log("req.body: ", req.body);

  if (
    !nombreCriterio ||
    pesoCriterio === undefined ||
    !fechaActualizacion ||
    !idUsuarioActualizacion ||
    !idItem
  ) {
    return res.status(400).json({
      ok: false,
      msg: "Todos los campos son obligatorios",
    });
  }

  try {
    // 1. Obtener peso total actual de los criterios del ítem
    const [suma] = await db.query(
      `SELECT COALESCE(SUM(PESO_CRITERIO), 0) AS total FROM calidad.CRITERIO WHERE ID_ITEM = :idItem AND ID_ESTADO = 1`,
      {
        replacements: { idItem },
        type: QueryTypes.SELECT,
      }
    );

    // 2. Obtener peso del ítem
    const [item] = await db.query(
      `SELECT PESO_ITEM FROM calidad.ITEM WHERE ID_ITEM = :idItem AND ID_ESTADO = 1`,
      {
        replacements: { idItem },
        type: QueryTypes.SELECT,
      }
    );

    if (!item) {
      return res.status(404).json({
        ok: false,
        msg: "El ítem no existe",
      });
    }

    const pesoRestante =
      Math.round((item.PESO_ITEM - suma.total) * 10000) / 10000;

    // 3. Validar que no se exceda
    if (pesoCriterio > pesoRestante) {
      return res.status(400).json({
        ok: false,
        msg: `El peso del criterio excede el peso disponible del ítem. Quedan ${pesoRestante} unidades disponibles.`,
      });
    }

    const nombreCriterios = nombreCriterio.toUpperCase();

    // 4. Insertar si todo está bien
    await db.query(
      `
      INSERT INTO calidad.CRITERIO 
      (NOMBRE_CRITERIO, PESO_CRITERIO, FECHA_ACTUALIZACION, USUARIO_ACTUALIZACION, ID_ITEM, ID_ESTADO)
      VALUES 
      (:nombreCriterio, :pesoCriterio, :fechaActualizacion, :idUsuarioActualizacion, :idItem, 1);
      `,
      {
        replacements: {
          nombreCriterio: nombreCriterios,
          pesoCriterio,
          fechaActualizacion,
          idUsuarioActualizacion,
          idItem,
        },
        type: QueryTypes.INSERT,
      }
    );

    res.status(201).json({
      ok: true,
      msg: "Criterio creado correctamente",
    });
  } catch (error) {
    console.error("Error al crear criterio:", error);
    res.status(500).json({
      ok: false,
      msg: "Error al crear criterio",
    });
  }
};

const updateCriterio = async (req, res) => {
  const {
    idCriterio,
    nombreCriterio,
    pesoCriterio,
    fechaActualizacion,
    idUsuarioActualizacion,
    idEstado,
    idItem,
  } = req.body;

  console.log(
    "===================== ACTUALIZANDO CRITERIO ====================="
  );
  console.log("req.body: ", req.body);

  if (
    !idCriterio ||
    !nombreCriterio ||
    pesoCriterio === undefined ||
    !fechaActualizacion ||
    !idUsuarioActualizacion ||
    idEstado === undefined ||
    !idItem
  ) {
    return res.status(400).json({
      ok: false,
      msg: "Todos los campos son obligatorios",
    });
  }

  try {
    await db.query(
      `
      UPDATE calidad.CRITERIO
      SET NOMBRE_CRITERIO = :nombreCriterio,
      PESO_CRITERIO = :pesoCriterio,
      FECHA_ACTUALIZACION = :fechaActualizacion,
      USUARIO_ACTUALIZACION = :idUsuarioActualizacion,
      ID_ESTADO = :idEstado,
      ID_ITEM = :idItem
      WHERE ID_CRITERIO = :idCriterio;
      `,
      {
        replacements: {
          idCriterio,
          nombreCriterio,
          pesoCriterio,
          fechaActualizacion,
          idUsuarioActualizacion,
          idEstado,
          idItem,
        },
        type: QueryTypes.UPDATE,
      }
    );

    res.status(200).json({
      ok: true,
      msg: "Criterio actualizado correctamente",
    });
  } catch (error) {
    console.error("Error al actualizar criterio:", error);
    res.status(500).json({
      ok: false,
      msg: "Error al actualizar criterio",
    });
  }
};

// ======================== ACCIONES ========================
const getAllAcciones = async (_req, res) => {
  console.log(
    "===================== OBTENIENDO ACCIONES ====================="
  );

  try {
    const acciones = await db.query(
      `
        SELECT
          tb1.ID_ACCION_CRITERIO, tb1.NOMBRE_ACCION_CRITERIO, tb1.ID_CRITERIO, tb1.PESO_ACCION_CRITERIO, tb2.NOMBRE_CRITERIO,
          tb1.FECHA_ACTUALIZACION, tb1.USUARIO_ACTUALIZACION, CONCAT(tb3.NOMBRES, ' ', tb3.APELLIDOS) AS NOMBRE_USUARIO_ACTUALIZACION,
          tb4.NOMBRE_ITEM, tb5.NOMBRE_CARTERA,
          tb1.ESTADO_ACCION
        FROM calidad.ACCION_CRITERIO tb1
        LEFT JOIN calidad.CRITERIO tb2
        ON tb1.ID_CRITERIO = tb2.ID_CRITERIO
        LEFT JOIN calidad.PERSONAL tb3
        ON tb1.USUARIO_ACTUALIZACION = tb3.IDPERSONAL
        LEFT JOIN calidad.ITEM tb4
        ON tb2.ID_ITEM = tb4.ID_ITEM
        LEFT JOIN calidad.CARTERA tb5
        ON tb4.ID_CARTERA = tb5.ID_CARTERA;
      `,
      {
        type: QueryTypes.SELECT,
      }
    );

    res.status(200).json({
      ok: true,
      acciones,
    });
  } catch (error) {
    console.error("Error al obtener acciones:", error);
    res.status(500).json({
      ok: false,
      msg: "Error al obtener acciones",
    });
  }
};

const createAccion = async (req, res) => {
  const {
    nombreAccion,
    pesoAccion,
    fechaActualizacion,
    idUsuarioActualizacion,
    idCriterio,
  } = req.body;

  console.log("===================== CREANDO ACCION =====================");
  console.log("req.body: ", req.body);

  if (
    !nombreAccion ||
    !pesoAccion === undefined ||
    !fechaActualizacion ||
    !idUsuarioActualizacion ||
    !idCriterio
  ) {
    return res.status(400).json({
      ok: false,
      msg: "Todos los campos son obligatorios",
    });
  }

  const nombreAccionUpper = nombreAccion.toUpperCase();

  try {
    await db.query(
      `
        INSERT INTO calidad.ACCION_CRITERIO (NOMBRE_ACCION_CRITERIO, PESO_ACCION_CRITERIO, FECHA_ACTUALIZACION, USUARIO_ACTUALIZACION, ID_CRITERIO, ESTADO_ACCION)
        VALUES (:nombreAccionUpper, :pesoAccion, :fechaActualizacion, :idUsuarioActualizacion, :idCriterio, 1);
      `,
      {
        replacements: {
          nombreAccionUpper,
          pesoAccion,
          fechaActualizacion,
          idUsuarioActualizacion,
          idCriterio,
        },
        type: QueryTypes.INSERT,
      }
    );

    res.status(201).json({
      ok: true,
      msg: "Accion creada correctamente",
    });
  } catch (error) {
    console.error("Error al crear accion:", error);
    res.status(500).json({
      ok: false,
      msg: "Error al crear accion",
    });
  }
};

const updateAccion = async (req, res) => {
  const {
    idAccion,
    nombreAccion,
    pesoAccion,
    fechaActualizacion,
    idUsuarioActualizacion,
    idCriterio,
    idEstado,
  } = req.body;

  console.log(
    "===================== ACTUALIZANDO ACCION ====================="
  );
  console.log("req.body: ", req.body);

  if (
    !idAccion ||
    !nombreAccion ||
    pesoAccion === undefined ||
    !fechaActualizacion ||
    !idUsuarioActualizacion ||
    !idCriterio ||
    idEstado === undefined
  ) {
    return res.status(400).json({
      ok: false,
      msg: "Todos los campos son obligatorios",
    });
  }

  const nombreAccionUpper = nombreAccion.toUpperCase();

  try {
    await db.query(
      `
      UPDATE calidad.ACCION_CRITERIO
      SET 
        NOMBRE_ACCION_CRITERIO = :nombreAccionUpper,
        PESO_ACCION_CRITERIO = :pesoAccion,
        FECHA_ACTUALIZACION = :fechaActualizacion,
        USUARIO_ACTUALIZACION = :idUsuarioActualizacion,
        ID_CRITERIO = :idCriterio,
        ESTADO_ACCION = :idEstado
      WHERE ID_ACCION_CRITERIO = :idAccion;
      `,
      {
        replacements: {
          idAccion,
          nombreAccionUpper,
          pesoAccion,
          fechaActualizacion,
          idUsuarioActualizacion,
          idCriterio,
          idEstado,
        },
        type: QueryTypes.UPDATE,
      }
    );

    return res.status(200).json({
      ok: true,
      msg: "Accion actualizada correctamente",
    });
  } catch (error) {
    console.error("❌ Error al actualizar accion:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error al actualizar accion",
    });
  }
};

// ======================== MOTIVNOS NO PAGO ========================
const getAllMotivosNoPago = async (_req, res) => {
  console.log(
    "===================== OBTENIENDO MOTIVOS NO PAGO ====================="
  );

  try {
    const motivos = await db.query(
      `
        SELECT tb1.ID_MOTIVO_NO_PAGO, tb1.NOMBRE_MOTIVO_NO_PAGO, tb1.ID_CARTERA, tb2.NOMBRE_CARTERA, tb1.ID_ESTADO
        FROM calidad.MOTIVO_NO_PAGO tb1
        LEFT JOIN calidad.CARTERA tb2
        ON tb1.ID_CARTERA = tb2.ID_CARTERA;
      `,
      {
        type: QueryTypes.SELECT,
      }
    );

    res.status(200).json({
      ok: true,
      motivos,
    });
  } catch (error) {
    console.error("Error al obtener motivos:", error);
    res.status(500).json({
      ok: false,
      msg: "Error al obtener motivos de no pago",
    });
  }
};

const createMotivoNoPago = async (req, res) => {
  const { nombreMotivo, idCartera } = req.body;

  console.log(
    "===================== CREANDO MOTIVO NO PAGO ====================="
  );
  console.log("req.body: ", req.body);

  if (!nombreMotivo || !idCartera) {
    return res.status(400).json({
      ok: false,
      msg: "Todos los campos son obligatorios",
    });
  }

  try {
    await db.query(
      `
        INSERT INTO calidad.MOTIVO_NO_PAGO (NOMBRE_MOTIVO_NO_PAGO, ID_CARTERA, ID_ESTADO)
        VALUES (:nombreMotivo, :idCartera, 1);
      `,
      {
        replacements: {
          nombreMotivo,
          idCartera,
        },
        type: QueryTypes.INSERT,
      }
    );

    res.status(201).json({
      ok: true,
      msg: "Motivo de no pago creado correctamente",
    });
  } catch (error) {
    console.error("Error al crear motivo de no pago:", error);
    res.status(500).json({
      ok: false,
      msg: "Error al crear motivo de no pago",
    });
  }
};

const updateMotivoNoPago = async (req, res) => {
  const { idMotivo, nombreMotivo, idCartera, idEstado } = req.body;

  console.log(
    "===================== ACTUALIZANDO MOTIVO NO PAGO ====================="
  );
  console.log("req.body: ", req.body);

  if (!idMotivo || !nombreMotivo || !idCartera || idEstado === undefined) {
    return res.status(400).json({
      ok: false,
      msg: "Todos los campos son obligatorios",
    });
  }

  try {
    await db.query(
      `
        UPDATE calidad.MOTIVO_NO_PAGO
        SET NOMBRE_MOTIVO_NO_PAGO = :nombreMotivo,
            ID_CARTERA = :idCartera,
            ID_ESTADO = :idEstado
        WHERE ID_MOTIVO_NO_PAGO = :idMotivo;
      `,
      {
        replacements: {
          idMotivo,
          nombreMotivo,
          idCartera,
          idEstado,
        },
        type: QueryTypes.UPDATE,
      }
    );

    res.status(200).json({
      ok: true,
      msg: "Motivo de no pago actualizado correctamente",
    });
  } catch (error) {
    console.error("Error al actualizar motivo de no pago:", error);
    res.status(500).json({
      ok: false,
      msg: "Error al actualizar motivo de no pago",
    });
  }
};

// ======================== TIPOS DE GESTION ========================
const getAllTiposGestion = async (_req, res) => {
  console.log(
    "===================== OBTENIENDO TIPOS DE GESTION ====================="
  );

  try {
    const gestiones = await db.query(
      `
        SELECT tb1.ID_TIPO_GESTION, tb1.NOMBRE_TIPO_GESTION, tb1.ID_CARTERA, tb2.NOMBRE_CARTERA, tb1.ID_ESTADO
        FROM calidad.TIPO_GESTION tb1
        LEFT JOIN calidad.CARTERA tb2
        ON tb1.ID_CARTERA = tb2.ID_CARTERA;
      `,
      {
        type: QueryTypes.SELECT,
      }
    );

    res.status(200).json({
      ok: true,
      gestiones,
    });
  } catch (error) {
    console.error("Error al obtener gestiones:", error);
    res.status(500).json({
      ok: false,
      msg: "Error al obtener tipos de gestiones",
    });
  }
};

const createTipoGestion = async (req, res) => {
  const { nombreGestion, idCartera } = req.body;

  console.log(
    "===================== CREANDO TIPO DE GESTION ====================="
  );
  console.log("req.body: ", req.body);

  if (!nombreGestion || !idCartera) {
    return res.status(400).json({
      ok: false,
      msg: "Todos los campos son obligatorios",
    });
  }

  try {
    await db.query(
      `
        INSERT INTO calidad.TIPO_GESTION (NOMBRE_TIPO_GESTION, ID_CARTERA, ID_ESTADO)
        VALUES (:nombreGestion, :idCartera, 1);
      `,
      {
        replacements: {
          nombreGestion,
          idCartera,
        },
        type: QueryTypes.INSERT,
      }
    );

    res.status(201).json({
      ok: true,
      msg: "Tipo de gestion creado correctamente",
    });
  } catch (error) {
    console.error("Error al crear tipo de gestion:", error);
    res.status(500).json({
      ok: false,
      msg: "Error al crear tipo de gestion",
    });
  }
};

const updateTipoGestion = async (req, res) => {
  const { idTipoGestion, nombreGestion, idCartera, idEstado } = req.body;

  console.log(
    "===================== ACTUALIZANDO TIPO DE GESTION ====================="
  );
  console.log("req.body: ", req.body);

  if (
    !idTipoGestion ||
    !nombreGestion ||
    !idCartera ||
    idEstado === undefined
  ) {
    return res.status(400).json({
      ok: false,
      msg: "Todos los campos son obligatorios",
    });
  }

  try {
    const [affectedRows] = await db.query(
      `
        UPDATE calidad.TIPO_GESTION
        SET NOMBRE_TIPO_GESTION = :nombreGestion,
            ID_CARTERA = :idCartera,
            ID_ESTADO = :idEstado
        WHERE ID_TIPO_GESTION = :idTipoGestion;
      `,
      {
        replacements: {
          idTipoGestion,
          nombreGestion,
          idCartera,
          idEstado,
        },
        type: QueryTypes.UPDATE,
      }
    );

    if (affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        msg: "No se encontró el tipo de gestión para actualizar",
      });
    }

    res.status(200).json({
      ok: true,
      msg: "Tipo de gestión actualizado correctamente",
    });
  } catch (error) {
    console.error("Error al actualizar tipo de gestion:", error);
    res.status(500).json({
      ok: false,
      msg: "Error al actualizar tipo de gestion",
    });
  }
};

// ======================== TIPOS DE LLAMADA ========================
const getAllTiposLlamada = async (_req, res) => {
  console.log(
    "===================== OBTENIENDO TIPOS DE LLAMADA ====================="
  );

  try {
    const llamadas = await db.query(
      `
        SELECT * FROM calidad.TIPO_LLAMADA;
      `,
      {
        type: QueryTypes.SELECT,
      }
    );

    res.status(200).json({
      ok: true,
      llamadas,
    });
  } catch (error) {
    console.error("Error al obtener llamadas:", error);
    res.status(500).json({
      ok: false,
      msg: "Error al obtener tipos de llamadas",
    });
  }
};

const createTipoLlamada = async (req, res) => {
  const { nombreLlamada } = req.body;

  console.log(
    "===================== CREANDO TIPO DE LLAMADA ====================="
  );
  console.log("req.body: ", req.body);

  if (!nombreLlamada) {
    return res.status(400).json({
      ok: false,
      msg: "Todos los campos son obligatorios",
    });
  }

  try {
    await db.query(
      `
        INSERT INTO calidad.TIPO_LLAMADA (NOMBRE_TIPO_LLAMADA, ID_ESTADO)
        VALUES (:nombreLlamada, 1);
      `,
      {
        replacements: {
          nombreLlamada,
        },
        type: QueryTypes.INSERT,
      }
    );

    res.status(201).json({
      ok: true,
      msg: "Tipo de llamada creado correctamente",
    });
  } catch (error) {
    console.error("Error al crear tipo de llamada:", error);
    res.status(500).json({
      ok: false,
      msg: "Error al crear tipo de llamada",
    });
  }
};

const updateTipoLlamada = async (req, res) => {
  const { idTipoLlamada, nombreLlamada, idEstado } = req.body;

  console.log(
    "===================== ACTUALIZANDO TIPO DE LLAMADA ====================="
  );
  console.log("req.body: ", req.body);

  if (!idTipoLlamada || !nombreLlamada || idEstado === undefined) {
    return res.status(400).json({
      ok: false,
      msg: "Todos los campos son obligatorios",
    });
  }

  try {
    const [affectedRows] = await db.query(
      `
        UPDATE calidad.TIPO_LLAMADA
        SET NOMBRE_TIPO_LLAMADA = :nombreLlamada,
            ID_ESTADO = :idEstado
        WHERE ID_TIPO_LLAMADA = :idTipoLlamada;
      `,
      {
        replacements: {
          idTipoLlamada,
          nombreLlamada,
          idEstado,
        },
        type: QueryTypes.UPDATE,
      }
    );

    if (affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        msg: "No se encontró el tipo de llamada para actualizar",
      });
    }

    res.status(200).json({
      ok: true,
      msg: "Tipo de llamada actualizado correctamente",
    });
  } catch (error) {
    console.error("Error al actualizar tipo de llamada:", error);
    res.status(500).json({
      ok: false,
      msg: "Error al actualizar tipo de llamada",
    });
  }
};

// ====================== EFECTOS =====================
const getAllEfectos = async (req, res) => {
  console.log("===================== OBTENIENDO EFECTOS =====================");

  const filtro = req.query.filtro?.trim() || "";

  try {
    // Definimos cláusula WHERE condicional
    const whereClause = filtro ? `AND tb1.EFECTO LIKE :filtro` : "";

    const replacements = filtro ? { filtro: `%${filtro}%` } : {};

    const efectos = await db.query(
      `
      SELECT tb1.ID_EFECTO, tb1.EFECTO, tb1.HOMOLO, tb1.DESCRIPCION, tb1.ID_ESTADO
      FROM calidad.EFECTO tb1
      WHERE tb1.ID_ESTADO = 1
      ${whereClause}
      ORDER BY tb1.EFECTO ASC
      `,
      {
        type: QueryTypes.SELECT,
        replacements,
      }
    );

    res.status(200).json({
      ok: true,
      efectos,
    });
  } catch (error) {
    console.error("❌ Error al obtener efectos:", error);
    res.status(500).json({
      ok: false,
      msg: "Error al obtener efectos",
    });
  }
};

// PROCESAR ZIP
const processZip = async (req, res) => {
  console.log("📥 Petición recibida para procesar ZIP");

  if (!req.file || path.extname(req.file.originalname) !== ".zip") {
    console.warn("⚠️ Archivo inválido recibido");
    return res
      .status(400)
      .json({ ok: false, error: "Debes subir un archivo .zip válido." });
  }

  const zipPath = req.file.path;
  const nombreZip = req.file.originalname;
  const nombreBase = path.basename(nombreZip, ".zip");

  // Se espera que el nombre venga como: idCartera_YYYY-MM-DD_algo.zip
  const partesNombre = nombreBase.split("_");
  const idCartera = partesNombre[0];
  const fecha = partesNombre[1];

  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return res.status(400).json({
      ok: false,
      error:
        "El nombre del archivo ZIP debe incluir una fecha en formato YYYY-MM-DD.",
    });
  }

  const color = obtenerColorPorIdCartera(idCartera);
  const dbConexion = obtenerConexionPorColor(color);

  console.log(`📄 ZIP cargado: ${zipPath}`);
  console.log(`🗓️ Fecha extraída: ${fecha}`);
  console.log(`🎯 ID Cartera: ${idCartera}`);

  const form = new FormData();

  // Datos a mandar a python process
  form.append("file", fs.createReadStream(zipPath));
  form.append("id_cartera", idCartera);

  const usuario = req.body.usuario || null;

  console.log("Archivos a evaluar enviados por:", usuario);

  try {
    console.log("📡 Enviando ZIP al servidor Python...");

    const response = await axios.post(
      `http://${servidorPython}:8000/api/v1/procesar`,
      form,
      {
        headers: form.getHeaders(),
        maxBodyLength: Infinity,
      }
    );

    console.log("✅ Respuesta recibida");

    // const outputDir = path.join(__dirname, "../audios");
    const outputDir = path.join(__dirname, "server/audios");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const data = response.data;
    const exitosos = Array.isArray(data) ? data : data.exitosos || [];
    const fallidos = data.fallidos || [];

    const procesados = [];

    for (const item of exitosos) {
      const {
        archivo,
        audio_base64,
        transcripcion,
        metadatos,
        error_diarizacion,
        evaluacion,
      } = item;

      const { campaña, anexo } = metadatos;
      let full_name = null;

      if (campaña && anexo && dbConexion) {
        full_name = await obtenerNombreAgente(dbConexion, campaña, anexo);
      }

      const audioPath = path.join(outputDir, archivo);
      const buffer = Buffer.from(audio_base64, "base64");
      fs.writeFileSync(audioPath, buffer);

      procesados.push({
        archivo,
        transcripcion,
        evaluacion,
        metadatos: {
          ...metadatos,
          idCartera,
          color,
          full_name,
        },
        error_diarizacion,
      });
    }

    // === GUARDAR ===
    // const carpetaFecha = path.join(__dirname, `../resultados/${fecha}`);
    const carpetaFecha = path.join(__dirname, `server/resultados/${fecha}`);

    if (!fs.existsSync(carpetaFecha)) {
      fs.mkdirSync(carpetaFecha, { recursive: true });
    }

    const resultadoPath = path.join(
      carpetaFecha,
      `resultados_${nombreBase}.json`
    );
    fs.writeFileSync(
      resultadoPath,
      JSON.stringify({ usuario, exitosos: procesados, fallidos }, null, 2),
      "utf-8"
    );

    fs.unlink(zipPath, () => {
      console.log("🗑️ ZIP temporal eliminado");
    });

    res.status(200).json({
      ok: true,
      exitosos: procesados,
      fallidos,
    });
  } catch (err) {
    console.error("⛔ Error del servidor Python:", err.message);
    res.status(500).json({
      ok: false,
      error: "Error en el servidor de transcripción",
      detalle: err.message,
    });
  }
};

// SERVIR REVISIONES AUDITORIA
const obtenerResultadosPorFechaCartera = (req, res) => {
  const { fechaDesde, fechaHasta, cartera } = req.query;

  if (
    !fechaDesde ||
    !fechaHasta ||
    !/^\d{4}-\d{2}-\d{2}$/.test(fechaDesde) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(fechaHasta)
  ) {
    return res.status(400).json({
      ok: false,
      msg: "Debe proporcionar un rango de fechas válido (YYYY-MM-DD)",
    });
  }

  // const carpetaBase = path.join(__dirname, "../resultados");
  const carpetaBase = path.join(__dirname, "server/resultados");

  if (!fs.existsSync(carpetaBase)) {
    return res.status(404).json({
      ok: false,
      msg: "No se encontró la carpeta de resultados",
    });
  }

  // Listar carpetas de fechas
  const carpetasFechas = fs
    .readdirSync(carpetaBase)
    .filter((nombre) => /^\d{4}-\d{2}-\d{2}$/.test(nombre))
    .filter((fecha) => fecha >= fechaDesde && fecha <= fechaHasta);

  let resultados = [];

  carpetasFechas.forEach((fecha) => {
    const carpetaPath = path.join(carpetaBase, fecha);

    if (!fs.existsSync(carpetaPath)) return;

    let archivos = fs
      .readdirSync(carpetaPath)
      .filter((file) => file.endsWith(".json"));

    // Parsear carteras
    let carteraIds = [];
    if (cartera && cartera !== "Todos") {
      carteraIds = cartera.split(",").map((id) => id.trim());
    }

    // Filtrar por carteras (si corresponde)
    if (carteraIds.length > 0) {
      archivos = archivos.filter((file) => {
        return carteraIds.some((id) => {
          const regex = new RegExp(`resultados_${id}_`);
          return regex.test(file);
        });
      });
    }

    // Leer contenido de los archivos filtrados
    const resultadosFecha = archivos.map((archivo) => {
      const ruta = path.join(carpetaPath, archivo);
      const contenido = fs.readFileSync(ruta, "utf-8");
      return {
        archivo,
        data: JSON.parse(contenido),
      };
    });

    resultados = resultados.concat(resultadosFecha);
  });

  res.status(200).json({
    ok: true,
    resultados,
  });
};

// CARTERAS
const getAllCarteras = async (req, res) => {
  try {
    const query = `
      SELECT id, cartera AS nombre FROM cartera WHERE estado = 1 ORDER BY cartera;
    `;

    const [results] = await dbWeb.query(query);

    res.status(200).json({
      ok: true,
      carteras: results,
    });
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ ok: false, error: "Error ejecutando la consulta" });
  }
};

// FECHAS
// const obtenerFechasDisponibles = (req, res) => {
//   // const carpetaBase = path.join(__dirname, "../resultados");
//   const carpetaBase = path.join(__dirname, "server/resultados");

//   if (!fs.existsSync(carpetaBase)) {
//     return res.status(404).json({
//       ok: false,
//       msg: "No se encontró la carpeta de resultados",
//     });
//   }

//   const carpetas = fs
//     .readdirSync(carpetaBase)
//     .filter((nombre) => /^\d{4}-\d{2}-\d{2}$/.test(nombre));

//   res.status(200).json({
//     ok: true,
//     fechas: carpetas,
//   });
// };

// Obtener detalle evaluacion
const obtenerDetalleEvaluacion = async (req, res) => {
  const { archivo } = req.query;

  if (!archivo) {
    return res.status(400).json({
      ok: false,
      msg: "Debe proporcionar el nombre del archivo",
    });
  }

  // console.log("Detalle recibido: ", archivo); // OK

  try {
    // Falta leer el archivo y enviarlo
    // const carpetaBase = path.join(__dirname, "../resultados");
    const carpetaBase = path.join(__dirname, "server/resultados");

    // Buscar el archivo en cualquier subcarpeta (las carpetas son fechas)
    let resultadoEncontrado = null;

    const carpetasFechas = fs
      .readdirSync(carpetaBase)
      .filter((nombre) => /^\d{4}-\d{2}-\d{2}$/.test(nombre));

    for (const fecha of carpetasFechas) {
      const rutaArchivo = path.join(carpetaBase, fecha, archivo);
      if (fs.existsSync(rutaArchivo)) {
        const contenido = fs.readFileSync(rutaArchivo, "utf-8");
        resultadoEncontrado = JSON.parse(contenido);
        break;
      }
    }

    if (!resultadoEncontrado) {
      return res.status(404).json({
        ok: false,
        msg: "Archivo de resultados no encontrado",
      });
    }

    res.status(200).json({
      ok: true,
      resultado: resultadoEncontrado,
    });
  } catch (error) {
    console.log("Error trayendo detalle de evaluacion: ", error);
    res.status(500).json({ ok: false, error: "Error trayendo detalle" });
  }
};

module.exports = {
  getAllItems,
  createItem,
  updateItem,
  getAllCriterios,
  createCriterio,
  updateCriterio,
  getAllAcciones,
  createAccion,
  updateAccion,
  getAllMotivosNoPago,
  createMotivoNoPago,
  updateMotivoNoPago,
  getAllTiposGestion,
  createTipoGestion,
  updateTipoGestion,
  getAllTiposLlamada,
  createTipoLlamada,
  updateTipoLlamada,
  getAllEfectos,
  processZip,
  obtenerResultadosPorFechaCartera,
  getAllCarteras,
  // obtenerFechasDisponibles,
  obtenerDetalleEvaluacion,
};
