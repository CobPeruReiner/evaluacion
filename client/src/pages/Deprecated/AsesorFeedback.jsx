import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { InputTextarea } from "primereact/inputtextarea";
import { Message } from "primereact/message";
import { AppLoader } from "../../components/ui/PrimeStates";
import { updateAsesorFeedback } from "../../services/AsesorService";

const formatScore = (value) =>
  Number.isFinite(Number(value)) ? `${Number(value).toFixed(2)}%` : "Sin calificación";

export default function AsesorFeedback() {
  const api = `${import.meta.env.VITE_API_URL}api/v1`;
  const currentEvaluacion = useSelector(
    (state) => state.currentEvaluacion.currentEvaluacion,
  );
  const idEvaluacion = currentEvaluacion?.ID_EVALUACION || currentEvaluacion?.id;
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(Boolean(idEvaluacion));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedbackRecibido, setFeedbackRecibido] = useState(
    Number(currentEvaluacion?.feedback_recibido) === 1,
  );
  const [compromiso, setCompromiso] = useState(
    currentEvaluacion?.feedback_compromiso || "",
  );

  useEffect(() => {
    if (!idEvaluacion) {
      setLoading(false);
      setError("Selecciona una evaluación antes de registrar el feedback.");
      return;
    }
    axios
      .get(`${api}/evaluaciones/${idEvaluacion}`)
      .then(({ data }) => {
        setDetail(data);
        setFeedbackRecibido(Number(data.evaluacion?.IN_FEEDBACK) === 1);
        setCompromiso(data.evaluacion?.DE_FEEDBACK || "");
      })
      .catch((requestError) =>
        setError(
          requestError.response?.data?.msg ||
            "No se pudo cargar el detalle de la evaluación.",
        ),
      )
      .finally(() => setLoading(false));
  }, [api, idEvaluacion]);

  const agrupados = useMemo(() => {
    const groups = new Map();
    (detail?.detalles || []).forEach((row) => {
      const key = row.ID_ITEM;
      if (!groups.has(key))
        groups.set(key, { nombre: row.NOMBRE_ITEM, criterios: [] });
      groups.get(key).criterios.push(row);
    });
    return [...groups.values()];
  }, [detail]);

  const save = async () => {
    if (!idEvaluacion) return;
    setSaving(true);
    try {
      await updateAsesorFeedback(idEvaluacion, feedbackRecibido, compromiso);
      setDetail((current) => ({
        ...current,
        evaluacion: {
          ...current.evaluacion,
          IN_FEEDBACK: feedbackRecibido ? 1 : 0,
          DE_FEEDBACK: compromiso,
        },
      }));
    } catch {
      setError("No se pudo guardar el feedback.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AppLoader className="min-h-[320px]" />;
  if (error) return <main className="p-6"><Message severity="warn" text={error} /></main>;

  const evaluation = detail?.evaluacion;
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-stone-500">Feedback de evaluación</p>
        <h1 className="mt-1 text-2xl font-bold text-stone-900">Evaluación #{evaluation.ID_EVALUACION}</h1>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <div><span className="text-stone-500">Gestor</span><p>{evaluation.GESTOR_NOMBRE || "Sin dato"}</p></div>
          <div><span className="text-stone-500">Monitor</span><p>{evaluation.MONITOR_NOMBRE || "Sin dato"}</p></div>
          <div><span className="text-stone-500">Calificación</span><p className="font-semibold">{formatScore(evaluation.IN_CALIDAD)}</p></div>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-stone-900">Resultado por criterio</h2>
        {agrupados.map((item) => (
          <div key={item.nombre} className="mt-5">
            <h3 className="font-semibold text-stone-800">{item.nombre}</h3>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b text-stone-500"><tr><th className="py-2">Criterio</th><th>Acción</th><th>Puntaje</th></tr></thead>
                <tbody>{item.criterios.map((row) => (
                  <tr key={row.ID_DETALLE} className="border-b border-stone-100">
                    <td className="py-2">{row.NOMBRE_CRITERIO}</td><td>{row.NOMBRE_ACCION}</td><td>{formatScore(row.IN_PUNTAJE)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        ))}
        {(detail?.observaciones || []).length > 0 && <div className="mt-5"><h3 className="font-semibold">Observaciones del monitor</h3><ul className="mt-2 list-disc pl-5 text-sm">{detail.observaciones.map((row) => <li key={row.ID_ITEM}>{row.NOMBRE_ITEM}: {row.OBSERVACION || "Sin observación"}</li>)}</ul></div>}
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-stone-900">Confirmación de feedback</h2>
        <div className="mt-4 flex items-center gap-2"><Checkbox inputId="feedback" checked={feedbackRecibido} onChange={(event) => setFeedbackRecibido(event.checked)} /><label htmlFor="feedback">Confirmo que recibí el feedback.</label></div>
        <label htmlFor="compromiso" className="mt-5 block text-sm font-medium">Compromiso del asesor</label>
        <InputTextarea id="compromiso" value={compromiso} onChange={(event) => setCompromiso(event.target.value)} rows={4} className="mt-2 w-full" autoResize />
        <Button label="Guardar feedback" loading={saving} onClick={save} className="mt-4" />
      </section>
    </main>
  );
}
