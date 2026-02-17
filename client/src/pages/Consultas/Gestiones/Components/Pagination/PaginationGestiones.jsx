import { useContext } from "react";
import { MonitoreoContext } from "../../../../../Context/Monitoreo/MonitoreoContext";
import { RenderItems } from "./Components/RenderItem";

export const PaginationGestiones = () => {
  const { gestiones, gestionesPerPage } = useContext(MonitoreoContext);

  return (
    <div className="pagination-container w-full flex justify-between items-center">
      <div className="cantidad-products-container text-[#8392ab] text-sm">
        Mostrando 1 a {gestionesPerPage} de {gestiones.length} incidentes
      </div>
      <div className="paginacion-products-container flex gap-0.5">
        {RenderItems()}
      </div>
    </div>
  );
};
