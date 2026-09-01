import { useContext } from "react";
import moment from "moment";
import { CriteriosContext } from "../../../../../../Context/Criterios/ItemContext";

export const TItems = () => {
  const { criteriosItemsPaginated, openModalNItem } =
    useContext(CriteriosContext);

  return (
    <table className="relative w-full text-[#67748e] text-nowrap">
      <thead>
        <tr className="text-xs text-[#8392ab] text-left uppercase opacity-70 border-b border-solid border-[#e9ecef]">
          <th className="py-3 px-6 relative cursor-pointer">Código</th>
          <th className="py-3 px-6 relative cursor-pointer">Nombre del Ítem</th>
          <th className="py-3 px-6 relative cursor-pointer">Peso Item</th>
          <th className="py-3 px-6 relative cursor-pointer">Cartera Asoc</th>
          <th className="py-3 px-6 relative cursor-pointer">
            Fecha Actualización
          </th>
          <th className="py-3 px-6 relative cursor-pointer">
            Usuario Actualización
          </th>
        </tr>
      </thead>
      <tbody>
        {criteriosItemsPaginated.length === 0 ? (
          <>
            <tr>
              <td colSpan={6} className="py-3 px-6 text-center">
                No se encontraron registros
              </td>
            </tr>
          </>
        ) : (
          criteriosItemsPaginated.map((item) => (
            <tr
              key={item.ID_ITEM}
              className="text-xs text-left leading-[1.5] font-normal border-b border-[#e9ecef] cursor-pointer hover:bg-gray-100"
              onClick={() => openModalNItem("edit", item)}
            >
              <td className="py-3 px-6">{item.ID_ITEM}</td>
              <td className="py-3 px-6">{item.NOMBRE_ITEM}</td>
              {/* <td className="py-3 px-6">{item.PESO_ITEM * 100}%</td> */}
              <td className="py-3 px-6">
                {Math.round(Number(item.PESO_ITEM) * 100)}%
              </td>
              <td className="py-3 px-6">{item.NOMBRE_CARTERA}</td>
              <td className="py-3 px-6">
                {moment(item.FE_ACTUALIZACION)
                  .utc()
                  .format("DD/MM/YYYY HH:mm:ss")}
              </td>
              <td className="py-3 px-6">{item.NOMBRE_USUARIO_ACTUALIZACION}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};
