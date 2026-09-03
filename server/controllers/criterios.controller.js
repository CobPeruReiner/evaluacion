const { QueryTypes } = require("sequelize");
const { db, dbWeb } = require("../utils/database.util");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const { obtenerNombreAgente } = require("../utils/obtener-nombre-agente");
const { obtenerConexionPorColor } = require("../utils/conexiones-vicidial");
const { obtenerColorPorIdCartera } = require("../utils/obtener-color");

// Dentro de Docker el nombre del servicio evita depender de puertos publicados.
const servidorPython = process.env.PATH_SERVAPLICACIONES || "fastapi_backend";
// Entorno
const esProduccion = process.env.NODE_ENV === "production";

// ======================== ITEMS ========================
const getAllItems = async (_req, res) => {
  console.log("===================== OBTENIENDO ITEMS =====================");

  try {
    const items = await db.query(
      `
        SELECT
          tb1.ID_ITEM,
          tb1.NOMBRE_ITEM,
          tb1.PESO_ITEM,
          tb1.ID_CARTERA,
          tb2.cartera AS NOMBRE_CARTERA,
          tb1.FE_ACTUALIZACION,
          tb1.USUARIO_ACTUALIZACION,
          CONCAT(tb3.NOMBRES, ' ', tb3.APELLIDOS) AS NOMBRE_USUARIO_ACTUALIZACION,
          tb1.ID_ESTADO
        FROM CALIDAD.ITEM tb1
        LEFT JOIN SISTEMAGEST.cartera tb2
        ON tb1.ID_CARTERA = tb2.id
        LEFT JOIN SISTEMAGEST.personal tb3
        ON tb1.USUARIO_ACTUALIZACION = tb3.IDPERSONAL
        WHERE tb2.estado = 1
          AND tb1.ID_ESTADO = 1
        ORDER BY tb1.FE_ACTUALIZACION DESC;
      `,
      {
        type: QueryTypes.SELECT,
      },
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
    idCarteras,
  } = req.body;

  console.log("===================== CREANDO ITEM =====================");
  console.log("Creando item con: ", req.body);

  if (
    !nombreItem?.trim() ||
    pesoItem === undefined ||
    !fechaActualizacion ||
    !idUsuarioActualizacion ||
    !Array.isArray(idCarteras) ||
    !idCarteras.length
  ) {
    return res.status(400).json({
      ok: false,
      msg: "Todos los campos son obligatorios",
    });
  }

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

    for (const idCartera of idCarteras) {
      await db.query(
        `
        INSERT INTO CALIDAD.ITEM (
          NOMBRE_ITEM,
          PESO_ITEM,
          FE_ACTUALIZACION,
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
        },
      );
    }

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
        UPDATE CALIDAD.ITEM
        SET NOMBRE_ITEM = :nombreItem,
            PESO_ITEM = :pesoItem,
            FE_ACTUALIZACION = :fechaActualizacion,
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
      },
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
    "===================== OBTENIENDO CRITERIOS =====================",
  );

  try {
    const criterios = await db.query(
      `
        SELECT
          tb1.ID_CRITERIO,
          tb1.NOMBRE,
          tb1.PESO,
          tb1.ID_ITEM,
          tb2.NOMBRE_ITEM,
          tb1.FE_ACTUALIZACION,
          tb1.USUARIO_ACTUALIZACION,
          CONCAT(tb3.NOMBRES, ' ', tb3.APELLIDOS) AS NOMBRE_USUARIO_ACTUALIZACION,
          tb4.cartera AS NOMBRE_CARTERA,
          tb1.ID_ESTADO
        FROM CALIDAD.CRITERIO tb1
        INNER JOIN CALIDAD.ITEM tb2
          ON tb1.ID_ITEM = tb2.ID_ITEM AND tb2.ID_ESTADO = 1
        LEFT JOIN SISTEMAGEST.personal tb3
          ON tb1.USUARIO_ACTUALIZACION = tb3.IDPERSONAL
        LEFT JOIN SISTEMAGEST.cartera tb4
          ON tb2.ID_CARTERA = tb4.id AND tb4.estado = 1
        WHERE tb1.ID_ESTADO = 1
          AND tb2.ID_ESTADO = 1
          AND tb4.estado = 1
          AND tb4.id IS NOT NULL
        ORDER BY tb1.FE_ACTUALIZACION DESC;
      `,
      {
        type: QueryTypes.SELECT,
      },
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
      `SELECT COALESCE(SUM(PESO), 0) AS total FROM CALIDAD.CRITERIO WHERE ID_ITEM = :idItem AND ID_ESTADO = 1`,
      {
        replacements: { idItem },
        type: QueryTypes.SELECT,
      },
    );

    // 2. Obtener peso del ítem
    const [item] = await db.query(
      `SELECT PESO_ITEM FROM CALIDAD.ITEM WHERE ID_ITEM = :idItem AND ID_ESTADO = 1`,
      {
        replacements: { idItem },
        type: QueryTypes.SELECT,
      },
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
      INSERT INTO CALIDAD.CRITERIO 
      (NOMBRE, PESO, FE_ACTUALIZACION, USUARIO_ACTUALIZACION, ID_ITEM, ID_ESTADO)
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
      },
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
    "===================== ACTUALIZANDO CRITERIO =====================",
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
      UPDATE CALIDAD.CRITERIO
      SET NOMBRE = :nombreCriterio,
      PESO = :pesoCriterio,
      FE_ACTUALIZACION = :fechaActualizacion,
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
      },
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
    "===================== OBTENIENDO ACCIONES =====================",
  );

  try {
    const acciones = await db.query(
      `
        SELECT
          tb1.ID_ACCION,
          tb1.NOMBRE,
          tb1.PESO,
          tb1.ID_CRITERIO,
          tb2.NOMBRE,
          tb2.PESO,
          tb1.FE_ACTUALIZACION,
          tb1.USUARIO_ACTUALIZACION,
          CONCAT(tb3.NOMBRES, ' ', tb3.APELLIDOS) AS NOMBRE_USUARIO_ACTUALIZACION,
          tb4.ID_ITEM,
          tb4.NOMBRE_ITEM,
          tb4.PESO_ITEM,
          tb5.cartera AS NOMBRE_CARTERA,
          tb1.ESTADO_ACCION
        FROM CALIDAD.ACCION_CRITERIO tb1
        INNER JOIN CALIDAD.CRITERIO tb2
          ON tb1.ID_CRITERIO = tb2.ID_CRITERIO AND tb2.ID_ESTADO = 1
        INNER JOIN CALIDAD.ITEM tb4
          ON tb2.ID_ITEM = tb4.ID_ITEM AND tb4.ID_ESTADO = 1
        INNER JOIN SISTEMAGEST.cartera tb5
          ON tb4.ID_CARTERA = tb5.id AND tb5.estado = 1
        LEFT JOIN SISTEMAGEST.personal tb3
          ON tb1.USUARIO_ACTUALIZACION = tb3.IDPERSONAL
        WHERE tb1.ESTADO_ACCION = 1
        ORDER BY tb1.FE_ACTUALIZACION DESC;
      `,
      {
        type: QueryTypes.SELECT,
      },
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
        INSERT INTO CALIDAD.ACCION_CRITERIO (NOMBRE, PESO, FE_ACTUALIZACION, USUARIO_ACTUALIZACION, ID_CRITERIO, ESTADO_ACCION)
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
      },
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
    "===================== ACTUALIZANDO ACCION =====================",
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
      UPDATE CALIDAD.ACCION_CRITERIO
      SET 
        NOMBRE = :nombreAccionUpper,
        PESO = :pesoAccion,
        FE_ACTUALIZACION = :fechaActualizacion,
        USUARIO_ACTUALIZACION = :idUsuarioActualizacion,
        ID_CRITERIO = :idCriterio,
        ESTADO_ACCION = :idEstado
      WHERE ID_ACCION = :idAccion;
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
      },
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
    "===================== OBTENIENDO MOTIVOS NO PAGO =====================",
  );

  try {
    const motivos = await db.query(
      `
        SELECT tb1.ID_MOTIVO_NO_PAGO, tb1.NOMBRE_MOTIVO_NO_PAGO, tb1.ID_CARTERA, tb2.cartera AS NOMBRE_CARTERA, tb1.ID_ESTADO
        FROM CALIDAD.MOTIVO_NO_PAGO tb1
        LEFT JOIN SISTEMAGEST.cartera tb2
        ON tb1.ID_CARTERA = tb2.id;
      `,
      {
        type: QueryTypes.SELECT,
      },
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
    "===================== CREANDO MOTIVO NO PAGO =====================",
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
        INSERT INTO CALIDAD.MOTIVO_NO_PAGO (NOMBRE_MOTIVO_NO_PAGO, ID_CARTERA, ID_ESTADO)
        VALUES (:nombreMotivo, :idCartera, 1);
      `,
      {
        replacements: {
          nombreMotivo,
          idCartera,
        },
        type: QueryTypes.INSERT,
      },
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
    "===================== ACTUALIZANDO MOTIVO NO PAGO =====================",
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
        UPDATE CALIDAD.MOTIVO_NO_PAGO
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
      },
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
    "===================== OBTENIENDO TIPOS DE GESTION =====================",
  );

  try {
    const gestiones = await db.query(
      `
        SELECT tb1.ID_TIPO_GESTION, tb1.NOMBRE_TIPO_GESTION, tb1.ID_CARTERA, tb2.cartera AS NOMBRE_CARTERA, tb1.ID_ESTADO
        FROM CALIDAD.TIPO_GESTION tb1
        LEFT JOIN SISTEMAGEST.cartera tb2
        ON tb1.ID_CARTERA = tb2.id;
      `,
      {
        type: QueryTypes.SELECT,
      },
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
    "===================== CREANDO TIPO DE GESTION =====================",
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
        INSERT INTO CALIDAD.TIPO_GESTION (NOMBRE_TIPO_GESTION, ID_CARTERA, ID_ESTADO)
        VALUES (:nombreGestion, :idCartera, 1);
      `,
      {
        replacements: {
          nombreGestion,
          idCartera,
        },
        type: QueryTypes.INSERT,
      },
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
    "===================== ACTUALIZANDO TIPO DE GESTION =====================",
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
        UPDATE CALIDAD.TIPO_GESTION
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
      },
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
    "===================== OBTENIENDO TIPOS DE LLAMADA =====================",
  );

  try {
    const llamadas = await db.query(
      `
        SELECT * FROM CALIDAD.TIPO_LLAMADA;
      `,
      {
        type: QueryTypes.SELECT,
      },
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
    "===================== CREANDO TIPO DE LLAMADA =====================",
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
        INSERT INTO CALIDAD.TIPO_LLAMADA (NOMBRE_TIPO_LLAMADA, ID_ESTADO)
        VALUES (:nombreLlamada, 1);
      `,
      {
        replacements: {
          nombreLlamada,
        },
        type: QueryTypes.INSERT,
      },
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
    "===================== ACTUALIZANDO TIPO DE LLAMADA =====================",
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
        UPDATE CALIDAD.TIPO_LLAMADA
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
      },
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
      FROM CALIDAD.EFECTO tb1
      WHERE tb1.ID_ESTADO = 1
      ${whereClause}
      ORDER BY tb1.EFECTO ASC
      `,
      {
        type: QueryTypes.SELECT,
        replacements,
      },
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

const speechJobsDir = process.env.SPEECH_JOBS_DIR || "/data/jobs";

const enqueueSpeechJob = async (req, res) => {
  const discardUpload = () => req.file && fs.promises.unlink(req.file.path).catch(() => {});
  if (!req.file || path.extname(req.file.originalname).toLowerCase() !== ".zip") {
    await discardUpload();
    return res.status(400).json({ ok: false, error: "Debes subir un archivo .zip válido." });
  }
  const nombreBase = path.basename(req.file.originalname, ".zip");
  const [idCartera, fecha] = nombreBase.split("_");
  if (!idCartera || !fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    await discardUpload();
    return res.status(400).json({ ok: false, error: "El ZIP debe iniciar con cartera_YYYY-MM-DD." });
  }
  const form = new FormData();
  form.append("file", fs.createReadStream(req.file.path));
  form.append("id_cartera", idCartera);
  form.append("version_roles", "v2");
  try {
    const { data } = await axios.post(`http://${servidorPython}:8000/api/v1/jobs`, form, { headers: form.getHeaders(), maxBodyLength: Infinity, maxContentLength: Infinity, timeout: 30000 });
    if (!data?.job_id) throw new Error("La cola no devolvió un identificador de trabajo.");
    const jobDir = path.join(speechJobsDir, data.job_id);
    await fs.promises.mkdir(jobDir, { recursive: true });
    await fs.promises.writeFile(path.join(jobDir, "node-context.json"), JSON.stringify({ idCartera, fecha, nombreBase, usuario: req.body.usuario || null, color: obtenerColorPorIdCartera(idCartera) }), "utf8");
    await fs.promises.unlink(req.file.path).catch(() => {});
    return res.status(202).json({ ok: true, jobId: data.job_id, status: "queued" });
  } catch (error) {
    await fs.promises.unlink(req.file.path).catch(() => {});
    return res.status(502).json({ ok: false, error: "No se pudo encolar el lote de audios." });
  }
};

const finalizeSpeechJob = async (jobId, result) => {
  const jobDir = path.join(speechJobsDir, jobId);
  const marker = path.join(jobDir, "node-result.json");
  if (fs.existsSync(marker)) return JSON.parse(await fs.promises.readFile(marker, "utf8"));
  const lockPath = `${marker}.lock`;
  let lock;
  try {
    lock = await fs.promises.open(lockPath, "wx");
  } catch (error) {
    if (error.code === "EEXIST") return null;
    throw error;
  }
  try {
  const context = JSON.parse(await fs.promises.readFile(path.join(jobDir, "node-context.json"), "utf8"));
  const outputDir = esProduccion ? "/app/server/audios" : path.join(__dirname, "../audios");
  const resultDir = esProduccion ? path.join("/app/server/resultados", context.fecha) : path.resolve(__dirname, "../resultados", context.fecha);
  await fs.promises.mkdir(outputDir, { recursive: true });
  await fs.promises.mkdir(resultDir, { recursive: true });
  const dbConexion = obtenerConexionPorColor(context.color);
  const exitosos = [];
  for (const item of result.exitosos || []) {
    await fs.promises.copyFile(path.join(jobDir, item.audio_path), path.join(outputDir, path.basename(item.archivo)));
    const { campaña, anexo } = item.metadatos || {};
    const full_name = campaña && anexo && dbConexion ? await obtenerNombreAgente(dbConexion, campaña, anexo) : null;
    exitosos.push({ ...item, audio_path: undefined, metadatos: { ...item.metadatos, idCartera: context.idCartera, color: context.color, full_name } });
  }
  const completed = { ok: true, exitosos, fallidos: result.fallidos || [], duracion_total: result.duracion_total };
  await fs.promises.writeFile(path.join(resultDir, `resultados_${context.nombreBase}.json`), JSON.stringify({ usuario: context.usuario, ...completed }, null, 2), "utf8");
  await fs.promises.writeFile(marker, JSON.stringify(completed), "utf8");
  return completed;
  } finally {
    await lock.close();
    await fs.promises.unlink(lockPath).catch(() => {});
  }
};

const getSpeechJob = async (req, res) => {
  if (!/^[a-f0-9-]{36}$/i.test(req.params.jobId)) return res.status(400).json({ ok: false, error: "Identificador de trabajo inválido." });
  try {
    const { data } = await axios.get(`http://${servidorPython}:8000/api/v1/jobs/${req.params.jobId}`, { params: { include_result: true }, timeout: 15000 });
    if (data.status !== "completed") return res.json(data);
    const completed = await finalizeSpeechJob(data.job_id, data.result);
    if (!completed) return res.json({ ok: true, jobId: data.job_id, status: "finalizing" });
    return res.json({ jobId: data.job_id, status: "completed", ...completed });
  } catch (error) {
    return res.status(502).json({ ok: false, error: "No se pudo consultar el estado del lote." });
  }
};

// SERVIR REVISIONES AUDITORIA
const obtenerResultadosPorFechaCartera = (req, res) => {
  const { fechaDesde, fechaHasta, cartera } = req.query;

  console.log("Obteniendo resultados por: ", req.query);

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

  // const carpetaBase = path.resolve(__dirname, "../resultados");
  // const carpetaBase = "/app/server/resultados";

  const carpetaBase = esProduccion
    ? path.join("/app/server/resultados")
    : path.resolve(__dirname, "../resultados");

  console.log("Carpta Base: ", carpetaBase);

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

  console.log("Carpetas encontradas: ", carpetasFechas);

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

    console.log("Cartera IDs: ", carteraIds);

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
      SELECT id, cartera AS nombre FROM SISTEMAGEST.cartera WHERE estado = 1 ORDER BY cartera;
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
    // const carpetaBase = path.resolve(__dirname, "../resultados");
    // const carpetaBase = "/app/server/resultados";

    const carpetaBase = esProduccion
      ? "/app/server/resultados"
      : path.resolve(__dirname, "../resultados");

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
  enqueueSpeechJob,
  getSpeechJob,
  obtenerResultadosPorFechaCartera,
  getAllCarteras,
  // obtenerFechasDisponibles,
  obtenerDetalleEvaluacion,
};
