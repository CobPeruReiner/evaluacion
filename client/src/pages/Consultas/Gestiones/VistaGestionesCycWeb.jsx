import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import DataTable from "react-data-table-component";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { setGestion } from "../../../store/actions/currentGestion.actions";
import { AiFillFilter } from "react-icons/ai";
import { MdCleaningServices, MdOutlineMonitor } from "react-icons/md";
import { add } from "date-fns";
import "./vistaGestionesCycWeb.css";
import { checkToken } from "../../../store/actions/user.actions";

import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { FaSearch } from "react-icons/fa";
import { useFilterData } from "../../../hooks/useFilterData";
import { toast, Toaster } from "sonner";

const paginationOptions = {
  rowsPerPageText: "Filas por página",
  rangeSeparatorText: "de",
  selectAllRowsItem: true,
  selectAllRowsItemText: "Todos",
};

const compareFunction = (a, b) => {
  if (a.label < b.label) {
    return -1;
  }
  if (a.label > b.label) {
    return 1;
  }
  return 0;
};

const GESTIONES_CYC_WEB_URL = `${
  import.meta.env.VITE_API_URL
}api/v1/gestionsCycWeb`;
const ASESORES_CYC_WEB_URL = `${
  import.meta.env.VITE_API_URL
}api/v1/gestionsCycWeb/personal`;
const CARYCLI_CYC_WEB_URL = `${
  import.meta.env.VITE_API_URL
}api/v1/gestionsCycWeb/carYcli`;
const EFECTOS_CYC_WEB_URL = `${
  import.meta.env.VITE_API_URL
}api/v1/gestionsCycWeb/efectos`;
const EFECTOS_BY_CARTERA_CYC_WEB_URL = `${
  import.meta.env.VITE_API_URL
}api/v1/gestionsCycWeb/efectosByCartera`;

