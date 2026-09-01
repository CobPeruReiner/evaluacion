import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import moment from "moment";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { toast } from "sonner";
import { AppLoader } from "../../components/ui/PrimeStates";

const tablePt = {
  root: { className: "overflow-hidden rounded-2xl border border-stone-200" },
  header: { className: "border-0 bg-white px-0 pb-5 pt-0" },
  wrapper: { className: "overflow-x-auto" },
  table: { className: "min-w-[1050px]" },
  headerCell: { className: "border-b border-stone-200 bg-stone-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-stone-500" },
  bodyCell: { className: "border-b border-stone-100 px-4 py-3 text-sm text-stone-700" },
  paginator: { className: "border-0 border-t border-stone-100 bg-white px-3 py-3" },
};

const dateValue = (value) => value ? moment(value).format("DD/MM/YYYY HH:mm") : "—";
const qualitySeverity = (value) => Number(value) >= 80 ? "success" : Number(value) >= 60 ? "warning" : "danger";
const scoreTag = (value) => <Tag value={`${Number(value || 0).toFixed(2)}%`} severity={qualitySeverity(value)} />;

function Fact({ label, value }) {
  return <div className="evaluation-detail-fact">
    <p>{label}</p>
    <strong>{value || "—"}</strong>
  </div>;
}

function EvaluationDetail({ data, loading }) {
  const groupedDetails = useMemo(() => {
    if (!data?.detalles) return [];
    const items = new Map();
    data.detalles.forEach((row) => {
      if (!items.has(row.ID_ITEM)) items.set(row.ID_ITEM, { ...row, acciones: [] });
      items.get(row.ID_ITEM).acciones.push(row);
    });
    return [...items.values()];
  }, [data]);
  const observations = useMemo(() => new Map((data?.observaciones || []).map((row) => [Number(row.ID_ITEM), row.OBSERVACION])), [data]);

  if (loading) return <AppLoader className="min-h-[360px]" />;
  if (!data?.evaluacion) return null;
  const evaluation = data.evaluacion;

  return <div className="evaluation-detail-content">
    <section className="evaluation-detail-hero">
      <div>
        <p>Evaluación #{evaluation.ID_EVALUACION}</p>
        <h3>{evaluation.MODELO}</h3>
        <span>Gestión #{evaluation.ID_GESTION} · registrada el {dateValue(evaluation.FE_REGISTRO)}</span>
      </div>
      {scoreTag(evaluation.IN_CALIDAD)}
    </section>

    <section className="evaluation-detail-section">
      <div className="evaluation-section-heading"><h4>Resumen de la gestión</h4><p>Datos registrados al finalizar la evaluación.</p></div>
      <div className="evaluation-facts-grid">
        <Fact label="Deudor" value={evaluation.ID_DEUDOR} />
        <Fact label="Gestor evaluado" value={evaluation.GESTOR_NOMBRE || `Personal #${evaluation.ID_GESTOR}`} />
        <Fact label="Monitor evaluador" value={evaluation.MONITOR_NOMBRE || `Personal #${evaluation.ID_MONITOR}`} />
        <Fact label="Teléfono" value={evaluation.TELEFONO} />
        <Fact label="Fecha de gestión" value={dateValue(evaluation.FE_GESTION)} />
        <Fact label="Resultado" value={evaluation.RESULTADO} />
        <Fact label="Duración (TMO)" value={`${evaluation.TMO_SEG || 0} segundos`} />
        <Fact label="Tipo de llamada" value={evaluation.NOMBRE_TIPO_LLAMADA} />
        <Fact label="Tipo de gestión" value={evaluation.NOMBRE_TIPO_GESTION} />
        <Fact label="Motivo de no pago" value={evaluation.NOMBRE_MOTIVO_NO_PAGO} />
        <Fact label="Condición de alerta" value={Number(evaluation.IN_ALERTA) ? evaluation.NOMBRE_MOTIVO_ALERTA || "Con alerta" : "Sin alerta"} />
        <Fact label="Responsable No FCR" value={evaluation.NOMBRE_RESPONSABLE_NO_FCR} />
        <Fact label="Motivo No FCR" value={evaluation.NOMBRE_MOTIVO_NO_FCR} />
      </div>
    </section>

    <section className="evaluation-detail-section">
      <div className="evaluation-section-heading evaluation-section-heading--split"><div><h4>Detalle de calificación</h4><p>Puntajes asignados a cada acción de la plantilla.</p></div><span>{data.detalles.length} acciones</span></div>
      <div className="evaluation-items-list">
        {groupedDetails.map((item) => <article key={item.ID_ITEM} className="evaluation-item-card">
          <header><div><h5>{item.NOMBRE_ITEM}</h5><p>Peso del ítem: {Number(item.PESO_ITEM || 0).toFixed(2)}%</p></div>{observations.get(Number(item.ID_ITEM)) && <span>Incluye observación</span>}</header>
          <div className="evaluation-actions-list">
            {item.acciones.map((row) => <div key={row.ID_DETALLE} className="evaluation-action-row">
              <div><p>{row.NOMBRE_CRITERIO}</p><strong>{row.NOMBRE_ACCION}</strong></div>
              <div><span>Máx. {Number(row.IN_MAX_PUNTAJE).toFixed(0)}%</span>{scoreTag(row.IN_PUNTAJE)}</div>
            </div>)}
          </div>
          {observations.get(Number(item.ID_ITEM)) && <footer><p>Observación</p><span>{observations.get(Number(item.ID_ITEM))}</span></footer>}
        </article>)}
      </div>
    </section>
  </div>;
}

