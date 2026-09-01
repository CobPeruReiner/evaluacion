import "./App.css";
import { Navigate, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import ProtectedRoutesLogin from "./components/ProtectedRoutesLogin";
import Sidebar from "./components/sidebarDropdown/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { useContext, useEffect } from "react";
import * as Views from "./pages";
import { checkToken } from "./store/actions/user.actions";
import { CriteriosProvider } from "./Context/Criterios/ItemProvider";
import { MonitoreoProvider } from "./Context/Monitoreo/MonitoreoProvider";
import AsesorFeedback from "./pages/Deprecated/AsesorFeedback";
import RoleRoute from "./components/RoleRoute";
import { canAccessAsesorWorkspace, canConfigureEvaluation, canUseOperacion, canUseSpeech, canViewHistory, isAsesor } from "./utils/accessPolicy";
import { SideBarContext } from "./Context/SideBarContext";
import { Button } from "primereact/button";

function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isAuth = useSelector((state) => state.user.isAuth);
  const user = useSelector((state) => state.user.user);
  const { isSidebarOpen, toggleSidebar } = useContext(SideBarContext);

  const location = useLocation();

  useEffect(() => {
    if (!isAuth) {
      dispatch(checkToken(navigate));
    }
    if (user && isAsesor(user) && location.pathname === "/") {
      navigate("/perfilAsesor", { replace: true });
    }
  }, [isAuth, dispatch, navigate, user, location.pathname]);

  return (
    <>
      {user && <Sidebar />}
      {user && location.pathname !== "/login" && <Button icon={isSidebarOpen ? "pi pi-chevron-left" : "pi pi-chevron-right"} aria-label={isSidebarOpen ? "Contraer menú" : "Expandir menú"} className={`app-sidebar-toggle ${!isSidebarOpen ? "app-sidebar-toggle--compact" : ""} hidden lg:inline-flex`} onClick={toggleSidebar} />}

      <div className={`relative w-full px-4 py-5 sm:px-6 sm:py-7 lg:pr-7 ${user && location.pathname !== "/login" ? isSidebarOpen ? "lg:pl-[21rem]" : "lg:pl-[7rem]" : ""}`}>
        <Routes>
          {/* LOGIN */}
          <Route path="/login" element={<Views.Login />} />

          {/* PROTECTED */}
          <Route element={<ProtectedRoutesLogin />}>
            {/* GESTIONES */}
            <Route
              path="/"
              element={
                <RoleRoute allow={canUseOperacion}><MonitoreoProvider><Views.VistaGestionesCycWeb /></MonitoreoProvider></RoleRoute>
              }
            />

            {/* EVALUACION FICHA */}
            <Route
              path="/evaluacion"
              element={<RoleRoute allow={canUseOperacion}><Views.FichaEvaluacionR /></RoleRoute>}
            />

            <Route path="/evaluaciones" element={<RoleRoute allow={canViewHistory}><Views.HistorialEvaluaciones /></RoleRoute>} />
            <Route path="/table" element={<Navigate replace to="/evaluaciones" />} />
            <Route path="/tableMonitor" element={<Navigate replace to="/evaluaciones" />} />
            {/* <Route path="/signup" element={<Signup />} /> */}
            {/* <Route path="/users" element={<UsuariosView />} /> */}
            {/* PERFIL ASESOR */}

            {/* PERFIL */}
            <Route path="/perfilAsesor" element={<RoleRoute allow={canAccessAsesorWorkspace}><Views.AsesorPerfil /></RoleRoute>} />

            {/* EVALUACIONES ASESOR */}
            <Route
              path="/evaluacionesAsesor"
              element={<RoleRoute allow={canAccessAsesorWorkspace}><Views.AsesorEvaluaciones /></RoleRoute>}
            />
            <Route path="/feedbackAsesor" element={<RoleRoute allow={canAccessAsesorWorkspace}><AsesorFeedback /></RoleRoute>} />

            {/* CRITERIOS */}
            <Route
              path="/criterios"
              element={
                <RoleRoute allow={canConfigureEvaluation}><CriteriosProvider><Views.CriteriosEvaluacion /></CriteriosProvider></RoleRoute>
              }
            />

            {/* SPEACH ANALYTICS */}
            {/* PROCESAMIENTO */}
            <Route
              path="/speech/procesamiento"
              element={
                <RoleRoute allow={canUseSpeech}><CriteriosProvider><Views.Procesamiento /></CriteriosProvider></RoleRoute>
              }
            />

            {/* AUDITORIA */}
            <Route
              path="/speech/auditoria"
              element={
                <RoleRoute allow={canUseSpeech}><CriteriosProvider><Views.Auditoria /></CriteriosProvider></RoleRoute>
              }
            />

            {/* DETALLE AUDITORIA */}
            <Route
              path="/speech/auditoria/detalle/:archivo"
              element={
                <RoleRoute allow={canUseSpeech}><CriteriosProvider><Views.AuditoriaDetail /></CriteriosProvider></RoleRoute>
              }
            />

            {/* REPORTE GESTIONES */}
            <Route path="/auditoria/gestiones" element={<Navigate replace to="/evaluaciones" />} />
          </Route>
        </Routes>
      </div>
    </>
  );
}

export default App;
