import { useMemo, useState } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { FileUpload } from "primereact/fileupload";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { Column } from "primereact/column";
import { descargarPlantillaMasiva, leerPlantillaMasiva } from "./plantillaMasiva";

const total = (items) => ({ items: items.length, criterios: items.reduce((count, item) => count + item.criterios.length, 0), acciones: items.reduce((count, item) => count + item.criterios.reduce((subtotal, criterio) => subtotal + criterio.acciones.length, 0), 0) });
const tablePt = { root: { className: "overflow-hidden rounded-xl border border-stone-200" }, wrapper: { className: "max-h-56 overflow-auto" }, table: { className: "min-w-[560px] w-full" }, headerCell: { className: "sticky top-0 bg-stone-50 px-3 py-2 text-left text-xs font-bold text-stone-500" }, bodyCell: { className: "border-t border-stone-100 px-3 py-2 text-xs text-stone-700" } };

export function ImportarPlantillaModal({ abierto, carteras, guardando, onCerrar, onCrear }) {
  const [archivo, setArchivo] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [errores, setErrores] = useState([]);
  const [nombre, setNombre] = useState("");
  const [idCartera, setIdCartera] = useState(null);
  const resumen = useMemo(() => resultado ? total(resultado.items) : null, [resultado]);
  const filas = useMemo(() => resultado?.items.flatMap((item) => item.criterios.flatMap((criterio) => criterio.acciones.map((accion) => ({ item: item.nombre, criterio: criterio.nombre, accion: accion.nombre, peso: `${accion.peso}%` })))) || [], [resultado]);
  const opcionesCartera = carteras.map((cartera) => ({ label: `${cartera.cliente} — ${cartera.cartera}`, value: cartera.id_cartera }));

  const cargar = async (file) => {
    if (!file) return;
    setArchivo(file); setResultado(null); setErrores([]);
    if (!/\.(xlsx|xls)$/i.test(file.name)) { setErrores(["Selecciona un archivo Excel (.xlsx o .xls)."]); return; }
    try { setResultado(await leerPlantillaMasiva(file)); }
    catch (error) { setErrores(error.errores || [error.message || "No pudimos leer el archivo."]); }
  };
  const cerrar = () => { if (!guardando) { setArchivo(null); setResultado(null); setErrores([]); onCerrar(); } };
  const footer = <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button label="Cancelar" text severity="secondary" onClick={cerrar} /><Button label={guardando ? "Creando…" : "Crear plantilla"} icon={guardando ? "pi pi-spin pi-spinner" : "pi pi-check"} disabled={!resultado || !nombre.trim() || !idCartera || guardando} onClick={() => onCrear({ nombre, idCartera, items: resultado.items })} /></div>;

  return <Dialog visible={abierto} onHide={cerrar} header="Importar plantilla de evaluación" footer={footer} className="w-[96vw] max-w-6xl" breakpoints={{ "960px": "96vw" }} modal draggable={false}><div className="grid gap-6 py-2 lg:grid-cols-[330px_minmax(0,1fr)]"><aside className="space-y-4"><div className="rounded-2xl border border-red-100 bg-red-50 p-5"><i className="pi pi-file-excel text-2xl text-brand-red" /><h3 className="mt-3 font-bold text-stone-900">1. Descarga y completa</h3><p className="mt-2 text-sm leading-6 text-stone-600">Una fila equivale a una acción. Repite el ítem y el criterio si tienen varias acciones.</p><Button label="Descargar Excel base" icon="pi pi-download" outlined className="mt-4" onClick={descargarPlantillaMasiva} /></div><div className="rounded-2xl border border-stone-200 p-5"><h3 className="font-bold text-stone-900">2. Carga el archivo</h3><FileUpload mode="basic" customUpload auto uploadHandler={({ files }) => cargar(files?.[0])} chooseLabel="Seleccionar Excel" chooseOptions={{ icon: "pi pi-upload", className: "mt-3" }} accept=".xlsx,.xls" /><p className="mt-3 text-xs text-stone-500">Solo se procesa en tu navegador hasta que confirmes la creación.</p>{archivo && <p className="mt-3 truncate text-sm text-stone-700"><i className="pi pi-file mr-2 text-brand-red" />{archivo.name}</p>}</div></aside><section className="min-w-0"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-brand-red">3. Validación y vista previa</p><h3 className="mt-1 text-lg font-bold text-stone-900">Revisa antes de crear</h3></div>{resultado && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Estructura válida</span>}</div>{errores.length > 0 && <Message severity="error" className="mt-4 w-full" content={<div><b>El archivo necesita ajustes.</b><ul className="mt-2 list-disc space-y-1 pl-5">{errores.slice(0, 6).map((error, index) => <li key={`${error}-${index}`}>{error}</li>)}</ul></div>} />}{resultado ? <><div className="mt-4 grid grid-cols-3 gap-3"><Metric label="Ítems" value={resumen.items} /><Metric label="Criterios" value={resumen.criterios} /><Metric label="Acciones" value={resumen.acciones} /></div><div className="mt-4"><DataTable value={filas} size="small" pt={tablePt}><Column field="item" header="Ítem" /><Column field="criterio" header="Criterio" /><Column field="accion" header="Acción" /><Column field="peso" header="Peso" /></DataTable></div></> : !errores.length && <div className="mt-4 flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-stone-300 bg-stone-50 p-6 text-center text-sm text-stone-500"><div><i className="pi pi-upload mb-3 block text-3xl text-stone-400" />Carga un Excel para mostrar su validación y vista previa.</div></div>}<div className="mt-5 grid gap-4 sm:grid-cols-2"><div><label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-stone-500">Nombre de la plantilla</label><InputText value={nombre} onChange={(event) => setNombre(event.target.value)} placeholder="Ej.: Gestión telefónica agosto" className="w-full" /></div><div><label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-stone-500">Cartera</label><Dropdown value={idCartera} options={opcionesCartera} filter placeholder="Selecciona una cartera" className="w-full" onChange={(event) => setIdCartera(event.value)} /></div></div></section></div></Dialog>;
}

function Metric({ label, value }) { return <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-center"><p className="text-xl font-bold text-stone-900">{value}</p><p className="text-[11px] font-bold uppercase tracking-wide text-stone-500">{label}</p></div>; }
