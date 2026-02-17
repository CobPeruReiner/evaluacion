import { useEffect, useRef, useState } from "react";
import { MonitoreoContext } from "./MonitoreoContext";
import axios from "axios";
import { useOutsideClick } from "../../hooks/useOutSideClick";
import moment from "moment";
import { toast } from "sonner";

const GESTIONES_CYC_WEB_URL = `${import.meta.env.VITE_API_URL}api/v1/gestionsCycWeb`;

const CARYCLI_CYC_WEB_URL = `${GESTIONES_CYC_WEB_URL}/carYcli`;
const ASESORES_CYC_WEB_URL = `${GESTIONES_CYC_WEB_URL}/personal`;
const EFECTOS_BY_CARTERA_CYC_WEB_URL = `${GESTIONES_CYC_WEB_URL}/efectosByCartera`;

const initFilterGestiones = {
  idCliente: null,
  clienteName: "",
  idCartera: null,
  carteraName: "",
  idEfectos: [],
  idAsesor: null,
  asesorName: "",
  fechaInicio: moment().format("YYYY-MM-DD"),
  fechaFin: moment().format("YYYY-MM-DD"),
};

export const MonitoreoProvider = ({ children }) => {
  const [filterGestiones, setFilterGestiones] = useState(initFilterGestiones);

  const [gestiones, setGestiones] = useState([]);
  const [loadingGestiones, setLoadingGestiones] = useState(false);

  // ============================ CLIENTE ============================
  const refSelectCliente = useRef(null);
  const [selectCliente, setSelectCliente] = useState(false);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);

  // ============================ CARTERA ============================
  const refSelectCartera = useRef(null);
  const [selectCartera, setSelectCartera] = useState(false);
  const [loadingCarterasByCliente, setLoadingCarterasByCliente] =
    useState(false);
  const [carterasByCliente, setCarterasByCliente] = useState([]);
  const [carterasFiltradas, setCarterasFiltradas] = useState([]);

  // ============================ EFECTO ============================
  const refSelectEfecto = useRef(null);
  const [selectEfecto, setSelectEfecto] = useState(false);
  const [loadingEfectosByCartera, setLoadingEfectosByCartera] = useState(false);

  const [searchEfecto, setSearchEfecto] = useState("");
  const [efectosByCartera, setEfectosByCartera] = useState([]);
  const [efectosAgrupados, setEfectosAgrupados] = useState([]);
  const [efectosFiltrados, setEfectosFiltrados] = useState([]);

  // ============================ ASESOR ============================
  const refSelectAsesor = useRef(null);
  const [selectAsesor, setSelectAsesor] = useState(false);
  const [loadingAsesores, setLoadingAsesores] = useState(false);
  const [asesores, setAsesores] = useState([]);

  // ========================================================================
  const [gestionesPerPage, setGestionesPerPage] = useState(10);
  const refModalPageGestiones = useRef(null);
  const [modalPageGestiones, setModalPageGestiones] = useState(false);
  const [curPageGestiones, setCurPageGestiones] = useState(1);
  const [totalGestionesPages, setTotalGestionesPages] = useState(0);
  const [gestionesPaginated, setGestionesPaginated] = useState([]);
  const maxButtonsGestiones = 5;
  const [searchGestiones, setSearchGestiones] = useState("");

  // ============================ DATA BASE ============================
  const rowsRef = useRef([]);

  // ============================ CLIENTES ============================

  const abrirSelectCliente = () => {
    setSelectCliente(true);
    setSelectCartera(false);
    setSelectEfecto(false);
  };

  const cerrarSelectCliente = () => {
    setSelectCliente(false);

    if (!filterGestiones.idCliente) return;

    const existe = clientes.some(
      (c) =>
        c.id_cliente === filterGestiones.idCliente &&
        c.cliente.toLowerCase() ===
          filterGestiones.clienteName.trim().toLowerCase(),
    );

    if (!existe) {
      setFilterGestiones((prev) => ({
        ...prev,
        idCliente: null,
        idCartera: null,
        carteraName: "",
        idEfectos: [],
      }));

      setCarterasByCliente([]);
      setCarterasFiltradas([]);

      setEfectosByCartera([]);
      setEfectosAgrupados([]);
      setEfectosFiltrados([]);
    }
  };

  useOutsideClick(refSelectCliente, cerrarSelectCliente);

  const filtrarCliente = (e) => {
    const value = e.target.value;

    setFilterGestiones((prev) => ({
      ...prev,
      clienteName: value,
    }));

    const query = value.trim().toLowerCase();

    if (!query) {
      setClientesFiltrados(clientes);
      return;
    }

    setClientesFiltrados(
      clientes.filter((c) => c.cliente.toLowerCase().includes(query)),
    );
  };

  const seleccionarCliente = ({ id_cliente, cliente }) => {
    setFilterGestiones((prev) => ({
      ...prev,
      idCliente: id_cliente,
      clienteName: cliente,
      idCartera: null,
      carteraName: "",
      idEfectos: [],
    }));

    setSelectCliente(false);

    setLoadingCarterasByCliente(true);

    const carteras = rowsRef.current.filter((r) => r.id_cliente === id_cliente);

    setCarterasByCliente(carteras);
    setCarterasFiltradas(carteras);
    setEfectosByCartera([]);
    setEfectosAgrupados([]);
    setEfectosFiltrados([]);

    setLoadingCarterasByCliente(false);
  };

  // ============================ CARTERAS ============================

  const abrirSelectCartera = () => {
    if (!filterGestiones.idCliente) return;

    setSelectCartera(true);
    setSelectCliente(false);
    setSelectEfecto(false);
  };

  const cerrarSelectCartera = () => {
    setSelectCartera(false);

    if (!filterGestiones.idCartera) return;

    const existe = carterasByCliente.some(
      (c) =>
        c.id_cartera === filterGestiones.idCartera &&
        c.cartera.toLowerCase() ===
          filterGestiones.carteraName.trim().toLowerCase(),
    );

    if (!existe) {
      setFilterGestiones((prev) => ({
        ...prev,
        idCartera: null,
        carteraName: "",
        idEfectos: [],
      }));

      setEfectosByCartera([]);
      setEfectosAgrupados([]);
      setEfectosFiltrados([]);
    }
  };

  useOutsideClick(refSelectCartera, cerrarSelectCartera);

  const filtrarCartera = (e) => {
    const value = e.target.value;

    setFilterGestiones((prev) => ({
      ...prev,
      carteraName: value,
    }));

    const query = value.trim().toLowerCase();

    if (!query) {
      setCarterasFiltradas(carterasByCliente);
      return;
    }

    setCarterasFiltradas(
      carterasByCliente.filter((c) => c.cartera.toLowerCase().includes(query)),
    );
  };

  const seleccionarCartera = ({ id_cartera, cartera }) => {
    setFilterGestiones((prev) => ({
      ...prev,
      idCartera: id_cartera,
      carteraName: cartera,
      idEfectos: [],
    }));

    setSelectCartera(false);

    setEfectosByCartera([]);
    setEfectosAgrupados([]);
    setEfectosFiltrados([]);
  };

  // ============================ EFECTOS ============================

  const abrirSelectEfecto = () => {
    if (!filterGestiones.idCartera) return;

    setSelectEfecto(true);
    setSelectCliente(false);
    setSelectCartera(false);
  };

  const cerrarSelectEfecto = () => {
    setSelectEfecto(false);
  };

  useOutsideClick(refSelectEfecto, cerrarSelectEfecto);

  const filtrarEfecto = (e) => {
    const value = e.target.value;
    setSearchEfecto(value);

    const query = value.toLowerCase().trim();

    if (!query) {
      setEfectosFiltrados(efectosAgrupados);
      return;
    }

    setEfectosFiltrados(
      efectosAgrupados.filter((x) => x.EFECTO.toLowerCase().includes(query)),
    );
  };

  const toggleEfecto = (efecto) => {
    const ids = efecto.IDS;

    setFilterGestiones((prev) => {
      const todosSeleccionados = ids.every((id) => prev.idEfectos.includes(id));

      return {
        ...prev,
        idEfectos: todosSeleccionados
          ? prev.idEfectos.filter((id) => !ids.includes(id))
          : Array.from(new Set([...prev.idEfectos, ...ids])),
      };
    });
  };

  const toggleTodosEfectos = () => {
    setFilterGestiones((prev) => {
      const todosIds = efectosAgrupados.flatMap((e) => e.IDS);

      const todosSeleccionados =
        todosIds.length > 0 &&
        todosIds.every((id) => prev.idEfectos.includes(id));

      return {
        ...prev,
        idEfectos: todosSeleccionados
          ? prev.idEfectos.filter((id) => !todosIds.includes(id))
          : Array.from(new Set([...prev.idEfectos, ...todosIds])),
      };
    });
  };

  const agruparEfectos = (lista) => {
    const map = {};

    lista.forEach((e) => {
      if (!map[e.EFECTO]) {
        map[e.EFECTO] = {
          EFECTO: e.EFECTO,
          IDS: [],
        };
      }

      map[e.EFECTO].IDS.push(e.IDEFECTO);
    });

    return Object.values(map);
  };

  // ============================ FECHAS ============================

  const cambiarFechaInicio = (e) => {
    const value = e.target.value;

    setFilterGestiones((prev) => ({
      ...prev,
      fechaInicio: value,
    }));
  };

  const cambiarFechaFin = (e) => {
    const value = e.target.value;

    setFilterGestiones((prev) => ({
      ...prev,
      fechaFin: value,
    }));
  };

  // ========================= PAGINADO DE GESTIONES =========================

  const handeInputSearchGestiones = (e) => setSearchGestiones(e.target.value);

  const pageStartGestiones = Math.max(
    1,
    curPageGestiones - Math.floor(maxButtonsGestiones / 2),
  );

  const pageEndGestiones = Math.min(
    totalGestionesPages,
    pageStartGestiones + maxButtonsGestiones - 1,
  );

  const handleModalPageGestiones = () =>
    setModalPageGestiones(!modalPageGestiones);

  useOutsideClick(refModalPageGestiones, () => setModalPageGestiones(false));

  const changeGestionesPerPage = (newPerPage) => {
    setGestionesPerPage(newPerPage);
    setCurPageGestiones(1);
    setModalPageGestiones(false);
  };

  const changeCurPageGestiones = (newPage) => {
    setCurPageGestiones(newPage);
  };

  const calctotalGestionesPages = (filtered) => {
    const total =
      filtered && filtered.length > 0
        ? Math.ceil(filtered.length / gestionesPerPage)
        : 0;

    // console.log("Total de paginas:", total);
    setTotalGestionesPages(total);
  };

  const updateGestionesPaginated = (
    data = gestiones,
    page = curPageGestiones,
  ) => {
    const startIndex = (page - 1) * gestionesPerPage;
    const endIndex = startIndex + gestionesPerPage;
    const paginated = data.slice(startIndex, endIndex);

    setGestionesPaginated(paginated);
    // console.log("Datos Paginados:", paginated);
  };

  const filteredBySearch = () => {
    const lowerCaseSearch = searchGestiones.toLowerCase();

    return gestiones.filter((item) =>
      [
        item.ID,
        item.CARTERA,
        item.IDENTIFICADOR,
        item.accion,
        item.efecto,
        item.MOTIVO,
        item.OBSERVACION,
        item.GESTOR,
        item.GESTOR_DNI,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(lowerCaseSearch),
      ),
    );
  };

  // ============================ LOADS ============================
  const loadEfectosByCartera = async () => {
    if (!filterGestiones.idCartera) return;

    try {
      setLoadingEfectosByCartera(true);

      const { data } = await axios.get(EFECTOS_BY_CARTERA_CYC_WEB_URL, {
        params: { cartera: filterGestiones.idCartera },
      });

      const efectos = data.efectos || [];

      const agrupados = agruparEfectos(efectos);

      setEfectosByCartera(efectos);
      setEfectosAgrupados(agrupados);
      setEfectosFiltrados(agrupados);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingEfectosByCartera(false);
    }
  };

  const loadAsesores = async () => {
    try {
      setLoadingAsesores(true);

      const { data } = await axios.get(ASESORES_CYC_WEB_URL);

      setAsesores(data.personal || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingAsesores(false);
    }
  };

  const loadClientes = async () => {
    try {
      setLoadingClientes(true);

      const { data } = await axios.get(CARYCLI_CYC_WEB_URL);
      const rows = data.clientesYcarteras || [];

      rowsRef.current = rows;

      const clientesUnicos = Array.from(
        new Map(
          rows.map((r) => [
            r.id_cliente,
            { id_cliente: r.id_cliente, cliente: r.cliente },
          ]),
        ).values(),
      );

      setClientes(clientesUnicos);
      setClientesFiltrados(clientesUnicos);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingClientes(false);
    }
  };

  // ======================= OBTENER GESTIONES =======================
  const obtenerGestiones = async () => {
    if (!filterGestiones.idCartera) {
      toast.warning("Debe seleccionar una cartera");
      return;
    }

    if (!filterGestiones.fechaInicio || !filterGestiones.fechaFin) {
      toast.warning("Debe seleccionar una fecha de inicio y una de fin");
      return;
    }

    if (moment(filterGestiones.fechaInicio).isAfter(filterGestiones.fechaFin)) {
      toast.warning("La fecha de inicio no puede ser mayor a la de fin");
      return;
    }

    try {
      setLoadingGestiones(true);

      const params = {
        p_id_cartera: filterGestiones.idCartera,
        p_fecha_inicio: filterGestiones.fechaInicio,
        p_fecha_fin: filterGestiones.fechaFin,
        p_idefectos: filterGestiones.idEfectos.join(","),
      };

      const { data } = await axios.get(
        `${GESTIONES_CYC_WEB_URL}/filteredGestions`,
        { params },
      );

      // console.log("Gestiones obtenidas:", data);

      setGestiones(data.gestiones || []);
    } catch (error) {
      console.error(error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Error al obtener las gestiones";

      toast.error(message);
    } finally {
      setLoadingGestiones(false);
    }
  };

  // ============================ INIT ============================

  useEffect(() => {
    loadClientes();
    loadAsesores();
  }, []);

  useEffect(() => {
    const filteredData = searchGestiones.trim()
      ? filteredBySearch()
      : gestiones;

    if (curPageGestiones > Math.ceil(filteredData.length / gestionesPerPage)) {
      setCurPageGestiones(1);
    }

    calctotalGestionesPages(filteredData);
    updateGestionesPaginated(filteredData, curPageGestiones);
  }, [searchGestiones, gestiones, gestionesPerPage, curPageGestiones]);

  return (
    <MonitoreoContext.Provider
      value={{
        filterGestiones,

        // cliente
        refSelectCliente,
        selectCliente,
        abrirSelectCliente,
        cerrarSelectCliente,
        loadingClientes,
        clientes: clientesFiltrados,
        filtrarCliente,
        seleccionarCliente,

        // cartera
        refSelectCartera,
        selectCartera,
        loadingCarterasByCliente,
        carterasByCliente,
        carterasFiltradas,
        abrirSelectCartera,
        cerrarSelectCartera,
        filtrarCartera,
        seleccionarCartera,

        refSelectEfecto,
        selectEfecto,
        loadingEfectosByCartera,
        searchEfecto,
        efectosByCartera,
        efectosAgrupados,
        efectosFiltrados,
        abrirSelectEfecto,
        cerrarSelectEfecto,
        filtrarEfecto,
        toggleEfecto,
        toggleTodosEfectos,
        loadEfectosByCartera,

        // asesor
        refSelectAsesor,
        selectAsesor,
        loadingAsesores,
        asesores,
        loadAsesores,

        idEfectoSelected: filterGestiones.idEfecto,
        idAsesorSelected: filterGestiones.idAsesor,

        cambiarFechaInicio,
        cambiarFechaFin,

        gestiones,
        loadingGestiones,
        obtenerGestiones,

        gestionesPerPage,
        refModalPageGestiones,
        modalPageGestiones,
        curPageGestiones,
        totalGestionesPages,
        gestionesPaginated,
        maxButtonsGestiones,
        searchGestiones,
        handeInputSearchGestiones,
        pageStartGestiones,
        pageEndGestiones,
        handleModalPageGestiones,
        changeGestionesPerPage,
        changeCurPageGestiones,
        calctotalGestionesPages,
        updateGestionesPaginated,
        filteredBySearch,
      }}
    >
      {children}
    </MonitoreoContext.Provider>
  );
};
