export const Indagacion = ({ item }) => {
  return (
    <>
      {item.evaluacion?.indagacion && (
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h4 className="font-semibold text-lg mb-3 text-purple-700 flex items-center">
            📝 Indagación y Asesoramiento
          </h4>
          <div className="text-gray-700 mb-3 space-y-1">
            <p>
              <strong>Resultado:</strong>
              <span
                className={
                  item.evaluacion.indagacion.resultado === "Aprobado"
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {item.evaluacion.indagacion.resultado}
              </span>
            </p>
            <p>
              <strong>Cumplimiento:</strong>
              {item.evaluacion.indagacion.cumplimiento?.toFixed(2)}%
            </p>
          </div>
          <div className="bg-gray-50 border rounded p-3 space-y-2">
            {Object.entries(item.evaluacion.indagacion.criterios || {}).map(
              ([nombreCriterio, accion], i) => (
                <div
                  key={i}
                  className="flex justify-between py-1 border-b last:border-b-0"
                >
                  <span className="text-gray-600">{nombreCriterio}</span>
                  <span className="text-right font-medium">
                    {accion.NOMBRE || "No evaluado"}
                    <span className="text-xs text-gray-400 ml-2">
                      {accion.PESO}
                    </span>
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </>
  );
};
