import logging
from app.services.evaluaciones.apertura import evaluar_apertura
from app.services.evaluaciones.indagacion import evaluar_indagacion

logger = logging.getLogger(__name__)

def evaluar_llamada(transcripcion: list, id_cartera: str, tipificaciones: dict = None) -> dict:
    
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
