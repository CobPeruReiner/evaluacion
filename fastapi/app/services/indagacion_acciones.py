import logging
from app.services.utils.analisis_catigo import es_cartera_castigo
from app.services.utils.analisis_texto import detectar_fecha_pago,detectar_antiguedad,detectar_monto,detectar_producto
import re

logger = logging.getLogger(__name__)

def seleccionar_accion_info_producto(texto: str, acciones: list, id_cartera: str, tipificaciones: dict = None) -> dict:
    castigo = es_cartera_castigo(id_cartera)
    mapa = {a["NOMBRE_ACCION_CRITERIO"].strip().upper(): a for a in acciones}

    monto_encontrado = detectar_monto(texto)
    dias_encontrado = detectar_antiguedad(texto)
    producto_encontrado = detectar_producto(texto)
    fecha_encontrada = detectar_fecha_pago(texto)

    if tipificaciones and tipificaciones.get("seguimiento"):
        return mapa.get("NO APLICA")

    if castigo:
        if monto_encontrado and dias_encontrado:
            return mapa.get("SÍ CUMPLE")
        if monto_encontrado or dias_encontrado:
            return mapa.get("BRINDA INFORMACIÓN INCOMPLETA")
        if fecha_encontrada:
            return mapa.get("BRINDA INFORMACIÓN INCORRECTA")
        return mapa.get("NO BRINDA INFORMACIÓN DE LA SITUACIÓN")

    if producto_encontrado:
        if monto_encontrado and dias_encontrado:
            return mapa.get("SÍ CUMPLE")
        if monto_encontrado or dias_encontrado:
            return mapa.get("BRINDA INFORMACIÓN INCOMPLETA")
        if fecha_encontrada:
            return mapa.get("BRINDA INFORMACIÓN INCORRECTA")

    return mapa.get("NO BRINDA INFORMACIÓN DE LA SITUACIÓN")

def seleccionar_accion_indagar_pago(texto: str, acciones: list, id_cartera: str, tipificaciones: dict = None) -> dict:
    castigo = es_cartera_castigo(id_cartera)
    mapa = {a["NOMBRE_ACCION_CRITERIO"].strip().upper(): a for a in acciones}

    motivo_pats = [
        r"que\s+le\s+impide\s+pagar",
        r"a\s+que\s+se\s+debe\s+(el\s+)?(incumplimiento|atraso)",
        r"por\s+que\s+no\s+(ha\s+)?pagado",
        r"cual\s+es\s+el\s+motivo",
        r"cual\s+es\s+el\s+inconveniente",
        r"por\s+que\s+no\s+deposit[oó]",
        r"por\s+que\s+no\s+hizo\s+el\s+pago",
        r"motivo\s+del\s+atraso"
    ]

    sustento_pats = [
        r"cuenta\s+con\s+el\s+dinero",
        r"tiene\s+el\s+dinero",
        r"posibilidad\s+de\s+pago",
        r"puede\s+pagar\s+ahora",
        r"podria\s+hacer\s+un\s+abono",
        r"con\s+cuanto\s+podria\s+cancelar",
    ]

    if tipificaciones and tipificaciones.get("motivo"):
        return mapa.get("NO APLICA")

    enc_motivo = any(re.search(p, texto) for p in motivo_pats)
    enc_sustento = any(re.search(p, texto) for p in sustento_pats)

    if enc_motivo and enc_sustento:
        return mapa.get("SÍ CUMPLE")
    if enc_motivo and not enc_sustento:
        return mapa.get("NO SONDEA PROCEDENCIA DEL DINERO")
    if not enc_motivo and enc_sustento:
        return mapa.get("NO SONDEA EL MOTIVO DE ATRASO")
    if castigo and not enc_motivo:
        return mapa.get("NO SONDEA EL MOTIVO DE ATRASO")

    return mapa.get("NO SONDEA CORRECTAMENTE")

def seleccionar_accion_asesorar(texto: str, acciones: list, id_cartera: str) -> dict:
    mapa = {a["NOMBRE_ACCION_CRITERIO"].strip().upper(): a for a in acciones}

    escalonadas = sum(1 for p in [
        "primero", "luego", "despues", "finalmente", "otra opcion", "otra alternativa",
        "podemos empezar con", "podriamos comenzar por", "cancelacion en cuotas", "cancelacion total"
    ] if p in texto) >= 2

    beneficio = any(p in texto for p in [
        "beneficio", "ventaja", "conveniencia", "descuento", "perjuicio", "problema futuro",
        "mayores intereses", "liquidar la deuda", "cancelar la deuda", "eliminar la deuda",
        "quita la deuda", "carta de nueva deuda", "regularizar"
    ])

    canal_pago = any(p in texto for p in [
        "puede pagar en", "oficinas", "agente", "banco", "caja", "horario", "codigo",
        "canal", "pago presencial", "numero de operacion", "aplicativo"
    ])

    if escalonadas and beneficio and canal_pago:
        return mapa.get("SÍ CUMPLE")
    if escalonadas and not (beneficio and canal_pago):
        return mapa.get("NO NEGOCIA ESCALONADAMENTE")
    if not escalonadas and not beneficio and not canal_pago:
        return mapa.get("NO OFRECE ALTERNATIVAS DE SOLUCIÓN")
    if beneficio != canal_pago:
        return mapa.get("NO INFORMA BENEFICIOS Y/O PERJUICIOS")

    return mapa.get("BRINDA ALTERNATIVAS INCORRECTAS")

# Función auxiliar para fallback
def _accion_no_cumple(acciones: list) -> dict:
    for accion in acciones:
        if accion["NOMBRE_ACCION_CRITERIO"].strip().upper() in ["NO CUMPLE", "NO SE EVIDENCIA"]:
            return accion
    return acciones[0]  # fallback por si nada coincide
