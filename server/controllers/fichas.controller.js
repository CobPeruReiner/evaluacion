const { QueryTypes } = require("sequelize");
const { Ficha } = require("../models/ficha.model");
const { catchAsync } = require("../utils/catchAsync.util");
const { dbWeb } = require("../utils/database.util");
const { Op, Sequelize, literal } = require("sequelize");
const { AppError } = require("../utils/appError.util");
const { subHours, addHours, format, parse } = require("date-fns");

const createFicha = async (req, res, next) => {
  const {
    id_evaluacion,
    cartera,
    tramo,
    agente,
    agente_dni,
    mes_llamada,
    fecha_llamada,
    semana_llamada,
    telefono,
    dni_cliente,
    resultado,
    hora_llamada,
    tmo_segundos,
    tipo_llamada,
    tipo_gestion,
    alerta,
    descripcion_alerta,
    motivo_no_pago,
    responsabilidad_no_fcr,
    motivo_no_fcr,
    audio_nombre,
    fecha_monitoreo,
    nombre_monitor,
    rol,
    hora_inicio,
    hora_fin,
    duracion_monitoreo,
    saludo_11,
    contactar_con_persona_12,
    identificacion_gestor_13,
    brindar_informacion_21,
    indagar_motivo_no_pago_22,
    asesorar_23,
    mantiene_sentido_urgencia_31,
    perseverancia_objetivo_32,
    reafirmar_acuerdos_41,
    despedida_cliente_42,
    escucha_activa_51,
    comunicacion_cliente_52,
    amabilidad_cliente_53,
    uso_herramientas_61,
    registro_gestiones_62,
    calificacion_final,
    observaciones,
    supervisor,
    tramo_estandar,
    tipo_ficha,
    apertura,
    indagacion,
    manejo,
    cierre,
    habilidades,
    herramientas,
    apertura_completado,
    indagacion_completado,
    manejo_completado,
    cierre_completado,
    habilidades_completado,
    herramientas_completado,
  } = req.body;

  const newFicha = await Ficha.create({
    id_evaluacion,
    cartera,
    tramo,
    agente,
    agente_dni,
    mes_llamada,
    fecha_llamada,
    semana_llamada,
    telefono,
    dni_cliente,
    resultado,
    hora_llamada,
    tmo_segundos,
    tipo_llamada,
    tipo_gestion,
    alerta,
    descripcion_alerta,
    motivo_no_pago,
    responsabilidad_no_fcr,
    motivo_no_fcr,
    audio_nombre,
    fecha_monitoreo,
    nombre_monitor,
    rol,
    hora_inicio,
    hora_fin,
    duracion_monitoreo,
    saludo_11,
    contactar_con_persona_12,
    identificacion_gestor_13,
    brindar_informacion_21,
    indagar_motivo_no_pago_22,
    asesorar_23,
    mantiene_sentido_urgencia_31,
    perseverancia_objetivo_32,
    reafirmar_acuerdos_41,
    despedida_cliente_42,
    escucha_activa_51,
    comunicacion_cliente_52,
    amabilidad_cliente_53,
    uso_herramientas_61,
    registro_gestiones_62,
    calificacion_final,
    observaciones,
    supervisor,
    tramo_estandar,
    tipo_ficha,
    apertura,
    indagacion,
    manejo,
    cierre,
    habilidades,
    herramientas,
    apertura_completado,
    indagacion_completado,
    manejo_completado,
    cierre_completado,
    habilidades_completado,
    herramientas_completado,
  });

  res.status(201).json({
    status: "success",
    newFicha,
  });
};

const getAllFichas = catchAsync(async (req, res, next) => {
  const { firstDate, secondDate } = req.query;

  // Convertimos las fechas de formato "dd/mm/yyyy" a Date válido
  const startDate = parse(firstDate, "yyyy-MM-dd", new Date());
  const endDate = parse(secondDate, "yyyy-MM-dd", new Date());

  // Formateamos las fechas para incluir horas
  const formattedStartDate = format(startDate, "yyyy-MM-dd 00:00:00");
  const formattedEndDate = format(endDate, "yyyy-MM-dd 23:59:59");

  const fichas = await Ficha.findAll({
    attributes: { exclude: ["agente_dni"] },
    // where: {
    //     fecha_monitoreo: {
    //         [Op.between]: [formattedStartDate, formattedEndDate],
    //     },
    // },
    where: {
      [Op.and]: [
        literal(
          `STR_TO_DATE(fecha_monitoreo, '%d/%m/%Y') BETWEEN '${formattedStartDate}' AND '${formattedEndDate}'`,
        ),
      ],
    },
  });

  console.log(fichas);

  res.status(200).json({
    status: "success",
    fichas,
  });
});

