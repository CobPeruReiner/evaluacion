import React, { useEffect, useState } from "react";
import user_icon from "../../../assets/user_icon.png";
import { useDispatch, useSelector } from "react-redux";
import { checkToken } from "../../../store/actions/user.actions";
import { getCarteras } from "../../../services/UserService";
import { useNavigate } from "react-router-dom";

export const AsesorPerfil = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuth, user } = useSelector((state) => state.user);
  const [carteras, setCarteras] = useState([]);

  const getCurrentCarteras = async () => {
    const carteras = await getCarteras(user.DOC);
    setCarteras(carteras);
  };

  useEffect(() => {
    if (!isAuth) {
      dispatch(checkToken(navigate));
    }
    if (!user) return;
    getCurrentCarteras();
  }, [isAuth, dispatch]);

  // console.log("User: ", user);

  return (
    <section className="w-full flex justify-center">
      <div className="w-full bg-white shadow-lg rounded-2xl p-8">
        {/* Nombre */}
        <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-4">
          {user && `${user?.APELLIDOS.trim()}, ${user?.NOMBRES.trim()}`}
        </h1>

        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Foto */}
          <img
            src={user_icon}
            alt="icono_usuario"
            className="w-28 h-28 rounded-full object-cover border-4 border-[#cceff7] shadow-sm"
          />

          {/* Info del asesor */}
          <div className="flex-1 grid grid-cols-[120px_1fr] gap-y-4 gap-x-6 text-sm">
            {/* Cartera(s) */}
            <p className="text-gray-600 font-medium mt-1">Cartera(s)</p>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {carteras.map((e) => (
                <span
                  key={e.id}
                  className="bg-[#e0f7fc] text-[#0077aa] text-xs font-medium px-3 py-1 rounded-full shadow-sm"
                >
                  {e.cartera}
                </span>
              ))}
            </div>

            {/* Monitor */}
            <p className="text-gray-600 font-medium mt-1">DNI</p>
            <p className="text-gray-800 font-semibold">{user?.DOC}</p>

            {/* Supervisor */}
            <p className="text-gray-600 font-medium mt-1">Correo electrónico</p>
            <p className="text-gray-800 font-semibold">{user?.EMAIL}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
