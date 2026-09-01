import { useContext } from "react";
import moment from "moment";
import { CriteriosContext } from "../../../../../../Context/Criterios/ItemContext";

export const TAcciones = () => {
  const { accionesPaginated, openModalNAcciones, formatPercent } =
    useContext(CriteriosContext);

  return (
    <table className="relative w-full text-[#67748e] text-nowrap">
      <thead>
        <tr className="text-xs text-[#8392ab] text-left uppercase opacity-70 border-b border-solid border-[#e9ecef]">
          <th className="py-3 px-6 relative cursor-pointer">Código</th>
          <th className="py-3 px-6 relative cursor-pointer">
            Nombre de la Acción
          </th>
          <th className="py-3 px-6 relative cursor-pointer">Criterios Asoc</th>
          <th className="py-3 px-6 relative cursor-pointer">Item Asoc</th>
          <th className="py-3 px-6 relative cursor-pointer">Cartera Asoc</th>
          <th className="py-3 px-6 relative cursor-pointer">Peso</th>
          <th className="py-3 px-6 relative cursor-pointer">
            Fecha Actualización
          </th>
          <th className="py-3 px-6 relative cursor-pointer">
            Usuario Actualización
          </th>
        </tr>
      </thead>
      <tbody>
        {accionesPaginated.length === 0 ? (
          <>
            <tr>
              <td colSpan={8} className="py-3 px-6 text-center">
                No se encontraron registros
              </td>
            </tr>
          </>
        ) : (
          accionesPaginated.map((accion) => (
            <tr
              key={accion.ID_ACCION}
              onClick={() => openModalNAcciones("edit", accion)}
              className="text-xs text-left leading-[1.5] font-normal border-b border-[#e9ecef] cursor-pointer hover:bg-gray-100"
            >
              <td className="py-3 px-6">{accion.ID_ACCION}</td>
              <td className="py-3 px-6">{accion.NOMBRE}</td>
              <td className="py-3 px-6">{accion.NOMBRE}</td>
              <td className="py-3 px-6">{accion.NOMBRE_ITEM}</td>
              <td className="py-3 px-6">{accion.NOMBRE_CARTERA}</td>
              {/* <td className="py-3 px-6">
                {accion.PESO
                  ? accion.PESO * 100
                  : "-"}{" "}
                %
              </td> */}
              <td className="py-3 px-6">
                {formatPercent(accion.PESO, { decimals: 2 })}%
              </td>
              <td className="py-3 px-6">
                {accion.FE_ACTUALIZACION
                  ? moment(accion.FE_ACTUALIZACION)
                      .utc()
                      .format("DD/MM/YYYY HH:mm:ss")
                  : "-"}
              </td>
              <td className="py-3 px-6">
                {accion.NOMBRE_USUARIO_ACTUALIZACION}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};
