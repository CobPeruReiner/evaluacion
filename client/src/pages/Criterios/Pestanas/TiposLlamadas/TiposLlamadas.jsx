import { useContext } from "react";
import { TTiposLlamadas } from "./Table/TTiposLlamadas";
import { CriteriosContext } from "../../../../Context/Criterios/ItemContext";
import { buttonSubmit } from "../../../../utils/styles";
import { Loader } from "../../../../components/Loader";
import { Pagination } from "./Pagination/Pagination";
import { SCantTipoLlamada } from "./Select/SCantTipoLlamada";

export const TiposLlamadas = () => {
  const { loadingTiposLlamada, openModalTipoLlamada } =
    useContext(CriteriosContext);

  return (
    <>
      <div className="container-modulo-tipoLLamadas relative flex flex-col gap-5">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Tipos de Llamadas
        </h1>

        {/* BUTTON ADD */}
        <div className="flex justify-end">
          <button
            onClick={() => openModalTipoLlamada("new")}
            className={buttonSubmit}
          >
            Nuevo Tipo
          </button>
        </div>

        {/* TABLE */}
        <div className="container-table scroll w-full relative flex flex-col overflow-y-hidden gap-5">
          {loadingTiposLlamada ? (
            <Loader />
          ) : (
            <>
              <SCantTipoLlamada />
              <TTiposLlamadas />
              <Pagination />
            </>
          )}
        </div>
      </div>
    </>
  );
};
