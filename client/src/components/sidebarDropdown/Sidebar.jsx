import { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "primereact/button";
import { PanelMenu } from "primereact/panelmenu";
import { Sidebar as PrimeSidebar } from "primereact/sidebar";
import { logout } from "../../store/actions/user.actions";
import {
  canAccessAsesorWorkspace,
  canConfigureEvaluation,
  canUseOperacion,
  canUseSpeech,
  canViewHistory,
} from "../../utils/accessPolicy";
import { SideBarContext } from "../../Context/SideBarContext";

const active = (location, path) =>
  location.pathname === path || location.pathname.startsWith(`${path}/`);

export default function Sidebar() {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [desktop, setDesktop] = useState(() => window.innerWidth >= 1024);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isSidebarOpen } = useContext(SideBarContext);
  useEffect(() => {
    const update = () => setDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  useEffect(() => setMobileOpen(false), [location.pathname]);
  const item = (label, icon, to) => ({
    label,
    icon,
    className: active(location, to) ? "app-nav-active" : "",
    command: () => navigate(to),
  });
  const model = useMemo(() => {
    const sections = [];
    if (canUseOperacion(user))
      sections.push({
        key: "operacion",
        label: "Operación",
        icon: "pi pi-briefcase",
        expanded: true,
        items: [item("Consulta de gestiones", "pi pi-search", "/")],
      });
    if (canViewHistory(user) || canConfigureEvaluation(user))
      sections.push({
        key: "calidad",
        label: "Calidad",
        icon: "pi pi-chart-line",
        expanded: true,
        items: [
          ...(canViewHistory(user)
            ? [
                item(
                  "Histórico de evaluaciones",
                  "pi pi-history",
                  "/evaluaciones",
                ),
              ]
            : []),
          ...(canConfigureEvaluation(user)
            ? [item("Plantillas y opciones", "pi pi-sitemap", "/criterios")]
            : []),
        ],
      });
    if (canAccessAsesorWorkspace(user))
      sections.push({
        key: "asesor",
        label: "Espacio de asesor",
        icon: "pi pi-user",
        items: [
          item("Perfil de asesor", "pi pi-id-card", "/perfilAsesor"),
          item(
            "Evaluaciones de asesor",
            "pi pi-list-check",
            "/evaluacionesAsesor",
          ),
        ],
      });
    if (canUseSpeech(user))
      sections.push({
        key: "speech",
        label: "Speech Analytics",
        icon: "pi pi-microphone",
        items: [
          item("Procesamiento", "pi pi-upload", "/speech/procesamiento"),
          item("Auditoría de audios", "pi pi-volume-up", "/speech/auditoria"),
        ],
      });
    return sections;
  }, [user, location.pathname]);
  const close = () => !desktop && setMobileOpen(false);
  const signOut = () => {
    dispatch(logout());
    navigate("/login");
  };
  const initials =
    `${user?.NOMBRES?.[0] || "U"}${user?.APELLIDOS?.[0] || ""}`.toUpperCase();
  return (
    <>
      <Button
        icon="pi pi-bars"
        rounded
        text
        aria-label="Abrir navegación"
        className="app-menu-trigger lg:hidden"
        onClick={() => setMobileOpen(true)}
      />
      <PrimeSidebar
        visible={desktop || mobileOpen}
        onHide={close}
        modal={!desktop}
        dismissable={!desktop}
        showCloseIcon={!desktop}
        blockScroll={!desktop}
        className={`app-sidebar ${desktop && !isSidebarOpen ? "app-sidebar-compact" : ""}`}
        pt={{
          content: { className: "flex h-full flex-col p-0" },
          header: { className: "hidden" },
        }}
      >
        <div className="flex items-center gap-3 border-b border-stone-200 px-5 py-5">
          <div className="grid h-9 w-9 shrink-0 grid-cols-2 gap-0.5 rounded-lg bg-stone-100 p-1">
            <span className="bg-brand-red" />
            <span className="bg-stone-400" />
            <span className="bg-stone-500" />
            <span className="bg-brand-red" />
          </div>
          <div className="app-sidebar-copy min-w-0 flex-1">
            <p className="text-sm font-bold tracking-tight text-stone-900">
              COBRANZAS <span className="text-brand-red">PERÚ</span>
            </p>
            <p className="text-xs text-stone-500">Gestión de calidad</p>
          </div>
        </div>
        <nav
          className="flex-1 overflow-y-auto px-3 py-4"
          aria-label="Navegación principal"
        >
          <PanelMenu model={model} multiple />
        </nav>
        <div className="border-t border-stone-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-bold text-white">
              {initials}
            </div>
            <div className="app-sidebar-copy min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-stone-800">
                {user?.NOMBRES || "Usuario"}
              </p>
              <p className="truncate text-xs text-stone-500">
                {user?.nombre || user?.cargo || "Usuario"}
              </p>
            </div>
            <Button
              icon="pi pi-sign-out"
              severity="danger"
              text
              rounded
              aria-label="Cerrar sesión"
              onClick={signOut}
            />
          </div>
        </div>
      </PrimeSidebar>
    </>
  );
}
