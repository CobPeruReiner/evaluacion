"""Calificación con agente: plantilla, puntaje, validación de la salida y palabras clave.

Ejecutar desde fastapi/:  python -m pytest tests -v
No cargan modelos de audio ni requieren BD o red.
"""

import pytest

from app.core import agente, palabras_clave
from app.core.scoring import calificar
from app.data.dao import ConfiguracionEvaluacionError, construir_arbol


def _filas(*items):
    out = []
    for id_item, nombre_item, peso_item, criterios in items:
        for id_c, nombre_c, peso_c, acciones in criterios:
            for id_a, nombre_a, peso_a in acciones:
                out.append({"ID_ITEM": id_item, "NOMBRE_ITEM": nombre_item, "PESO_ITEM": peso_item,
                            "ID_CRITERIO": id_c, "NOMBRE_CRITERIO": nombre_c, "PESO_CRITERIO": peso_c,
                            "ID_ACCION": id_a, "NOMBRE_ACCION": nombre_a, "PESO_ACCION": peso_a})
    return out


@pytest.fixture
def modelo():
    # Pesos como los guarda el editor de plantillas: fracciones de 1.
    return construir_arbol(20, "SCOTIABANK_CASTIGO", _filas(
        (1, "APERTURA", 0.4, [
            (10, "SALUDO", 0.2, [(100, "SI CUMPLE", 0.2), (101, "SALUDA DE MANERA INCORRECTA", 0.1)]),
            (11, "IDENTIFICACION DEL GESTOR", 0.2, [(110, "SI CUMPLE", 0.2), (111, "PARCIAL", 0.1)]),
        ]),
        (2, "CIERRE", 0.6, [
            (20, "DESPEDIDA", 0.6, [(200, "SI CUMPLE", 0.6)]),
        ]),
    ))


# ─── plantilla ───────────────────────────────────────────────────────────────
def test_arbol(modelo):
    assert [i["nombre"] for i in modelo["items"]] == ["APERTURA", "CIERRE"]
    assert [a["id_accion"] for a in modelo["items"][0]["criterios"][1]["acciones"]] == [110, 111]


def test_arbol_rechaza_criterio_sin_acciones():
    filas = _filas((1, "A", 1, [(10, "C", 1, [(100, "X", 1)])]))
    filas.append({**filas[0], "ID_CRITERIO": 11, "ID_ACCION": None})
    with pytest.raises(ConfiguracionEvaluacionError, match="sin acciones"):
        construir_arbol(1, "M", filas)


# ─── puntaje ─────────────────────────────────────────────────────────────────
def test_calificar(modelo):
    r = calificar(modelo, {10: {"id_accion": 100}, 11: {"id_accion": 111}, 20: {"id_accion": 200}}, "castigo")
    assert r["items"][0]["cumplimiento"] == 75.0                 # (0.2 + 0.1) / 0.4
    assert r["items"][1]["cumplimiento"] == 100.0
    assert r["resumen_final"]["cumplimiento_total"] == 90.0      # 75·0.4 + 100·0.6
    assert r["resumen_final"]["resultado"] == "Aprobado"          # castigo: 75
    assert not r["resumen_final"]["requiere_revision"]


def test_ninguna_accion_vale_cero_sin_revision(modelo):
    r = calificar(modelo, {10: {"id_accion": 100}, 11: {"id_accion": 110}, 20: {"id_accion": None}}, "vigente")
    despedida = r["items"][1]["criterios"][0]
    assert despedida["peso_accion"] == 0 and despedida["accion"] == "NO REALIZA" and not despedida["revisar"]
    assert r["resumen_final"]["cumplimiento_total"] == 40.0
    assert r["resumen_final"]["resultado"] == "Observado"         # vigente: 85


def test_criterio_omitido_va_a_revision(modelo):
    r = calificar(modelo, {10: {"id_accion": 100}, 20: {"id_accion": 200}}, "castigo")
    assert r["items"][0]["criterios"][1]["revisar"]
    assert r["resumen_final"]["requiere_revision"]


# ─── salida del agente ───────────────────────────────────────────────────────
def test_validar_salida(modelo):
    data = {
        "criterios": [
            {"id_criterio": 10, "id_accion": 100, "evidencia": "buenas tardes", "segmento": 0},
            {"id_criterio": 11, "id_accion": 200},                 # acción de otro criterio → se descarta
            {"id_criterio": 20, "id_accion": None, "segmento": 99},
        ],
        "promesa_pago": {"hay_promesa": True, "fecha": "2026-11-14", "monto": "250", "tipo": "parcial",
                         "segmento": 3, "cita": "el viernes le deposito 250"},
        "motivo_no_pago": {"id": 7, "cita": "me quedé sin trabajo"},
        "sentimiento_cliente": "positivo",
    }
    s = agente.validar_salida(data, modelo, [{"id": 7, "nombre": "DESEMPLEO"}], 5)
    assert set(s["elecciones"]) == {10, 20}
    assert s["elecciones"][20] == {"id_accion": None, "evidencia": "", "segmento": None, "justificacion": ""}
    assert s["promesa_pago"]["tipo"] == "PARCIAL" and s["promesa_pago"]["monto"] == 250.0
    assert s["motivo_no_pago"] == {"id": 7, "nombre": "DESEMPLEO", "cita": "me quedé sin trabajo"}
    assert s["sentimiento_cliente"] == "POSITIVO"


def test_fecha_imposible_y_sin_promesa(modelo):
    s = agente.validar_salida({"promesa_pago": {"hay_promesa": True, "fecha": "2026-02-30"}}, modelo, [], 1)
    assert s["promesa_pago"]["fecha"] is None
    s = agente.validar_salida({"promesa_pago": {"hay_promesa": False, "monto": 9}}, modelo, [], 1)
    assert s["promesa_pago"] == {"hay_promesa": False, "tipo": "NINGUNA", "fecha": None, "monto": None,
                                 "segmento": None, "cita": ""}


def test_json_con_cercos():
    assert agente._json('```json\n{"asesor": "SPEAKER_01"}\n```') == {"asesor": "SPEAKER_01"}


# ─── palabras clave ──────────────────────────────────────────────────────────
def test_palabras_clave():
    tr = [{"start": 3.0, "speaker": "001", "text": "Le yapeé ayer y mañana le transfiero."},
          {"start": 9.0, "speaker": "000", "text": "La DISCIPLINA es clave. ¿Me comprometo?"}]
    terminos = [{"categoria": "PAGO", "termino": "Yape*"}, {"categoria": "PAGO", "termino": "transfi*"},
                {"categoria": "PAGO", "termino": "plin*"}, {"categoria": "COMPROMISO", "termino": "me comprometo"},
                {"categoria": "COMPROMISO", "termino": "comprom"}]
    h = palabras_clave.detectar(tr, terminos)
    assert [(x["coincidencia"], x["segmento"]) for x in h] == [("yapee", 0), ("transfiero", 0), ("me comprometo", 1)]
    r = palabras_clave.resumen(h)
    assert r[0] == {"categoria": "PAGO", "total": 2, "terminos": ["yapee", "transfiero"], "asesor": 0, "cliente": 2}
