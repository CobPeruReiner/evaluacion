import { useContext } from "react";
import { CriteriosContext } from "../../../../../../Context/Criterios/ItemContext";

export const TMotNoPago = () => {
  const { motivosNoPagoPaginated, openModalNMotNoPago } =
    useContext(CriteriosContext);

  return (
    <table className="relative w-full text-[#67748e] text-nowrap">
      <thead>
        <tr className="text-xs text-[#8392ab] text-left uppercase opacity-70 border-b border-solid border-[#e9ecef]">
          <th className="py-3 px-6 relative cursor-pointer">Código</th>
          <th className="py-3 px-6 relative cursor-pointer">Motivo No Pago</th>
          <th className="py-3 px-6 relative cursor-pointer">
            Cartera Relacionada
          </th>
        </tr>
      </thead>
      <tbody>
        {motivosNoPagoPaginated.length === 0 ? (
          <tr>
            <td colSpan={3} className="py-3 px-6 text-center">
              No se encontraron registros
            </td>
          </tr>
        ) : (
          motivosNoPagoPaginated.map((motivoNoPago) => (
            <tr
              key={motivoNoPago.ID_MOTIVO_NO_PAGO}
              className="text-xs text-left leading-[1.5] font-normal border-b border-[#e9ecef] cursor-pointer hover:bg-gray-100"
              onClick={() => openModalNMotNoPago("edit", motivoNoPago)}
            >
              <td className="py-3 px-6">{motivoNoPago.ID_MOTIVO_NO_PAGO}</td>
              <td className="py-3 px-6">
                {motivoNoPago.NOMBRE_MOTIVO_NO_PAGO}
              </td>
              <td className="py-3 px-6">{motivoNoPago.NOMBRE_CARTERA}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};
