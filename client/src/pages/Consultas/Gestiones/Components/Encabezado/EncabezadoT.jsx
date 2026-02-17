import { useContext } from "react";
import { Down, Search } from "../../../../../Icons/Iconos";
import { SCantGestiones } from "../Selects/SCantGestiones";
import { MonitoreoContext } from "../../../../../Context/Monitoreo/MonitoreoContext";

export const EncabezadoT = () => {
  const {
    refModalPageGestiones,
    handleModalPageGestiones,
    searchGestiones,
    gestionesPerPage,
    handeInputSearchGestiones,
  } = useContext(MonitoreoContext);

  return (
    <div className="relative flex items-center justify-between gap-5">
      <div
        ref={refModalPageGestiones}
        className="relative flex items-center text-xs text-[#8392ab] gap-2"
      >
        <div
          onClick={handleModalPageGestiones}
          className="cantidad-movimientos-pagindos relative flex items-center gap-3 border border-solid border-[#dadce0] rounded px-2 py-1"
        >
          <span className="">{gestionesPerPage}</span>
          <Down />
          <SCantGestiones />
        </div>
        <span className="">gestiones por página</span>
      </div>
      <div className="relative">
        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
          <Search />
        </div>
        <input
          type="search"
          id="default-search"
          className="block w-full px-9 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-[#09c] focus:border-[#09c] outline-none"
          placeholder="Buscar gestiones"
          value={searchGestiones}
          onChange={handeInputSearchGestiones}
          autoComplete="off"
        />
      </div>
    </div>
  );
};
