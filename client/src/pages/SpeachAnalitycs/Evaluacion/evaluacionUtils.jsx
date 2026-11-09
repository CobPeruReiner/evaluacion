// Utilidades compartidas por las vistas de resultados del speech analytics.

export const esAsesor = (seg) => seg?.speaker === "000" || seg?.speaker === "002";

export const mmss = (segundos) => {
  const t = Math.max(0, Math.floor(Number(segundos) || 0));
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
};

/** Evaluación calificada por el agente (versión 2). Las anteriores eran reglas fijas. */
export const esEvaluacionAgente = (evaluacion) => evaluacion?.version === 2;

/** Resumen de la nota para listas, sin importar el formato con que se guardó. */
export const resumenDe = (evaluacion) =>
  evaluacion?.resumen_final || evaluacion?.scotiabank_evaluacion?.resumen_final || null;

export const claseResultado = (valor) => {
  switch (valor) {
    case "Excelente":
    case "Bueno":
    case "Aprobado":
      return "bg-emerald-100 text-emerald-700";
    case "Deficiente/Trabajable":
    case "Observado":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-red-100 text-red-700";
  }
};

export const colorPuntaje = (pct) => {
  if (pct === null || pct === undefined) return "#a8a29e";
  if (pct >= 75) return "#059669";
  if (pct >= 60) return "#d97706";
  return "#ed1c24";
};

const PALETA = ["#ed1c24", "#2563eb", "#059669", "#d97706", "#7c3aed", "#0891b2", "#db2777", "#575756"];
export const colorCategoria = (categoria) => {
  let h = 0;
  for (const ch of categoria || "") h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETA[h % PALETA.length];
};

/** Anillo con el % de cumplimiento. */
export function AnilloPuntaje({ valor, size = 96, subtitulo }) {
  const pct = valor === null || valor === undefined ? null : Number(valor);
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e7e5e4" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={colorPuntaje(pct)} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * (pct ?? 0)) / 100} style={{ transition: "stroke-dashoffset .6s" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold" style={{ color: colorPuntaje(pct) }}>{pct === null ? "—" : `${Math.round(pct)}%`}</span>
        {subtitulo && <span className="text-[10px] uppercase tracking-wide text-stone-400">{subtitulo}</span>}
      </div>
    </div>
  );
}

const sinTilde = (c) => c.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * Resalta en `texto` las coincidencias de palabras clave (el worker las devuelve en
 * minúsculas y sin tildes) conservando las tildes y mayúsculas del texto original.
 */
export function TextoResaltado({ texto, hallazgos }) {
  if (!texto || !hallazgos?.length) return texto || null;
  let norm = "";
  const mapa = [];
  for (let i = 0; i < texto.length; i += 1) {
    const n = sinTilde(texto[i]);
    for (let k = 0; k < n.length; k += 1) { norm += n[k]; mapa.push(i); }
  }
  const rangos = [];
  hallazgos.forEach((h) => {
    const buscado = h.coincidencia;
    if (!buscado) return;
    let desde = 0;
    for (;;) {
      const p = norm.indexOf(buscado, desde);
      if (p < 0) break;
      const antes = p === 0 || !/\w/.test(norm[p - 1]);
      const despues = p + buscado.length >= norm.length || !/\w/.test(norm[p + buscado.length]);
      if (antes && despues) rangos.push([mapa[p], mapa[p + buscado.length - 1] + 1, h.categoria]);
      desde = p + buscado.length;
    }
  });
  if (!rangos.length) return texto;
  rangos.sort((a, b) => a[0] - b[0]);
  const partes = [];
  let cursor = 0;
  rangos.forEach(([ini, fin, categoria], idx) => {
    if (ini < cursor) return;
    if (ini > cursor) partes.push(texto.slice(cursor, ini));
    partes.push(
      <mark key={idx} title={categoria} className="rounded px-0.5 text-inherit"
        style={{ background: `${colorCategoria(categoria)}1f`, borderBottom: `2px solid ${colorCategoria(categoria)}` }}>
        {texto.slice(ini, fin)}
      </mark>,
    );
    cursor = fin;
  });
  if (cursor < texto.length) partes.push(texto.slice(cursor));
  return partes;
}
