import re
import logging

logger = logging.getLogger(__name__)


def detectar_monto(texto):
    logger.info("=============== DETECTANDO MONTO ===============")

    patrones = [
        r"\d+\s*(soles|dolares|centimos)?",
        r"\d+\s+con\s+\d+\s*(soles|centimos|dolares)?",
        r"monto\s+de\s+\d+",
        r"pago\s+de\s+\d+",
        r"importe\s+de\s+\d+",
        r"cuota\s+de\s+\d+\s*(soles|dolares)?",
        r"\bmonto\b",
    ]
    return any(re.search(p, texto) for p in patrones)


def detectar_antiguedad(texto):
    logger.info("=============== DETECTANDO ANTIGUEDAD ===============")

    frases = [
        "hace tiempo",
        "desde hace",
        "ya tiene tiempo",
        "ya paso tiempo",
        "ya paso la pandemia",
        "la deuda es antigua",
        "es de hace tiempo",
        "ya pasaron anos",
        "varios meses",
        "ha pasado tiempo",
        "bastante tiempo",
        "desde hace varios meses",
        "desde hace bastante",
        "ya casi cuatro anos",
        "ano pasado",
        "paso su fecha",
        "hace meses",
        "mes pasado",
        "ya son",
        "completa los",
        "dias",
        "anos",
        "ano",
        "mes",
        "semanas",
        "meses",
        "semana",
    ]
    return any(f in texto for f in frases)


def detectar_producto(texto):
    logger.info("=============== DETECTANDO PRODUCTO ===============")

    palabras = [
        "deuda",
        "tarjeta",
        "credito",
        "prestamo",
        "equipo",
        "celular",
        "movil",
        "con respecto a",
        "referente a",
        "en relacion a",
        "financiado",
        "modelo",
        "plan",
        "servicio",
        "cuota de",
        "dispositivo",
    ]
    return any(p in texto for p in palabras)


def detectar_fecha_pago(texto):
    logger.info("=============== DETECTANDO FECHA DE PAGO ===============")

    texto = texto.lower()
    patrones = [
        r"venc(?:e|imiento|io)",
        r"fecha de pago",
        r"hasta el dia",
        r"hasta el",
        r"se paga el",
        r"cancelar el",
        r"para el \d{1,2}",
        r"dia de pago",
        r"viernes",
        r"lunes|martes|miercoles|jueves|viernes|sabado|domingo",
        r"semana que viene",
        r"la proxima semana",
        r"esta semana",
        r"manana",
        r"el dia \d{1,2}",
        r"que dia.*cancelar",
        r"cuando puede pagar",
        r"cuando pagara",
        r"cuando va a pagar",
        r"cuando se paga",
        r"cuando hara el pago",
        r"cuándo abonará",
        r"planea pagar",
        r"fecha estimada de pago",
        r"fecha prevista",
        r"realizara el pago",
        r"va a cancelar el",
        r"se compromete a cancelar el",
    ]
    return any(re.search(p, texto) for p in patrones)
