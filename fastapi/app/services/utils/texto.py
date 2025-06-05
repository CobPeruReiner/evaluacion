import re
import unicodedata

# Expresión regular para eliminar puntuación
_PATRON_PUNTUACION = re.compile(r"[^\w\s]", re.UNICODE)

def quitar_tildes(texto: str) -> str:
    """
    Quita tildes de un texto.
    """
    return ''.join(
        c for c in unicodedata.normalize('NFD', texto)
        if unicodedata.category(c) != 'Mn'
    )

def normalizar_texto(texto: str) -> str:
    """
    Convierte a minúsculas, elimina tildes, puntuación y espacios extra.
    """
    texto = texto.lower().strip()
    texto = quitar_tildes(texto)
    texto = _PATRON_PUNTUACION.sub('', texto)
    return texto
