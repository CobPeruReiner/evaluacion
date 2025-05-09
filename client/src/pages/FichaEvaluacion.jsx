import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import "./FichaEvaluacion.css";
import "./FichaEvaluacion2.css";
import infoFicha01 from "../../infoFicha01";
import infoFicha02 from "../../infoFicha02";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { checkToken } from "../store/actions/user.actions";
import { getWeekOfMonth, format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { Message } from "../components/messages/Message";
import { ErrorMessage } from "../components/messages/ErrorMessage";
import { setGestion } from "../store/actions/currentGestion.actions";

const FICHAS_URL = `${import.meta.env.VITE_API_URL}api/v1/fichas/`;

const optionsTipoLlamada = [
  { label: "Monitoreo Calidad", value: "Monitoreo Calidad" },
  { label: "Monitoreo Operaciones", value: "Monitoreo Operaciones" },
  { label: "Monitoreo Formación", value: "Monitoreo Formación" },
  { label: "No evaluable", value: "No evaluable" },
];

const optionsTipoGestion = [
  { label: "Preventiva", value: "Preventiva" },
  { label: "Sin compromiso", value: "Sin compromiso" },
  { label: "Promesa de pago - Negativa", value: "Promesa de pago - Negativa" },
  {
    label: "Promesa de pago - Predispuesto",
    value: "Promesa de pago - Predispuesto",
  },
  { label: "No evaluable", value: "No evaluable" },
];

const optionsMotivoNoPago = [
  {
    label: "No aplica - Cliente predispuesto",
    value: "No aplica - Cliente predispuesto",
  },
  { label: "Asesor no indaga motivo", value: "Asesor no indaga motivo" },
  { label: "No cuenta con trabajo", value: "No cuenta con trabajo" },
  {
    label: "Negocio genera poco ingreso",
    value: "Negocio genera poco ingreso",
  },
  { label: "Negocio quebró", value: "Negocio quebró" },
  { label: "Internado por salud", value: "Internado por salud" },
  { label: "Se encuentra mal de salud", value: "Se encuentra mal de salud" },
  { label: "Gastos por salud familiar", value: "Gastos por salud familiar" },
  { label: "Gastos por salud", value: "Gastos por salud" },
  { label: "Está de viaje", value: "Está de viaje" },
  { label: "Retraso pago de haberes", value: "Retraso pago de haberes" },
  { label: "Vive zona alejada-rural", value: "Vive zona alejada-rural" },
  { label: "No tiene tiempo", value: "No tiene tiempo" },
  { label: "Cuenta con Covid-19", value: "Cuenta con Covid-19" },
  { label: "Reducción de ingresos", value: "Reducción de ingresos" },
  { label: "Paro tranportistas", value: "Paro tranportistas" },
  { label: "Desea reprogramar", value: "Desea reprogramar" },
  { label: "Desea refinanciar", value: "Desea refinanciar" },
  { label: "Gastos escolares", value: "Gastos escolares" },
  {
    label: "Ha cancelado deuda otra entidad financiera",
    value: "Ha cancelado deuda otra entidad financiera",
  },
  { label: "Cuenta con reclamo", value: "Cuenta con reclamo" },
  { label: "Generará reclamo", value: "Generará reclamo" },
  { label: "No reconoce deuda", value: "No reconoce deuda" },
  {
    label: "Inconforme con monto de la deuda",
    value: "Inconforme con monto de la deuda",
  },
  {
    label: "Responsable del pago es un tercero",
    value: "Responsable del pago es un tercero",
  },
  {
    label: "Se acercará a tienda/oficina",
    value: "Se acercará a tienda/oficina",
  },
  { label: "Espera de pagos de haberes", value: "Espera de pagos de haberes" },
  {
    label: "No tiene acceso agencia / agente",
    value: "No tiene acceso agencia / agente",
  },
  {
    label: "No tiene acceso app / banca por internet",
    value: "No tiene acceso app / banca por internet",
  },
  { label: "Olvidó fecha de pago", value: "Olvidó fecha de pago" },
  {
    label: "A a espera de préstamo/dinero",
    value: "A a espera de préstamo/dinero",
  },
  { label: "No quiere indicar motivo", value: "No quiere indicar motivo" },
  { label: "Robo / Hurto", value: "Robo / Hurto" },
  {
    label: "Ya conversó con su analista",
    value: "Ya conversó con su analista",
  },
  { label: "Otros", value: "Otros" },
];

const optionsMotivoAlerta = [
  {
    label: "Llamada entrecortada - cliente lo nota",
    value: "Llamada entrecortada - cliente lo nota",
  },
  {
    label: "Llamada entrecortada - grabación",
    value: "Llamada entrecortada - grabación",
  },
  { label: "PDP falsa", value: "PDP falsa" },
  {
    label: "Reincidencia error reforzado",
    value: "Reincidencia error reforzado",
  },
  { label: "No cumple secreto bancario", value: "No cumple secreto bancario" },
  { label: "Fraude en gestión", value: "Fraude en gestión" },
  { label: "Otros", value: "Otros" },
];

const optionsResponsableNoFCR = [
  { label: "Asesor", value: "Asesor" },
  { label: "Cliente", value: "Cliente" },
  { label: "SI_FCR", value: "SI_FCR" },
];

const optionsMotivoNoFCR = {
  Asesor: [
    {
      label: "No rebate las veces establecidas (insistencia)",
      value: "No rebate las veces establecidas (insistencia)",
    },
    { label: "No rebate objeciones", value: "No rebate objeciones" },
    {
      label: "No exige el pago (urgencia)",
      value: "No exige el pago (urgencia)",
    },
    {
      label: "No exige el pago de manera correcta",
      value: "No exige el pago de manera correcta",
    },
    { label: "No concientiza al cliente", value: "No concientiza al cliente" },
    { label: "As - corta llamada", value: "As - corta llamada" },
  ],
  Cliente: [
    { label: "Cliente corta llamada", value: "Cliente corta llamada" },
    {
      label: "Asesor realiza gestión correcta",
      value: "Asesor realiza gestión correcta",
    },
  ],
  SI_FCR: [
    { label: "Cliente predispuesto", value: "Cliente predispuesto" },
    {
      label: "Asesor logra pdp correctamente",
      value: "Asesor logra pdp correctamente",
    },
  ],
};

export const FichaEvaluacion = () => {
  const [showMessage, setShowMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [tab, setTab] = useState("apertura");

  const isAuth = useSelector((state) => state.user.isAuth);
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();

  const currentRow = useSelector(
    (state) => state.currentGestion.currentGestion
  );

  //CRONOMETRO
  const [segundos, setSegundos] = useState(0);
  const [minutos, setMinutos] = useState(0);
  const [porcentaje, setPorcentaje] = useState(0);
  const [infoFicha, setInfoFicha] = useState(null);

  const dispatch = useDispatch();
  //  APERTURA

  const [selectedAperturaState11, setSelectedAperturaState11] = useState("");

  const [selectedAperturaState12, setSelectedAperturaState12] = useState("");

  const [selectedAperturaState13, setSelectedAperturaState13] = useState("");

  const [selectedIndagacionState21, setSelectedIndagacionState21] =
    useState("");

  const [selectedIndagacionState22, setSelectedIndagacionState22] =
    useState("");

  const [selectedIndagacionState23, setSelectedIndagacionState23] =
    useState("");

  // MANEJO
  const [selectedManejoState31, setSelectedManejoState31] = useState("");

  const [selectedManejoState32, setSelectedManejoState32] = useState("");

  // CIERRE
  const [selectedCierreState41, setSelectedCierreState41] = useState("");

  const [selectedCierreState42, setSelectedCierreState42] = useState("");

  // HABILIDADES
  const [selectedHabilidadesState51, setSelectedHabilidadesState51] =
    useState("");

  const [selectedHabilidadesState52, setSelectedHabilidadesState52] =
    useState("");

  const [selectedHabilidadesState53, setSelectedHabilidadesState53] =
    useState("");

  // HERRAMIENTAS
  const [selectedHerramientasState61, setSelectedHerramientasState61] =
    useState("");

  const [selectedHerramientasState62, setSelectedHerramientasState62] =
    useState("");

  // useRefs
  const aperturaState11Ref = useRef();
  const aperturaState12Ref = useRef();
  const aperturaState13Ref = useRef();
  const indagacionState21Ref = useRef();
  const indagacionState22Ref = useRef();
  const indagacionState23Ref = useRef();
  const manejoState31Ref = useRef();
  const manejoState32Ref = useRef();
  const cierreState41Ref = useRef();
  const cierreState42Ref = useRef();
  const habilidadesState51Ref = useRef();
  const habilidadesState52Ref = useRef();
  const habilidadesState53Ref = useRef();
  const herramientasState61Ref = useRef();
  const herramientasState62Ref = useRef();

  const tipoLlamadaRef = useRef();
  const tipoGestionRef = useRef();
  const motivoNoPagoRef = useRef();
  const motivoAlertaRef = useRef();
  const responsableNoFcrRef = useRef();
  const motivoNoFcrRef = useRef();

  const [fichaDatos, setFichaDatos] = useState({
    id_evaluacion: "",
    cartera: "",
    tramo: "",
    mes_llamada: "",
    fecha_llamada: "",
    semana_llamada: 0,
    telefono: "",
    dni_cliente: "",
    resultado: "",
    hora_llamada: "",
    tmo_segundos: 0,
    tipo_llamada: "",
    tipo_gestion: "",
    alerta: "NO",
    descripcion_alerta: "",
    motivo_no_pago: "",
    responsabilidad_no_fcr: "",
    motivo_no_fcr: "",
    // audio_nombre: '',
    fecha_monitoreo: "",
    nombre_monitor: "",
    rol: "",
    hora_inicio: "",
    hora_fin: "",
    duracion_monitoreo: 0,
    saludo_11: "",
    contactar_con_persona_12: "",
    identificacion_gestor_13: "",
    apertura: 0,
    apertura_completado: 0,
    brindar_informacion_21: "",
    indagar_motivo_no_pago_22: "",
    asesorar_23: "",
    indagacion: 0,
    indagacion_completado: 0,
    mantiene_sentido_urgencia_31: "",
    perseverancia_objetivo_32: "",
    manejo: 0,
    manejo_completado: 0,
    reafirmar_acuerdos_41: "",
    despedida_cliente_42: "",
    cierre: 0,
    cierre_completado: 0,
    escucha_activa_51: "",
    comunicacion_cliente_52: "",
    amabilidad_cliente_53: "",
    habilidades: 0,
    habilidades_completado: 0,
    uso_herramientas_61: "",
    registro_gestiones_62: "",
    herramientas: 0,
    herramientas_completado: 0,
    calificacion_final: "",
    observaciones: "",
    tipo_ficha: "",
  });

  const [fichaBloquePorcentaje, setFichaBloquePorcentaje] = useState();
  const [fichaBloquePorcentajeCompletado, setFichaBloquePorcentajeCompletado] =
    useState();

  const [tipoGestionSelect, setTipoGestionSelect] = useState("");

  const handleMessage = () => {
    setShowMessage(false);
    // window.location.reload(); used in alpha project

    // HACK TO CLOSE DE WINDOW (TRY TO FIX IT IN THE FUTURE, 'CAUSE |IS NOT RECOMMENDED!)
    window.opener = null;
    window.open("", "_self");
    window.close();

    // navigate('/') last used
  };

  const handleErrorMessage = () => {
    setShowErrorMessage(false);
  };

  const handleSelectOption = (data, ref) => {
    setFichaDatos((prevFichaDatos) => {
      return {
        ...prevFichaDatos,
        [ref.current.props.name]: data.label,
      };
    });
    if (ref.current.props.name === "tipo_gestion") {
      setTipoGestionSelect({ label: data.label, value: data.value });
    }
    if (
      data.label === "No evaluable" &&
      ref.current.props.name === "tipo_llamada"
    ) {
      setNoEvaluableOptions();
      setTipoGestionSelect({ label: "No evaluable", value: "No evaluable" });
      setFichaDatos((prevFichaDatos) => {
        return {
          ...prevFichaDatos,
          tipo_gestion: "No evaluable",
        };
      });
    }
  };

  // Set No aplica to all Select items
  const setNoEvaluableOptions = () => {
    setSelectedAperturaState11({ label: "No aplica", value: "No aplica" });
    setSelectedAperturaState12({ label: "No aplica", value: "No aplica" });
    setSelectedAperturaState13({ label: "No aplica", value: "No aplica" });
    setSelectedIndagacionState21({ label: "No aplica", value: "No aplica" });
    setSelectedIndagacionState22({ label: "No aplica", value: "No aplica" });
    setSelectedIndagacionState23({ label: "No aplica", value: "No aplica" });
    setSelectedManejoState31({ label: "No aplica", value: "No aplica" });
    setSelectedManejoState32({ label: "No aplica", value: "No aplica" });
    setSelectedCierreState41({ label: "No aplica", value: "No aplica" });
    setSelectedCierreState42({ label: "No aplica", value: "No aplica" });
    setSelectedHabilidadesState51({ label: "No aplica", value: "No aplica" });
    setSelectedHabilidadesState52({ label: "No aplica", value: "No aplica" });
    setSelectedHabilidadesState53({ label: "No aplica", value: "No aplica" });
    setSelectedHerramientasState61({ label: "No aplica", value: "No aplica" });
    setSelectedHerramientasState62({ label: "No aplica", value: "No aplica" });

    setFichaDatos((prevFichaDatos) => {
      return {
        ...prevFichaDatos,
        saludo_11: "No aplica",
        contactar_con_persona_12: "No aplica",
        identificacion_gestor_13: "No aplica",
        brindar_informacion_21: "No aplica",
        indagar_motivo_no_pago_22: "No aplica",
        asesorar_23: "No aplica",
        mantiene_sentido_urgencia_31: "No aplica",
        perseverancia_objetivo_32: "No aplica",
        reafirmar_acuerdos_41: "No aplica",
        despedida_cliente_42: "No aplica",
        escucha_activa_51: "No aplica",
        comunicacion_cliente_52: "No aplica",
        amabilidad_cliente_53: "No aplica",
        uso_herramientas_61: "No aplica",
        registro_gestiones_62: "No aplica",
        calificacion_final: "No aplica",
      };
    });
  };

  const handleCheckboxOption = (e) => {
    setShowMotivoAlerta(e.target.checked);
    setFichaDatos((prevFichaDatos) => {
      return {
        ...prevFichaDatos,
        [e.target.name]: e.target.checked ? "SI" : "NO",
      };
    });
  };

  const [startTime, setStartTime] = useState("");

  useEffect(() => {
    if (!isAuth) dispatch(checkToken(navigate));
    if (!user) return;

    const recordInLS = localStorage.getItem("record");
    if (recordInLS) {
      dispatch(setGestion(JSON.parse(recordInLS)));
    }
    setStartTime(new Date());
    getWeekOfMonth(new Date(), { weekStartsOn: 1 });
  }, [isAuth, dispatch, user]);

  const [fichaName, setFichaName] = useState();

  useEffect(() => {
    // Get ficha (ficha01 or ficha02) by cartera
    if (currentRow.CARTERA) {
      axios
        .get(`${FICHAS_URL}tipoFicha`, {
          params: { cartera: currentRow.CARTERA },
        })
        .then((res) => {
          setInfoFicha(
            res.data.fichas[0].ficha === "ficha01" ? infoFicha01 : infoFicha02
          );
          setFichaName(
            res.data.fichas[0].ficha === "ficha01" ? "FICHA 01" : "FICHA 02"
          );
        })
        .catch((err) => {
          console.log(err);
          alert("Error al obtener ficha");
        });
    }
  }, [currentRow]);

  let timer;
  useEffect(() => {
    timer = setInterval(() => {
      setSegundos((prevSegundos) => prevSegundos + 1);
      // not recognizing segundos
      if (segundos === 59) {
        setMinutos((prevMinutos) => prevMinutos + 1);
        setSegundos(0);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [segundos]);

  const handleCancel = () => {
    window.location.reload();
    clearInterval(timer);
  };

  const handleInput = (e) => {
    const { value, name } = e.target;
    setFichaDatos((prevFichaDatos) => {
      return {
        ...prevFichaDatos,
        [name]: value,
      };
    });
  };

  const formatDate = (fecha) => {
    let [dateValues, timeValues] = fecha.split(" ");
    const indiceDia = dateValues.indexOf("/");
    const dia = dateValues.slice(0, indiceDia);
    const indiceMes = dateValues.lastIndexOf("/");
    const mes = dateValues.slice(indiceDia + 1, indiceMes);
    const año = dateValues.slice(indiceMes + 1);
    return `${mes.length === 1 ? `0${mes}` : mes}/${
      dia.length === 1 ? `0${dia}` : dia
    }/${año}`;
  };

  const getTime = (fecha) => {
    let [dateValues, timeValues] = fecha.split(" ");
    return timeValues;
  };

  const getDate = (fecha) => {
    let [dateValues, timeValues] = fecha.split(" ");
    return dateValues;
  };

  const handleEmptyFields = (object) => {
    const isFalsy = Object.values(object).some((value) => {
      if (!value || value === "NO") {
        /*NO cause of checkbox*/
        // console.log("falta", value);
        return true;
      }
      return false;
    });

    return isFalsy;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const endTime = new Date();

    let isThereAnEmpty;

    if (fichaDatos.alerta === "SI") {
      const {
        id_evaluacion,
        cartera,
        tramo,
        mes_llamada,
        fecha_llamada,
        semana_llamada,
        telefono,
        dni_cliente,
        resultado,
        hora_llamada,
        responsabilidad_no_fcr,
        motivo_no_fcr,
        fecha_monitoreo,
        nombre_monitor,
        rol,
        hora_inicio,
        hora_fin,
        duracion_monitoreo,
        tipo_ficha,
        calificacion_final,
        apertura,
        indagacion,
        manejo,
        cierre,
        habilidades,
        herramientas,
        apertura_completado,
        indagacion_completado,
        manejo_completado,
        cierre_completado,
        habilidades_completado,
        herramientas_completado,
        // audio_nombre,
        ...currentFields
      } = fichaDatos;
      isThereAnEmpty = handleEmptyFields(currentFields);
    } else {
      const {
        id_evaluacion,
        cartera,
        tramo,
        mes_llamada,
        fecha_llamada,
        semana_llamada,
        telefono,
        dni_cliente,
        resultado,
        hora_llamada,
        alerta,
        descripcion_alerta,
        fecha_monitoreo,
        nombre_monitor,
        rol,
        hora_inicio,
        hora_fin,
        duracion_monitoreo,
        tipo_ficha,
        // audio_nombre,
        calificacion_final,
        apertura,
        indagacion,
        manejo,
        cierre,
        habilidades,
        herramientas,
        apertura_completado,
        indagacion_completado,
        manejo_completado,
        cierre_completado,
        habilidades_completado,
        herramientas_completado,
        ...currentFields
      } = fichaDatos;
      isThereAnEmpty = handleEmptyFields(currentFields);
    }

    let difference = endTime.getTime() - startTime.getTime();

    difference = difference / 1000;
    let hourDifference = Math.floor(difference / 3600);
    difference -= hourDifference * 3600;
    let minuteDifference = Math.floor(difference / 60);
    difference -= minuteDifference * 60;
    const seconds = Math.ceil((difference % 60000) / 1000);

    // SETTING OTHER VALUES
    fichaDatos.calificacion_final =
      (Number.isInteger(porcentaje) ? +porcentaje.toFixed(2) : porcentaje) /
      100;
    fichaDatos.id_evaluacion = currentRow.ID;
    fichaDatos.cartera = currentRow.CLIENTE;
    fichaDatos.tramo = currentRow.CARTERA;
    fichaDatos.agente = currentRow.GESTOR;
    fichaDatos.agente_dni = currentRow.GESTOR_DNI;

    /********  START GET MONTH ********/
    // Suponiendo que currentRow.FECHA es "2/5/2024 08:35:22" y la zona horaria es "America/Lima"

    // Suponiendo que currentRow.FECHA puede ser "18/9/2024 11:07:54 a. m." o "18/9/2024 11:07:54 AM"
    let fechaStringOriginal = currentRow.FECHA;

    // 1. Limpiar los caracteres no imprimibles como el non-breaking space (\xa0)
    fechaStringOriginal = fechaStringOriginal.replace(/\u00a0/g, " ").trim();

    // 2. Normalizar "a. m." y "p. m." a "AM" y "PM"
    let fechaString = fechaStringOriginal.replace(
      /\s?(a\.? m\.?|p\.? m\.?)/gi,
      (match) => {
        return match.toLowerCase().includes("a") ? " AM" : " PM";
      }
    );

    // 3. Definir el formato por defecto como 24 horas
    let formatoEntrada = "d/M/yyyy HH:mm:ss"; // Este es el formato de tu fecha de entrada

    // 4. Si el string contiene AM o PM (ya normalizado), cambiamos el formato a 12 horas
    if (/AM|PM/i.test(fechaString)) {
      formatoEntrada = "d/M/yyyy hh:mm:ss a"; // Formato de 12 horas con AM/PM
    }

    // Parsear la fecha de string a Date, ajustando según el formato de entrada
    const fecha_actual = parse(fechaString, formatoEntrada, new Date());

    // Formatear la fecha para obtener el nombre del mes en español, considerando la zona horaria
    fichaDatos.mes_llamada = format(fecha_actual, "MMMM", { locale: es });

    /********  END GET MONTH ********/

    fichaDatos.fecha_llamada = getDate(currentRow.FECHA);
    fichaDatos.hora_llamada = getTime(currentRow.FECHA);
    const semana = getWeekOfMonth(new Date(formatDate(currentRow.FECHA)), {
      weekStartsOn: 0,
    });
    fichaDatos.semana_llamada = `semana 0${semana}`;

    fichaDatos.telefono = currentRow.TELEFONO;
    fichaDatos.dni_cliente = currentRow.IDENTIFICADOR;
    fichaDatos.resultado = currentRow.EFECTO;

    //audio
    const fechaActual = new Date().toLocaleString("es-PE");
    const comaIndex = fechaActual.indexOf(",");
    const soloFecha = fechaActual.slice(0, comaIndex);
    fichaDatos.fecha_monitoreo = soloFecha;
    fichaDatos.nombre_monitor = user.usuario;
    fichaDatos.rol = user.cargo;
    fichaDatos.hora_inicio =
      startTime.getHours() +
      ":" +
      `${
        startTime.getMinutes().toString().length === 1
          ? `0${startTime.getMinutes()}`
          : startTime.getMinutes()
      }` +
      ":" +
      `${
        startTime.getSeconds().toString().length === 1
          ? `0${startTime.getSeconds()}`
          : startTime.getSeconds()
      }`;
    fichaDatos.hora_fin =
      endTime.getHours() +
      ":" +
      `${
        endTime.getMinutes().toString().length === 1
          ? `0${endTime.getMinutes()}`
          : endTime.getMinutes()
      }` +
      ":" +
      `${
        endTime.getSeconds().toString().length === 1
          ? `0${endTime.getSeconds()}`
          : endTime.getSeconds()
      }`;

    fichaDatos.duracion_monitoreo = minutos * 60 + segundos;

    fichaDatos.tipo_ficha = fichaName;

    // ADD PORCENTAJE POR BLOQUE
    for (const block in fichaBloquePorcentaje) {
      fichaDatos[block] =
        (Number.isInteger(fichaBloquePorcentaje[block])
          ? +fichaBloquePorcentaje[block].toFixed(2)
          : truncarDosDecimales(fichaBloquePorcentaje[block])) / 100;
    }

    // ADD PORCENTAJE DEL COMPLETADO POR BLOQUE (NUEVO)
    for (const block in fichaBloquePorcentajeCompletado) {
      fichaDatos[`${block}_completado`] =
        fichaBloquePorcentajeCompletado[block];
    }

    if (!isThereAnEmpty) {
      axios
        .post(FICHAS_URL, fichaDatos)
        .then((res) => {
          setShowMessage(true);
        })
        .catch((err) => {
          setErrorMessage("Error al agregar");
          setShowErrorMessage(true);
          console.log(err);
        });
    } else {
      setErrorMessage("Complete todos los campos");
      setShowErrorMessage(true);
    }
  };
  // audio
  const [audioFile, setAudioFile] = useState("");
  const audioRef = useRef(null);
  const handleAudio = (e) => {
    setAudioFile(URL.createObjectURL(e.target.files[0]));
  };

  useEffect(() => {
    if (infoFicha) {
      readInfo();
      // console.log(infoFicha);
    }
  }, [fichaDatos]);

  const [showMotivoAlerta, setShowMotivoAlerta] = useState(false);

  let totalPorcentaje = 100;

  // Cambiamos los pesos de los otros parentObjects (Tabs de selects) (NO LONGER USED!!)
  const changeOtherTabs = (objectIndex) => {
    // Subtract total_peso from full percent(100)
    totalPorcentaje =
      Math.round(
        (totalPorcentaje - infoFicha[objectIndex].total_peso + Number.EPSILON) *
          100
      ) / 100;
    // totalPorcentaje = totalPorcentaje - infoFicha[objectIndex].total_peso;
    // LAST METHOD WHEN WE DIDNT HAVE INDEX BY PARAMETER
    // Get current object (using [1] element 'cause we dont have index and need unique value to identify it)
    // const propertyName = Object.keys(parentState)[1];
    // Find index of current element in Global State (infoFicha)
    // const indexFound = infoFicha.findIndex( element => element.hasOwnProperty(propertyName) )

    // ========SUBTRACTING ALL SELECTED PESOS FROM ALL SELECTS=============
    infoFicha.forEach((item) => {
      for (const key in item) {
        if (Array.isArray(item[key])) {
          item[key].forEach((element) => {
            if (element.isSelected && element.nombre === "Sí cumple") {
              setPorcentaje(
                (prevPorcentaje) =>
                  Math.round(
                    (prevPorcentaje - element.peso + Number.EPSILON) * 100
                  ) / 100
              );
            }
          });
        }
      }
    });

    // // ===================== SETTING NEW INFOFICHA WHEN ALL NO APLICA IN ONE SELECT FOUND ===================
    setInfoFicha((prevInfoFicha) =>
      prevInfoFicha.map((ficha, index) => {
        // gettings the other objects
        if (index !== objectIndex) {
          // Saving previousPeso
          const previousPeso = ficha.total_peso;
          // Looping into each object
          for (const key in ficha) {
            // Changing total_peso because of the new total peso
            if (key === "total_peso") {
              ficha.total_peso =
                Math.round(
                  ((ficha.total_peso * 100) / totalPorcentaje +
                    Number.EPSILON) *
                    100
                ) / 100;
              // ficha.total_peso = ficha.total_peso * 100 / totalPorcentaje;
            } else if (key !== "total_peso_backup") {
              // Looping into select arrays to set the new peso and peso_percent
              ficha[key] = ficha[key].map((item) => {
                if (item.nombre === "Sí cumple") {
                  const newPorcentaje =
                    Math.round(
                      ((item.peso * 100) / previousPeso + Number.EPSILON) * 100
                    ) / 100;
                  // const newPorcentaje = item.peso * 100 / previousPeso;
                  return {
                    ...item,
                    peso_percent: newPorcentaje,
                    peso:
                      Math.round(
                        ((ficha.total_peso * newPorcentaje) / 100 +
                          Number.EPSILON) *
                          100
                      ) / 100,
                    // peso: ficha.total_peso * newPorcentaje / 100,
                  };
                } else return item;
              });
            }
          }
          return ficha;
        } else return ficha;
      })
    );

    setInfoFicha((prevInfoFicha) => {
      prevInfoFicha.forEach((item) => {
        for (const key in item) {
          if (Array.isArray(item[key])) {
            item[key].forEach((element) => {
              if (element.isSelected && element.nombre === "Sí cumple") {
                setPorcentaje(
                  (prevPorcentaje) =>
                    Math.round(
                      (prevPorcentaje + element.peso + Number.EPSILON) * 100
                    ) / 100
                );
              }
            });
          }
        }
      });
      return prevInfoFicha;
    });
  };

  const handlePorcentajeFromGlobal = (
    event,
    selectArrayName,
    globalArrayIndex,
    elementRef,
    elementSetSelected
  ) => {
    // set element (value and label) to its setState (e.g: setSelectedManejoState32({value: 1, label: 'test'}))
    elementSetSelected(event);
    // set option to the main object with all selected options (identified by elementRef), handling "no evaluable" feature as well
    handleSelectOption(event, elementRef);

    // CHANGING ALL GLOBAL OBJECT JUST FOR SETTING THE isSelected option to true if the name is equal
    setInfoFicha((prevInfoFicha) => {
      // element => each global object (e.g. apertura, indagacion, etc) and their index
      return prevInfoFicha.map((element, index) => {
        // globalArrayIndex (manually indicated as parameter to match with the map index)
        // apertura = 0
        // indagacion = 1, etc
        if (index === globalArrayIndex) {
          // setting isActive to true in the selected object
          // looping array (e.g. apertura11 and setting isSelected to true where the option was selected)
          return {
            ...element,
            isActive: true,
            [selectArrayName]: element[selectArrayName].map((element) => {
              return {
                ...element,
                isSelected: element.nombre === event.value.nombre,
              };
            }),
          };
        } else return element;
      });
    });
  };

  /**************************** READ CURRENT INFO AND SET PORCENTAJE (NEW) *******************************/
  const readInfo = () => {
    // reset percentage
    // setPorcentaje(0);
    totalPorcentaje = 100;
    /************************** GLOBAL NO APLICA **************************/
    // let updatedInfoFicha = JSON.parse(JSON.stringify(infoFicha));
    let updatedInfoFicha = [...infoFicha]; // Copiamos infoFicha debido a problema de asincronismo
    let updatePorcentaje = 0;

    // substract total_peso from all tabs where all options are "no aplica"
    // updatedInfoFicha.forEach((fichaObject, index) => {
    updatedInfoFicha = updatedInfoFicha.map((fichaObject, index) => {
      // get current active objects from infoFicha

      // if (fichaObject.isActive) {  // commented because needed for the totalPorcentaje
      // functionality when applies logic only in active objects

      // set global handleNoAplica (if applies)
      // ============ Check if all options are 'No aplica' ============
      const responses = [];
      // loop over the arrays of current object, and push to responses if No aplica is selected (e.g. apertura11=>true, apertura12=>false, apertura13=>true)
      for (const key in fichaObject) {
        if (Array.isArray(fichaObject[key])) {
          const hasNoAplica = fichaObject[key].some(
            (element) => element.isSelected && element.nombre === "No aplica"
          );
          responses.push(hasNoAplica);
        }
      }

      // Validate if all responses are true, (all elements in responses array have to be true);
      const disable = responses.every((element) => element === true);

      if (disable) {
        // Subtract total_peso from full percent(100)
        totalPorcentaje =
          Math.round(
            (totalPorcentaje - fichaObject.total_peso + Number.EPSILON) * 100
          ) / 100;
        // console.log("totalPorcentaje: ", totalPorcentaje);

        return { ...fichaObject, isActive: false };
        // // ===================== SETTING NEW INFOFICHA WHEN ALL NO APLICA IN ONE SELECT FOUND ===================
        // } // END OF IF ISACTIVE (COMMENTED)
        // console.log(totalPorcentaje);
      } else return fichaObject;
    });

    /************************** INDIVIDUAL NO APLICA (MISSING 26.02.2024?) **************************/
    // Creo que solo hay que restar el total_peso de cada grupo de selects, así como restamos del 100% con el global no aplica de arriba

    // STEPS:
    // Loop to find active objects (because its not necessary to apply this if all selects are no aplica (global handle no aplica))
    // Loop into the arrays to find where No aplica is selected
    // Subtract the peso from the current object total_peso

    // Restar % actual al % total
    // Search si cumple option from current

    updatedInfoFicha = updatedInfoFicha.map((fichaObject, index) => {
      if (fichaObject.isActive) {
        // console.log('es activo: ', fichaObject.total_peso)
        let pesoSubtracted = 0;

        Object.keys(fichaObject).forEach((keyName) => {
          if (Array.isArray(fichaObject[keyName])) {
            // console.log("Es array: ", keyName);
            fichaObject[keyName].forEach((e) => {
              if (e.nombre === "No aplica" && e.isSelected) {
                // if (e.nombre === "Sí cumple" && e.isSelected) {
                // subtract peso from total_peso
                // console.log(typeof e.peso);
                const siCumple = fichaObject[keyName].find(
                  (e) => e.nombre === "Sí cumple"
                );

                pesoSubtracted += siCumple.peso;
              }
            });
          }
        });
        return {
          ...fichaObject,
          total_peso:
            fichaObject.total_peso - (pesoSubtracted > 0 ? pesoSubtracted : 0),
        };
      } else return fichaObject;
    });

    // console.log("updatedInfoFicha: ", updatedInfoFicha);

    /************************ ADD PERCENTAGES **********************/

    // set handleNoAplica in all arrays (if applies)
    const blockPorcentajesObject = {
      apertura: 0.0,
      indagacion: 0.0,
      manejo: 0.0,
      cierre: 0.0,
      habilidades: 0.0,
      herramientas: 0.0,
    };

    // GET PERCENTAGE BASED ON BLOQUE PERCENT (new requirement)
    const blockCurrentPercentage = {
      apertura: 0.0,
      indagacion: 0.0,
      manejo: 0.0,
      cierre: 0.0,
      habilidades: 0.0,
      herramientas: 0.0,
    };
    // add percentage (where Si cumple selected were found)
    // updatedInfoFicha.forEach((ficha, index) => {
    updatedInfoFicha.forEach((ficha, index) => {
      // gettings the other objects
      if (ficha.isActive) {
        // Saving previousPeso
        const previousPeso = ficha.total_peso; // 4
        // console.log("previousPeso: ", previousPeso);
        // Looping into each object
        for (const key in ficha) {
          // set new total_peso because it increased cause of noAplica in another tab, using var to access in else if
          if (key === "total_peso") {
            var newTotalPeso;
            // console.log('total peso!')
            newTotalPeso =
              Math.round(
                ((ficha.total_peso_backup * 100) / totalPorcentaje +
                  Number.EPSILON) *
                  100
              ) / 100;
          } else if (Array.isArray(ficha[key])) {
            // console.log('array!')
            // Looping into select arrays to set the new peso and peso_percent
            ficha[key].forEach((item) => {
              if (item.nombre === "Sí cumple" && item.isSelected) {
                const newPorcentaje =
                  Math.round(
                    ((item.peso * 100) / previousPeso + Number.EPSILON) * 100
                  ) / 100;

                const newPeso =
                  Math.round(newTotalPeso * newPorcentaje * 100) / 10000; // changed to peso_backup
                // const newPeso = Math.round(newTotalPeso * newPorcentaje * 100) / 10000;
                // console.log("newPeso", newPeso);

                // console.log(key + " => " + newPeso)
                // get block name by slicen las 2 chars (e.g. apertura11 => apertura)

                // get block name (e.g, herramientas61 to herramientas)
                const currentBlockName = key.slice(0, -2);

                const pesoFormatted = truncarDosDecimales(
                  Number(newPeso.toFixed(2))
                );

                // const pesoFormattedDecimal = pesoFormatted / 100
                if (blockPorcentajesObject[currentBlockName]) {
                  // blockPorcentajesObject[currentBlockName] += Number(newPeso.toFixed(2))
                  blockPorcentajesObject[currentBlockName] += pesoFormatted;
                  // blockPorcentajesObject[currentBlockName] += pesoFormattedDecimal
                } else {
                  // blockPorcentajesObject[currentBlockName] = Number(newPeso.toFixed(2))
                  blockPorcentajesObject[currentBlockName] = pesoFormatted;
                  // blockPorcentajesObject[currentBlockName] = pesoFormattedDecimal
                }

                let newPorcentaje2 =
                  Math.round(
                    (updatePorcentaje + newPeso + Number.EPSILON) * 100
                  ) / 100;
                if (
                  (newPorcentaje2 > 99 && newPorcentaje2 < 100) ||
                  (newPorcentaje2 > 100 && newPorcentaje2 < 101)
                ) {
                  updatePorcentaje = 100;
                } else updatePorcentaje = newPorcentaje2;
              }
            });
            // get array name slicing their last 2 words
            for (const blockName in blockCurrentPercentage) {
              if (key.slice(0, -2) === blockName) {
                // get new percentage (percentage sum / total_peso)
                // const caltulatedPercentage = blockPorcentajesObject[blockName] / ficha.total_peso_backup
                // WORKING BUT IT GETS BROKEN WHEN THERE IS A BLOCK WITH FULL NO APLICA OPTIONS
                // const caltulatedPercentage = truncarCuatroDecimales(blockPorcentajesObject[blockName] / ficha.total_peso_backup);
                const caltulatedPercentage = truncarCuatroDecimales(
                  blockPorcentajesObject[blockName] / newTotalPeso
                );
                blockCurrentPercentage[blockName] =
                  caltulatedPercentage > 1 ? 1 : caltulatedPercentage;
              }
            }
          }
        }
      }
    });

    // console.log(updatePorcentaje)

    setPorcentaje(updatePorcentaje);
    // console.log(updatedInfoFicha)
    console.log(blockCurrentPercentage);

    // RESET VALUES (total_peso)
    // updatedInfoFicha.forEach((fichaObject, index) => {

    updatedInfoFicha = updatedInfoFicha.map((fichaObject, index) => {
      if (fichaObject.isActive) {
        return {
          ...fichaObject,
          total_peso: fichaObject.total_peso_backup,
        };
      } else return fichaObject;
    });

    setFichaBloquePorcentaje(blockPorcentajesObject);
    setFichaBloquePorcentajeCompletado(blockCurrentPercentage);
    setInfoFicha(updatedInfoFicha);
  };

  // FUNCTIONS NEEDED BECAUSE MATH ROUND WASNT WORKING IN ALL CASES AND IT'S NOT THAT IMPORTANT TO HAVE THE EXACT DECIMALS
  function truncarDosDecimales(numero) {
    // Convertir el número a una cadena para contar los decimales
    let numeroString = numero.toString();
    // Verificar si el número tiene más de 2 decimales
    let indexPuntoDecimal = numeroString.indexOf(".");
    if (
      indexPuntoDecimal !== -1 &&
      numeroString.length - indexPuntoDecimal > 3
    ) {
      // Truncar a 2 decimales sin redondeo
      return Math.trunc(numero * 100) / 100;
      // return Number(numero.toFixed(2));
    }
    // Devolver el número original si tiene 2 decimales o menos
    return numero;
  }

  function truncarCuatroDecimales(numero) {
    // Convertir el número a una cadena para contar los decimales
    let numeroString = numero.toString();
    // Verificar si el número tiene más de 2 decimales
    let indexPuntoDecimal = numeroString.indexOf(".");
    if (
      indexPuntoDecimal !== -1 &&
      numeroString.length - indexPuntoDecimal > 5
    ) {
      // Truncar a 2 decimales sin redondeo
      return Math.trunc(numero * 10000) / 10000;
      // return Number(numero.toFixed(2));
    }
    // Devolver el número original si tiene 2 decimales o menos
    return numero;
  }

  /***************************** END READ CURRENT INFO AND SET PORCENTAJE *********************************** */
  return (
    <section className="ficha-evaluacion">
      {showMessage && (
        <Message handleMessage={handleMessage} message="Ficha agregada" />
      )}
      {showErrorMessage && (
        <ErrorMessage
          handleErrorMessage={handleErrorMessage}
          message={errorMessage}
        />
      )}
      <form className="ficha-evaluacion__form" onSubmit={handleSubmit}>
        {!user ? (
          <p>Cargando...</p>
        ) : (
          <div className="ficha-modelo__01-main">
            <h2 className="ficha-modelo__01-main__title">
              EVALUACIÓN {fichaName}
            </h2>
            <p className="ficha-modelo__01-main__time">
              {/* {horas < 10 ? '0' + horas : horas}: */}
              {minutos < 10 ? "0" + minutos : minutos}:
              {segundos < 10 ? "0" + segundos : segundos}
            </p>

            <hr />
            <div className="ficha-modelo__01">
              <h5 className="gray">CARTERA</h5>
              <p className="gray">{currentRow.CLIENTE}</p>
              <span className="gray">{currentRow.CARTERA}</span>

              <h5>ID GESTION</h5>
              <p className="span-2">{currentRow.ID}</p>

              <h5 className="gray">AGENTE</h5>
              <p className="span-2 gray">{currentRow.GESTOR}</p>

              <h5>CLIENTE</h5>
              <p className="span-2">{currentRow.IDENTIFICADOR}</p>

              <h5 className="gray">TIPIFICACIÓN</h5>
              <p className="span-2 gray">{currentRow.EFECTO}</p>

              <h5 className="gray">MOTIVO</h5>
              <p className="span-2 gray">
                {currentRow.MOTIVO ? currentRow.MOTIVO : "-"}
              </p>

              <h5 className="gray">TMO</h5>
              <div className="gray span-2">
                <input
                  type="number"
                  value={fichaDatos.tmo_segundos}
                  name="tmo_segundos"
                  onChange={handleInput}
                  className="tmo-input"
                  placeholder="tmo manual (segundos)"
                />
              </div>

              <h5>FECHA / TELÉFONO</h5>
              <p>{currentRow.FECHA}</p>
              <p>{currentRow.TELEFONO}</p>

              <h5 className="gray">Tipo de Llamada</h5>
              <div className="span-2">
                <Select
                  name="tipo_llamada"
                  ref={tipoLlamadaRef}
                  className="gray"
                  options={optionsTipoLlamada}
                  onChange={(e) => handleSelectOption(e, tipoLlamadaRef)}
                />
              </div>
              {/* <div className='tipo-gestion gray'> */}
              <h5 className="gray">Tipo de Gestión</h5>
              <Select
                className="span-2 tipo-gestion__select"
                name="tipo_gestion"
                value={tipoGestionSelect}
                ref={tipoGestionRef}
                options={optionsTipoGestion}
                onChange={(e) => handleSelectOption(e, tipoGestionRef)}
              />
              {/* </div> */}

              <h5 className="gray">Motivo no pago</h5>
              <Select
                name="motivo_no_pago"
                ref={motivoNoPagoRef}
                className="span-2 tipo-gestion__select"
                options={optionsMotivoNoPago}
                onChange={(e) => handleSelectOption(e, motivoNoPagoRef)}
              />

              <h5>ALERTA</h5>
              <div>
                <input
                  className="interferencia-checkbox"
                  type="checkbox"
                  name="alerta"
                  onChange={handleCheckboxOption}
                  checked={fichaDatos.alerta === "SI" ? true : false}
                />
              </div>
              <div>
                {showMotivoAlerta && (
                  <>
                    <h5>Motivo Alerta</h5>
                    <Select
                      name="descripcion_alerta"
                      ref={motivoAlertaRef}
                      options={optionsMotivoAlerta}
                      onChange={(e) => handleSelectOption(e, motivoAlertaRef)}
                    />
                  </>
                )}
              </div>
              {!showMotivoAlerta && (
                <>
                  <h5>Responsable no FCR</h5>
                  <div>
                    <Select
                      name="responsabilidad_no_fcr"
                      ref={responsableNoFcrRef}
                      options={optionsResponsableNoFCR}
                      onChange={(e) =>
                        handleSelectOption(e, responsableNoFcrRef)
                      }
                    />
                  </div>
                  <div>
                    <h5>Motivo no FCR</h5>
                    <Select
                      name="motivo_no_fcr"
                      ref={motivoNoFcrRef}
                      options={
                        optionsMotivoNoFCR[fichaDatos.responsabilidad_no_fcr]
                      }
                      onChange={(e) => handleSelectOption(e, motivoNoFcrRef)}
                    />
                  </div>
                </>
              )}

              <h5 className="gray">CALIFICACION</h5>
              <p className="span-2 calificacion-p gray">{porcentaje}%</p>

              <h5>AUDIO</h5>
              <div className="ficha-modelo__01__audio">
                <audio controls>
                  {audioFile && <source src={audioFile} type="audio/ogg" />}
                </audio>
              </div>
              <div>
                <label htmlFor="base" className="gray ficha-modelo__01-btn">
                  Seleccionar
                </label>
                <input
                  type="file"
                  name="base"
                  id="base"
                  onChange={handleAudio}
                  ref={audioRef}
                />
              </div>
            </div>
          </div>
        )}

        <div className="ficha-modelo__02-main">
          <button
            type="submit"
            className="ficha-modelo__01-btn ficha-modelo__02-btn"
          >
            Guardar y continuar
          </button>
          <hr />
          <div className="ficha-modelo__02">
            <ul className="ficha-modelo__02-tabs">
              <li
                onClick={() => setTab("apertura")}
                className={`${
                  tab === "apertura" ? "tab-selected" : ""
                } apertura`}
              >
                Apertura
              </li>
              <li
                onClick={() => setTab("indagacion")}
                className={tab === "indagacion" ? "tab-selected" : ""}
              >
                Indagación y asesoramiento
              </li>
              <li
                onClick={() => setTab("manejo")}
                className={tab === "manejo" ? "tab-selected" : ""}
              >
                Manejo de llamada
              </li>
              <li
                onClick={() => setTab("cierre")}
                className={tab === "cierre" ? "tab-selected" : ""}
              >
                Cierre de llamada
              </li>
              <li
                onClick={() => setTab("habilidades")}
                className={tab === "habilidades" ? "tab-selected" : ""}
              >
                Habilidades Blandas
              </li>
              <li
                onClick={() => setTab("herramientas")}
                className={tab === "herramientas" ? "tab-selected" : ""}
              >
                Uso de herramientas
              </li>
            </ul>
            {tab === "apertura" && (
              <div>
                <div className="ficha-modelo__02-tabs__item">
                  <label htmlFor="saludo_11">1.1 Saludo</label>
                  <Select
                    value={selectedAperturaState11}
                    name="saludo_11"
                    ref={aperturaState11Ref}
                    options={infoFicha?.[0]?.apertura11.map(
                      (aperturaObject) => ({
                        label: aperturaObject.nombre,
                        value: aperturaObject,
                      })
                    )}
                    onChange={(e) =>
                      handlePorcentajeFromGlobal(
                        e,
                        "apertura11",
                        0,
                        aperturaState11Ref,
                        setSelectedAperturaState11
                      )
                    }
                  />
                </div>
                <div className="ficha-modelo__02-tabs__item">
                  <label htmlFor="contactar_con_persona_12">
                    1.2 Contactar con la persona adecuada
                  </label>

                  <Select
                    value={selectedAperturaState12}
                    name="contactar_con_persona_12"
                    ref={aperturaState12Ref}
                    options={infoFicha?.[0]?.apertura12.map(
                      (aperturaObject) => ({
                        label: aperturaObject.nombre,
                        value: aperturaObject,
                      })
                    )}
                    onChange={(e) =>
                      handlePorcentajeFromGlobal(
                        e,
                        "apertura12",
                        0,
                        aperturaState12Ref,
                        setSelectedAperturaState12
                      )
                    }
                  />
                </div>
                <div className="ficha-modelo__02-tabs__item">
                  <label htmlFor="identificacion_gestor_13">
                    1.3 Identificación del gestor
                  </label>

                  <Select
                    value={selectedAperturaState13}
                    name="identificacion_gestor_13"
                    ref={aperturaState13Ref}
                    options={infoFicha?.[0]?.apertura13.map(
                      (aperturaObject) => ({
                        label: aperturaObject.nombre,
                        value: aperturaObject,
                      })
                    )}
                    onChange={(e) =>
                      handlePorcentajeFromGlobal(
                        e,
                        "apertura13",
                        0,
                        aperturaState13Ref,
                        setSelectedAperturaState13
                      )
                    }
                  />
                </div>
              </div>
            )}
            {tab === "indagacion" && (
              <div>
                <div className="ficha-modelo__02-tabs__item">
                  <label htmlFor="brindar_info">
                    2.1 Brindar información de la Situación del Producto
                  </label>

                  <Select
                    value={selectedIndagacionState21}
                    name="brindar_informacion_21"
                    ref={indagacionState21Ref}
                    options={infoFicha?.[1]?.indagacion21?.map(
                      (indagacionObject) => ({
                        label: indagacionObject.nombre,
                        value: indagacionObject,
                      })
                    )}
                    onChange={(e) =>
                      handlePorcentajeFromGlobal(
                        e,
                        "indagacion21",
                        1,
                        indagacionState21Ref,
                        setSelectedIndagacionState21
                      )
                    }
                  />
                </div>
                <div className="ficha-modelo__02-tabs__item">
                  <label htmlFor="indagar_motivo">
                    2.2 Indagar motivo de No Pago + Sustento de pago
                  </label>

                  <Select
                    value={selectedIndagacionState22}
                    name="indagar_motivo_no_pago_22"
                    ref={indagacionState22Ref}
                    options={infoFicha?.[1]?.indagacion22?.map(
                      (indagacionObject) => ({
                        label: indagacionObject.nombre,
                        value: indagacionObject,
                      })
                    )}
                    onChange={(e) =>
                      handlePorcentajeFromGlobal(
                        e,
                        "indagacion22",
                        1,
                        indagacionState22Ref,
                        setSelectedIndagacionState22
                      )
                    }
                  />
                </div>
                <div className="ficha-modelo__02-tabs__item">
                  <label htmlFor="asesorar">2.3 Asesorar</label>

                  <Select
                    value={selectedIndagacionState23}
                    name="asesorar_23"
                    ref={indagacionState23Ref}
                    options={infoFicha?.[1]?.indagacion23?.map(
                      (indagacionObject) => ({
                        label: indagacionObject.nombre,
                        value: indagacionObject,
                      })
                    )}
                    onChange={(e) =>
                      handlePorcentajeFromGlobal(
                        e,
                        "indagacion23",
                        1,
                        indagacionState23Ref,
                        setSelectedIndagacionState23
                      )
                    }
                  />
                </div>
              </div>
            )}
            {tab === "manejo" && (
              <div>
                <div className="ficha-modelo__02-tabs__item">
                  <label htmlFor="saludo">
                    3.1 Mantiene sentido de urgencia
                  </label>

                  <Select
                    value={selectedManejoState31}
                    name="mantiene_sentido_urgencia_31"
                    ref={manejoState31Ref}
                    options={infoFicha?.[2]?.manejo31?.map((manejoObject) => ({
                      label: manejoObject.nombre,
                      value: manejoObject,
                    }))}
                    onChange={(e) =>
                      handlePorcentajeFromGlobal(
                        e,
                        "manejo31",
                        2,
                        manejoState31Ref,
                        setSelectedManejoState31
                      )
                    }
                  />
                </div>
                <div className="ficha-modelo__02-tabs__item">
                  <label htmlFor="contactar_persona">
                    3.2 Perseverancia en el Objetivo/Manejo de Objeciones
                  </label>

                  <Select
                    value={selectedManejoState32}
                    name="perseverancia_objetivo_32"
                    ref={manejoState32Ref}
                    options={infoFicha?.[2]?.manejo32?.map((manejoObject) => ({
                      label: manejoObject.nombre,
                      value: manejoObject,
                    }))}
                    onChange={(e) =>
                      handlePorcentajeFromGlobal(
                        e,
                        "manejo32",
                        2,
                        manejoState32Ref,
                        setSelectedManejoState32
                      )
                    }
                  />
                </div>
              </div>
            )}
            {tab === "cierre" && (
              <div>
                <div className="ficha-modelo__02-tabs__item">
                  <label htmlFor="saludo">
                    4.1 Reafirmar acuerdos y próximos pasos (Parafraseo)
                  </label>

                  <Select
                    value={selectedCierreState41}
                    name="reafirmar_acuerdos_41"
                    ref={cierreState41Ref}
                    options={infoFicha?.[3]?.cierre41?.map((cierreObject) => ({
                      label: cierreObject.nombre,
                      value: cierreObject,
                    }))}
                    onChange={(e) =>
                      handlePorcentajeFromGlobal(
                        e,
                        "cierre41",
                        3,
                        cierreState41Ref,
                        setSelectedCierreState41
                      )
                    }
                  />
                </div>
                <div className="ficha-modelo__02-tabs__item">
                  <label htmlFor="contactar_persona">
                    4.2 Despedida del Cliente
                  </label>

                  <Select
                    value={selectedCierreState42}
                    name="despedida_cliente_42"
                    ref={cierreState42Ref}
                    options={infoFicha?.[3]?.cierre42?.map((cierreObject) => ({
                      label: cierreObject.nombre,
                      value: cierreObject,
                    }))}
                    onChange={(e) =>
                      handlePorcentajeFromGlobal(
                        e,
                        "cierre42",
                        3,
                        cierreState42Ref,
                        setSelectedCierreState42
                      )
                    }
                  />
                </div>
              </div>
            )}
            {tab === "habilidades" && (
              <div>
                <div className="ficha-modelo__02-tabs__item">
                  <label htmlFor="saludo">5.1 Escucha activa</label>

                  <Select
                    value={selectedHabilidadesState51}
                    name="escucha_activa_51"
                    ref={habilidadesState51Ref}
                    options={infoFicha?.[4]?.habilidades51?.map(
                      (habilidadesObject) => ({
                        label: habilidadesObject.nombre,
                        value: habilidadesObject,
                      })
                    )}
                    onChange={(e) =>
                      handlePorcentajeFromGlobal(
                        e,
                        "habilidades51",
                        4,
                        habilidadesState51Ref,
                        setSelectedHabilidadesState51
                      )
                    }
                  />
                </div>
                <div className="ficha-modelo__02-tabs__item">
                  <label htmlFor="contactar_persona">
                    5.2 Comunicación con el cliente
                  </label>

                  <Select
                    value={selectedHabilidadesState52}
                    name="comunicacion_cliente_52"
                    ref={habilidadesState52Ref}
                    options={infoFicha?.[4]?.habilidades52?.map(
                      (habilidadesObject) => ({
                        label: habilidadesObject.nombre,
                        value: habilidadesObject,
                      })
                    )}
                    onChange={(e) =>
                      handlePorcentajeFromGlobal(
                        e,
                        "habilidades52",
                        4,
                        habilidadesState52Ref,
                        setSelectedHabilidadesState52
                      )
                    }
                  />
                </div>
                <div className="ficha-modelo__02-tabs__item">
                  <label htmlFor="identificacion_gestor">
                    5.3 Amabilidad con el cliente
                  </label>

                  <Select
                    value={selectedHabilidadesState53}
                    name="amabilidad_cliente_53"
                    ref={habilidadesState53Ref}
                    options={infoFicha?.[4]?.habilidades53?.map(
                      (habilidadesObject) => ({
                        label: habilidadesObject.nombre,
                        value: habilidadesObject,
                      })
                    )}
                    onChange={(e) =>
                      handlePorcentajeFromGlobal(
                        e,
                        "habilidades53",
                        4,
                        habilidadesState53Ref,
                        setSelectedHabilidadesState53
                      )
                    }
                  />
                </div>
              </div>
            )}

            {tab === "herramientas" && (
              <div>
                <div className="ficha-modelo__02-tabs__item">
                  <label htmlFor="saludo">
                    6.1 Uso de Herramientas de apoyo
                  </label>

                  <Select
                    value={selectedHerramientasState61}
                    name="uso_herramientas_61"
                    ref={herramientasState61Ref}
                    options={infoFicha?.[5]?.herramientas61?.map(
                      (herramientasObject) => ({
                        label: herramientasObject.nombre,
                        value: herramientasObject,
                      })
                    )}
                    onChange={(e) =>
                      handlePorcentajeFromGlobal(
                        e,
                        "herramientas61",
                        5,
                        herramientasState61Ref,
                        setSelectedHerramientasState61
                      )
                    }
                  />
                </div>
                <div className="ficha-modelo__02-tabs__item">
                  <label htmlFor="contactar_persona">
                    6.2 Registro de gestiones
                  </label>

                  <Select
                    value={selectedHerramientasState62}
                    name="registro_gestiones_62"
                    ref={herramientasState62Ref}
                    options={infoFicha?.[5]?.herramientas62?.map(
                      (herramientasObject) => ({
                        label: herramientasObject.nombre,
                        value: herramientasObject,
                      })
                    )}
                    onChange={(e) =>
                      handlePorcentajeFromGlobal(
                        e,
                        "herramientas62",
                        5,
                        herramientasState62Ref,
                        setSelectedHerramientasState62
                      )
                    }
                  />
                </div>
              </div>
            )}
            <div>
              <textarea
                className="ficha-modelo__02-textarea"
                value={fichaDatos.observaciones}
                name="observaciones"
                onChange={handleInput}
                placeholder="Observación"
              />
            </div>
          </div>
        </div>
      </form>
    </section>
  );
};
