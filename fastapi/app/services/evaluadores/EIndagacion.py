import logging
from app.db.session import SyS_Calidad
from app.services.db_queries.indagacion import (
    obtener_id_item,
    obtener_criterios_por_item,
    obtener_acciones_por_criterio,
)
from app.services.acciones.Indagacion.indagacion_acciones import (
    seleccionar_accion_info_producto,
    seleccionar_accion_indagar_pago,
    seleccionar_accion_asesorar,
)
from app.services.utils.texto import normalizar_texto

logger = logging.getLogger(__name__)


def evaluar_indagacion(
    segmentos: list, id_cartera: str, tipificaciones: dict = None
) -> dict:
    if not segmentos:
        return {"resultado": "Sin evaluación", "motivo": "No hay segmentos del asesor"}

    conn = SyS_Calidad()
    try:
        id_item = obtener_id_item(conn, "INDAGACION Y ASESORAMIENTO", id_cartera)

        # Depuracion
        logger.info(f"=================== INDAGACIÓN ===================")
        logger.info(f"id_cartera: {id_cartera}")
        logger.info(f"id_item: {id_item}")

        if not id_item:
            return {"resultado": "Sin evaluación", "motivo": "Ítem no encontrado"}

        criterios = obtener_criterios_por_item(conn, id_item)
        texto = normalizar_texto(" ".join([s["text"] for s in segmentos]))

        resultados = {}
        peso_total = 0
        peso_ponderado = 0

        for criterio in criterios:
            nombre = criterio["NOMBRE_CRITERIO"].strip().upper()
            peso_criterio = float(criterio.get("PESO_CRITERIO", 0))
            acciones = obtener_acciones_por_criterio(conn, criterio["ID_CRITERIO"])

            if "SITUACIÓN" in nombre:
                accion = seleccionar_accion_info_producto(
                    texto, acciones, id_cartera, tipificaciones
                )
            elif "INDAGAR MOTIVO" in nombre:
                accion = seleccionar_accion_indagar_pago(
                    texto, acciones, id_cartera, tipificaciones
                )
            elif nombre == "ASESORAR":
                accion = seleccionar_accion_asesorar(texto, acciones, id_cartera)
            else:
                continue

            if not accion:
                continue

            peso_accion = float(accion.get("PESO_ACCION_CRITERIO", 0))
            accion["PESO_ACCION_CRITERIO"] = peso_accion
            accion["PESO_CRITERIO"] = peso_criterio

            resultados[criterio["NOMBRE_CRITERIO"]] = accion

            peso_total += peso_criterio
            peso_ponderado += peso_criterio * peso_accion

        cumplimiento = (peso_ponderado / peso_total) * 100 if peso_total else 0
        estado = "Aprobado" if cumplimiento >= 60 else "Observado"

        return {
            "resultado": estado,
            "cumplimiento": round(cumplimiento, 2),
            "criterios": resultados,
        }

    finally:
        conn.close()
