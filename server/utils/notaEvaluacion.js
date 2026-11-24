// Nota de una evaluación (ficha manual y Speech Analytics) con la fórmula de la ficha:
//   IN_CALIDAD = Σ(peso de la acción × puntaje / 100) × 100
// Cero tolerancia (carteras de CARTERAS_CERO_TOLERANCIA, por defecto la 46 SANTANDER CASTIGO):
// si algún criterio queda en negativo —ninguna de sus acciones puntúa— la nota es 0, aunque
// todo lo demás se haya cumplido. El mismo valor usa el worker (fastapi/app/core/scoring.py).

const carterasCeroTolerancia = () =>
  new Set(String(process.env.CARTERAS_CERO_TOLERANCIA ?? "46").split(",").map((c) => c.trim()).filter(Boolean));

const esCeroTolerancia = (idCartera) => carterasCeroTolerancia().has(String(idCartera));

/**
 * @param modelo   plantilla de toModel(): items → criterios → acciones { idAccion, peso }
 * @param puntajes Map/objeto idAccion → puntaje (0-100); una acción sin puntaje cuenta como no calificada
 * @returns { calidad, negativos: [nombres de criterio], ceroTolerancia: bool, aplicada: bool }
 */
function calcularNota(modelo, puntajes, idCartera) {
  const valor = (idAccion) => (puntajes instanceof Map ? puntajes.get(Number(idAccion)) : puntajes[idAccion]);
  let suma = 0;
  const negativos = [];
  modelo.items.forEach((item) => item.criterios.forEach((criterio) => {
    let calificadas = 0;
    let puntua = false;
    criterio.acciones.forEach((accion) => {
      const p = valor(accion.idAccion);
      if (p === undefined || p === null || p === "") return;
      calificadas += 1;
      if (Number(p) > 0) puntua = true;
      suma += (Number(accion.peso) * Number(p)) / 100;
    });
    // Negativo solo cuando el criterio ya está calificado por completo y nada puntuó.
    if (calificadas === criterio.acciones.length && calificadas > 0 && !puntua) negativos.push(criterio.nombre);
  }));
  const ceroTolerancia = esCeroTolerancia(idCartera);
  const aplicada = ceroTolerancia && negativos.length > 0;
  return { calidad: aplicada ? 0 : Number((suma * 100).toFixed(2)), negativos, ceroTolerancia, aplicada };
}

module.exports = { calcularNota, esCeroTolerancia, carterasCeroTolerancia };
