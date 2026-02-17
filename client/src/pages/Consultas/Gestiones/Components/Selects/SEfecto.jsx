import { useContext } from "react";
import { MonitoreoContext } from "../../../../../Context/Monitoreo/MonitoreoContext";

export const SEfecto = () => {
  const {
    selectEfecto,
    efectosFiltrados = [],
    efectosAgrupados = [],
    toggleEfecto,
    toggleTodosEfectos,
    filterGestiones,
  } = useContext(MonitoreoContext);

  const todosSeleccionados =
    efectosAgrupados.length > 0 &&
    filterGestiones?.idEfectos?.length ===
      efectosAgrupados.flatMap((e) => e.IDS).length;

  return (
    <div
      className={`scroll h-auto max-h-36 absolute top-11 left-0 right-0 border bg-gradient-to-br from-white shadow-[rgba(96,125,139,.1)] bg-[hsl(0_0%_100%)] shadow-lg p-3 rounded-md z-10 overflow-auto ${
        selectEfecto ? "visible" : "invisible"
      }`}
    >
      <div className="text-xs flex flex-col gap-2">
        <label className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer border-b">
          <input
            type="checkbox"
            checked={todosSeleccionados}
            onChange={toggleTodosEfectos}
          />
          <span className="font-semibold">Todos los efectos</span>
        </label>

        {efectosFiltrados.length === 0 ? (
          <p className="px-3 py-2 text-gray-500">No se encontraron efectos</p>
        ) : (
          efectosFiltrados.map((efecto) => {
            const checked = efecto.IDS.every((id) =>
              filterGestiones.idEfectos.includes(id),
            );

            return (
              <label
                key={efecto.EFECTO}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleEfecto(efecto)}
                />
                <span>{efecto.EFECTO}</span>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
};
