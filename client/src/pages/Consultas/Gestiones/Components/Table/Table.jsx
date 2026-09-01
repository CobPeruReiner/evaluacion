import { useContext, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import moment from "moment";
import { MonitoreoContext } from "../../../../../Context/Monitoreo/MonitoreoContext";
import { useDispatch } from "react-redux";
import { setGestion } from "../../../../../store/actions/currentGestion.actions";
import { AppButton } from "../../../../../components/ui/PrimeControls";

const tablePt = {
  root: { className: "overflow-hidden rounded-xl border border-stone-200" },
  wrapper: { className: "overflow-x-auto" },
  table: { className: "min-w-[1050px] w-full" },
  thead: { className: "bg-stone-50" },
  headerCell: {
    className:
      "border-b border-stone-200 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-stone-500",
  },
  bodyRow: {
    className: "border-b border-stone-100 transition-colors hover:bg-red-50/50",
  },
  bodyCell: { className: "px-4 py-3 text-xs leading-5 text-stone-700" },
  emptyMessage: { className: "px-5 py-12 text-center text-sm text-stone-500" },
  paginator: {
    className:
      "flex flex-wrap items-center gap-2 border-t border-stone-100 bg-white px-4 py-3",
  },
  paginatorElement: { className: "rounded-md" },
};

export const Table = () => {
  const { gestiones = [] } = useContext(MonitoreoContext);
  const [busqueda, setBusqueda] = useState("");
  const dispatch = useDispatch();
  const evaluar = (gestion) => {
    dispatch(setGestion(gestion));
    window.open("/evaluacion", "_blank");
  };
  const fecha = (gestion) =>
    moment(gestion.FECHA).utc().format("DD/MM/YYYY HH:mm:ss");
  const observacion = (gestion) => (
    <span className="block max-w-[260px] truncate" title={gestion.OBSERVACION}>
      {gestion.OBSERVACION || "—"}
    </span>
  );
  const accion = (gestion) => (
    <AppButton
      onClick={() => evaluar(gestion)}
      className="!px-2.5 !py-2"
      aria-label={`Evaluar gestión ${gestion.IDENTIFICADOR}`}
      icon="pi pi-clipboard"
    />
  );
  const encabezado = (
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-stone-800">Gestiones encontradas</p>
        <p className="text-xs text-stone-500">
          Selecciona una gestión para evaluarla.
        </p>
      </div>
      <span className="p-input-icon-left w-full sm:w-72">
        <i className="pi pi-search" />
        <InputText
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          placeholder="Buscar gestiones"
          className="w-full !pl-10"
        />
      </span>
    </div>
  );
  return (
    <DataTable
      value={gestiones}
      dataKey="ID"
      header={encabezado}
      globalFilter={busqueda}
      globalFilterFields={[
        "FECHA",
        "CARTERA",
        "IDENTIFICADOR",
        "accion",
        "efecto",
        "MOTIVO",
        "GESTOR",
        "OBSERVACION",
      ]}
      paginator
      rows={10}
      rowsPerPageOptions={[5, 10, 15, 25, 50]}
      paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} gestiones"
      emptyMessage="No hay gestiones para los filtros seleccionados."
      pt={tablePt}
    >
      <Column field="FECHA" header="Fecha" body={fecha} sortable />
      <Column field="CARTERA" header="Cartera" sortable />
      <Column field="IDENTIFICADOR" header="Identificador" sortable />
      <Column field="accion" header="Acción" sortable />
      <Column field="efecto" header="Efecto" sortable />
      <Column field="MOTIVO" header="Motivo" sortable />
      <Column field="GESTOR" header="Gestor" sortable />
      <Column header="Observación" body={observacion} />
      <Column header="" body={accion} />
    </DataTable>
  );
};
