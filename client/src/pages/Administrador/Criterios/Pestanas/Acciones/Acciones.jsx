import { useContext } from "react";
import { CriteriosContext } from "../../../../../Context/Criterios/ItemContext";
import { buttonSubmit } from "../../../../../utils/styles";
import { TAcciones } from "./Table/TAcciones";
import { Loader } from "../../../../../components/Loader";
import { Pagination } from "./Pagination/Pagination";
import { SCantAcciones } from "./Select/SCantAcciones";

export const Acciones = () => {
  const { openModalNAcciones, loadingAcciones } = useContext(CriteriosContext);

  return (
    <>
      <div className="container-modulo-acciones relative flex flex-col gap-5">
        <h1 className="text-2xl font-bold text-gray-800">Lista de Acciones</h1>

        {/* BUTTON ADD */}
        <div className="flex justify-end">
          <button
            onClick={() => openModalNAcciones("new")}
            className={buttonSubmit}
          >
            Nueva Accion
          </button>
        </div>

        {/* TABLE */}
        <div className="container-table scroll w-full relative flex flex-col overflow-y-hidden gap-5">
          {loadingAcciones ? (
            <Loader />
          ) : (
            <>
              <SCantAcciones />
              <TAcciones />
              <Pagination />
            </>
          )}
        </div>
      </div>
    </>
  );
};
