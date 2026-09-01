import { useContext } from "react";
import { CriteriosContext } from "../../../../../../Context/Criterios/ItemContext";

export const SCriterios = () => {
  const { criteriosFiltrados, criterioAsocSelected, selectCarteraAcciones } =
    useContext(CriteriosContext);

  return (
    <div
      className={`scroll h-auto max-h-60 absolute top-11 left-0 right-0 border bg-gradient-to-br from-white shadow-[rgba(96,125,139,.1)] bg-[hsl(0_0%_100%)] shadow-lg p-3 rounded-md z-10 overflow-auto ${
        selectCarteraAcciones ? "visible" : "invisible"
      }`}
    >
      <div className="relative text-xs flex flex-col gap-3">
        <div className="select-header w-full relative flex text-[rgb(96_125_139/1)] border-b border-gray-400">
          <p className="relative px-3 py-2">ITEM</p>
          <p className="relative px-3 py-2">-</p>
          <p className="relative px-3 py-2">CRITERIO</p>
          <p className="relative px-3 py-2">-</p>
          <p className="relative px-3 py-2">CARTERA ASOC</p>
        </div>
        {criteriosFiltrados.length === 0 ? (
          <p className="text-xs text-[rgb(96_125_139/1)] px-3 py-2 hover:bg-gray-200 cursor-pointer">
            No se encontraron criterios
          </p>
        ) : (
          <>
            {criteriosFiltrados.map((item) => (
              <p
                key={item.ID_CRITERIO}
                className="text-xs text-[rgb(96_125_139/1)] px-3 py-2 hover:bg-gray-200 cursor-pointer"
                onClick={() => criterioAsocSelected(item)}
              >
                {item.NOMBRE_ITEM} - {item.NOMBRE} - {item.NOMBRE_CARTERA}
              </p>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
