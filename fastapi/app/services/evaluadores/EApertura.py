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

        resultado_criterios = {}
        peso_total = 0
        peso_ponderado = 0

        for criterio in criterios:
            nombre = criterio["NOMBRE_CRITERIO"].strip().upper()
            peso_criterio = float(criterio.get("PESO_CRITERIO", 0))
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
                peso_accion = float(accion_detectada.get("PESO_ACCION_CRITERIO", 0))
                accion_detectada["PESO_ACCION_CRITERIO"] = peso_accion
                accion_detectada["PESO_CRITERIO"] = peso_criterio

                resultado_criterios[criterio["NOMBRE_CRITERIO"]] = accion_detectada

                peso_total += peso_criterio
                peso_ponderado += peso_criterio * peso_accion

        cumplimiento = (peso_ponderado / peso_total) * 100 if peso_total else 0
        resultado = "Aprobado" if cumplimiento >= 60 else "Observado"

        return {
            "resultado": resultado,
            "cumplimiento": round(cumplimiento, 2),
            "criterios": resultado_criterios,
        }

    finally:
        conn.close()
