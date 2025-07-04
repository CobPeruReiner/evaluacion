const getResultadoColor = (resultado) => {
  switch (resultado) {
    case "Excelente":
    case "Bueno":
      return "text-green-600";
    case "Deficiente/Trabajable":
      return "text-yellow-600";
    case "Deficiente":
    default:
      return "text-red-600";
  }
};

export const RenderScotiabank = ({ item }) => {
  const evaluacion = item?.evaluacion?.scotiabank_evaluacion;

  if (!evaluacion) return null;

  return (
    <div className="p-4 bg-white border rounded-lg shadow-sm">
      <h4 className="font-semibold text-lg mb-3 text-red-700 flex items-center">
        🏦 Evaluación Scotiabank
      </h4>

      <div className="text-gray-700 mb-3 space-y-1">
        <p>
          <strong>Resultado:</strong>{" "}
          <span className={getResultadoColor(evaluacion.resultado)}>
            {evaluacion.resultado}
          </span>
        </p>
        <p>
          <strong>Cumplimiento:</strong>{" "}
          {evaluacion.cumplimiento_score?.toFixed(2)}%
        </p>
        <p>
          <strong>Peso obtenido:</strong> {evaluacion.peso_obtenido}
        </p>
        <p>
          <strong>Peso total posible:</strong> {evaluacion.peso_total_posible}
        </p>
      </div>

      <div className="bg-gray-50 border rounded p-3 space-y-2">
        {Object.entries(evaluacion.criterios_detallados || {}).map(
          ([criterio, detalle], i) => (
            <div
              key={i}
              className="flex justify-between py-1 border-b last:border-b-0"
            >
              <span className="text-gray-600">{criterio}</span>
              <span className="text-right font-medium">
                {detalle.accion_detectada}
                <span className="text-xs text-gray-400 ml-2">
                  {detalle.peso_obtenido}/{detalle.peso_maximo}
                </span>
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
};
