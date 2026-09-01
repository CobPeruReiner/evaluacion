import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import moment from "moment";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Checkbox } from "primereact/checkbox";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Message } from "primereact/message";
import { ProgressBar } from "primereact/progressbar";
import { Tag } from "primereact/tag";
import { AppLoader } from "../../../components/ui/PrimeStates";

const scoreOptions = [
  { label: "Cumple", value: 100 },
  { label: "No cumple", value: 0 },
];
const fieldLabel =
  "mb-1.5 block text-xs font-bold uppercase tracking-wide text-stone-500";
const info = (record) => ({
  idCartera: record?.ID_CARTERA,
  idGestion: record?.ID,
  fechaGestion: record?.FECHA,
  idGestor: record?.IDPERSONAL,
  telefono: record?.TELEFONO,
  idDeudor: record?.IDENTIFICADOR,
  resultado: record?.efecto,
  rutaAudio: record?.RUTA_AUDIO || "",
});

export const FichaEvaluacionR = () => {
  const api = `${import.meta.env.VITE_API_URL}api/v1`;
  const user = useSelector((state) => state.user.user);
  const [record] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("record") || "null");
    } catch {
      return null;
    }
  });
  const [modelo, setModelo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [fechaInicio] = useState(() => moment().toISOString());
  const [catalogos, setCatalogos] = useState({
    llamadas: [],
    gestiones: [],
    motivos: [],
    responsables: [],
    alertas: [],
    motivosFcr: [],
  });
  const [datos, setDatos] = useState({
    tmoSeg: 0,
    idTipoLlamada: null,
    idTipoGestion: null,
    idMotivoNoPago: null,
    inAlerta: false,
    idMotivoAlerta: null,
    idResponsableNoFcr: null,
    idMotivoNoFcr: null,
  });
  const [puntajes, setPuntajes] = useState({});
  const [observaciones, setObservaciones] = useState({});

  useEffect(() => {
    if (!record?.ID_CARTERA) {
      setError(
        "Selecciona una gestión desde Monitoreo para iniciar una evaluación.",
      );
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const [config, llamadas, gestiones, motivos, responsables, alertas] =
          await Promise.all([
            axios.get(`${api}/evaluaciones/configuracion/${record.ID_CARTERA}`),
            axios.get(`${api}/criteriosEvaluacion/llamadas`),
            axios.get(`${api}/gestionsCycWeb/tipo-gestion-cartera`, {
              params: { cartera: record.ID_CARTERA },
            }),
            axios.get(`${api}/gestionsCycWeb/mot-no-pag-cartera`, {
              params: { cartera: record.ID_CARTERA },
            }),
            axios.get(`${api}/gestionsCycWeb/responsable-no-fcr`),
            axios.get(`${api}/gestionsCycWeb/motivo-alerta`),
          ]);
        setModelo(config.data.modelo);
        setCatalogos((current) => ({
          ...current,
          // Este catálogo es global; solo se muestran tipos habilitados.
          llamadas: (llamadas.data.llamadas || []).filter(
            (llamada) => Number(llamada.ID_ESTADO) === 1,
          ),
          gestiones: gestiones.data.data || [],
          motivos: motivos.data.data || [],
          responsables: responsables.data.data || [],
          alertas: alertas.data.data || [],
        }));
      } catch (requestError) {
        setError(
          requestError.response?.data?.msg ||
            requestError.response?.data?.message ||
            "No pudimos cargar la configuración de evaluación.",
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api, record]);
  useEffect(() => {
    if (!datos.idResponsableNoFcr || datos.inAlerta) {
      setCatalogos((current) => ({ ...current, motivosFcr: [] }));
      return;
    }
    axios
      .get(`${api}/gestionsCycWeb/motivo-no-fcr`, {
        params: { responsable: datos.idResponsableNoFcr },
      })
      .then(({ data }) =>
        setCatalogos((current) => ({
          ...current,
          motivosFcr: data.data || [],
        })),
      )
      .catch(() => toast.error("No se pudieron cargar los motivos No FCR."));
  }, [api, datos.idResponsableNoFcr, datos.inAlerta]);
  const acciones = useMemo(
    () =>
      modelo?.items.flatMap((item) =>
        item.criterios.flatMap((criterio) =>
          criterio.acciones.map((accion) => ({ item, criterio, accion })),
        ),
      ) || [],
    [modelo],
  );
  const calidad = useMemo(
    () =>
      acciones.length
        ? Number(
            (
              acciones.reduce(
                (total, entry) =>
                  total +
                  (Number(entry.accion.peso) *
                    (Number(puntajes[entry.accion.idAccion]) || 0)) /
                    100,
                0,
              ) * 100
            ).toFixed(2),
          )
        : 0,
    [acciones, puntajes],
  );
  const complete =
    acciones.length > 0 &&
    acciones.every(({ accion }) => puntajes[accion.idAccion] !== undefined) &&
    datos.idTipoLlamada &&
    datos.idTipoGestion &&
    datos.idMotivoNoPago &&
    (datos.inAlerta
      ? datos.idMotivoAlerta
      : datos.idResponsableNoFcr && datos.idMotivoNoFcr);
  const update = (patch) => setDatos((current) => ({ ...current, ...patch }));
  const save = async () => {
    if (!complete)
      return toast.error(
        "Completa los datos generales y califica todas las acciones.",
      );
    if (!user?.DOC) return toast.error("No se identificó al monitor.");
    setSaving(true);
    try {
      const now = moment().toISOString();
      await axios.post(`${api}/evaluaciones`, {
        idUsuario: user.DOC,
        gestion: info(record),
        datos: { ...datos, inCalidad: calidad },
        fechaInicio,
        fechaFin: now,
        detalles: acciones.map(({ criterio, accion }) => ({
          idCriterio: criterio.idCriterio,
          idAccion: accion.idAccion,
          inPuntaje: puntajes[accion.idAccion],
        })),
        observaciones: modelo.items.map((item) => ({
          idItem: item.idItem,
          observacion: observaciones[item.idItem] || "",
        })),
      });
      toast.success("Evaluación finalizada y registrada.");
      window.setTimeout(() => window.close(), 650);
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.msg ||
          "No se pudo registrar la evaluación.",
      );
    } finally {
      setSaving(false);
    }
  };
  if (loading) return <AppLoader className="min-h-[60vh]" />;
  if (error)
    return (
      <main className="mx-auto max-w-3xl py-12">
        <Message severity="warn" text={error} className="w-full" />
      </main>
    );
  const select = (
    value,
    options,
    optionLabel,
    optionValue,
    onChange,
    disabled = false,
    placeholder = "Selecciona una opción",
  ) => (
    <Dropdown
      value={value}
      options={options}
      optionLabel={optionLabel}
      optionValue={optionValue}
      filter
      disabled={disabled}
      placeholder={placeholder}
      className="w-full"
      onChange={(event) => onChange(event.value)}
    />
  );
  return (
    <main className="w-full space-y-6">
      <section className="flex flex-col gap-5 rounded-3xl bg-gradient-to-br from-[#252525] to-[#69171c] p-6 text-white shadow-xl sm:p-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Tag
            value="EVALUACIÓN MANUAL"
            className="!bg-white/10 !text-red-100"
          />
          <h1 className="mt-3 text-3xl font-bold">Evaluar gestión</h1>
          <p className="mt-2 text-sm text-stone-200">
            {record.CARTERA} · Gestión #{record.ID} · {record.GESTOR}
          </p>
        </div>
        <div className="min-w-[220px]">
          <div className="mb-2 flex justify-between text-sm">
            <span>Puntaje actual</span>
            <b>{calidad.toFixed(2)}%</b>
          </div>
          <ProgressBar value={calidad} showValue={false} />
        </div>
      </section>
      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-6">
          <Card title="Información de la gestión" className="!rounded-2xl">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <Info label="Cartera" value={record.CARTERA} />
              <Info label="Gestor" value={record.GESTOR} />
              <Info label="Deudor" value={record.IDENTIFICADOR} />
              <Info label="Teléfono" value={record.TELEFONO} />
              <Info label="Resultado" value={record.efecto} />
              <Info
                label="Fecha"
                value={moment(record.FECHA).utc().format("DD/MM/YYYY HH:mm")}
              />
            </dl>
          </Card>
          <Card title="Datos de la evaluación" className="!rounded-2xl">
            <div className="space-y-4">
              <Field label="TMO (segundos)">
                <InputNumber
                  value={datos.tmoSeg}
                  min={0}
                  className="w-full"
                  onValueChange={(event) =>
                    update({ tmoSeg: event.value || 0 })
                  }
                />
              </Field>
              <Field label="Tipo de llamada">
                {select(
                  datos.idTipoLlamada,
                  catalogos.llamadas,
                  "NOMBRE_TIPO_LLAMADA",
                  "ID_TIPO_LLAMADA",
                  (value) => update({ idTipoLlamada: value }),
                  false,
                  "Selecciona tipo",
                )}
              </Field>
              <Field label="Tipo de gestión">
                {select(
                  datos.idTipoGestion,
                  catalogos.gestiones,
                  "NOMBRE_TIPO_GESTION",
                  "ID_TIPO_GESTION",
                  (value) => update({ idTipoGestion: value }),
                  false,
                  "Selecciona tipo",
                )}
              </Field>
              <Field label="Motivo de no pago">
                {select(
                  datos.idMotivoNoPago,
                  catalogos.motivos,
                  "NOMBRE_MOTIVO_NO_PAGO",
                  "ID_MOTIVO_NO_PAGO",
                  (value) => update({ idMotivoNoPago: value }),
                  false,
                  "Selecciona motivo",
                )}
              </Field>
              <div className="flex items-center gap-2">
                <Checkbox
                  inputId="alerta"
                  checked={datos.inAlerta}
                  onChange={(event) =>
                    update({
                      inAlerta: event.checked,
                      idMotivoAlerta: null,
                      idResponsableNoFcr: null,
                      idMotivoNoFcr: null,
                    })
                  }
                />
                <label htmlFor="alerta" className="text-sm font-medium">
                  Marcar con alerta
                </label>
              </div>
              {datos.inAlerta ? (
                <Field label="Motivo de alerta">
                  {select(
                    datos.idMotivoAlerta,
                    catalogos.alertas,
                    "NOMBRE_MOTIVO_ALERTA",
                    "ID_MOTIVO_ALERTA",
                    (value) => update({ idMotivoAlerta: value }),
                  )}
                </Field>
              ) : (
                <>
                  <Field label="Responsable No FCR">
                    {select(
                      datos.idResponsableNoFcr,
                      catalogos.responsables,
                      "NOMBRE_RESPONSABLE_NO_FCR",
                      "ID_RESPONSABLE_NO_FCR",
                      (value) =>
                        update({
                          idResponsableNoFcr: value,
                          idMotivoNoFcr: null,
                        }),
                    )}
                  </Field>
                  <Field label="Motivo No FCR">
                    {select(
                      datos.idMotivoNoFcr,
                      catalogos.motivosFcr,
                      "NOMBRE_MOTIVO_NO_FCR",
                      "ID_MOTIVO_NO_FCR",
                      (value) => update({ idMotivoNoFcr: value }),
                      !datos.idResponsableNoFcr,
                    )}
                  </Field>
                </>
              )}
            </div>
          </Card>
        </aside>
        <section className="space-y-5">
          {modelo.items.map((item) => (
            <Card
              key={item.idItem}
              title={`${item.nombre} · ${Number(item.peso * 100).toFixed(2)}%`}
              className="!rounded-2xl"
            >
              <div className="space-y-5">
                {item.criterios.map((criterio) => (
                  <div
                    key={criterio.idCriterio}
                    className="rounded-xl border border-stone-200 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h2 className="font-bold text-stone-900">
                        {criterio.nombre}
                      </h2>
                      <Tag
                        value={`${Number(criterio.peso * 100).toFixed(2)}%`}
                        severity="secondary"
                      />
                    </div>
                    <div className="space-y-3">
                      {criterio.acciones.map((accion) => (
                        <div
                          key={accion.idAccion}
                          className="grid gap-3 rounded-lg bg-stone-50 p-3 sm:grid-cols-[minmax(0,1fr)_190px] sm:items-center"
                        >
                          <div>
                            <p className="font-medium text-stone-800">
                              {accion.nombre}
                            </p>
                            <p className="mt-1 text-xs text-stone-500">
                              Peso máximo:{" "}
                              {Number(accion.peso * 100).toFixed(2)}%
                            </p>
                          </div>
                          <Dropdown
                            value={puntajes[accion.idAccion]}
                            options={scoreOptions}
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Calificar acción"
                            className="w-full"
                            onChange={(event) =>
                              setPuntajes((current) => ({
                                ...current,
                                [accion.idAccion]: event.value,
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <Field label="Observación del ítem (opcional)">
                  <InputTextarea
                    value={observaciones[item.idItem] || ""}
                    rows={3}
                    autoResize
                    className="w-full"
                    placeholder="Registra una observación relevante para este ítem"
                    onChange={(event) =>
                      setObservaciones((current) => ({
                        ...current,
                        [item.idItem]: event.target.value,
                      }))
                    }
                  />
                </Field>
              </div>
            </Card>
          ))}
          <div className="sticky bottom-4 flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-stone-600">
              {complete
                ? "La evaluación está lista para finalizar."
                : `Faltan ${acciones.filter(({ accion }) => puntajes[accion.idAccion] === undefined).length} acciones por calificar.`}
            </p>
            <Button
              label={saving ? "Finalizando…" : "Finalizar evaluación"}
              icon={saving ? "pi pi-spin pi-spinner" : "pi pi-check"}
              disabled={!complete || saving}
              onClick={save}
            />
          </div>
        </section>
      </div>
    </main>
  );
};

function Field({ label, children }) {
  return (
    <div>
      <label className={fieldLabel}>{label}</label>
      {children}
    </div>
  );
}
function Info({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-stone-500">{label}</dt>
      <dd className="mt-1 truncate font-semibold text-stone-800" title={value}>
        {value || "—"}
      </dd>
    </div>
  );
}
