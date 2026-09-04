import { useContext } from "react";
import { Toaster } from "sonner";
import { UploadFile } from "../../../Icons/Iconos";
import { CriteriosContext } from "../../../Context/Criterios/ItemContext";
import { MVerProcesados } from "./Components/Modal/MVerProcesados";
import { MVerCalificados } from "./Components/Modal/MVerCalificados";
import { buttonSecondary } from "../../../utils/styles";

const steps = [
  { key: "received", label: "Archivo recibido" },
  { key: "queued", label: "En espera" },
  { key: "transcribing", label: "Transcripción" },
  { key: "reviewing", label: "Revisión de la llamada" },
  { key: "evaluating", label: "Evaluación" },
  { key: "completed", label: "Finalizado" },
];

const getJobPresentation = (job) => {
  if (job?.status === "completed") {
    return { index: 5, title: "Archivo procesado", description: "Los resultados de la evaluación están disponibles.", tone: "success" };
  }
  if (job?.status === "failed") {
    return { index: 0, title: "No se pudo procesar el archivo", description: job.error || "Vuelve a cargar el archivo para intentarlo nuevamente.", tone: "error" };
  }

  const stage = (job?.progress?.stage || "").toLowerCase();
  if (stage.includes("evaluando")) return { index: 4, title: "Evaluando la llamada", description: "Estamos aplicando los criterios de evaluación definidos.", tone: "processing" };
  if (stage.includes("diarizando") || stage.includes("alineando")) return { index: 3, title: "Identificando participantes", description: "Estamos organizando las intervenciones de la llamada.", tone: "processing" };
  if (stage.includes("transcribiendo") || stage.includes("convirtiendo")) return { index: 2, title: "Transcribiendo el audio", description: "Estamos convirtiendo la conversación en texto.", tone: "processing" };
  if (stage.includes("extrayendo") || job?.status === "started") return { index: 1, title: "Preparando el archivo", description: "Estamos verificando los audios contenidos en el archivo.", tone: "processing" };
  return { index: 1, title: "Archivo en espera", description: "El archivo fue recibido y será procesado en cuanto esté disponible.", tone: "processing" };
};

export const Procesamiento = () => {
  const { handleZip, inputRef, openMVerCalificacion, speechJob, processResultSucces } =
    useContext(CriteriosContext);
  const jobPresentation = speechJob ? getJobPresentation(speechJob) : null;

  return (
    <>
      <div className="sombra container-procesamiento-audios relative mx-auto flex max-w-5xl flex-col gap-8 rounded-2xl bg-white p-7 sm:p-10 transition-all duration-300">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-brand-red">Speech analytics</p>
          <h1 className="mt-1 text-2xl font-bold text-brand-dark">Procesamiento de audios</h1>
          <p className="mt-2 text-sm text-stone-500">Carga un archivo ZIP para transcribir y evaluar las llamadas.</p>
        </div>

        <div className="upload-file-procesamiento flex items-center justify-center py-3 sm:py-6">
          <div
            className="group relative w-full max-w-xl border-2 border-dashed border-stone-300 rounded-2xl px-8 py-14 bg-stone-50 hover:bg-red-50 hover:border-brand-red hover:shadow-soft transition-all duration-300 cursor-pointer flex flex-col items-center justify-center"
            onClick={() => inputRef.current?.click()}
          >
            <div className="flex flex-col items-center justify-center text-center">
              <div className="bg-red-100 text-brand-red p-5 rounded-full group-hover:bg-red-200 transition-all duration-300">
                <UploadFile className="text-5xl" />
              </div>
              <p className="mt-4 text-brand-dark font-semibold text-sm group-hover:text-brand-red transition-all">
                Selecciona o arrastra un archivo ZIP
              </p>
              <p className="text-xs text-gray-400 mt-1">
                El ZIP puede contener archivos .wav o .mp3
              </p>
            </div>

            {/* Input oculto */}
            <input
              type="file"
              accept=".zip"
              ref={inputRef}
              onChange={handleZip}
              className="hidden"
            />
          </div>
        </div>

        {speechJob && (
          <section className="rounded-2xl border border-stone-200 bg-stone-50 p-5 sm:p-6" aria-live="polite">
            <div className="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[.14em] text-stone-500">Seguimiento del archivo</p>
                <h2 className="mt-1 truncate text-base font-bold text-brand-dark">{speechJob.fileName || "Archivo cargado"}</h2>
                <p className="mt-1 text-sm text-stone-600">{jobPresentation.title}. {jobPresentation.description}</p>
              </div>
              <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${jobPresentation.tone === "success" ? "bg-emerald-100 text-emerald-700" : jobPresentation.tone === "error" ? "bg-red-100 text-red-700" : "bg-red-100 text-brand-red"}`}>
                {jobPresentation.tone === "success" ? "Completado" : jobPresentation.tone === "error" ? "Requiere atención" : "En proceso"}
              </span>
            </div>

            <ol className="mt-6 grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 lg:grid-cols-6">
              {steps.map((step, index) => {
                const isDone = index < jobPresentation.index;
                const isCurrent = index === jobPresentation.index;
                return (
                  <li key={step.key} className="flex items-center gap-2 text-xs font-medium text-stone-500">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] ${isDone ? "border-brand-red bg-brand-red text-white" : isCurrent ? "border-brand-red bg-red-50 text-brand-red" : "border-stone-300 bg-white text-stone-400"}`}>
                      {isDone ? "✓" : index + 1}
                    </span>
                    <span className={isCurrent ? "text-brand-dark" : ""}>{step.label}</span>
                  </li>
                );
              })}
            </ol>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-sm text-stone-600">
              <span>{speechJob.audioCount ? `${speechJob.audioCount} audios incluidos` : "Archivo preparado para su procesamiento"}</span>
              {speechJob.progress?.current ? <strong className="font-semibold text-brand-dark">Audio {speechJob.progress.current} de {speechJob.progress.total}</strong> : null}
              {speechJob.status === "completed" ? <button type="button" className="font-semibold text-brand-red hover:underline" onClick={openMVerCalificacion}>Ver resultados</button> : null}
            </div>
          </section>
        )}

        <div className="buttons-actions-procesa flex border-t border-stone-200 pt-6">
          <button
            type="button"
            className={buttonSecondary}
            onClick={openMVerCalificacion}
            disabled={processResultSucces.length === 0}
          >
            Ver resultados procesados
          </button>
        </div>
      </div>

      <MVerProcesados />
      <MVerCalificados />
    </>
  );
};
