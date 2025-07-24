import { useContext } from "react";
import { CriteriosContext } from "../../../../../Context/Criterios/ItemContext";

const getResultadoColor = (resultado) => {
  switch (resultado) {
    case "Excelente":
    case "Bueno":
      return "bg-green-100 text-green-700";
    case "Aprobado":
      return "bg-green-100 text-green-700";
    case "Deficiente/Trabajable":
      return "bg-yellow-100 text-yellow-700";
    case "Deficiente":
    default:
      return "bg-red-100 text-red-700";
  }
};

export const RenderScotiabank = ({ item, itemIndex }) => {
  const { expandedBloques, toggleBloque } = useContext(CriteriosContext);

  const evaluacion = item?.evaluacion?.scotiabank_evaluacion;
  if (!evaluacion) return null;

  const { resumen_final, ...bloques } = evaluacion;

  return (
    <div className="relative flex flex-col gap-5 p-6 bg-white border rounded-2xl shadow-md transition-all duration-300">
      <h4 className="font-bold text-xl text-red-700 flex items-center gap-2">
        🏦 Evaluación Scotiabank
      </h4>

      {Object.entries(bloques).map(([itemNombre, detalle], idx) => {
        const isOpen = expandedBloques[itemIndex]?.[itemNombre];
        return (
          <div
            key={idx}
            className="border border-gray-200 rounded-xl shadow-sm"
          >
            {/* Header */}
            <button
              type="button"
              onClick={() => toggleBloque(itemIndex, itemNombre)}
              className="w-full px-5 py-3 flex justify-between items-center bg-white hover:bg-gray-100 rounded-t-xl"
            >
              <h5 className="text-blue-700 font-semibold text-md uppercase tracking-wide">
                {itemNombre}
              </h5>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${getResultadoColor(
                  detalle.resultado
                )}`}
              >
                {detalle.resultado}
              </span>
            </button>

            {/* Contenido del bloque */}
            <div
              className={`overflow-hidden transition-all duration-300 ${
                isOpen
                  ? "max-h-screen opacity-100 p-5 space-y-4 bg-white"
                  : "max-h-0 opacity-0 pointer-events-none"
              }`}
            >
              <div className="text-sm text-gray-500">
                <strong className="text-gray-700">Cumplimiento:</strong>{" "}
                {detalle.cumplimiento?.toFixed(2)}%
              </div>

              <div className="space-y-2">
                {Object.entries(detalle.criterios || {}).map(
                  ([criterio, accion], i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center border border-gray-100 bg-gray-50 rounded-md px-3 py-2"
                    >
                      <span className="text-gray-700 text-sm">{criterio}</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {accion.NOMBRE_ACCION_CRITERIO}
                        <span className="text-xs text-gray-400 ml-2">
                          ({accion.PESO_ACCION_CRITERIO})
                        </span>
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        );
      })}

      {resumen_final && (
        <div className="bg-gray-50 border-t pt-4">
          <h5 className="font-bold text-md text-gray-700">📊 Resumen Final</h5>
          <p className="text-sm text-gray-600">
            <strong>Cumplimiento Total:</strong>{" "}
            {resumen_final.cumplimiento_total?.toFixed(2)}%
          </p>
          <p className="text-sm text-gray-600">
            <strong>Estado Global:</strong>{" "}
            <span className={getResultadoColor(resumen_final.estado_global)}>
              {resumen_final.estado_global}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};
