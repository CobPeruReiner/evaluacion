import "./App.css";
import { Routes, Route, useLocation } from "react-router-dom";
import ProtectedRoutesLogin from "./components/ProtectedRoutesLogin";
import Sidebar from "./components/sidebarDropdown/Sidebar";
import { useSelector } from "react-redux";
import { useContext } from "react";
import { SideBarContext } from "./Context/SideBarContext";
import * as Views from "./pages";

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
          {/* LOGIN */}
          <Route path="/login" element={<Views.Login />} />

          {/* PROTECTED */}
          <Route element={<ProtectedRoutesLogin />}>
            {/* GESTIONES */}
            <Route path="/" element={<Views.VistaGestionesCycWeb />} />

            {/* EVALUACION FICHA */}
            <Route path="/evaluacion" element={<Views.FichaEvaluacion />} />

            {/* REPORTE EVALUACIONES */}
            <Route path="/table" element={<Views.FichaEvaluacionTable />} />

            {/* EVALUACIONES MONITOR */}
            <Route
              path="/tableMonitor"
              element={<Views.FichaEvaluacionMonitor />}
            />
            {/* <Route path="/signup" element={<Signup />} /> */}
            {/* <Route path="/users" element={<UsuariosView />} /> */}
            {/* PERFIL ASESOR */}

            {/* PERFIL */}
            <Route path="/perfilAsesor" element={<Views.AsesorPerfil />} />

            {/* EVALUACIONES ASESOR */}
            <Route
              path="/evaluacionesAsesor"
              element={<Views.AsesorEvaluaciones />}
            />
            {/* <Route path="/feedbackAsesor" element={<AsesorFeedback />} /> */}

            {/* CRITERIOS */}
            <Route path="/criterios" element={<Views.CriteriosEvaluacion />} />

            {/* SPEACH ANALYTICS */}
            {/* PROCESAMIENTO */}
            <Route
              path="/speech/procesamiento"
              element={<Views.Procesamiento />}
            />

            {/* AUDITORIA */}
            <Route path="/speech/auditoria" element={<Views.Auditoria />} />

            {/* DETALLE AUDITORIA */}
            <Route
              path="/speech/auditoria/detalle/:archivo"
              element={<Views.AuditoriaDetail />}
            />
          </Route>
        </Routes>
      </div>
    </>
  );
}

export default App;
