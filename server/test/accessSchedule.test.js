const test = require("node:test");
const assert = require("node:assert/strict");
const { isWithinAccessSchedule } = require("../middlewares/accessSchedule.middleware");

// Las fechas se expresan en UTC para probar explícitamente la conversión a America/Lima (UTC-5).
test("permite lunes a viernes desde 07:00 hasta antes de las 20:00", () => {
  assert.equal(isWithinAccessSchedule(new Date("2026-10-05T12:00:00Z")), true); // lunes 07:00 Lima
  assert.equal(isWithinAccessSchedule(new Date("2026-10-06T00:59:00Z")), true); // lunes 19:59 Lima
  assert.equal(isWithinAccessSchedule(new Date("2026-10-06T01:00:00Z")), false); // lunes 20:00 Lima
});

test("permite sábado desde 08:30 hasta antes de las 13:00", () => {
  assert.equal(isWithinAccessSchedule(new Date("2026-10-10T13:29:00Z")), false); // 08:29 Lima
  assert.equal(isWithinAccessSchedule(new Date("2026-10-10T13:30:00Z")), true);  // 08:30 Lima
  assert.equal(isWithinAccessSchedule(new Date("2026-10-10T17:59:00Z")), true);  // 12:59 Lima
  assert.equal(isWithinAccessSchedule(new Date("2026-10-10T18:00:00Z")), false); // 13:00 Lima
});

test("bloquea todo acceso el domingo", () => {
  assert.equal(isWithinAccessSchedule(new Date("2026-10-11T17:00:00Z")), false);
});
