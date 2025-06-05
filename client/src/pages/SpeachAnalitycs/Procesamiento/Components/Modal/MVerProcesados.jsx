import { useContext } from "react";
import { CriteriosContext } from "../../../../../Context/Criterios/ItemContext";
import {
  buttonSecondary,
  buttonSubmit,
  inputBorder,
  labelBorder,
} from "../../../../../utils/styles";
import { Close, Down, MdAudiotrack } from "../../../../../Icons/Iconos";
import { SEfecto } from "../Select/SEfecto";

export const MVerProcesados = () => {
  const {
    sEfectoRef,
    selectEfecto,
    mProcesados,
    archivos,
    closeModalProcesador,
    inputEfecto,
    loadEfectosAudios,
    isPostingAudiosProcess,
    openSEfectoAudios,
    sendAudiosProcess,
  } = useContext(CriteriosContext);

  return (
    <>
      <div
        className={`fixed left-0 top-0 right-0 bottom-0 bg-[rgba(0,0,0,0.4)] z-[202] flex justify-center items-center transition-all duration-500 ${
          mProcesados ? "visible" : "invisible"
        }`}
      >
        <div
          className={`w-[60%] max-h-[90vh] bg-white rounded-md border border-gray-200 shadow-lg flex flex-col transition-transform duration-500 ${
            mProcesados ? "translate-y-0" : "translate-y-[600%]"
          }`}
        >
          {/* Encabezado */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
            <h1 className="relative text-[#344767] text-xl font-bold">
              Detalle del Incidente
            </h1>

            <button
              onClick={closeModalProcesador}
              disabled={isPostingAudiosProcess}
            >
              <Close />
            </button>
          </div>

          {/* Cuerpo scrollable */}
          <div className="overflow-y-auto px-4 py-2 flex-1 bg-gray-50 max-h-96">
            <table className="min-w-full text-sm text-left text-gray-600">
              <thead>
                <tr className="text-xs text-[#8392ab] text-left uppercase opacity-70 border-b border-solid border-[#e9ecef]">
                  <th className="py-2 px-4">Archivo</th>
                  <th className="py-2 px-4">Fecha</th>
                  <th className="py-2 px-4">Tamaño</th>
                </tr>
              </thead>
              <tbody>
                {archivos?.map((archivo, index) => (
                  <tr
                    key={index}
                    className="text-xs text-left leading-[1.5] font-normal border-b cursor-pointer hover:bg-gray-100"
                  >
                    <td className="py-2 px-4 flex items-center gap-2">
                      <MdAudiotrack className="text-[#09c]" />
                      <span className="truncate">{archivo?.nombre}</span>
                    </td>
                    <td className="py-2 px-4">{archivo?.fecha}</td>
                    <td className="py-2 px-4">{archivo?.tamaño}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer fijo */}
          <div className="container-footer flex justify-between items-center px-6 py-4 border-t bg-white transition-all duration-300">
            <div
              ref={sEfectoRef}
              className="seleccionar-efecto relative"
              onClick={openSEfectoAudios}
            >
              <input
                type="text"
                name="idEfecto"
                id="idEfecto"
                className={inputBorder}
                placeholder=" "
                value={inputEfecto}
                onChange={loadEfectosAudios}
                disabled={isPostingAudiosProcess}
              />
              <label htmlFor="idEfecto" className={labelBorder}>
                Seleccionar Efecto
              </label>

              <Down
                className={`absolute right-2 top-[35%] ${
                  selectEfecto ? "rotate-180 text-[#09c]" : ""
                }`}
              />

              {!isPostingAudiosProcess && <SEfecto />}
            </div>
            <div className="flex justify-between gap-3">
              <button
                type="button"
                className={buttonSecondary}
                onClick={closeModalProcesador}
                disabled={isPostingAudiosProcess}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={buttonSubmit}
                disabled={isPostingAudiosProcess}
                onClick={sendAudiosProcess}
              >
                {isPostingAudiosProcess ? "Procesando..." : "Procesar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
