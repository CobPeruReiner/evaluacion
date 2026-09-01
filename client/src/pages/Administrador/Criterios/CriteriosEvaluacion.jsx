import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Panel } from "primereact/panel";
import { Tag } from "primereact/tag";
import { TabPanel, TabView } from "primereact/tabview";
import { AppLoader } from "../../../components/ui/PrimeStates";
import { ImportarPlantillaModal } from "./ImportarPlantillaModal";
import { descargarPlantillaMasiva } from "./plantillaMasiva";
import { CatalogosEvaluacion } from "./CatalogosEvaluacion";

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const action = () => ({ key: uid(), nombre: "", peso: null });
const criterio = () => ({
  key: uid(),
  nombre: "",
  peso: null,
  acciones: [action()],
});
const item = () => ({
  key: uid(),
  nombre: "",
  peso: null,
  criterios: [criterio()],
});
const blank = () => ({
  idModelo: null,
  nombre: "",
  idCartera: null,
  items: [item()],
});
const pct = (number) =>
  number == null ? null : Number((Number(number) * 100).toFixed(2));
const sum = (entries) =>
  entries.reduce((total, entry) => total + (Number(entry.peso) || 0), 0);

const inputClass = "w-full";
const fieldLabel =
  "mb-1.5 block text-xs font-bold uppercase tracking-wide text-stone-500";

function Peso({ value, onChange, ariaLabel = "Peso" }) {
  return (
    <InputNumber
      value={value}
      onValueChange={(event) => onChange(event.value)}
      min={0.01}
      max={100}
      minFractionDigits={0}
      maxFractionDigits={2}
      suffix=" %"
      placeholder="0"
      inputClassName="w-24 text-right"
      aria-label={ariaLabel}
    />
  );
}

function toEditor(source, copy = false) {
  return {
    idModelo: copy ? null : source.idModelo,
    nombre: copy ? `${source.nombre} - COPIA` : source.nombre,
    idCartera: copy ? null : source.idCartera,
    items: source.items.map((currentItem) => ({
      key: uid(),
      nombre: currentItem.nombre,
      peso: pct(currentItem.peso),
      criterios: currentItem.criterios.map((currentCriterio) => ({
        key: uid(),
        nombre: currentCriterio.nombre,
        peso: pct(currentCriterio.peso),
        acciones: currentCriterio.acciones.map((currentAction) => ({
          key: uid(),
          nombre: currentAction.nombre,
          peso: pct(currentAction.peso),
        })),
      })),
    })),
  };
}

