import { useContext } from "react";
import { Close, Down } from "../../../../../../Icons/Iconos";
import {
  buttonSecondary,
  buttonSubmit,
  inputBorder,
  labelBorder,
} from "../../../../../../utils/styles";
import { SItem } from "../Select/SItem";
import { toast } from "sonner";
import { CriteriosContext } from "../../../../../../Context/Criterios/ItemContext";

export const MFormCriterio = () => {
  const {
    modalNCriterio,
    refMNCriterio,
    isPostingNCriterio,
    modoNCriterio,
    submitFormNCriterio,
    updateFormNCriterio,
    closeModalNCriterio,
    formNCriterio,
    handleInputChangeFormNCriterio,
    setFormNCriterio,
    inputItemAsoc,
    selectItemCriterio,
    refSItem,
    handleSelectItem,
    filtrarItems,
  } = useContext(CriteriosContext);

  return (
    <div
      className={`modal-CrrearProducto-container fixed w-full h-full top-0 bottom-0 left-0 right-0 z-[1001] bg-[rgba(0,0,0,0.6)] transition-all duration-300 ${
        modalNCriterio ? "visible" : "invisible"
      }`}
    >
      <div
        ref={isPostingNCriterio ? null : refMNCriterio}
        className={`modal-CrrearProducto w-[45%] h-full block absolute top-0 right-0 bottom-0 bg-gray-50 transition-all duration-300 ${
          modalNCriterio ? "translate-x-[0%]" : "translate-x-[100%]"
        }`}
      >
        <form
          onSubmit={
            modoNCriterio === "new" ? submitFormNCriterio : updateFormNCriterio
          }
          autoComplete="off"
          className="scroll cont-form w-full h-full relative flex flex-col gap-5 border-none p-6 overflow-y-auto transition-all duration-300"
        >
          {/* HEADER */}
          <div className="form-header w-full flex justify-between items-center text-xl text-[#344767] font-semibold">
            <h1 className="">
              {modoNCriterio === "new" ? "Crear Criterio" : "Editar Criterio"}
            </h1>
            <button
              type="button"
              onClick={closeModalNCriterio}
              className="cursor-pointer"
              disabled={isPostingNCriterio}
            >
              <Close />
            </button>
          </div>

          {/* DELIMITER */}
          <hr />

          {/* FORM */}
          <div className="cont-forms flex-1 overflow-y-auto flex flex-col gap-5 py-1">
            <div className="container-input-nombreCriterio relative w-ful">
              <input
                type="text"
                id="nombreCriterio"
                name="nombreCriterio"
                className={inputBorder}
                placeholder=" "
                value={formNCriterio.nombreCriterio}
                onChange={handleInputChangeFormNCriterio}
                disabled={isPostingNCriterio}
                required
              />
              <label htmlFor="nombreCriterio" className={labelBorder}>
                Nombre del Criterio
              </label>
            </div>
            <div className="container-input-pesoCriterio relative w-ful">
              <input
                type="text"
                id="pesoCriterio"
                name="pesoCriterio"
                className={inputBorder}
                placeholder=" "
                value={formNCriterio.pesoCriterio}
                onChange={(e) => {
                  const valor = e.target.value;

                  if (/^\d{0,3}$/.test(valor)) {
                    const num = parseInt(valor, 10);

                    if (!isNaN(num) && num >= 1 && num <= 100) {
                      setFormNCriterio({ ...formNCriterio, pesoCriterio: num });
                    } else if (valor === "") {
                      setFormNCriterio({ ...formNCriterio, pesoCriterio: "" });
                    }
                  }
                }}
                onBlur={() => {
                  if (!formNCriterio.pesoCriterio) {
                    toast.error("El peso debe estar entre 1% y 100%");
                  }
                }}
                disabled={isPostingNCriterio}
                required
              />
              <label htmlFor="pesoCriterio" className={labelBorder}>
                Peso del Criterio
              </label>

              {/* Símbolo % */}
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                %
              </span>
            </div>
            <div
              ref={refSItem}
              onClick={handleSelectItem}
              className="container-input-itemAsoc relative w-ful"
            >
              <input
                type="text"
                id="itemAsoc"
                name="itemAsoc"
                className={inputBorder}
                placeholder=""
                value={inputItemAsoc}
                onChange={filtrarItems}
                disabled={isPostingNCriterio}
                required
              />
              <label htmlFor="itemAsoc" className={labelBorder}>
                Item Asociado
              </label>

              <Down
                className={`absolute right-2 top-[35%] ${
                  selectItemCriterio ? "rotate-180 text-[#09c]" : ""
                }`}
              />

              {isPostingNCriterio ? null : <SItem />}
            </div>

            {modoNCriterio === "edit" && (
              <div className="container-estado-item flex gap-4 items-center bg-transparent">
                <h6 className="text-sm leading-[1.625] font-bold tracking-[0.0075em] text-gray-500">
                  Estado:
                </h6>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">
                    {formNCriterio.idEstado ? "Activo" : "Inactivo"}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer w-12 h-6">
                    <input
                      type="checkbox"
                      id="idEstado"
                      name="idEstado"
                      checked={formNCriterio.idEstado || false}
                      onChange={handleInputChangeFormNCriterio}
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
              onClick={closeModalNCriterio}
              disabled={isPostingNCriterio}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={buttonSubmit}
              disabled={isPostingNCriterio}
            >
              {isPostingNCriterio ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
