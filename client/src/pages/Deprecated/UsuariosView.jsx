import { useEffect, useState } from "react";
import axios from "axios";
import "./usuariosView.css";
import { AiFillEdit } from "react-icons/ai";
import { AiFillDelete } from "react-icons/ai";
import ChangePassword from "./ChangePassword";

const USERS_URL = `${import.meta.env.VITE_API_URL}api/v1/users/`;

const UsuariosView = () => {
  const [users, setUsers] = useState([]);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentUser, setCurrentUser] = useState("");

  useEffect(() => {
    axios
      .get(USERS_URL)
      .then((res) => setUsers(res.data.users))
      .catch((err) => console.log(err));
  }, []);

  const handleEditUser = (id) => {
    setShowChangePassword(true);
    setCurrentUser(id);
  };

  return (
    <div className="sombra container-gestiones-cycweb relative bg-white flex flex-col py-10 px-5 gap-7 rounded-md transition-all duration-300">
      <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
      {showChangePassword && (
        <ChangePassword
          setShowChangePassword={setShowChangePassword}
          currentUser={currentUser}
        />
      )}
      <table className="relative w-full text-[#67748e] text-nowrap">
        <thead>
          <tr className="text-xs text-[#8392ab] text-left uppercase opacity-70 border-b border-solid border-[#e9ecef]">
            <th className="py-3 px-6 relative cursor-pointer">NOMBRES</th>
            <th className="py-3 px-6 relative cursor-pointer">USUARIO</th>
            <th className="py-3 px-6 relative cursor-pointer">EDITAR</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              className="text-xs text-left leading-[1.5] font-normal border-b border-[#e9ecef] cursor-pointer hover:bg-gray-100"
              key={user.id}
            >
              <td className="py-3 px-6">{user.nombres}</td>
              <td className="py-3 px-6">{user.usuario}</td>
              <td className="py-3 px-6">
                <button className="text-xl text-[#67748e] hover:text-[#09f] transition-all duration-300">
                  <AiFillEdit
                    className="usersView-edit"
                    onClick={() => handleEditUser(user.usuario)}
                  />
                </button>
                <button
                  // onClick={() => openModalFecha(incidente)}
                  className="text-xl text-[#67748e] hover:text-red-500 transition-all duration-300"
                >
                  <AiFillDelete className="usersView-delete" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsuariosView;
