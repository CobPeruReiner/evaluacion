import { useNavigate } from "react-router-dom";
import { checkToken } from "../../store/actions/user.actions";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { tabs } from "./Data";
import * as Pestanas from "./Pestanas";
import { Toaster } from "sonner";
import { MFormItem } from "./Pestanas/Items/Modal/MFormItem";

export const CriteriosEvaluacion = () => {
  const navigate = useNavigate();

  const isAuth = useSelector((state) => state.user.isAuth);
  const dispatch = useDispatch();

  const [pestanaActive, setPestanaActive] = useState(1);

  useEffect(() => {
    if (!isAuth) {
      dispatch(checkToken(navigate));
    }
  }, [isAuth, dispatch]);

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="sombra container-gestiones-cycweb relative bg-white flex flex-col py-10 px-5 gap-7 rounded-md transition-all duration-300">
        <h1 className="text-2xl font-bold">Gestión de Criterios</h1>

        {/* Tabs */}
        <div className="flex space-x-8 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPestanaActive(tab.id)}
              className={`pb-2 text-sm font-medium ${
                pestanaActive === tab.id
                  ? "border-b-2 border-gray-900 text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              } transition-all`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Pestanas */}
        {pestanaActive === 1 && <Pestanas.Items />}
        {pestanaActive === 2 && <Pestanas.Criterios />}
        {pestanaActive === 3 && <Pestanas.Acciones />}
        {pestanaActive === 4 && <Pestanas.MotNoPago />}
        {pestanaActive === 5 && <Pestanas.TiposGestion />}
        {pestanaActive === 6 && <Pestanas.TiposLlamadas />}
      </div>

      {/* FORMULAS */}
      <MFormItem />
    </>
  );
};
