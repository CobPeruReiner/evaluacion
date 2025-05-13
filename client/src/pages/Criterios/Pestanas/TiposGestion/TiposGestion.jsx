import { useContext } from "react";
import { TTipoGestion } from "./Table/TTipoGestion";
import { CriteriosContext } from "../../../../Context/Criterios/ItemContext";
import { buttonSubmit } from "../../../../utils/styles";
import { Loader } from "../../../../components/Loader";
import { SCantTipoGestion } from "./Select/SCantTipoGestion";
import { Pagination } from "./Pagination/Pagination";

export const TiposGestion = () => {
  const { loadingTiposGestion, openModalTipoGestion } =
    useContext(CriteriosContext);

  return (
    <>
      <div className="container-modulo-imtes relative flex flex-col gap-5">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Tipos de Gestión
        </h1>

        {/* BUTTON ADD */}
        <div className="flex justify-end">
          <button
            onClick={() => openModalTipoGestion("new")}
            className={buttonSubmit}
          >
            Nuevo Tipo
          </button>
        </div>

        {/* TABLE */}
        <div className="container-table scroll w-full relative flex flex-col overflow-y-hidden gap-5">
          {loadingTiposGestion ? (
            <Loader />
          ) : (
            <>
              <SCantTipoGestion />
              <TTipoGestion />
              <Pagination />
            </>
          )}
        </div>
      </div>
    </>
  );
};
