import moment from "moment";
import * as Icon from "../../../../../Icons/Iconos";

export const Metadatos = ({ item }) => {
  return (
    <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
      <p className="relative flex items-center gap-4">
        <span className="relative text-gray-500 font-medium text-base flex gap-4 items-center">
          <Icon.Calendar className="relative text-2xl" /> Fecha:
        </span>
        <span className="relative text-gray-900 text-base">
          {moment(item.metadatos.fecha, "YYYYMMDD").format("DD/MM/YYYY")}
        </span>
      </p>
      <p className="relative flex items-center gap-4">
        <span className="relative text-gray-500 font-medium text-base flex gap-4 items-center">
          <Icon.Hour className="relative text-2xl" /> Hora:
        </span>
        <span className="relative text-gray-900 text-base">
          {moment(item.metadatos.hora, "HHmmss").format("HH:mm:ss")}
        </span>
      </p>
      <p className="relative flex items-center gap-4">
        <span className="relative text-gray-500 font-medium text-base flex gap-4 items-center">
          <Icon.Phone className="relative text-2xl" /> Teléfono:
        </span>
        <span className="relative text-gray-900 text-base">
          {item.metadatos.telefono}
        </span>
      </p>
      <p className="relative flex items-center gap-4">
        <span className="relative text-gray-500 font-medium text-base flex gap-4 items-center">
          <Icon.Campaign className="relative text-2xl" /> Campaña:
        </span>
        <span className="relative text-gray-900 text-base">
          {item.metadatos.campaña}
        </span>
      </p>
      <p className="relative flex items-center gap-4">
        <span className="relative text-gray-500 font-medium text-base flex gap-4 items-center">
          <Icon.User className="relative text-2xl" /> Anexo:
        </span>
        <span className="relative text-gray-900 text-base">
          {item.metadatos.anexo}
        </span>
      </p>
    </div>
  );
};
