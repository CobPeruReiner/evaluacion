import logging
import re

logger = logging.getLogger(__name__)


def seleccionar_accion_perseverancia(
    texto: str, acciones: list, id_cartera: str
) -> dict:
    mapa = {a["NOMBRE_ACCION_CRITERIO"].strip().upper(): a for a in acciones}
    texto = texto.lower()

    frases_rebate = [
        "entiendo pero",
        "comprendo sin embargo",
        "comprendo igual es necesario",
        "entiendo igual debemos",
        "se que pero",
        "debe regularizar",
        "se recomienda el pago",
    ]

    objeciones_rebatidas = sum(1 for frase in frases_rebate if frase in texto)

    uso_negativo = any(
        p in texto
        for p in [
            "no se puede",
            "no tengo solucion",
            "no es posible",
            "no puedo ayudarle",
        ]
    )

    logger.info(
        f"[PERSEVERANCIA] objeciones_rebatidas={objeciones_rebatidas}, argumentos_negativos={uso_negativo}"
    )

    if objeciones_rebatidas >= 3 and not uso_negativo:
        return mapa.get("SÍ CUMPLE")
    if uso_negativo:
        return mapa.get("UTILIZA ARGUMENTOS NEGATIVOS")
    if 1 <= objeciones_rebatidas < 3:
        return mapa.get("NO REBATE LAS VECES ESTABLECIDAS")
    if objeciones_rebatidas == 0:
        return mapa.get("NO REBATE OBJECIONES")

    return _accion_no_cumple(acciones)


def seleccionar_accion_compromiso(texto: str, acciones: list, id_cartera: str) -> dict:
    mapa = {a["NOMBRE_ACCION_CRITERIO"].strip().upper(): a for a in acciones}
    texto = texto.lower()

    frases_compromiso = [
        "puede pagar hoy",
        "puede acercarse hoy",
        "podria cancelar hoy",
        "cancelar el dia de hoy",
        "comprometase a pagar",
        "cuando podria acercarse",
        "le esperamos hoy",
        "cancelar manana",
        "se puede comprometer a",
    ]

    urgencia_correcta = any(f in texto for f in frases_compromiso)

    frases_negativas = [
        "usted vera",
        "cuando pueda",
        "si desea",
        "cuando tenga",
        "depende de usted",
    ]

    usa_negativo = any(p in texto for p in frases_negativas)

    logger.info(
        f"[COMPROMISO] urgencia_correcta={urgencia_correcta}, argumentos_negativos={usa_negativo}"
    )

    if urgencia_correcta and not usa_negativo:
        return mapa.get("SÍ CUMPLE")
    if urgencia_correcta and usa_negativo:
        return mapa.get("NO IMPONE URGENCIA DE PAGO DE MANERA CORRECTA")
    if not urgencia_correcta and usa_negativo:
        return mapa.get("NO IMPONE SENTIDO DE URGENCIA / CLIENTE TOMA DECISIÓN")
    if usa_negativo:
        return mapa.get("UTILIZA ARGUMENTOS NEGATIVOS")

    return _accion_no_cumple(acciones)


def _accion_no_cumple(acciones: list) -> dict:
    for a in acciones:
        nombre = a["NOMBRE_ACCION_CRITERIO"].strip().upper()
        if nombre in [
            "NO CUMPLE",
            "NO SE EVIDENCIA",
            "NO REBATE OBJECIONES",
            "NO IMPONE SENTIDO DE URGENCIA / CLIENTE TOMA DECISIÓN",
        ]:
            return a
    return acciones[0]
