from logging import getLogger
from app.core.registry import EVALUATORS
from app.core.scoring import aprobado_observado
from app.data.dao import (
    obtener_criterios_por_item,
    obtener_acciones_por_criterio,
    obtener_tipo_cartera,
)

from app.db.session import SyS_Sistemagest

logger = getLogger(__name__)


def _accion_default_negativa(acciones: list) -> dict:
    if not acciones:
        return {"NOMBRE_ACCION_CRITERIO": "NO DETECTADO", "PESO_ACCION_CRITERIO": 0.0}
    return acciones[0]


def _invocar_evaluador(fn, texto_norm, acciones, id_cartera, tipificaciones):
    argc = fn.__code__.co_argcount
    if argc == 2:
        return fn(texto_norm, acciones)
    elif argc == 3:
        return fn(texto_norm, acciones, id_cartera)
    else:
        return fn(texto_norm, acciones, id_cartera, tipificaciones)


def evaluar_item(
    texto_norm: str, id_item: int, id_cartera: str, tipificaciones=None, conn=None
) -> dict:
    criterios = obtener_criterios_por_item(conn, id_item)
    resultados, peso_total, peso_obtenido = {}, 0.0, 0.0

    for c in criterios:
        key = (c.get("EVALUADOR_KEY") or "").strip()
        acciones = obtener_acciones_por_criterio(conn, c["ID_CRITERIO"])

        if not key or key not in EVALUATORS:
            logger.warning(
                f"[EVALUADOR] Key no registrada o vacía: '{key}' en criterio {c.get('ID_CRITERIO')}"
            )
            accion = _accion_default_negativa(acciones)
        else:
            try:
                fn = EVALUATORS[key]
                accion = _invocar_evaluador(
                    fn, texto_norm, acciones, id_cartera, tipificaciones
                )
            except Exception as e:
                logger.exception(f"[EVALUADOR] Error invocando '{key}': {e}")
                accion = _accion_default_negativa(acciones)

        pa = float(accion.get("PESO_ACCION_CRITERIO", 0.0) if accion else 0.0)
        pc = float(c.get("PESO_CRITERIO", 0.0))
        peso_total += pc
        peso_obtenido += pa

        resultados[c["NOMBRE_CRITERIO"]] = {
            "NOMBRE_ACCION_CRITERIO": (
                accion.get("NOMBRE_ACCION_CRITERIO", "NO DETECTADO")
                if accion
                else "NO DETECTADO"
            ),
            "PESO_ACCION_CRITERIO": pa,
            "PESO_CRITERIO": pc,
        }

    pct = (peso_obtenido / peso_total) * 100 if peso_total else 0.0

    cartera = SyS_Sistemagest()
    tipo = obtener_tipo_cartera(cartera, id_cartera)
    resultado = aprobado_observado(pct, tipo)

    return {
        "resultado": resultado,
        "cumplimiento": round(pct, 2),
        "criterios": resultados,
        "cartera_tipo": tipo,
    }
