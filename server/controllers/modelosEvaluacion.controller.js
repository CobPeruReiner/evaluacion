const { QueryTypes } = require("sequelize");
const { db, dbWeb } = require("../utils/database.util");

const number = (value) => Number(value);

function validateTree(items) {
  if (!Array.isArray(items) || !items.length)
    throw new Error("Agrega al menos un ítem a la plantilla.");
  const itemTotal = items.reduce((total, item) => total + number(item.peso), 0);
  if (
    items.some(
      (item) =>
        !item.nombre?.trim() ||
        !Number.isFinite(number(item.peso)) ||
        number(item.peso) <= 0,
    )
  )
    throw new Error("Cada ítem debe tener un nombre y un peso válido.");
  if (itemTotal > 1.00001)
    throw new Error(
      "La suma de los pesos de los ítems no puede superar el 100%.",
    );

  items.forEach((item) => {
    if (!Array.isArray(item.criterios) || !item.criterios.length)
      throw new Error(
        `El ítem \"${item.nombre}\" necesita al menos un criterio.`,
      );
    const criteriosTotal = item.criterios.reduce(
      (total, criterio) => total + number(criterio.peso),
      0,
    );
    if (criteriosTotal > number(item.peso) + 0.00001)
      throw new Error(
        `Los criterios de \"${item.nombre}\" superan el peso del ítem.`,
      );
    item.criterios.forEach((criterio) => {
      if (
        !criterio.nombre?.trim() ||
        !Number.isFinite(number(criterio.peso)) ||
        number(criterio.peso) <= 0
      )
        throw new Error("Cada criterio debe tener un nombre y un peso válido.");
      if (!Array.isArray(criterio.acciones) || !criterio.acciones.length)
        throw new Error(
          `El criterio \"${criterio.nombre}\" necesita al menos una acción.`,
        );
      const accionesTotal = criterio.acciones.reduce(
        (total, accion) => total + number(accion.peso),
        0,
      );
      if (accionesTotal > number(criterio.peso) + 0.00001)
        throw new Error(
          `Las acciones de \"${criterio.nombre}\" superan el peso del criterio.`,
        );
      criterio.acciones.forEach((accion) => {
        if (
          !accion.nombre?.trim() ||
          !Number.isFinite(number(accion.peso)) ||
          number(accion.peso) <= 0
        )
          throw new Error("Cada acción debe tener un nombre y un peso válido.");
      });
    });
  });
}

async function getPersonalId(dni) {
  const people = await dbWeb.query(
    "SELECT IDPERSONAL FROM personal WHERE DOC = :dni LIMIT 1",
    { replacements: { dni }, type: QueryTypes.SELECT },
  );
  if (!people.length)
    throw new Error("No se encontró el usuario que realiza el cambio.");
  return people[0].IDPERSONAL;
}

async function assertSingleActiveModel(idCartera, excludedIdModelo, transaction) {
  const models = await db.query(
    `SELECT ID_MODELO FROM CALIDAD.MODELO_EVALUACION
      WHERE ID_CARTERA=:idCartera AND ESTADO=1
      ${excludedIdModelo ? "AND ID_MODELO <> :excludedIdModelo" : ""}
      FOR UPDATE`,
    { replacements: { idCartera, excludedIdModelo }, transaction, type: QueryTypes.SELECT },
  );
  if (models.length) {
    throw new Error("La cartera ya tiene una plantilla activa. Edítala o desactívala antes de crear otra.");
  }
}

async function getModeloDetalle(idModelo) {
  const rows = await db.query(
    `SELECT m.ID_MODELO, m.NOMBRE, m.ID_CARTERA, m.ESTADO, ca.cartera AS NOMBRE_CARTERA,
      i.ID_ITEM, i.NOMBRE AS ITEM_NOMBRE, i.PESO AS ITEM_PESO,
      c.ID_CRITERIO, c.NOMBRE AS CRITERIO_NOMBRE, c.PESO AS CRITERIO_PESO,
      a.ID_ACCION, a.NOMBRE AS ACCION_NOMBRE, a.PESO AS ACCION_PESO
    FROM CALIDAD.MODELO_EVALUACION m
    INNER JOIN SISTEMAGEST.cartera ca ON ca.id = m.ID_CARTERA
    LEFT JOIN CALIDAD.ITEM i ON i.ID_MODELO = m.ID_MODELO AND i.ESTADO = 1
    LEFT JOIN CALIDAD.CRITERIO c ON c.ID_ITEM = i.ID_ITEM AND c.ESTADO = 1
    LEFT JOIN CALIDAD.ACCION_CRITERIO a ON a.ID_CRITERIO = c.ID_CRITERIO AND a.ESTADO = 1
    WHERE m.ID_MODELO = :idModelo AND m.ESTADO = 1
    ORDER BY i.ID_ITEM, c.ID_CRITERIO, a.ID_ACCION`,
    { replacements: { idModelo }, type: QueryTypes.SELECT },
  );
  if (!rows.length) return null;
  const model = {
    idModelo: rows[0].ID_MODELO,
    nombre: rows[0].NOMBRE,
    idCartera: rows[0].ID_CARTERA,
    nombreCartera: rows[0].NOMBRE_CARTERA,
    items: [],
  };
  const items = new Map();
  rows.forEach((row) => {
    if (!row.ID_ITEM) return;
    if (!items.has(row.ID_ITEM)) {
      const item = {
        idItem: row.ID_ITEM,
        nombre: row.ITEM_NOMBRE,
        peso: Number(row.ITEM_PESO),
        criterios: [],
      };
      items.set(row.ID_ITEM, item);
      model.items.push(item);
    }
    const item = items.get(row.ID_ITEM);
    let criterio = item.criterios.find(
      (value) => value.idCriterio === row.ID_CRITERIO,
    );
    if (!criterio && row.ID_CRITERIO) {
      criterio = {
        idCriterio: row.ID_CRITERIO,
        nombre: row.CRITERIO_NOMBRE,
        peso: Number(row.CRITERIO_PESO),
        acciones: [],
      };
      item.criterios.push(criterio);
    }
    if (criterio && row.ID_ACCION)
      criterio.acciones.push({
        idAccion: row.ID_ACCION,
        nombre: row.ACCION_NOMBRE,
        peso: Number(row.ACCION_PESO),
      });
  });
  return model;
}

