import { Delete, Edit } from "../../../../../Icons/Iconos";

export const TMotNoPago = () => {
  return (
    <table className="relative w-full text-[#67748e] text-nowrap">
      <thead>
        <tr className="text-xs text-[#8392ab] text-left uppercase opacity-70 border-b border-solid border-[#e9ecef]">
          <th className="py-3 px-6 relative cursor-pointer">Código</th>
          <th className="py-3 px-6 relative cursor-pointer">Motivo No Pago</th>
          <th className="py-3 px-6 relative cursor-pointer">
            Cartera Relacionada
          </th>
          <th className="py-3 px-6 relative cursor-pointer">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr className="text-xs text-left leading-[1.5] font-normal border-b border-[#e9ecef] cursor-pointer hover:bg-gray-100">
          <td className="py-3 px-6">1</td>
          <td className="py-3 px-6">No aplica - Cliente predispuesto</td>
          <td className="py-3 px-6">PJOY M3</td>
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
