import re


def detectar_monto(texto):
    patrones = [
        r"s/\s*\d+[.,]?\d*",
        r"\$\s*\d+[.,]?\d*",
        r"\d+\s*(soles|dolares)",
        r"\d+\s+con\s+\d+\s+(soles|centimos|dolares)?",
        r"monto\s+de\s+\d+",
        r"pago\s+de\s+\d+",
        r"importe de \d+",
        r"cuota de \d+\s*soles",
        r"cuota de \d+\s*dolares",
        r"monto",
    ]
    return any(re.search(p, texto) for p in patrones)


def detectar_antiguedad(texto):
    frases = [
        "hace tiempo",
        "desde hace",
        "ya tiene tiempo",
        "ya paso tiempo",
        "ya paso la pandemia",
        "la deuda es antigua",
        "es de hace tiempo",
        "ya pasaron anos",
        "varios meses",
        "ha pasado tiempo",
        "bastante tiempo",
        "desde hace varios meses",
        "desde hace bastante",
        "ya casi cuatro anos",
        "ano pasado",
        "paso su fecha",
        "hace meses",
        "mes pasado",
        "ya son",
        "completa los",
    ]
    return any(f in texto for f in frases)


def detectar_producto(texto):
    palabras = [
        "deuda",
        "tarjeta",
        "credito",
        "prestamo",
        "equipo",
        "celular",
        "movil",
        "con respecto a",
        "referente a",
        "en relacion a",
        "financiado",
        "modelo",
        "plan",
        "servicio",
        "cuota de",
        "dispositivo",
    ]
    return any(p in texto for p in palabras)


def detectar_fecha_pago(texto):
    texto = texto.lower()
    patrones = [
        r"venc(?:e|imiento|io)",
        r"fecha de pago" r"hasta el dia",
        r"hasta el",
        r"se paga el" r"cancelar el" r"para el \d{1,2}" r"dia de pago" r"viernes",
        r"semana que viene" r"que dia.*cancelar",
    ]
    return any(re.search(p, texto) for p in patrones)
