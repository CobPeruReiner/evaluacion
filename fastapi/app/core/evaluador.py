from logging import getLogger
from app.core.registry import EVALUATORS, obtener_clave_evaluador
from app.core.scoring import aprobado_observado
from app.data.dao import (
    obtener_criterios_por_item,
    obtener_acciones_por_criterio,
    obtener_tipo_cartera,
)

logger = getLogger(__name__)


class CriterioSinEvaluadorError(ValueError):
    pass


def _accion_default_negativa(acciones: list) -> dict:
    if not acciones:
        return {"NOMBRE": "NO DETECTADO", "PESO": 0.0}
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
    texto_norm: str, id_item: int, id_cartera: str, tipificaciones=None, conn=None,
    cartera_tipo: str | None = None, criterios_preloaded: list | None = None,
    acciones_preloaded: dict | None = None,
) -> dict:
    criterios = criterios_preloaded if criterios_preloaded is not None else obtener_criterios_por_item(conn, id_item)
    resultados, peso_total, peso_obtenido = {}, 0.0, 0.0

    for c in criterios:
        key = obtener_clave_evaluador(c["NOMBRE"])
        acciones = acciones_preloaded.get(c["ID_CRITERIO"], []) if acciones_preloaded is not None else obtener_acciones_por_criterio(conn, c["ID_CRITERIO"])

        if not key or key not in EVALUATORS:
            raise CriterioSinEvaluadorError(
                "El criterio activo no tiene una regla de calificación registrada: "
                f"{c['NOMBRE']} (ID {c['ID_CRITERIO']})."
            )
        try:
            fn = EVALUATORS[key]
            accion = _invocar_evaluador(fn, texto_norm, acciones, id_cartera, tipificaciones)
        except Exception as error:
            raise RuntimeError(f"No se pudo calificar el criterio '{c['NOMBRE']}'.") from error
        if not accion:
            accion = _accion_default_negativa(acciones)

        pa = float(accion.get("PESO", 0.0) if accion else 0.0)
        pc = float(c.get("PESO", 0.0))
        peso_total += pc
        peso_obtenido += pa

        resultados[c["NOMBRE"]] = {
            "NOMBRE": (
                accion.get("NOMBRE", "NO DETECTADO")
                if accion
                else "NO DETECTADO"
            ),
            "PESO_ACCION": pa,
            "PESO_CRITERIO": pc,
        }

    pct = (peso_obtenido / peso_total) * 100 if peso_total else 0.0

    if cartera_tipo is None:
        raise ValueError("El tipo de cartera debe resolverse antes de calificar los ítems.")
    tipo = cartera_tipo
    resultado = aprobado_observado(pct, tipo)

    return {
        "resultado": resultado,
        "cumplimiento": round(pct, 2),
        "criterios": resultados,
        "cartera_tipo": tipo,
    }