export function HistorialEvaluaciones() {
  const api = `${import.meta.env.VITE_API_URL}api/v1/evaluaciones`;
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [tipo, setTipo] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState(null);

  const load = async () => {
    setLoading(true);
    try { const { data } = await axios.get(api); setEvaluaciones(data.evaluaciones || []); }
    catch { toast.error("No se pudo cargar el histórico de evaluaciones."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => evaluaciones.filter((row) => {
    const matchesType = tipo == null || Number(row.TI_TIPO) === tipo;
    const value = query.trim().toLowerCase();
    const matchesQuery = !value || [row.ID_EVALUACION, row.ID_GESTION, row.ID_DEUDOR, row.RESULTADO, row.MODELO].filter(Boolean).some((field) => String(field).toLowerCase().includes(value));
    return matchesType && matchesQuery;
  }), [evaluaciones, query, tipo]);

  const openDetail = async (row) => {
    setDetailLoading(true);
    setDetail(null);
    setDetailVisible(false);
    try { const { data } = await axios.get(`${api}/${row.ID_EVALUACION}`); setDetail(data); setDetailVisible(true); }
    catch { toast.error("No se pudo cargar el detalle de la evaluación. Intenta nuevamente."); }
    finally { setDetailLoading(false); }
  };

  const header = <div className="evaluation-history-toolbar">
    <div><h2>Evaluaciones registradas</h2><p>Selecciona un registro para consultar su ficha y calificaciones.</p></div>
    <div><span className="relative w-full sm:w-80"><i className="pi pi-search" /><InputText value={query} placeholder="Buscar por gestión, deudor o plantilla" onChange={(event) => setQuery(event.target.value)} /></span><Dropdown value={tipo} options={[{ label: "Todos los tipos", value: null }, { label: "Manual", value: 1 }, { label: "Automática", value: 2 }]} optionLabel="label" optionValue="value" onChange={(event) => setTipo(event.value)} /><Button icon="pi pi-refresh" outlined aria-label="Actualizar histórico" onClick={load} /></div>
  </div>;

  return <main className="w-full space-y-6">
    <section className="flex flex-col gap-5 rounded-3xl bg-gradient-to-br from-[#252525] to-[#69171c] p-6 text-white shadow-xl sm:p-8 lg:flex-row lg:items-end lg:justify-between"><div><Tag value="CONSOLIDADO DE CALIDAD" className="!bg-white/10 !text-red-100" /><h1 className="mt-3 text-3xl font-bold">Histórico de evaluaciones</h1><p className="mt-2 max-w-2xl text-sm text-stone-200">Consulta todas las evaluaciones manuales y automáticas registradas en la plataforma.</p></div><div className="rounded-2xl bg-white/10 px-5 py-4 text-center"><p className="text-xs uppercase tracking-wide text-red-100">Total de registros</p><p className="mt-1 text-3xl font-bold">{evaluaciones.length}</p></div></section>
    <section className="evaluation-history-panel">
      {loading ? <AppLoader className="min-h-[320px]" /> : <><div className="evaluation-history-toolbar-card">{header}</div><DataTable value={filtered} paginator rows={10} rowsPerPageOptions={[10, 25, 50]} emptyMessage="No se encontraron evaluaciones." pt={tablePt} dataKey="ID_EVALUACION" onRowClick={(event) => openDetail(event.data)} rowClassName={() => "cursor-pointer hover:bg-red-50/40"}><Column field="ID_EVALUACION" header="Evaluación" sortable /><Column field="ID_GESTION" header="Gestión" sortable /><Column field="ID_DEUDOR" header="Deudor" sortable /><Column field="MODELO" header="Plantilla" sortable /><Column header="Tipo" body={(row) => <Tag value={Number(row.TI_TIPO) === 2 ? "Automática" : "Manual"} severity={Number(row.TI_TIPO) === 2 ? "info" : "secondary"} />} sortable sortField="TI_TIPO" /><Column header="Fecha gestión" body={(row) => dateValue(row.FE_GESTION)} sortable sortField="FE_GESTION" /><Column header="Calidad" body={(row) => scoreTag(row.IN_CALIDAD)} sortable sortField="IN_CALIDAD" /><Column header="Registrada" body={(row) => dateValue(row.FE_REGISTRO)} sortable sortField="FE_REGISTRO" /><Column header="Acciones" body={(row) => <Button label="Ver detalle" icon="pi pi-eye" text size="small" onClick={(event) => { event.stopPropagation(); openDetail(row); }} />} /></DataTable><p className="evaluation-history-count">Mostrando {filtered.length} de {evaluaciones.length} evaluaciones.</p></>}
    </section>
    <Dialog visible={detailVisible && Boolean(detail)} onHide={() => { setDetailVisible(false); setDetail(null); }} header="Detalle de la evaluación" className="evaluation-detail-dialog w-[96vw] max-w-6xl" breakpoints={{ "960px": "96vw" }} modal draggable={false}><EvaluationDetail data={detail} loading={detailLoading} /></Dialog>
  </main>;
}
