import { useContext } from "react";
import { Link } from "react-router-dom";
import { BiPowerOff } from "react-icons/bi";
import { FiUserPlus, FiUsers } from "react-icons/fi";
import { HiDocumentText } from "react-icons/hi";
import { MdOutlineMonitor } from "react-icons/md";
import { useSelector } from "react-redux";
import { SideBarContext } from "../../Context/SideBarContext";

const Sidebar = () => {
  const {
    isSidebarOpen,
    sideBarActive,
    sideBarInactive,
    isActive,
    handleLogOut,
  } = useContext(SideBarContext);

  const user = useSelector((state) => state.user.user);
  const isAuth = useSelector((state) => state.user.isAuth);

  // console.log("user: ", user);

  return (
    <>
      {/* Sidebar */}
      <div
        onMouseEnter={sideBarActive}
        onMouseLeave={sideBarInactive}
        className={`fixed top-0 left-0 ${
          isSidebarOpen ? "w-64" : "w-16"
        } h-full bg-gray-50 flex flex-col border-r z-[201] transition-all duration-300`}
      >
        {/* Header */}
        <div className="flex items-center space-x-3 px-4 pt-6">
          <h1
            className={`text-xl font-bold text-gray-900 transition-all ${
              !isSidebarOpen ? "hidden" : ""
            }`}
          >
            Evaluaciones
          </h1>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto mt-6">
          <ul className="space-y-3">
            {user && (
              <>
                {/* CONSULTA GESTIONES */}
                {isSidebarOpen && (
                  <h3 className="text-xs font-semibold text-gray-400 px-4">
                    Consultas
                  </h3>
                )}
                <li>
                  <Link
                    to="/"
                    className={`flex items-center text-xs ${
                      isSidebarOpen ? "justify-start" : "justify-center"
                    } space-x-2 py-2 px-3 rounded-md transition-all ${
                      isActive("/")
                        ? "bg-[#e0f7fc] text-[#09c]"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <MdOutlineMonitor size={24} />
                    {isSidebarOpen && <span>Consulta de Gestiones</span>}
                  </Link>
                </li>

                {/* Perfil Asesor */}
                {(user?.CARGO === 17 || user?.CARGO === 20) && (
                  <>
                    {isSidebarOpen && (
                      <h3 className="text-xs font-semibold text-gray-400 px-4">
                        Asesor
                      </h3>
                    )}
                    <li>
                      <Link
                        to="/perfilAsesor"
                        className={`flex items-center text-xs ${
                          isSidebarOpen ? "justify-start" : "justify-center"
                        } space-x-2 py-2 px-3 rounded-md transition-all ${
                          isActive("/perfilAsesor")
                            ? "bg-[#e0f7fc] text-[#09c]"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        <FiUsers size={24} />
                        {isSidebarOpen && <span>Perfil Asesor</span>}
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/evaluacionesAsesor"
                        className={`flex items-center text-xs ${
                          isSidebarOpen ? "justify-start" : "justify-center"
                        } space-x-2 py-2 px-3 rounded-md transition-all ${
                          isActive("/evaluacionesAsesor")
                            ? "bg-[#e0f7fc] text-[#09c]"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        <MdOutlineMonitor size={24} />
                        {isSidebarOpen && <span>Evaluaciones</span>}
                      </Link>
                    </li>
                  </>
                )}

                {/* Registro Monitor */}
                {user?.CARGO !== 16 && (
                  <>
                    {isSidebarOpen && (
                      <h3 className="text-xs font-semibold text-gray-400 px-4">
                        Monitor
                      </h3>
                    )}
                    <li>
                      <Link
                        to="/tableMonitor"
                        className={`flex items-center text-xs ${
                          isSidebarOpen ? "justify-start" : "justify-center"
                        } space-x-2 py-2 px-3 rounded-md transition-all ${
                          isActive("/tableMonitor")
                            ? "bg-[#e0f7fc] text-[#09c]"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        <HiDocumentText size={24} />
                        {isSidebarOpen && <span>Registro</span>}
                      </Link>
                    </li>
                  </>
                )}

                {/* Admin */}
                {(user?.CARGO === 6 ||
                  user?.CARGO === 20 ||
                  user?.CARGO === 17 ||
                  user?.CARGO === 15) && (
                  <>
                    {isSidebarOpen && (
                      <h3 className="text-xs font-semibold text-gray-400 px-4">
                        Administrador
                      </h3>
                    )}
                    <li>
                      <Link
                        to="/table"
                        className={`flex items-center text-xs ${
                          isSidebarOpen ? "justify-start" : "justify-center"
                        } space-x-2 py-2 px-3 rounded-md transition-all ${
                          isActive("/table")
                            ? "bg-[#e0f7fc] text-[#09c]"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        <HiDocumentText size={24} />
                        {isSidebarOpen && <span>Registro de Fichas</span>}
                      </Link>
                    </li>
                    {(user?.CARGO === 17 || user?.CARGO === 20) && (
                      <li>
                        <Link
                          to="/criterios"
                          className={`flex items-center text-xs ${
                            isSidebarOpen ? "justify-start" : "justify-center"
                          } space-x-2 py-2 px-3 rounded-md transition-all ${
                            isActive("/criterios")
                              ? "bg-[#e0f7fc] text-[#09c]"
                              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          }`}
                        >
                          <MdOutlineMonitor size={24} />
                          {isSidebarOpen && (
                            <span>Criterios de Evaluación</span>
                          )}
                        </Link>
                      </li>
                    )}
                  </>
                )}

                {/* Speech Analytics */}
                {(user?.CARGO === 20 ||
                  user?.CARGO === 17 ||
                  user?.CARGO === 7) && (
                  <>
                    {isSidebarOpen && (
                      <h3 className="text-xs font-semibold text-gray-400 px-4">
                        Speech Analytics
                      </h3>
                    )}
                    <li>
                      <Link
                        to="/speech/procesamiento"
                        className={`flex items-center text-xs ${
                          isSidebarOpen ? "justify-start" : "justify-center"
                        } space-x-2 py-2 px-3 rounded-md transition-all ${
                          isActive("/speech/procesamiento")
                            ? "bg-[#e0f7fc] text-[#09c]"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        <MdOutlineMonitor size={24} />
                        {isSidebarOpen && (
                          <span>Procesamiento y Evaluación</span>
                        )}
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/speech/auditoria"
                        className={`flex items-center text-xs ${
                          isSidebarOpen ? "justify-start" : "justify-center"
                        } space-x-2 py-2 px-3 rounded-md transition-all ${
                          isActive("/speech/auditoria")
                            ? "bg-[#e0f7fc] text-[#09c]"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        <HiDocumentText size={24} />
                        {isSidebarOpen && <span>Auditoría de Audios</span>}
                      </Link>
                    </li>
                  </>
                )}
              </>
            )}
          </ul>
        </div>

        {/* Footer */}
        <div
          className={`flex items-center p-4 border-t transition-all ${
            isSidebarOpen ? "justify-start space-x-3" : "flex-col space-y-2"
          }`}
        >
          <div className="bg-gray-300 w-10 h-10 rounded-full flex items-center justify-center text-sm text-white">
            {user?.NOMBRES?.[0] || "U"}
          </div>

          {isSidebarOpen ? (
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {user?.NOMBRES || "Usuario"}
              </p>
              <p className="text-xs text-gray-500">{user?.nombre || "Admin"}</p>
            </div>
          ) : null}

          {isAuth && (
            <button
              onClick={handleLogOut}
              className={`${
                isSidebarOpen ? "ml-auto" : ""
              } text-red-500 hover:text-red-700`}
            >
              <BiPowerOff size={24} />
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
