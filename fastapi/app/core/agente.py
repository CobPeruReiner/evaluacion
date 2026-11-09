"""Agente evaluador de llamadas.

Reemplaza las reglas escritas en código por nombre de criterio (registry +
services/acciones/*): el agente recibe la plantilla activa de la cartera tal como
está en CALIDAD (ítems → criterios → acciones) y la transcripción diarizada, y devuelve para CADA criterio la acción que
corresponde con la frase literal que lo sustenta. También detecta promesa de pago,
motivo de no pago (del catálogo de la cartera), contacto, sentimiento y un resumen.

El agente NO calcula notas (lo hace core/scoring.py con los pesos de la BD) y su
salida se valida contra la plantilla: lo que no encaja se descarta y el criterio
queda para revisión humana.

Proveedor: cualquier API compatible con OpenAI Chat Completions (xAI/Grok, OpenAI,
o un servidor local como Ollama/vLLM para no sacar audio ni texto de la red).
Configuración: LLM_API_KEY, LLM_BASE_URL, LLM_MODEL, LLM_TIMEOUT.
"""

import json
import logging
import os
import re
import time
from datetime import datetime

import requests

logger = logging.getLogger(__name__)

BASE_URL = (os.getenv("LLM_BASE_URL") or "https://api.x.ai/v1").rstrip("/")
MODELO = os.getenv("LLM_MODEL") or "grok-4.20-0309-non-reasoning"
TIMEOUT = float(os.getenv("LLM_TIMEOUT") or "180")
REINTENTOS = 3
ASESOR, CLIENTE = "000", "001"


class AgenteNoDisponible(RuntimeError):
    pass


def configurado() -> bool:
    # Un servidor local (Ollama/vLLM) no exige clave: basta con LLM_BASE_URL propio.
    if os.getenv("LLM_API_KEY"):
        return True
    url = os.getenv("LLM_BASE_URL") or ""
    return bool(url) and not any(nube in url for nube in ("api.x.ai", "api.openai.com"))


def _json(contenido: str) -> dict:
    texto = re.sub(r"^```(?:json)?\s*|\s*```$", "", (contenido or "").strip())
    try:
        return json.loads(texto)
    except json.JSONDecodeError:
        m = re.search(r"\{.*\}", texto, re.S)
        if m:
            return json.loads(m.group(0))
        raise


def _chat(sistema: str, usuario: str) -> dict:
    if not configurado():
        raise AgenteNoDisponible("El agente evaluador no está configurado (LLM_API_KEY / LLM_BASE_URL).")
    headers = {"Content-Type": "application/json"}
    if os.getenv("LLM_API_KEY"):
        headers["Authorization"] = f"Bearer {os.getenv('LLM_API_KEY')}"
    payload = {
        "model": MODELO,
        "temperature": 0,
        "response_format": {"type": "json_object"},
        "messages": [{"role": "system", "content": sistema}, {"role": "user", "content": usuario}],
    }
    ultimo = None
    for intento in range(1, REINTENTOS + 1):
        try:
            r = requests.post(f"{BASE_URL}/chat/completions", json=payload, headers=headers, timeout=TIMEOUT)
            if r.status_code in (429, 500, 502, 503, 504):
                ultimo = f"HTTP {r.status_code}"
                time.sleep(3 * intento)
                continue
            if r.status_code >= 400:
                raise AgenteNoDisponible(f"El proveedor del agente respondió HTTP {r.status_code}: {r.text[:300]}")
            return _json(r.json()["choices"][0]["message"]["content"])
        except (requests.Timeout, requests.ConnectionError) as e:
            ultimo = str(e)
            time.sleep(3 * intento)
        except (json.JSONDecodeError, KeyError, IndexError) as e:
            ultimo = f"respuesta no es JSON válido ({e})"
    raise AgenteNoDisponible(f"El agente no respondió tras {REINTENTOS} intentos: {ultimo}")


def _mmss(seg) -> str:
    s = int(seg or 0)
    return f"{s // 60:02d}:{s % 60:02d}"


