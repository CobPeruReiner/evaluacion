import { CriteriosContext } from "../../../../../Context/Criterios/ItemContext";
import { RenderItems } from "./Components/RenderItems";
import { useContext } from "react";

export const Pagination = () => {
  const { audiosPerPage, evaluacionDetail } = useContext(CriteriosContext);

  return (
    <div className="pagination-container w-full flex justify-between items-center">
      <div className="cantidad-products-container text-[#8392ab] text-sm">
        Mostrando 1 a {audiosPerPage} de {evaluacionDetail?.exitosos?.length}{" "}
        audios evaluados
      </div>
      <div className="paginacion-products-container flex gap-0.5">
        {RenderItems()}
      </div>
    </div>
  );
};
