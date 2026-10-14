const { QueryTypes } = require("sequelize");
const { db } = require("../utils/database.util");

const PLATFORM_CODE = "CALIDAD";

const accessScheduleMessage =
  "No podemos validar tu horario. Intenta nuevamente.";

const normalizeTimeToMinutes = (value) => {
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(String(value ?? ""));
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;

  return hours * 60 + minutes;
};

const isTimeWithinRange = (minutes, start, end) => {
  if (start === null || end === null || start === end) return false;
  if (start < end) return minutes >= start && minutes < end;

  // También cubre excepciones válidas que cruzan medianoche.
  return minutes >= start || minutes < end;
};

const formatTime = (value) => {
  const minutes = normalizeTimeToMinutes(value);
  if (minutes === null) return "";

  const hours = Math.floor(minutes / 60);
  const minute = String(minutes % 60).padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";
  const hour = hours % 12 || 12;
  return `${hour}:${minute} ${period}`;
};

const baseScheduleMessage = (schedule) =>
  `Horario: lun. a vie. ${formatTime(schedule.HORA_INICIO_LUN_VIE)}–${formatTime(schedule.HORA_FIN_LUN_VIE)}; sáb. ${formatTime(schedule.HORA_INICIO_SABADO)}–${formatTime(schedule.HORA_FIN_SABADO)}.`;

const customScheduleMessage = (exceptions) => {
  const ranges = exceptions
    .map((exception) => `${formatTime(exception.HORA_INICIO)}–${formatTime(exception.HORA_FIN)}`)
    .filter((range) => !range.startsWith("–"));

  return ranges.length > 0
    ? `Tu horario autorizado: ${ranges.join(" / ")}.`
    : "Tu horario personalizado no permite el acceso ahora.";
};

const getZonedDateTime = (date, timeZone) => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(date);
  const value = (type) => parts.find((part) => part.type === type)?.value;

  return {
    weekday: value("weekday"),
    date: `${value("year")}-${value("month")}-${value("day")}`,
    minutes: Number(value("hour")) * 60 + Number(value("minute")),
  };
};

const isBaseScheduleAllowed = (schedule, now) => {
  if (Number(schedule.ESTADO) !== 1) return false;

  const { weekday, minutes } = getZonedDateTime(now, schedule.ZONA_HORARIA);

  if (["Mon", "Tue", "Wed", "Thu", "Fri"].includes(weekday)) {
    return isTimeWithinRange(
      minutes,
      normalizeTimeToMinutes(schedule.HORA_INICIO_LUN_VIE),
      normalizeTimeToMinutes(schedule.HORA_FIN_LUN_VIE),
    );
  }

  if (weekday === "Sat") {
    return isTimeWithinRange(
      minutes,
      normalizeTimeToMinutes(schedule.HORA_INICIO_SABADO),
      normalizeTimeToMinutes(schedule.HORA_FIN_SABADO),
    );
  }

  // El modelo no define rango horario de domingo: si se habilita, permite el día completo.
  return Number(schedule.PERMITE_DOMINGO) === 1;
};

const evaluateSchedule = ({ schedule, exceptions = [], now = new Date() }) => {
  if (!schedule?.ZONA_HORARIA) {
    return { allowed: false, code: "ACCESS_POLICY_UNAVAILABLE", message: accessScheduleMessage };
  }

  let zonedNow;
  try {
    zonedNow = getZonedDateTime(now, schedule.ZONA_HORARIA);
  } catch (_error) {
    return { allowed: false, code: "ACCESS_POLICY_UNAVAILABLE", message: accessScheduleMessage };
  }

  const activeExceptions = exceptions.filter((exception) => Number(exception.ESTADO) === 1);
  if (activeExceptions.some((exception) => exception.TIPO_EXCEPCION === "BLOQUEAR_ACCESO")) {
    return {
      allowed: false,
      code: "ACCESS_BLOCKED_BY_EXCEPTION",
      message: "Tu acceso está restringido. Contacta a tu supervisor.",
    };
  }

  const customSchedules = activeExceptions.filter(
    (exception) => exception.TIPO_EXCEPCION === "HORARIO_PERSONALIZADO",
  );
  if (customSchedules.length > 0) {
    const allowed = customSchedules.some((exception) =>
      isTimeWithinRange(
        zonedNow.minutes,
        normalizeTimeToMinutes(exception.HORA_INICIO),
        normalizeTimeToMinutes(exception.HORA_FIN),
      ),
    );

    return {
      allowed,
      code: allowed ? "ACCESS_GRANTED_BY_CUSTOM_SCHEDULE" : "ACCESS_OUTSIDE_CUSTOM_SCHEDULE",
      message: customScheduleMessage(customSchedules),
    };
  }

  if (activeExceptions.some((exception) => exception.TIPO_EXCEPCION === "SIN_RESTRICCION")) {
    return { allowed: true, code: "ACCESS_GRANTED_BY_EXCEPTION" };
  }

  return {
    allowed: isBaseScheduleAllowed(schedule, now),
    code: "ACCESS_OUTSIDE_SCHEDULE",
    message: baseScheduleMessage(schedule),
  };
};

const getAccessDecision = async (idPersonal, now = new Date()) => {
  const schedule = await db.query(
    `SELECT ID_RESTRICCION_HORARIO_PLATAFORMA, CODIGO_PLATAFORMA, ZONA_HORARIA,
            HORA_INICIO_LUN_VIE, HORA_FIN_LUN_VIE,
            HORA_INICIO_SABADO, HORA_FIN_SABADO, PERMITE_DOMINGO, ESTADO
       FROM RESTRICCION_HORARIO_PLATAFORMA
      WHERE CODIGO_PLATAFORMA = :platformCode AND ESTADO = 1
      ORDER BY ID_RESTRICCION_HORARIO_PLATAFORMA DESC
      LIMIT 1`,
    { replacements: { platformCode: PLATFORM_CODE }, type: QueryTypes.SELECT },
  );

  if (!schedule[0]) {
    return { allowed: false, code: "ACCESS_POLICY_UNAVAILABLE", message: accessScheduleMessage };
  }

  const zonedNow = getZonedDateTime(now, schedule[0].ZONA_HORARIA);
  const exceptions = await db.query(
    `SELECT TIPO_EXCEPCION, HORA_INICIO, HORA_FIN, ESTADO
       FROM EXCEPCION_HORARIO_PLATAFORMA
      WHERE ID_RESTRICCION_HORARIO_PLATAFORMA = :scheduleId
        AND IDPERSONAL = :idPersonal
        AND ESTADO = 1
        AND FECHA_INICIO <= :localDate
        AND (FECHA_FIN IS NULL OR FECHA_FIN >= :localDate)
      ORDER BY FECHA_INICIO DESC, ID_EXCEPCION_HORARIO_PLATAFORMA DESC`,
    {
      replacements: {
        scheduleId: schedule[0].ID_RESTRICCION_HORARIO_PLATAFORMA,
        idPersonal,
        localDate: zonedNow.date,
      },
      type: QueryTypes.SELECT,
    },
  );

  return evaluateSchedule({ schedule: schedule[0], exceptions, now });
};

module.exports = {
  accessScheduleMessage,
  evaluateSchedule,
  formatTime,
  getAccessDecision,
  isTimeWithinRange,
};
