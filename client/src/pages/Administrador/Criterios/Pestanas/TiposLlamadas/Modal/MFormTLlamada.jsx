import { useContext } from "react";
import {
  buttonSecondary,
  buttonSubmit,
  inputBorder,
  labelBorder,
} from "../../../../../../utils/styles";
import { Close } from "../../../../../../Icons/Iconos";
import { CriteriosContext } from "../../../../../../Context/Criterios/ItemContext";

export const MFormTLlamada = () => {
  const {
    refTipoLlamada,
    modalTipoLlamada,
    modoTipoLlamada,
    isPostingTipoLlamada,
    updateFormTipoLlamada,
    submitFormTipoLlamada,
    closeModalTipoLlamada,
    formTipoLlamada,
    handleFormTipoLlamada,
  } = useContext(CriteriosContext);

  return (
    <div
      className={`modal-CrrearProducto-container fixed w-full h-full top-0 bottom-0 left-0 right-0 z-[1001] bg-[rgba(0,0,0,0.6)] transition-all duration-300 ${
        modalTipoLlamada ? "visible" : "invisible"
      }`}
    >
      <div
        ref={isPostingTipoLlamada ? null : refTipoLlamada}
        className={`modal-CrrearProducto w-[45%] h-full block absolute top-0 right-0 bottom-0 bg-gray-50 transition-all duration-300 ${
          modalTipoLlamada ? "translate-x-[0%]" : "translate-x-[100%]"
        }`}
      >
        <form
          onSubmit={
            modoTipoLlamada === "new"
              ? submitFormTipoLlamada
              : updateFormTipoLlamada
          }
          autoComplete="off"
          className="scroll cont-form w-full h-full relative flex flex-col gap-5 border-none p-6 overflow-y-auto transition-all duration-300"
        >
          {/* HEADER */}
          <div className="form-header w-full flex justify-between items-center text-xl text-[#344767] font-semibold">
            <h1 className="">
              {modoTipoLlamada === "new"
                ? "Crear Tipo de Llamada"
                : "Editar Tipo de Llamada"}
            </h1>
            <button
              type="button"
              onClick={closeModalTipoLlamada}
              className="cursor-pointer"
              disabled={isPostingTipoLlamada}
            >
              <Close />
            </button>
          </div>

          {/* DELIMITER */}
          <hr />

          {/* FORM */}
          <div className="cont-forms flex-1 overflow-y-auto flex flex-col gap-5 py-1">
            <div className="container-input-nombreGestion relative w-ful">
              <input
                type="text"
                id="nombreLlamada"
                name="nombreLlamada"
                className={inputBorder}
                placeholder=" "
                value={formTipoLlamada.nombreLlamada}
                onChange={handleFormTipoLlamada}
                disabled={isPostingTipoLlamada}
                required
              />
              <label htmlFor="nombreLlamada" className={labelBorder}>
                Tipo de Llamada
              </label>
            </div>

            {modoTipoLlamada === "edit" && (
              <div className="container-estado-item flex gap-4 items-center bg-transparent">
                <h6 className="text-sm leading-[1.625] font-bold tracking-[0.0075em] text-gray-500">
                  Estado:
                </h6>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">
                    {formTipoLlamada.idEstado ? "Activo" : "Inactivo"}
                  </span>

                  <label className="relative inline-flex items-center cursor-pointer w-12 h-6">
                    <input
                      type="checkbox"
                      id="idEstado"
                      name="idEstado"
                      checked={formTipoLlamada.idEstado || false}
                      onChange={handleFormTipoLlamada}
                      className="sr-only peer"
                    />
                    <div className="w-full h-full bg-rose-400 rounded-full peer-checked:bg-emerald-500 transition-colors duration-300 relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform after:duration-300 peer-checked:after:translate-x-6" />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* BOTONES */}
          <div className="relative flex w-full justify-end gap-5">
            <button
              type="button"
              className={buttonSecondary}
              onClick={closeModalTipoLlamada}
              disabled={isPostingTipoLlamada}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={buttonSubmit}
              disabled={isPostingTipoLlamada}
            >
              {isPostingTipoLlamada
                ? modoTipoLlamada === "new"
                  ? "Creando..."
                  : "Actualizando..."
                : modoTipoLlamada === "new"
                ? "Crear Llamada"
                : "Editar Llamada"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
