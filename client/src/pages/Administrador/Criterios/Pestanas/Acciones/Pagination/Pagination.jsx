import { useContext } from "react";
import { RenderItems } from "./Components/RenderItems";
import { CriteriosContext } from "../../../../../../Context/Criterios/ItemContext";

export const Pagination = () => {
  const { AccionesPerPage, criteriosAcciones } = useContext(CriteriosContext);

  return (
    <div className="pagination-container w-full flex justify-between items-center">
      <div className="cantidad-products-container text-[#8392ab] text-sm">
        Mostrando 1 a {AccionesPerPage} de {criteriosAcciones.length} acciones
      </div>
      <div className="paginacion-products-container flex gap-0.5">
        {RenderItems()}
      </div>
    </div>
  );
};
