from logging import getLogger
from app.core.evaluador import evaluar_item
from app.core.scoring import estado_porcentaje
from app.data.dao import obtener_configuracion_evaluacion, obtener_items_por_cartera, obtener_tipo_cartera
from app.services.utils.texto import normalizar_texto
from app.db.session import SyS_Calidad, SyS_Sistemagest

logger = getLogger(__name__)


def evaluar_llamada(
    transcripcion: list, id_cartera: str, tipificaciones: dict = None
) -> dict:
    logger.info("========= EVALUANDO LLAMADA =========")
    logger.info(f"id_cartera={id_cartera}")

    segmentos_asesor = [s for s in transcripcion if s.get("speaker") == "000"]
    if not segmentos_asesor:
        return {"error": "No hay segmentos de asesor para evaluar."}

    texto_asesor = normalizar_texto(" ".join([s["text"] for s in segmentos_asesor]))
    resultados = {}

    conn = SyS_Calidad()
    try:
        items = obtener_items_por_cartera(conn, id_cartera)
        if not items:
            return {"error": f"No hay ítems activos para cartera {id_cartera}"}

        criterios_por_item, acciones_por_criterio = obtener_configuracion_evaluacion(conn, id_cartera)

        cartera_conn = SyS_Sistemagest()
        try:
            cartera_tipo = obtener_tipo_cartera(cartera_conn, id_cartera)
        finally:
            cartera_conn.close()

        cumplimientos = []
        for item in items:
            resultado = evaluar_item(
                texto_norm=texto_asesor,
                id_item=item["ID_ITEM"],
                id_cartera=id_cartera,
                tipificaciones=tipificaciones,
                conn=conn,
                cartera_tipo=cartera_tipo,
                criterios_preloaded=criterios_por_item.get(item["ID_ITEM"], []),
                acciones_preloaded=acciones_por_criterio,
            )
            resultados[item["NOMBRE_ITEM"]] = resultado
            if resultado.get("cumplimiento") is not None:
                cumplimientos.append(resultado["cumplimiento"])

        if cumplimientos:
            promedio = round(sum(cumplimientos) / len(cumplimientos), 2)
            estado_global = estado_porcentaje(promedio)
        else:
            promedio = 0.0
            estado_global = "Sin evaluación"

        resultados["resumen_final"] = {
            "cumplimiento_total": promedio,
            "estado_global": estado_global,
        }
        return resultados
    finally:
        conn.close()
