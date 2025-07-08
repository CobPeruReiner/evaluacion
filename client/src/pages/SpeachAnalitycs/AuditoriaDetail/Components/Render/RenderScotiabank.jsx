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
    <div className="p-4 bg-white border rounded-lg shadow-sm space-y-6">
      <h4 className="font-semibold text-lg text-red-700 flex items-center">
        🏦 Evaluación Scotiabank
      </h4>

      {Object.entries(evaluacion).map(([itemNombre, detalle], idx) => (
        <div key={idx} className="bg-gray-50 border rounded p-3 space-y-2">
          <h5 className="text-md font-bold text-blue-700">{itemNombre}</h5>

          <p>
            <strong>Resultado:</strong>{" "}
            <span className={getResultadoColor(detalle.resultado)}>
              {detalle.resultado}
            </span>
          </p>

          <p>
            <strong>Cumplimiento:</strong> {detalle.cumplimiento?.toFixed(2)}%
          </p>

          <div className="pt-2 space-y-1">
            {Object.entries(detalle.criterios || {}).map(
              ([criterio, accion], i) => (
                <div
                  key={i}
                  className="flex justify-between py-1 border-b last:border-b-0"
                >
                  <span className="text-gray-600">{criterio}</span>
                  <span className="text-right font-medium">
                    {accion.NOMBRE_ACCION_CRITERIO}
                    <span className="text-xs text-gray-400 ml-2">
                      {accion.PESO_ACCION_CRITERIO}
                    </span>
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
