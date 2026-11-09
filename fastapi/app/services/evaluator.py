"""Evaluación de una llamada con la plantilla activa de la cartera (agente IA + puntaje)."""

from datetime import datetime
from logging import getLogger

from app.core import agente, palabras_clave
from app.core.scoring import calificar
from app.data.dao import (
    obtener_configuracion_evaluacion,
    obtener_motivos_no_pago,
    obtener_tipo_cartera,
)
from app.db.session import get_database_connection

logger = getLogger(__name__)
VERSION_EVALUACION = 2


def cargar_contexto(id_cartera: str, palabras: list | None = None) -> dict:
    """Plantilla, tipo de cartera y motivos de no pago (solo lectura de CALIDAD /
    SISTEMAGEST). Se carga UNA vez por lote; si la plantilla está mal configurada,
    `error` lo explica y los audios igual se transcriben. `palabras` son las palabras
    clave que envía el server Node con el lote (no viven en la BD)."""
    contexto = {"id_cartera": id_cartera, "modelo": None, "tipo": None, "motivos": [],
                "palabras": palabras or [], "error": None}
    try:
        conn = get_database_connection()
    except Exception as error:
        logger.exception("Sin conexión a la BD de calidad")
        contexto["error"] = f"No hay conexión con la base de datos de calidad: {error}"
        return contexto
    try:
        try:
            contexto["modelo"] = obtener_configuracion_evaluacion(conn, id_cartera)
            contexto["tipo"] = obtener_tipo_cartera(conn, id_cartera)
            contexto["motivos"] = obtener_motivos_no_pago(conn, id_cartera)
        except Exception as error:
            logger.exception("Plantilla de la cartera %s no utilizable", id_cartera)
            contexto["error"] = str(error) or "Error de configuración de la plantilla."
    finally:
        conn.close()
    return contexto


def _fecha_iso(fecha_yyyymmdd: str) -> str:
    try:
        return datetime.strptime(fecha_yyyymmdd or "", "%Y%m%d").strftime("%Y-%m-%d")
    except ValueError:
        return datetime.now().strftime("%Y-%m-%d")


def _pendiente(mensaje: str, detalle: str, resumen_palabras: list) -> dict:
    return {"version": VERSION_EVALUACION, "estado": "pendiente", "mensaje": mensaje,
            "detalle": detalle, "palabras_clave": resumen_palabras}


def evaluar_llamada(transcripcion: list, contexto: dict, fecha_llamada: str, hallazgos: list) -> dict:
    """`transcripcion` ya con roles ('000' asesor, '001' cliente). Nunca lanza: si no se
    puede calificar devuelve estado 'pendiente' con el motivo (la transcripción vale sola)."""
    resumen_palabras = palabras_clave.resumen(hallazgos)
    if contexto.get("error"):
        return _pendiente("La plantilla de evaluación de la cartera no se pudo aplicar.",
                          contexto["error"], resumen_palabras)
    if not any(s.get("speaker") == agente.ASESOR for s in transcripcion):
        return _pendiente("No se identificó al asesor en la llamada.",
                          "La diarización no encontró intervenciones del asesor.", resumen_palabras)
    if not agente.configurado():
        return _pendiente("Transcripción disponible; el agente evaluador no está configurado.",
                          "Define LLM_API_KEY / LLM_BASE_URL en el worker.", resumen_palabras)
    try:
        salida = agente.evaluar(contexto["modelo"], transcripcion, contexto["motivos"],
                                _fecha_iso(fecha_llamada), resumen_palabras)
    except agente.AgenteNoDisponible as error:
        logger.warning("Agente evaluador no disponible: %s", error)
        return _pendiente("Transcripción disponible; el agente evaluador no respondió.", str(error),
                          resumen_palabras)

    calificacion = calificar(contexto["modelo"], salida["elecciones"], contexto["tipo"])
    return {
        "version": VERSION_EVALUACION,
        "estado": "evaluado",
        **calificacion,
        "promesa_pago": salida["promesa_pago"],
        "motivo_no_pago": salida["motivo_no_pago"],
        "contacto": salida["contacto"],
        "sentimiento_cliente": salida["sentimiento_cliente"],
        "resumen": salida["resumen"],
        "palabras_clave": resumen_palabras,
        "agente": {"modelo_llm": agente.MODELO, "fecha": datetime.now().isoformat(timespec="seconds")},
    }
