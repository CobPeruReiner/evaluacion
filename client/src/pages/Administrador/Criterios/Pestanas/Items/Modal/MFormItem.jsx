import React, { useContext } from "react";
import { Close, Down } from "../../../../../../Icons/Iconos";
import {
  buttonSecondary,
  buttonSubmit,
  inputBorder,
  labelBorder,
} from "../../../../../../utils/styles";
import { SCartera } from "../Select/SCartera";
import { toast } from "sonner";
import { CriteriosContext } from "../../../../../../Context/Criterios/ItemContext";

export const MFormItem = () => {
  const {
    modalNItem,
    modoNItem,
    refMNItem,
    closeModalNItem,
    isPostingNItem,
    submitFormNItem,
    updateFormNItem,
    refSCartera,
    selectCarteraItem,
    inputCarteraItemAsoc,
    handleSelectCartera,
    filtrarCarteras,
    formNItem,
    setFormNItem,
    handleInputChangeFormNItem,
  } = useContext(CriteriosContext);

  return (
    <div
      className={`modal-CrrearProducto-container fixed w-full h-full top-0 bottom-0 left-0 right-0 z-[1001] bg-[rgba(0,0,0,0.6)] transition-all duration-300 ${
        modalNItem ? "visible" : "invisible"
      }`}
    >
      <div
        ref={isPostingNItem ? null : refMNItem}
        className={`modal-CrrearProducto w-[45%] h-full block absolute top-0 right-0 bottom-0 bg-gray-50 transition-all duration-300 ${
          modalNItem ? "translate-x-[0%]" : "translate-x-[100%]"
        }`}
      >
        <form
          onSubmit={modoNItem === "new" ? submitFormNItem : updateFormNItem}
          autoComplete="off"
          className="scroll cont-form w-full h-full relative flex flex-col gap-5 border-none p-6 overflow-y-auto transition-all duration-300"
        >
          {/* HEADER */}
          <div className="form-header w-full flex justify-between items-center text-xl text-[#344767] font-semibold">
            <h1 className="">
              {modoNItem === "new" ? "Crear Item" : "Editar Item"}
            </h1>
            <button
              type="button"
              onClick={closeModalNItem}
              className="cursor-pointer"
              disabled={isPostingNItem}
            >
              <Close />
            </button>
          </div>

          {/* DELIMITER */}
          <hr />

          {/* FORM */}
          <div className="cont-forms flex-1 overflow-y-auto flex flex-col gap-5 py-1">
            <div className="container-input-nombreItem relative w-ful">
              <input
                type="text"
                id="nombreItem"
                name="nombreItem"
                className={inputBorder}
                placeholder=" "
                value={formNItem.nombreItem}
                onChange={handleInputChangeFormNItem}
                disabled={isPostingNItem}
                required
              />
              <label htmlFor="nombreItem" className={labelBorder}>
                Nombre del Ítem
              </label>
            </div>
            <div className="container-input-pesoItem relative w-ful">
              <input
                type="text"
                id="pesoItem"
                name="pesoItem"
                className={inputBorder}
                placeholder=" "
                value={formNItem.pesoItem}
                onChange={(e) => {
                  const valor = e.target.value;

                  if (/^\d{0,3}$/.test(valor)) {
                    const num = parseInt(valor, 10);

                    if (!isNaN(num) && num >= 1 && num <= 100) {
                      setFormNItem({ ...formNItem, pesoItem: num });
                    } else if (valor === "") {
                      setFormNItem({ ...formNItem, pesoItem: "" });
                    }
                  }
                }}
                onBlur={() => {
                  if (!formNItem.pesoItem) {
                    toast.error("El peso debe estar entre 1% y 100%");
                  }
                }}
                disabled={isPostingNItem}
                required
              />
              <label htmlFor="pesoItem" className={labelBorder}>
                Peso del Ítem
              </label>

              {/* Símbolo % */}
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                %
              </span>
            </div>
            <div
              ref={refSCartera}
              onClick={handleSelectCartera}
              className="container-input-carteraItem relative w-ful"
            >
              <input
                type="text"
                id="carteraItem"
                name="carteraItem"
                className={inputBorder}
                placeholder=""
                value={inputCarteraItemAsoc}
                onChange={filtrarCarteras}
                disabled={isPostingNItem}
                required
              />
              <label htmlFor="carteraItem" className={labelBorder}>
                Cartera Asociada
              </label>

              <Down
                className={`absolute right-2 top-[35%] ${
                  selectCarteraItem ? "rotate-180 text-[#09c]" : ""
                }`}
              />

              {isPostingNItem ? null : <SCartera />}
            </div>
            {modoNItem === "edit" && (
              <div className="container-estado-item flex gap-4 items-center bg-transparent">
                <h6 className="text-sm leading-[1.625] font-bold tracking-[0.0075em] text-gray-500">
                  Estado:
                </h6>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">
                    {formNItem.idEstado ? "Activo" : "Inactivo"}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer w-12 h-6">
                    <input
                      type="checkbox"
                      id="idEstado"
                      name="idEstado"
                      checked={formNItem.idEstado || false}
                      onChange={handleInputChangeFormNItem}
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
              onClick={closeModalNItem}
              disabled={isPostingNItem}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={buttonSubmit}
              disabled={isPostingNItem}
            >
              {isPostingNItem ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
