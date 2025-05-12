import { useContext } from "react";
import { CriteriosContext } from "../../../../../Context/Criterios/ItemContext";
import moment from "moment";

export const TAcciones = () => {
  const { accionesPaginated, openModalNAcciones } =
    useContext(CriteriosContext);

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
          <th className="py-3 px-6 relative cursor-pointer">
            Item Relacionado
          </th>
          <th className="py-3 px-6 relative cursor-pointer">Cartera</th>
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
              key={accion.ID_ACCION_CRITERIO}
              onClick={() => openModalNAcciones("edit", accion)}
              className="text-xs text-left leading-[1.5] font-normal border-b border-[#e9ecef] cursor-pointer hover:bg-gray-100"
            >
              <td className="py-3 px-6">{accion.ID_ACCION_CRITERIO}</td>
              <td className="py-3 px-6">{accion.NOMBRE_ACCION_CRITERIO}</td>
              <td className="py-3 px-6">{accion.NOMBRE_CRITERIO}</td>
              <td className="py-3 px-6">{accion.NOMBRE_ITEM}</td>
              <td className="py-3 px-6">{accion.NOMBRE_CARTERA}</td>
              <td className="py-3 px-6">
                {accion.PESO_ACCION_CRITERIO
                  ? accion.PESO_ACCION_CRITERIO * 100
                  : "-"}{" "}
                %
              </td>
              <td className="py-3 px-6">
                {accion.fecha_actualizacion
                  ? moment(accion.FECHA_ACTUALIZACION)
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
