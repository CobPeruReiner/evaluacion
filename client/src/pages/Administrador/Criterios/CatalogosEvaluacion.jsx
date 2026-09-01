import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { InputText } from "primereact/inputtext";
import { TabPanel, TabView } from "primereact/tabview";
import { Tag } from "primereact/tag";
import { toast } from "sonner";

const catalogs = [
  {
    key: "motivos",
    title: "Motivos de no pago",
    singular: "motivo de no pago",
    icon: "pi pi-ban",
    endpoint: "motivos",
    collection: "motivos",
    id: "ID_MOTIVO_NO_PAGO",
    name: "NOMBRE_MOTIVO_NO_PAGO",
    createField: "nombreMotivo",
    updateId: "idMotivo",
    requiresCartera: true,
  },
  {
    key: "gestiones",
    title: "Tipos de gestión",
    singular: "tipo de gestión",
    icon: "pi pi-briefcase",
    endpoint: "gestiones",
    collection: "gestiones",
    id: "ID_TIPO_GESTION",
    name: "NOMBRE_TIPO_GESTION",
    createField: "nombreGestion",
    updateId: "idTipoGestion",
    requiresCartera: true,
  },
  {
    key: "llamadas",
    title: "Tipos de llamada",
    singular: "tipo de llamada",
    icon: "pi pi-phone",
    endpoint: "llamadas",
    collection: "llamadas",
    id: "ID_TIPO_LLAMADA",
    name: "NOMBRE_TIPO_LLAMADA",
    createField: "nombreLlamada",
    updateId: "idTipoLlamada",
    requiresCartera: false,
  },
];

const tablePt = {
  root: { className: "overflow-hidden rounded-xl border border-stone-200" },
  header: { className: "border-0 bg-white px-0 pb-4 pt-0" },
  wrapper: { className: "overflow-x-auto" },
  table: { className: "min-w-[620px]" },
  headerCell: { className: "border-b border-stone-200 bg-stone-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-stone-500" },
  bodyCell: { className: "border-b border-stone-100 px-4 py-3 text-sm text-stone-700" },
  paginator: { className: "border-0 border-t border-stone-100 bg-white px-3 py-3" },
};

export function CatalogosEvaluacion({ carteras = [] }) {
  const api = `${import.meta.env.VITE_API_URL}api/v1/criteriosEvaluacion`;
  const [activeIndex, setActiveIndex] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const config = catalogs[activeIndex];

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.14em] text-brand-red">
            Opciones disponibles al evaluar
          </p>
          <h2 className="mt-1 text-xl font-bold text-stone-900">Opciones de evaluación</h2>
          <p className="mt-1 text-sm text-stone-500">
            Administra los motivos y tipos que el monitor podrá seleccionar al registrar una evaluación.
          </p>
        </div>
      </div>
      <TabView activeIndex={activeIndex} onTabChange={(event) => setActiveIndex(event.index)}>
        {catalogs.map((catalog) => (
          <TabPanel key={catalog.key} header={catalog.title} leftIcon={`${catalog.icon} mr-2`}>
            {catalog.key === config.key && (
              <CatalogTable
                key={`${config.key}-${refresh}`}
                api={api}
                config={config}
                carteras={carteras}
                onUpdated={() => setRefresh((value) => value + 1)}
              />
            )}
          </TabPanel>
        ))}
      </TabView>
    </section>
  );
}

