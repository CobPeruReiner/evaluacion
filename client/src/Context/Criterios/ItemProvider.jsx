import { useEffect, useRef, useState } from "react";
import { useOutsideClick } from "../../hooks/useOutSideClick";
import { CriteriosContext } from "./ItemContext";
import axios from "axios";
import { toast } from "sonner";
import moment from "moment";
import { useSelector } from "react-redux";
import JSZip from "jszip";
import { useNavigate } from "react-router-dom";

const initItems = {
  idItem: null,
  nombreItem: "",
  pesoItem: "",
  fechaActualizacion: null,
  idUsuarioActualizacion: null,
  idCarteras: [],
  idCarteraOriginal: null,
  idEstado: 1,
};

const initCriterios = {
  idCriterio: null,
  nombreCriterio: "",
  pesoCriterio: "",
  fechaActualizacion: null,
  idUsuarioActualizacion: null,
  idItems: [],
  idItemOriginal: null,
  idEstado: 1,
};

const initAccioness = {
  idAccion: null,
  nombreAccion: "",
  pesoAccion: "",
  fechaActualizacion: null,
  idUsuarioActualizacion: null,
  idCriterio: null,
  idEstado: 1,
};

const initMotPago = {
  idMotivo: null,
  nombreMotivo: "",
  idCartera: null,
  idEstado: 1,
};

const initTipoGestion = {
  idTipoGestion: null,
  nombreGestion: "",
  idCartera: null,
  idEstado: 1,
};

const initTipoLlamada = {
  idTipoLlamada: null,
  nombreLlamada: "",
  idEstado: 1,
};

