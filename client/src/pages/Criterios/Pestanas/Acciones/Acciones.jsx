import { MFormAcciones } from "./Modal/MFormAcciones";
import { TAcciones } from "./Table/TAcciones";

export const Acciones = () => {
  return (
    <>
      <div className="relative">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Lista de Acciones
        </h1>

        {/* TABLE */}
        <div className="container-table scroll w-full relative flex flex-col overflow-y-hidden gap-5">
          <TAcciones />
        </div>
      </div>

      <MFormAcciones />
    </>
  );
};
