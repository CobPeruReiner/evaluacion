import "./App.css";
import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import { FichaEvaluacion } from "./pages/FichaEvaluacion";
import ProtectedRoutesLogin from "./components/ProtectedRoutesLogin";
import Signup from "./pages/Signup";
import Sidebar from "./components/sidebarDropdown/Sidebar";
import { FichaEvaluacionTable } from "./pages/FichaEvaluacionTable";
import { useSelector } from "react-redux";
import UsuariosView from "./pages/UsuariosView";
import VistaGestionesCycWeb from "./pages/VistaGestionesCycWeb";
import { FichaEvaluacionMonitor } from "./pages/FichaEvaluacionMonitor";
import AsesorPerfil from "./pages/AsesorPerfil";
import AsesorEvaluaciones from "./pages/AsesorEvaluaciones";
import AsesorFeedback from "./pages/AsesorFeedback";
import { CriteriosEvaluacion } from "./pages/Criterios/CriteriosEvaluacion";
import { useContext, useEffect } from "react";
import { SideBarContext } from "./Context/SideBarContext";

function App() {
  const { isSidebarOpen } = useContext(SideBarContext);

  const user = useSelector((state) => state.user.user);

  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {user && <Sidebar />}

      <div
        className={`relative w-full ${
          isActive("/login") ? "" : isSidebarOpen ? "pl-72" : "pl-24"
        } py-9 pr-6 transition-all duration-300`}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoutesLogin />}>
            <Route path="/" element={<VistaGestionesCycWeb />} />
            <Route path="/evaluacion" element={<FichaEvaluacion />} />
            <Route path="/table" element={<FichaEvaluacionTable />} />
            <Route path="/tableMonitor" element={<FichaEvaluacionMonitor />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/users" element={<UsuariosView />} />
            {/* PERFIL ASESOR */}
            <Route path="/perfilAsesor" element={<AsesorPerfil />} />
            <Route
              path="/evaluacionesAsesor"
              element={<AsesorEvaluaciones />}
            />
            <Route path="/feedbackAsesor" element={<AsesorFeedback />} />
            <Route path="/criterios" element={<CriteriosEvaluacion />} />
          </Route>
        </Routes>
      </div>
    </>
  );
}

export default App;
