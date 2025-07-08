import re
import unicodedata
import logging
from collections import defaultdict

logger = logging.getLogger(__name__)

# Palabras clave
_SALUDOS = ["buenos dias", "buen dia", "buenas tardes", "buenas noches", "hola", "alo", "buenas", "algo"]

_LENGUAJE_ASESOR = [
    "me comunico", "nos comunicamos", "me estoy comunicando", "tarjeta", "deuda",
    "infocor", "financiera", "banco", "pago", "cmr", "credito", "cobranza",
    "le saluda", "del banco", "de la financiera", "de parte de", "represento a",
    "recordarle", "señor", "señora", "caballero", "con el señor", "con la señora"
]

_PATRON_PUNTUACION = re.compile(r"[^\w\s]")

# ---------------------
# Funciones auxiliares
# ---------------------

def normalizar_texto(texto: str) -> str:
    texto = texto.lower().strip()
    texto = ''.join(c for c in unicodedata.normalize('NFD', texto)
                    if unicodedata.category(c) != 'Mn')
    return _PATRON_PUNTUACION.sub('', texto)

def comienza_con_saludo(texto: str) -> bool:
    texto = normalizar_texto(texto)
    return any(texto.startswith(saludo) for saludo in _SALUDOS)

def contiene_lenguaje_asesor(texto: str) -> bool:
    texto = normalizar_texto(texto)
    return any(p in texto for p in _LENGUAJE_ASESOR)

# ---------------------
# Función principal
# ---------------------

def etiquetar_roles_v2(transcripcion: list) -> list:
    """
    Clasifica a los hablantes como 'asesor' (000) o 'cliente' (001) según su lenguaje.
    """
    frases_por_speaker = defaultdict(list)
    puntaje_asesor = {}
    posibles_clientes_por_saludo = set()

    for seg in transcripcion:
        spk = seg.get("speaker", "DESCONOCIDO")
        frases_por_speaker[spk].append(seg)

    for spk, frases in frases_por_speaker.items():
        if frases:
            primer_texto = frases[0]["text"]
            if comienza_con_saludo(primer_texto) and not contiene_lenguaje_asesor(primer_texto):
                posibles_clientes_por_saludo.add(spk)

        puntaje_asesor[spk] = sum(contiene_lenguaje_asesor(f["text"]) for f in frases)

    orden = sorted(puntaje_asesor.items(), key=lambda x: x[1], reverse=True)
    roles_asignados = {}

    if orden:
        top_spk = orden[0][0]
        if puntaje_asesor[top_spk] == 0 and len(orden) > 1:
            roles_asignados[orden[1][0]] = "000"  # Asesor
            roles_asignados[orden[0][0]] = "001"  # Cliente
        else:
            roles_asignados[top_spk] = "000"      # Asesor
            if len(orden) > 1:
                roles_asignados[orden[1][0]] = "001"  # Cliente

    logger.info("🎭 Roles asignados: %s", roles_asignados)

    for seg in transcripcion:
        spk = seg.get("speaker", "DESCONOCIDO")
        seg["speaker"] = roles_asignados.get(spk, "IGNORADO")

    return transcripcion
