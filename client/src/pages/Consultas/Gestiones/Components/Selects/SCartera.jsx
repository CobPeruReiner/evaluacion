import { useContext } from "react";
import { MonitoreoContext } from "../../../../../Context/Monitoreo/MonitoreoContext";

export const SCartera = () => {
  const { selectCartera, carterasFiltradas, seleccionarCartera } =
    useContext(MonitoreoContext);

  return (
    <div
      className={`scroll h-auto max-h-36 absolute top-11 left-0 right-0 border bg-gradient-to-br from-white shadow-[rgba(96,125,139,.1)] bg-[hsl(0_0%_100%)] shadow-lg p-3 rounded-md z-50 overflow-auto ${
        selectCartera ? "visible" : "invisible"
      }`}
    >
      <div className="relative text-xs flex flex-col gap-3">
        {carterasFiltradas?.map((cartera) => (
          <p
            key={cartera.id_cartera}
            className="text-xs text-[rgb(96_125_139/1)] px-3 py-2 hover:bg-gray-200 cursor-pointer"
            onClick={() => seleccionarCartera(cartera)}
          >
            {cartera.cartera}
          </p>
        ))}
      </div>
    </div>
  );
};
