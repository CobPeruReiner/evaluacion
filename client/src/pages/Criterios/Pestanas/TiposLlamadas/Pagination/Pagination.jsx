import { useContext } from "react";
import { RenderItems } from "./Components/RenderItems";
import { CriteriosContext } from "../../../../../Context/Criterios/ItemContext";

export const Pagination = () => {
  const { tiposLlamadaPerPage, tiposLlamada } = useContext(CriteriosContext);

  return (
    <div className="pagination-container w-full flex justify-between items-center">
      <div className="cantidad-products-container text-[#8392ab] text-sm">
        Mostrando 1 a {tiposLlamadaPerPage} de {tiposLlamada.length} tipos de
        llamadas
      </div>
      <div className="paginacion-products-container flex gap-0.5">
        {RenderItems()}
      </div>
    </div>
  );
};
