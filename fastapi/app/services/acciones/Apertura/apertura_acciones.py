import logging
import re
from app.services.utils.analisis_catigo import es_cartera_castigo

logger = logging.getLogger(__name__)


def seleccionar_accion_saludo(texto: str, acciones: list, id_cartera: str) -> dict:
    castigo = es_cartera_castigo(id_cartera)
    mapa = {a["NOMBRE_ACCION_CRITERIO"].strip().upper(): a for a in acciones}

    saludos_regular = [
        "buenos dias",
        "buenas tardes",
        "buenas noches",
        "muy buenos dias",
        "muy buenas tardes",
        "muy buenas noches",
        "buenas",
        "buen dia",
    ]

    saludos_castigo = saludos_regular + ["alo", "hola", "qué tal"]

    saludos = saludos_castigo if castigo else saludos_regular

    encontrado = any(p in texto for p in saludos)

    logger.info(f"[SALUDO] castigo={castigo}, saludo_valido={encontrado}")

    if any(p in texto for p in saludos):
        return mapa["SÍ CUMPLE"]

    if not castigo and any(p in texto for p in ["hola", "qué tal"]):
        return mapa["SALUDA DE MANERA INCORRECTA"]

    return mapa["NO SALUDA AL CLIENTE"]


def seleccionar_accion_contacto(texto: str, acciones: list, id_cartera: str) -> dict:
    castigo = es_cartera_castigo(id_cartera)
    mapa = {a["NOMBRE_ACCION_CRITERIO"].strip().upper(): a for a in acciones}

    frases_regular = [
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

    frases_castigo = frases_regular + ["con"]

    frases = frases_castigo if castigo else frases_regular

    palabras_invalidas = {"el", "la", "senor", "senora", "sr", "sra"}
    palabras_dudosas = {"alguien", "ayer", "poco", "hace", "recién", "nadie", "tarde"}

    for f in frases:
        if f == "con" and not castigo:
            continue

        if not re.search(rf"\b{re.escape(f)}\b", texto):
            continue

        m = re.search(rf"\b{re.escape(f)}\b\s+([\w\s]+)", texto)
        if not m:
            continue

        after = m.group(1).strip()
        palabras = after.split()

        logger.info(f"[CONTACTO] frase_detectada='{f}', palabras_posteriores='{after}'")

        if f == "se encuentra":
            first = palabras[0] if palabras else ""
            if len(first) >= 3:
                return mapa["SÍ CUMPLE"]
            else:
                continue

        nombre_potencial = [
            p
            for p in palabras
            if p not in palabras_invalidas and p not in palabras_dudosas and len(p) >= 3
        ]

        logger.info(f"[CONTACTO] nombre_potencial={nombre_potencial}")

        if f == "con" and castigo:
            if len(nombre_potencial) >= 1:
                return mapa["SÍ CUMPLE"]
            continue

        if len(nombre_potencial) >= 2:
            return mapa["SÍ CUMPLE"]
        if len(nombre_potencial) == 1:
            return mapa["PREGUNTA POR EL CLIENTE DE FORMA INCOMPLETA"]

    return mapa["NO CONFIRMA AL TITULAR/ENCARGADO"]


def seleccionar_accion_identificacion(texto: str, acciones: list) -> dict:
    mapa = {a["NOMBRE_ACCION_CRITERIO"].strip().upper(): a for a in acciones}

    tiene_presentacion = any(
        p in texto
        for p in [
            "le saluda",
            "soy",
            "habla",
            "que llamo",
            "les saluda",
            "mi nombre es",
            "le saludo",
            "les saludo",
            "de parte de",
            "te saluda",
            "le acaba de saludar",
            "le acabo de saludar",
            "le hace presente que nos hemos comunicado",
        ]
    )

    tiene_empresa = any(
        p in texto
        for p in ["de cobranzas", "represento a", "por encargo de", "de parte de"]
    )

    logger.info(
        f"[IDENTIFICACIÓN] presentacion={tiene_presentacion}, empresa={tiene_empresa}"
    )

    if tiene_presentacion and tiene_empresa:
        return mapa["SÍ CUMPLE"]
    elif tiene_presentacion:
        return mapa["SE IDENTIFICA DE MANERA INCOMPLETA"]
    elif "cobranzas" in texto or "por encargo de" in texto:
        return mapa["SE IDENTIFICA DE MANERA INCORRECTA"]

    return mapa["NO SE IDENTIFICA"]
