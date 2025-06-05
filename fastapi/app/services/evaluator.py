import logging
from app.services.evaluaciones.apertura import evaluar_apertura
from app.services.evaluaciones.indagacion import evaluar_indagacion

logger = logging.getLogger(__name__)

def evaluar_llamada(transcripcion: list, id_cartera: str, tipificaciones: dict = None) -> dict:
    """
    Evalúa la llamada usando distintos criterios según los segmentos del asesor.

    Args:
        transcripcion (list): Transcripción completa etiquetada por roles.
        id_cartera (str): ID de la cartera para cargar los criterios adecuados.
        tipificaciones (dict, optional): Datos extra para evaluación.

    Returns:
        dict: Resultados de cada evaluación parcial.
    """
    # Filtramos solo segmentos del asesor (rol "000")
    segmentos_asesor = [s for s in transcripcion if s.get("speaker") == "000"]

    if not segmentos_asesor:
        logger.warning("⚠️ No se encontraron segmentos del asesor (speaker='000')")

    resultados = {
        "apertura": evaluar_apertura(segmentos_asesor, id_cartera),
        "indagacion": evaluar_indagacion(segmentos_asesor, id_cartera, tipificaciones)
        # Puedes agregar más: "cierre", "manejo_objeciones", etc.
    }

    logger.info("🧾 Evaluación final: %s", resultados)
    return resultados
