"""Detección de palabras clave en la transcripción.

Los términos los administra el server Node (archivo JSON en el volumen compartido,
sin tablas nuevas) y llegan con cada lote en el campo `palabras_clave`.

Cada término admite comodín final: "yape*" cubre yape, yapeo, yapeé, yapear… La
comparación ignora mayúsculas, tildes y puntuación y respeta límites de palabra
("plin" no coincide dentro de "disciplina").
"""

import re
import unicodedata


def normalizar(texto: str) -> str:
    texto = unicodedata.normalize("NFD", (texto or "").lower())
    texto = "".join(c for c in texto if unicodedata.category(c) != "Mn")
    texto = re.sub(r"[^\w\s*]", " ", texto)
    return re.sub(r"\s+", " ", texto).strip()


def _patron(termino: str):
    t = normalizar(termino)
    comodin = t.endswith("*")
    t = t.rstrip("*").strip()
    if not t:
        return None
    cuerpo = r"\s+".join(re.escape(p) for p in t.split())
    sufijo = r"\w*" if comodin else ""
    return re.compile(r"\b" + cuerpo + sufijo + r"\b")


def detectar(transcripcion: list, terminos: list) -> list:
    """Coincidencias por segmento: [{categoria, termino, coincidencia, segmento, speaker, start}].

    `transcripcion`: [{start, end, speaker, text}] — `segmento` es su índice en la lista.
    """
    patrones = []
    for t in terminos:
        p = _patron(t.get("termino", ""))
        if p is not None:
            patrones.append((t.get("categoria") or "GENERAL", t["termino"], p))
    hallazgos = []
    for i, seg in enumerate(transcripcion):
        texto = normalizar(seg.get("text", ""))
        if not texto:
            continue
        for categoria, termino, patron in patrones:
            for m in patron.finditer(texto):
                hallazgos.append({"categoria": categoria, "termino": termino, "coincidencia": m.group(0),
                                  "segmento": i, "speaker": seg.get("speaker"), "start": seg.get("start")})
    return hallazgos


def resumen(hallazgos: list) -> list:
    """[{categoria, total, terminos: [...], asesor: n, cliente: n}] ordenado por total."""
    grupos = {}
    for h in hallazgos:
        g = grupos.setdefault(h["categoria"], {"categoria": h["categoria"], "total": 0, "terminos": [],
                                               "asesor": 0, "cliente": 0})
        g["total"] += 1
        if h["coincidencia"] not in g["terminos"]:
            g["terminos"].append(h["coincidencia"])
        g["asesor" if h.get("speaker") == "000" else "cliente"] += 1
    return sorted(grupos.values(), key=lambda g: -g["total"])
