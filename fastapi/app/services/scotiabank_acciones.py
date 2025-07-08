# app/services/scotiabank_acciones.py

import re
import logging
from app.services.utils.texto import normalizar_texto

logger = logging.getLogger(__name__)

def _seleccionar_accion(texto: str, acciones: list, palabras_clave: list) -> dict:
    """
    Función auxiliar genérica para seleccionar una acción basada en la presencia de palabras clave.
    Prioriza 'SI CUMPLE' si las palabras clave se encuentran.
    """
    normalized_text = normalizar_texto(texto)
    
    accion_si_cumple = next((a for a in acciones if a["NOMBRE_ACCION_CRITERIO"].strip().upper() == "SI CUMPLE"), None)
    accion_no_cumple = next((a for a in acciones if a["NOMBRE_ACCION_CRITERIO"].strip().upper() == "NO CUMPLE"), None)

    if not accion_si_cumple or not accion_no_cumple:
        logger.warning(f"Acciones 'SI CUMPLE' o 'NO CUMPLE' no encontradas para un criterio. Acciones disponibles: {acciones}")
        return {"NOMBRE_ACCION_CRITERIO": "ERROR_CONFIGURACION_ACCION", "PESO_ACCION_CRITERIO": 0.0}

    accion_si_cumple["PESO_ACCION_CRITERIO"] = float(accion_si_cumple["PESO_ACCION_CRITERIO"])
    accion_no_cumple["PESO_ACCION_CRITERIO"] = float(accion_no_cumple["PESO_ACCION_CRITERIO"])

    for palabra in palabras_clave:
        if re.search(r'\b' + re.escape(normalizar_texto(palabra)) + r'\b', normalized_text):
            return accion_si_cumple
    
    return accion_no_cumple

# --- Funciones específicas para cada criterio de Scotiabank ---
# NOTA: Estas funciones son básicas. Para una evaluación precisa,
# podrían requerir lógica NLP más avanzada o una lista exhaustiva de palabras clave.

def seleccionar_accion_identificacion_cortesia(texto: str, acciones: list) -> dict:
    palabras_clave = ["buenas tardes", "buenos dias", "mi nombre es", "habla con", "scotiabank"]
    return _seleccionar_accion(texto, acciones, palabras_clave)

def seleccionar_accion_verificacion_identidad(texto: str, acciones: list) -> dict:
    palabras_clave = ["dni", "documento de identidad", "confirmar sus datos", "verificar identidad", "numero de documento"]
    return _seleccionar_accion(texto, acciones, palabras_clave)

def seleccionar_accion_lenguaje_profesional(texto: str, acciones: list) -> dict:
    palabras_clave = ["por favor", "gracias", "usted", "le informo", "le recuerdo"]
    return _seleccionar_accion(texto, acciones, palabras_clave)

def seleccionar_accion_escucha_activa(texto: str, acciones: list) -> dict:
    palabras_clave = ["entiendo", "comprendo", "claro", "sí", "de acuerdo", "lo que me dice es", "permitame validar"]
    return _seleccionar_accion(texto, acciones, palabras_clave)

def seleccionar_accion_gestion_objeciones(texto: str, acciones: list) -> dict:
    palabras_clave = ["entiendo su punto", "permítame explicarle", "consideremos", "podemos ajustar", "qué le parece si"]
    return _seleccionar_accion(texto, acciones, palabras_clave)

def seleccionar_accion_soluciones_adaptadas(texto: str, acciones: list) -> dict:
    palabras_clave = ["opcion de pago", "plan especial", "alternativa", "se ajusta a su medida", "flexible"]
    return _seleccionar_accion(texto, acciones, palabras_clave)

def seleccionar_accion_presenta_saldo(texto: str, acciones: list) -> dict:
    palabras_clave = ["saldo total", "monto pendiente", "deuda", "su saldo es", "el total a pagar"]
    if re.search(r'\b(?:(?:soles|s\/|usd|\$)?\s?\d+(?:[.,]\d{3})*(?:[.,]\d{1,2})?)\b', normalizar_texto(texto)):
        return _seleccionar_accion(texto, acciones, palabras_clave + ["monto"])
    return _seleccionar_accion(texto, acciones, palabras_clave)

def seleccionar_accion_propone_planes(texto: str, acciones: list) -> dict:
    palabras_clave = ["plan de pago", "cuotas", "reestructuracion", "cronograma", "pagos mensuales"]
    return _seleccionar_accion(texto, acciones, palabras_clave)

def seleccionar_accion_logra_compromiso(texto: str, acciones: list) -> dict:
    palabras_clave = ["queda claro", "compromiso de pago", "realizar el pago", "confirmar la fecha", "entonces pagará", "estamos de acuerdo"]
    return _seleccionar_accion(texto, acciones, palabras_clave)

def seleccionar_accion_resume_acuerdos(texto: str, acciones: list) -> dict:
    palabras_clave = ["resumiendo", "entonces lo acordado es", "para confirmar", "en resumen"]
    return _seleccionar_accion(texto, acciones, palabras_clave)

def seleccionar_accion_despedida_cordial(texto: str, acciones: list) -> dict:
    palabras_clave = ["gracias por llamar", "que tenga un buen día", "hasta luego", "cualquier consulta", "estaremos atentos"]
    return _seleccionar_accion(texto, acciones, palabras_clave)

def seleccionar_accion_sigue_guion_politicas(texto: str, acciones: list) -> dict:
    palabras_clave = ["políticas de la empresa", "nuestros procedimientos", "según las normas", "estipulado en el guion"]
    return _seleccionar_accion(texto, acciones, palabras_clave)

def seleccionar_accion_registra_gestion(texto: str, acciones: list) -> dict:
    palabras_clave = ["registrado", "anotado", "actualizado en el sistema", "dejaré constancia", "para su seguimiento"]
    return _seleccionar_accion(texto, acciones, palabras_clave)