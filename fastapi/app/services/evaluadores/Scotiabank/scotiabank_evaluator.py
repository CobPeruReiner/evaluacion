# app/services/evaluaciones/scotiabank_evaluator.py

import logging
from app.db.session import obtener_conexion
from app.services.db_queries.indagacion import (
    obtener_id_item,
    obtener_criterios_por_item,
    obtener_acciones_por_criterio,
)
from app.services.acciones.Scotiabank.scotiabank_acciones import (
    seleccionar_accion_identificacion_cortesia,
    seleccionar_accion_verificacion_identidad,
    seleccionar_accion_lenguaje_profesional,
    seleccionar_accion_escucha_activa,
    seleccionar_accion_gestion_objeciones,
    seleccionar_accion_soluciones_adaptadas,
    seleccionar_accion_presenta_saldo,
    seleccionar_accion_propone_planes,
    seleccionar_accion_logra_compromiso,
    seleccionar_accion_resume_acuerdos,
    seleccionar_accion_despedida_cordial,
    seleccionar_accion_sigue_guion_politicas,
    seleccionar_accion_registra_gestion,
)
from app.services.utils.texto import normalizar_texto

logger = logging.getLogger(__name__)


def evaluar_criterio_scotiabank(
    nombre_criterio: str, texto: str, acciones: list
) -> dict:
    if nombre_criterio == "SE IDENTIFICA CORRECTAMENTE Y CON CORTESÍA":
        return seleccionar_accion_identificacion_cortesia(texto, acciones)
    elif nombre_criterio == "VERIFICA LA IDENTIDAD DEL CLIENTE CON SEGURIDAD Y RESPETO":
        return seleccionar_accion_verificacion_identidad(texto, acciones)
    elif nombre_criterio == "ESCUCHA ACTIVA, SIN INTERRUMPIR":
        return seleccionar_accion_escucha_activa(texto, acciones)
    elif nombre_criterio == "USA LENGUAJE CLARO, PROFESIONAL Y EMPÁTICO":
        return seleccionar_accion_lenguaje_profesional(texto, acciones)
    elif (
        nombre_criterio
        == "DETECTA Y GESTIONA ADECUADAMENTE EXCUSAS O NEGATIVAS DEL CLIENTE"
    ):
        return seleccionar_accion_gestion_objeciones(texto, acciones)
    elif (
        nombre_criterio
        == "OFRECE SOLUCIONES ADAPTADAS AL PERFIL Y SITUACIÓN DEL DEUDOR"
    ):
        return seleccionar_accion_soluciones_adaptadas(texto, acciones)
    elif nombre_criterio == "PRESENTA EL SALDO CORRECTAMENTE":
        return seleccionar_accion_presenta_saldo(texto, acciones)
    elif (
        nombre_criterio
        == "PROPONE PLANES DE PAGO VIABLES O REESTRUCTURACIÓN SI CORRESPONDE"
    ):
        return seleccionar_accion_propone_planes(texto, acciones)
    elif nombre_criterio == "LOGRA COMPROMISO CLARO DE PAGO (FECHA, MONTO, MEDIO)":
        return seleccionar_accion_logra_compromiso(texto, acciones)
    elif nombre_criterio == "RESUME ACUERDOS Y VERIFICA COMPRENSIÓN DEL CLIENTE":
        return seleccionar_accion_resume_acuerdos(texto, acciones)
    elif (
        nombre_criterio
        == "SE DESPIDE CORDIALMENTE, MANTENIENDO PUERTA ABIERTA PARA SEGUIMIENTO"
    ):
        return seleccionar_accion_despedida_cordial(texto, acciones)
    elif nombre_criterio == "SIGUE GUION Y POLÍTICAS DE LA EMPRESA":
        return seleccionar_accion_sigue_guion_politicas(texto, acciones)
    elif nombre_criterio == "REGISTRA LA GESTIÓN ADECUADAMENTE EN EL SISTEMA":
        return seleccionar_accion_registra_gestion(texto, acciones)
    return None


