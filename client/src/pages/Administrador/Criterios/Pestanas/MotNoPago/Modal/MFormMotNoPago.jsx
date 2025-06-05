import { useContext } from "react";
import { Close, Down } from "../../../../../../Icons/Iconos";
import {
  buttonSecondary,
  buttonSubmit,
  inputBorder,
  labelBorder,
} from "../../../../../../utils/styles";
import { SCartera } from "../Select/SCartera";
import { CriteriosContext } from "../../../../../../Context/Criterios/ItemContext";

export const MFormMotNoPago = () => {
  const {
    refMNMotPago,
    modalMNMotPago,
    closeModalNMotNoPago,
    modoNMotPago,
    formNMotPago,
    handleFormNMotPago,
    isPostingNMotNoPago,
    submitFormNMotNoPago,
    updateFormNMotNoPago,
    refSCartera,
    handleSelectCarteraMotNPago,
    inputCarteraMNP,
    filtrarCarterasMotNoPago,
    selectCarteraMNP,
  } = useContext(CriteriosContext);

  return (
    <div
      className={`modal-CrrearProducto-container fixed w-full h-full top-0 bottom-0 left-0 right-0 z-[1001] bg-[rgba(0,0,0,0.6)] transition-all duration-300 ${
        modalMNMotPago ? "visible" : "invisible"
      }`}
    >
      <div
        ref={isPostingNMotNoPago ? null : refMNMotPago}
        className={`modal-CrrearProducto w-[45%] h-full block absolute top-0 right-0 bottom-0 bg-gray-50 transition-all duration-300 ${
          modalMNMotPago ? "translate-x-[0%]" : "translate-x-[100%]"
        }`}
      >
        <form
          onSubmit={
            modoNMotPago === "new" ? submitFormNMotNoPago : updateFormNMotNoPago
          }
          autoComplete="off"
          className="scroll cont-form w-full h-full relative flex flex-col gap-5 border-none p-6 overflow-y-auto transition-all duration-300"
        >
          {/* HEADER */}
          <div className="form-header w-full flex justify-between items-center text-xl text-[#344767] font-semibold">
            <h1 className="">
              {modoNMotPago === "new"
                ? "Crear Motivo de No Pago"
                : "Editar Motivo de No Pago"}
            </h1>
            <button
              type="button"
              onClick={closeModalNMotNoPago}
              className="cursor-pointer"
              disabled={isPostingNMotNoPago}
            >
              <Close />
            </button>
          </div>

          {/* DELIMITER */}
          <hr />

          {/* FORM */}
          <div className="cont-forms flex-1 overflow-y-auto flex flex-col gap-5 py-1">
            <div className="container-input-nombreMotivo relative w-ful">
              <input
                type="text"
                id="nombreMotivo"
                name="nombreMotivo"
                className={inputBorder}
                placeholder=" "
                value={formNMotPago.nombreMotivo}
                onChange={handleFormNMotPago}
                disabled={isPostingNMotNoPago}
                required
              />
              <label htmlFor="nombreMotivo" className={labelBorder}>
                Motivo No Pago
              </label>
            </div>
            <div
              ref={refSCartera}
              onClick={handleSelectCarteraMotNPago}
              className="container-input-carteraItem relative w-ful"
            >
              <input
                type="text"
                id="carteraItem"
                name="carteraItem"
                className={inputBorder}
                placeholder=""
                value={inputCarteraMNP}
                onChange={filtrarCarterasMotNoPago}
                disabled={isPostingNMotNoPago}
                required
              />
              <label htmlFor="carteraItem" className={labelBorder}>
                Cartera Asociada
              </label>

              <Down
                className={`absolute right-2 top-[35%] ${
                  selectCarteraMNP ? "rotate-180 text-[#09c]" : ""
                }`}
              />

              {isPostingNMotNoPago ? null : <SCartera />}
            </div>

            {modoNMotPago === "edit" && (
              <div className="container-estado-item flex gap-4 items-center bg-transparent">
                <h6 className="text-sm leading-[1.625] font-bold tracking-[0.0075em] text-gray-500">
                  Estado:
                </h6>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">
                    {formNMotPago.idEstado ? "Activo" : "Inactivo"}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer w-12 h-6">
                    <input
                      type="checkbox"
                      id="idEstado"
                      name="idEstado"
                      checked={formNMotPago.idEstado || false}
                      onChange={handleFormNMotPago}
                      className="sr-only peer"
                    />
                    <div className="w-full h-full bg-rose-400 rounded-full peer-checked:bg-emerald-500 transition-colors duration-300 relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform after:duration-300 peer-checked:after:translate-x-6" />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Buttoncs */}
          <div className="relative flex w-full justify-end gap-5">
            <button
              type="button"
              className={buttonSecondary}
              onClick={closeModalNMotNoPago}
              disabled={isPostingNMotNoPago}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={buttonSubmit}
              disabled={isPostingNMotNoPago}
            >
              {isPostingNMotNoPago
                ? modoNMotPago === "new"
                  ? "Creando..."
                  : "Actualizando..."
                : modoNMotPago === "new"
                ? "Crear Accion"
                : "Editar Accion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
