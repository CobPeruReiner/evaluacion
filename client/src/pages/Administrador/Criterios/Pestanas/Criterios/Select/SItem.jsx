import { useContext } from "react";
import { CriteriosContext } from "../../../../../../Context/Criterios/ItemContext";

export const SItem = () => {
  const { itemsFiltrados, itemAscoCriterioSelected, selectItemCriterio } =
    useContext(CriteriosContext);

  return (
    <div
      className={`scroll h-auto max-h-60 absolute top-11 left-0 right-0 border bg-gradient-to-br from-white shadow-[rgba(96,125,139,.1)] bg-[hsl(0_0%_100%)] shadow-lg p-3 rounded-md z-10 overflow-auto ${
        selectItemCriterio ? "visible" : "invisible"
      }`}
    >
      <div className="relative text-xs flex flex-col gap-3">
        {itemsFiltrados.length === 0 ? (
          <p className="text-xs text-[rgb(96_125_139/1)] px-3 py-2 hover:bg-gray-200 cursor-pointer">
            No se encontraron items
          </p>
        ) : (
          <>
            {itemsFiltrados.map((item) => (
              <p
                key={item.ID_ITEM}
                className="text-xs text-[rgb(96_125_139/1)] px-3 py-2 hover:bg-gray-200 cursor-pointer"
                onClick={() => itemAscoCriterioSelected(item)}
              >
                {item.NOMBRE_ITEM} - {item.NOMBRE_CARTERA}
              </p>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
