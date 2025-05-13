import { useContext } from "react";
import { CriteriosContext } from "../../../../../Context/Criterios/ItemContext";

export const TTipoGestion = () => {
  const { tiposGestionPaginated, openModalTipoGestion } =
    useContext(CriteriosContext);

  return (
    <table className="relative w-full text-[#67748e] text-nowrap">
      <thead>
        <tr className="text-xs text-[#8392ab] text-left uppercase opacity-70 border-b border-solid border-[#e9ecef]">
          <th className="py-3 px-6 relative cursor-pointer">Código</th>
          <th className="py-3 px-6 relative cursor-pointer">Tipo de Gestión</th>
          <th className="py-3 px-6 relative cursor-pointer">
            Cartera Relacionada
          </th>
        </tr>
      </thead>
      <tbody>
        {tiposGestionPaginated.length === 0 ? (
          <tr>
            <td colSpan={3} className="py-3 px-6 text-center">
              No se encontraron registros
            </td>
          </tr>
        ) : (
          tiposGestionPaginated.map((item, index) => (
            <tr
              key={item.ID_TIPO_GESTION || index}
              className="text-xs text-left leading-[1.5] font-normal border-b border-[#e9ecef] cursor-pointer hover:bg-gray-100"
              onClick={() => openModalTipoGestion("edit", item)}
            >
              <td className="py-3 px-6">{item.ID_TIPO_GESTION || "-"}</td>
              <td className="py-3 px-6">{item.NOMBRE_TIPO_GESTION || "-"}</td>
              <td className="py-3 px-6">{item.NOMBRE_CARTERA || "-"}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};
