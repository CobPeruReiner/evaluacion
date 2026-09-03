import subprocess
from pathlib import Path


def convertir_a_wav_mono_16k(ruta_origen: Path, carpeta_destino: Path) -> Path:
    ruta_salida = carpeta_destino / f"{ruta_origen.stem}.16k.wav"
    subprocess.run(
        ["ffmpeg", "-y", "-nostdin", "-i", str(ruta_origen), "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", str(ruta_salida)],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
        text=True,
        # Un audio corrupto/truncado puede colgar ffmpeg indefinidamente y
        # bloquear el worker completo (mismo incidente ya sufrido en Ares).
        timeout=120,
    )
    return ruta_salida
