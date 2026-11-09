import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { toast } from "sonner";
import { colorCategoria } from "../../SpeachAnalitycs/Evaluacion/evaluacionUtils";

const tablePt = {
  root: { className: "overflow-hidden rounded-xl border border-stone-200" },
  header: { className: "border-0 bg-white px-0 pb-4 pt-0" },
  wrapper: { className: "overflow-x-auto" },
  table: { className: "min-w-[620px]" },
  headerCell: { className: "border-b border-stone-200 bg-stone-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-stone-500" },
  bodyCell: { className: "border-b border-stone-100 px-4 py-3 text-sm text-stone-700" },
  paginator: { className: "border-0 border-t border-stone-100 bg-white px-3 py-3" },
};

/**
 * Palabras clave que el speech analytics marca en cada llamada. Se guardan en un archivo
 * JSON del volumen compartido del server (sin tablas nuevas) y viajan con cada lote al worker.
 * Reemplazan las listas que estaban escritas en el código del motor de evaluación.
 */
export function PalabrasClave({ api, carteras = [] }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${api}/palabras-clave`);
      setEntries(data.palabras || []);
    } catch {
      toast.error("No se pudieron cargar las palabras clave.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return entries;
    return entries.filter((e) => [e.CATEGORIA, e.TERMINO, e.NOMBRE_CARTERA].filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(value)));
  }, [entries, query]);
  const categorias = useMemo(() => [...new Set(entries.map((e) => e.CATEGORIA))], [entries]);

  const header = (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
        <i className="pi pi-info-circle mr-2 text-brand-red" />
        Se resaltan en la transcripción de cada llamada procesada y se cuentan en los resultados. Usa{" "}
        <code className="rounded bg-white px-1">*</code> al final para cubrir variantes:{" "}
        <code className="rounded bg-white px-1">yape*</code> encuentra yape, yapeo, yapeé, yapear… No distingue
        mayúsculas ni tildes.
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-400" />
          <InputText value={query} onChange={(e) => setQuery(e.target.value)} className="w-full pl-9" placeholder="Buscar palabra o categoría" />
        </div>
        <Button label="Nueva palabra clave" icon="pi pi-plus" onClick={() => setEditing({})} />
      </div>
    </div>
  );

  const categoria = (e) => (
    <span className="inline-flex items-center gap-2 font-semibold">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: colorCategoria(e.CATEGORIA) }} />
      {e.CATEGORIA}
    </span>
  );
  const termino = (e) => <code className="rounded bg-stone-100 px-1.5 py-0.5 text-[13px]">{e.TERMINO}</code>;
  const status = (e) => <Tag value={e.ID_ESTADO ? "Activo" : "Inactivo"} severity={e.ID_ESTADO ? "success" : "secondary"} />;
  const actions = (e) => <Button icon="pi pi-pencil" text rounded aria-label="Editar palabra clave" onClick={() => setEditing(e)} />;

  return <>
    <DataTable value={filtered} loading={loading} header={header} paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
      emptyMessage="No hay palabras clave registradas." pt={tablePt} sortField="CATEGORIA" sortOrder={1}>
      <Column field="CATEGORIA" header="Categoría" body={categoria} sortable style={{ width: "14rem" }} />
      <Column field="TERMINO" header="Término" body={termino} sortable />
      <Column field="NOMBRE_CARTERA" header="Cartera" sortable />
      <Column header="Estado" body={status} style={{ width: "8rem" }} />
      <Column header="" body={actions} style={{ width: "4.5rem" }} />
    </DataTable>
    <PalabraDialog api={api} carteras={carteras} categorias={categorias} entry={editing}
      onHide={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />
  </>;
}

function PalabraDialog({ api, carteras, categorias, entry, onHide, onSaved }) {
  const isEdit = Boolean(entry?.ID_PALABRA);
  const [categoria, setCategoria] = useState("");
  const [termino, setTermino] = useState("");
  const [idCartera, setIdCartera] = useState(0);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCategoria(entry?.CATEGORIA || "");
    setTermino(entry?.TERMINO || "");
    setIdCartera(entry?.ID_CARTERA || 0);
    setActive(entry?.ID_ESTADO !== 0);
  }, [entry]);

  const carteraOptions = [
    { label: "Todas las carteras", value: 0 },
    ...carteras.map((c) => ({ label: `${c.cliente} — ${c.cartera}`, value: c.id_cartera })),
  ];

  const save = async () => {
    if (!categoria.trim() || !termino.replace(/\*/g, "").trim()) return toast.error("Completa la categoría y el término.");
    setSaving(true);
    try {
      const body = { categoria, termino, idCartera, ...(isEdit ? { idPalabra: entry.ID_PALABRA, idEstado: active ? 1 : 0 } : {}) };
      const { data } = await axios[isEdit ? "put" : "post"](`${api}/palabras-clave/${isEdit ? "update" : "create"}`, body);
      toast.success(data.msg || "Palabra clave guardada.");
      onSaved();
    } catch (error) {
      toast.error(error.response?.data?.msg || "No se pudo guardar la palabra clave.");
    } finally { setSaving(false); }
  };

  const footer = <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
    <Button label="Cancelar" text severity="secondary" onClick={onHide} disabled={saving} />
    <Button label={saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear palabra clave"} icon={saving ? "pi pi-spin pi-spinner" : "pi pi-check"} onClick={save} disabled={saving} />
  </div>;

  return <Dialog visible={entry !== null} header={`${isEdit ? "Editar" : "Nueva"} palabra clave`} footer={footer} onHide={onHide} modal draggable={false} className="w-[94vw] max-w-lg">
    <div className="space-y-4 pt-2">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-stone-700">Categoría</label>
        <InputText value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full" list="palabras-clave-categorias" placeholder="Ej. MEDIO DE PAGO" autoFocus />
        <datalist id="palabras-clave-categorias">{categorias.map((c) => <option key={c} value={c} />)}</datalist>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-stone-700">Término</label>
        <InputText value={termino} onChange={(e) => setTermino(e.target.value)} className="w-full" placeholder="Ej. yape*  ·  me comprometo" />
        <p className="mt-1 text-xs text-stone-500">Termina en * para incluir todas las palabras que empiezan así.</p>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-stone-700">Cartera</label>
        <Dropdown value={idCartera} options={carteraOptions} filter className="w-full" onChange={(e) => setIdCartera(e.value)} />
      </div>
      {isEdit && <div className="flex items-center justify-between rounded-xl bg-stone-50 px-4 py-3">
        <div><p className="font-semibold text-stone-800">Activa</p><p className="text-xs text-stone-500">Las inactivas no se marcan en las llamadas nuevas.</p></div>
        <InputSwitch checked={active} onChange={(e) => setActive(e.value)} />
      </div>}
    </div>
  </Dialog>;
}
