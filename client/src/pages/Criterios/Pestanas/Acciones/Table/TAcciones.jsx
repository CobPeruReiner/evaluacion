import { Delete, Edit } from "../../../../../Icons/Iconos";

export const TAcciones = () => {
  return (
    <table className="relative w-full text-[#67748e] text-nowrap">
      <thead>
        <tr className="text-xs text-[#8392ab] text-left uppercase opacity-70 border-b border-solid border-[#e9ecef]">
          <th className="py-3 px-6 relative cursor-pointer">Código</th>
          <th className="py-3 px-6 relative cursor-pointer">
            Nombre de la Acción
          </th>
          <th className="py-3 px-6 relative cursor-pointer">
            Criterios Relacionado
          </th>
          <th className="py-3 px-6 relative cursor-pointer">Peso</th>
          <th className="py-3 px-6 relative cursor-pointer">Esado</th>
          <th className="py-3 px-6 relative cursor-pointer">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr className="text-xs text-left leading-[1.5] font-normal border-b border-[#e9ecef] cursor-pointer hover:bg-gray-100">
          <td className="py-3 px-6">1</td>
          <td className="py-3 px-6">NO CONFIRMA EL TITULA/ ENCARGADO</td>
          <td className="py-3 px-6">
            CONTACTAR CON LA PERSONA ADECUADA (TITULAR,CONYUGE,AVAL)
          </td>
          <td className="py-3 px-6">0.0</td>
          <td className="py-3 px-6">Activo</td>
          <td className="py-3 px-6 flex items-center gap-3">
            <button
              // onClick={() => openMDetalleIncidente(incidente)}
              className="text-xl text-[#67748e] hover:text-[#09f] transition-all duration-300"
            >
              <Edit />
            </button>
            <button
              // onClick={() => openModalFecha(incidente)}
              className="text-xl text-[#67748e] hover:text-red-500 transition-all duration-300"
            >
              <Delete />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  );
};
