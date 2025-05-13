import { useContext } from "react";
import { CriteriosContext } from "../../../../../Context/Criterios/ItemContext";
import { Down, Search } from "../../../../../Icons/Iconos";
import { MChangeCantMotNoPago } from "../Modal/MChangeCantMotNoPago";

export const SCantMotNoPago = () => {
  const {
    refModalPageMotivos,
    motivosPerPage,
    handleModalPageMotivos,
    searchMotivos,
    handleInputSearchMotivos,
  } = useContext(CriteriosContext);

  return (
    <div className="relative flex items-center justify-between gap-5">
      <div
        ref={refModalPageMotivos}
        className="relative flex items-center text-xs text-[#8392ab] gap-2"
      >
        <div
          onClick={handleModalPageMotivos}
          className="cantidad-movimientos-pagindos relative flex items-center gap-3 border border-solid border-[#dadce0] rounded px-2 py-1"
        >
          <span className="">{motivosPerPage}</span>
          <Down />
          <MChangeCantMotNoPago />
        </div>
        <span className="">Motivos por página</span>
      </div>
      <div className="relative">
        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
          <Search />
        </div>
        <input
          type="search"
          id="default-search"
          className="block w-full px-9 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-[#09c] focus:border-[#09c] outline-none"
          placeholder="Buscar motivos"
          value={searchMotivos}
          onChange={handleInputSearchMotivos}
          autoComplete="off"
        />
      </div>
    </div>
  );
};
