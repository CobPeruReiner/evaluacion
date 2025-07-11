import logging
import re

logger = logging.getLogger(__name__)


def seleccionar_accion_reafirmar(texto: str, acciones: list, id_cartera: str) -> dict:
    mapa = {a["NOMBRE_ACCION_CRITERIO"].strip().upper(): a for a in acciones}
    texto = texto.lower()

    frases_confirmacion = [
        "entonces paga",
        "queda para",
        "se compromete",
        "acuerda pagar",
        "cancelara",
        "va a pagar",
        "nos vemos el",
        "lo esperamos el",
        "queda en cancelar",
        "va a cancelar",
        "queda en pagar",
    ]

    frases_incompletas = [
        "paga el",
        "pago el",
        "me dijo que paga",
        "va a acercarse",
        "va a ir",
        "una semanita más",
        "de la semana que viene",
        "el viernes",
    ]

    frases_incorrectas = [
        "usted vera",
        "cuando pueda",
        "usted decide",
        "lo pensara",
        "depende de usted",
        "veremos",
        "usted verá si paga",
        "según cómo vaya",
    ]

    cumple = any(f in texto for f in frases_confirmacion)
    incompleto = any(f in texto for f in frases_incompletas)
    incorrecto = any(f in texto for f in frases_incorrectas)

    logger.info(
        f"[REAFIRMAR] cumple={cumple}, incompleto={incompleto}, incorrecto={incorrecto}"
    )

    if any(f in texto for f in frases_confirmacion):
        return mapa.get("SI CUMPLE")
    elif any(f in texto for f in frases_incompletas):
        return mapa.get("RECONFIRMA DE FORMA INCOMPLETA")
    elif any(f in texto for f in frases_incorrectas):
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
        "muchas gracias",
        "le vamos a enviar un mensaje",
        "recibirá su carta",
        "hasta el día",
    ]

    despedidas_incompletas = [
        "bueno",
        "ok",
        "listo",
        "cuídese",
        "bye",
        "chau",
        "bueno ya",
        "ya está bien",
        "entonces quedamos así",
    ]

    cumple = any(p in texto for p in despedidas_validas)
    incompleta = any(p in texto for p in despedidas_incompletas)

    logger.info(f"[DESPEDIDA] cumple={cumple}, incompleta={incompleta}")

    if any(p in texto for p in despedidas_validas):
        return mapa.get("SI CUMPLE")
    elif any(p in texto for p in despedidas_incompletas):
        return mapa.get("SE DESPIDE DE FORMA INCOMPLETA")

    return mapa.get("NO SE DESPIDE")
