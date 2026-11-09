import { useState } from "react";
import { claseResultado } from "./evaluacionUtils";

/**
 * Resultados guardados antes del agente evaluador (reglas fijas en código). Se
 * conservan para poder seguir consultando el histórico; reemplaza a RenderComun y
 * RenderScotiabank, que mostraban el mismo formato con dos variantes de envoltura.
 */
export function EvaluacionLegado({ evaluacion }) {
  const [abiertos, setAbiertos] = useState({});
  const datos = evaluacion?.scotiabank_evaluacion || evaluacion;
  if (!datos || typeof datos !== "object") return null;

  if (datos.estado === "pendiente") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold">{datos.mensaje || "Calificación pendiente"}</p>
        {datos.detalle && <p className="mt-1 text-xs">{datos.detalle}</p>}
      </div>
    );
  }

  const { resumen_final: resumen, ...bloques } = datos;
  const items = Object.entries(bloques).filter(([, d]) => d && typeof d === "object" && d.criterios);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-bold text-brand-dark">Evaluación por reglas (formato anterior)</h4>
        {resumen && (
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold">{resumen.cumplimiento_total?.toFixed(2)}%</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${claseResultado(resumen.estado_global)}`}>{resumen.estado_global}</span>
          </div>
        )}
      </div>
      {items.map(([nombre, detalle]) => (
        <div key={nombre} className="rounded-xl border border-stone-200">
          <button type="button" onClick={() => setAbiertos((p) => ({ ...p, [nombre]: !p[nombre] }))}
            className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-stone-50">
            <span className="text-sm font-semibold uppercase tracking-wide text-brand-dark">{nombre.replaceAll("_", " ")}</span>
            <span className="flex items-center gap-2">
              <span className="text-xs text-stone-500">{detalle.cumplimiento?.toFixed(2)}%</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${claseResultado(detalle.resultado)}`}>{detalle.resultado}</span>
            </span>
          </button>
          {abiertos[nombre] && (
            <div className="space-y-1.5 border-t border-stone-100 p-3">
              {Object.entries(detalle.criterios || {}).map(([criterio, accion]) => (
                <div key={criterio} className="flex items-center justify-between rounded-md bg-stone-50 px-3 py-2 text-sm">
                  <span className="text-stone-700">{criterio}</span>
                  <span className="font-semibold text-stone-800">
                    {accion.NOMBRE || "No evaluado"}
                    <span className="ml-2 text-xs text-stone-400">({accion.PESO_ACCION ?? accion.PESO})</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
