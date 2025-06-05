import { useContext } from "react";
import { SkeletonText } from "../../../../../components/SkeletonText";
import { CriteriosContext } from "../../../../../Context/Criterios/ItemContext";

export const SEfecto = () => {
  const {
    selectEfecto,
    efectosAudios,
    loadingEfectosAudios,
    seleccionarEfectoAudios,
  } = useContext(CriteriosContext);

  return (
    <div
      className={`scroll h-auto max-h-40 min-w-60 absolute top-11 left-0 right-0 border bg-gradient-to-br from-white shadow-[rgba(96,125,139,.1)] bg-[hsl(0_0%_100%)] shadow-lg p-3 rounded-md z-10 overflow-auto transition-opacity duration-300 ease-in-out ${
        selectEfecto ? "visible opacity-100" : "invisible opacity-0"
      }`}
    >
      <div className="relative text-xs flex flex-col gap-3">
        {loadingEfectosAudios ? (
          <SkeletonText />
        ) : efectosAudios && efectosAudios.length > 0 ? (
          efectosAudios?.map((efecto) => (
            <p
              key={efecto.ID_EFECTO}
              className="text-xs text-[rgb(96_125_139/1)] px-3 py-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => seleccionarEfectoAudios(efecto)}
            >
              {efecto.EFECTO}
            </p>
          ))
        ) : (
          <p className="text-xs text-[rgb(96_125_139/1)] px-3 py-2 hover:bg-gray-200 cursor-pointer">
            No se encontraron efectos
          </p>
        )}
      </div>
    </div>
  );
};
