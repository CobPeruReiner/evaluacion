import logging
from app.db.session import obtener_conexion
from app.services.db_queries.apertura import (
    obtener_id_item,
    obtener_criterios_por_item,
    obtener_acciones_por_criterio,
)
from app.services.acciones.Apertura.apertura_acciones import (
    seleccionar_accion_saludo,
    seleccionar_accion_contacto,
    seleccionar_accion_identificacion,
)
from app.services.utils.texto import normalizar_texto

logger = logging.getLogger(__name__)


def evaluar_apertura(segmentos: list, id_cartera: str) -> dict:
    if not segmentos:
        return {"resultado": "Sin evaluación", "motivo": "No se encontraron segmentos"}

    conn = obtener_conexion()

    try:
        id_item = obtener_id_item(conn, "APERTURA", id_cartera)

        # Depuracion
        logger.info(f"=================== APERTURA ===================")
        logger.info(f"id_cartera: {id_cartera}")
        logger.info(f"id_item: {id_item}")

        if not id_item:
            return {
                "resultado": "Sin evaluación",
                "motivo": "No se encontró el ítem 'APERTURA'",
            }

        criterios = obtener_criterios_por_item(conn, id_item)
        texto_asesor = normalizar_texto(" ".join([s["text"] for s in segmentos]))

        logger.info(f"Criterios: {criterios}")

        resultado_criterios = {}
        cumplidos = 0

        for criterio in criterios:
            nombre = criterio["NOMBRE_CRITERIO"].strip().upper()
            acciones = obtener_acciones_por_criterio(conn, criterio["ID_CRITERIO"])
            accion_detectada = None

            if nombre == "SALUDO":
                accion_detectada = seleccionar_accion_saludo(
                    texto_asesor, acciones, id_cartera
                )
            elif nombre == "CONTACTAR CON LA PERSONA ADECUADA":
                accion_detectada = seleccionar_accion_contacto(
                    texto_asesor, acciones, id_cartera
                )
            elif nombre == "IDENTIFICACIÓN DEL GESTOR":
                accion_detectada = seleccionar_accion_identificacion(
                    texto_asesor, acciones
                )
            else:
                continue

            if accion_detectada:
                accion_detectada["PESO_ACCION_CRITERIO"] = float(
                    accion_detectada.get("PESO_ACCION_CRITERIO", 0)
                )
                resultado_criterios[criterio["NOMBRE_CRITERIO"]] = accion_detectada

                if (
                    accion_detectada["NOMBRE_ACCION_CRITERIO"].strip().upper()
                    == "SÍ CUMPLE"
                ):
                    cumplidos += 1

        porcentaje = (
            (cumplidos / len(resultado_criterios)) * 100 if resultado_criterios else 0
        )
        resultado = "Aprobado" if porcentaje >= 60 else "Observado"

        return {
            "resultado": resultado,
            "cumplimiento": porcentaje,
            "criterios": resultado_criterios,
        }

    finally:
        conn.close()
