import { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./vistaGestionesCycWeb.css";
import { checkToken } from "../../../store/actions/user.actions";
import "reactjs-popup/dist/index.css";
import { Toaster } from "sonner";
import { buttonSubmit, inputBorder, labelBorder } from "../../../UI/actions";
import { Down } from "../../../Icons/Iconos";
import { SCliente } from "./Components/Selects/SCliente";
import { MonitoreoContext } from "../../../Context/Monitoreo/MonitoreoContext";
import { SCartera } from "./Components/Selects/SCartera";
import { SEfecto } from "./Components/Selects/SEfecto";
import { Loader } from "../../../components/Loader";
import { Table } from "./Components/Table/Table";
import { EncabezadoT } from "./Components/Encabezado/EncabezadoT";
import { PaginationGestiones } from "./Components/Pagination/PaginationGestiones";

export const VistaGestionesCycWeb = () => {
  const {
    refSelectCliente,
    selectCliente,
    abrirSelectCliente,
    filtrarCliente,
    filterGestiones,
    loadingClientes,

    refSelectCartera,
    selectCartera,
    loadingCarterasByCliente,
    abrirSelectCartera,
    filtrarCartera,

    searchEfecto,
    efectosAgrupados,
    refSelectEfecto,
    selectEfecto,
    loadingEfectosByCartera,
    abrirSelectEfecto,
    filtrarEfecto,
    loadEfectosByCartera,

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
      <div className="sombra container-gestiones-cycweb relative bg-white flex flex-col py-10 px-5 gap-7 rounded-md transition-all duration-300">
        {/* Título */}
        <h1 className="text-2xl font-bold text-gray-800">
          Monitoreo Gestiones CyC Web
        </h1>

        {/* FORM */}
        <form
          autoComplete="off"
          className="container-form relative grid grid-cols-3 gap-4"
        >
          {/* CLIENTE */}
          <div
            ref={refSelectCliente}
            className="container-select-cliente relative"
          >
            <input
              type="text"
              id="clienteName"
              name="clienteName"
              onClick={abrirSelectCliente}
              onChange={filtrarCliente}
              className={inputBorder}
              value={filterGestiones.clienteName}
              disabled={loadingClientes}
            />

            <label htmlFor="clienteName" className={labelBorder}>
              Elige un Cliente
            </label>

            <Down
              className={`absolute top-3.5 right-3 ${
                selectCliente && "rotate-180 text-[#09c]"
              }`}
            />

            <SCliente />
          </div>

          {/* CARTERA */}
          <div
            ref={refSelectCartera}
            className="container-select-cartera relative"
          >
            <input
              type="text"
              id="carteraName"
              name="carteraName"
              onClick={abrirSelectCartera}
              onChange={filtrarCartera}
              className={inputBorder}
              value={filterGestiones.carteraName}
              disabled={loadingCarterasByCliente || !filterGestiones.idCliente}
            />

            <label htmlFor="carteraName" className={labelBorder}>
              Elige una Cartera
            </label>

            <Down
              className={`absolute top-3.5 right-3 ${
                selectCartera && "rotate-180 text-[#09c]"
              }`}
            />

            <SCartera />
          </div>

          {/* EFECTO */}
          <div
            ref={refSelectEfecto}
            className="container-select-efecto relative"
          >
            <input
              type="text"
              id="efectoName"
              name="efectoName"
              onClick={() => {
                abrirSelectEfecto();
                if (efectosAgrupados.length === 0) {
                  loadEfectosByCartera();
                }
              }}
              onChange={filtrarEfecto}
              className={inputBorder}
              value={searchEfecto}
              placeholder={
                filterGestiones.idEfectos.length
                  ? `${filterGestiones.idEfectos.length} efectos seleccionados`
                  : "Buscar efecto..."
              }
              disabled={loadingEfectosByCartera || !filterGestiones.idCartera}
            />

            <label htmlFor="efectoName" className={labelBorder}>
              Elige un Efecto
            </label>

            <Down
              className={`absolute top-3.5 right-3 ${
                selectEfecto && "rotate-180 text-[#09c]"
              }`}
            />

            <SEfecto />
          </div>

          {/* FECHA INICIO */}
          <div className="container-fechaInicio relative w-full">
            <input
              type="date"
              id="fechaInicio"
              name="fechaInicio"
              value={filterGestiones.fechaInicio}
              onChange={cambiarFechaInicio}
              className={inputBorder}
            />
            <label htmlFor="fechaInicio" className={labelBorder}>
              Fecha Inicial
            </label>
          </div>

          {/* FECHA FINAL */}
          <div className="container-fechaFin relative w-full">
            <input
              type="date"
              id="fechaFin"
              name="fechaFin"
              value={filterGestiones.fechaFin}
              onChange={cambiarFechaFin}
              className={inputBorder}
            />
            <label htmlFor="fechaFin" className={labelBorder}>
              Fecha Final
            </label>
          </div>
        </form>

        {/* Button Buscar */}
        <div className="container-button-submit w-full flex justify-end">
          <button
            type="button"
            onClick={obtenerGestiones}
            className={buttonSubmit}
            disabled={
              loadingGestiones ||
              !filterGestiones.idCartera ||
              !filterGestiones.fechaInicio ||
              !filterGestiones.fechaFin
            }
          >
            {loadingGestiones ? "Buscando..." : "Buscar"}
          </button>
        </div>

        <div className="container-table scroll w-full relative flex flex-col overflow-y-hidden gap-5">
          {loadingGestiones ? (
            <Loader />
          ) : (
            <>
              <EncabezadoT />
              <Table />
              <PaginationGestiones />
            </>
          )}
        </div>
      </div>
    </>
  );
};
