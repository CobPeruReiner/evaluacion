import { useState } from "react";
import {
  AnilloPuntaje, claseResultado, colorCategoria, colorPuntaje, esEvaluacionAgente, mmss,
} from "./evaluacionUtils";

const SENTIMIENTO = {
  POSITIVO: "bg-emerald-50 text-emerald-700 border-emerald-200",
  NEUTRO: "bg-stone-50 text-stone-600 border-stone-200",
  NEGATIVO: "bg-red-50 text-red-700 border-red-200",
};
const CONTACTO = { TITULAR: "Titular", TERCERO: "Tercero", SIN_CONTACTO: "Sin contacto" };
const haySegmento = (v) => v !== null && v !== undefined;

function IconoCriterio({ c }) {
  if (c.revisar) return <i className="pi pi-exclamation-circle text-amber-500" title="Requiere revisión humana" />;
  if (c.cumple_maximo) return <i className="pi pi-check-circle text-emerald-600" />;
  if (c.peso_accion > 0) return <i className="pi pi-minus-circle text-amber-500" />;
  return <i className="pi pi-times-circle text-brand-red" />;
}

function Cita({ texto, segmento, transcripcion, onSeek }) {
  if (!texto) return null;
  const seg = haySegmento(segmento) ? transcripcion?.[segmento] : null;
  return (
    <button type="button" disabled={!seg} onClick={() => seg && onSeek?.(seg.start, segmento)}
      className="mt-1.5 block w-full border-l-[3px] border-stone-200 pl-2 text-left text-sm italic text-stone-600 enabled:hover:border-brand-red">
      “{texto}”
      {seg && <span className="ml-2 not-italic text-xs font-semibold text-brand-red">{mmss(seg.start)} ▸</span>}
    </button>
  );
}

