import logging
from app.db.session import obtener_conexion
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

    conn = obtener_conexion()
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

        logger.info(f"Criterios: {criterios}")

        resultados = {}
        cumplidos = 0

        for criterio in criterios:
            nombre = criterio["NOMBRE_CRITERIO"].strip().upper()
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

            accion["PESO_ACCION_CRITERIO"] = float(
                accion.get("PESO_ACCION_CRITERIO", 0)
            )
            resultados[nombre] = accion

            if accion["NOMBRE_ACCION_CRITERIO"].strip().upper() == "SÍ CUMPLE":
                cumplidos += 1

        porcentaje = (cumplidos / len(resultados)) * 100 if resultados else 0
        estado = "Aprobado" if porcentaje >= 60 else "Observado"

        return {
            "resultado": estado,
            "cumplimiento": porcentaje,
            "criterios": resultados,
        }

    finally:
        conn.close()
