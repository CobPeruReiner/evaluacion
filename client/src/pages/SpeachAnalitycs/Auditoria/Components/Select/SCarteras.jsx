import { useContext } from "react";
import { CriteriosContext } from "../../../../../Context/Criterios/ItemContext";

export const SCarteras = () => {
  const { carterasActive, sCarterasActive, seleccionarCartera } =
    useContext(CriteriosContext);

  return (
    <div
      className={`scroll h-auto max-h-60 absolute top-11 left-0 right-0 border bg-gradient-to-br from-white shadow-[rgba(96,125,139,.1)] bg-[hsl(0_0%_100%)] shadow-lg p-3 rounded-md z-10 overflow-auto ${
        sCarterasActive ? "visible" : "invisible"
      }`}
    >
      <div className="relative text-xs flex flex-col gap-3">
        {carterasActive.length === 0 ? (
          <p className="text-xs text-[rgb(96_125_139/1)] px-3 py-2 hover:bg-gray-200 cursor-pointer">
            No se encontraron carteras
          </p>
        ) : (
          <>
            {carterasActive.map((cartera) => (
              <p
                key={cartera.id}
                className="text-xs text-[rgb(96_125_139/1)] px-3 py-2 hover:bg-gray-200 cursor-pointer"
                onClick={() => seleccionarCartera(cartera)}
              >
                {cartera.nombre}
              </p>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
