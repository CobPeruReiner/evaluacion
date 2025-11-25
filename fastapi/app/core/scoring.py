def estado_porcentaje(pct: float) -> str:
    if pct >= 75:
        return "Excelente"
    if pct >= 70:
        return "Bueno"
    if pct >= 60:
        return "Deficiente/Trabajable"
    return "Deficiente"


def umbral_aprobacion_por_tipo(tipo: str) -> float:
    """
    Nota mínima por tipo de cartera:
    - castigo: 75
    - vigente: 85
    """
    return 75.0 if (tipo or "").lower() == "castigo" else 85.0


def aprobado_observado(pct: float, tipo: str) -> str:
    return "Aprobado" if pct >= umbral_aprobacion_por_tipo(tipo) else "Observado"
