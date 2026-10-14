const { getAccessDecision, accessScheduleMessage } = require("../services/accessSchedule.service");

const denyAccess = (res, decision) =>
  res.status(decision.code === "ACCESS_POLICY_UNAVAILABLE" ? 503 : 403).json({
    ok: false,
    code: decision.code,
    message: decision.message || accessScheduleMessage,
  });

const enforceAccessSchedule = async (req, res, next) => {
  try {
    const decision = await getAccessDecision(req.sessionUser.IDPERSONAL);
    if (!decision.allowed) return denyAccess(res, decision);
    return next();
  } catch (error) {
    console.error("No se pudo validar la política de horario:", error.message);
    return denyAccess(res, { code: "ACCESS_POLICY_UNAVAILABLE" });
  }
};

module.exports = { enforceAccessSchedule, denyAccess };
