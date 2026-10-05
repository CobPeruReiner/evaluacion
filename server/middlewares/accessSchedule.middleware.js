const LIMA_TIME_ZONE = "America/Lima";

const accessScheduleMessage =
  "El sistema está disponible de lunes a viernes de 07:00 a 20:00 y sábados de 08:30 a 13:00 (hora Lima).";

const getLimaScheduleParts = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: LIMA_TIME_ZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const value = (type) => parts.find((part) => part.type === type)?.value;

  return {
    weekday: value("weekday"),
    minutes: Number(value("hour")) * 60 + Number(value("minute")),
  };
};

const isWithinAccessSchedule = (date = new Date()) => {
  const { weekday, minutes } = getLimaScheduleParts(date);

  if (["Mon", "Tue", "Wed", "Thu", "Fri"].includes(weekday)) {
    return minutes >= 7 * 60 && minutes < 20 * 60;
  }

  if (weekday === "Sat") {
    return minutes >= 8 * 60 + 30 && minutes < 13 * 60;
  }

  return false;
};

const enforceAccessSchedule = (req, res, next) => {
  if (isWithinAccessSchedule()) return next();

  return res.status(403).json({
    ok: false,
    code: "ACCESS_OUTSIDE_SCHEDULE",
    message: accessScheduleMessage,
  });
};

module.exports = {
  accessScheduleMessage,
  enforceAccessSchedule,
  isWithinAccessSchedule,
};
