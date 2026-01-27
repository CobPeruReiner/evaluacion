import { useContext } from "react";
import { CriteriosContext } from "../../../../../../Context/Criterios/ItemContext";

export const SCartera = () => {
  const {
    carterasCyCFiltradas,
    selectCarteraItem,
    formNItem,
    toggleCarteraItem,
  } = useContext(CriteriosContext);

  return (
    <div
      className={`absolute top-11 left-0 right-0 max-h-60 overflow-auto border bg-white shadow-lg p-3 rounded-md z-10 ${
        selectCarteraItem ? "visible" : "invisible"
      }`}
    >
      <div className="text-xs flex flex-col gap-2">
        {carterasCyCFiltradas.length === 0 ? (
          <p className="px-3 py-2 text-gray-500">No se encontraron carteras</p>
        ) : (
          carterasCyCFiltradas.map((item) => (
            <label
              key={item.id_cartera}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={formNItem.idCarteras.includes(item.id_cartera)}
                onChange={() => toggleCarteraItem(item)}
              />
              <span>
                {item.cliente} - {item.cartera}
              </span>
            </label>
          ))
        )}
      </div>
    </div>
  );
};
