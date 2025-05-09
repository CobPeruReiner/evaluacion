import { MFormTLlamada } from "./Modal/MFormTLlamada";
import { TTiposLlamadas } from "./Table/TTiposLlamadas";

export const TiposLlamadas = () => {
  return (
    <>
      <div className="relative">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Tipos de Llamdas
        </h1>

        {/* TABLE */}
        <div className="container-table scroll w-full relative flex flex-col overflow-y-hidden gap-5">
          <TTiposLlamadas />
        </div>
      </div>

      <MFormTLlamada />
    </>
  );
};
