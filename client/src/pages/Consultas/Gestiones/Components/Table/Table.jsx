import { useContext } from "react";
import { MonitoreoContext } from "../../../../../Context/Monitoreo/MonitoreoContext";
import moment from "moment";
import { Evaluador } from "../../../../../Icons/Iconos";
import { useDispatch } from "react-redux";
import { setGestion } from "../../../../../store/actions/currentGestion.actions";
// import { EvaluacionContext } from "../../../../../Context/Evaluacion/EvaluacionContext";

export const Table = () => {
  const { gestionesPaginated } = useContext(MonitoreoContext);

  // const { iniciarMonitoreo } = useContext(EvaluacionContext);

  const dispatch = useDispatch();

  const handleEvaluar = (gestion) => {
    window.open("/evaluacion", "_blank");
    dispatch(setGestion(gestion));
  };

  return (
    <table className="relative w-full text-[#67748e] text-nowrap">
      <thead>
        <tr className="text-xs text-[#8392ab] text-left uppercase opacity-70 border-b border-solid border-[#e9ecef]">
          <th className="py-3 px-6 relative cursor-pointer hidden">ID</th>
          <th className="py-3 px-6">FECHA</th>
          <th className="py-3 px-6">CARTERA</th>
          <th className="py-3 px-6">IDENTIFICADOR</th>
          <th className="py-3 px-6">ACCION</th>
          <th className="py-3 px-6">EFECTO</th>
          <th className="py-3 px-6">MOTIVO</th>
          <th className="py-3 px-6">GESTOR</th>
          <th className="py-3 px-6">OBSERVACION</th>
          <th className="py-3 px-6"></th>
        </tr>
      </thead>
      <tbody>
        {gestionesPaginated?.length === 0 ? (
          <tr>
            <td className="text-center py-3 px-6" colSpan={10}>
              No hay gestiones encontradas
            </td>
          </tr>
        ) : (
          gestionesPaginated?.map((gestion) => (
            <tr
              key={gestion.ID}
              className="text-xs text-left leading-[1.5] font-normal border-b cursor-pointer hover:bg-gray-100"
            >
              <td className="py-3 px-6 hidden">{gestion.ID}</td>
              <td className="py-3 px-6">
                {moment(gestion.FECHA).utc().format("DD/MM/YYYY HH:mm:ss")}
              </td>
              <td className="py-3 px-6">{gestion.CARTERA}</td>
              <td className="py-3 px-6">{gestion.IDENTIFICADOR}</td>
              <td className="py-3 px-6">{gestion.accion}</td>
              <td className="py-3 px-6">{gestion.efecto}</td>
              <td className="py-3 px-6">{gestion.MOTIVO}</td>
              <td className="py-3 px-6">{gestion.GESTOR}</td>
              <td className="py-3 px-6">
                <span
                  className="block max-w-[260px] overflow-hidden text-ellipsis whitespace-nowrap"
                  title={gestion.OBSERVACION}
                >
                  {gestion.OBSERVACION}
                </span>
              </td>
              <td className="py-3 px-6">
                <button
                  onClick={() => handleEvaluar(gestion)}
                  className="text-2xl text-[#67748e] hover:text-[#09f] transition-all duration-300"
                >
                  <Evaluador />
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};