const listModelos = async (_req, res) => {
  try {
    const modelos = await db.query(
      `SELECT m.ID_MODELO, m.NOMBRE, m.ID_CARTERA, ca.cartera AS NOMBRE_CARTERA, m.FE_REGISTRO,
      COUNT(DISTINCT i.ID_ITEM) AS TOTAL_ITEMS
      FROM CALIDAD.MODELO_EVALUACION m INNER JOIN SISTEMAGEST.cartera ca ON ca.id=m.ID_CARTERA
      LEFT JOIN CALIDAD.ITEM i ON i.ID_MODELO=m.ID_MODELO AND i.ESTADO=1
      WHERE m.ESTADO=1 GROUP BY m.ID_MODELO ORDER BY m.FE_REGISTRO DESC`,
      { type: QueryTypes.SELECT },
    );
    res.json({ ok: true, modelos });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: "No fue posible cargar las plantillas.",
      error: error.message,
    });
  }
};

const getModelo = async (req, res) => {
  try {
    const modelo = await getModeloDetalle(req.params.idModelo);
    if (!modelo)
      return res
        .status(404)
        .json({ ok: false, msg: "La plantilla no existe o fue desactivada." });
    res.json({ ok: true, modelo });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: "No fue posible cargar la plantilla.",
      error: error.message,
    });
  }
};

async function persistTree(
  { idModelo, nombre, idCartera, idPersonal, items },
  transaction,
) {
  await db.query(
    `UPDATE CALIDAD.MODELO_EVALUACION SET NOMBRE=:nombre, ID_CARTERA=:idCartera, IDPERSONAL=:idPersonal WHERE ID_MODELO=:idModelo`,
    {
      replacements: {
        idModelo,
        nombre: nombre.trim().toUpperCase(),
        idCartera,
        idPersonal,
      },
      transaction,
    },
  );
  await db.query(
    `UPDATE CALIDAD.ACCION_CRITERIO a INNER JOIN CALIDAD.CRITERIO c ON c.ID_CRITERIO=a.ID_CRITERIO INNER JOIN CALIDAD.ITEM i ON i.ID_ITEM=c.ID_ITEM SET a.ESTADO=0, a.FE_ACTUALIZACION=NOW() WHERE i.ID_MODELO=:idModelo`,
    { replacements: { idModelo }, transaction },
  );
  await db.query(
    `UPDATE CALIDAD.CRITERIO c INNER JOIN CALIDAD.ITEM i ON i.ID_ITEM=c.ID_ITEM SET c.ESTADO=0, c.FE_ACTUALIZACION=NOW() WHERE i.ID_MODELO=:idModelo`,
    { replacements: { idModelo }, transaction },
  );
  await db.query(
    `UPDATE CALIDAD.ITEM SET ESTADO=0, FE_ACTUALIZACION=NOW() WHERE ID_MODELO=:idModelo`,
    { replacements: { idModelo }, transaction },
  );
  for (const item of items) {
    const [itemId] = await db.query(
      `INSERT INTO CALIDAD.ITEM (ID_MODELO,IDPERSONAL,NOMBRE,PESO,ESTADO,FE_REGISTRO,FE_ACTUALIZACION) VALUES (:idModelo,:idPersonal,:nombre,:peso,1,NOW(),NOW())`,
      {
        replacements: {
          idModelo,
          nombre: item.nombre.trim().toUpperCase(),
          peso: number(item.peso),
          idPersonal,
        },
        transaction,
        type: QueryTypes.INSERT,
      },
    );
    for (const criterio of item.criterios) {
      const [criterioId] = await db.query(
        `INSERT INTO CALIDAD.CRITERIO (ID_ITEM,IDPERSONAL,NOMBRE,PESO,ESTADO,FE_REGISTRO,FE_ACTUALIZACION) VALUES (:itemId,:idPersonal,:nombre,:peso,1,NOW(),NOW())`,
        {
          replacements: {
            itemId,
            idPersonal,
            nombre: criterio.nombre.trim().toUpperCase(),
            peso: number(criterio.peso),
          },
          transaction,
          type: QueryTypes.INSERT,
        },
      );
      for (const accion of criterio.acciones)
        await db.query(
          `INSERT INTO CALIDAD.ACCION_CRITERIO (ID_CRITERIO,IDPERSONAL,NOMBRE,PESO,ESTADO,FE_REGISTRO,FE_ACTUALIZACION) VALUES (:criterioId,:idPersonal,:nombre,:peso,1,NOW(),NOW())`,
          {
            replacements: {
              criterioId,
              idPersonal,
              nombre: accion.nombre.trim().toUpperCase(),
              peso: number(accion.peso),
            },
            transaction,
          },
        );
    }
  }
}

