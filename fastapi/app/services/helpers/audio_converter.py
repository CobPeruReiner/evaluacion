import os
import uuid
import logging
from pydub import AudioSegment

logger = logging.getLogger(__name__)


def convertir_a_wav_mono_16k(ruta_origen: str, carpeta_destino: str) -> str:
    """
    Convierte un archivo de audio (MP3, WAV, etc.) a WAV, mono y 16kHz.

    Args:
        ruta_origen (str): Ruta del archivo de audio original.
        carpeta_destino (str): Carpeta donde guardar el archivo convertido.

    Returns:
        str: Ruta del nuevo archivo convertido.
    """
    logger.info(
        "============================== CONVIRTIENDO AUDIO =============================="
    )

    try:
        audio = AudioSegment.from_file(ruta_origen)
        audio = audio.set_channels(1).set_frame_rate(16000)

        nombre_base = f"converted_{uuid.uuid4().hex[:6]}.wav"
        ruta_salida = os.path.join(carpeta_destino, nombre_base)
        audio.export(ruta_salida, format="wav")

        logger.info(f"🔄 Audio convertido: {ruta_salida}")
        return ruta_salida
    except Exception as e:
        logger.error(f"❌ Error al convertir audio {ruta_origen}: {e}")
        raise
