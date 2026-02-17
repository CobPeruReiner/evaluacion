import { useContext } from "react";
import { MonitoreoContext } from "../../../../../Context/Monitoreo/MonitoreoContext";

export const SCantGestiones = () => {
  const { modalPageGestiones, changeGestionesPerPage } =
    useContext(MonitoreoContext);

  return (
    <div
      className={`absolute top-7 left-0 bg-gray-50 shadow-md z-10 ${
        modalPageGestiones ? "visible" : "hidden"
      }`}
    >
      <div className="relative flex flex-col gap-3 text-xs text-[rgb(96_125_139/1)]">
        <p
          className="px-3 py-2 hover:bg-gray-200 cursor-pointer"
          onClick={() => changeGestionesPerPage(5)}
        >
          5
        </p>
        <p
          className="px-3 py-2 hover:bg-gray-200 cursor-pointer"
          onClick={() => changeGestionesPerPage(10)}
        >
          10
        </p>
        <p
          className="px-3 py-2 hover:bg-gray-200 cursor-pointer"
          onClick={() => changeGestionesPerPage(15)}
        >
          15
        </p>
      </div>
    </div>
  );
};
