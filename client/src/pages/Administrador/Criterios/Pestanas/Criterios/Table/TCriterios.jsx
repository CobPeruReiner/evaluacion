import { useContext } from "react";
import moment from "moment";
import { CriteriosContext } from "../../../../../../Context/Criterios/ItemContext";

export const TCriterios = () => {
  const { criteriosPaginated, openModalNCriterio } =
    useContext(CriteriosContext);

  return (
    <table className="relative w-full text-[#67748e] text-nowrap">
      <thead>
        <tr className="text-xs text-[#8392ab] text-left uppercase opacity-70 border-b border-solid border-[#e9ecef]">
          <th className="py-3 px-6 relative cursor-pointer">Código</th>
          <th className="py-3 px-6 relative cursor-pointer">
            Nombre del Criterio
          </th>
          <th className="py-3 px-6 relative cursor-pointer">Item Asoc</th>
          <th className="py-3 px-6 relative cursor-pointer">Peso</th>
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
        {criteriosPaginated.length === 0 ? (
          <>
            <tr>
              <td colSpan={6} className="py-3 px-6 text-center">
                No se encontraron registros
              </td>
            </tr>
          </>
        ) : (
          criteriosPaginated.map((criterio) => (
            <tr
              key={criterio.ID_CRITERIO}
              className="text-xs text-left leading-[1.5] font-normal border-b border-[#e9ecef] cursor-pointer hover:bg-gray-100"
              onClick={() => openModalNCriterio("edit", criterio)}
            >
              <td className="py-3 px-6">{criterio.ID_CRITERIO}</td>
              <td className="py-3 px-6">{criterio.NOMBRE_CRITERIO}</td>
              <td className="py-3 px-6">{criterio.NOMBRE_ITEM}</td>
              <td className="py-3 px-6">{criterio.PESO_CRITERIO * 100}%</td>
              <td className="py-3 px-6">{criterio.NOMBRE_CARTERA}</td>
              <td className="py-3 px-6">
                {moment(criterio.FECHA_ACTUALIZACION)
                  .utc()
                  .format("DD/MM/YYYY HH:mm:ss")}
              </td>
              <td className="py-3 px-6">
                {criterio.NOMBRE_USUARIO_ACTUALIZACION}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};