function CatalogTable({ api, config, carteras, onUpdated }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${api}/${config.endpoint}`);
      setEntries(data[config.collection] || []);
    } catch {
      toast.error(`No se pudieron cargar los ${config.title.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [config.endpoint]);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return entries;
    return entries.filter((entry) => [entry[config.id], entry[config.name], entry.NOMBRE_CARTERA]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(value)));
  }, [entries, query, config]);

  const header = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-sm">
        <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-400" />
        <InputText value={query} onChange={(event) => setQuery(event.target.value)} className="w-full pl-9" placeholder={`Buscar ${config.title.toLowerCase()}`} />
      </div>
      <Button label={`Nuevo ${config.singular}`} icon="pi pi-plus" onClick={() => setEditing({})} />
    </div>
  );

  const status = (entry) => <Tag value={entry.ID_ESTADO ? "Activo" : "Inactivo"} severity={entry.ID_ESTADO ? "success" : "secondary"} />;
  const actions = (entry) => <Button icon="pi pi-pencil" text rounded aria-label={`Editar ${config.singular}`} onClick={() => setEditing(entry)} />;

  return <>
    <DataTable value={filtered} loading={loading} header={header} paginator rows={8} rowsPerPageOptions={[8, 16, 24]} emptyMessage={`No hay ${config.title.toLowerCase()} para mostrar.`} pt={tablePt}>
      <Column field={config.id} header="Código" style={{ width: "9rem" }} />
      <Column field={config.name} header={config.singular} sortable />
      {config.requiresCartera && <Column field="NOMBRE_CARTERA" header="Cartera relacionada" sortable />}
      <Column header="Estado" body={status} style={{ width: "8rem" }} />
      <Column header="" body={actions} style={{ width: "4.5rem" }} />
    </DataTable>
    <CatalogDialog api={api} config={config} carteras={carteras} entry={editing} onHide={() => setEditing(null)} onSaved={() => { setEditing(null); load(); onUpdated(); }} />
  </>;
}

function CatalogDialog({ api, config, carteras, entry, onHide, onSaved }) {
  const isEdit = Boolean(entry?.[config.id]);
  const [name, setName] = useState("");
  const [idCartera, setIdCartera] = useState(null);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(entry?.[config.name] || "");
    setIdCartera(entry?.ID_CARTERA || null);
    setActive(entry?.ID_ESTADO !== 0);
  }, [entry, config]);

  const carteraOptions = carteras.map((cartera) => ({ label: `${cartera.cliente} — ${cartera.cartera}`, value: cartera.id_cartera }));
  const save = async () => {
    if (!name.trim() || (config.requiresCartera && !idCartera)) return toast.error("Completa los campos obligatorios.");
    setSaving(true);
    try {
      const body = isEdit
        ? { [config.updateId]: entry[config.id], [config.createField]: name.trim(), ...(config.requiresCartera ? { idCartera } : {}), idEstado: active ? 1 : 0 }
        : { [config.createField]: name.trim(), ...(config.requiresCartera ? { idCartera } : {}) };
      const { data } = await axios[isEdit ? "put" : "post"](`${api}/${config.endpoint}/${isEdit ? "update" : "create"}`, body);
      toast.success(data.msg || `${config.singular} guardado correctamente.`);
      onSaved();
    } catch (error) {
      toast.error(error.response?.data?.msg || `No se pudo guardar el ${config.singular}.`);
    } finally { setSaving(false); }
  };
  const footer = <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button label="Cancelar" text severity="secondary" onClick={onHide} disabled={saving} /><Button label={saving ? "Guardando…" : isEdit ? "Guardar cambios" : `Crear ${config.singular}`} icon={saving ? "pi pi-spin pi-spinner" : "pi pi-check"} onClick={save} disabled={saving} /></div>;

  return <Dialog visible={entry !== null} header={`${isEdit ? "Editar" : "Nuevo"} ${config.singular}`} footer={footer} onHide={onHide} modal draggable={false} className="w-[94vw] max-w-lg">
    <div className="space-y-4 pt-2">
      <div><label className="mb-1.5 block text-sm font-semibold text-stone-700">Nombre</label><InputText value={name} onChange={(event) => setName(event.target.value)} className="w-full" autoFocus /></div>
      {config.requiresCartera && <div><label className="mb-1.5 block text-sm font-semibold text-stone-700">Cartera</label><Dropdown value={idCartera} options={carteraOptions} filter placeholder="Selecciona una cartera" className="w-full" onChange={(event) => setIdCartera(event.value)} /></div>}
      {isEdit && <div className="flex items-center justify-between rounded-xl bg-stone-50 px-4 py-3"><div><p className="font-semibold text-stone-800">Estado del catálogo</p><p className="text-xs text-stone-500">Los registros inactivos no estarán disponibles al evaluar.</p></div><InputSwitch checked={active} onChange={(event) => setActive(event.value)} /></div>}
    </div>
  </Dialog>;
}
