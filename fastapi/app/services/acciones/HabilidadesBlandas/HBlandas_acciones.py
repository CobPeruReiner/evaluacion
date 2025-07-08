import logging

logger = logging.getLogger(__name__)


def seleccionar_accion_amabilidad(texto: str, acciones: list, id_cartera: str) -> dict:
    texto = texto.lower()
    mapa = {a["NOMBRE_ACCION_CRITERIO"].strip().upper(): a for a in acciones}

    palabras_negativas = [
        "eso no me importa",
        "ese no es mi problema",
        "usted no entiende",
        "debería saberlo",
        "escúcheme bien",
        "ya le dije",
        "le repito",
        "¿está sordo?",
        "se lo expliqué",
        "por favor entienda",
    ]

    sarcasmo = ["claro, como usted diga", "ah sí, seguro", "¡qué raro!"]

    adjetivos = ["irresponsable", "desordenado", "retrasado", "mentiroso", "desubicado"]

    alteracion = ["cálmese", "no me grite", "ya le dije", "no me interrumpa"]

    if any(p in texto for p in sarcasmo):
        return mapa.get("RESPONDE CON SARCASMO")
    if any(p in texto for p in adjetivos):
        return mapa.get("CALIFICA UTILIZANDO ADJETIVOS")
    if any(p in texto for p in alteracion):
        return mapa.get("SE ALTERA Y/O CAMBIA EL TRATO")
    if any(p in texto for p in palabras_negativas):
        return mapa.get("NO ES EMPATICO")

    return mapa.get("SI CUMPLE")


def seleccionar_accion_comunicacion(
    texto: str, acciones: list, id_cartera: str
) -> dict:
    texto = texto.lower()
    mapa = {a["NOMBRE_ACCION_CRITERIO"].strip().upper(): a for a in acciones}

    muletillas = ["este", "eh", "o sea", "mmm", "ya", "okey", "¿me entiendes?"]
    tecnicismos = ["gestión", "protocolo", "aplicativo", "flujo", "formulario web"]
    tuteo = ["tu", "te dije", "tú tienes", "tu cuenta"]

    interrumpe = ["a ver", "escúcheme", "déjeme hablar", "espere"]

    inseguridad = ["no sé", "no estoy seguro", "creo que", "quizás", "de repente"]

    if any(p in texto for p in tuteo):
        return mapa.get("TUTEA AL CLIENTE")
    if any(p in texto for p in interrumpe):
        return mapa.get("HABLA AL MISMO TIEMPO O INTERRUMPE AL CLIENTE")
    if any(p in texto for p in inseguridad):
        return mapa.get(
            "MUESTRA INSEGURIDAD Y/O PROBLEMAS CON TONO DE VOZ, VOCALIZACION"
        )
    if any(p in texto for p in muletillas + tecnicismos):
        return mapa.get("USO DE MULETILLA, COLOQUIALISMO Y/O TECNICISMOS")

    return mapa.get("SI CUMPLE")


def seleccionar_accion_escucha(texto: str, acciones: list, id_cartera: str) -> dict:
    texto = texto.lower()
    mapa = {a["NOMBRE_ACCION_CRITERIO"].strip().upper(): a for a in acciones}

    omite = ["como le dije", "eso ya lo expliqué", "eso no importa", "ya le respondí"]
    repregunta = ["¿qué dijo?", "¿cómo?", "¿me repite?", "no entendí"]

    if any(p in texto for p in omite):
        return mapa.get("OMITE INFORMACIÓN IMPORTANTE")
    if any(p in texto for p in repregunta):
        return mapa.get("REPREGUNTA INFORMACION CLARA")

    return mapa.get("SÍ CUMPLE")
