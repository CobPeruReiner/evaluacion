# app/services/scotiabank_acciones.py

import re
import logging
from app.services.utils.texto import normalizar_texto

logger = logging.getLogger(__name__)


def _seleccionar_accion(texto: str, acciones: list, palabras_clave: list) -> dict:
    normalized_text = normalizar_texto(texto)

    accion_si_cumple = next(
        (
            a
            for a in acciones
            if a["NOMBRE_ACCION_CRITERIO"].strip().upper() == "SI CUMPLE"
        ),
        None,
    )
    accion_no_cumple = next(
        (
            a
            for a in acciones
            if a["NOMBRE_ACCION_CRITERIO"].strip().upper() == "NO CUMPLE"
        ),
        None,
    )

    if not accion_si_cumple or not accion_no_cumple:
        logger.warning(
            f"Acciones 'SI CUMPLE' o 'NO CUMPLE' no encontradas para un criterio. Acciones disponibles: {acciones}"
        )
        return {
            "NOMBRE_ACCION_CRITERIO": "ERROR_CONFIGURACION_ACCION",
            "PESO_ACCION_CRITERIO": 0.0,
        }

    accion_si_cumple["PESO_ACCION_CRITERIO"] = float(
        accion_si_cumple["PESO_ACCION_CRITERIO"]
    )
    accion_no_cumple["PESO_ACCION_CRITERIO"] = float(
        accion_no_cumple["PESO_ACCION_CRITERIO"]
    )

    for palabra in palabras_clave:
        if re.search(
            r"\b" + re.escape(normalizar_texto(palabra)) + r"\b", normalized_text
        ):
            return accion_si_cumple

    return accion_no_cumple


# ====================================== 1. Apertura y presentación ======================================


def seleccionar_accion_identificacion_cortesia(texto: str, acciones: list) -> dict:
    palabras_clave = [
        "buenos dias",
        "buenas tardes",
        "buenas noches",
        "muy buenos dias",
        "muy buenas tardes",
        "muy buenas noches",
        "buenas",
        "buen dia",
    ]
    return _seleccionar_accion(texto, acciones, palabras_clave)


def seleccionar_accion_verificacion_identidad(texto: str, acciones: list) -> dict:
    palabras_clave = [
        "me comunico con",
        "me comunica con",
        "me estoy comunicando con",
        "con el sr",
        "con la sra",
        "con el senor",
        "con la senora",
        "se encuentra",
        "te saluda",
        "te saludo",
        "me podria comunicar con",
        "es usted el senor",
        "es usted la senora",
        "es usted la senorita",
        "nos comunicamos con la senora",
        "nos comunicamos con el senor",
        "nos comunicamos con la senorita",
        "es la senora",
        "es el senor",
        "el senor",
        "la senora",
    ]
    return _seleccionar_accion(texto, acciones, palabras_clave)


# ====================================== 2. Comunicación y empatía ======================================


def seleccionar_accion_lenguaje_profesional(texto: str, acciones: list) -> dict:
    palabras_clave = [
        "por favor",
        "gracias",
        "usted",
        "le informo",
        "le recuerdo",
        "estimado",
        "caballero",
        "le pido",
    ]
    return _seleccionar_accion(texto, acciones, palabras_clave)


def seleccionar_accion_escucha_activa(texto: str, acciones: list) -> dict:
    palabras_clave = [
        "entiendo",
        "comprendo",
        "claro",
        "sí",
        "de acuerdo",
        "lo que me dice es",
        "permitame validar",
        "correcto",
        "perfecto",
        "entendido",
    ]
    return _seleccionar_accion(texto, acciones, palabras_clave)


# ======================================== 3. Manejo de objeciones ========================================


def seleccionar_accion_gestion_objeciones(texto: str, acciones: list) -> dict:
    palabras_clave = [
        "entiendo su punto",
        "permítame explicarle",
        "consideremos",
        "podemos ajustar",
        "qué le parece si",
    ]
    return _seleccionar_accion(texto, acciones, palabras_clave)


def seleccionar_accion_soluciones_adaptadas(texto: str, acciones: list) -> dict:
    palabras_clave = [
        "opcion de pago",
        "plan especial",
        "alternativa",
        "se ajusta a su medida",
        "flexible",
        "liquida la deuda",
        "puede fraccionar en cuotas",
        "cuotas hasta en",
        "le recomiendo",
        "voucher",
        "conforme al mes",
    ]
    return _seleccionar_accion(texto, acciones, palabras_clave)


# =========================================== 4. Estrategia de cobro ===========================================


def seleccionar_accion_presenta_saldo(texto: str, acciones: list) -> dict:
    palabras_clave = [
        "saldo total",
        "monto pendiente",
        "deuda",
        "su saldo es",
        "el total a pagar",
        "importe de",
        "capital",
        "monto total",
        "deuda total",
        "monto capital",
    ]
    if re.search(
        r"\b(?:(?:soles|s\/|usd|\$)?\s?\d+(?:[.,]\d{3})*(?:[.,]\d{1,2})?)\b",
        normalizar_texto(texto),
    ):
        return _seleccionar_accion(texto, acciones, palabras_clave + ["monto"])
    return _seleccionar_accion(texto, acciones, palabras_clave)


def seleccionar_accion_propone_planes(texto: str, acciones: list) -> dict:
    palabras_clave = [
        "plan de pago",
        "cuotas",
        "reestructuracion",
        "cronograma",
        "pagos mensuales",
        "fraccionar en cuotas",
    ]
    return _seleccionar_accion(texto, acciones, palabras_clave)


def seleccionar_accion_logra_compromiso(texto: str, acciones: list) -> dict:
    palabras_clave = [
        "queda claro",
        "compromiso de pago",
        "realizar el pago",
        "confirmar la fecha",
        "entonces pagará",
        "estamos de acuerdo",
        "cuenta con el importe",
        "tienes que acercarte",
        "tiene que acercarse",
        "se podria acercar",
        "tener comunicacion con nosotros",
    ]
    return _seleccionar_accion(texto, acciones, palabras_clave)


# ============================================ 5. Cierre de llamada ============================================


def seleccionar_accion_resume_acuerdos(texto: str, acciones: list) -> dict:
    palabras_clave = [
        "resumiendo",
        "entonces lo acordado es",
        "para confirmar",
        "en resumen",
        "como le vuelvo a mencionar",
        "en ese caso",
        "como le hago mencion",
    ]
    return _seleccionar_accion(texto, acciones, palabras_clave)


def seleccionar_accion_despedida_cordial(texto: str, acciones: list) -> dict:
    palabras_clave = [
        "gracias por llamar",
        "que tenga un buen día",
        "hasta luego",
        "cualquier consulta",
        "estaremos atentos",
        "eso seria todo de mi parte",
        "que tengas",
        "que tenga",
        "muchas gracias senor",
        "muchas gracias senora",
    ]
    return _seleccionar_accion(texto, acciones, palabras_clave)


# ======================================== 6. Cumplimiento de protocolos ========================================


def seleccionar_accion_sigue_guion_politicas(texto: str, acciones: list) -> dict:
    palabras_clave = [
        "políticas de la empresa",
        "nuestros procedimientos",
        "según las normas",
        "estipulado en el guion",
    ]
    return _seleccionar_accion(texto, acciones, palabras_clave)


def seleccionar_accion_registra_gestion(texto: str, acciones: list) -> dict:
    palabras_clave = [
        "registrado",
        "anotado",
        "actualizado en el sistema",
        "dejaré constancia",
        "para su seguimiento",
        "hacer el reporte",
    ]
    return _seleccionar_accion(texto, acciones, palabras_clave)
