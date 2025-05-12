import { useContext } from "react";
import { Loader } from "../../../../components/Loader";
import { CriteriosContext } from "../../../../Context/Criterios/ItemContext";
import { buttonSubmit } from "../../../../utils/styles";
import { TCriterios } from "./Table/TCriterios";
import { Pagination } from "./Pagination/Pagination";
import { SCantCriterios } from "./Select/SCantCriterios";

export const Criterios = () => {
  const { openModalNCriterio, loadingCriterios } = useContext(CriteriosContext);

  return (
    <>
      <div className="relative flex flex-col gap-5">
        <h1 className="text-2xl font-bold text-gray-800">Lista de Criterios</h1>

        {/* BUTTON ADD */}
        <div className="flex justify-end">
          <button
            onClick={() => openModalNCriterio("new")}
            className={buttonSubmit}
          >
            Nuevo Criterio
          </button>
        </div>

        {/* TABLE */}
        <div className="container-table scroll w-full relative flex flex-col overflow-y-hidden gap-5">
          {loadingCriterios ? (
            <Loader />
          ) : (
            <>
              <SCantCriterios />
              <TCriterios />
              <Pagination />
            </>
          )}
        </div>
      </div>
    </>
  );
};
