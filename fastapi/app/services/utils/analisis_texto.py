import re

def detectar_monto(texto):
    patrones = [
        r"s/\s*\d+[.,]?\d*",
        r"\d+\s*soles",
        r"\d+\s+soles\s+con\s+\d+\s+centimos",
        r"importe de \d+",
    ]
    return any(re.search(p, texto) for p in patrones)


def detectar_antiguedad(texto):
    frases = [
        "hace tiempo", "desde hace", "ya tiene tiempo", "ya paso tiempo",
        "ya paso la pandemia", "la deuda es antigua", "es de hace tiempo",
        "ya pasaron anos", "varios meses", "ha pasado tiempo", "bastante tiempo",
        "desde hace varios meses", "desde hace bastante", "ya casi cuatro anos"
    ]
    return any(f in texto for f in frases)


def detectar_producto(texto):
    palabras = [
        "deuda", "tarjeta", "credito", "prestamo", "equipo", "celular", "movil",
        "con respecto a", "referente a", "en relacion a"
    ]
    return any(p in texto for p in palabras)


def detectar_fecha_pago(texto):
    return bool(re.search(r"venc(i[oó])|fecha de pago|vence", texto))