# ─── Identificación de roles (¿qué hablante diarizado es el asesor?) ─────────
_SISTEMA_ROLES = """Eres analista de llamadas de cobranza en Perú. Te doy las primeras frases \
de cada hablante de UNA llamada (separadas por el diarizador). Indica cuál es el ASESOR de \
cobranza (se presenta, nombra a la empresa o banco, habla de la deuda, montos, fechas, \
descuentos u opciones de pago) y cuál el CLIENTE (contesta, confirma identidad, explica su \
situación). Responde SOLO JSON: {"asesor": "<etiqueta del hablante>"}"""


def identificar_asesor(transcripcion: list) -> str | None:
    """Etiqueta del diarizador (p. ej. 'SPEAKER_01') que corresponde al asesor."""
    por_hablante = {}
    for seg in transcripcion:
        spk = seg.get("speaker")
        if spk and len(por_hablante.setdefault(spk, [])) < 10:
            por_hablante[spk].append(seg["text"])
    if len(por_hablante) < 2:
        return next(iter(por_hablante), None)
    usuario = "\n\n".join(f"Hablante {spk}:\n" + "\n".join(f"- {t}" for t in textos)
                          for spk, textos in por_hablante.items())
    asesor = str(_chat(_SISTEMA_ROLES, usuario).get("asesor") or "").strip()
    if asesor in por_hablante:
        return asesor
    # Tolera respuestas como "Hablante SPEAKER_01" (las etiquetas no se contienen entre sí).
    return next((spk for spk in por_hablante if spk in asesor), None)


# ─── Evaluación por criterios ────────────────────────────────────────────────
_SISTEMA_EVAL = """Eres auditor de calidad de llamadas de cobranza en Perú. Evalúas al ASESOR \
en UNA llamada con la plantilla que te entregan (ítems → criterios → acciones). Reglas:
1. Para CADA criterio elige la acción que mejor describe lo que hizo el ASESOR (su id_accion). \
Si el asesor no realizó ninguna de las acciones del criterio, usa id_accion=null.
2. "evidencia": cita LITERAL y breve (máx. 25 palabras) de la transcripción, y "segmento": el \
número [n] del segmento citado. Sin evidencia: evidencia="" y segmento=null. Nunca inventes frases.
3. "justificacion": una oración en español explicando la elección.
4. Interpreta cada criterio y acción por su nombre, como lo haría un monitor de calidad de cobranzas.
5. Promesa de pago: hay_promesa=true SOLO si el CLIENTE se compromete explícitamente a pagar \
(con fecha, monto o ambos), p. ej. "el viernes le deposito 200". "Voy a ver", "cuando pueda", \
"tal vez" NO son promesa. "fecha" en YYYY-MM-DD calculada a partir de la fecha de la llamada; \
"monto" en soles como número; null si no se dijo.
6. Motivo de no pago: si el cliente da un motivo, elige el id del catálogo que mejor encaje \
(null si ninguno encaja o no hay catálogo) y cita la frase.
7. No calcules puntajes ni porcentajes.
Responde SOLO un JSON:
{"criterios": [{"id_criterio": n, "id_accion": n|null, "evidencia": "...", "segmento": n|null, \
"justificacion": "..."}],
 "promesa_pago": {"hay_promesa": bool, "tipo": "TOTAL"|"PARCIAL"|"NINGUNA", "fecha": "YYYY-MM-DD"|null, \
"monto": n|null, "segmento": n|null, "cita": "..."},
 "motivo_no_pago": {"id": n|null, "cita": "..."},
 "contacto": "TITULAR"|"TERCERO"|"SIN_CONTACTO",
 "sentimiento_cliente": "POSITIVO"|"NEUTRO"|"NEGATIVO",
 "resumen": "2 o 3 oraciones sobre lo ocurrido en la llamada"}"""


def _plantilla(modelo: dict) -> list:
    return [{
        "item": it["nombre"],
        "criterios": [{
            "id_criterio": c["id_criterio"],
            "criterio": c["nombre"],
            "acciones": [{"id_accion": a["id_accion"], "accion": a["nombre"]} for a in c["acciones"]],
        } for c in it["criterios"]],
    } for it in modelo["items"]]


