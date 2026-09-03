import { useContext } from "react";
import { Toaster } from "sonner";
import { UploadFile } from "../../../Icons/Iconos";
import { CriteriosContext } from "../../../Context/Criterios/ItemContext";
import { MVerProcesados } from "./Components/Modal/MVerProcesados";
import { MVerCalificados } from "./Components/Modal/MVerCalificados";
import { buttonSecondary } from "../../../utils/styles";

export const Procesamiento = () => {
  const { handleZip, inputRef, openMVerCalificacion, speechJob } =
    useContext(CriteriosContext);

  return (
    <>
      <div className="sombra container-procesamiento-audios relative mx-auto flex max-w-5xl flex-col gap-7 rounded-2xl bg-white p-5 sm:p-8 transition-all duration-300">
        <div><p className="text-xs font-bold uppercase tracking-[.16em] text-brand-red">Speech analytics</p><h1 className="mt-1 text-2xl font-bold text-brand-dark">Procesamiento de audios</h1><p className="mt-1 text-sm text-stone-500">Carga un archivo ZIP para transcribir y evaluar las llamadas.</p></div>

        <div className="upload-file-procesamiento flex-1 flex items-center justify-center min-h-[450px]">
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

        <div className="buttons-actions-procesa relative flex">
          <button
            type="button"
            className={buttonSecondary}
            onClick={openMVerCalificacion}
          >
            Ver Evaluados
          </button>
        </div>

        {speechJob && (
          <section className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-brand-dark" aria-live="polite">
            <p className="font-semibold">Lote en procesamiento</p>
            <p className="mt-1 text-stone-600">
              {speechJob.progress?.stage || "Esperando un worker disponible"}
              {speechJob.progress?.current ? ` · audio ${speechJob.progress.current} de ${speechJob.progress.total}` : ""}
              {speechJob.progress?.filename ? ` · ${speechJob.progress.filename}` : ""}
            </p>
          </section>
        )}
      </div>

      <MVerProcesados />
      <MVerCalificados />
    </>
  );
};
