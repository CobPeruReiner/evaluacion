import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { EvaluacionContext } from "./EvaluacionContext";
import { useMemo } from "react";
import moment from "moment";

const initInfoGestion = {
  idCartera: null,
  nombreCartera: null,
  idGestion: null,
  nombreAgente: null,
  codCliente: null,
  tipificacionGestion: null,
  motivoGestion: null,
  fechaGestion: null,
  telefonoGestion: null,
};

const initCalificacionGestion = {
  tiempoMuertoGestion: "0",
  idTipoLlamada: null,
  nombreTipoLlamada: "",
  idTipoGestion: null,
  nombreTipoGestion: "",
  idMotivoNoPago: null,
  nombreMotivoNoPago: "",
  isAlerta: false,
  idResponsableNoFCR: null,
  nombreResponsableNoFCR: "",
  idMotivoNoFCR: null,
  nombreMotivoNoFCR: "",
  idMotivoAlerta: null,
  nombreMotivoAlerta: "",
  horaInicio: null,
  horaFin: null,
  duracionMonitoreo: 0,
};

const buildFormularioEvaluacion = (acciones = []) => {
  const mapItems = new Map();

  acciones.forEach((row) => {
    const idItem = row.ID_ITEM;
    const idCriterio = row.ID_CRITERIO;

    if (!mapItems.has(idItem)) {
      mapItems.set(idItem, {
        idItem,
        nombreItem: row.NOMBRE_ITEM,
        pesoItem: row.PESO_ITEM,
        criterios: new Map(),
      });
    }

    const item = mapItems.get(idItem);

    if (!item.criterios.has(idCriterio)) {
      item.criterios.set(idCriterio, {
        idCriterio,
        nombreCriterio: row.NOMBRE,
        pesoCriterio: row.PESO,
        acciones: [],
      });
    }

    const criterio = item.criterios.get(idCriterio);

    criterio.acciones.push({
      idAccion: row.ID_ACCION,
      nombreAccion: row.NOMBRE,
      pesoAccion: row.PESO,
    });
  });

  const result = [...mapItems.values()].map((item) => ({
    idItem: item.idItem,
    nombreItem: item.nombreItem,
    pesoItem: item.pesoItem,
    criterios: [...item.criterios.values()],
  }));

  return result;
};

