import { useContext, useEffect } from "react";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./vistaGestionesCycWeb.css";
import { checkToken } from "../../../store/actions/user.actions";
import {
  AppButton,
  AppDate,
  AppMultiSelect,
  AppSelect,
} from "../../../components/ui/PrimeControls";
import { MonitoreoContext } from "../../../Context/Monitoreo/MonitoreoContext";
import { Loader } from "../../../components/Loader";
import { Table } from "./Components/Table/Table";

export const VistaGestionesCycWeb = () => {
  const {
    filterGestiones,
    loadingClientes,
    clientes,
    seleccionarCliente,

    loadingCarterasByCliente,
    carterasFiltradas,
    seleccionarCartera,

    efectosAgrupados,
    loadingEfectosByCartera,
    loadEfectosByCartera,
    seleccionarEfectos,

    cambiarFechaInicio,
    cambiarFechaFin,

    gestiones,
    loadingGestiones,
    obtenerGestiones,
  } = useContext(MonitoreoContext);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isAuth = useSelector((state) => state.user.isAuth);
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    if (!isAuth) {
      dispatch(checkToken(navigate));
    }
    if (user && user.cargo === "asesor") {
      navigate("/perfilAsesor");
    }
  }, [isAuth, dispatch]);

  return (
    <>
      <div className="sombra container-gestiones-cycweb relative flex flex-col gap-7 rounded-2xl bg-white p-5 sm:p-7 lg:p-9 transition-all duration-300">
        {/* Título */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-brand-red">
            Operación
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-brand-dark">
            Monitoreo de gestiones
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Consulta, filtra y selecciona una gestión para evaluarla.
          </p>
        </div>

        {/* FORM */}
        <form
          autoComplete="off"
          className="container-form relative grid grid-cols-1 gap-5 border-b border-stone-100 pb-6 md:grid-cols-2 xl:grid-cols-3"
        >
          {/* CLIENTE */}
          <label className="space-y-1.5 text-sm font-medium text-stone-700">
            Cliente
            <AppSelect
              value={
                clientes.find(
                  (cliente) => cliente.id_cliente === filterGestiones.idCliente,
                ) || null
              }
              options={clientes}
              optionLabel="cliente"
              placeholder="Elige un cliente"
              loading={loadingClientes}
              onChange={(event) => seleccionarCliente(event.value)}
            />
          </label>

          {/* CARTERA */}
          <label className="space-y-1.5 text-sm font-medium text-stone-700">
            Cartera
            <AppSelect
              value={
                carterasFiltradas.find(
                  (cartera) => cartera.id_cartera === filterGestiones.idCartera,
                ) || null
              }
              options={carterasFiltradas}
              optionLabel="cartera"
              placeholder="Elige una cartera"
              loading={loadingCarterasByCliente}
              disabled={!filterGestiones.idCliente}
              onChange={(event) => seleccionarCartera(event.value)}
            />
          </label>

          {/* EFECTO */}
          <label className="space-y-1.5 text-sm font-medium text-stone-700">
            Efectos
            <AppMultiSelect
              value={efectosAgrupados.filter((efecto) =>
                efecto.IDS.every((id) =>
                  filterGestiones.idEfectos.includes(id),
                ),
              )}
              options={efectosAgrupados}
              optionLabel="EFECTO"
              placeholder="Todos los efectos"
              loading={loadingEfectosByCartera}
              disabled={!filterGestiones.idCartera}
              onShow={() => {
                if (!efectosAgrupados.length) loadEfectosByCartera();
              }}
              onChange={(event) => seleccionarEfectos(event.value)}
            />
          </label>

          {/* FECHA INICIO */}
          <label className="space-y-1.5 text-sm font-medium text-stone-700">
            Fecha inicial
            <AppDate
              value={
                filterGestiones.fechaInicio
                  ? moment(filterGestiones.fechaInicio, "YYYY-MM-DD").toDate()
                  : null
              }
              onChange={(event) =>
                cambiarFechaInicio({
                  target: {
                    value: event.value
                      ? moment(event.value).format("YYYY-MM-DD")
                      : "",
                  },
                })
              }
            />
          </label>

          {/* FECHA FINAL */}
          <label className="space-y-1.5 text-sm font-medium text-stone-700">
            Fecha final
            <AppDate
              value={
                filterGestiones.fechaFin
                  ? moment(filterGestiones.fechaFin, "YYYY-MM-DD").toDate()
                  : null
              }
              onChange={(event) =>
                cambiarFechaFin({
                  target: {
                    value: event.value
                      ? moment(event.value).format("YYYY-MM-DD")
                      : "",
                  },
                })
              }
            />
          </label>
        </form>

        {/* Button Buscar */}
        <div className="container-button-submit w-full flex justify-end">
          <AppButton
            type="button"
            onClick={obtenerGestiones}
            disabled={
              loadingGestiones ||
              !filterGestiones.idCartera ||
              !filterGestiones.fechaInicio ||
              !filterGestiones.fechaFin
            }
          >
            {loadingGestiones ? "Buscando..." : "Buscar"}
          </AppButton>
        </div>

        <div className="container-table scroll w-full relative flex flex-col overflow-y-hidden gap-5">
          {loadingGestiones ? (
            <Loader />
          ) : (
            <>
              <Table />
            </>
          )}
        </div>
      </div>
    </>
  );
};