const getFilteredlFichas = catchAsync(async (req, res, next) => {
  console.log(" ======== FUNCTION FILTERED FICHAS ================");

  const { cliente, tramo, firstDate, secondDate, asesor } = req.query;

  const condiciones = [];

  // Condición para fechas, si están presentes
  if (firstDate && secondDate) {
    console.log("Buscando por:", {
      firstDate,
      secondDate,
      asesor,
      cliente,
      tramo,
    });

    // Convertimos las fechas de formato "dd/mm/yyyy" a Date válido
    const startDate = parse(firstDate, "yyyy-MM-dd", new Date());
    const endDate = parse(secondDate, "yyyy-MM-dd", new Date());

    // Formateamos las fechas para incluir horas
    const formattedStartDate = format(startDate, "yyyy-MM-dd 00:00:00");
    const formattedEndDate = format(endDate, "yyyy-MM-dd 23:59:59");

    condiciones.push(
      literal(
        `STR_TO_DATE(fecha_monitoreo, '%d/%m/%Y') BETWEEN '${formattedStartDate}' AND '${formattedEndDate}'`,
      ),
    );
  }

  // Agrega condiciones dinámicas
  if (cliente) {
    // condiciones[Op.and].push({ cartera: cliente });
    condiciones.push({ cartera: cliente });
  }

  if (tramo && tramo !== "TODOS") {
    condiciones.push({ tramo });
  }

  if (asesor) {
    condiciones.push({ agente_dni: asesor });
  }

  // Verifica que haya al menos una condición
  if (condiciones.length === 0) {
    throw new Error("Debe proporcionar al menos un filtro.");
  }

  // Construye el objeto `where` final con [Op.and]
  const fichas = await Ficha.findAll({
    where: {
      [Op.and]: condiciones,
    },
  });

  res.status(200).json({
    status: "success",
    fichas,
  });
});

const getFichasByUser = catchAsync(async (req, res, next) => {
  const { monitor } = req.params;

  const fichas = await Ficha.findAll({
    where: { agente_dni: monitor },
  });

  res.status(200).json({
    status: "success",
    fichas,
  });
});

const getTypeOfFicha = async (req, res, next) => {
  try {
    console.log(" =========== OBTENIENDO TIPO DE FICHA ===========");
    console.log(req.query);
    console.log("📦 Valor recibido (raw):", req.query.cartera);
    console.log("📦 Longitud:", req.query.cartera.length);
    console.log("📦 Bytes:", Buffer.from(req.query.cartera));

    const cartera = req.query.cartera;
    const fichas = await dbWeb.query(
      `
            SELECT c.id, c.cartera, tc.nombre AS 'tramo', c.tipo,
            CASE
                when tipo IN (1,4) then 'ficha02'
                when tipo = 3 then 'ficha02'
                ELSE 'ficha00'
            END
            AS 'ficha'
            FROM cartera c
            INNER JOIN tipo_cartera tc ON c.tipo = tc.id
            WHERE cartera = :cartera AND c.estado = 1;
        `,
      {
        replacements: { cartera },
        type: QueryTypes.SELECT,
      },
    );

    res.status(200).json({ status: "success", fichas });
  } catch (err) {
    console.error("❌ ERROR DETALLADO:");
    console.error("Mensaje:", err.message);
    console.error("SQL:", err.sql);
    console.error("SQL Message:", err.original?.sqlMessage);
    res.status(500).json({ status: "error", message: err.message });
  }
};

const getAsesorEvaluaciones = catchAsync(async (req, res, next) => {
  const { dni, month } = req.query;
  // const currentYear = new Date().getFullYear();
  const currentYear = 2024;
  console.log(currentYear);

  const fichas = await Ficha.findAll({
    where: {
      agente_dni: dni,
      mes_llamada: month,
      [Op.and]: [
        Sequelize.where(
          Sequelize.fn(
            "YEAR",
            Sequelize.fn(
              "STR_TO_DATE",
              Sequelize.col("fecha_llamada"),
              "%d/%m/%Y",
            ),
          ),
          currentYear,
        ),
      ],
    },
  });

  res.status(200).json({
    status: "success",
    fichas,
  });
});

const getPromedioAnualCalificacion = async (req, res) => {
  // Resta 5 horas a la fecha objetivo
  // const startDate = subHours(new Date(2024, 5, 1), 5);
  const startDate = new Date(2024, 5, 1);
  const formattedDate = format(startDate, "dd/MM/yyyy");
  // need to parse to make it a date type, 'cause not working with string formattedDate
  const parsedDate = parse(formattedDate, "dd/MM/yyyy", new Date());

  try {
    const { dni } = req.query;

    const promedio = await Ficha.findOne({
      attributes: [
        [
          Sequelize.fn("AVG", Sequelize.col("calificacion_final")),
          "promedioCalificacionFinal",
        ],
      ],
      where: {
        agente_dni: dni,
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn(
              "STR_TO_DATE",
              Sequelize.col("fecha_llamada"),
              "%d/%m/%Y",
            ),
            {
              [Op.gt]: parsedDate,
            },
          ),
        ],
      },
    });

    res.status(200).json({
      status: "success",
      promedio: promedio ? promedio.get("promedioCalificacionFinal") : null,
    });
  } catch (error) {
    console.error("Error al obtener el promedio de calificación:", error);
    res.status(500).json({
      status: "error",
      message: "Error al obtener el promedio de calificación",
      error: error.message,
    });
  }
};

const addFeedbackData = catchAsync(async (req, res, next) => {
  const { idevaluacion, isFeedbackCompleted, compromiso } = req.body;

  const ficha = await Ficha.findByPk(idevaluacion);

  if (!ficha) {
    // Si no se encuentra el registro, enviamos una respuesta adecuada
    return next(
      new AppError(`Evaluación con id ${idevaluacion} no encontrado`, 404),
    );
  }

  // Si el registro existe, procedemos a la actualización
  await ficha.update({
    feedback_recibido: isFeedbackCompleted,
    feedback_compromiso: compromiso,
  });

  res.status(200).json({
    status: "success",
  });
});

module.exports = {
  createFicha,
  getAllFichas,
  getFilteredlFichas,
  getFichasByUser,
  getTypeOfFicha,
  getAsesorEvaluaciones,
  getPromedioAnualCalificacion,
  addFeedbackData,
};
