import logging
import os

# Limita los hilos de las bibliotecas numéricas antes de cargar WhisperX. Es
# configurable para adaptar el worker a la CPU real del servidor.
DEFAULT_THREADS = str(min(os.cpu_count() or 2, 4))
os.environ.setdefault("OMP_NUM_THREADS", os.getenv("OMP_NUM_THREADS", DEFAULT_THREADS))
os.environ.setdefault("MKL_NUM_THREADS", os.getenv("MKL_NUM_THREADS", DEFAULT_THREADS))
import whisperx

logger = logging.getLogger(__name__)
os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")

DEVICE = os.getenv("DEVICE", "cpu")
MODEL_SIZE = os.getenv("MODEL_SIZE", "medium")
COMPUTE_TYPE = os.getenv("COMPUTE_TYPE", "int8")
BATCH_SIZE = int(os.getenv("ASR_BATCH_SIZE", "4" if DEVICE == "cpu" else "16"))
HF_TOKEN = os.getenv("HF_AUTH_TOKEN")
MIN_SPEAKERS = int(os.getenv("MIN_SPEAKERS", "2"))
MAX_SPEAKERS = int(os.getenv("MAX_SPEAKERS", "2"))

logger.info("Cargando ASR WhisperX: model=%s device=%s compute=%s", MODEL_SIZE, DEVICE, COMPUTE_TYPE)
model = whisperx.load_model(
    MODEL_SIZE,
    device=DEVICE,
    compute_type=COMPUTE_TYPE,
    asr_options={"max_new_tokens": 128, "clip_timestamps": False, "hallucination_silence_threshold": 0.1},
)
logger.info("Cargando alineador español")
model_a, metadata = whisperx.load_align_model(language_code="es", device=DEVICE)
logger.info("Cargando diarizador")
diarize_model = whisperx.DiarizationPipeline(use_auth_token=HF_TOKEN, device=DEVICE)


def transcribir_audio(ruta_audio: str) -> dict:
    result = model.transcribe(ruta_audio, language="es", batch_size=BATCH_SIZE)
    if not result.get("segments"):
        raise ValueError("No se detectó voz activa en el audio.")
    return result


def alinear_segmentos(result: dict, ruta_audio: str) -> dict:
    return whisperx.align(result["segments"], model_a, metadata, ruta_audio, DEVICE)


def obtener_diarizacion(ruta_audio: str):
    return diarize_model(ruta_audio, min_speakers=MIN_SPEAKERS, max_speakers=MAX_SPEAKERS)


def asignar_hablantes(result: dict, diarizacion):
    return whisperx.assign_word_speakers(diarizacion, result)