export const CriteriosEvaluacion = () => {
  const api = `${import.meta.env.VITE_API_URL}api/v1`;
  const user = useSelector((state) => state.user.user);
  const [model, setModel] = useState(blank);
  const [carteras, setCarteras] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importando, setImportando] = useState(false);
  const [vistaActiva, setVistaActiva] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [carterasResponse, modelosResponse] = await Promise.all([
        axios.get(`${api}/gestionsCycWeb/carYcli`),
        axios.get(`${api}/criteriosEvaluacion/modelos`),
      ]);
      setCarteras(carterasResponse.data.clientesYcarteras || []);
      setModelos(modelosResponse.data.modelos || []);
    } catch {
      toast.error("No se pudieron cargar las plantillas de evaluación.");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  const patchItem = (itemKey, patch) =>
    setModel((current) => ({
      ...current,
      items: current.items.map((currentItem) =>
        currentItem.key === itemKey
          ? { ...currentItem, ...patch }
          : currentItem,
      ),
    }));
  const patchCriterio = (itemKey, criterioKey, patch) =>
    setModel((current) => ({
      ...current,
      items: current.items.map((currentItem) =>
        currentItem.key !== itemKey
          ? currentItem
          : {
              ...currentItem,
              criterios: currentItem.criterios.map((currentCriterio) =>
                currentCriterio.key === criterioKey
                  ? { ...currentCriterio, ...patch }
                  : currentCriterio,
              ),
            },
      ),
    }));
  const patchAction = (itemKey, criterioKey, actionKey, patch) =>
    setModel((current) => ({
      ...current,
      items: current.items.map((currentItem) =>
        currentItem.key !== itemKey
          ? currentItem
          : {
              ...currentItem,
              criterios: currentItem.criterios.map((currentCriterio) =>
                currentCriterio.key !== criterioKey
                  ? currentCriterio
                  : {
                      ...currentCriterio,
                      acciones: currentCriterio.acciones.map((currentAction) =>
                        currentAction.key === actionKey
                          ? { ...currentAction, ...patch }
                          : currentAction,
                      ),
                    },
              ),
            },
      ),
    }));
  const removeItem = (itemKey) =>
    setModel((current) => ({
      ...current,
      items: current.items.filter((currentItem) => currentItem.key !== itemKey),
    }));
  const removeCriterio = (itemKey, criterioKey) =>
    setModel((current) => ({
      ...current,
      items: current.items.map((currentItem) =>
        currentItem.key !== itemKey
          ? currentItem
          : {
              ...currentItem,
              criterios: currentItem.criterios.filter(
                (currentCriterio) => currentCriterio.key !== criterioKey,
              ),
            },
      ),
    }));
  const removeAction = (itemKey, criterioKey, actionKey) =>
    setModel((current) => ({
      ...current,
      items: current.items.map((currentItem) =>
        currentItem.key !== itemKey
          ? currentItem
          : {
              ...currentItem,
              criterios: currentItem.criterios.map((currentCriterio) =>
                currentCriterio.key !== criterioKey
                  ? currentCriterio
                  : {
                      ...currentCriterio,
                      acciones: currentCriterio.acciones.filter(
                        (currentAction) => currentAction.key !== actionKey,
                      ),
                    },
              ),
            },
      ),
    }));

  const open = async (idModelo, copy = false) => {
    try {
      const { data } = await axios.get(
        `${api}/criteriosEvaluacion/modelos/${idModelo}`,
      );
      setModel(toEditor(data.modelo, copy));
      toast.success(
        copy
          ? "Plantilla cargada: asigna una cartera y guárdala."
          : "Plantilla lista para editar.",
      );
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    } catch {
      toast.error("No se pudo abrir la plantilla.");
    }
  };

  const isValid = useMemo(
    () =>
      model.nombre.trim() &&
      model.idCartera &&
      model.items.length &&
      sum(model.items) <= 100.001 &&
      model.items.every(
        (currentItem) =>
          currentItem.nombre.trim() &&
          Number(currentItem.peso) > 0 &&
          currentItem.criterios.length &&
          sum(currentItem.criterios) <= Number(currentItem.peso) + 0.001 &&
          currentItem.criterios.every(
            (currentCriterio) =>
              currentCriterio.nombre.trim() &&
              Number(currentCriterio.peso) > 0 &&
              currentCriterio.acciones.length &&
              sum(currentCriterio.acciones) <=
                Number(currentCriterio.peso) + 0.001 &&
              currentCriterio.acciones.every(
                (currentAction) =>
                  currentAction.nombre.trim() && Number(currentAction.peso) > 0,
              ),
          ),
      ),
    [model],
  );
  const payload = (source) => ({
    nombre: source.nombre,
    idCartera: source.idCartera,
    idUsuarioActualizacion: user?.DOC,
    items: source.items.map((currentItem) => ({
      nombre: currentItem.nombre,
      peso: Number(currentItem.peso) / 100,
      criterios: currentItem.criterios.map((currentCriterio) => ({
        nombre: currentCriterio.nombre,
        peso: Number(currentCriterio.peso) / 100,
        acciones: currentCriterio.acciones.map((currentAction) => ({
          nombre: currentAction.nombre,
          peso: Number(currentAction.peso) / 100,
        })),
      })),
    })),
  });

  const save = async () => {
    if (!isValid)
      return toast.error(
        "Revisa los nombres y pesos: ningún nivel puede superar el peso de su padre.",
      );
    if (!user?.DOC)
      return toast.error("No se identificó al usuario que realiza el cambio.");
    setSaving(true);
    try {
      const result = model.idModelo
        ? await axios.put(
            `${api}/criteriosEvaluacion/modelos/${model.idModelo}`,
            payload(model),
          )
        : await axios.post(
            `${api}/criteriosEvaluacion/modelos`,
            payload(model),
          );
      toast.success(result.data.msg);
      if (!model.idModelo)
        setModel((current) => ({ ...current, idModelo: result.data.idModelo }));
      load();
    } catch (error) {
      toast.error(
        error.response?.data?.msg || "No se pudo guardar la plantilla.",
      );
    } finally {
      setSaving(false);
    }
  };

  const crearDesdeArchivo = async ({ nombre, idCartera, items }) => {
    if (!user?.DOC)
      return toast.error("No se identificó al usuario que realiza el cambio.");
    const source = { nombre, idCartera, items };
    setSaving(true);
    try {
      const result = await axios.post(
        `${api}/criteriosEvaluacion/modelos`,
        payload(source),
      );
      toast.success(result.data.msg);
      setImportando(false);
      setModel({
        ...toEditor({ ...source, idModelo: result.data.idModelo }),
        idModelo: result.data.idModelo,
      });
      load();
    } catch (error) {
      toast.error(
        error.response?.data?.msg ||
          "No se pudo crear la plantilla desde el archivo.",
      );
    } finally {
      setSaving(false);
    }
  };

  const deactivate = (idModelo) =>
    confirmDialog({
      message: "Se desactivará la plantilla y toda su estructura asociada.",
      header: "Desactivar plantilla",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      acceptLabel: "Desactivar",
      rejectLabel: "Cancelar",
      accept: async () => {
        try {
          const { data } = await axios.delete(
            `${api}/criteriosEvaluacion/modelos/${idModelo}`,
          );
          toast.success(data.msg);
          if (model.idModelo === idModelo) setModel(blank());
          load();
        } catch {
          toast.error("No se pudo desactivar la plantilla.");
        }
      },
    });
  const pesoItems = sum(model.items);
  const carteraOptions = carteras.map((cartera) => ({
    label: `${cartera.cliente} — ${cartera.cartera}`,
    value: cartera.id_cartera,
  }));

  return (
    <main className="w-full space-y-6 text-stone-800">
      <ConfirmDialog />
      <section className="criterios-hero overflow-hidden rounded-3xl bg-gradient-to-br from-[#252525] via-[#383735] to-[#6a161b] px-6 py-7 text-white shadow-xl shadow-stone-900/10 sm:px-8 lg:px-10 lg:py-9">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <Tag
              value="CONFIGURACIÓN DE CALIDAD"
              className="!bg-white/10 !text-red-100"
            />
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Plantillas de evaluación
            </h1>
            <p className="mt-3 text-sm leading-6 text-stone-200 sm:text-base">
              Diseña, reutiliza o importa la estructura de evaluación de cada
              cartera en un solo espacio.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              label="Descargar Excel"
              icon="pi pi-download"
              outlined
              severity="secondary"
              onClick={descargarPlantillaMasiva}
            />
            <Button
              label="Importar archivo"
              icon="pi pi-upload"
              onClick={() => setImportando(true)}
            />
            <Button
              label="Nueva plantilla"
              icon="pi pi-plus"
              severity="secondary"
              onClick={() => setModel(blank())}
            />
          </div>
        </div>
      </section>

      <TabView activeIndex={vistaActiva} onTabChange={(event) => setVistaActiva(event.index)} className="criterios-principal-tabs">
        <TabPanel header="Plantillas de evaluación" leftIcon="pi pi-sitemap mr-2">
      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_minmax(620px,1.45fr)]">
        <Card
          className="h-fit !rounded-2xl !border !border-stone-200 !shadow-sm"
          title="Plantillas guardadas"
          subTitle="Edítalas o úsalas como base para otra cartera."
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-stone-500">
              Activas en el sistema
            </span>
            <Tag value={`${modelos.length}`} rounded severity="danger" />
          </div>
          {loading ? (
            <AppLoader className="min-h-[180px]" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
              {modelos.map((modelo) => (
                <article
                  key={modelo.ID_MODELO}
                  className="rounded-xl border border-stone-200 bg-white p-4 transition hover:border-red-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate font-bold text-stone-900">
                        {modelo.NOMBRE}
                      </h2>
                      <p className="mt-1 truncate text-sm text-stone-500">
                        {modelo.NOMBRE_CARTERA}
                      </p>
                    </div>
                    <Tag
                      value={`${modelo.TOTAL_ITEMS} ítems`}
                      severity="secondary"
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      label="Editar"
                      icon="pi pi-pencil"
                      size="small"
                      onClick={() => open(modelo.ID_MODELO)}
                    />
                    <Button
                      label="Duplicar"
                      icon="pi pi-copy"
                      outlined
                      size="small"
                      onClick={() => open(modelo.ID_MODELO, true)}
                    />
                    <Button
                      label="Desactivar"
                      icon="pi pi-trash"
                      text
                      severity="danger"
                      size="small"
                      onClick={() => deactivate(modelo.ID_MODELO)}
                    />
                  </div>
                </article>
              ))}
              {!modelos.length && (
                <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-6 text-center text-sm text-stone-500">
                  <i className="pi pi-inbox mb-2 block text-2xl" />
                  Aún no hay plantillas activas.
                </div>
              )}
            </div>
          )}
        </Card>

        <Card className="!rounded-2xl !border !border-stone-200 !shadow-sm">
          <div className="mb-6 flex flex-col gap-4 border-b border-stone-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.14em] text-brand-red">
                {model.idModelo ? "Edición" : "Nueva estructura"}
              </p>
              <h2 className="mt-1 text-xl font-bold text-stone-900">
                {model.idModelo ? model.nombre : "Construye la plantilla"}
              </h2>
            </div>
            <div
              className={`rounded-lg px-3 py-2 text-sm ${pesoItems > 100.001 ? "bg-red-50 text-red-700" : "bg-stone-100 text-stone-600"}`}
            >
              Peso de ítems: <b>{pesoItems.toFixed(2)}%</b> / 100%
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={fieldLabel} htmlFor="nombre-plantilla">
                Nombre de la plantilla
              </label>
              <InputText
                id="nombre-plantilla"
                value={model.nombre}
                onChange={(event) =>
                  setModel((current) => ({
                    ...current,
                    nombre: event.target.value,
                  }))
                }
                placeholder="Ej.: Gestión telefónica regular"
                className={inputClass}
              />
            </div>
            <div>
              <label className={fieldLabel}>Cartera</label>
              <Dropdown
                value={model.idCartera}
                options={carteraOptions}
                filter
                placeholder="Selecciona una cartera"
                className={inputClass}
                onChange={(event) =>
                  setModel((current) => ({
                    ...current,
                    idCartera: event.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {model.items.map((currentItem, itemIndex) => (
              <ItemEditor
                key={currentItem.key}
                currentItem={currentItem}
                itemIndex={itemIndex}
                onPatch={patchItem}
                onRemove={removeItem}
                onPatchCriterio={patchCriterio}
                onRemoveCriterio={removeCriterio}
                onPatchAction={patchAction}
                onRemoveAction={removeAction}
              />
            ))}
            <Button
              label="Añadir ítem"
              icon="pi pi-plus"
              outlined
              className="w-full !border-dashed !py-3"
              onClick={() =>
                setModel((current) => ({
                  ...current,
                  items: [...current.items, item()],
                }))
              }
            />
          </div>
          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-stone-100 pt-5 sm:flex-row sm:justify-end">
            <Button
              label="Descartar cambios"
              text
              severity="secondary"
              onClick={() => setModel(blank())}
            />
            <Button
              label={
                saving
                  ? "Guardando…"
                  : model.idModelo
                    ? "Guardar cambios"
                    : "Crear plantilla"
              }
              icon={saving ? "pi pi-spin pi-spinner" : "pi pi-check"}
              disabled={saving}
              onClick={save}
            />
          </div>
        </Card>
      </section>
        </TabPanel>
        <TabPanel header="Opciones de evaluación" leftIcon="pi pi-sliders-h mr-2">
          <CatalogosEvaluacion carteras={carteras} />
        </TabPanel>
      </TabView>
      <ImportarPlantillaModal
        abierto={importando}
        carteras={carteras}
        guardando={saving}
        onCerrar={() => setImportando(false)}
        onCrear={crearDesdeArchivo}
      />
    </main>
  );
};

function ItemEditor({
  currentItem,
  itemIndex,
  onPatch,
  onRemove,
  onPatchCriterio,
  onRemoveCriterio,
  onPatchAction,
  onRemoveAction,
}) {
  const titulo = (
    <div className="flex min-w-0 items-center gap-3">
      <Tag value={`Ítem ${itemIndex + 1}`} severity="danger" />
      <span className="truncate font-bold">
        {currentItem.nombre || "Ítem sin nombre"}
      </span>
    </div>
  );
  return (
    <Panel
      header={titulo}
      toggleable
      className="overflow-hidden rounded-xl border border-stone-200"
    >
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_132px_auto] md:items-end">
        <div>
          <label className={fieldLabel}>Nombre del ítem</label>
          <InputText
            value={currentItem.nombre}
            onChange={(event) =>
              onPatch(currentItem.key, { nombre: event.target.value })
            }
            placeholder="Ej.: Apertura"
            className="w-full"
          />
        </div>
        <div>
          <label className={fieldLabel}>Peso del ítem</label>
          <Peso
            value={currentItem.peso}
            onChange={(peso) => onPatch(currentItem.key, { peso })}
            ariaLabel="Peso del ítem"
          />
        </div>
        <Button
          icon="pi pi-trash"
          severity="danger"
          text
          rounded
          className="!h-10 !w-10 !min-w-10 !p-0"
          aria-label="Quitar ítem"
          onClick={() => onRemove(currentItem.key)}
        />
      </div>
      <div className="mt-5 space-y-3 border-l-2 border-red-100 pl-3 sm:pl-5">
        {currentItem.criterios.map((currentCriterio, criterioIndex) => (
          <CriterioEditor
            key={currentCriterio.key}
            currentItem={currentItem}
            currentCriterio={currentCriterio}
            criterioIndex={criterioIndex}
            onPatch={onPatchCriterio}
            onRemove={onRemoveCriterio}
            onPatchAction={onPatchAction}
            onRemoveAction={onRemoveAction}
          />
        ))}
        <Button
          label="Añadir criterio"
          icon="pi pi-plus"
          text
          onClick={() =>
            onPatch(currentItem.key, {
              criterios: [...currentItem.criterios, criterio()],
            })
          }
        />
      </div>
    </Panel>
  );
}

function CriterioEditor({
  currentItem,
  currentCriterio,
  criterioIndex,
  onPatch,
  onRemove,
  onPatchAction,
  onRemoveAction,
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-3 sm:p-4">
      <div className="grid gap-3 md:grid-cols-[28px_minmax(0,1fr)_120px_auto] md:items-end">
        <span className="hidden pb-3 text-xs font-bold text-stone-400 md:block">
          {criterioIndex + 1}
        </span>
        <div>
          <label className={fieldLabel}>Criterio</label>
          <InputText
            value={currentCriterio.nombre}
            onChange={(event) =>
              onPatch(currentItem.key, currentCriterio.key, {
                nombre: event.target.value,
              })
            }
            placeholder="Nombre del criterio"
            className="w-full"
          />
        </div>
        <div>
          <label className={fieldLabel}>Peso</label>
          <Peso
            value={currentCriterio.peso}
            onChange={(peso) =>
              onPatch(currentItem.key, currentCriterio.key, { peso })
            }
            ariaLabel="Peso del criterio"
          />
        </div>
        <Button
          icon="pi pi-trash"
          severity="danger"
          text
          rounded
          className="!h-10 !w-10 !min-w-10 !p-0"
          aria-label="Quitar criterio"
          onClick={() => onRemove(currentItem.key, currentCriterio.key)}
        />
      </div>
      <div className="mt-4 space-y-2 border-l-2 border-stone-200 pl-3 sm:pl-5">
        {currentCriterio.acciones.map((currentAction, actionIndex) => (
          <div
            key={currentAction.key}
            className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_120px_auto] sm:items-center"
          >
            <InputText
              value={currentAction.nombre}
              onChange={(event) =>
                onPatchAction(
                  currentItem.key,
                  currentCriterio.key,
                  currentAction.key,
                  { nombre: event.target.value },
                )
              }
              placeholder={`Acción observable ${actionIndex + 1}`}
              className="w-full"
            />
            <Peso
              value={currentAction.peso}
              onChange={(peso) =>
                onPatchAction(
                  currentItem.key,
                  currentCriterio.key,
                  currentAction.key,
                  { peso },
                )
              }
              ariaLabel="Peso de la acción"
            />
            <Button
              icon="pi pi-times"
              severity="danger"
              text
              rounded
              className="!h-10 !w-10 !min-w-10 !p-0"
              aria-label="Quitar acción"
              onClick={() =>
                onRemoveAction(
                  currentItem.key,
                  currentCriterio.key,
                  currentAction.key,
                )
              }
            />
          </div>
        ))}
        <Button
          label="Añadir acción"
          icon="pi pi-plus"
          text
          size="small"
          onClick={() =>
            onPatch(currentItem.key, currentCriterio.key, {
              acciones: [...currentCriterio.acciones, action()],
            })
          }
        />
      </div>
    </div>
  );
}
