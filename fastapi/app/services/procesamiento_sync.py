import os
import shutil
import time
import zipfile
from pathlib import Path
from typing import Callable
from app.services.helpers.audio_converter import convertir_a_wav_mono_16k
from app.services.helpers.transcription import transcribir_audio, alinear_segmentos, obtener_diarizacion, asignar_hablantes
from app.services.helpers.roles_classifier import etiquetar_roles_v2
from app.services.evaluator import evaluar_llamada

MAX_FILES = int(os.getenv("MAX_AUDIO_FILES_PER_JOB", "250"))
MAX_UNCOMPRESSED_BYTES = int(os.getenv("MAX_UNCOMPRESSED_BYTES", str(4 * 1024 * 1024 * 1024)))
AUDIO_EXTENSIONS = {".wav", ".mp3"}


def _extract_audio(zip_path: Path, destination: Path) -> list[Path]:
    with zipfile.ZipFile(zip_path) as archive:
        entries = [entry for entry in archive.infolist() if not entry.is_dir() and Path(entry.filename).suffix.lower() in AUDIO_EXTENSIONS]
        if not entries:
            raise ValueError("El ZIP no contiene audios WAV o MP3.")
        if len(entries) > MAX_FILES:
            raise ValueError(f"El ZIP supera el máximo de {MAX_FILES} audios.")
        uncompressed_size = sum(entry.file_size for entry in entries)
        compressed_size = sum(entry.compress_size for entry in entries)
        if uncompressed_size > MAX_UNCOMPRESSED_BYTES:
            raise ValueError("El ZIP supera el tamaño descomprimido permitido.")
        # Impide ZIP bombs con una relación de compresión anómala.
        if compressed_size and uncompressed_size / compressed_size > 100:
            raise ValueError("El ZIP tiene una relación de compresión no permitida.")
        destination.mkdir(parents=True, exist_ok=True)
        paths = []
        used_names = set()
        for index, entry in enumerate(entries, start=1):
            name = Path(entry.filename).name
            if not name:
                continue
            output_name = name if name not in used_names else f"{index}_{name}"
            used_names.add(output_name)
            output = destination / output_name
            with archive.open(entry) as source, output.open("wb") as target:
                shutil.copyfileobj(source, target, length=1024 * 1024)
            paths.append(output)
        return paths


def _metadata(filename: str) -> dict:
    base = filename.replace("-all", "").rsplit(".", 1)[0]
    parts = base.split("_")
    if len(parts) == 4:
        date_time, phone, campaign, extension = parts
        date, hour = date_time.split("-", 1) if "-" in date_time else ("", "")
        return {"fecha": date, "hora": hour, "telefono": phone, "campaña": campaign, "anexo": extension}
    return {"fecha": "", "hora": "", "telefono": "", "campaña": "", "anexo": ""}


def procesar_archivo_sync(zip_path: Path, job_dir: Path, version_roles: str, id_cartera: str, progress: Callable):
    started = time.perf_counter()
    source_dir = job_dir / "source"
    work_dir = job_dir / "work"
    audio_dir = job_dir / "audio"
    work_dir.mkdir(parents=True, exist_ok=True)
    audio_dir.mkdir(parents=True, exist_ok=True)
    successful, failed = [], []
    try:
        progress("Extrayendo audios")
        files = _extract_audio(zip_path, source_dir)
        total = len(files)
        for current, original in enumerate(files, start=1):
            stages = {}
            try:
                progress("Convirtiendo audio", current, total, original.name)
                step = time.perf_counter()
                wav_path = convertir_a_wav_mono_16k(original, work_dir)
                stages["conversion"] = round(time.perf_counter() - step, 3)

                progress("Transcribiendo", current, total, original.name)
                step = time.perf_counter()
                result = transcribir_audio(str(wav_path))
                result["segments"] = [segment for segment in result["segments"] if segment["text"].strip()]
                if not result["segments"]:
                    raise ValueError("Audio sin segmentos útiles.")
                stages["transcripcion"] = round(time.perf_counter() - step, 3)

                progress("Alineando y diarizando", current, total, original.name)
                step = time.perf_counter()
                aligned = alinear_segmentos(result, str(wav_path))
                diarization = obtener_diarizacion(str(wav_path))
                result["segments"] = aligned["segments"]
                result = asignar_hablantes(result, diarization)
                stages["alineacion_diarizacion"] = round(time.perf_counter() - step, 3)

                step = time.perf_counter()
                transcript = [{"start": segment["start"], "end": segment["end"], "speaker": segment.get("speaker"), "text": segment["text"]} for segment in result["segments"] if segment.get("speaker")]
                transcript = etiquetar_roles_v2(transcript)
                evaluation = evaluar_llamada(transcript, id_cartera)
                stages["evaluacion"] = round(time.perf_counter() - step, 3)

                stored_audio = audio_dir / original.name
                shutil.copy2(original, stored_audio)
                successful.append({"archivo": original.name, "audio_path": f"audio/{stored_audio.name}", "transcripcion": transcript, "metadatos": _metadata(original.name), "evaluacion": evaluation, "timings": stages})
            except Exception as error:
                failed.append({"archivo": original.name, "error": str(error), "timings": stages})
            finally:
                wav_path = work_dir / f"{original.stem}.16k.wav"
                wav_path.unlink(missing_ok=True)
        return {"exitosos": successful, "fallidos": failed, "duracion_total": round(time.perf_counter() - started, 3)}
    finally:
        zip_path.unlink(missing_ok=True)
        shutil.rmtree(source_dir, ignore_errors=True)
        shutil.rmtree(work_dir, ignore_errors=True)
