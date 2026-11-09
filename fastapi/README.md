# Speech analytics — transcripción, diarización y evaluación por criterios

El worker Celery procesa cada ZIP (`cartera_YYYY-MM-DD.zip`) audio por audio:

1. **Transcripción** con faster-whisper (español peruano) y alineación por palabra (WhisperX).
2. **Diarización** real con pyannote (2 hablantes). Los segmentos que el diarizador no cubre heredan el
   hablante vecino en vez de descartarse.
3. **Asesor / cliente**: el agente IA decide qué hablante es el asesor por el contenido de sus frases;
   si no está configurado o falla, se usa la heurística léxica (`helpers/roles_classifier.py`).
4. **Palabras clave**: las envía el server Node con cada lote (campo `palabras_clave` de `POST /jobs`).
   Se administran en la web (Opciones de evaluación → Palabras clave) y se guardan en
   `/data/jobs/_config/palabras_clave.json`, el volumen que ya comparten server y worker. Aceptan comodín
   final (`yape*`).
5. **Evaluación** con la plantilla activa de la cartera (`CALIDAD.MODELO_EVALUACION → ITEM → CRITERIO →
   ACCION_CRITERIO`, solo lectura): el agente elige una acción por criterio citando la frase de la llamada.
   También detecta **promesa de pago** (fecha y monto), motivo de no pago (catálogo `CALIDAD.MOTIVO_NO_PAGO`),
   contacto, sentimiento y un resumen.
6. **Puntaje** en `core/scoring.py`, con los pesos de la plantilla (el agente nunca calcula notas):
   ítem = Σ peso acción / Σ peso criterio; global ponderado por peso de ítem; aprueba con 75 % (castigo)
   u 85 % (vigente). Un criterio que el agente no resuelve vale 0 y queda marcado para revisión.

No hay reglas por nombre de criterio en el código ni tablas nuevas: basta con editar la plantilla.

## Configuración del agente

Cualquier API compatible con OpenAI Chat Completions (ver `.env.example`): `LLM_API_KEY`,
`LLM_BASE_URL`, `LLM_MODEL`, `LLM_TIMEOUT`. Con un servidor local (Ollama/vLLM) las transcripciones no
salen de la red. Sin configuración, las llamadas se transcriben y quedan como "pendientes" de calificar.

## Despliegue

1. Definir las variables `LLM_*` en `server/.env.production` (el compose lo usa también para el worker).
2. `docker compose build && docker compose up -d`.

## Tests

```bash
cd fastapi && python -m pytest tests -v
```
