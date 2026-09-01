import { useContext } from "react";
import { MonitoreoContext } from "../../../../../Context/Monitoreo/MonitoreoContext";

export const SCliente = () => {
  const { selectCliente, clientes, seleccionarCliente } =
    useContext(MonitoreoContext);

  return (
    <div
      className={`scroll h-auto max-h-52 absolute top-[52px] left-0 right-0 border border-stone-200 bg-white shadow-soft p-2 rounded-lg z-20 overflow-auto ${
        selectCliente ? "visible" : "invisible"
      }`}
    >
      <div className="relative text-xs flex flex-col gap-3">
        {clientes?.map((cliente) => (
          <p
            key={cliente.id_cliente}
            className="rounded-md px-3 py-2.5 text-sm text-stone-700 transition-colors hover:bg-red-50 hover:text-brand-red cursor-pointer"
            onClick={() => seleccionarCliente(cliente)}
          >
            {cliente.cliente}
          </p>
        ))}
      </div>
    </div>
  );
};
