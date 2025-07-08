import logging
import re

logger = logging.getLogger(__name__)


def seleccionar_accion_reafirmar(texto: str, acciones: list, id_cartera: str) -> dict:
    mapa = {a["NOMBRE_ACCION_CRITERIO"].strip().upper(): a for a in acciones}
    texto = texto.lower()

    patrones_confirmacion = [
        r"entonces.*paga",
        r"queda.*para",
        r"se compromete",
        r"acuerda pagar",
        r"cancelará",
        r"cancelar[áé]",
        r"va a pagar",
        r"nos vemos el",
        r"lo esperamos el",
        r"queda en cancelar",
    ]

    patrones_incompletos = [
        r"paga el",
        r"pago el",
        r"me dijo que paga",
        r"va a acercarse",
        r"va a ir",
    ]

    patrones_incorrectos = [
        r"usted verá",
        r"cuando pueda",
        r"usted decide",
        r"lo pensará",
        r"depende de usted",
    ]

    if any(re.search(p, texto) for p in patrones_confirmacion):
        return mapa.get("SI CUMPLE")
    elif any(re.search(p, texto) for p in patrones_incompletos):
        return mapa.get("RECONFIRMA DE FORMA INCOMPLETA")
    elif any(p in texto for p in patrones_incorrectos):
        return mapa.get("RECONFIRMA DE FORMA INCORRECTA")

    return mapa.get("NO RECONFIRMA COMPROMISO DE PAGO")


def seleccionar_accion_despedida(texto: str, acciones: list, id_cartera: str) -> dict:
    mapa = {a["NOMBRE_ACCION_CRITERIO"].strip().upper(): a for a in acciones}
    texto = texto.lower()

    despedidas_validas = [
        "gracias",
        "buenos días",
        "buenas tardes",
        "buenas noches",
        "hasta luego",
        "que tenga buen día",
        "hasta pronto",
        "nos vemos",
    ]

    despedidas_incompletas = ["bueno", "ok", "listo", "cuídese", "bye", "chau"]

    if any(p in texto for p in despedidas_validas):
        return mapa.get("SI CUMPLE")
    elif any(p in texto for p in despedidas_incompletas):
        return mapa.get("SE DESPIDE DE FORMA INCOMPLETA")

    return mapa.get("NO SE DESPIDE")
