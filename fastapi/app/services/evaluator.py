import logging
from app.services.evaluadores.EApertura import evaluar_apertura
from app.services.evaluadores.EIndagacion import evaluar_indagacion
from app.services.evaluadores.ECierre_Llamada import evaluar_cierre_llamada
from app.services.evaluadores.EHabilidades_Blandas import evaluar_habilidades_blandas
from app.services.evaluadores.EManejo_Llamada import evaluar_manejo_llamada
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
        resultados["cierre_llamada"] = evaluar_cierre_llamada(
            segmentos_asesor, id_cartera
        )
        resultados["habilidades_blandas"] = evaluar_habilidades_blandas(
            segmentos_asesor, id_cartera
        )
        resultados["manejo_llamada"] = evaluar_manejo_llamada(
            segmentos_asesor, id_cartera
        )

        cumplimientos = []
        for key in [
            "apertura",
            "indagacion",
            "cierre_llamada",
            "habilidades_blandas",
            "manejo_llamada",
        ]:
            cumplimiento = resultados.get(key, {}).get("cumplimiento")
            if cumplimiento is not None:
                cumplimientos.append(cumplimiento)

        if cumplimientos:
            promedio = round(sum(cumplimientos) / len(cumplimientos), 2)

            estado_global = (
                "Excelente"
                if promedio >= 75
                else (
                    "Bueno"
                    if promedio >= 70
                    else "Deficiente/Trabajable" if promedio >= 60 else "Deficiente"
                )
            )

            resultados["resumen_final"] = {
                "cumplimiento_total": promedio,
                "estado_global": estado_global,
            }
        else:
            resultados["resumen_final"] = {
                "cumplimiento_total": 0,
                "estado_global": "Sin evaluación",
            }

    logger.info("🧾 Evaluación final: %s", resultados)
    return resultados
