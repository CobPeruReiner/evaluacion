const test = require("node:test");
const assert = require("node:assert/strict");
const { evaluateSchedule } = require("../services/accessSchedule.service");

const schedule = {
  ESTADO: 1,
  ZONA_HORARIA: "America/Lima",
  HORA_INICIO_LUN_VIE: "07:00:00",
  HORA_FIN_LUN_VIE: "20:00:00",
  HORA_INICIO_SABADO: "08:30:00",
  HORA_FIN_SABADO: "13:00:00",
  PERMITE_DOMINGO: 0,
};

test("respeta el horario base en Lima", () => {
  assert.equal(evaluateSchedule({ schedule, now: new Date("2026-10-05T12:00:00Z") }).allowed, true);
  const outsideSchedule = evaluateSchedule({ schedule, now: new Date("2026-10-06T01:00:00Z") });
  assert.equal(outsideSchedule.allowed, false);
  assert.match(outsideSchedule.message, /7:00 AM.*8:00 PM.*8:30 AM.*1:00 PM/);
  assert.equal(evaluateSchedule({ schedule, now: new Date("2026-10-10T13:30:00Z") }).allowed, true);
  assert.equal(evaluateSchedule({ schedule, now: new Date("2026-10-11T17:00:00Z") }).allowed, false);
});

test("bloquear acceso siempre prevalece", () => {
  const decision = evaluateSchedule({
    schedule,
    now: new Date("2026-10-05T12:00:00Z"),
    exceptions: [{ ESTADO: 1, TIPO_EXCEPCION: "BLOQUEAR_ACCESO" }],
  });
  assert.equal(decision.allowed, false);
  assert.equal(decision.code, "ACCESS_BLOCKED_BY_EXCEPTION");
});

test("sin restricción permite fuera del horario base", () => {
  const decision = evaluateSchedule({
    schedule,
    now: new Date("2026-10-11T17:00:00Z"),
    exceptions: [{ ESTADO: 1, TIPO_EXCEPCION: "SIN_RESTRICCION" }],
  });
  assert.equal(decision.allowed, true);
});

test("horario personalizado reemplaza el horario base durante su vigencia", () => {
  const exception = {
    ESTADO: 1,
    TIPO_EXCEPCION: "HORARIO_PERSONALIZADO",
    HORA_INICIO: "21:00:00",
    HORA_FIN: "22:00:00",
  };
  assert.equal(evaluateSchedule({ schedule, exceptions: [exception], now: new Date("2026-10-06T02:30:00Z") }).allowed, true);
  assert.equal(evaluateSchedule({ schedule, exceptions: [exception], now: new Date("2026-10-05T12:00:00Z") }).allowed, false);
});
