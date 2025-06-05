import logging
from app.services.utils.texto import normalizar_texto

logger = logging.getLogger(__name__)

def seleccionar_accion_saludo(texto: str, acciones: list, id_cartera: str) -> dict:
    texto = normalizar_texto(texto)
    for accion in acciones:
        if "saludo" in texto or "buenos dias" in texto or "buenas tardes" in texto:
            if "SÍ CUMPLE" in accion["NOMBRE_ACCION_CRITERIO"].upper():
                return accion
    return _accion_no_cumple(acciones)

def seleccionar_accion_contacto(texto: str, acciones: list, id_cartera: str) -> dict:
    texto = normalizar_texto(texto)
    if "con el señor" in texto or "con la señora" in texto or "me comunico con" in texto:
        for accion in acciones:
            if "SÍ CUMPLE" in accion["NOMBRE_ACCION_CRITERIO"].upper():
                return accion
    return _accion_no_cumple(acciones)

def seleccionar_accion_identificacion(texto: str, acciones: list) -> dict:
    texto = normalizar_texto(texto)
    if "le saluda" in texto or "represento a" in texto or "de parte de" in texto:
        for accion in acciones:
            if "SÍ CUMPLE" in accion["NOMBRE_ACCION_CRITERIO"].upper():
                return accion
    return _accion_no_cumple(acciones)

# Función de fallback
def _accion_no_cumple(acciones: list) -> dict:
    for accion in acciones:
        if accion["NOMBRE_ACCION_CRITERIO"].strip().upper() in ["NO CUMPLE", "NO SE EVIDENCIA"]:
            return accion
    return acciones[0]  # fallback por si no hay coincidencia