const createModelo = async (req, res) => {
  try {
    const { nombre, idCartera, idUsuarioActualizacion, items } = req.body;
    if (!nombre?.trim() || !idCartera || !idUsuarioActualizacion)
      return res.status(400).json({
        ok: false,
        msg: "Nombre, cartera y usuario son obligatorios.",
      });
    validateTree(items);
    const idPersonal = await getPersonalId(idUsuarioActualizacion);
    const result = await db.transaction(async (transaction) => {
      await assertSingleActiveModel(idCartera, null, transaction);
      const [idModelo] = await db.query(
        `INSERT INTO CALIDAD.MODELO_EVALUACION (ID_CARTERA,IDPERSONAL,NOMBRE,ESTADO,FE_REGISTRO) VALUES (:idCartera,:idPersonal,:nombre,1,NOW())`,
        {
          replacements: {
            idCartera,
            idPersonal,
            nombre: nombre.trim().toUpperCase(),
          },
          transaction,
          type: QueryTypes.INSERT,
        },
      );
      await persistTree(
        { idModelo, nombre, idCartera, idPersonal, items },
        transaction,
      );
      return idModelo;
    });
    res.status(201).json({
      ok: true,
      msg: "Plantilla creada correctamente.",
      idModelo: result,
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      msg: error.message || "No fue posible crear la plantilla.",
    });
  }
};

const updateModelo = async (req, res) => {
  try {
    const { nombre, idCartera, idUsuarioActualizacion, items } = req.body;
    const idModelo = Number(req.params.idModelo);
    if (!nombre?.trim() || !idCartera || !idUsuarioActualizacion)
      return res.status(400).json({
        ok: false,
        msg: "Nombre, cartera y usuario son obligatorios.",
      });
    validateTree(items);
    const idPersonal = await getPersonalId(idUsuarioActualizacion);
    await db.transaction(async (transaction) => {
      await assertSingleActiveModel(idCartera, idModelo, transaction);
      await persistTree({ idModelo, nombre, idCartera, idPersonal, items }, transaction);
    });
    res.json({ ok: true, msg: "Plantilla actualizada correctamente." });
  } catch (error) {
    res.status(400).json({
      ok: false,
      msg: error.message || "No fue posible actualizar la plantilla.",
    });
  }
};

const deactivateModelo = async (req, res) => {
  try {
    await db.transaction(async (transaction) => {
      const idModelo = req.params.idModelo;
      await db.query(
        `UPDATE CALIDAD.ACCION_CRITERIO a INNER JOIN CALIDAD.CRITERIO c ON c.ID_CRITERIO=a.ID_CRITERIO INNER JOIN CALIDAD.ITEM i ON i.ID_ITEM=c.ID_ITEM SET a.ESTADO=0, a.FE_ACTUALIZACION=NOW() WHERE i.ID_MODELO=:idModelo`,
        { replacements: { idModelo }, transaction },
      );
      await db.query(
        `UPDATE CALIDAD.CRITERIO c INNER JOIN CALIDAD.ITEM i ON i.ID_ITEM=c.ID_ITEM SET c.ESTADO=0, c.FE_ACTUALIZACION=NOW() WHERE i.ID_MODELO=:idModelo`,
        { replacements: { idModelo }, transaction },
      );
      await db.query(
        `UPDATE CALIDAD.ITEM SET ESTADO=0, FE_ACTUALIZACION=NOW() WHERE ID_MODELO=:idModelo`,
        { replacements: { idModelo }, transaction },
      );
      await db.query(
        `UPDATE CALIDAD.MODELO_EVALUACION SET ESTADO=0 WHERE ID_MODELO=:idModelo`,
        { replacements: { idModelo }, transaction },
      );
    });
    res.json({
      ok: true,
      msg: "Plantilla desactivada junto con todos sus elementos.",
    });
  } catch (error) {
    res
      .status(500)
      .json({ ok: false, msg: "No fue posible desactivar la plantilla." });
  }
};

module.exports = {
  listModelos,
  getModelo,
  createModelo,
  updateModelo,
  deactivateModelo,
};
