const ADMIN_EVALUACION = [7, 15, 17, 20, 29];
const ADMIN_CONFIGURACION = [7, 17, 20, 29];

export const getCargo = (user) => Number(user?.CARGO ?? user?.cargo);
export const isAsesor = (user) =>
  getCargo(user) === 16 || String(user?.cargo || "").toLowerCase() === "asesor";
export const canUseOperacion = (user) => !isAsesor(user);
export const canViewHistory = (user) => !isAsesor(user);
export const canConfigureEvaluation = (user) => ADMIN_CONFIGURACION.includes(getCargo(user));
export const canUseSpeech = (user) => ADMIN_CONFIGURACION.includes(getCargo(user));
export const canAdministerEvaluations = (user) => ADMIN_EVALUACION.includes(getCargo(user));
export const canAccessAsesorWorkspace = (user) =>
  isAsesor(user) || canAdministerEvaluations(user);