export const CriteriosProvider = ({ children }) => {
  const API_URL = `${import.meta.env.VITE_API_URL}api/v1`;

  // Obtenemos el usuario
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();

  // Carteras
  const [carterasCyC, setCarterasCyC] = useState([]);

  // Cargamos carteras
  const loadCarterasCyC = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/gestionsCycWeb/carYcli`);

      if (data.status !== "success") {
        toast.error("Error al cargar carteras");
        throw new Error("Error al cargar carteras");
      }

      setCarterasCyC(data.clientesYcarteras);
    } catch (error) {
      console.log(error);
      toast.error("Error al cargar carteras");
    }
  };

  // ================================ Items ================================
  const refMNItem = useRef(null);
  const [modalNItem, setModalNItem] = useState(false);
  const [modoNItem, setModoNItem] = useState("new");
  const [formNItem, setFormNItem] = useState(initItems);

  const [criteriosItems, setCriteriosItems] = useState([]);
  const [criteriosItemsPaginated, setCriteriosItemsPaginated] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [isPostingNItem, setIsPostingNItem] = useState(false);
  const [exportingItems, setExportingItems] = useState(false);

  // Input de cartera
  const refSCartera = useRef(null);
  const [selectCarteraItem, setSelectCarteraItem] = useState(false);
  const [inputCarteraItemAsoc, setinputCarteraItemAsoc] = useState("");
  const [carterasCyCFiltradas, setCarterasCyCFiltradas] = useState([]);

  // Abrir/cerrar modal
  useOutsideClick(refMNItem, () => setModalNItem(false));

  const openModalNItem = (newModo = "new", newData = null) => {
    setModoNItem(newModo);

    if (newModo === "edit" && newData) {
      const pesoTransformado = Math.round(Number(newData.PESO_ITEM) * 100);

      setFormNItem({
        idItem: newData.ID_ITEM,
        nombreItem: newData.NOMBRE_ITEM,
        pesoItem: pesoTransformado,
        idCarteras: [newData.ID_CARTERA],
        idCarteraOriginal: newData.ID_CARTERA,
        idEstado: newData.ID_ESTADO,
      });

      setinputCarteraItemAsoc(newData.NOMBRE_CARTERA || "");
    } else {
      setFormNItem({
        idItem: null,
        nombreItem: "",
        pesoItem: "",
        idCarteras: [],
      });

      setinputCarteraItemAsoc("");
      setCarterasCyCFiltradas(carterasCyC);
    }

    setModalNItem(true);
  };

  const closeModalNItem = () => {
    setFormNItem(initItems);
    setinputCarteraItemAsoc("");
    setCarterasCyCFiltradas(carterasCyC);
    setModalNItem(false);
  };

  // Capturar los inputs
  const handleInputChangeFormNItem = (e) => {
    const { value, name, type, checked } = e.target;

    setFormNItem({
      ...formNItem,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
  };

  // Abrir/carrar select
  const handleSelectCartera = () => setSelectCarteraItem(!selectCarteraItem);
  useOutsideClick(refSCartera, () => setSelectCarteraItem(false));

  // Filtrar las carteras
  const filtrarCarteras = (e) => {
    const query = e.target.value.toLowerCase();
    setinputCarteraItemAsoc(query);

    if (!query) {
      setCarterasCyCFiltradas(carterasCyC);
    } else {
      setCarterasCyCFiltradas(
        carterasCyC.filter((c) => c.cartera?.toLowerCase().includes(query)),
      );
    }
  };

  // Toggle cartera (agregar / quitar)
  const toggleCarteraItem = (cartera) => {
    const { id_cartera } = cartera;

    setFormNItem((prev) => {
      const existe = prev.idCarteras.includes(id_cartera);

      return {
        ...prev,
        idCarteras: existe
          ? prev.idCarteras.filter((id) => id !== id_cartera)
          : [...prev.idCarteras, id_cartera],
      };
    });
  };

  // Enviar formulario
  const submitFormNItem = async (e) => {
    e.preventDefault();

    if (!formNItem.idCarteras.length) {
      toast.error("Debes seleccionar al menos una cartera");
      return;
    }

    const pesoOriginal = parseInt(formNItem.pesoItem, 10);

    if (isNaN(pesoOriginal) || pesoOriginal < 1 || pesoOriginal > 100) {
      toast.error("El peso debe ser un número entre 1 y 100");
      return;
    }

    // Transformar peso a decimal
    const pesoTransformado = pesoOriginal / 100;

    // Datetime
    const today = moment().format("YYYY-MM-DD HH:mm:ss");

    const formNItemFinal = {
      ...formNItem,
      fechaActualizacion: today,
      idUsuarioActualizacion: user.DOC,
      pesoItem: pesoTransformado,
    };

    setIsPostingNItem(true);

    try {
      const { data } = await axios.post(
        `${API_URL}/criteriosEvaluacion/items/create`,
        formNItemFinal,
      );

      if (!data.ok) {
        toast.error("Error al crear Item");
        throw new Error("Error al crear Item");
      }

      toast.success("Item creado");
      closeModalNItem();
      loadItem();
    } catch (error) {
      const mensajeBackend = error.response?.data?.msg;

      console.log(error);
      toast.error(mensajeBackend || "Error al crear Item");
    } finally {
      setIsPostingNItem(false);
    }
  };

  // Actualizar formulario
  const updateFormNItem = async (e) => {
    e.preventDefault();

    if (!formNItem.idCarteras.length) {
      toast.error("La cartera es obligatoria");
      return;
    }

    const pesoOriginal = Number(formNItem.pesoItem);

    if (isNaN(pesoOriginal) || pesoOriginal < 1 || pesoOriginal > 100) {
      toast.error("El peso debe ser un número entre 1 y 100");
      return;
    }

    const pesoTransformado = pesoOriginal / 100;
    const today = moment().format("YYYY-MM-DD HH:mm:ss");

    const formNItemFinal = {
      idItem: formNItem.idItem,
      nombreItem: formNItem.nombreItem,
      pesoItem: pesoTransformado,
      fechaActualizacion: today,
      idUsuarioActualizacion: user.DOC,
      idCartera: formNItem.idCarteras[0],
      idEstado: formNItem.idEstado,
    };

    setIsPostingNItem(true);

    try {
      const { data } = await axios.put(
        `${API_URL}/criteriosEvaluacion/items/update`,
        formNItemFinal,
      );

      if (!data.ok) {
        throw new Error(data.msg || "Error al actualizar Item");
      }

      toast.success("Item actualizado");
      closeModalNItem();
      loadItem();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Error al actualizar Item");
    } finally {
      setIsPostingNItem(false);
    }
  };

  // =========================== ItemsPaginacion ===========================
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const refModalPageItems = useRef(null);
  const [modalPageItems, setModalPageItems] = useState(false);
  const [curPageItems, setCurPageItems] = useState(1);
  const [totalItemsPages, setTotalItemsPages] = useState(0);
  const maxButtonsItems = 5;
  const [searchItem, setSearchItem] = useState("");

  // Busqueda
  const handleInputsearchItem = (e) => setSearchItem(e.target.value);

  // Paginacion
  const pageStarItems = Math.max(
    1,
    curPageItems - Math.floor(maxButtonsItems / 2),
  );

  // Paginacion
  const pageEndItems = Math.min(
    totalItemsPages,
    pageStarItems + maxButtonsItems - 1,
  );

  // Abrir/cerrar modal
  const handleModalPageItems = () => setModalPageItems(!modalPageItems);
  useOutsideClick(refModalPageItems, () => setModalPageItems(false));

  // Cambiar cantidad de items por pagina
  const changeItemsPerPage = (newPerPage) => {
    setItemsPerPage(newPerPage);
    setCurPageItems(1);
    setModalPageItems(false);
  };

  // Cambiar pagina actual
  const changeCurPageItems = (newPage) => {
    setCurPageItems(newPage);
  };

  // Calcular total de paginas
  const calctotalItemsPages = (filtered) => {
    const total =
      filtered && filtered.length > 0
        ? Math.ceil(filtered.length / itemsPerPage)
        : 0;

    setTotalItemsPages(total);
  };

  // Actualizar items paginados
  const updateItemsPaginated = (data = criteriosItems, page = curPageItems) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = data.slice(startIndex, endIndex);

    setCriteriosItemsPaginated(paginated);
  };

  // Filtros
  const filteredItemsCriteriosBySearch = () => {
    const queryFiltered = searchItem.toLowerCase();

    return criteriosItems.filter(
      (c) =>
        c.NOMBRE_ITEM?.toLowerCase().includes(queryFiltered) ||
        c.NOMBRE_CARTERA?.toLowerCase().includes(queryFiltered) ||
        c.NOMBRE_USUARIO_ACTUALIZACION?.toLowerCase().includes(queryFiltered) ||
        c.NOMBRE_CARTERA?.toLowerCase().includes(queryFiltered),
    );
  };

  // =========================== ItemsPaginacion ===========================

  // ================================ Criterios ================================
  const refMNCriterio = useRef(null);
  const [modalNCriterio, setModalNCriterio] = useState(false);
  const [modoNCriterio, setModoNCriterio] = useState("new");
  const [formNCriterio, setFormNCriterio] = useState(initCriterios);

  const [criteriosCriterios, setCriteriosCriterios] = useState([]);
  const [criteriosPaginated, setCriteriosPaginated] = useState([]);
  const [loadingCriterios, setLoadingCriterios] = useState(false);
  const [isPostingNCriterio, setIsPostingNCriterio] = useState(false);
  const [exportingCriterios, setExportingCriterios] = useState(false);

  // Input de cartera
  const refSItem = useRef(null);
  const [selectItemCriterio, setSelectItemCriterio] = useState(false);
  const [inputItemAsoc, setInputItemAsoc] = useState("");
  const [itemsFiltrados, setItemsFiltrados] = useState([]);

  // Abrir/cerrar modal
  useOutsideClick(refMNCriterio, () => setModalNCriterio(false));

  const openModalNCriterio = (newModo = "new", newData = null) => {
    setModoNCriterio(newModo);

    if (newModo === "edit") {
      // const pesoTransformado = newData.PESO_CRITERIO * 100;
      const pesoTransformado = Number(newData.PESO_CRITERIO) * 100;

      setFormNCriterio({
        ...formNCriterio,
        idCriterio: newData.ID_CRITERIO,
        nombreCriterio: newData.NOMBRE_CRITERIO,
        pesoCriterio: parseFloat(pesoTransformado.toFixed(2)),

        idItems: [newData.ID_ITEM],
        idItemOriginal: newData.ID_ITEM,
        idEstado: newData.ID_ESTADO,
      });

      setInputItemAsoc(`${newData.NOMBRE_ITEM}`);
      setItemsFiltrados(criteriosItems);
    } else {
      setFormNCriterio(initCriterios);
      setInputItemAsoc("");
      setItemsFiltrados(criteriosItems);
    }

    setModalNCriterio(true);
  };

  const closeModalNCriterio = () => {
    setFormNCriterio(initCriterios);
    setInputItemAsoc("");
    setItemsFiltrados(criteriosItems);
    setSelectItemCriterio(false);
    setModalNCriterio(false);
  };

  // Capturar los inputs
  const handleInputChangeFormNCriterio = (e) => {
    const { value, name, type, checked } = e.target;

    setFormNCriterio({
      ...formNCriterio,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
  };

  // Abrir/carrar select
  const handleSelectItem = () => setSelectItemCriterio(!selectItemCriterio);
  useOutsideClick(refSItem, () => setSelectItemCriterio(false));

  // Filtrar las carteras
  const filtrarItems = (e) => {
    const query = e.target.value.toLowerCase();
    setInputItemAsoc(query);

    if (!query) {
      setItemsFiltrados(criteriosItems);
      return;
    }

    const filtered = criteriosItems.filter((it) => {
      const nombre = it.NOMBRE_ITEM?.toLowerCase() || "";
      const cartera = it.NOMBRE_CARTERA?.toLowerCase() || "";
      return nombre.includes(query) || cartera.includes(query);
    });

    setItemsFiltrados(filtered);
  };

  const toggleItemCriterio = (item) => {
    const idItem = item.ID_ITEM;

    setFormNCriterio((prev) => {
      const existe = prev.idItems.includes(idItem);

      if (modoNCriterio === "edit") {
        return {
          ...prev,
          idItems: [idItem],
        };
      }

      return {
        ...prev,
        idItems: existe
          ? prev.idItems.filter((id) => id !== idItem)
          : [...prev.idItems, idItem],
      };
    });
  };

  // Seleccionar cartera
  const itemAscoCriterioSelected = (cartera) => {
    const { ID_ITEM, NOMBRE_CARTERA, NOMBRE_ITEM } = cartera;

    const query = `${NOMBRE_ITEM} - ${NOMBRE_CARTERA}`;

    // Seteamos el formulario con el id
    setFormNCriterio({
      ...formNCriterio,
      idItem: ID_ITEM,
    });

    // Seteamos el input de cartera
    setInputItemAsoc(query);

    // Cerramos el select
    setSelectItemCriterio(false);
  };

  // Enviar formulario
  const submitFormNCriterio = async (e) => {
    e.preventDefault();

    if (!formNCriterio.idItems.length) {
      toast.error("Debes seleccionar al menos un ítem");
      return;
    }

    const pesoOriginal = parseFloat(formNCriterio.pesoCriterio);
    if (isNaN(pesoOriginal) || pesoOriginal < 1 || pesoOriginal > 100) {
      toast.error("El peso debe ser un número entre 1 y 100");
      return;
    }

    const pesoTransformado = +(pesoOriginal / 100).toFixed(3);
    const today = moment().format("YYYY-MM-DD HH:mm:ss");

    const formNCriterioFinal = {
      ...formNCriterio,
      fechaActualizacion: today,
      idUsuarioActualizacion: user.DOC,
      pesoCriterio: pesoTransformado,

      idItems: formNCriterio.idItems,
    };

    setIsPostingNCriterio(true);

    try {
      const { data } = await axios.post(
        `${API_URL}/criteriosEvaluacion/criterios/create`,
        formNCriterioFinal,
      );

      if (!data.ok) {
        toast.error(data.msg || "Error al crear Criterio");
        throw new Error(data.msg || "Error al crear Criterio");
      }

      toast.success("Criterio creado");
      closeModalNCriterio();
      loadCriterios();
    } catch (error) {
      const mensajeBackend = error.response?.data?.msg;
      console.log(error);
      toast.error(mensajeBackend || "Error al crear Criterio");
    } finally {
      setIsPostingNCriterio(false);
    }
  };

  // Actualizar formulario
  const updateFormNCriterio = async (e) => {
    e.preventDefault();

    if (!formNCriterio.idItems.length) {
      toast.error("El ítem es obligatorio");
      return;
    }

    const pesoOriginal = parseFloat(formNCriterio.pesoCriterio);
    if (isNaN(pesoOriginal) || pesoOriginal < 1 || pesoOriginal > 100) {
      toast.error("El peso debe ser un número entre 1 y 100");
      return;
    }

    const pesoTransformado = +(pesoOriginal / 100).toFixed(3);
    const today = moment().format("YYYY-MM-DD HH:mm:ss");

    const formNCriterioFinal = {
      idCriterio: formNCriterio.idCriterio,
      nombreCriterio: formNCriterio.nombreCriterio,
      pesoCriterio: pesoTransformado,
      fechaActualizacion: today,
      idUsuarioActualizacion: user.DOC,

      idItem: formNCriterio.idItems[0],
      idItemOriginal: formNCriterio.idItemOriginal,
      idEstado: formNCriterio.idEstado,
    };

    setIsPostingNCriterio(true);

    try {
      const { data } = await axios.put(
        `${API_URL}/criteriosEvaluacion/criterios/update`,
        formNCriterioFinal,
      );

      if (!data.ok) {
        toast.error(data.msg || "Error al actualizar Criterio");
        throw new Error(data.msg || "Error al actualizar Criterio");
      }

      toast.success("Criterio actualizado");
      closeModalNCriterio();
      loadCriterios();
    } catch (error) {
      const mensajeBackend = error.response?.data?.msg;
      console.log(error);
      toast.error(mensajeBackend || "Error al actualizar Criterio");
    } finally {
      setIsPostingNCriterio(false);
    }
  };

  // =========================== CriteriosPaginacion ===========================
  const [CriteriosPerPage, setCriteriosPerPage] = useState(10);
  const refModalPageCriterios = useRef(null);
  const [modalPageCriterios, setModalPageCriterios] = useState(false);
  const [curPageCriterios, setCurPageCriterios] = useState(1);
  const [totalCriteriosPages, setTotalCriteriosPages] = useState(0);
  const maxButtonsCriterios = 5;
  const [searchCriterio, setSearchCriterio] = useState("");

  // Busqueda
  const handleInputsearchCriterio = (e) => setSearchCriterio(e.target.value);

  // Paginacion
  const pageStarCriterios = Math.max(
    1,
    curPageCriterios - Math.floor(maxButtonsCriterios / 2),
  );

  // Paginacion
  const pageEndCriterios = Math.min(
    totalCriteriosPages,
    pageStarCriterios + maxButtonsCriterios - 1,
  );

  // Abrir/cerrar modal
  const handleModalPageCriterios = () =>
    setModalPageCriterios(!modalPageCriterios);
  useOutsideClick(refModalPageCriterios, () => setModalPageCriterios(false));

  // Cambiar cantidad de Criterios por pagina
  const changeCriteriosPerPage = (newPerPage) => {
    setCriteriosPerPage(newPerPage);
    setCurPageCriterios(1);
    setModalPageCriterios(false);
  };

  // Cambiar pagina actual
  const changeCurPageCriterios = (newPage) => {
    setCurPageCriterios(newPage);
  };

  // Calcular total de paginas
  const calctotalCriteriosPages = (filtered) => {
    const total =
      filtered && filtered.length > 0
        ? Math.ceil(filtered.length / CriteriosPerPage)
        : 0;

    setTotalCriteriosPages(total);
  };

  // Actualizar Criterios paginados
  const updateCriteriosPaginated = (
    data = criteriosCriterios,
    page = curPageCriterios,
  ) => {
    const startIndex = (page - 1) * CriteriosPerPage;
    const endIndex = startIndex + CriteriosPerPage;
    const paginated = data.slice(startIndex, endIndex);

    setCriteriosPaginated(paginated);
  };

  // Filtros
  const filteredCriteriosCriteriosBySearch = () => {
    const queryFiltered = searchCriterio.toLowerCase();

    return criteriosCriterios.filter(
      (c) =>
        c.NOMBRE_CRITERIO?.toLowerCase().includes(queryFiltered) ||
        c.NOMBRE_ITEM?.toLowerCase().includes(queryFiltered) ||
        c.NOMBRE_USUARIO_ACTUALIZACION?.toLowerCase().includes(queryFiltered) ||
        c.NOMBRE_CARTERA?.toLowerCase().includes(queryFiltered),
    );
  };

  // =========================== CriteriosPaginacion ===========================

  function formatPercent(value, { decimals = 0 } = {}) {
    if (value == null) return "-";
    return (Number(value) * 100).toFixed(decimals);
  }

  // ================================= ACCIONES =================================
  const refMNAcciones = useRef(null);
  const [modalNAcciones, setModalNAcciones] = useState(false);
  const [modoNAcciones, setModoNAcciones] = useState("new");
  const [formNAcciones, setFormNAcciones] = useState(initAccioness);

  const [criteriosAcciones, setCriteriosAcciones] = useState([]);
  const [accionesPaginated, setaccionesPaginated] = useState([]);
  const [loadingAcciones, setLoadingAcciones] = useState(false);
  const [isPostingNAcciones, setIsPostingNAcciones] = useState(false);
  const [exportingAcciones, setExportingAcciones] = useState(false);

  // Input de cartera
  const refSCriterios = useRef(null);
  const [selectCarteraAcciones, setSelectCarteraAcciones] = useState(false);
  const [inputCarteraAccionesAsoc, setinputCarteraAccionesAsoc] = useState("");
  const [criteriosFiltrados, setcriteriosFiltrados] = useState([]);

  // Abrir/cerrar modal
  useOutsideClick(refMNAcciones, () => setModalNAcciones(false));

  const openModalNAcciones = (newModo = "new", newData = null) => {
    setModoNAcciones(newModo);

    if (newModo === "edit") {
      // const pesoTransformado = newData.PESO_ACCION_CRITERIO * 100;
      const pesoTransformado = Number(newData.PESO_ACCION_CRITERIO) * 100;

      setFormNAcciones({
        ...formNAcciones,
        idAccion: newData.ID_ACCION_CRITERIO,
        nombreAccion: newData.NOMBRE_ACCION_CRITERIO,
        pesoAccion: parseFloat(pesoTransformado.toFixed(2)),
        idCriterio: newData.ID_CRITERIO,
        idCriterioOriginal: newData.ID_CRITERIO,
        idEstado: newData.ESTADO_ACCION,
      });

      setinputCarteraAccionesAsoc(`${newData.NOMBRE_CRITERIO}`);
    } else {
      setFormNAcciones(initAccioness);
      setinputCarteraAccionesAsoc("");
      setcriteriosFiltrados(criteriosCriterios);
    }

    setModalNAcciones(true);
  };

  const closeModalNAcciones = () => {
    setFormNAcciones(initAccioness);
    setinputCarteraAccionesAsoc("");
    setcriteriosFiltrados(criteriosCriterios);
    setModalNAcciones(false);
  };

  // Capturar los inputs
  const handleInputChangeFormNAcciones = (e) => {
    const { value, name, type, checked } = e.target;

    setFormNAcciones({
      ...formNAcciones,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
  };

  // Abrir/cerrar select
  const handleSelectCriterio = () =>
    setSelectCarteraAcciones(!selectCarteraAcciones);

  useOutsideClick(refSCriterios, () => setSelectCarteraAcciones(false));

  // Filtrar criterios
  const filtrarCriterios = (e) => {
    const query = e.target.value.toLowerCase();
    setinputCarteraAccionesAsoc(query);

    if (query === "") {
      setcriteriosFiltrados(criteriosCriterios);
    } else {
      const filtered = criteriosCriterios.filter(
        (c) =>
          c.NOMBRE_CRITERIO?.toLowerCase().includes(query) ||
          c.NOMBRE_ITEM?.toLowerCase().includes(query) ||
          c.NOMBRE_CARTERA?.toLowerCase().includes(query),
      );
      setcriteriosFiltrados(filtered);
    }
  };

  // Seleccionar criterio
  const criterioAsocSelected = (criterio) => {
    const { ID_CRITERIO, NOMBRE_CRITERIO } = criterio;

    setFormNAcciones({
      ...formNAcciones,
      idCriterio: ID_CRITERIO,
    });

    setinputCarteraAccionesAsoc(NOMBRE_CRITERIO);
    setSelectCarteraAcciones(false);
  };

  // Enviar formulario
  const submitFormNAcciones = async (e) => {
    e.preventDefault();

    // const pesoOriginal = parseInt(formNAcciones.pesoAccion, 10);
    const pesoOriginal = parseFloat(formNAcciones.pesoAccion);

    if (isNaN(pesoOriginal) || pesoOriginal < 0 || pesoOriginal > 100) {
      toast.error("El peso debe ser un número entre 0 y 100");
      return;
    }

    // Transformar peso a decimal
    const pesoTransformado = pesoOriginal / 100;

    // Datetime
    const today = moment().format("YYYY-MM-DD HH:mm:ss");

    const formNAccionesFinal = {
      ...formNAcciones,
      pesoAccion: pesoTransformado,
      fechaActualizacion: today,
      idUsuarioActualizacion: user.DOC,
    };

    setIsPostingNAcciones(true);

    try {
      const { data } = await axios.post(
        `${API_URL}/criteriosEvaluacion/acciones/create`,
        formNAccionesFinal,
      );

      toast.success(data.msg || "Accion creada exitosamente");
      closeModalNAcciones();
      loadAcciones();
      setIsPostingNAcciones(false);
    } catch (error) {
      console.log(error);

      const messageBackend = error.response?.data?.msg;

      toast.error(messageBackend || "Error al crear accion");
      setIsPostingNAcciones(false);
    }
  };

  // Actualizar formulario
  const updateFormNAcciones = async (e) => {
    e.preventDefault();

    // const pesoOriginal = parseInt(formNAcciones.pesoAccion, 10);
    const pesoOriginal = parseFloat(formNAcciones.pesoAccion);

    if (isNaN(pesoOriginal) || pesoOriginal < 0 || pesoOriginal > 100) {
      toast.error("El peso debe ser un número entre 0 y 100");
      return;
    }

    // Transformar peso a decimal
    const pesoTransformado = pesoOriginal / 100;

    // Datetime
    const today = moment().format("YYYY-MM-DD HH:mm:ss");

    const formNAccionesFinal = {
      ...formNAcciones,
      pesoAccion: pesoTransformado,
      fechaActualizacion: today,
      idUsuarioActualizacion: user.DOC,
    };

    setIsPostingNAcciones(true);

    try {
      const { data } = await axios.put(
        `${API_URL}/criteriosEvaluacion/acciones/update`,
        formNAccionesFinal,
      );

      toast.success(data.msg || "Accion actualizada exitosamente");
      closeModalNAcciones();
      loadAcciones();
      setIsPostingNAcciones(false);
    } catch (error) {
      console.log(error);

      const messageBackend = error.response?.data?.msg;

      toast.error(messageBackend || "Error al actualizar accion");
      setIsPostingNAcciones(false);
    }
  };

  // ================================= ACCIONES =================================

  // =========================== Acciones Paginacion ===========================
  const [AccionesPerPage, setAccionesPerPage] = useState(10);
  const refModalPageAcciones = useRef(null);
  const [modalPageAcciones, setModalPageAcciones] = useState(false);
  const [curPageAcciones, setCurPageAcciones] = useState(1);
  const [totalAccionesPages, setTotalAccionesPages] = useState(0);
  const maxButtonsAcciones = 5;
  const [searchAcciones, setSearchAcciones] = useState("");

  // Busqueda
  const handleInputsearchAcciones = (e) => setSearchAcciones(e.target.value);

  // Paginación
  const pageStartAcciones = Math.max(
    1,
    curPageAcciones - Math.floor(maxButtonsAcciones / 2),
  );

  const pageEndAcciones = Math.min(
    totalAccionesPages,
    pageStartAcciones + maxButtonsAcciones - 1,
  );

  // Abrir/cerrar modal de cantidad por página
  const handleModalPageAcciones = () =>
    setModalPageAcciones(!modalPageAcciones);

  useOutsideClick(refModalPageAcciones, () => setModalPageAcciones(false));

  // Cambiar cantidad de acciones por página
  const changeAccionesPerPage = (newPerPage) => {
    setAccionesPerPage(newPerPage);
    setCurPageAcciones(1);
    setModalPageAcciones(false);
  };

  // Cambiar página actual
  const changeCurPageAcciones = (newPage) => {
    setCurPageAcciones(newPage);
  };

  // Calcular total de páginas
  const calcTotalAccionesPages = (filtered) => {
    const total =
      filtered && filtered.length > 0
        ? Math.ceil(filtered.length / AccionesPerPage)
        : 0;

    setTotalAccionesPages(total);
  };

  // Actualizar acciones paginadas
  const updateAccionesPaginated = (
    data = criteriosAcciones,
    page = curPageAcciones,
  ) => {
    const startIndex = (page - 1) * AccionesPerPage;
    const endIndex = startIndex + AccionesPerPage;
    const paginated = data.slice(startIndex, endIndex);

    setaccionesPaginated(paginated);
  };

  // Filtro por búsqueda
  const filteredCriteriosAccionesBySearch = () => {
    const queryFiltered = searchAcciones.toLowerCase();

    return criteriosAcciones.filter(
      (a) =>
        a.NOMBRE_ACCION_CRITERIO?.toLowerCase().includes(queryFiltered) ||
        a.NOMBRE_CRITERIO?.toLowerCase().includes(queryFiltered) ||
        a.NOMBRE_USUARIO_ACTUALIZACION?.toLowerCase().includes(queryFiltered) ||
        a.NOMBRE_CARTERA?.toLowerCase().includes(queryFiltered),
    );
  };

  // =========================== Acciones Paginacion ===========================

  // ============================== MOTIVOS NO PAGO ==============================
  const refMNMotPago = useRef(null);
  const [modalMNMotPago, setModalMNMotPago] = useState(false);
  const [modoNMotPago, setModoNMotPago] = useState("new");
  const [formNMotPago, setFormNMotPago] = useState(initMotPago);

  const [motivosNoPago, setMotivosNoPago] = useState([]);
  const [loadingMotNoPago, setLoadingMotNoPago] = useState(false);
  const [isPostingNMotNoPago, setIsPostingNMotNoPago] = useState(false);

  const refSCarteraMotNPago = useRef(null);
  const [selectCarteraMNP, setSelectCarteraMNP] = useState(false);
  const [inputCarteraMNP, setInputCarteraMNP] = useState("");
  const [carterasMotNP, setCarterasMotNP] = useState([]);
  // Abrir/carrar select
  const handleSelectCarteraMotNPago = () =>
    setSelectCarteraMNP(!selectCarteraMNP);
  useOutsideClick(refSCarteraMotNPago, () => setSelectCarteraMNP(false));

  // Filtrar las carteras
  const filtrarCarterasMotNoPago = (e) => {
    const query = e.target.value.toLowerCase();

    setInputCarteraMNP(query);

    if (query === "") {
      setCarterasMotNP(carterasCyC);
    } else {
      const filtered = carterasCyC.filter((c) =>
        c.cartera?.toLowerCase().includes(query),
      );

      setCarterasMotNP(filtered);
    }
  };

  // Seleccionar cartera
  const carteraAsocItemSelectedMotNoPago = (cartera) => {
    const { id_cartera, cartera: carteraItem, cliente } = cartera;

    const query = `${carteraItem} - ${cliente}`;

    // Seteamos el formulario con el id
    setFormNMotPago({
      ...formNMotPago,
      idCartera: id_cartera,
    });

    // Seteamos el input de cartera
    setInputCarteraMNP(query);

    // Cerramos el select
    setSelectCarteraMNP(false);
  };

  const closeModalNMotNoPago = () => {
    setModalMNMotPago(false);
    setModoNMotPago("new");
    setFormNMotPago(initMotPago);
    setInputCarteraMNP("");
    setCarterasMotNP(carterasCyC);
  };

  useOutsideClick(refMNMotPago, () => setModalMNMotPago(false));

  const handleFormNMotPago = (e) => {
    const { name, value, type, checked } = e.target;
    setFormNMotPago({
      ...formNMotPago,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
  };

  const openModalNMotNoPago = (newModo = "new", newData = null) => {
    // console.log("Abriendo modal de motivos no pago", newData);

    setModoNMotPago(newModo);

    if (newModo === "edit") {
      setFormNMotPago({
        ...formNMotPago,
        idMotivo: newData.ID_MOTIVO_NO_PAGO,
        nombreMotivo: newData.NOMBRE_MOTIVO_NO_PAGO,
        idCartera: newData.ID_CARTERA,
        idEstado: newData.ID_ESTADO,
      });

      setInputCarteraMNP(`${newData.NOMBRE_CARTERA}`);
    } else {
      setFormNMotPago(initMotPago);

      setInputCarteraMNP("");

      setCarterasMotNP(carterasCyC);
    }

    setModalMNMotPago(true);
  };

  const submitFormNMotNoPago = async (e) => {
    e.preventDefault();

    // console.log("formNMotPago", formNMotPago);

    if (!formNMotPago.nombreMotivo || !formNMotPago.idCartera) {
      return toast.error("Todos los campos son obligatorios");
    }

    setIsPostingNMotNoPago(true);

    try {
      const { data } = await axios.post(
        `${API_URL}/criteriosEvaluacion/motivos/create`,
        formNMotPago,
      );

      if (!data.ok) {
        toast.error(data.msg);

        throw new Error(data.msg);
      }

      toast.success(data.msg || "Motivo no pago creado");
      closeModalNMotNoPago();
      loadMotNoPago();
    } catch (error) {
      console.log(error);

      const mensajeBackend = error.response
        ? error.response.data.msg
        : "Error al crear motivo no pago";

      toast.error(mensajeBackend);
    } finally {
      setIsPostingNMotNoPago(false);
    }
  };

  const updateFormNMotNoPago = async (e) => {
    e.preventDefault();

    if (
      !formNMotPago.idMotivo ||
      !formNMotPago.nombreMotivo ||
      !formNMotPago.idCartera
    ) {
      return toast.error("Todos los campos son obligatorios");
    }

    setIsPostingNMotNoPago(true);

    try {
      const { data } = await axios.put(
        `${API_URL}/criteriosEvaluacion/motivos/update`,
        formNMotPago,
      );

      if (!data.ok) {
        toast.error(data.msg);

        throw new Error(data.msg);
      }

      toast.success(data.msg || "Motivo no pago actualizado");
      closeModalNMotNoPago();
      loadMotNoPago();
    } catch (error) {
      console.log(error);

      const mensajeBackend = error.response
        ? error.response.data.msg
        : "Error al actualizar motivo no pago";

      toast.error(mensajeBackend);
    } finally {
      setIsPostingNMotNoPago(false);
    }
  };

  // ============================== MOTIVOS NO PAGO ==============================

  // =========================== MOTIVOS NO PAGO Paginacion ===========================

  // Estados para la tabla paginada de motivos de no pago
  const [motivosNoPagoPaginated, setMotivosNoPagoPaginated] = useState([]);
  const [motivosPerPage, setMotivosPerPage] = useState(10);
  const [curPageMotivos, setCurPageMotivos] = useState(1);
  const [totalMotivosPages, setTotalMotivosPages] = useState(0);
  const [modalPageMotivos, setModalPageMotivos] = useState(false);
  const [searchMotivos, setSearchMotivos] = useState("");
  const refModalPageMotivos = useRef(null);

  const maxButtonsMotivos = 5;

  const handleInputSearchMotivos = (e) => setSearchMotivos(e.target.value);

  const filteredMotivosBySearch = () => {
    const query = searchMotivos.toLowerCase();
    return motivosNoPago.filter(
      (m) =>
        m.NOMBRE_MOTIVO_NO_PAGO?.toLowerCase().includes(query) ||
        m.NOMBRE_CARTERA?.toLowerCase().includes(query),
    );
  };

  // Calcular total de páginas
  const calcTotalMotivosPages = (filtered) => {
    const total = filtered?.length
      ? Math.ceil(filtered.length / motivosPerPage)
      : 0;
    setTotalMotivosPages(total);
  };

  // Actualizar motivos paginados
  const updateMotivosPaginated = (
    data = motivosNoPago,
    page = curPageMotivos,
  ) => {
    const start = (page - 1) * motivosPerPage;
    const end = start + motivosPerPage;
    setMotivosNoPagoPaginated(data.slice(start, end));
  };

  // Cambiar página actual
  const changeCurPageMotivos = (newPage) => {
    setCurPageMotivos(newPage);
  };

  // Abrir/cerrar modal para cambiar cantidad por página
  const handleModalPageMotivos = () => setModalPageMotivos(!modalPageMotivos);

  useOutsideClick(refModalPageMotivos, () => setModalPageMotivos(false));

  // Cambiar motivos por página
  const changeMotivosPerPage = (newPerPage) => {
    setMotivosPerPage(newPerPage);
    setCurPageMotivos(1);
    setModalPageMotivos(false);
  };

  // Rango de botones de paginación
  const pageStartMotivos = Math.max(
    1,
    curPageMotivos - Math.floor(maxButtonsMotivos / 2),
  );

  const pageEndMotivos = Math.min(
    totalMotivosPages,
    pageStartMotivos + maxButtonsMotivos - 1,
  );

  // =========================== MOTIVOS NO PAGO Paginacion ===========================

  // ============================== TIPOS DE GESTIÓN ==============================
  const refTipoGestion = useRef(null);
  const [modalTipoGestion, setModalTipoGestion] = useState(false);
  const [modoTipoGestion, setModoTipoGestion] = useState("new");
  const [formTipoGestion, setFormTipoGestion] = useState(initTipoGestion);

  const [tiposGestion, setTiposGestion] = useState([]);
  const [loadingTiposGestion, setLoadingTiposGestion] = useState(false);
  const [isPostingTipoGestion, setIsPostingTipoGestion] = useState(false);

  const refSCarteraTipoGestion = useRef(null);
  const [selectCarteraTipoGestion, setSelectCarteraTipoGestion] =
    useState(false);
  const [inputCarteraTipoGestion, setInputCarteraTipoGestion] = useState("");
  const [carterasTipoGestion, setCarterasTipoGestion] = useState([]);

  const handleSelectCarteraTipoGestion = () =>
    setSelectCarteraTipoGestion(!selectCarteraTipoGestion);

  useOutsideClick(refSCarteraTipoGestion, () =>
    setSelectCarteraTipoGestion(false),
  );

  // Cierre del modal al hacer click fuera
  useOutsideClick(refTipoGestion, () => setModalTipoGestion(false));

  const closeModalTipoGestion = () => {
    setModalTipoGestion(false);
    setModoTipoGestion("new");
    setFormTipoGestion(initTipoGestion);
    setInputCarteraTipoGestion("");
    setCarterasTipoGestion(carterasCyC);
  };

  const openModalTipoGestion = (modo = "new", data = null) => {
    setModoTipoGestion(modo);

    if (modo === "edit" && data) {
      setFormTipoGestion({
        idTipoGestion: data.ID_TIPO_GESTION,
        nombreGestion: data.NOMBRE_TIPO_GESTION,
        idCartera: data.ID_CARTERA,
        idEstado: data.ID_ESTADO,
      });

      setInputCarteraTipoGestion(`${data.NOMBRE_CARTERA}`);
    } else {
      setFormTipoGestion(initTipoGestion);
      setInputCarteraTipoGestion("");
      setCarterasTipoGestion(carterasCyC);
    }

    setModalTipoGestion(true);
  };

  const handleFormTipoGestion = (e) => {
    const { name, value, type, checked } = e.target;

    setFormTipoGestion({
      ...formTipoGestion,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
  };

  const submitFormTipoGestion = async (e) => {
    e.preventDefault();

    if (!formTipoGestion.nombreGestion || !formTipoGestion.idCartera) {
      return toast.error("Todos los campos son obligatorios");
    }

    setIsPostingTipoGestion(true);

    try {
      const { data } = await axios.post(
        `${API_URL}/criteriosEvaluacion/gestiones/create`,
        formTipoGestion,
      );

      if (!data.ok) throw new Error(data.msg);

      toast.success(data.msg || "Tipo de gestión creado");
      closeModalTipoGestion();
      loadTiposGestion();
    } catch (error) {
      const msg = error.response?.data?.msg || "Error al crear tipo de gestión";
      toast.error(msg);
    } finally {
      setIsPostingTipoGestion(false);
    }
  };

  const updateFormTipoGestion = async (e) => {
    e.preventDefault();

    if (
      !formTipoGestion.idTipoGestion ||
      !formTipoGestion.nombreGestion ||
      !formTipoGestion.idCartera
    ) {
      return toast.error("Todos los campos son obligatorios");
    }

    setIsPostingTipoGestion(true);

    try {
      const { data } = await axios.put(
        `${API_URL}/criteriosEvaluacion/gestiones/update`,
        formTipoGestion,
      );

      if (!data.ok) throw new Error(data.msg);

      toast.success(data.msg || "Tipo de gestión actualizado");
      closeModalTipoGestion();
      loadTiposGestion();
    } catch (error) {
      const msg =
        error.response?.data?.msg || "Error al actualizar tipo de gestión";
      toast.error(msg);
    } finally {
      setIsPostingTipoGestion(false);
    }
  };

  const filtrarCarterasTipoGestion = (e) => {
    const query = e.target.value.toLowerCase();

    setInputCarteraTipoGestion(query);

    if (query === "") {
      setCarterasTipoGestion(carterasCyC); // O la lista general
    } else {
      const filtered = carterasCyC.filter((c) =>
        c.cartera?.toLowerCase().includes(query),
      );
      setCarterasTipoGestion(filtered);
    }
  };

  const carteraAsocItemSelectedTipoGestion = (cartera) => {
    const { id_cartera, cartera: carteraItem, cliente } = cartera;

    const texto = `${carteraItem} - ${cliente}`;

    setFormTipoGestion({
      ...formTipoGestion,
      idCartera: id_cartera,
    });

    setInputCarteraTipoGestion(texto);
    setSelectCarteraTipoGestion(false);
  };

  // ============================== TIPOS DE GESTIÓN ==============================

  // ============================== TIPOS DE GESTIÓN PAGINACION ==============================

  const [tiposGestionPaginated, setTiposGestionPaginated] = useState([]);
  const [tiposPerPage, setTiposPerPage] = useState(10);
  const [curPageTipos, setCurPageTipos] = useState(1);
  const [totalTiposPages, setTotalTiposPages] = useState(0);
  const [modalPageTipos, setModalPageTipos] = useState(false);
  const [searchTipos, setSearchTipos] = useState("");
  const refModalPageTipos = useRef(null);

  const maxButtonsTipos = 5;

  const handleInputSearchTipos = (e) => setSearchTipos(e.target.value);

  const filteredTiposBySearch = () => {
    const query = searchTipos.toLowerCase();
    return tiposGestion.filter(
      (t) =>
        t.NOMBRE_TIPO_GESTION?.toLowerCase().includes(query) ||
        t.NOMBRE_CARTERA?.toLowerCase().includes(query), // si estás trayendo cartera
    );
  };

  const calcTotalTiposPages = (filtered) => {
    const total = filtered?.length
      ? Math.ceil(filtered.length / tiposPerPage)
      : 0;
    setTotalTiposPages(total);
  };

  const updateTiposPaginated = (data = tiposGestion, page = curPageTipos) => {
    const start = (page - 1) * tiposPerPage;
    const end = start + tiposPerPage;
    setTiposGestionPaginated(data.slice(start, end));
  };

  const changeCurPageTipos = (newPage) => {
    setCurPageTipos(newPage);
  };

  const handleModalPageTipos = () => setModalPageTipos(!modalPageTipos);

  useOutsideClick(refModalPageTipos, () => setModalPageTipos(false));

  const changeTiposPerPage = (newPerPage) => {
    setTiposPerPage(newPerPage);
    setCurPageTipos(1);
    setModalPageTipos(false);
  };

  const pageStartTipos = Math.max(
    1,
    curPageTipos - Math.floor(maxButtonsTipos / 2),
  );

  const pageEndTipos = Math.min(
    totalTiposPages,
    pageStartTipos + maxButtonsTipos - 1,
  );

  // ============================== TIPOS DE GESTIÓN PAGINACION ==============================

  // ============================== TIPO DE LLAMADA ==============================

  const refTipoLlamada = useRef(null);
  const [modalTipoLlamada, setModalTipoLlamada] = useState(false);
  const [modoTipoLlamada, setModoTipoLlamada] = useState("new");
  const [formTipoLlamada, setFormTipoLlamada] = useState(initTipoLlamada);

  const [tiposLlamada, setTiposLlamada] = useState([]);
  const [loadingTiposLlamada, setLoadingTiposLlamada] = useState(false);
  const [isPostingTipoLlamada, setIsPostingTipoLlamada] = useState(false);

  useOutsideClick(refTipoLlamada, () => setModalTipoLlamada(false));

  const closeModalTipoLlamada = () => {
    setModalTipoLlamada(false);
    setModoTipoLlamada("new");
    setFormTipoLlamada(initTipoLlamada);
  };

  const openModalTipoLlamada = (modo = "new", data = null) => {
    setModoTipoLlamada(modo);

    if (modo === "edit" && data) {
      setFormTipoLlamada({
        idTipoLlamada: data.ID_TIPO_LLAMADA,
        nombreLlamada: data.NOMBRE_TIPO_LLAMADA,
        idEstado: data.ID_ESTADO,
      });
    } else {
      setFormTipoLlamada(initTipoLlamada);
    }

    setModalTipoLlamada(true);
  };

  const handleFormTipoLlamada = (e) => {
    const { name, value, type, checked } = e.target;

    setFormTipoLlamada({
      ...formTipoLlamada,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
  };

  const submitFormTipoLlamada = async (e) => {
    e.preventDefault();

    if (!formTipoLlamada.nombreLlamada) {
      return toast.error("Todos los campos son obligatorios");
    }

    setIsPostingTipoLlamada(true);

    try {
      const { data } = await axios.post(
        `${API_URL}/criteriosEvaluacion/llamadas/create`,
        formTipoLlamada,
      );

      if (!data.ok) throw new Error(data.msg);

      toast.success(data.msg || "Tipo de llamada creado");
      closeModalTipoLlamada();
      loadTiposLlamada();
    } catch (error) {
      const msg = error.response?.data?.msg || "Error al crear tipo de llamada";
      toast.error(msg);
    } finally {
      setIsPostingTipoLlamada(false);
    }
  };

  const updateFormTipoLlamada = async (e) => {
    e.preventDefault();

    if (!formTipoLlamada.idTipoLlamada || !formTipoLlamada.nombreLlamada) {
      return toast.error("Todos los campos son obligatorios");
    }

    setIsPostingTipoLlamada(true);

    try {
      const { data } = await axios.put(
        `${API_URL}/criteriosEvaluacion/llamadas/update`,
        formTipoLlamada,
      );

      if (!data.ok) throw new Error(data.msg);

      toast.success(data.msg || "Tipo de llamada actualizado");
      closeModalTipoLlamada();
      loadTiposLlamada();
    } catch (error) {
      const msg =
        error.response?.data?.msg || "Error al actualizar tipo de llamada";
      toast.error(msg);
    } finally {
      setIsPostingTipoLlamada(false);
    }
  };

  // ============================== TIPO DE LLAMADA ==============================

  // ============================== TIPOS DE LLAMADA PAGINACION ==============================

  const [tiposLlamadaPaginated, setTiposLlamadaPaginated] = useState([]);
  const [tiposLlamadaPerPage, setTiposLlamadaPerPage] = useState(10);
  const [curPageTipoLlamada, setCurPageTipoLlamada] = useState(1);
  const [totalPaginasTipoLlamada, setTotalPaginasTipoLlamada] = useState(0);
  const [modalPageTipoLlamada, setModalPageTipoLlamada] = useState(false);
  const [searchTipoLlamada, setSearchTipoLlamada] = useState("");
  const refModalPageTipoLlamada = useRef(null);

  const maxButtonsTipoLlamada = 5;

  const handleInputSearchTipoLlamada = (e) =>
    setSearchTipoLlamada(e.target.value);

  const filteredTiposLlamada = () => {
    const q = searchTipoLlamada.toLowerCase();
    return tiposLlamada.filter((t) =>
      t.NOMBRE_TIPO_LLAMADA?.toLowerCase().includes(q),
    );
  };

  const calcTotalPaginasTipoLlamada = (filtered) => {
    const total = filtered?.length
      ? Math.ceil(filtered.length / tiposLlamadaPerPage)
      : 0;
    setTotalPaginasTipoLlamada(total);
  };

  const updatePaginatedTiposLlamada = (
    data = tiposLlamada,
    page = curPageTipoLlamada,
  ) => {
    const start = (page - 1) * tiposLlamadaPerPage;
    const end = start + tiposLlamadaPerPage;
    setTiposLlamadaPaginated(data.slice(start, end));
  };

  const changeCurPageTipoLlamada = (newPage) => setCurPageTipoLlamada(newPage);

  const handleModalPageTipoLlamada = () =>
    setModalPageTipoLlamada(!modalPageTipoLlamada);

  useOutsideClick(refModalPageTipoLlamada, () =>
    setModalPageTipoLlamada(false),
  );

  const changePerPageTipoLlamada = (newPerPage) => {
    setTiposLlamadaPerPage(newPerPage);
    setCurPageTipoLlamada(1);
    setModalPageTipoLlamada(false);
  };

  const pageStartTipoLlamada = Math.max(
    1,
    curPageTipoLlamada - Math.floor(maxButtonsTipoLlamada / 2),
  );

  const pageEndTipoLlamada = Math.min(
    totalPaginasTipoLlamada,
    pageStartTipoLlamada + maxButtonsTipoLlamada - 1,
  );

  // ============================== TIPOS DE LLAMADA PAGINACION ==============================

  // =============== PROCESAMIENTO DE AUDIOS ===============
  const [resultadosAuditoria, setResultadosAuditoria] = useState([]);

  // Audios
  const [isPostingAudiosProcess, setIsPostingAudiosProcess] = useState(false);

  // Almacenar .zip y mostrar audios
  const [archivos, setArchivos] = useState([]);
  const [zipFile, setZipFile] = useState(null);
  const inputRef = useRef(null);
  const [mProcesados, setMProcesados] = useState(false);

  // Efectos
  const [loadingEfectosAudios, setLoadingEfectosAudios] = useState(false);
  const [efectosAudios, setEfectosAudios] = useState([]);
  const sEfectoRef = useRef(null);
  const [selectEfecto, setSelectEfecto] = useState(false);
  const [idEfectoAudios, setIdEfectoAudios] = useState(null);
  const [inputEfecto, setInputEfecto] = useState("");

  // Procesamiento result
  const [processResultSucces, setprocessResultSuccess] = useState([]);
  const [processResultFailed, setProcessResultFailed] = useState([]);
  const [audioActivo, setAudioActivo] = useState(null);

  const refMVerCalificacion = useRef(null);
  const [mVerCalificacion, setMVerCalificacion] = useState(false);

  const [accionSeleccionada, setAccionSeleccionada] = useState("match");

  // Formulario
  const [formAuditoriaAudios, setFormAuditoriaAudios] = useState({
    idCarteras: [],
    fechaDesde: null,
    fechaHasta: null,
  });

  // CARTERAS
  const sCarterasRef = useRef(null);
  const [sCarterasActive, setSCarterasActive] = useState(false);
  const [carterasActive, setCarterasActive] = useState([]);
  const [inputCarterasActive, setInputCarterasActive] = useState("Todos");

  // Fechas
  // const sFechasRef = useRef(null);
  // const [sFechasActive, setSFechasActive] = useState(false);
  // const [fechasActive, setFechasActive] = useState([]);
  // const [inputFechasActive, setInputFechasActive] = useState("Todos");

  // Detalle Evaluacion
  const [loadingEvaluacionDetail, setLoadingEvaluacionDetail] = useState(false);
  const [evaluacionDetail, setEvaluacionDetail] = useState([]);

  const calificacionRef = useRef(null);
  const [expandedAudio, setExpandedAudio] = useState(null);
  const [showDetail, setShowDetail] = useState({});
  const [expandedBloques, setExpandedBloques] = useState({});

  // PAGINADO
  const [audiosPaginated, setAudiosPaginated] = useState([]);
  const [audiosPerPage, setAudiosPerPage] = useState(10);
  const refModalPageAudios = useRef(null);
  const [modalPageAudios, setModalPageAudios] = useState(false);
  const [curPageAudios, setCurPageAudios] = useState(1);
  const [totalAudiosPages, setTotalAudiosPages] = useState(0);
  const maxButtonsAudios = 5;
  const [searchTelefono, setSearchTelefono] = useState("");

  // Reproducir audio
  const [audioInstance, setAudioInstance] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEnReproduccion, setAudioEnReproduccion] = useState(null);

  const [duraciones, setDuraciones] = useState({});

  const setDuracionAudio = (index, duracion) => {
    setDuraciones((prev) => ({
      ...prev,
      [index]: duracion,
    }));
  };

  const reproducirAudio = (archivo, index) => {
    // Si ya está sonando ese mismo audio, pausarlo
    if (audioEnReproduccion === index && isPlaying) {
      audioInstance.pause();
      setIsPlaying(false);
      return;
    }

    // Si hay otro audio sonando, detenerlo
    if (audioInstance) {
      audioInstance.pause();
      audioInstance.currentTime = 0;
    }

    const nuevaRuta = `${import.meta.env.VITE_API_URL}audios/${archivo}`;
    const audio = new Audio(nuevaRuta);

    audio
      .play()
      .then(() => {
        setAudioInstance(audio);
        setAudioEnReproduccion(index);
        setIsPlaying(true);

        audio.onended = () => {
          setIsPlaying(false);
          setAudioInstance(null);
          setAudioEnReproduccion(null);
        };
      })
      .catch((err) => {
        console.error("Error al reproducir audio:", err);
        setIsPlaying(false);
      });
  };

  // Guardar .zip y mostrar archivos dentro de este
  const handleZip = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setZipFile(file); // guardamos el archivo original

    // Creamos la promesa a envolver
    const procesarZip = async () => {
      const zip = new JSZip();
      const contenido = await zip.loadAsync(file);
      const nuevosArchivos = [];

      await Promise.all(
        Object.keys(contenido.files).map(async (nombre) => {
          const archivo = contenido.files[nombre];
          if (
            !archivo.dir &&
            (nombre.endsWith(".mp3") || nombre.endsWith(".wav"))
          ) {
            const blob = await archivo.async("blob");

            const [fechaHora] = nombre.split("_");
            const fecha = moment(fechaHora, "YYYYMMDD-HHmmss").format(
              "DD/MM/YYYY",
            );

            nuevosArchivos.push({
              nombre,
              fecha,
              tamaño: `${(blob.size / 1024).toFixed(1)} KB`,
            });
          }
        }),
      );

      setArchivos(nuevosArchivos);
      setMProcesados(true);
    };

    // Mostramos toast mientras se procesa
    toast.promise(procesarZip(), {
      loading: "Procesando ZIP...",
      success: "Audios listos para cargar",
      error: "Error al leer el archivo ZIP",
    });
  };

  // Cerrar modal
  const closeModalProcesador = () => {
    setArchivos([]);
    setZipFile(null);
    setMProcesados(false);
  };

  // Procesar audios
  const sendAudiosProcess = async () => {
    if (zipFile === null) {
      toast.error("No se ha seleccionado un archivo ZIP");
      return;
    }

    setIsPostingAudiosProcess(true);

    try {
      const formData = new FormData();

      formData.append("zip", zipFile);
      formData.append("idEfecto", idEfectoAudios);
      formData.append("usuario", `${user?.NOMBRES} ${user?.APELLIDOS}`);

      const { data } = await axios.post(
        `${API_URL}/criteriosEvaluacion/audios`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (!data.ok) {
        toast.error(data.error || "Error al procesar audios");
        throw new Error(data.error || "Error al procesar audios");
      }

      toast.success(
        `Audios procesados: ${data.exitosos.length} exitosos, ${data.fallidos.length} fallidos`,
      );

      setprocessResultSuccess(data.exitosos);
      setProcessResultFailed(data.fallidos);
      setMVerCalificacion(true);
      setArchivos([]);
      setZipFile(null);
      setMProcesados(false);
    } catch (error) {
      console.log(error);
      toast.error("Error al procesar audios");
    } finally {
      setIsPostingAudiosProcess(false);
    }
  };

  const openMVerCalificacion = () => {
    if (processResultSucces.length === 0) {
      toast.info("No se han procesado audios");
      return;
    }

    setMVerCalificacion(true);
  };

  useOutsideClick(refMVerCalificacion, () => setMVerCalificacion(false));

  const closeMVerCalificacion = () => {
    setprocessResultSuccess([]);
    setProcessResultFailed([]);
    setMVerCalificacion(false);
  };

  const seleccionarAudio = (index) => {
    setAudioActivo(index === audioActivo ? null : index);
  };

  const seleccionarAccion = (accion) => {
    setAccionSeleccionada(accion);

    // TODO: Cagar las fichas que hicieron match con lo grabado en BD
  };

  // Mostrar efectos
  const openSEfectoAudios = () => setSelectEfecto(!selectEfecto);
  useOutsideClick(sEfectoRef, () => setSelectEfecto(false));

  // Seleccionar efecto
  const seleccionarEfectoAudios = (efecto) => {
    const { ID_EFECTO, EFECTO } = efecto;
    setInputEfecto(EFECTO);
    setIdEfectoAudios(ID_EFECTO);
    setSelectEfecto(false);
  };

  const handleSelectCarteras = () => setSCarterasActive(!sCarterasActive);
  useOutsideClick(sCarterasRef, () => setSCarterasActive(false));

  // Seleccionar cartera
  const seleccionarCartera = (cartera) => {
    const { id } = cartera;

    const isSelected = formAuditoriaAudios.idCarteras.includes(id);

    const newSelected = isSelected
      ? formAuditoriaAudios.idCarteras.filter((item) => item !== id)
      : [...formAuditoriaAudios.idCarteras, id];

    setFormAuditoriaAudios({
      ...formAuditoriaAudios,
      idCarteras: newSelected,
    });
  };

  const removerCartera = (id) => {
    const newSelected = formAuditoriaAudios.idCarteras.filter(
      (item) => item !== id,
    );

    setFormAuditoriaAudios({
      ...formAuditoriaAudios,
      idCarteras: newSelected,
    });
  };

  // Obtener resultados por rango de fecha y cartera
  const obtenerResultadosAuditoria = async () => {
    try {
      // Rango de fechas
      if (!formAuditoriaAudios.fechaDesde || !formAuditoriaAudios.fechaHasta) {
        toast.error("Debe seleccionar un rango de fechas");
        return;
      }

      // Fecha hasta menor a fecha desde
      if (
        moment(formAuditoriaAudios.fechaDesde).isAfter(
          formAuditoriaAudios.fechaHasta,
        )
      ) {
        toast.error("La fecha hasta debe ser mayor a la fecha desde");
        return;
      }

      // cartera param
      const carteraParam =
        formAuditoriaAudios.idCarteras.length > 0
          ? formAuditoriaAudios.idCarteras.join(",")
          : "Todos";

      const url = `${API_URL}/criteriosEvaluacion/auditoria?fechaDesde=${formAuditoriaAudios.fechaDesde}&fechaHasta=${formAuditoriaAudios.fechaHasta}&cartera=${carteraParam}`;

      const { data } = await axios.get(url);

      if (data.ok) {
        setResultadosAuditoria(data.resultados);
        toast.success("Resultados cargados correctamente");
      } else {
        toast.error("Error al cargar resultados");
      }
    } catch (error) {
      console.error("Error obteniendo resultados:", error);
      toast.error("Error al obtener resultados");
    }
  };

  // Obtener detalle de la evaluacion
  const obtenerDetalleEvaluacion = async (detalle = null) => {
    if (!detalle) {
      return toast.error("Debe seleccionar una evaluacion");
    }

    setLoadingEvaluacionDetail(true);

    // console.log("Detalle a enviar:", detalle);

    try {
      const { data } = await axios.get(
        `${API_URL}/criteriosEvaluacion/auditoria/detalle?archivo=${detalle}`,
      );
      if (data.ok) {
        setEvaluacionDetail(data.resultado);
      } else {
        console.error("Error al cargar detalle");
        toast.error("Error al cargar detalle");
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoadingEvaluacionDetail(false);
    }
  };

  const toggleAudio = (index) => {
    // console.log("Abriendo toggle audio");

    setExpandedAudio(expandedAudio === index ? null : index);
    setShowDetail({});
  };

  const toggleDetail = (index) => {
    console.log("Abriendo toggle detail");

    setShowDetail((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const resetAuditoriaUIState = () => {
    setExpandedAudio(null);
    setShowDetail({});
    setExpandedBloques({});
  };

  const toggleBloque = (audioIndex, bloqueKey) => {
    setExpandedBloques((prev) => ({
      ...prev,
      [audioIndex]: {
        ...prev[audioIndex],
        [bloqueKey]: !prev[audioIndex]?.[bloqueKey],
      },
    }));
  };

  useOutsideClick(calificacionRef, resetAuditoriaUIState);

  // =============== PAGINACION AUDIOS EVALUADOS ===============

  const handleInputSearchTelefono = (e) => setSearchTelefono(e.target.value);

  const pageStartAudios = Math.max(
    1,
    curPageAudios - Math.floor(maxButtonsAudios / 2),
  );

  const pageEndAudios = Math.min(
    totalAudiosPages,
    pageStartAudios + maxButtonsAudios - 1,
  );

  const handleModalPageAudios = () => setModalPageAudios(!modalPageAudios);
  useOutsideClick(refModalPageAudios, () => setModalPageAudios(false));

  const changeAudiosPerPage = (newPerPage) => {
    setAudiosPerPage(newPerPage);
    setCurPageAudios(1);
    setModalPageAudios(false);
  };

  const changeCurPageAudios = (newPage) => {
    setCurPageAudios(newPage);
  };

  const calcTotalAudiosPages = (filtered) => {
    const total =
      filtered && filtered.length > 0
        ? Math.ceil(filtered.length / audiosPerPage)
        : 0;
    setTotalAudiosPages(total);
  };

  const updateAudiosPaginated = (
    data = [
      ...(evaluacionDetail?.exitosos ?? []),
      ...(evaluacionDetail?.fallidos ?? []),
    ],
    page = curPageAudios,
  ) => {
    const startIndex = (page - 1) * audiosPerPage;
    const endIndex = startIndex + audiosPerPage;
    const paginated = data.slice(startIndex, endIndex);
    setAudiosPaginated(paginated);
  };

  const filteredBySearch = (data) => {
    const lowerCaseSearch = searchTelefono.toLowerCase();

    return data.filter((item) => {
      const partes = item.archivo.split("_");
      const telefono = partes[1] || "";
      return telefono.toLowerCase().includes(lowerCaseSearch);
    });
  };

  // ====================== FUNCIONES PARA CARGAR DATOS ======================
  const loadItem = async () => {
    setLoadingItems(true);

    try {
      const { data } = await axios.get(`${API_URL}/criteriosEvaluacion/items`);

      if (!data.ok) {
        toast.error("Error al cargar Items");
        throw new Error("Error al cargar Items");
      }

      setCriteriosItems(data.items);
    } catch (error) {
      console.log(error);
      toast.error("Error al cargar Items");
    } finally {
      setLoadingItems(false);
    }
  };

  const loadCriterios = async () => {
    setLoadingCriterios(true);

    try {
      const { data } = await axios.get(
        `${API_URL}/criteriosEvaluacion/criterios`,
      );

      if (!data.ok) {
        toast.error("Error al cargar Criterios");
        throw new Error("Error al cargar Criterios");
      }

      setCriteriosCriterios(data.criterios);
    } catch (error) {
      console.log(error);
      toast.error("Error al cargar Criterios");
    } finally {
      setLoadingCriterios(false);
    }
  };

  const loadAcciones = async () => {
    setLoadingAcciones(true);

    try {
      const { data } = await axios.get(
        `${API_URL}/criteriosEvaluacion/acciones`,
      );

      if (!data.ok) {
        toast.error("Error al cargar Acciones");
        throw new Error("Error al cargar Acciones");
      }

      setCriteriosAcciones(data.acciones);
    } catch (error) {
      console.log(error);
      toast.error("Error al cargar Acciones");
    } finally {
      setLoadingAcciones(false);
    }
  };

  const loadMotNoPago = async () => {
    setLoadingMotNoPago(true);

    try {
      const { data } = await axios.get(
        `${API_URL}/criteriosEvaluacion/motivos`,
      );

      // console.log("Motivos de no pago", data);

      if (!data.ok) {
        toast.error("Error al cargar Motivos No Pago");
        throw new Error("Error al cargar Motivos No Pago");
      }

      setMotivosNoPago(data.motivos);
    } catch (error) {
      console.log(error);
      toast.error("Error al cargar Motivos No Pago");
    } finally {
      setLoadingMotNoPago(false);
    }
  };

  const loadTiposGestion = async () => {
    setLoadingTiposGestion(true);

    try {
      const { data } = await axios.get(
        `${API_URL}/criteriosEvaluacion/gestiones`,
      );

      if (!data.ok) {
        toast.error("Error al cargar Tipos de Gestion");
        throw new Error("Error al cargar Tipos de Gestion");
      }

      setTiposGestion(data.gestiones);
    } catch (error) {
      console.log(error);
      toast.error("Error al cargar Tipos de Gestion");
    } finally {
      setLoadingTiposGestion(false);
    }
  };

  const loadTiposLlamada = async () => {
    setLoadingTiposLlamada(true);

    try {
      const { data } = await axios.get(
        `${API_URL}/criteriosEvaluacion/llamadas`,
      );

      if (!data.ok) {
        toast.error("Error al cargar Tipos de Llamada");
        throw new Error("Error al cargar Tipos de Llamada");
      }

      setTiposLlamada(data.llamadas);
    } catch (error) {
      console.log(error);
      toast.error("Error al cargar Tipos de Llamada");
    } finally {
      setLoadingTiposLlamada(false);
    }
  };

  let efectoTimeout;

  const loadEfectosAudios = (e) => {
    const value = e.target.value;
    setInputEfecto(value);

    if (!value.trim()) {
      setEfectosAudios([]);
      return;
    }

    setLoadingEfectosAudios(true);

    clearTimeout(efectoTimeout);
    efectoTimeout = setTimeout(async () => {
      try {
        const { data } = await axios.get(
          `${API_URL}/criteriosEvaluacion/efectos?filtro=${encodeURIComponent(
            value,
          )}`,
        );

        if (data.ok) {
          setEfectosAudios(data.efectos || []);
        }
      } catch (error) {
        toast.error("Error al obtener efectos");
      } finally {
        setLoadingEfectosAudios(false);
      }
    }, 500);
  };

  // Cargar efectos
  const loadCarterasActive = async () => {
    try {
      const { data } = await axios.get(
        `${API_URL}/criteriosEvaluacion/getAll-cartera`,
      );
      if (data.ok) {
        // console.log("Data:", data);
        return setCarterasActive(data.carteras);
      }

      toast.error("Error al cargar carteras");
    } catch (error) {
      console.error("Error obteniendo carteras:", error);
    }
  };

  // Cargamos las carteras del CyC
  useEffect(() => {
    loadCarterasCyC();
    loadItem();
    loadCriterios();
    loadAcciones();
    loadMotNoPago();
    loadTiposGestion();
    loadTiposLlamada();
    loadCarterasActive();
  }, []);

  useEffect(() => {
    const filteredData = searchItem.trim()
      ? filteredItemsCriteriosBySearch()
      : criteriosItems;

    if (curPageItems > Math.ceil(filteredData.length / itemsPerPage)) {
      setCurPageItems(1);
    }

    calctotalItemsPages(filteredData);
    updateItemsPaginated(filteredData, curPageItems);
  }, [searchItem, criteriosItems, itemsPerPage, curPageItems]);

  useEffect(() => {
    const filteredData = searchCriterio.trim()
      ? filteredCriteriosCriteriosBySearch()
      : criteriosCriterios;

    if (curPageCriterios > Math.ceil(filteredData.length / CriteriosPerPage)) {
      setCurPageCriterios(1);
    }

    calctotalCriteriosPages(filteredData);
    updateCriteriosPaginated(filteredData, curPageCriterios);
  }, [searchCriterio, criteriosCriterios, CriteriosPerPage, curPageCriterios]);

  useEffect(() => {
    const filteredData = searchAcciones.trim()
      ? filteredCriteriosAccionesBySearch()
      : criteriosAcciones;

    if (curPageAcciones > Math.ceil(filteredData.length / AccionesPerPage)) {
      setCurPageAcciones(1);
    }

    calcTotalAccionesPages(filteredData);
    updateAccionesPaginated(filteredData, curPageAcciones);
  }, [searchAcciones, criteriosAcciones, AccionesPerPage, curPageAcciones]);

  useEffect(() => {
    const filteredData = searchMotivos.trim()
      ? filteredMotivosBySearch()
      : motivosNoPago;

    if (curPageMotivos > Math.ceil(filteredData.length / motivosPerPage)) {
      setCurPageMotivos(1);
    }

    calcTotalMotivosPages(filteredData);
    updateMotivosPaginated(filteredData, curPageMotivos);
  }, [searchMotivos, motivosNoPago, motivosPerPage, curPageMotivos]);

  useEffect(() => {
    const filteredData = searchTipos.trim()
      ? filteredTiposBySearch()
      : tiposGestion;

    if (curPageTipos > Math.ceil(filteredData.length / tiposPerPage)) {
      setCurPageTipos(1);
    }

    calcTotalTiposPages(filteredData);
    updateTiposPaginated(filteredData, curPageTipos);
  }, [tiposGestion, curPageTipos, tiposPerPage, searchTipos]);

  useEffect(() => {
    const allData = [
      ...(evaluacionDetail?.exitosos ?? []),
      ...(evaluacionDetail?.fallidos ?? []),
    ];

    const filteredData = searchTelefono.trim()
      ? filteredBySearch(allData)
      : allData;

    if (curPageAudios > Math.ceil(filteredData.length / audiosPerPage)) {
      setCurPageAudios(1);
    }

    calcTotalAudiosPages(filteredData);
    updateAudiosPaginated(filteredData, curPageAudios);
  }, [searchTelefono, evaluacionDetail, audiosPerPage, curPageAudios]);

  useEffect(() => {
    const filteredData = searchTipoLlamada.trim()
      ? filteredTiposLlamada()
      : tiposLlamada;

    if (
      curPageTipoLlamada > Math.ceil(filteredData.length / tiposLlamadaPerPage)
    ) {
      setCurPageTipoLlamada(1);
    }

    calcTotalPaginasTipoLlamada(filteredData);
    updatePaginatedTiposLlamada(filteredData, curPageTipoLlamada);
  }, [
    tiposLlamada,
    curPageTipoLlamada,
    tiposLlamadaPerPage,
    searchTipoLlamada,
  ]);

  return (
    <CriteriosContext.Provider
      value={{
        // ======================== Items ========================
        refMNItem,
        modalNItem,
        modoNItem,
        formNItem,
        criteriosItems,
        criteriosItemsPaginated,
        loadingItems,
        isPostingNItem,
        exportingItems,
        inputCarteraItemAsoc,
        carterasCyC,
        refSCartera,
        carterasCyCFiltradas,
        selectCarteraItem,
        setFormNItem,
        openModalNItem,
        closeModalNItem,
        toggleCarteraItem,
        submitFormNItem,
        updateFormNItem,
        filtrarCarteras,
        handleInputChangeFormNItem,
        handleSelectCartera,

        // Paginacion
        refModalPageItems,
        modalPageItems,
        curPageItems,
        totalItemsPages,
        maxButtonsItems,
        pageStarItems,
        pageEndItems,
        itemsPerPage,
        searchItem,
        handleModalPageItems,
        changeItemsPerPage,
        changeCurPageItems,
        calctotalItemsPages,
        updateItemsPaginated,
        filteredItemsCriteriosBySearch,
        handleInputsearchItem,

        // ======================== Criterios ========================
        refMNCriterio,
        modalNCriterio,
        modoNCriterio,
        formNCriterio,
        criteriosCriterios,
        criteriosPaginated,
        loadingCriterios,
        isPostingNCriterio,
        exportingCriterios,
        refSItem,
        itemsFiltrados,
        selectItemCriterio,
        inputItemAsoc,
        setFormNCriterio,
        openModalNCriterio,
        closeModalNCriterio,
        itemAscoCriterioSelected,
        submitFormNCriterio,
        updateFormNCriterio,
        filtrarItems,
        toggleItemCriterio,
        handleInputChangeFormNCriterio,
        handleSelectItem,

        // Paginacion
        refModalPageCriterios,
        modalPageCriterios,
        curPageCriterios,
        totalCriteriosPages,
        maxButtonsCriterios,
        pageStarCriterios,
        pageEndCriterios,
        CriteriosPerPage,
        searchCriterio,
        handleModalPageCriterios,
        changeCriteriosPerPage,
        changeCurPageCriterios,
        calctotalCriteriosPages,
        updateCriteriosPaginated,
        filteredCriteriosCriteriosBySearch,
        handleInputsearchCriterio,

        // ======================== Acciones ========================
        refMNAcciones,
        modalNAcciones,
        modoNAcciones,
        formNAcciones,
        criteriosAcciones,
        accionesPaginated,
        loadingAcciones,
        isPostingNAcciones,
        exportingAcciones,
        inputCarteraAccionesAsoc,
        selectCarteraAcciones,
        setFormNAcciones,
        openModalNAcciones,
        closeModalNAcciones,
        criterioAsocSelected,
        submitFormNAcciones,
        updateFormNAcciones,
        filtrarCriterios,
        handleInputChangeFormNAcciones,
        handleSelectCriterio,

        // Paginacion
        AccionesPerPage,
        refModalPageAcciones,
        criteriosFiltrados,
        modalPageAcciones,
        curPageAcciones,
        totalAccionesPages,
        maxButtonsAcciones,
        pageStartAcciones,
        pageEndAcciones,
        handleModalPageAcciones,
        changeAccionesPerPage,
        changeCurPageAcciones,
        calcTotalAccionesPages,
        updateAccionesPaginated,
        handleInputsearchAcciones,
        filteredCriteriosAccionesBySearch,
        refSCriterios,

        // ======================== Mot No Pago ========================
        motivosNoPago,
        refMNMotPago,
        modalMNMotPago,
        modoNMotPago,
        formNMotPago,
        handleFormNMotPago,
        openModalNMotNoPago,
        loadingMotNoPago,
        isPostingNMotNoPago,
        submitFormNMotNoPago,
        updateFormNMotNoPago,
        refSCarteraMotNPago,
        selectCarteraMNP,
        inputCarteraMNP,
        carterasMotNP,
        handleSelectCarteraMotNPago,
        filtrarCarterasMotNoPago,
        carteraAsocItemSelectedMotNoPago,
        motivosNoPagoPaginated,
        motivosPerPage,
        curPageMotivos,
        totalMotivosPages,
        modalPageMotivos,
        searchMotivos,
        refModalPageMotivos,
        maxButtonsMotivos,
        handleInputSearchMotivos,
        filteredMotivosBySearch,
        calcTotalMotivosPages,
        updateMotivosPaginated,
        changeCurPageMotivos,
        handleModalPageMotivos,
        changeMotivosPerPage,
        pageStartMotivos,
        pageEndMotivos,

        // ======================== TIPOS DE GESTION ========================
        refTipoGestion,
        modalTipoGestion,
        modoTipoGestion,
        formTipoGestion,
        tiposGestion,
        loadingTiposGestion,
        isPostingTipoGestion,
        refSCarteraTipoGestion,
        selectCarteraTipoGestion,
        inputCarteraTipoGestion,
        carterasTipoGestion,
        handleSelectCarteraTipoGestion,
        closeModalTipoGestion,
        openModalTipoGestion,
        handleFormTipoGestion,
        submitFormTipoGestion,
        updateFormTipoGestion,
        filtrarCarterasTipoGestion,
        carteraAsocItemSelectedTipoGestion,
        tiposGestionPaginated,
        tiposPerPage,
        curPageTipos,
        totalTiposPages,
        modalPageTipos,
        searchTipos,
        refModalPageTipos,
        maxButtonsTipos,
        handleInputSearchTipos,
        filteredTiposBySearch,
        calcTotalTiposPages,
        updateTiposPaginated,
        changeCurPageTipos,
        handleModalPageTipos,
        changeTiposPerPage,
        pageStartTipos,
        pageEndTipos,

        // ======================== TIPO DE LLAMADA ========================
        refTipoLlamada,
        modalTipoLlamada,
        modoTipoLlamada,
        formTipoLlamada,
        tiposLlamada,
        loadingTiposLlamada,
        isPostingTipoLlamada,
        closeModalTipoLlamada,
        openModalTipoLlamada,
        handleFormTipoLlamada,
        submitFormTipoLlamada,
        updateFormTipoLlamada,
        tiposLlamadaPaginated,
        tiposLlamadaPerPage,
        curPageTipoLlamada,
        totalPaginasTipoLlamada,
        modalPageTipoLlamada,
        searchTipoLlamada,
        refModalPageTipoLlamada,
        maxButtonsTipoLlamada,
        handleInputSearchTipoLlamada,
        filteredTiposLlamada,
        calcTotalPaginasTipoLlamada,
        updatePaginatedTiposLlamada,
        changeCurPageTipoLlamada,
        handleModalPageTipoLlamada,
        changePerPageTipoLlamada,
        pageStartTipoLlamada,
        pageEndTipoLlamada,

        // =============== PROCESAMIENTO DE AUDIOS ===============
        isPostingAudiosProcess,
        sendAudiosProcess,
        inputRef,
        archivos,
        zipFile,
        handleZip,
        mProcesados,
        closeModalProcesador,
        loadingEfectosAudios,
        efectosAudios,
        sEfectoRef,
        selectEfecto,
        openSEfectoAudios,
        seleccionarEfectoAudios,
        idEfectoAudios,
        inputEfecto,
        loadEfectosAudios,
        processResultSucces,
        processResultFailed,

        // ======================= AUDITORIA =======================
        formAuditoriaAudios,
        setFormAuditoriaAudios,
        sCarterasRef,
        carterasActive,
        inputCarterasActive,
        sCarterasActive,
        handleSelectCarteras,
        removerCartera,
        seleccionarCartera,
        // fechasActive,
        // seleccionarFechas,
        resultadosAuditoria,
        obtenerResultadosAuditoria,
        evaluacionDetail,
        loadingEvaluacionDetail,
        obtenerDetalleEvaluacion,
        expandedAudio,
        toggleAudio,
        showDetail,
        toggleDetail,
        resetAuditoriaUIState,
        searchTelefono,
        handleInputSearchTelefono,
        // PAGINACION
        audiosPaginated,
        audiosPerPage,
        refModalPageAudios,
        modalPageAudios,
        curPageAudios,
        totalAudiosPages,
        maxButtonsAudios,
        pageStartAudios,
        pageEndAudios,
        handleModalPageAudios,
        changeAudiosPerPage,
        changeCurPageAudios,
        calcTotalAudiosPages,
        updateAudiosPaginated,
        filteredBySearch,
        audioActivo,
        seleccionarAudio,
        mVerCalificacion,
        refMVerCalificacion,
        openMVerCalificacion,
        closeMVerCalificacion,
        accionSeleccionada,
        seleccionarAccion,
        audioInstance,
        isPlaying,
        audioEnReproduccion,
        reproducirAudio,
        calificacionRef,
        expandedBloques,
        toggleBloque,
        duraciones,
        setDuracionAudio,

        formatPercent,
      }}
    >
      {children}
    </CriteriosContext.Provider>
  );
};
