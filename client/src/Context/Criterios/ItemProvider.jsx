import { useEffect, useRef, useState } from "react";
import { useOutsideClick } from "../../hooks/useOutSideClick";
import { CriteriosContext } from "./ItemContext";
import axios from "axios";
import { toast } from "sonner";
import moment from "moment";
import { useSelector } from "react-redux";

const initItems = {
  idItem: null,
  nombreItem: "",
  pesoItem: "",
  fechaActualizacion: null,
  idUsuarioActualizacion: null,
  idCartera: null,
};

const initCriterios = {
  idCriterio: null,
  nombreCriterio: "",
  pesoCriterio: "",
  fechaActualizacion: null,
  idUsuarioActualizacion: null,
  idItem: null,
};

export const CriteriosProvider = ({ children }) => {
  const API_URL = `${import.meta.env.VITE_API_URL}api/v1`;

  // Obtenemos el usuario
  const user = useSelector((state) => state.user.user);

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

    if (newModo === "edit") {
      const pesoTransformado = newData.PESO_ITEM * 100;

      setFormNItem({
        ...formNItem,
        idItem: newData.ID_ITEM,
        nombreItem: newData.NOMBRE_ITEM,
        pesoItem: pesoTransformado,
        idCartera: newData.ID_CARTERA,
        idCarteraOriginal: newData.ID_CARTERA,
      });

      setinputCarteraItemAsoc(`${newData.NOMBRE_CARTERA}`);
    } else {
      setFormNItem(initItems);
      setinputCarteraItemAsoc("");
    }

    setModalNItem(true);
  };

  const closeModalNItem = () => {
    setFormNItem(initItems);
    setinputCarteraItemAsoc("");
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
    const query = e.target.value.toLowerCase().trim();

    setinputCarteraItemAsoc(query);

    if (query === "") {
      setCarterasCyCFiltradas(carterasCyC);
    } else {
      const filtered = carterasCyC.filter((c) =>
        c.cartera?.toLowerCase().includes(query)
      );

      setCarterasCyCFiltradas(filtered);
    }
  };

  // Seleccionar cartera
  const carteraAsocItemSelected = (cartera) => {
    const { id_cartera, cartera: carteraItem, cliente } = cartera;

    const query = `${carteraItem} - ${cliente}`;

    // Seteamos el formulario con el id
    setFormNItem({
      ...formNItem,
      idCartera: id_cartera,
    });

    // Seteamos el input de cartera
    setinputCarteraItemAsoc(query);

    // Cerramos el select
    setSelectCarteraItem(false);
  };

  // Enviar formulario
  const submitFormNItem = async (e) => {
    e.preventDefault();

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
      idUsuarioActualizacion: user.dni,
      pesoItem: pesoTransformado,
    };

    setIsPostingNItem(true);

    try {
      const { data } = await axios.post(
        `${API_URL}/criteriosEvaluacion/items/create`,
        formNItemFinal
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

    const pesoOriginal = parseInt(formNItem.pesoItem, 10);

    if (isNaN(pesoOriginal) || pesoOriginal < 1 || pesoOriginal > 100) {
      toast.error("El peso debe ser un número entre 1 y 100");
      return;
    }

    // Transformar peso a decimal
    const pesoTransformado = pesoOriginal / 100;

    const today = moment().format("YYYY-MM-DD HH:mm:ss");

    const formNItemFinal = {
      ...formNItem,
      fechaActualizacion: today,
      idUsuarioActualizacion: user.dni,
      pesoItem: pesoTransformado,
    };

    setIsPostingNItem(true);

    try {
      const { data } = await axios.put(
        `${API_URL}/criteriosEvaluacion/items/update`,
        formNItemFinal
      );

      if (!data.ok) {
        toast.error("Error al actualizar Item");
        throw new Error("Error al actualizar Item");
      }

      toast.success("Item actualizado");
      closeModalNItem();
      loadItem();
    } catch (error) {
      const mensajeBackend = error.response?.data?.msg;

      console.log(error);
      toast.error(mensajeBackend || "Error al actualizar Item");
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
    curPageItems - Math.floor(maxButtonsItems / 2)
  );

  // Paginacion
  const pageEndItems = Math.min(
    totalItemsPages,
    pageStarItems + maxButtonsItems - 1
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
  const filteredItemsCriteriosBySearch = () => {};

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
      const pesoTransformado = newData.PESO_CRITERIO * 100;

      setFormNCriterio({
        ...formNCriterio,
        idCriterio: newData.ID_CRITERIO,
        nombreCriterio: newData.NOMBRE_CRITERIO,
        pesoCriterio: pesoTransformado,
        idItem: newData.ID_ITEM,
        idItemOriginal: newData.ID_ITEM,
      });

      setInputItemAsoc(`${newData.NOMBRE_ITEM}`);
    } else {
      setFormNCriterio(initCriterios);
      setInputItemAsoc("");
    }

    setModalNCriterio(true);
  };

  const closeModalNCriterio = () => {
    setFormNCriterio(initCriterios);
    setInputItemAsoc("");
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
    const query = e.target.value.toLowerCase().trim();

    setInputItemAsoc(query);

    if (query === "") {
      setItemsFiltrados(criteriosItems);
    } else {
      const filtered = criteriosItems.filter((c) =>
        c.NOMBRE_ITEM?.toLowerCase().includes(query)
      );

      setItemsFiltrados(filtered);
    }
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

    const pesoOriginal = parseInt(formNCriterio.pesoCriterio, 10);

    if (isNaN(pesoOriginal) || pesoOriginal < 1 || pesoOriginal > 100) {
      toast.error("El peso debe ser un número entre 1 y 100");
      return;
    }

    // Transformar peso a decimal
    const pesoTransformado = pesoOriginal / 100;

    // Datetime
    const today = moment().format("YYYY-MM-DD HH:mm:ss");

    const formNCriterioFinal = {
      ...formNCriterio,
      fechaActualizacion: today,
      idUsuarioActualizacion: user.dni,
      pesoCriterio: pesoTransformado,
    };

    setIsPostingNCriterio(true);

    try {
      const { data } = await axios.post(
        `${API_URL}/criteriosEvaluacion/criterios/create`,
        formNCriterioFinal
      );

      if (!data.ok) {
        toast.error("Error al crear Criterio");
        throw new Error("Error al crear Criterio");
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

    const pesoOriginal = parseInt(formNCriterio.pesoCriterio, 10);

    if (isNaN(pesoOriginal) || pesoOriginal < 1 || pesoOriginal > 100) {
      toast.error("El peso debe ser un número entre 1 y 100");
      return;
    }

    // Transformar peso a decimal
    const pesoTransformado = pesoOriginal / 100;

    const today = moment().format("YYYY-MM-DD HH:mm:ss");

    const formNCriterioFinal = {
      ...formNCriterio,
      fechaActualizacion: today,
      idUsuarioActualizacion: user.dni,
      pesoCriterio: pesoTransformado,
    };

    setIsPostingNCriterio(true);

    try {
      const { data } = await axios.put(
        `${API_URL}/criteriosEvaluacion/criterios/update`,
        formNCriterioFinal
      );

      if (!data.ok) {
        toast.error("Error al actualizar Criterio");
        throw new Error("Error al actualizar Criterio");
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
    curPageCriterios - Math.floor(maxButtonsCriterios / 2)
  );

  // Paginacion
  const pageEndCriterios = Math.min(
    totalCriteriosPages,
    pageStarCriterios + maxButtonsCriterios - 1
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
    page = curPageCriterios
  ) => {
    const startIndex = (page - 1) * CriteriosPerPage;
    const endIndex = startIndex + CriteriosPerPage;
    const paginated = data.slice(startIndex, endIndex);

    setCriteriosPaginated(paginated);
  };

  // Filtros
  const filteredCriteriosCriteriosBySearch = () => {};

  // =========================== CriteriosPaginacion ===========================

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
        `${API_URL}/criteriosEvaluacion/criterios`
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

  // Cargamos las carteras del CyC
  useEffect(() => {
    loadCarterasCyC();
    loadItem();
    loadCriterios();
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
        carteraAsocItemSelected,
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
      }}
    >
      {children}
    </CriteriosContext.Provider>
  );
};
