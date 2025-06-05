import logging
from app.services.utils.texto import normalizar_texto

logger = logging.getLogger(__name__)

def seleccionar_accion_info_producto(texto: str, acciones: list, id_cartera: str, tipificaciones: dict = None) -> dict:
    texto = normalizar_texto(texto)
    if "tarjeta" in texto or "producto" in texto or "credito" in texto:
        for accion in acciones:
            if "SÍ CUMPLE" in accion["NOMBRE_ACCION_CRITERIO"].upper():
                return accion
    return _accion_no_cumple(acciones)

def seleccionar_accion_indagar_pago(texto: str, acciones: list, id_cartera: str, tipificaciones: dict = None) -> dict:
    texto = normalizar_texto(texto)
    if "por qué no ha pagado" in texto or "motivo de no pago" in texto or "problema de pago" in texto:
        for accion in acciones:
            if "SÍ CUMPLE" in accion["NOMBRE_ACCION_CRITERIO"].upper():
                return accion
    return _accion_no_cumple(acciones)

def seleccionar_accion_asesorar(texto: str, acciones: list, id_cartera: str) -> dict:
    texto = normalizar_texto(texto)
    if "puede pagar en cuotas" in texto or "ofrezco una alternativa" in texto or "opción de pago" in texto:
        for accion in acciones:
            if "SÍ CUMPLE" in accion["NOMBRE_ACCION_CRITERIO"].upper():
                return accion
    return _accion_no_cumple(acciones)

# Función auxiliar para fallback
def _accion_no_cumple(acciones: list) -> dict:
    for accion in acciones:
        if accion["NOMBRE_ACCION_CRITERIO"].strip().upper() in ["NO CUMPLE", "NO SE EVIDENCIA"]:
            return accion
    return acciones[0]  # fallback por si nada coincide
