# app/services/evaluaciones/scotiabank_evaluator.py

import logging
from app.db.session import obtener_conexion
from app.services.db_queries.indagacion import (
    obtener_id_item,
    obtener_criterios_por_item,
    obtener_acciones_por_criterio
)
from app.services.scotiabank_acciones import (
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
    seleccionar_accion_registra_gestion
)
from app.services.utils.texto import normalizar_texto

logger = logging.getLogger(__name__)

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

def evaluar_fase_scotiabank(transcripcion: list, id_cartera: str, tipificaciones: dict = None) -> dict:
    """
    Evalúa las fases de la llamada para la cartera de Scotiabank,
    calculando un score ponderado en base a los criterios definidos en la DB,
    similar a la lógica de evaluar_indagacion.
    """
    segmentos_asesor = [s for s in transcripcion if s.get("speaker") == "000"]

    if not segmentos_asesor:
        logger.warning("⚠️ No se encontraron segmentos del asesor (speaker='000') para la evaluación de Scotiabank.")
        return {"resultado": "Sin evaluación", "cumplimiento_score": 0.0, "peso_total_posible": 0.0, "peso_obtenido": 0.0, "criterios_detallados": {}}

    conn = obtener_conexion()
    try:
        texto_asesor = normalizar_texto(" ".join([s["text"] for s in segmentos_asesor]))
        
        resultados_criterios_detallados = {}
        total_peso_posible = 0.0
        peso_obtenido = 0.0

        # Lista de nombres de los ítems para Scotiabank que buscará en tu DB
        item_nombres_scotiabank = [
            "APERTURA Y PRESENTACIÓN",
            "COMUNICACIÓN Y EMPATÍA",
            "MANEJO DE OBJECIONES",
            "ESTRATEGIA DE COBRO",
            "CIERRE DE LLAMADA",
            "CUMPLIMIENTO DE PROTOCOLOS"
        ]

        # Itera sobre cada nombre de ítem para obtener su ID y luego sus criterios
        for item_nombre in item_nombres_scotiabank:
            id_item = obtener_id_item(conn, item_nombre, id_cartera)
            
            logger.info(f"=================== SCOTIABANK - ITEM: {item_nombre} (ID: {id_item}) ===================")
            
            if not id_item:
                logger.error(f"❌ Ítem '{item_nombre}' no encontrado para la cartera {id_cartera}. No se evaluarán sus criterios.")
                continue 

            criterios = obtener_criterios_por_item(conn, id_item)
            if not criterios:
                logger.warning(f"⚠️ No se encontraron criterios activos para el ítem '{item_nombre}' (ID: {id_item}).")
                continue

            logger.info(f"Criterios activos para {item_nombre}: {[c['NOMBRE_CRITERIO'] for c in criterios]}")

            for criterio in criterios:
                nombre_criterio = criterio["NOMBRE_CRITERIO"].strip().upper()
                acciones = obtener_acciones_por_criterio(conn, criterio["ID_CRITERIO"])

                accion_si_cumple = next((a for a in acciones if a["NOMBRE_ACCION_CRITERIO"].strip().upper() == "SI CUMPLE"), None)
                if not accion_si_cumple:
                    logger.warning(f"No se encontró la acción 'SI CUMPLE' para el criterio '{nombre_criterio}' (ID: {criterio['ID_CRITERIO']}). Saltando este criterio.")
                    continue
                
                peso_max_criterio = float(accion_si_cumple.get("PESO_ACCION_CRITERIO", 0.0))
                total_peso_posible += peso_max_criterio

                # --- Aquí el bloque if/elif/else que mapea el nombre del criterio a la función de acción ---
                accion_detectada = None
                if nombre_criterio == "SE IDENTIFICA CORRECTAMENTE Y CON CORTESÍA":
                    accion_detectada = seleccionar_accion_identificacion_cortesia(texto_asesor, acciones)
                elif nombre_criterio == "VERIFICA LA IDENTIDAD DEL CLIENTE CON SEGURIDAD Y RESPETO":
                    accion_detectada = seleccionar_accion_verificacion_identidad(texto_asesor, acciones)
                elif nombre_criterio == "ESCUCHA ACTIVA, SIN INTERRUMPIR":
                    accion_detectada = seleccionar_accion_escucha_activa(texto_asesor, acciones)
                elif nombre_criterio == "USA LENGUAJE CLARO, PROFESIONAL Y EMPÁTICO":
                    accion_detectada = seleccionar_accion_lenguaje_profesional(texto_asesor, acciones)
                elif nombre_criterio == "DETECTA Y GESTIONA ADECUADAMENTE EXCUSAS O NEGATIVAS DEL CLIENTE":
                    accion_detectada = seleccionar_accion_gestion_objeciones(texto_asesor, acciones)
                elif nombre_criterio == "OFRECE SOLUCIONES ADAPTADAS AL PERFIL Y SITUACIÓN DEL DEUDOR":
                    accion_detectada = seleccionar_accion_soluciones_adaptadas(texto_asesor, acciones)
                elif nombre_criterio == "PRESENTA EL SALDO CORRECTAMENTE":
                    accion_detectada = seleccionar_accion_presenta_saldo(texto_asesor, acciones)
                elif nombre_criterio == "PROPONE PLANES DE PAGO VIABLES O REESTRUCTURACIÓN SI CORRESPONDE":
                    accion_detectada = seleccionar_accion_propone_planes(texto_asesor, acciones)
                elif nombre_criterio == "LOGRA COMPROMISO CLARO DE PAGO (FECHA, MONTO, MEDIO)":
                    accion_detectada = seleccionar_accion_logra_compromiso(texto_asesor, acciones)
                elif nombre_criterio == "RESUME ACUERDOS Y VERIFICA COMPRENSIÓN DEL CLIENTE":
                    accion_detectada = seleccionar_accion_resume_acuerdos(texto_asesor, acciones)
                elif nombre_criterio == "SE DESPIDE CORDIALMENTE, MANTENIENDO PUERTA ABIERTA PARA SEGUIMIENTO":
                    accion_detectada = seleccionar_accion_despedida_cordial(texto_asesor, acciones)
                elif nombre_criterio == "SIGUE GUION Y POLÍTICAS DE LA EMPRESA":
                    accion_detectada = seleccionar_accion_sigue_guion_politicas(texto_asesor, acciones)
                elif nombre_criterio == "REGISTRA LA GESTIÓN ADECUADAMENTE EN EL SISTEMA":
                    accion_detectada = seleccionar_accion_registra_gestion(texto_asesor, acciones)
                else:
                    logger.warning(f"No hay una lógica de evaluación mapeada (if/elif) para el criterio: '{nombre_criterio}'. Se omitirá.")
                    resultados_criterios_detallados[nombre_criterio] = {
                        "accion_detectada": "NO EVALUADO (Sin mapeo en código)",
                        "peso_obtenido": 0.0,
                        "peso_maximo": peso_max_criterio
                    }
                    continue 

                if accion_detectada:
                    peso_accion = float(accion_detectada.get("PESO_ACCION_CRITERIO", 0.0))
                    peso_obtenido += peso_accion
                    resultados_criterios_detallados[nombre_criterio] = {
                        "accion_detectada": accion_detectada["NOMBRE_ACCION_CRITERIO"],
                        "peso_obtenido": peso_accion,
                        "peso_maximo": peso_max_criterio
                    }
                else:
                    logger.error(f"La función de evaluación para '{nombre_criterio}' no devolvió ninguna acción. Esto es un error de lógica.")
                    resultados_criterios_detallados[nombre_criterio] = {
                        "accion_detectada": "ERROR_LOGICA_FUNCION_ACCION",
                        "peso_obtenido": 0.0,
                        "peso_maximo": peso_max_criterio
                    }

        score_final = peso_obtenido / total_peso_posible if total_peso_posible > 0 else 0.0
        estado_final = obtener_resultado_ponderado(score_final)

        return {
            "resultado": estado_final,
            "cumplimiento_score": round(score_final * 100, 2),
            "peso_total_posible": total_peso_posible,
            "peso_obtenido": peso_obtenido,
            "criterios_detallados": resultados_criterios_detallados
        }

    finally:
        conn.close()