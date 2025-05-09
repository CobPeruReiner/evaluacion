const { QueryTypes } = require("sequelize");
const { db } = require("../utils/database.util");

// ITEMS
const getAllItems = async (_req, res) => {
  console.log("===================== OBTENIENDO ITEMS =====================");

  try {
    const items = await db.query(
      `
        SELECT tb1.ID_ITEM, tb1.NOMBRE_ITEM, tb1.PESO_ITEM, tb1.ID_CARTERA, tb2.NOMBRE_CARTERA, tb1.FECHA_ACTUALIZACION, tb1.USUARIO_ACTUALIZACION, CONCAT(tb3.NOMBRES, ' ', tb3.APELLIDOS) AS NOMBRE_USUARIO_ACTUALIZACION
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
          ID_CARTERA
        )
        VALUES (
          :nombreItem,
          :pesoItem,
          :fechaActualizacion,
          :usuarioActualizacion,
          :idCartera
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
        UPDATE calidad.ITEM
        SET NOMBRE_ITEM = :nombreItem,
            PESO_ITEM = :pesoItem,
            FECHA_ACTUALIZACION = :fechaActualizacion,
            USUARIO_ACTUALIZACION = :usuarioActualizacion,
            ID_CARTERA = :idCartera
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

// CRITERIOS
const getAllCriterios = async (_req, res) => {
  console.log(
    "===================== OBTENIENDO CRITERIOS ====================="
  );

  try {
    const criterios = await db.query(
      `
        SELECT
          tb1.ID_CRITERIO, tb1.NOMBRE_CRITERIO, tb1.PESO_CRITERIO, tb1.ID_ITEM, tb2.NOMBRE_ITEM, tb1.FECHA_ACTUALIZACION,
          tb1.USUARIO_ACTUALIZACION, CONCAT(tb3.NOMBRES, ' ', tb3.APELLIDOS) AS NOMBRE_USUARIO_ACTUALIZACION, tb4.NOMBRE_CARTERA
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
      `SELECT COALESCE(SUM(PESO_CRITERIO), 0) AS total FROM calidad.CRITERIO WHERE ID_ITEM = :idItem`,
      {
        replacements: { idItem },
        type: QueryTypes.SELECT,
      }
    );

    // 2. Obtener peso del ítem
    const [item] = await db.query(
      `SELECT PESO_ITEM FROM calidad.ITEM WHERE ID_ITEM = :idItem`,
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

    const pesoRestante = item.PESO_ITEM - suma.total;

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
      (NOMBRE_CRITERIO, PESO_CRITERIO, FECHA_ACTUALIZACION, USUARIO_ACTUALIZACION, ID_ITEM)
      VALUES 
      (:nombreCriterio, :pesoCriterio, :fechaActualizacion, :idUsuarioActualizacion, :idItem);
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
    !idUsuarioActualizacion
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
      SET NOMBRE_CRITERIO = :nombreCriterio, PESO_CRITERIO = :pesoCriterio, FECHA_ACTUALIZACION = :fechaActualizacion, USUARIO_ACTUALIZACION = :idUsuarioActualizacion
      WHERE ID_CRITERIO = :idCriterio;
      `,
      {
        replacements: {
          idCriterio,
          nombreCriterio,
          pesoCriterio,
          fechaActualizacion,
          idUsuarioActualizacion,
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

// ACCIONES
const getAllAcciones = async (_req, res) => {
  console.log(
    "===================== OBTENIENDO ACCIONES ====================="
  );

  try {
    const acciones = await db.query(
      `
        SELECT tb1.ID_ACCION_CRITERIO, tb1.NOMBRE_ACCION_CRITERIO, tb1.ID_CRITERIO, tb1.PESO_ACCION_CRITERIO, tb2.NOMBRE_CRITERIO, tb1.FECHA_ACTUALIZACION, tb1.USUARIO_ACTUALIZACION, CONCAT(tb3.NOMBRES, ' ', tb3.APELLIDOS) AS NOMBRE_USUARIO_ACTUALIZACION
        FROM calidad.ACCION_CRITERIO tb1
        LEFT JOIN calidad.CRITERIO tb2
        ON tb1.ID_CRITERIO = tb2.ID_CRITERIO
        LEFT JOIN calidad.PERSONAL tb3
        ON tb1.USUARIO_ACTUALIZACION = tb3.IDPERSONAL
        LEFT JOIN calidad.ITEM tb4
        ON tb2.ID_ITEM = tb4.ID_ITEM;
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
    !pesoAccion ||
    !fechaActualizacion ||
    !idUsuarioActualizacion ||
    !idCriterio
  ) {
    return res.status(400).json({
      ok: false,
      msg: "Todos los campos son obligatorios",
    });
  }

  try {
    await db.query(
      `
        INSERT INTO calidad.ACCION_CRITERIO (NOMBRE_ACCION_CRITERIO, PESO_ACCION_CRITERIO, FECHA_ACTUALIZACION, USUARIO_ACTUALIZACION, ID_CRITERIO)
        VALUES (:nombreAccion, :pesoAccion, :fechaActualizacion, :idUsuarioActualizacion, :idCriterio);
      `,
      {
        replacements: {
          nombreAccion,
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

const updateAccion = async (req, res) => {};

// MOTIVNOS NO PAGO
const getAllMotivosNoPago = async (_req, res) => {
  console.log(
    "===================== OBTENIENDO MOTIVOS NO PAGO ====================="
  );

  try {
    const motivos = await db.query(
      `
        SELECT tb1.ID_MOTIVO_NO_PAGO, tb1.NOMBRE_MOTIVO_NO_PAGO, tb1.ID_CARTERA, tb2.NOMBRE_CARTERA
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
        INSERT INTO calidad.MOTIVO_NO_PAGO (NOMBRE_MOTIVO_NO_PAGO, ID_CARTERA)
        VALUES (:nombreMotivo, :idCartera);
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

const updateMotivoNoPago = async (req, res) => {};

// TIPOS DE GESTION
const getAllTiposGestion = async (_req, res) => {
  console.log(
    "===================== OBTENIENDO TIPOS DE GESTION ====================="
  );

  try {
    const gestiones = await db.query(
      `
        SELECT tb1.ID_TIPO_GESTION, tb1.NOMBRE_TIPO_GESTION, tb1.ID_CARTERA, tb2.NOMBRE_CARTERA
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
        INSERT INTO calidad.TIPO_GESTION (NOMBRE_TIPO_GESTION, ID_CARTERA)
        VALUES (:nombreGestion, :idCartera);
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

const updateTipoGestion = async (req, res) => {};

// TIPOS DE LLAMADA
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
        INSERT INTO calidad.TIPO_LLAMADA (NOMBRE_TIPO_LLAMADA)
        VALUES (:nombreLlamada);
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

const updateTipoLlamada = async (req, res) => {};

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
};
