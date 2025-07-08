import logging
import re

logger = logging.getLogger(__name__)


def seleccionar_accion_perseverancia(
    texto: str, acciones: list, id_cartera: str
) -> dict:
    mapa = {a["NOMBRE_ACCION_CRITERIO"].strip().upper(): a for a in acciones}
    texto = texto.lower()

    objeciones_rebatidas = sum(
        [
            bool(re.search(p, texto))
            for p in [
                r"entiendo.*pero",
                r"comprendo.*sin embargo",
                r"comprendo.*igual es necesario",
                r"entiendo.*igual debemos",
                r"sé que.*pero",
                r"debe regularizar",
                r"se recomienda el pago",
            ]
        ]
    )

    uso_negativo = any(
        p in texto
        for p in [
            "no se puede",
            "no tengo solución",
            "no es posible",
            "no puedo ayudarle",
        ]
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
        r"puede pagar hoy",
        r"puede acercarse hoy",
        r"podría cancelar hoy",
        r"cancelar el día de hoy",
        r"comprométase a pagar",
        r"cuándo podría acercarse",
        r"le esperamos hoy",
        r"cancelar mañana",
        r"se puede comprometer a",
    ]

    urgencia_correcta = any(re.search(p, texto) for p in frases_compromiso)
    frases_negativas = [
        "usted vera",
        "cuando pueda",
        "si desea",
        "cuando tenga",
        "depende de usted",
    ]

    usa_negativo = any(p in texto for p in frases_negativas)

    if urgencia_correcta and not usa_negativo:
        return mapa.get("SÍ CUMPLE")
    if urgencia_correcta and usa_negativo:
        return mapa.get("NO IMPONE URGENCIA DE PAGO DE MANERA CORRECTA")
    if not urgencia_correcta and usa_negativo:
        return mapa.get("NO IMPONE SENTIDO DE URGENCIA / CLIENTE TOMA DECISIÓN")
    if usa_negativo:
        return mapa.get("UTILIZA ARGUMENTOS NEGATIVOS")

    return _accion_no_cumple(acciones)


# Función auxiliar para devolver acción por defecto negativa
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
