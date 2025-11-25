import logging
from app.db.session import SyS_Calidad
from app.services.db_queries.indagacion import (
    obtener_id_item,
    obtener_criterios_por_item,
    obtener_acciones_por_criterio,
)
from app.services.acciones.CierreLlamada.CLlamada_acciones import (
    seleccionar_accion_reafirmar,
    seleccionar_accion_despedida,
)
from app.services.utils.texto import normalizar_texto

logger = logging.getLogger(__name__)


def evaluar_cierre_llamada(
    segmentos: list, id_cartera: str, tipificaciones: dict = None
) -> dict:
    if not segmentos:
        return {"resultado": "Sin evaluación", "motivo": "No hay segmentos del asesor"}

    conn = SyS_Calidad()
    try:
        id_item = obtener_id_item(conn, "CIERRE DE LLAMADA", id_cartera)

        logger.info(f"=================== CIERRE DE LLAMADA ===================")
        logger.info(f"id_cartera: {id_cartera}")
        logger.info(f"id_item: {id_item}")

        if not id_item:
            return {"resultado": "Sin evaluación", "motivo": "Ítem no encontrado"}

        criterios = obtener_criterios_por_item(conn, id_item)
        texto = normalizar_texto(" ".join([s["text"] for s in segmentos]))

        resultados = {}
        peso_total = 0
        peso_cumplido = 0

        for criterio in criterios:
            nombre_criterio = criterio["NOMBRE_CRITERIO"].strip().upper()
            peso_criterio = float(criterio.get("PESO_CRITERIO", 0))

            acciones = obtener_acciones_por_criterio(conn, criterio["ID_CRITERIO"])

            if "REAFIRMAR" in nombre_criterio:
                accion = seleccionar_accion_reafirmar(texto, acciones, id_cartera)
            elif "DESPEDIDA" in nombre_criterio:
                accion = seleccionar_accion_despedida(texto, acciones, id_cartera)
            else:
                continue

            if not accion:
                continue

            peso_accion = float(accion.get("PESO_ACCION_CRITERIO", 0))
            accion["PESO_ACCION_CRITERIO"] = peso_accion
            accion["PESO_CRITERIO"] = peso_criterio

            resultados[criterio["NOMBRE_CRITERIO"]] = accion

            peso_total += peso_criterio
            peso_cumplido += peso_criterio * peso_accion

        cumplimiento = (peso_cumplido / peso_total) * 100 if peso_total else 0
        estado = "Aprobado" if cumplimiento >= 60 else "Observado"

        return {
            "resultado": estado,
            "cumplimiento": round(cumplimiento, 2),
            "criterios": resultados,
        }

    finally:
        conn.close()
