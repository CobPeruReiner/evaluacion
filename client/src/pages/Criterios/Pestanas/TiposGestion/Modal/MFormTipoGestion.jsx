import { useContext } from "react";
import { CriteriosContext } from "../../../../../Context/Criterios/ItemContext";
import { Close, Down } from "../../../../../Icons/Iconos";
import {
  buttonSecondary,
  buttonSubmit,
  inputBorder,
  labelBorder,
} from "../../../../../utils/styles";
import { SCartera } from "../Select/SCartera";

export const MFormTipoGestion = () => {
  const {
    refTipoGestion,
    modalTipoGestion,
    isPostingTipoGestion,
    modoTipoGestion,
    submitFormTipoGestion,
    updateFormTipoGestion,
    closeModalTipoGestion,
    formTipoGestion,
    handleFormTipoGestion,
    refSCarteraTipoGestion,
    handleSelectCarteraTipoGestion,
    inputCarteraTipoGestion,
    filtrarCarterasTipoGestion,
    selectCarteraTipoGestion,
  } = useContext(CriteriosContext);

  return (
    <div
      className={`modal-CrrearProducto-container fixed w-full h-full top-0 bottom-0 left-0 right-0 z-[1001] bg-[rgba(0,0,0,0.6)] transition-all duration-300 ${
        modalTipoGestion ? "visible" : "invisible"
      }`}
    >
      <div
        ref={isPostingTipoGestion ? null : refTipoGestion}
        className={`modal-CrrearProducto w-[45%] h-full block absolute top-0 right-0 bottom-0 bg-gray-50 transition-all duration-300 ${
          modalTipoGestion ? "translate-x-[0%]" : "translate-x-[100%]"
        }`}
      >
        <form
          onSubmit={
            modoTipoGestion === "new"
              ? submitFormTipoGestion
              : updateFormTipoGestion
          }
          autoComplete="off"
          className="scroll cont-form w-full h-full relative flex flex-col gap-5 border-none p-6 overflow-y-auto transition-all duration-300"
        >
          {/* HEADER */}
          <div className="form-header w-full flex justify-between items-center text-xl text-[#344767] font-semibold">
            <h1 className="">
              {modoTipoGestion === "new"
                ? "Crear Tipo de Gestion"
                : "Editar Tipo de Gestion"}
            </h1>
            <button
              type="button"
              onClick={closeModalTipoGestion}
              className="cursor-pointer"
              disabled={isPostingTipoGestion}
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
                id="nombreGestion"
                name="nombreGestion"
                className={inputBorder}
                placeholder=" "
                value={formTipoGestion.nombreGestion}
                onChange={handleFormTipoGestion}
                disabled={isPostingTipoGestion}
                required
              />
              <label htmlFor="nombreGestion" className={labelBorder}>
                Tipo de Gestion
              </label>
            </div>
            <div
              ref={refSCarteraTipoGestion}
              onClick={handleSelectCarteraTipoGestion}
              className="container-input-carteraItem relative w-ful"
            >
              <input
                type="text"
                id="carteraItem"
                name="carteraItem"
                className={inputBorder}
                placeholder=""
                value={inputCarteraTipoGestion}
                onChange={filtrarCarterasTipoGestion}
                disabled={isPostingTipoGestion}
                required
              />
              <label htmlFor="carteraItem" className={labelBorder}>
                Cartera Asociada
              </label>

              <Down
                className={`absolute right-2 top-[35%] ${
                  selectCarteraTipoGestion ? "rotate-180 text-[#09c]" : ""
                }`}
              />

              {isPostingTipoGestion ? null : <SCartera />}
            </div>
          </div>

          {/* Buttoncs */}
          <div className="relative flex w-full justify-end gap-5">
            <button
              type="button"
              className={buttonSecondary}
              onClick={closeModalTipoGestion}
              disabled={isPostingTipoGestion}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={buttonSubmit}
              disabled={isPostingTipoGestion}
            >
              {isPostingTipoGestion
                ? modoTipoGestion === "new"
                  ? "Creando..."
                  : "Actualizando..."
                : modoTipoGestion === "new"
                ? "Crear Accion"
                : "Editar Accion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
