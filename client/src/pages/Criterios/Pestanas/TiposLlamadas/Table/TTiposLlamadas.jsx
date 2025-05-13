import { useContext } from "react";
import { CriteriosContext } from "../../../../../Context/Criterios/ItemContext";

export const TTiposLlamadas = () => {
  const { tiposLlamadaPaginated, openModalTipoLlamada } =
    useContext(CriteriosContext);

  return (
    <table className="relative w-full text-[#67748e] text-nowrap">
      <thead>
        <tr className="text-xs text-[#8392ab] text-left uppercase opacity-70 border-b border-solid border-[#e9ecef]">
          <th className="py-3 px-6 relative cursor-pointer">Código</th>
          <th className="py-3 px-6 relative cursor-pointer">Tipo de Llamada</th>
        </tr>
      </thead>
      <tbody>
        {tiposLlamadaPaginated.map((item, index) => (
          <tr
            key={item.ID_TIPO_LLAMADA || index}
            className="text-xs text-left leading-[1.5] font-normal border-b border-[#e9ecef] cursor-pointer hover:bg-gray-100"
            onClick={() => openModalTipoLlamada("edit", item)}
          >
            <td className="py-3 px-6">{item.ID_TIPO_LLAMADA || "-"}</td>
            <td className="py-3 px-6">{item.NOMBRE_TIPO_LLAMADA || "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
