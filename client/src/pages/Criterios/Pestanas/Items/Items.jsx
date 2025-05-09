import { useContext } from "react";
import { buttonSubmit } from "../../../../utils/styles";
import { TItems } from "./Table/TItems";
import { CriteriosContext } from "../../../../Context/Criterios/ItemContext";
import { Loader } from "../../../../components/Loader";
import { SCantItems } from "./Select/SCantItems";
import { Pagination } from "./Pagination/Pagination";

export const Items = () => {
  const { openModalNItem, loadingItems } = useContext(CriteriosContext);

  return (
    <>
      <div className="container-modulo-imtes relative flex flex-col gap-5">
        {/* TITLE */}
        <h1 className="text-2xl font-bold text-gray-800">Lista de Ítems</h1>

        {/* BUTTON ADD */}
        <div className="flex justify-end">
          <button
            onClick={() => openModalNItem("new")}
            className={buttonSubmit}
          >
            Nuevo Ítem
          </button>
        </div>

        {/* TABLE */}
        <div className="container-table scroll w-full relative flex flex-col overflow-y-hidden gap-5">
          {loadingItems ? (
            <Loader />
          ) : (
            <>
              <SCantItems />
              <TItems />
              <Pagination />
            </>
          )}
        </div>
      </div>
    </>
  );
};
