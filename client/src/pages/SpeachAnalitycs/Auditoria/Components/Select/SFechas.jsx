import { useContext } from "react";
import { CriteriosContext } from "../../../../../Context/Criterios/ItemContext";

export const SFechas = () => {
  const { fechasActive, sFechasActive, seleccionarFechas } =
    useContext(CriteriosContext);

  return (
    <div
      className={`scroll h-auto max-h-60 absolute top-11 left-0 right-0 border bg-gradient-to-br from-white shadow-[rgba(96,125,139,.1)] bg-[hsl(0_0%_100%)] shadow-lg p-3 rounded-md z-10 overflow-auto ${
        sFechasActive ? "visible" : "invisible"
      }`}
    >
      <div className="relative text-xs flex flex-col gap-3">
        {fechasActive.length === 0 ? (
          <p className="text-xs text-[rgb(96_125_139/1)] px-3 py-2 hover:bg-gray-200 cursor-pointer">
            No se encontraron evaluaciones
          </p>
        ) : (
          <>
            {fechasActive.map((fecha, index) => (
              <p
                key={index}
                className="text-xs text-[rgb(96_125_139/1)] px-3 py-2 hover:bg-gray-200 cursor-pointer"
                onClick={() => seleccionarFechas(fecha)}
              >
                {fecha}
              </p>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
