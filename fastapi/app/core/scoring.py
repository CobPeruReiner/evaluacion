"""Puntaje determinístico de una evaluación.

El agente IA solo ELIGE la acción de cada criterio; la nota se calcula aquí con los
pesos de la plantilla (el modelo nunca "inventa" un número):

  ítem:   cumplimiento = Σ peso(acción elegida) / Σ peso(criterio) × 100
  global: promedio de los ítems ponderado por el peso de cada ítem
  aprobación por tipo de cartera: castigo 75 %, vigente 85 %
"""


def estado_porcentaje(pct: float) -> str:
    if pct >= 75:
        return "Excelente"
    if pct >= 70:
        return "Bueno"
    if pct >= 60:
        return "Deficiente/Trabajable"
    return "Deficiente"


def umbral_aprobacion_por_tipo(tipo: str) -> float:
    return 75.0 if (tipo or "").lower() == "castigo" else 85.0


def aprobado_observado(pct: float, tipo: str) -> str:
    return "Aprobado" if pct >= umbral_aprobacion_por_tipo(tipo) else "Observado"


def calificar(modelo: dict, elecciones: dict, tipo_cartera: str) -> dict:
    """`elecciones` = {id_criterio: {"id_accion" | None, "evidencia", "segmento", "justificacion"}}.

    - id_accion de una acción del criterio → suma su peso.
    - id_accion None (el agente indicó que el asesor no realizó ninguna acción) → 0 puntos.
    - criterio ausente en la respuesta → 0 puntos y queda marcado para revisión humana.
    """
    items, ponderado, peso_items, revisar_global = [], 0.0, 0.0, False
    for item in modelo["items"]:
        criterios, obtenido, posible = [], 0.0, 0.0
        for cr in item["criterios"]:
            acciones = {a["id_accion"]: a for a in cr["acciones"]}
            el = elecciones.get(cr["id_criterio"])
            revisar = el is None
            accion = acciones.get(el.get("id_accion")) if el else None
            revisar_global = revisar_global or revisar
            puntos = accion["peso"] if accion else 0.0
            obtenido += puntos
            posible += cr["peso"]
            criterios.append({
                "id_criterio": cr["id_criterio"],
                "criterio": cr["nombre"],
                "peso_criterio": cr["peso"],
                "id_accion": accion["id_accion"] if accion else None,
                "accion": accion["nombre"] if accion else "NO REALIZA",
                "peso_accion": puntos,
                "cumple_maximo": cr["peso"] > 0 and puntos >= cr["peso"] - 1e-9,
                "evidencia": (el or {}).get("evidencia", ""),
                "segmento": (el or {}).get("segmento"),
                "justificacion": (el or {}).get("justificacion", "") if el else
                                 "El agente no evaluó este criterio; requiere revisión.",
                "revisar": revisar,
            })
        pct = round(obtenido / posible * 100, 2) if posible else 0.0
        items.append({
            "id_item": item["id_item"],
            "item": item["nombre"],
            "peso_item": item["peso"],
            "cumplimiento": pct,
            "resultado": aprobado_observado(pct, tipo_cartera),
            "criterios": criterios,
        })
        ponderado += pct * item["peso"]
        peso_items += item["peso"]

    total = round(ponderado / peso_items, 2) if peso_items else 0.0
    return {
        "items": items,
        "resumen_final": {
            "id_modelo": modelo["id_modelo"],
            "modelo": modelo["nombre_modelo"],
            "tipo_cartera": tipo_cartera,
            "umbral_aprobacion": umbral_aprobacion_por_tipo(tipo_cartera),
            "cumplimiento_total": total,
            "estado_global": estado_porcentaje(total),
            "resultado": aprobado_observado(total, tipo_cartera),
            "requiere_revision": revisar_global,
        },
    }
