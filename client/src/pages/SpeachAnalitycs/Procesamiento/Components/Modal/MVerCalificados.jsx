import { useContext, useState } from "react";
import moment from "moment";
import { CriteriosContext } from "../../../../../Context/Criterios/ItemContext";
import { Loader } from "../../../../../components/Loader";
import { Close, Pause, Play } from "../../../../../Icons/Iconos";
import { Conversacion } from "../../../Evaluacion/Conversacion";
import { EvaluacionAgente } from "../../../Evaluacion/EvaluacionAgente";
import { EvaluacionLegado } from "../../../Evaluacion/EvaluacionLegado";
import { claseResultado, colorPuntaje, esEvaluacionAgente, resumenDe } from "../../../Evaluacion/evaluacionUtils";

const pestanaClase = (activa) =>
  `relative px-4 py-3 text-sm font-semibold border-b-2 transition-all duration-300 ${
    activa ? "border-brand-red text-brand-red" : "border-transparent text-stone-400 hover:text-brand-dark"
  }`;

export const MVerCalificados = () => {
  const {
    processResultSucces,
    processResultFailed,
    audioActivo,
    seleccionarAudio,
    refMVerCalificacion,
    mVerCalificacion,
    closeMVerCalificacion,
    isPlaying,
    audioEnReproduccion,
    reproducirAudio,
  } = useContext(CriteriosContext);
  const [pestana, setPestana] = useState("calificacion");

  if (!processResultSucces || !processResultFailed) return null;

  const rawFecha = processResultSucces[0]?.metadatos?.fecha;
  const fechaGlobal = rawFecha ? moment(rawFecha, "YYYYMMDD").format("DD/MM/YYYY") : "Sin fecha";
  const cantidadFallidos = processResultFailed.length;
  const activo = audioActivo !== null ? processResultSucces[audioActivo] : null;
  const evaluados = processResultSucces.map((i) => resumenDe(i.evaluacion)).filter(Boolean);
  const promedio = evaluados.length
    ? evaluados.reduce((s, r) => s + Number(r.cumplimiento_total || 0), 0) / evaluados.length : null;
  const promesas = processResultSucces.filter((i) => i.evaluacion?.promesa_pago?.hay_promesa).length;

  return (
    <div className={`fixed inset-0 z-[202] flex items-center justify-center bg-[rgba(0,0,0,0.4)] transition-all duration-500 ${mVerCalificacion ? "visible" : "invisible"}`}>
      <div
        ref={refMVerCalificacion}
        className={`flex h-[88%] max-h-[92vh] w-[92%] max-w-7xl flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-lg transition-transform duration-500 ${mVerCalificacion ? "translate-y-0" : "translate-y-[600%]"}`}
      >
        <div className="relative flex flex-wrap items-end justify-between gap-3 pr-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-brand-red">Speech analytics</p>
            <h1 className="text-xl font-bold text-brand-dark">Resultados del procesamiento</h1>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-stone-100 px-3 py-1 font-semibold text-stone-700">{processResultSucces.length} audios · {fechaGlobal}</span>
            {promedio !== null && <span className="rounded-full px-3 py-1 font-bold text-white" style={{ background: colorPuntaje(promedio) }}>Promedio {promedio.toFixed(1)}%</span>}
            <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-700">{promesas} promesa{promesas === 1 ? "" : "s"} de pago</span>
            {cantidadFallidos > 0 && <span className="rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-800">{cantidadFallidos} con incidencia</span>}
          </div>
          <Close onClick={closeMVerCalificacion} className="absolute right-0 top-0 cursor-pointer text-xl" />
        </div>
        <hr />

        <div className="flex h-full w-full gap-4 overflow-hidden">
          {processResultSucces.length > 0 ? (
            <>
              {/* Lista de audios */}
              <div className="flex w-1/3 min-w-[260px] flex-col gap-2 rounded-xl border border-stone-200 p-3">
                <div className="scroll flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
                  {processResultSucces.map((item, index) => {
                    const resumen = resumenDe(item.evaluacion);
                    const hora = item.metadatos?.hora ? `${item.metadatos.hora.slice(0, 2)}:${item.metadatos.hora.slice(2, 4)}` : "";
                    return (
                      <div key={index} onClick={() => seleccionarAudio(index)}
                        className={`flex cursor-pointer flex-col gap-1 rounded-lg border p-3 transition-all duration-300 hover:bg-stone-50 ${audioActivo === index ? "border-brand-red bg-red-50/50" : "border-stone-200 bg-white"}`}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold text-brand-dark">{item.metadatos?.full_name || "Asesor"}</span>
                          {resumen && <span className="text-sm font-bold" style={{ color: colorPuntaje(resumen.cumplimiento_total) }}>{Number(resumen.cumplimiento_total).toFixed(1)}%</span>}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                          {resumen
                            ? <span className={`rounded-full px-2 py-0.5 font-semibold ${claseResultado(resumen.resultado || resumen.estado_global)}`}>{resumen.resultado || resumen.estado_global}</span>
                            : <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">{item.evaluacion?.mensaje ? "Sin calificar" : "Transcripción disponible"}</span>}
                          {item.evaluacion?.promesa_pago?.hay_promesa && <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">Promesa</span>}
                          {resumen?.requiere_revision && <i className="pi pi-exclamation-circle text-amber-500" title="Tiene criterios para revisión" />}
                        </div>
                        <div className="flex items-center justify-between text-xs text-stone-500">
                          <span>{item.metadatos?.telefono || ""} {hora && `· ${hora}`}</span>
                          <button type="button" onClick={(e) => { e.stopPropagation(); reproducirAudio(item.archivo, index); }}>
                            {audioEnReproduccion === index && isPlaying
                              ? <Pause className="cursor-pointer text-stone-500 hover:text-brand-red" />
                              : <Play className="cursor-pointer text-stone-500 hover:text-brand-red" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {cantidadFallidos > 0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
                      <p className="font-semibold text-amber-900">Incidencias</p>
                      {processResultFailed.map((item, index) => (
                        <p key={`${item.archivo || "audio"}-${index}`} className="mt-2 text-amber-900">
                          <strong>{item.archivo || `Audio ${index + 1}`}:</strong> {item.error || "No se pudo completar el procesamiento."}
                          {item.etapa ? <span className="block text-xs">Etapa: {item.etapa}</span> : null}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Detalle del audio seleccionado */}
              <div className="flex w-2/3 flex-col overflow-hidden rounded-xl border border-stone-200">
                {activo ? (
                  <>
                    <div className="flex gap-2 border-b border-stone-200 px-3">
                      <button type="button" className={pestanaClase(pestana === "calificacion")} onClick={() => setPestana("calificacion")}>Calificación</button>
                      <button type="button" className={pestanaClase(pestana === "conversacion")} onClick={() => setPestana("conversacion")}>Conversación</button>
                    </div>
                    <div className="scroll flex-1 overflow-y-auto p-4">
                      {pestana === "calificacion"
                        ? (esEvaluacionAgente(activo.evaluacion)
                          ? <EvaluacionAgente evaluacion={activo.evaluacion} transcripcion={activo.transcripcion} />
                          : <EvaluacionLegado evaluacion={activo.evaluacion} />)
                        : <Conversacion item={activo} alto="" />}
                    </div>
                  </>
                ) : (
                  <p className="m-auto text-sm text-stone-500">Selecciona un audio para ver su calificación y conversación.</p>
                )}
              </div>
            </>
          ) : cantidadFallidos > 0 ? (
            <div className="w-full overflow-y-auto rounded-lg border border-stone-200 bg-white p-5">
              <h2 className="text-base font-semibold text-stone-800">Detalle de incidencias</h2>
              <div className="mt-4 space-y-3">
                {processResultFailed.map((item, index) => (
                  <article key={`${item.archivo || "audio"}-${index}`} className="rounded-md border border-amber-200 bg-amber-50 p-4">
                    <p className="font-medium text-stone-800">{item.archivo || `Audio ${index + 1}`}</p>
                    <p className="mt-1 text-sm text-stone-600">{item.error || "No se pudo completar el procesamiento."}</p>
                    {item.etapa ? <p className="mt-1 text-xs text-stone-500">Etapa: {item.etapa}</p> : null}
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <Loader height="h-20" width="w-20" />
          )}
        </div>
      </div>
    </div>
  );
};
