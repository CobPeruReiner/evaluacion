import logging
import whisperx
import os

logger = logging.getLogger(__name__)

# Configuración del entorno
os.environ["OMP_NUM_THREADS"] = "2"
os.environ["TOKENIZERS_PARALLELISM"] = "false"

# Parámetros globales
DEVICE = "cpu"
MODEL_SIZE = "medium"

# Carga de modelos (una sola vez)
logger.info("🧠 Cargando modelo de transcripción...")
model = whisperx.load_model(MODEL_SIZE, device=DEVICE, compute_type="int8")

logger.info("🧠 Cargando modelo de alineación...")
model_a, metadata = whisperx.load_align_model(language_code="es", device=DEVICE)

logger.info("🧠 Cargando modelo de diarización...")
diarize_model = whisperx.DiarizationPipeline(
    use_auth_token="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", device=DEVICE
)


def transcribir_audio(ruta_audio: str) -> dict:

    logger.info(
        "============================== TRANSCRIBIENDO AUDIO =============================="
    )

    logger.info(f"📝 Transcribiendo: {ruta_audio}")
    try:
        result = model.transcribe(ruta_audio, language="es")
        if not result.get("segments"):  # Si no hay segmentos
            raise ValueError("No se detectó voz activa en el audio.")
        return result
    except Exception as e:
        logger.warning(f"🚫 Error al transcribir {ruta_audio}: {e}")
        raise  # Re-lanzamos la excepción para que el flujo principal la maneje


def alinear_segmentos(result: dict, ruta_audio: str) -> dict:
    logger.info(
        f"================ 📏 Alineando segmentos para: {ruta_audio} ================"
    )
    return whisperx.align(
        result["segments"], model_a, metadata, ruta_audio, device=DEVICE
    )


def obtener_diarizacion(ruta_audio: str) -> list:
    logger.info(
        f"================ 🧑‍🤝‍🧑 Obteniendo diarización: {ruta_audio} ================"
    )
    return diarize_model(ruta_audio)


def asignar_hablantes(result: dict, diarizacion: list) -> dict:
    logger.info("================ 🎙️ Asignando hablantes... ================")
    return whisperx.assign_word_speakers(diarizacion, result)
