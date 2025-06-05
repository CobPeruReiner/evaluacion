import { useContext } from "react";
import { CriteriosContext } from "../../../../../../Context/Criterios/ItemContext";

export const MChangeCantTipoGestion = () => {
  const { modalPageTipos, changeTiposPerPage } = useContext(CriteriosContext);

  return (
    <div
      className={`absolute top-7 left-0 bg-gray-50 shadow-md z-10 ${
        modalPageTipos ? "visible" : "hidden"
      }`}
    >
      <div className="relative flex flex-col gap-3 text-xs text-[rgb(96_125_139/1)]">
        <p
          className="px-3 py-2 hover:bg-gray-200 cursor-pointer"
          onClick={() => changeTiposPerPage(5)}
        >
          5
        </p>
        <p
          className="px-3 py-2 hover:bg-gray-200 cursor-pointer"
          onClick={() => changeTiposPerPage(10)}
        >
          10
        </p>
        <p
          className="px-3 py-2 hover:bg-gray-200 cursor-pointer"
          onClick={() => changeTiposPerPage(15)}
        >
          15
        </p>
      </div>
    </div>
  );
};
