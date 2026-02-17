export const getNivelCriterio = (criterio, respuestaPorCriterio) => {
  const seleccionadaId = respuestaPorCriterio[criterio.idCriterio];

  if (!seleccionadaId) return "none";

  const acciones = criterio.acciones;

  const accionSeleccionada = acciones.find(
    (a) => String(a.idAccion) === String(seleccionadaId),
  );

  if (!accionSeleccionada) return "none";

  const pesoSeleccionado = Number(accionSeleccionada.pesoAccion);

  const pesoMaximo = Math.max(...acciones.map((a) => Number(a.pesoAccion)));

  const ratio = pesoSeleccionado / pesoMaximo;

  if (ratio >= 0.8) return "alto";
  if (ratio >= 0.4) return "medio";
  return "bajo";
};

export const estilosNivel = {
  none: {
    container: "bg-gray-50 border-gray-200",
    select: "border-gray-300 bg-white text-gray-700",
  },
  alto: {
    container: "bg-green-50 border-green-400",
    select: "border-green-500 bg-green-50 text-green-700",
  },
  medio: {
    container: "bg-yellow-50 border-yellow-400",
    select: "border-yellow-500 bg-yellow-50 text-yellow-700",
  },
  bajo: {
    container: "bg-red-50 border-red-400",
    select: "border-red-500 bg-red-50 text-red-700",
  },
};
