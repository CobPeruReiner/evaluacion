import logging

logger = logging.getLogger(__name__)


def seleccionar_accion_amabilidad(texto: str, acciones: list, id_cartera: str) -> dict:
    texto = texto.lower()
    mapa = {a["NOMBRE_ACCION_CRITERIO"].strip().upper(): a for a in acciones}

    palabras_positivas = [
        "muy bien",
        "ya listo",
        "estimado",
        "por favor",
        "caballero",
        "gracias por su tiempo",
        "un ratito por favor",
    ]

    palabras_negativas = [
        "eso no me importa",
        "ese no es mi problema",
        "usted no entiende",
        "deberia saberlo",
        "escucheme bien",
        "ya le dije",
        "le repito",
        "esta sordo",
        "se lo explique",
        "por favor entienda",
    ]

    sarcasmo = ["claro como usted diga", "ah si seguro", "que raro"]

    adjetivos = ["irresponsable", "desordenado", "retrasado", "mentiroso", "desubicado"]

    alteracion = ["calmese", "no me grite", "ya le dije", "no me interrumpa"]

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

    muletillas = ["este", "eh", "o sea", "mmm", "ya", "okey", "me entiendes"]

    tecnicismos = ["gestion", "protocolo", "aplicativo", "flujo", "formulario web"]

    tuteo = ["tu", "te dije", "tu tienes", "tu cuenta"]

    interrumpe = ["a ver", "escucheme", "dejeme hablar", "espere"]

    inseguridad = [
        "no se",
        "no estoy seguro",
        "creo que",
        "quizas",
        "de repente",
        "lo verificamos",
    ]

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

    omite = ["como le dije", "eso ya lo explique", "eso no importa", "ya le respondi"]
    repregunta = ["que dijo", "como", "me repite", "no entendi"]

    if any(p in texto for p in omite):
        return mapa.get("OMITE INFORMACIÓN IMPORTANTE")
    if any(p in texto for p in repregunta):
        return mapa.get("REPREGUNTA INFORMACION CLARA")

    return mapa.get("SÍ CUMPLE")