export const VistaGestionesCycWeb = () => {
  const [gestionesCycWeb, setGestionesCycWeb] = useState([]);
  const [clientesCarterasData, setClientesCarterasData] = useState([]);
  const [clientesData, setClientesData] = useState([]);
  const [carterasData, setCarterasData] = useState([]);
  const [efectosData, setEfectosData] = useState([]);
  const [asesoresData, setAsesoresData] = useState([]);

  const [clienteSelected, setClienteSelected] = useState({});
  const [carteraSelected, setCarteraSelected] = useState({});
  const [idCarteraSelected, setIdCarteraSelected] = useState({});
  const [dateSelected1, setDateSelected1] = useState("");
  const [dateSelected2, setDateSelected2] = useState("");
  const [efectoSelected, setEfectoSelected] = useState({});

  const [objectCarteraSelected, setObjectCarteraSelected] = useState([]);
  const [objectEfectoSelected, setObjectEfectoSelected] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isAuth = useSelector((state) => state.user.isAuth);
  const user = useSelector((state) => state.user.user);

  /* Refs for selects */
  const selectCarteraRef = useRef();
  const selectEfectoRef = useRef();

  useEffect(() => {
    if (!isAuth) {
      dispatch(checkToken(navigate));
    }
    if (user && user.cargo === "asesor") {
      navigate("/perfilAsesor");
    }
  }, [isAuth, dispatch]);

  useEffect(() => {
    axios
      .get(CARYCLI_CYC_WEB_URL)
      .then((res) => {
        setClientesCarterasData(res.data.clientesYcarteras);
        setClientesData(
          [
            ...new Map(
              res.data.clientesYcarteras.map((item) => [
                item.id_cliente,
                { value: item.id_cliente, label: item.cliente },
              ])
            ).values(),
          ].sort(compareFunction)
        );
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error al cargar clientes y carteras");
      });

    axios
      .get(ASESORES_CYC_WEB_URL)
      .then((res) => {
        const asesores = res.data.personal;
        asesores.unshift({ IDPERSONAL: "TODOS", ASESOR: "TODOS" });
        setAsesoresData(asesores);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error al cargar asesores");
      });
  }, []);

  const formatDateofData = (data) => {
    return data.map((element) => {
      const newDate = add(new Date(element.FECHA), { hours: 5 });
      const localDate = newDate.toLocaleString("es-PE");
      const dateWithoutComa = localDate.replace(",", "");

      return { ...element, FECHA: dateWithoutComa };
    });
  };

  const handleSearch = () => {
    // SE DEBE SELECCIONAR CLIENTE Y CARTERA Y FECHAS
    if (
      !clienteSelected.length ||
      !carteraSelected.length ||
      !dateSelected1 ||
      !dateSelected2
    ) {
      toast.warning("Debe seleccionar todos los filtros");
      return;
    }

    if (!efectoSelected.length) {
      setIsLoading(true);
      axios
        .get(GESTIONES_CYC_WEB_URL, {
          params: {
            cliente: clienteSelected,
            cartera: carteraSelected,
            filterDate1: dateSelected1,
            filterDate2: dateSelected2,
          },
        })
        .then((res) => {
          if (res.data.cycGestions.length === 0) {
            setIsLoading(false);
            toast.warning("No hay registros con este filtro");
            return;
          }
          // No longer needed 'cause browser date issue chrome and edge
          // const gestionsFormatted = formatDateofData(res.data.cycGestions)
          if (suggestions) {
            setSuggestions([]);
            setInputText("");
          }
          // setGestionesCycWeb(gestionsFormatted);

          setGestionesCycWeb(res.data.cycGestions);
          setIsLoading(false);
        })
        .catch((err) => {
          console.log(err);
          toast.error("Error");
          setIsLoading(false);
        });
    } else {
      setIsLoading(true);
      const efectosArray = efectoSelected.map((e) => e.label);
      axios
        .get(`${GESTIONES_CYC_WEB_URL}/filteredGestions`, {
          params: {
            cliente: clienteSelected,
            cartera: carteraSelected,
            filterDate1: dateSelected1,
            filterDate2: dateSelected2,
            efectosArray: efectosArray,
            idCarteraSelected,
          },
        })
        .then((res) => {
          if (res.data.cycGestions.length === 0) {
            setIsLoading(false);
            toast.warning("No hay registros con este filtro");
            return;
          }
          const gestionsFormatted = formatDateofData(res.data.cycGestions);
          if (suggestions) {
            setSuggestions([]);
            setInputText("");
          }

          setGestionesCycWeb(gestionsFormatted);
          setIsLoading(false);
        })
        .catch((err) => {
          console.log(err);
          toast.error("Error");
          setIsLoading(false);
        });
    }
  };

  const handleCarteras = (e) => {
    setObjectCarteraSelected([]);
    setObjectEfectoSelected([]);
    const filteredCarteras = clientesCarterasData.filter(
      (item) => item.id_cliente == e.value
    );
    setCarterasData(
      filteredCarteras.map((e) => {
        return {
          label: e.cartera,
          value: e.id_cartera,
        };
      })
    );
    setClienteSelected(e.label);
  };

  const handleEvaluar = (gestion) => {
    window.open("/evaluacion", "_blank");
    dispatch(setGestion(gestion));
  };

  const handleEfectos = (e) => {
    setCarteraSelected(e.label);
    setIdCarteraSelected(e.value);
    setObjectCarteraSelected({ label: e.label, value: e.value });
    setObjectEfectoSelected([]);
    if (carteraSelected) {
      axios
        .get(`${EFECTOS_BY_CARTERA_CYC_WEB_URL}`, {
          params: { cartera: e.value },
        })
        .then((res) => {
          const efectos = res.data.efectos?.map((e) => {
            return {
              label: e.EFECTO,
              value: e.EFECTO,
            };
          });
          setEfectosData(efectos);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const handleEfectoSelected = (e) => {
    console.log(e);
    setObjectEfectoSelected(e);
    setEfectoSelected(e);
  };

  function countWords(str) {
    return str?.trim().split(/\s+/).length;
  }

  function getWordStr(str) {
    if (countWords(str) > 4) {
      return str.split(/\s+/).slice(0, 4).join(" ");
    }
    return str;
  }

  const columns = [
    {
      name: "ID",
      selector: (row) => row.ID,
      grow: 1,
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "FECHA",
      selector: (row) => row.FECHA,
      grow: 1,
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "CLIENTE",
      selector: (row) => row.CLIENTE,
      grow: 1,
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "CARTERA",
      selector: (row) => (
        <p className="vista-gestiones-web__center-column">{row.CARTERA}</p>
      ),
      grow: 1,
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "IDENTIFICADOR",
      selector: (row) => row.IDENTIFICADOR,
      grow: 1,
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "EFECTO",
      selector: (row) => row.EFECTO,
      grow: 1,
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "MOTIVO",
      selector: (row) => row.MOTIVO,
      grow: 1,
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "GESTOR",
      selector: (row) => (
        <p className="vista-gestiones-web__center-column">{row.GESTOR}</p>
      ),
      grow: 1,
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "OBSERVACION",
      selector: (row) => (
        <>
          {countWords(row.OBSERVACION) > 4 ? (
            <Popup
              trigger={
                <p className="vista-gestiones-web__center-column">{`${getWordStr(
                  row.OBSERVACION
                )} ...`}</p>
              }
              position="center"
            >
              <div className="vista-gestiones-web-obs">{row.OBSERVACION}</div>
            </Popup>
          ) : (
            <div className="vista-gestiones-web-obs">{row.OBSERVACION}</div>
          )}
        </>
      ),
      grow: 1,
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "OPCIONES",
      selector: (row) => (
        <MdOutlineMonitor
          className="vista-gestiones-web__monitor-button"
          onClick={() => handleEvaluar(row)}
        />
      ),
      grow: 1,
      sortable: true,
      center: true,
      wrap: true,
    },
  ];

  const { inputText, setInputText, suggestions, setSuggestions, handleFilter } =
    useFilterData(gestionesCycWeb);

  const filterByAsesor = (e) => {
    if (e.label === "TODOS") {
      return handleFilter("");
    }
    handleFilter(e.label);
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="sombra container-gestiones-cycweb relative bg-white flex flex-col py-10 px-5 gap-7 rounded-md transition-all duration-300">
        {/* LOADER */}
        {isLoading && <span className="loader"></span>}

        {/* Título */}
        <h1 className="text-2xl font-bold text-gray-800">
          Monitoreo Gestiones CyC Web
        </h1>

        {/* FORM */}
        <div className="container-form relative flex flex-col gap-4">
          <div className="relative flex flex-col md:flex-row items-center gap-3">
            <Select
              placeholder="Cliente"
              className="w-full md:w-1/3 text-gray-700"
              onChange={handleCarteras}
              options={clientesData}
            />
            <Select
              value={objectCarteraSelected}
              ref={selectCarteraRef}
              placeholder="Cartera"
              className="w-full md:w-1/3 text-gray-700"
              onChange={handleEfectos}
              options={carterasData}
            />
            <Select
              value={objectEfectoSelected}
              ref={selectEfectoRef}
              placeholder="Efecto"
              className="w-full md:w-1/3 text-gray-700"
              onChange={handleEfectoSelected}
              options={efectosData}
              isMulti
            />
          </div>
          <div className="form-bottom relative w-full flex flex-col md:flex-row gap-3 items-center">
            <div className="container-fechaInicio relative w-full">
              <label
                htmlFor="fechaInicio"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Fecha Inicial
              </label>
              <input
                type="date"
                id="fechaInicio"
                name="fechaInicio"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none"
                onChange={(e) => setDateSelected1(e.target.value)}
              />
            </div>
            <div className="container-fechaFin relative w-full">
              <label
                htmlFor="fechaFin"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Fecha Final
              </label>
              <input
                type="date"
                id="fechaFin"
                name="fechaFin"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none"
                onChange={(e) => setDateSelected2(e.target.value)}
              />
            </div>
          </div>
          <div className="container-filter relative flex justify-end items-center">
            <div
              onClick={handleSearch}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-sm shadow-md hover:from-blue-600 hover:to-blue-700 hover:shadow-lg active:scale-95 transition-all duration-300 cursor-pointer"
            >
              <AiFillFilter className="w-5 h-5" />
              <span>Filtrar</span>
            </div>
          </div>
        </div>

        <>
          {/* FILTER */}
          {(gestionesCycWeb.length || (suggestions && suggestions.length)) && (
            <div className="vista-gestiones-web__search__main-container">
              <div className="relative">
                <FaSearch className="absolute text-2xl top-2 start-0 flex items-center ps-3 pointer-events-none" />
                <input
                  className="block w-full px-9 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-[#09c] focus:border-[#09c] outline-none"
                  type="search"
                  value={inputText}
                  onChange={(e) => handleFilter(e.target.value)}
                  placeholder="Filtrar por columna"
                />
              </div>
              <div className="vista-gestiones-web__search-asesorFilter">
                <Select
                  className="vista-gestiones-web__search-asesorFilter__select"
                  placeholder="Asesor"
                  onChange={filterByAsesor}
                  options={asesoresData?.map((asesor) => {
                    return { value: asesor.IDPERSONAL, label: asesor.ASESOR };
                  })}
                />
              </div>
            </div>
          )}

          {/* TABLE */}
          {gestionesCycWeb.length ? (
            suggestions && suggestions.length ? (
              <DataTable
                columns={columns}
                data={suggestions}
                pagination
                paginationComponentOptions={paginationOptions}
                fixedHeader
                fixedHeaderScrollHeight="600px"
                responsive
              />
            ) : (
              <DataTable
                columns={columns}
                data={gestionesCycWeb}
                pagination
                paginationComponentOptions={paginationOptions}
                fixedHeader
                fixedHeaderScrollHeight="600px"
                responsive
              />
            )
          ) : (
            ""
          )}
        </>
      </div>
    </>
  );
};
