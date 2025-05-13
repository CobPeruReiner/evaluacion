import { useContext } from "react";
import { buttonSubmit } from "../../../../utils/styles";
import { MFormMotNoPago } from "./Modal/MFormMotNoPago";
import { TMotNoPago } from "./Table/TMotNoPago";
import { CriteriosContext } from "../../../../Context/Criterios/ItemContext";
import { Loader } from "../../../../components/Loader";
import { SCantMotNoPago } from "./Select/SCantMotNoPago";
import { Pagination } from "./Pagination/Pagination";

export const MotNoPago = () => {
  const { loadingMotNoPago, openModalNMotNoPago } =
    useContext(CriteriosContext);

  return (
    <>
      <div className="container-modulo-motivosNoPago relative flex flex-col gap-5">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Motivos de No Pago
        </h1>

        {/* BUTTON ADD */}
        <div className="flex justify-end">
          <button
            onClick={() => openModalNMotNoPago("new")}
            className={buttonSubmit}
          >
            Nuevo Motivo
          </button>
        </div>

        {/* TABLE */}
        <div className="container-table scroll w-full relative flex flex-col overflow-y-hidden gap-5">
          {loadingMotNoPago ? (
            <Loader />
          ) : (
            <>
              <SCantMotNoPago />
              <TMotNoPago />
              <Pagination />
            </>
          )}
        </div>
      </div>

      <MFormMotNoPago />
    </>
  );
};
