import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CriteriosContext } from "../../../Context/Criterios/ItemContext";
import { Loader } from "../../../components/Loader";
import { checkToken } from "../../../store/actions/user.actions";
import * as Icon from "../../../Icons/Iconos";
import { Pagination } from "./Components/Pagination/Pagination";
import { Metadatos } from "./Components/Metadatos/Metadatos";
import { TranscripcionError } from "./Components/TranscripcionError/TranscripcionError";
import { Audio } from "./Components/Audio/Audio";
import { Conversacion } from "../Evaluacion/Conversacion";
import { EvaluacionAgente } from "../Evaluacion/EvaluacionAgente";
import { EvaluacionLegado } from "../Evaluacion/EvaluacionLegado";
import { claseResultado, colorPuntaje, esEvaluacionAgente, resumenDe } from "../Evaluacion/evaluacionUtils";

function ChipsResumen({ item }) {
  const resumen = resumenDe(item.evaluacion);
  const promesa = item.evaluacion?.promesa_pago;
  return (
    <span className="flex flex-wrap items-center justify-end gap-1.5">
      {resumen ? (
        <>
          <span className="text-sm font-bold" style={{ color: colorPuntaje(resumen.cumplimiento_total) }}>
            {Number(resumen.cumplimiento_total).toFixed(1)}%
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${claseResultado(resumen.resultado || resumen.estado_global)}`}>
            {resumen.resultado || resumen.estado_global}
          </span>
        </>
      ) : (
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">Sin calificar</span>
      )}
      {promesa?.hay_promesa && (
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
          Promesa{promesa.fecha ? ` ${promesa.fecha}` : ""}
        </span>
      )}
      {resumen?.requiere_revision && <i className="pi pi-exclamation-circle text-amber-500" title="Tiene criterios para revisión" />}
    </span>
  );
}

function DetalleLlamada({ item, index, API_URL }) {
  const audioEl = useRef(null);
  const [marcado, setMarcado] = useState(null);
  const irA = (segundos, segmento) => {
    setMarcado(segmento);
    if (audioEl.current && Number.isFinite(segundos)) {
      audioEl.current.currentTime = segundos;
      audioEl.current.play().catch(() => {});
    }
  };
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="flex min-w-0 flex-col gap-4">
        <Audio item={item} API_URL={API_URL} index={index} onReady={(el) => { audioEl.current = el; }} />
        <TranscripcionError item={item} />
        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <h4 className="mb-3 flex items-center justify-between text-sm font-bold text-brand-dark">
            <span><i className="pi pi-comments mr-2 text-brand-red" />Conversación</span>
            <span className="text-xs font-normal text-stone-400">
              {item.roles_metodo === "agente_ia" ? "Roles identificados por el agente" : "Clic en el minuto para escuchar"}
            </span>
          </h4>
          <Conversacion item={item} onSeek={irA} marcado={marcado} />
        </div>
      </div>
      <div className="min-w-0">
        {esEvaluacionAgente(item.evaluacion)
          ? <EvaluacionAgente evaluacion={item.evaluacion} transcripcion={item.transcripcion} onSeek={irA} />
          : <EvaluacionLegado evaluacion={item.evaluacion} />}
      </div>
    </div>
  );
}

export const AuditoriaDetail = () => {
  const API_URL = `${import.meta.env.VITE_API_URL}`;
  const { archivo } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuth = useSelector((state) => state.user.isAuth);
  const user = useSelector((state) => state.user.user);

  const {
    loadingEvaluacionDetail,
    audiosPaginated,
    obtenerDetalleEvaluacion,
    expandedAudio,
    toggleAudio,
    resetAuditoriaUIState,
    searchTelefono,
    handleInputSearchTelefono,
    duraciones,
  } = useContext(CriteriosContext);

  useEffect(() => {
    if (!isAuth) {
      dispatch(checkToken(navigate));
    }
    if (user && user?.CARGO !== 17 && user?.CARGO !== 20 && user?.CARGO !== 29) {
      navigate("/");
    } else {
      obtenerDetalleEvaluacion(archivo);
    }
  }, []);

  return (
    <div className="sombra container-gestiones-cycweb relative flex flex-col gap-6 rounded-2xl bg-white px-5 py-8 transition-all duration-300">
      <div className="container-header flex flex-col items-center justify-between gap-4 md:flex-row">
        <button
          onClick={() => { resetAuditoriaUIState(); navigate(-1); }}
          className="flex items-center rounded-full px-2 py-1 text-sm font-semibold text-brand-dark transition-all duration-300 hover:bg-stone-100"
        >
          <Icon.BackPage size={18} className="mr-2" /> Volver
        </button>
        <div className="min-w-0 text-center">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-brand-red">Speech analytics</p>
          <h1 className="truncate text-lg font-bold text-brand-dark">{archivo}</h1>
        </div>
        <div className="relative text-sm">
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3"><Icon.Search /></div>
          <input
            type="search"
            className="block w-full rounded-lg border border-stone-300 bg-stone-50 px-9 py-2 text-stone-900 outline-none focus:border-brand-red"
            placeholder="Buscar por teléfono…"
            value={searchTelefono}
            onChange={handleInputSearchTelefono}
            autoComplete="off"
          />
        </div>
      </div>

      {loadingEvaluacionDetail ? (
        <Loader />
      ) : (
        <div className="flex flex-col gap-3">
          {audiosPaginated?.map((item, index) => (
            <div key={index} className="overflow-hidden rounded-xl border border-stone-200 shadow-sm">
              <button
                type="button"
                onClick={() => toggleAudio(index)}
                className="grid w-full grid-cols-2 items-center gap-2 bg-white px-5 py-3.5 text-left text-xs text-stone-700 transition-all hover:bg-stone-50 md:grid-cols-[minmax(0,2fr)_1fr_1fr_1.4fr_auto_auto]"
              >
                <span className="col-span-2 truncate font-semibold text-brand-dark md:col-span-1">{item.archivo}</span>
                <span><i className="pi pi-phone mr-1 text-stone-400" />{item?.metadatos?.telefono || "N/A"}</span>
                <span><i className="pi pi-clock mr-1 text-stone-400" />{duraciones[index] || "—"}</span>
                <span className="truncate"><i className="pi pi-user mr-1 text-stone-400" />{item?.metadatos?.full_name || "Asesor no identificado"}</span>
                <ChipsResumen item={item} />
                {expandedAudio === index ? <Icon.Up size={18} /> : <Icon.Down size={18} />}
              </button>
              {expandedAudio === index && (
                <div className="flex flex-col gap-4 border-t border-stone-200 bg-stone-50 p-5">
                  <Metadatos item={item} />
                  <DetalleLlamada item={item} index={index} API_URL={API_URL} />
                </div>
              )}
            </div>
          ))}
          <Pagination />
        </div>
      )}
    </div>
  );
};
