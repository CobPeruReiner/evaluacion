import { useEffect, useMemo, useRef } from "react";
import { TextoResaltado, esAsesor, mmss } from "./evaluacionUtils";

/**
 * Transcripción diarizada en burbujas asesor/cliente, con las palabras clave
 * resaltadas. El minuto de cada intervención lleva al audio (`onSeek`); `marcado`
 * resalta y desplaza hasta el segmento citado como evidencia.
 */
export function Conversacion({ item, onSeek, marcado, alto = "max-h-[520px]" }) {
  const refs = useRef({});
  const porSegmento = useMemo(() => {
    const m = {};
    (item?.palabras_clave || []).forEach((h) => { (m[h.segmento] = m[h.segmento] || []).push(h); });
    return m;
  }, [item]);

  useEffect(() => {
    refs.current[marcado]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [marcado]);

  if (!item?.transcripcion?.length) {
    return <p className="py-6 text-center text-sm text-stone-500">Sin transcripción.</p>;
  }
  const asesor = item.metadatos?.full_name || "Asesor";
  return (
    <div className={`scroll flex flex-col gap-2.5 overflow-y-auto pr-2 ${alto}`}>
      {item.transcripcion.map((seg, i) => {
        const deAsesor = esAsesor(seg);
        return (
          <div key={i} ref={(el) => { refs.current[i] = el; }} className={`flex ${deAsesor ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm transition-all ${deAsesor ? "rounded-tl-sm bg-stone-100" : "rounded-tr-sm bg-red-50"} ${marcado === i ? "ring-2 ring-amber-400" : ""}`}>
              <div className="mb-0.5 flex items-center gap-2 text-xs">
                <span className={`font-bold ${deAsesor ? "text-brand-dark" : "text-brand-red"}`}>{deAsesor ? asesor : "Cliente"}</span>
                <button type="button" disabled={!onSeek} onClick={() => onSeek?.(seg.start, i)}
                  className="text-stone-400 enabled:hover:text-brand-red enabled:hover:underline">
                  {mmss(seg.start)}
                </button>
              </div>
              <p className="leading-relaxed text-stone-800"><TextoResaltado texto={seg.text} hallazgos={porSegmento[i]} /></p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
