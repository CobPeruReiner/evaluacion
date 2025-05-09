import { MFormTipoGestion } from "./Modal/MFormTipoGestion";
import { TTipoGestion } from "./Table/TTipoGestion";

export const TiposGestion = () => {
  return (
    <>
      <div className="relative">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Tipos de Gestión
        </h1>

        {/* TABLE */}
        <div className="container-table scroll w-full relative flex flex-col overflow-y-hidden gap-5">
          <TTipoGestion />
        </div>
      </div>

      <MFormTipoGestion />
    </>
  );
};
