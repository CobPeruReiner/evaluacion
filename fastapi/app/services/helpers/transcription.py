import logging
import os

# Limita los hilos de las bibliotecas numéricas antes de cargar los modelos. Es
# configurable para adaptar el worker a la CPU real del servidor.
DEFAULT_THREADS = str(min(os.cpu_count() or 2, 4))
os.environ.setdefault("OMP_NUM_THREADS", os.getenv("OMP_NUM_THREADS", DEFAULT_THREADS))
os.environ.setdefault("MKL_NUM_THREADS", os.getenv("MKL_NUM_THREADS", DEFAULT_THREADS))
import whisperx
from faster_whisper import WhisperModel

logger = logging.getLogger(__name__)
os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")

DEVICE = os.getenv("DEVICE", "cpu")
MODEL_SIZE = os.getenv("MODEL_SIZE", "medium")
COMPUTE_TYPE = os.getenv("COMPUTE_TYPE", "int8")
ASR_THREADS = int(os.getenv("ASR_THREADS", DEFAULT_THREADS))
ASR_BEAM_SIZE = int(os.getenv("ASR_BEAM_SIZE", "5"))
HF_TOKEN = os.getenv("HF_AUTH_TOKEN")
MIN_SPEAKERS = int(os.getenv("MIN_SPEAKERS", "2"))
MAX_SPEAKERS = int(os.getenv("MAX_SPEAKERS", "2"))

# Vocabulario de dominio (cobranza/atención al cliente en español peruano) para
# reducir alucinaciones del ASR en audio corto, ruidoso o con silencios largos.
# Adaptado del motor de producción de Ares (proyecto callbot), que transcribe
# el mismo tipo de llamadas con faster-whisper.
_INITIAL_PROMPT = (
    "Llamada telefónica de cobranza y atención al cliente en español peruano. "
    "Términos frecuentes: pagar, soles, deuda, fecha, vencimiento, abono, cuota, "
    "saldo, compromiso de pago, regularizar, tarjeta, financiera, banco, cobranza, "
    "lunes, martes, miércoles, jueves, viernes, sábado, domingo, "
    "enero, febrero, marzo, abril, mayo, junio, julio, agosto, setiembre, "
    "octubre, noviembre, diciembre, no puedo, sí puedo, sería, podría, quisiera."
)

logger.info(
    "Cargando ASR faster-whisper: model=%s device=%s compute=%s threads=%s",
    MODEL_SIZE, DEVICE, COMPUTE_TYPE, ASR_THREADS,
)
_asr_model = WhisperModel(
    MODEL_SIZE,
    device=DEVICE,
    compute_type=COMPUTE_TYPE,
    cpu_threads=ASR_THREADS,
    num_workers=1,
)
logger.info("Cargando alineador español")
model_a, metadata = whisperx.load_align_model(language_code="es", device=DEVICE)
logger.info("Cargando diarizador")
diarize_model = whisperx.DiarizationPipeline(use_auth_token=HF_TOKEN, device=DEVICE)


def transcribir_audio(ruta_audio: str) -> dict:
    segmentos_raw, info = _asr_model.transcribe(
        ruta_audio,
        language="es",
        beam_size=ASR_BEAM_SIZE,
        vad_filter=True,
        vad_parameters={"min_silence_duration_ms": 300},
        condition_on_previous_text=False,
        initial_prompt=_INITIAL_PROMPT,
    )
    segments = [
        {"text": segmento.text.strip(), "start": segmento.start, "end": segmento.end}
        for segmento in segmentos_raw
        if segmento.text.strip()
    ]
    if not segments:
        raise ValueError("No se detectó voz activa en el audio.")
    return {"segments": segments, "language": info.language}


def alinear_segmentos(result: dict, ruta_audio: str) -> dict:
    return whisperx.align(result["segments"], model_a, metadata, ruta_audio, DEVICE)


def obtener_diarizacion(ruta_audio: str):
    return diarize_model(ruta_audio, min_speakers=MIN_SPEAKERS, max_speakers=MAX_SPEAKERS)


def asignar_hablantes(result: dict, diarizacion):
    return whisperx.assign_word_speakers(diarizacion, result)