export const EvaluacionProvider = ({ children }) => {
  const API_URL = `${import.meta.env.VITE_API_URL}api/v1`;

  const [timerActivo, setTimerActivo] = useState(false);

  const [infoGestion, setInfoGestion] = useState(initInfoGestion);

  // estructura del formulario (items / criterios / acciones)
  const [formularioEvaluacion, setFormularioEvaluacion] = useState([]);

  // loading de configuración
  const [pendingFormularioEvaluacion, setPendingFormularioEvaluacion] =
    useState(false);

  // agregados
  const [calificacionGestion, setCalificacionGestion] = useState(
    initCalificacionGestion,
  );

  // observaciones por item del fetch
  const [observacionPorItem, setObservacionPorItem] = useState({});

  // item activo (tab)
  const [activeItemId, setActiveItemId] = useState(null);

  // respuesta por criterio
  const [respuestaPorCriterio, setRespuestaPorCriterio] = useState({});

  // Select Tipo de Llamada
  const refSelectTipoLlamada = useRef(null);
  const [selectTipoLlamada, setselectTipoLlamada] = useState(false);
  const [dataTipoLlamada, setDataTipoLlamada] = useState([]);
  const [filterDataTipoLlamada, setFilterDataTipoLlamada] = useState([]);
  const [PendingTipoLlamada, setPendingTipoLlamada] = useState(false);

  // Select tipo de gestion
  const refSelectTipoGestion = useRef(null);
  const [selectTipoGestion, setselectTipoGestion] = useState(false);
  const [dataTipoGestion, setDataTipoGestion] = useState([]);
  const [filterDataTipoGestion, setFilterDataTipoGestion] = useState([]);
  const [PendingTipoGestion, setPendingTipoGestion] = useState(false);

  // Select motivo de no pago
  const refSelectMotivoNoPago = useRef(null);
  const [selectMotivoNoPago, setselectMotivoNoPago] = useState(false);
  const [dataMotivoNoPago, setDataMotivoNoPago] = useState([]);
  const [filterDataMotivoNoPago, setFilterDataMotivoNoPago] = useState([]);
  const [PendingMotivoNoPago, setPendingMotivoNoPago] = useState(false);

  // Select responsable No FCR
  const refSelectResponsableNoFCR = useRef(null);
  const [selectResponsableNoFCR, setSelectResponsableNoFCR] = useState(false);
  const [dataResponsableNoFCR, setDataResponsableNoFCR] = useState([]);
  const [filterDataResponsableNoFCR, setFilterDataResponsableNoFCR] = useState(
    [],
  );
  const [pendingResponsableNoFCR, setPendingResponsableNoFCR] = useState(false);

  // Select motivo No FCR
  const refSelectMotivoNoFCR = useRef(null);
  const [selectMotivoNoFCR, setSelectMotivoNoFCR] = useState(false);
  const [dataMotivoNoFCR, setDataMotivoNoFCR] = useState([]);
  const [filterDataMotivoNoFCR, setFilterDataMotivoNoFCR] = useState([]);
  const [pendingMotivoNoFCR, setPendingMotivoNoFCR] = useState(false);

  // Select motivo alerta
  const refSelectMotivoAlerta = useRef(null);
  const [selectMotivoAlerta, setSelectMotivoAlerta] = useState(false);
  const [dataMotivoAlerta, setDataMotivoAlerta] = useState([]);
  const [filterDataMotivoAlerta, setFilterDataMotivoAlerta] = useState([]);
  const [pendingMotivoAlerta, setPendingMotivoAlerta] = useState(false);

  const changeActiveItem = (idItem) => {
    setActiveItemId(idItem);
  };

  const handleChangeCalificacionGestion = (e) => {
    const { name, value } = e.target;

    setCalificacionGestion((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // capturamos el input de observaciones por item como sistema anterior
  const handleChangeObservacionItem = (idItem, value) => {
    setObservacionPorItem((prev) => ({
      ...prev,
      [idItem]: value,
    }));
  };

  // capturamos la accion seleccionada por criterio
  const handleChangeAccion = (idCriterio, idAccion) => {
    setRespuestaPorCriterio((prev) => ({
      ...prev,
      [idCriterio]: idAccion,
    }));
  };

  const fillInfoGestion = () => {
    const recordInLS = localStorage.getItem("record");

    // console.log("Record: ", recordInLS);

    if (!recordInLS) {
      toast.warning("No hay información de la gestión para mostrar");

      return;
    }

    const record = JSON.parse(recordInLS);

    const gestion = {
      idCartera: record.ID_CARTERA ?? null,
      nombreCartera: record.CARTERA ?? null,
      idGestion: record.ID ?? null,
      nombreAgente: record.GESTOR ?? null,
      codCliente: record.IDENTIFICADOR ?? null,
      tipificacionGestion: record.efecto ?? null,
      motivoGestion: record.MOTIVO ?? null,
      fechaGestion: record.FECHA ?? null,
      telefonoGestion: record.TELEFONO ?? null,
    };

    setInfoGestion(gestion);
  };

  // NEXT/PREV
  const currentIndex = useMemo(() => {
    return formularioEvaluacion.findIndex(
      (item) => item.idItem === activeItemId,
    );
  }, [formularioEvaluacion, activeItemId]);

  const goNextItem = () => {
    if (currentIndex === -1) return;

    const next = formularioEvaluacion[currentIndex + 1];

    if (next) {
      setActiveItemId(next.idItem);
    }
  };

  const goPrevItem = () => {
    if (currentIndex <= 0) return;

    const prev = formularioEvaluacion[currentIndex - 1];

    if (prev) {
      setActiveItemId(prev.idItem);
    }
  };

  const isFirstItem = currentIndex === 0;
  const isLastItem = currentIndex === formularioEvaluacion.length - 1;

  const iniciarMonitoreo = () => {
    const ahora = moment().toISOString();

    localStorage.setItem("horaInicioMonitoreo", ahora);

    setCalificacionGestion((prev) => ({
      ...prev,
      horaInicio: ahora,
      horaFin: null,
      duracionMonitoreo: 0,
    }));

    setTimerActivo(true);
  };

  const finalizarMonitoreo = () => {
    const ahora = moment().toISOString();

    localStorage.removeItem("horaInicioMonitoreo");

    setCalificacionGestion((prev) => ({
      ...prev,
      horaFin: ahora,
    }));

    setTimerActivo(false);
  };

  const saveEvaluacion = async () => {
    const fechaMoment = infoGestion?.FECHA
      ? moment(infoGestion.FECHA).utc()
      : null;

    const today = moment().format("YYYY-MM-DD HH:mm:ss");

    try {
      const payload = {
        RESPUESTAS: respuestaPorCriterio,
        OBSERVACIONES: observacionPorItem,
        calificacionGestion,
        AGENTE: infoGestion?.GESTOR ?? "",
        AGENTE_DNI: infoGestion?.GESTOR_DNI ?? "",
        MES: fechaMoment ? fechaMoment.format("MMMM") : "",
        SEMANA: fechaMoment ? `Semana ${fechaMoment.format("WW")}` : "",
        FECHA: fechaMoment ? fechaMoment.format("DD/MM/YYYY") : "",
        HORA: fechaMoment ? fechaMoment.format("HH:mm:ss") : "",
        TELEFONO: infoGestion?.TELEFONO ?? "",
        CLIENTE_DNI: infoGestion?.IDENTIFICADOR ?? "",
        RESULTADO: infoGestion?.EFECTO ?? "",
      };

      console.log("Saving:", payload);

      // await axios.post("/guardar", payload);

      toast.success("Evaluación guardada correctamente");
    } catch (error) {
      toast.error("Error al guardar evaluación");
    }
  };

  // =========================== PETICIONES GET ===========================
  const getTipoLlamada = async () => {
    try {
      setPendingTipoLlamada(true);

      const { data } = await axios.get(
        `${API_URL}/criteriosEvaluacion/llamadas`,
      );

      setDataTipoLlamada(data.llamadas);
      setFilterDataTipoLlamada(data.llamadas);
    } catch (error) {
      console.log(error);

      const msg =
        error?.response?.data?.msg ||
        "Ocurrió un error al obtener tipos de llamada";

      toast.error(msg);
    } finally {
      setPendingTipoLlamada(false);
    }
  };

  const getTipoGestion = async () => {
    const recordInLS = localStorage.getItem("record");

    if (!recordInLS) {
      toast.warning("No hay información de la gestión para mostrar");
      return;
    }

    const record = JSON.parse(recordInLS);

    try {
      setPendingTipoGestion(true);

      const { data } = await axios.get(
        `${API_URL}/gestionsCycWeb/tipo-gestion-cartera`,
        {
          params: {
            cartera: record.ID_CARTERA,
          },
        },
      );

      setDataTipoGestion(data.data);
      setFilterDataTipoGestion(data.data);
    } catch (error) {
      console.error(error);

      const msg =
        error?.response?.data?.message ||
        "Ocurrió un error al obtener tipos de gestión";

      toast.error(msg);
    } finally {
      setPendingTipoGestion(false);
    }
  };

  const getMotivoNoPago = async () => {
    const recordInLS = localStorage.getItem("record");

    if (!recordInLS) {
      toast.warning("No hay información de la gestión para mostrar");
      return;
    }

    const record = JSON.parse(recordInLS);

    try {
      setPendingMotivoNoPago(true);

      const { data } = await axios.get(
        `${API_URL}/gestionsCycWeb/mot-no-pag-cartera`,
        {
          params: {
            cartera: record.ID_CARTERA,
          },
        },
      );

      setDataMotivoNoPago(data.data);
      setFilterDataMotivoNoPago(data.data);
    } catch (error) {
      console.error(error);

      const msg =
        error?.response?.data?.message ||
        "Ocurrió un error al obtener motivos de no pago";

      toast.error(msg);
    } finally {
      setPendingMotivoNoPago(false);
    }
  };

  const getResponsableNoFCR = async () => {
    try {
      setPendingResponsableNoFCR(true);

      const { data } = await axios.get(
        `${API_URL}/gestionsCycWeb/responsable-no-fcr`,
      );

      setDataResponsableNoFCR(data.data);
      setFilterDataResponsableNoFCR(data.data);
    } catch (error) {
      console.error(error);

      const msg =
        error?.response?.data?.message ||
        "Ocurrió un error al obtener responsables No FCR";

      toast.error(msg);
    } finally {
      setPendingResponsableNoFCR(false);
    }
  };

  const getMotivoNoFCR = async (idResponsable) => {
    if (!idResponsable) {
      setDataMotivoNoFCR([]);
      setFilterDataMotivoNoFCR([]);
      return;
    }

    try {
      setPendingMotivoNoFCR(true);

      const { data } = await axios.get(
        `${API_URL}/gestionsCycWeb/motivo-no-fcr`,
        {
          params: {
            responsable: idResponsable,
          },
        },
      );

      setDataMotivoNoFCR(data.data);
      setFilterDataMotivoNoFCR(data.data);
    } catch (error) {
      console.error(error);

      const msg =
        error?.response?.data?.message ||
        "Ocurrió un error al obtener motivos No FCR";

      toast.error(msg);
    } finally {
      setPendingMotivoNoFCR(false);
    }
  };

  const getMotivoAlerta = async () => {
    try {
      setPendingMotivoAlerta(true);

      const { data } = await axios.get(
        `${API_URL}/gestionsCycWeb/motivo-alerta`,
      );

      setDataMotivoAlerta(data.data);
      setFilterDataMotivoAlerta(data.data);
    } catch (error) {
      console.error(error);

      const msg =
        error?.response?.data?.message ||
        "Ocurrió un error al obtener motivos de alerta";

      toast.error(msg);
    } finally {
      setPendingMotivoAlerta(false);
    }
  };

  const getFormularioEvaluacionByCartera = async () => {
    const recordInLS = localStorage.getItem("record");

    if (!recordInLS) {
      toast.warning("No hay información de la gestión para mostrar");
      return;
    }

    const record = JSON.parse(recordInLS);

    try {
      setPendingFormularioEvaluacion(true);

      const { data } = await axios.get(
        `${API_URL}/gestionsCycWeb/criterios-evaluacion-por-cartera`,
        { params: { cartera: record.ID_CARTERA } },
      );

      const estructura = buildFormularioEvaluacion(data.acciones);

      setFormularioEvaluacion(estructura);
    } catch (error) {
      console.error(error);

      const msg =
        error?.response?.data?.msg ||
        "Ocurrió un error al obtener formulario de evaluación";

      toast.error(msg);
    } finally {
      setPendingFormularioEvaluacion(false);
    }
  };

  // ========================= FIN PETICIONES GET =========================

  const activeItem = useMemo(() => {
    return formularioEvaluacion.find((i) => i.idItem === activeItemId);
  }, [formularioEvaluacion, activeItemId]);

  useEffect(() => {
    getTipoLlamada();
    getTipoGestion();
    getMotivoNoPago();
    getResponsableNoFCR();
    getMotivoAlerta();
    getFormularioEvaluacionByCartera();
  }, []);

  useEffect(() => {
    if (calificacionGestion.isAlerta) {
      setCalificacionGestion((prev) => ({
        ...prev,
        idResponsableNoFCR: null,
        nombreResponsableNoFCR: "",
        idMotivoNoFCR: null,
        nombreMotivoNoFCR: "",
      }));
    } else {
      setCalificacionGestion((prev) => ({
        ...prev,
        idMotivoAlerta: null,
        nombreMotivoAlerta: "",
      }));
    }
  }, [calificacionGestion.isAlerta]);

  useEffect(() => {
    if (!activeItemId && formularioEvaluacion.length > 0) {
      setActiveItemId(formularioEvaluacion[0].idItem);
    }
  }, [formularioEvaluacion, activeItemId]);

  useEffect(() => {
    let interval = null;

    if (timerActivo && calificacionGestion.horaInicio) {
      interval = setInterval(() => {
        const ahora = moment();

        const segundos = ahora.diff(
          moment(calificacionGestion.horaInicio),
          "seconds",
        );

        setCalificacionGestion((prev) => ({
          ...prev,
          duracionMonitoreo: segundos,
        }));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timerActivo, calificacionGestion.horaInicio]);

  return (
    <EvaluacionContext.Provider
      value={{
        // Selects
        refSelectTipoLlamada,
        selectTipoLlamada,
        dataTipoLlamada,
        filterDataTipoLlamada,
        PendingTipoLlamada,
        getTipoLlamada,
        refSelectTipoGestion,
        selectTipoGestion,
        dataTipoGestion,
        filterDataTipoGestion,
        PendingTipoGestion,
        getTipoGestion,
        refSelectMotivoNoPago,
        selectMotivoNoPago,
        dataMotivoNoPago,
        filterDataMotivoNoPago,
        PendingMotivoNoPago,
        getMotivoNoPago,
        calificacionGestion,
        handleChangeCalificacionGestion,
        infoGestion,
        fillInfoGestion,

        refSelectResponsableNoFCR,
        selectResponsableNoFCR,
        dataResponsableNoFCR,
        filterDataResponsableNoFCR,
        pendingResponsableNoFCR,

        refSelectMotivoNoFCR,
        selectMotivoNoFCR,
        dataMotivoNoFCR,
        filterDataMotivoNoFCR,
        pendingMotivoNoFCR,
        getMotivoNoFCR,

        refSelectMotivoAlerta,
        selectMotivoAlerta,
        dataMotivoAlerta,
        filterDataMotivoAlerta,
        pendingMotivoAlerta,

        formularioEvaluacion,
        pendingFormularioEvaluacion,

        // observaciones por item
        observacionPorItem,
        handleChangeObservacionItem,
        activeItemId,
        respuestaPorCriterio,
        changeActiveItem,
        handleChangeAccion,
        activeItem,

        // NEXT/PREV
        currentIndex,
        goNextItem,
        goPrevItem,
        isFirstItem,
        isLastItem,
        saveEvaluacion,

        iniciarMonitoreo,
        finalizarMonitoreo,
        timerActivo,
      }}
    >
      {children}
    </EvaluacionContext.Provider>
  );
};
