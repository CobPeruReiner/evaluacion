import { MFormMotNoPago } from "./Modal/MFormMotNoPago";
import { TMotNoPago } from "./Table/TMotNoPago";

export const MotNoPago = () => {
  return (
    <>
      <div className="relative">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Motivos de No Pago
        </h1>

        {/* TABLE */}
        <div className="container-table scroll w-full relative flex flex-col overflow-y-hidden gap-5">
          <TMotNoPago />
        </div>
      </div>

      <MFormMotNoPago />
    </>
  );
};
