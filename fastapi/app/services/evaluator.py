from logging import getLogger
from app.core.evaluador import evaluar_item
from app.core.scoring import estado_porcentaje
from app.data.dao import obtener_configuracion_evaluacion, obtener_tipo_cartera
from app.services.utils.texto import normalizar_texto
from app.db.session import get_database_connection

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

    conn = get_database_connection()
    try:
        configuracion = obtener_configuracion_evaluacion(conn, id_cartera)
        cartera_tipo = obtener_tipo_cartera(conn, id_cartera)

        puntaje_ponderado, peso_total_items = 0.0, 0.0
        for item in configuracion["items"]:
            resultado = evaluar_item(
                texto_norm=texto_asesor,
                id_item=item["ID_ITEM"],
                id_cartera=id_cartera,
                tipificaciones=tipificaciones,
                conn=conn,
                cartera_tipo=cartera_tipo,
                criterios_preloaded=configuracion["criterios_por_item"][item["ID_ITEM"]],
                acciones_preloaded=configuracion["acciones_por_criterio"],
            )
            resultados[item["NOMBRE_ITEM"]] = resultado
            if resultado.get("cumplimiento") is not None:
                peso_item = float(item["PESO_ITEM"])
                puntaje_ponderado += resultado["cumplimiento"] * peso_item
                peso_total_items += peso_item

        if peso_total_items <= 0:
            raise ValueError("La plantilla activa no tiene pesos válidos en sus ítems.")
        promedio = round(puntaje_ponderado / peso_total_items, 2)
        estado_global = estado_porcentaje(promedio)

        resultados["resumen_final"] = {
            "id_modelo": configuracion["id_modelo"],
            "modelo": configuracion["nombre_modelo"],
            "cumplimiento_total": promedio,
            "estado_global": estado_global,
        }
        return resultados
    finally:
        conn.close()