/** Promesa de pago, motivo de no pago y datos de contacto detectados por el agente. */
export function PromesaPago({ evaluacion, transcripcion, onSeek }) {
  const p = evaluacion?.promesa_pago;
  if (!p) return null;
  const motivo = evaluacion.motivo_no_pago;
  return (
    <div className={`rounded-2xl border p-4 ${p.hay_promesa ? "border-emerald-200 bg-emerald-50/60" : "border-stone-200 bg-white"}`}>
      <div className="flex items-center gap-2">
        <i className={`pi ${p.hay_promesa ? "pi-check-circle text-emerald-600" : "pi-times-circle text-stone-400"} text-lg`} />
        <h5 className="font-bold text-stone-800">{p.hay_promesa ? "Hubo promesa de pago" : "Sin promesa de pago"}</h5>
        {p.hay_promesa && p.tipo !== "NINGUNA" && (
          <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-emerald-700">{p.tipo === "PARCIAL" ? "Parcial" : "Total"}</span>
        )}
      </div>
      {p.hay_promesa && (
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-xs uppercase tracking-wide text-stone-500">Fecha</p><p className="font-semibold text-stone-800">{p.fecha || "No indicada"}</p></div>
          <div><p className="text-xs uppercase tracking-wide text-stone-500">Monto</p><p className="font-semibold text-stone-800">{p.monto !== null && p.monto !== undefined ? `S/ ${Number(p.monto).toFixed(2)}` : "No indicado"}</p></div>
        </div>
      )}
      <Cita texto={p.cita} segmento={p.segmento} transcripcion={transcripcion} onSeek={onSeek} />
      <div className="mt-3 flex flex-wrap gap-2 border-t border-stone-200/70 pt-3 text-xs">
        {evaluacion.contacto && <span className="rounded-full border border-stone-200 bg-white px-2.5 py-1 font-medium text-stone-600">Contacto: {CONTACTO[evaluacion.contacto] || evaluacion.contacto}</span>}
        {evaluacion.sentimiento_cliente && <span className={`rounded-full border px-2.5 py-1 font-medium ${SENTIMIENTO[evaluacion.sentimiento_cliente] || SENTIMIENTO.NEUTRO}`}>Cliente {evaluacion.sentimiento_cliente.toLowerCase()}</span>}
        {motivo?.nombre && <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 font-medium text-violet-700">Motivo de no pago: {motivo.nombre}</span>}
      </div>
      {motivo?.cita && <p className="mt-2 text-xs italic text-stone-500">“{motivo.cita}”</p>}
    </div>
  );
}

export function PalabrasClaveResumen({ grupos }) {
  if (!grupos?.length) return null;
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4">
      <h5 className="mb-3 flex items-center gap-2 font-bold text-stone-800"><i className="pi pi-tags text-brand-red" /> Palabras clave</h5>
      <div className="flex flex-col gap-2">
        {grupos.map((g) => (
          <div key={g.categoria} className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full px-2.5 py-1 font-bold text-white" style={{ background: colorCategoria(g.categoria) }}>{g.categoria} · {g.total}</span>
            {g.terminos.map((t) => <span key={t} className="text-stone-600">{t}</span>)}
            <span className="text-stone-400">(asesor {g.asesor}, cliente {g.cliente})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Calificación por criterios hecha por el agente: nota, ítems y, por cada criterio,
 * la acción elegida con la frase de la llamada que la sustenta (clic → ese minuto).
 */
export function EvaluacionAgente({ evaluacion, transcripcion, onSeek, compacto = false }) {
  const [abiertos, setAbiertos] = useState({});
  if (!esEvaluacionAgente(evaluacion)) return null;

  if (evaluacion.estado !== "evaluado") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold"><i className="pi pi-clock mr-2" />{evaluacion.mensaje || "Calificación pendiente"}</p>
        {evaluacion.detalle && <p className="mt-1 text-xs text-amber-800">{evaluacion.detalle}</p>}
      </div>
    );
  }

  const r = evaluacion.resumen_final || {};
  const toggle = (id) => setAbiertos((prev) => ({ ...prev, [id]: !prev[id] }));
  const abierto = (it) => (abiertos[it.id_item] ?? it.cumplimiento < 100);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5 sm:flex-row sm:items-center">
        <AnilloPuntaje valor={r.cumplimiento_total} subtitulo="cumple" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-xl font-bold" style={{ color: colorPuntaje(r.cumplimiento_total) }}>{r.estado_global}</h4>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${claseResultado(r.resultado)}`}>{r.resultado}</span>
            {r.requiere_revision && <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">Tiene criterios para revisión</span>}
          </div>
          <p className="mt-1 text-xs text-stone-500">
            Plantilla {r.modelo} · cartera {r.tipo_cartera} · aprueba con {r.umbral_aprobacion}%
            {evaluacion.agente?.modelo_llm && <> · agente {evaluacion.agente.modelo_llm}</>}
          </p>
          {evaluacion.resumen && !compacto && <p className="mt-2 text-sm text-stone-700">{evaluacion.resumen}</p>}
        </div>
      </div>

      {!compacto && (
        <div className="grid gap-4 lg:grid-cols-2">
          <PromesaPago evaluacion={evaluacion} transcripcion={transcripcion} onSeek={onSeek} />
          <PalabrasClaveResumen grupos={evaluacion.palabras_clave} />
        </div>
      )}

      <div className="flex flex-col gap-2">
        {(evaluacion.items || []).map((it) => (
          <div key={it.id_item} className="overflow-hidden rounded-xl border border-stone-200 bg-white">
            <button type="button" onClick={() => toggle(it.id_item)} aria-expanded={abierto(it)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-200 hover:bg-stone-50">
              <span className="flex-1 text-sm font-bold uppercase tracking-wide text-brand-dark">{it.item}</span>
              <span className="hidden h-1.5 w-32 overflow-hidden rounded-full bg-stone-100 sm:block">
                <span className="block h-full rounded-full" style={{ width: `${it.cumplimiento}%`, background: colorPuntaje(it.cumplimiento) }} />
              </span>
              <span className="w-12 text-right text-sm font-bold" style={{ color: colorPuntaje(it.cumplimiento) }}>{Math.round(it.cumplimiento)}%</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${claseResultado(it.resultado)}`}>{it.resultado}</span>
              <i className={`pi pi-chevron-down text-xs text-stone-400 transition-transform duration-300 ${abierto(it) ? "rotate-180" : ""}`} />
            </button>
            {/* La fila de grid pasa de 0fr a 1fr: anima la altura real del contenido sin medirla. */}
            <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${abierto(it) ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
              <div className="min-h-0 overflow-hidden" inert={abierto(it) ? undefined : ""}>
              <div className="divide-y divide-stone-100 border-t border-stone-100">
                {it.criterios.map((c) => (
                  <div key={c.id_criterio} className="flex gap-3 px-4 py-3">
                    <div className="pt-0.5"><IconoCriterio c={c} /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-stone-800">{c.criterio}</span>
                        <span className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${c.revisar ? "border-amber-300 text-amber-700" : c.cumple_maximo ? "border-emerald-200 text-emerald-700" : c.peso_accion > 0 ? "border-amber-200 text-amber-700" : "border-red-200 text-red-700"}`}>{c.accion}</span>
                        <span className="text-xs text-stone-400">{(c.peso_accion * 100).toFixed(1)} / {(c.peso_criterio * 100).toFixed(1)} pts</span>
                      </div>
                      {c.justificacion && <p className="mt-0.5 text-sm text-stone-500">{c.justificacion}</p>}
                      <Cita texto={c.evidencia} segmento={c.segmento} transcripcion={transcripcion} onSeek={onSeek} />
                    </div>
                  </div>
                ))}
              </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