def evaluar(modelo: dict, transcripcion: list, motivos: list, fecha_llamada: str,
            palabras: list | None = None) -> dict:
    lineas = "\n".join(
        f"[{i}] {_mmss(s.get('start'))} {'ASESOR' if s.get('speaker') == ASESOR else 'CLIENTE'}: {s['text']}"
        for i, s in enumerate(transcripcion))
    usuario = json.dumps({
        "fecha_llamada": fecha_llamada,
        "plantilla": modelo["nombre_modelo"],
        "items": _plantilla(modelo),
        "catalogo_motivos_no_pago": motivos,
        "palabras_clave_detectadas": palabras or [],
    }, ensure_ascii=False) + "\n\nTRANSCRIPCIÓN:\n" + lineas
    return validar_salida(_chat(_SISTEMA_EVAL, usuario), modelo, motivos, len(transcripcion))


def _fecha(valor) -> str | None:
    if not isinstance(valor, str):
        return None
    try:
        return datetime.strptime(valor.strip(), "%Y-%m-%d").strftime("%Y-%m-%d")
    except ValueError:
        return None


def _segmento(valor, n: int):
    if isinstance(valor, bool) or not isinstance(valor, (int, float)):
        return None
    return int(valor) if 0 <= int(valor) < n else None


def validar_salida(data: dict, modelo: dict, motivos: list, n_segmentos: int) -> dict:
    """Ajusta la respuesta del agente a la plantilla y al catálogo (descarta lo ajeno)."""
    validas = {c["id_criterio"]: {a["id_accion"] for a in c["acciones"]}
               for it in modelo["items"] for c in it["criterios"]}
    elecciones = {}
    for c in data.get("criterios") or []:
        try:
            idc = int(c.get("id_criterio"))
        except (TypeError, ValueError):
            continue
        if idc not in validas:
            continue
        ida = c.get("id_accion")
        if ida is not None:
            try:
                ida = int(ida)
            except (TypeError, ValueError):
                continue
            if ida not in validas[idc]:
                continue      # acción de otro criterio → el criterio queda para revisión
        elecciones[idc] = {"id_accion": ida, "evidencia": str(c.get("evidencia") or "")[:400],
                           "segmento": _segmento(c.get("segmento"), n_segmentos),
                           "justificacion": str(c.get("justificacion") or "")[:500]}

    pp = data.get("promesa_pago") or {}
    hay = pp.get("hay_promesa") is True or str(pp.get("hay_promesa")).lower() == "true"
    try:
        monto = round(float(pp["monto"]), 2) if pp.get("monto") not in (None, "") else None
    except (TypeError, ValueError):
        monto = None
    tipo = str(pp.get("tipo") or "").upper()
    promesa = {
        "hay_promesa": hay,
        "tipo": (tipo if tipo in ("TOTAL", "PARCIAL") else "TOTAL") if hay else "NINGUNA",
        "fecha": _fecha(pp.get("fecha")) if hay else None,
        "monto": monto if hay else None,
        "segmento": _segmento(pp.get("segmento"), n_segmentos) if hay else None,
        "cita": str(pp.get("cita") or "")[:400] if hay else "",
    }

    catalogo = {int(m["id"]): m["nombre"] for m in motivos}
    mnp = data.get("motivo_no_pago") or {}
    try:
        id_motivo = int(mnp["id"]) if mnp.get("id") is not None else None
    except (TypeError, ValueError):
        id_motivo = None
    if id_motivo not in catalogo:
        id_motivo = None
    motivo = {"id": id_motivo, "nombre": catalogo.get(id_motivo),
              "cita": str(mnp.get("cita") or "")[:400] if id_motivo else ""}

    def _enum(valor, opciones, defecto):
        v = str(valor or "").upper()
        return v if v in opciones else defecto

    return {
        "elecciones": elecciones,
        "promesa_pago": promesa,
        "motivo_no_pago": motivo,
        "contacto": _enum(data.get("contacto"), {"TITULAR", "TERCERO", "SIN_CONTACTO"}, "TITULAR"),
        "sentimiento_cliente": _enum(data.get("sentimiento_cliente"), {"POSITIVO", "NEUTRO", "NEGATIVO"}, "NEUTRO"),
        "resumen": str(data.get("resumen") or "")[:1500],
    }
