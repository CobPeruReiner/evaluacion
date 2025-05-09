import React, { useContext } from "react";
import { CriteriosContext } from "../../../../../Context/Criterios/ItemContext";
import { Close, Down } from "../../../../../Icons/Iconos";
import {
  buttonSecondary,
  buttonSubmit,
  inputBorder,
  labelBorder,
} from "../../../../../utils/styles";
import { SCartera } from "../Select/SCartera";
import { toast } from "sonner";

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
