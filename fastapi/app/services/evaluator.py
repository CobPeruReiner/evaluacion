import logging
from app.services.evaluadores.EApertura import evaluar_apertura
from app.services.evaluadores.EIndagacion import evaluar_indagacion
from app.services.evaluadores.Scotiabank.scotiabank_evaluator import (
    evaluar_fase_scotiabank,
)

logger = logging.getLogger(__name__)


def evaluar_llamada(
    transcripcion: list, id_cartera: str, tipificaciones: dict = None
) -> dict:
    logger.info("Cartera a evaluar: %s", id_cartera)

    # Filtramos solo segmentos del asesor (rol "000")
    segmentos_asesor = [s for s in transcripcion if s.get("speaker") == "000"]

    if not segmentos_asesor:
        logger.warning("⚠️ No se encontraron segmentos del asesor (speaker='000')")
        return {"error": "No hay segmentos de asesor para evaluar."}

    resultados = {}

    if id_cartera == "70":
        logger.info(
            f"⚙️ Iniciando evaluación específica para Scotiabank (ID Cartera {id_cartera})..."
        )
        resultados["scotiabank_evaluacion"] = evaluar_fase_scotiabank(
            transcripcion, id_cartera, tipificaciones
        )
    else:
        logger.info(
            f"⚙️ Iniciando evaluación general para cartera {id_cartera} (Apertura, Indagación)..."
        )
        resultados["apertura"] = evaluar_apertura(segmentos_asesor, id_cartera)
        resultados["indagacion"] = evaluar_indagacion(
            segmentos_asesor, id_cartera, tipificaciones
        )

    logger.info("🧾 Evaluación final: %s", resultados)
    return resultados