def obtener_resultado_ponderado(score: float) -> str:
    """Define el resultado de la evaluación basada en el score ponderado."""
    if score >= 0.75:
        return "Excelente"
    elif score >= 0.70:
        return "Bueno"
    elif score >= 0.60:
        return "Deficiente/Trabajable"
    else:
        return "Deficiente"


def evaluar_fase_scotiabank(
    transcripcion: list, id_cartera: str, tipificaciones: dict = None
) -> dict:
    segmentos_asesor = [s for s in transcripcion if s.get("speaker") == "000"]

    if not segmentos_asesor:
        logger.warning(
            "⚠️ No se encontraron segmentos del asesor (speaker='000') para la evaluación de Scotiabank."
        )
        return {}

    conn = obtener_conexion()
    try:
        texto_asesor = normalizar_texto(" ".join([s["text"] for s in segmentos_asesor]))
        resultados_por_item = {}

        item_nombres_scotiabank = [
            "APERTURA Y PRESENTACIÓN",
            "COMUNICACIÓN Y EMPATÍA",
            "MANEJO DE OBJECIONES",
            "ESTRATEGIA DE COBRO",
            "CIERRE DE LLAMADA",
            "CUMPLIMIENTO DE PROTOCOLOS",
        ]

        for item_nombre in item_nombres_scotiabank:
            logger.info(
                "=================================================================="
            )
            logger.info(f"Nombre item: {item_nombre}")

            id_item = obtener_id_item(conn, item_nombre, id_cartera)
            if not id_item:
                logger.error(f"❌ Ítem '{item_nombre}' no encontrado.")
                continue

            logger.info(
                "=================================================================="
            )
            logger.info(f"ID item encontrado: {id_item}")

            criterios = obtener_criterios_por_item(conn, id_item)
            if not criterios:
                logger.warning(f"⚠️ No hay criterios activos para '{item_nombre}'")
                continue

            criterios_dict = {}
            peso_total = 0.0
            peso_obtenido = 0.0

            for criterio in criterios:
                id_criterio = criterio["ID_CRITERIO"]
                nombre_criterio = criterio["NOMBRE_CRITERIO"]
                peso_criterio = float(criterio["PESO_CRITERIO"])

                logger.info(
                    "=================================================================="
                )
                logger.info(f"Peso del criterio: {peso_criterio}")

                acciones = obtener_acciones_por_criterio(conn, id_criterio)
                accion_detectada = evaluar_criterio_scotiabank(
                    nombre_criterio, texto_asesor, acciones
                )

                peso_accion = (
                    float(accion_detectada.get("PESO_ACCION_CRITERIO", 0.0))
                    if accion_detectada
                    else 0.0
                )
                peso_obtenido += peso_accion
                peso_total += peso_criterio

                criterios_dict[nombre_criterio] = {
                    "NOMBRE_ACCION_CRITERIO": (
                        accion_detectada.get("NOMBRE_ACCION_CRITERIO")
                        if accion_detectada
                        else "NO DETECTADO"
                    ),
                    "PESO_ACCION_CRITERIO": peso_accion,
                    "PESO_CRITERIO": peso_criterio,
                }

            # ✅ Calcular cumplimiento y resultado por ítem
            porcentaje = (peso_obtenido / peso_total) * 100 if peso_total > 0 else 0.0
            resultado = "Aprobado" if porcentaje >= 60 else "Observado"

            resultados_por_item[item_nombre] = {
                "resultado": resultado,
                "cumplimiento": round(porcentaje, 2),
                "criterios": criterios_dict,
            }

        # ✅ Resumen global
        total_cumplimiento = sum(
            item["cumplimiento"]
            for item in resultados_por_item.values()
            if item != "resumen_final"
        )
        total_items = len(
            [item for item in resultados_por_item.values() if item != "resumen_final"]
        )

        cumplimiento_total = (
            round(total_cumplimiento / total_items, 2) if total_items else 0.0
        )
        estado_global = obtener_resultado_ponderado(cumplimiento_total / 100)

        resultados_por_item["resumen_final"] = {
            "cumplimiento_total": cumplimiento_total,
            "estado_global": estado_global,
        }

        return resultados_por_item

    finally:
        conn.close()
