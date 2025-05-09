import axios from "axios";
import { useState, useRef, useEffect } from "react";
import DataTable from "react-data-table-component";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ImCalendar } from "react-icons/im";
import ExportButton from "../utils/ExportButton";
import { API_URL } from "../constants/env";
import Select from "react-select";
import { MdOutlineCleaningServices } from "react-icons/md";
import { checkToken } from "../store/actions/user.actions";
import Popup from "reactjs-popup";
import "./fichaEvaluacionTable.css";
import customSelectStyles from "../utils/customSelectStyles";
import { getAsesorEvaluaciones } from "../services/FichaService";
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

function countWords(str) {
  return str.trim().split(/\s+/).length;
}

function getWordStr(str) {
  if (countWords(str) > 10) {
    return str.split(/\s+/).slice(0, 10).join(" ");
  }
  return str;
}

// const URL = 'http://192.168.1.51:4000/api/v1/Reporte';
const ASESORES_CYC_WEB_URL = `${API_URL}api/v1/gestionsCycWeb/personal`;
const CARYCLI_CYC_WEB_URL = `${API_URL}api/v1/gestionsCycWeb/carYcli`;

export const FichaEvaluacionTable = () => {
  const [datosFicha, setDatosFicha] = useState([]);
  const [firstDate, setFirstDate] = useState("");
  const [secondDate, setSecondDate] = useState("");
  const [inputText, setInputText] = useState("");

  const [clientesCarterasData, setClientesCarterasData] = useState([]);
  const [clientesData, setClientesData] = useState([]);
  const [carterasData, setCarterasData] = useState([]);
  const [asesoresData, setAsesoresData] = useState([]);

  const [clienteSelected, setClienteSelected] = useState("");
  const [objectCarteraSelected, setObjectCarteraSelected] = useState([]);
  const [objectClienteSelected, setObjectClienteSelected] = useState([]);
  const [asesorSelected, setAsesorSelected] = useState([]);

  const selectCarteraRef = useRef();
  const selectClienteRef = useRef();
  const selectAsesorRef = useRef();

  const navigate = useNavigate();

  const isAuth = useSelector((state) => state.user.isAuth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isAuth) {
      dispatch(checkToken(navigate));
    }
  }, [isAuth, dispatch]);

  const columns = [
    {
      name: "id",
      selector: (row) => row.id,
      grow: 0.5,
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "id_evaluacion",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.id_evaluacion}</p>
      ),
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "cartera",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.cartera}</p>
      ),
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "tramo",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.tramo}</p>
      ),
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "agente",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.agente}</p>
      ),
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "mes_llamada",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.mes_llamada}</p>
      ),
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "fecha_llamada",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.fecha_llamada}</p>
      ),
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "semana_llamada",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.semana_llamada}</p>
      ),
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "telefono",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.telefono}</p>
      ),
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "dni_cliente",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.dni_cliente}</p>
      ),
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "resultado",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.resultado}</p>
      ),
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "hora_llamada",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.hora_llamada}</p>
      ),
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "tmo_segundos",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.tmo_segundos}</p>
      ),
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "tipo_llamada",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.tipo_llamada}</p>
      ),
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "tipo_gestion",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.tipo_gestion}</p>
      ),
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "alerta",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.alerta}</p>
      ),
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "descripcion_alerta",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.descripcion_alerta}</p>
      ),
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "motivo_no_pago",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.motivo_no_pago}</p>
      ),
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "responsabilidad_no_fcr",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">
          {row.responsabilidad_no_fcr}
        </p>
      ),
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "motivo_no_fcr",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.motivo_no_fcr}</p>
      ),
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "audio_nombre",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.audio_nombre}</p>
      ),
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "fecha_monitoreo",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.fecha_monitoreo}</p>
      ),
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "nombre_monitor",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.nombre_monitor}</p>
      ),
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "rol",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.rol}</p>
      ),
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "hora_inicio",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.hora_inicio}</p>
      ),
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "hora_fin",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.hora_fin}</p>
      ),
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "duracion_monitoreo",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.duracion_monitoreo}</p>
      ),
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "saludo_11",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.saludo_11}</p>
      ),
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "contactar_con_persona_12",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">
          {row.contactar_con_persona_12}
        </p>
      ),
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "identificacion_gestor_13",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">
          {row.identificacion_gestor_13}
        </p>
      ),
      center: true,
      wrap: true,
    },
    {
      name: "apertura",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.apertura}</p>
      ),
      center: true,
      wrap: true,
    },
    {
      name: "apertura_completado",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">
          {row.apertura_completado}
        </p>
      ),
      center: true,
      wrap: true,
    },
    {
      name: "brindar_informacion_21",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">
          {row.brindar_informacion_21}
        </p>
      ),
      center: true,
      wrap: true,
    },
    {
      name: "indagar_motivo_no_pago_22",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">
          {row.indagar_motivo_no_pago_22}
        </p>
      ),
      center: true,
      wrap: true,
    },
    {
      name: "asesorar_23",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.asesorar_23}</p>
      ),
      center: true,
      wrap: true,
    },
    {
      name: "indagacion",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.indagacion}</p>
      ),
      center: true,
      wrap: true,
    },
    {
      name: "indagacion_completado",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">
          {row.indagacion_completado}
        </p>
      ),
      center: true,
      wrap: true,
    },
    {
      name: "mantiene_sentido_urgencia_31",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">
          {row.mantiene_sentido_urgencia_31}
        </p>
      ),
      center: true,
      wrap: true,
    },
    {
      name: "perseverancia_objetivo_32",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">
          {row.perseverancia_objetivo_32}
        </p>
      ),
      center: true,
      wrap: true,
    },
    {
      name: "manejo",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.manejo}</p>
      ),
      center: true,
      wrap: true,
    },
    {
      name: "manejo_completado",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.manejo_completado}</p>
      ),
      center: true,
      wrap: true,
    },
    {
      name: "reafirmar_acuerdos_41",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">
          {row.reafirmar_acuerdos_41}
        </p>
      ),
      center: true,
      wrap: true,
    },
    {
      name: "despedida_cliente_42",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">
          {row.despedida_cliente_42}
        </p>
      ),
      center: true,
      wrap: true,
    },
    {
      name: "cierre",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.cierre}</p>
      ),
      center: true,
      wrap: true,
    },
    {
      name: "cierre_completado",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.cierre_completado}</p>
      ),
      center: true,
      wrap: true,
    },
    {
      name: "escucha_activa_51",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.escucha_activa_51}</p>
      ),
      center: true,
      wrap: true,
    },
    {
      name: "comunicacion_cliente_52",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">
          {row.comunicacion_cliente_52}
        </p>
      ),
      ccenter: true,
      wrap: true,
    },
    {
      name: "amabilidad_cliente_53",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">
          {row.amabilidad_cliente_53}
        </p>
      ),
      center: true,
      wrap: true,
    },
    {
      name: "habilidades",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.habilidades}</p>
      ),
      center: true,
      wrap: true,
    },
    {
      name: "habilidades_completado",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">
          {row.habilidades_completado}
        </p>
      ),
      center: true,
      wrap: true,
    },
    {
      name: "uso_herramientas_61",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">
          {row.uso_herramientas_61}
        </p>
      ),
      center: true,
      wrap: true,
    },
    {
      name: "registro_gestiones_62",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">
          {row.registro_gestiones_62}
        </p>
      ),
      center: true,
      wrap: true,
    },
    {
      name: "herramientas",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.herramientas}</p>
      ),
      center: true,
      wrap: true,
    },
    {
      name: "herramientas_completado",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">
          {row.herramientas_completado}
        </p>
      ),
      center: true,
      wrap: true,
    },
    {
      name: "calificacion_final",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.calificacion_final}</p>
      ),
      center: true,
      wrap: true,
    },
    {
      name: "observaciones",
      selector: (row) => (
        <>
          {countWords(row.observaciones) > 10 ? (
            <Popup
              trigger={
                <p className="vista-gestiones-web__center-column">{`${getWordStr(
                  row.observaciones
                )} ...`}</p>
              }
              position="center"
            >
              <div className="vista-gestiones-web-obs">{row.observaciones}</div>
            </Popup>
          ) : (
            <div className="vista-gestiones-web-obs">{row.observaciones}</div>
          )}
        </>
      ),
      grow: 1,
      sortable: true,
      center: true,
      wrap: true,
    },
    {
      name: "tipo_ficha",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.tipo_ficha}</p>
      ),
      center: true,
      wrap: true,
    },
    {
      name: "feedback_recibido",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">{row.feedback_recibido}</p>
      ),
      center: true,
      wrap: true,
    },
    {
      name: "feedback_compromiso",
      selector: (row) => (
        <p className="ficha-evaluacion-table__item">
          {row.feedback_compromiso}
        </p>
      ),
      center: true,
      wrap: true,
    },
  ];

  //FILTER

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
      });

    axios
      .get(ASESORES_CYC_WEB_URL)
      .then((res) => {
        const asesores = res.data.personal;
        asesores.unshift({ IDPERSONAL: "TODOS", DNI: "", ASESOR: "TODOS" });
        setAsesoresData(asesores);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handleCliente = (e) => {
    setObjectClienteSelected({ value: e.value, label: e.label });
    setObjectCarteraSelected([]);
    const filteredCarteras = clientesCarterasData.filter(
      (item) => item.id_cliente == e.value
    );

    filteredCarteras.unshift({ cartera: "TODOS", id_cartera: "" });

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

  const handleCartera = (e) => {
    setObjectCarteraSelected({ value: e.value, label: e.label });
  };

  const handleSearch = async () => {
    if (
      !objectClienteSelected.label &&
      !objectCarteraSelected.label &&
      !firstDate &&
      !secondDate &&
      !asesorSelected.value
    ) {
      toast.warning("Debe elegir al menos un filtro");
      return;
    }

    if ((firstDate && !secondDate) || (secondDate && !firstDate)) {
      toast.warning("Debe elegir fecha inicial y final");
      return;
    }

    try {
      const fichas = await getAsesorEvaluaciones({
        cliente: objectClienteSelected.label,
        tramo: objectCarteraSelected.label,
        firstDate,
        secondDate,
        asesor: asesorSelected.value,
      });
      setDatosFicha(fichas);
    } catch (error) {
      toast.error("Error al buscar fichas");
      console.log(error);
    }
  };

  const handleClean = () => {
    setObjectClienteSelected([]);
    setObjectCarteraSelected([]);
    setFirstDate("");
    setSecondDate("");
    setAsesorSelected([]);
  };

  // console.log(asesorSelected);
  // console.log(objectCarteraSelected);
  // console.log(objectClienteSelected);

  return (
    <>
      <Toaster />
      <div className="sombra container-fichaEvaluacion relative bg-white flex flex-col py-10 px-5 gap-7 rounded-md transition-all duration-300">
        {/* TÍTULO */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">
            Reporte de Evaluaciones
          </h1>
        </div>

        <div className="relative flex flex-col md:flex-row items-center gap-3">
          <Select
            value={objectClienteSelected}
            ref={selectClienteRef}
            placeholder="Cliente"
            onChange={handleCliente}
            options={clientesData}
            className="w-full md:w-1/3 text-gray-700"
          />
          <Select
            value={objectCarteraSelected}
            ref={selectCarteraRef}
            placeholder="Cartera"
            onChange={handleCartera}
            options={carterasData}
            className="w-full md:w-1/3 text-gray-700"
          />
          <Select
            value={asesorSelected}
            ref={selectAsesorRef}
            placeholder="Asesor"
            onChange={(e) =>
              setAsesorSelected({ value: e.value, label: e.label })
            }
            options={asesoresData?.map((asesor) => {
              return {
                value: asesor.DNI,
                label: asesor.ASESOR,
              };
            })}
            className="w-full md:w-1/3 text-gray-700"
          />
        </div>

        <div className="flex flex-col md:flex-row md:items-end gap-4">
          {/* Fecha Inicial */}
          <div className="w-full md:w-1/4">
            <label
              htmlFor="desde"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Desde:
            </label>
            <input
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2 outline-none"
              type="date"
              name="desde"
              id="desde"
              value={firstDate}
              onChange={(e) => setFirstDate(e.target.value)}
            />
          </div>

          {/* Fecha Final */}
          <div className="w-full md:w-1/4">
            <label
              htmlFor="hasta"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Hasta:
            </label>
            <input
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2 outline-none"
              type="date"
              name="hasta"
              id="hasta"
              value={secondDate}
              onChange={(e) => setSecondDate(e.target.value)}
            />
          </div>

          {/* Botones Buscar y Limpiar */}
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={handleSearch}
              className="flex items-center gap-2 text-sm leading-6 border border-solid border-[#2563eb] text-[#2563eb] px-4 py-2 rounded-md font-medium hover:bg-[#2563eb] hover:text-white transition-all duration-300 w-full md:w-auto"
            >
              <ImCalendar className="w-4 h-4" />
              <span>Buscar</span>
            </button>

            <button
              onClick={handleClean}
              className="flex items-center gap-2 text-sm leading-6 border border-solid border-[#d97706] text-[#d97706] px-4 py-2 rounded-md font-medium hover:bg-[#d97706] hover:text-white transition-all duration-300 w-full md:w-auto"
            >
              <MdOutlineCleaningServices className="w-4 h-4" />
              <span>Limpiar</span>
            </button>
          </div>

          {/* Exportar */}
          <div className="w-full md:w-auto">
            <ExportButton data={datosFicha} filename={"Evaluacion Reporte"} />
          </div>
        </div>

        {/* TABLE */}
        <DataTable
          columns={columns}
          data={datosFicha}
          pagination
          paginationComponentOptions={paginationOptions}
          fixedHeader
          fixedHeaderScrollHeight="600px"
          responsive
        />
      </div>
    </>
  );
};
