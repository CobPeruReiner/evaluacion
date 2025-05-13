import { useContext } from "react";
import { Close, Down } from "../../../../../Icons/Iconos";
import {
  buttonSecondary,
  buttonSubmit,
  inputBorder,
  labelBorder,
} from "../../../../../utils/styles";
import { CriteriosContext } from "../../../../../Context/Criterios/ItemContext";
import { toast } from "sonner";
import { SCriterios } from "../Select/SCriterios";

export const MFormAcciones = () => {
  const {
    modoNAcciones,
    closeModalNAcciones,
    modalNAcciones,
    isPostingNAcciones,
    refMNAcciones,
    formNAcciones,
    setFormNAcciones,
    handleInputChangeFormNAcciones,
    refSCriterios,
    inputCarteraAccionesAsoc,
    selectCarteraAcciones,
    filtrarCriterios,
    handleSelectCriterio,
    submitFormNAcciones,
    updateFormNAcciones,
  } = useContext(CriteriosContext);

  return (
    <div
      className={`modal-CrrearProducto-container fixed w-full h-full top-0 bottom-0 left-0 right-0 z-[1001] bg-[rgba(0,0,0,0.6)] transition-all duration-300 ${
        modalNAcciones ? "visible" : "invisible"
      }`}
    >
      <div
        ref={isPostingNAcciones ? null : refMNAcciones}
        className={`modal-CrrearProducto w-[45%] h-full block absolute top-0 right-0 bottom-0 bg-gray-50 transition-all duration-300 ${
          modalNAcciones ? "translate-x-[0%]" : "translate-x-[100%]"
        }`}
      >
        <form
          onSubmit={
            modoNAcciones === "new" ? submitFormNAcciones : updateFormNAcciones
          }
          autoComplete="off"
          className="scroll cont-form w-full h-full relative flex flex-col gap-5 border-none p-6 overflow-y-auto transition-all duration-300"
        >
          {/* HEADER */}
          <div className="form-header w-full flex justify-between items-center text-xl text-[#344767] font-semibold">
            <h1 className="">
              {modoNAcciones === "new" ? "Crear Accion" : "Editar Accion"}
            </h1>
            <button
              type="button"
              onClick={closeModalNAcciones}
              className="cursor-pointer"
              disabled={isPostingNAcciones}
            >
              <Close />
            </button>
          </div>

          {/* DELIMITER */}
          <hr />

          {/* FORM */}
          <div className="cont-forms flex-1 overflow-y-auto flex flex-col gap-5 py-1">
            <div className="container-input-nombreAccion relative w-ful">
              <input
                type="text"
                id="nombreAccion"
                name="nombreAccion"
                className={inputBorder}
                placeholder=" "
                value={formNAcciones.nombreAccion}
                onChange={handleInputChangeFormNAcciones}
                disabled={isPostingNAcciones}
                required
              />
              <label htmlFor="nombreAccion" className={labelBorder}>
                Nombre de la Accion
              </label>
            </div>
            <div className="container-input-pesoAccion relative w-ful">
              <input
                type="text"
                id="pesoAccion"
                name="pesoAccion"
                className={inputBorder}
                placeholder=" "
                value={formNAcciones.pesoAccion}
                onChange={(e) => {
                  const valor = e.target.value;

                  if (/^\d{0,3}$/.test(valor)) {
                    const num = parseInt(valor, 10);

                    if (!isNaN(num) && num >= 0 && num <= 100) {
                      setFormNAcciones({ ...formNAcciones, pesoAccion: num });
                    } else if (valor === "") {
                      setFormNAcciones({ ...formNAcciones, pesoAccion: "" });
                    }
                  }
                }}
                onBlur={() => {
                  if (
                    formNAcciones.pesoAccion === "" ||
                    formNAcciones.pesoAccion < 0
                  ) {
                    toast.error("El peso debe estar entre 0% y 100%");
                  }
                }}
                disabled={isPostingNAcciones}
                required
              />
              <label htmlFor="pesoAccion" className={labelBorder}>
                Peso de la Accion
              </label>

              {/* Símbolo % */}
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                %
              </span>
            </div>
            <div
              ref={refSCriterios}
              onClick={handleSelectCriterio}
              className="container-input-carteraItem relative w-ful"
            >
              <input
                type="text"
                id="carteraItem"
                name="carteraItem"
                className={inputBorder}
                placeholder=""
                value={inputCarteraAccionesAsoc}
                onChange={filtrarCriterios}
                disabled={isPostingNAcciones}
                required
              />
              <label htmlFor="carteraItem" className={labelBorder}>
                Criterio Asociado
              </label>

              <Down
                className={`absolute right-2 top-[35%] ${
                  selectCarteraAcciones ? "rotate-180 text-[#09c]" : ""
                }`}
              />

              {isPostingNAcciones ? null : <SCriterios />}
            </div>
          </div>

          {/* Buttoncs */}
          <div className="relative flex w-full justify-end gap-5">
            <button
              type="button"
              className={buttonSecondary}
              onClick={closeModalNAcciones}
              disabled={isPostingNAcciones}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={buttonSubmit}
              disabled={isPostingNAcciones}
            >
              {isPostingNAcciones
                ? modoNAcciones === "new"
                  ? "Creando..."
                  : "Actualizando..."
                : modoNAcciones === "new"
                ? "Crear Accion"
                : "Editar Accion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
