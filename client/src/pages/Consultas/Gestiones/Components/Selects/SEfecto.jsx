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
      className={`scroll h-auto max-h-52 absolute top-[52px] left-0 right-0 border border-stone-200 bg-white shadow-soft p-2 rounded-lg z-20 overflow-auto ${
        selectEfecto ? "visible" : "invisible"
      }`}
    >
      <div className="text-xs flex flex-col gap-2">
        <label className="flex items-center gap-2 rounded-md px-3 py-2.5 hover:bg-red-50 cursor-pointer border-b border-stone-100">
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
                className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm hover:bg-red-50 cursor-pointer"
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
