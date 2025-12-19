import os
import zipfile
import shutil
import time
import base64
import logging

from app.services.helpers.audio_converter import convertir_a_wav_mono_16k
from app.services.helpers.transcription import (
    transcribir_audio,
    alinear_segmentos,
    obtener_diarizacion,
    asignar_hablantes,
)
from app.services.helpers.roles_classifier import etiquetar_roles_v2
from app.services.evaluator import evaluar_llamada

logger = logging.getLogger(__name__)

def procesar_archivo_sync(zip_path, version_roles, id_cartera, temp_dir):
    resultados_exitosos = []
    resultados_fallidos = []

    inicio_total = time.perf_counter()

    try:
        with zipfile.ZipFile(zip_path, "r") as zip_ref:
            zip_ref.extractall(temp_dir)

        archivos_audio = [
            f for f in os.listdir(temp_dir)
            if f.lower().endswith((".wav", ".mp3"))
        ]

        if not archivos_audio:
            raise Exception("El ZIP no contiene audios válidos")

        for archivo in archivos_audio:
            try:
                ruta_audio_original = os.path.join(temp_dir, archivo)
                inicio = time.perf_counter()

                ruta_audio = convertir_a_wav_mono_16k(ruta_audio_original, temp_dir)

                result = transcribir_audio(ruta_audio)
                segmentos = [seg for seg in result["segments"] if seg["text"].strip()]

                if not segmentos:
                    raise Exception("Audio vacío")

                aligned = alinear_segmentos(result, ruta_audio)
                diarizacion = obtener_diarizacion(ruta_audio)

                result["segments"] = aligned["segments"]
                result["word_segments"] = aligned["word_segments"]
                result = asignar_hablantes(result, diarizacion)

                transcripcion = [
                    {
                        "start": seg["start"],
                        "end": seg["end"],
                        "speaker": seg.get("speaker"),
                        "text": seg["text"],
                    }
                    for seg in result["segments"]
                    if "speaker" in seg
                ]

                transcripcion = etiquetar_roles_v2(transcripcion)
                evaluacion = evaluar_llamada(transcripcion, id_cartera)

                with open(ruta_audio_original, "rb") as f:
                    audio_base64 = base64.b64encode(f.read()).decode()

                # 🔥 METADATOS RESTAURADOS
                nombre_base = archivo.replace("-all", "").rsplit(".", 1)[0]
                partes = nombre_base.split("_")

                if len(partes) == 4:
                    fecha_hora, telefono, campaña, anexo = partes
                    fecha, hora = (
                        fecha_hora.split("-") if "-" in fecha_hora else ("", "")
                    )
                else:
                    fecha = hora = telefono = campaña = anexo = ""

                resultados_exitosos.append({
                    "archivo": archivo,
                    "transcripcion": transcripcion,
                    "audio_base64": audio_base64,
                    "metadatos": {
                        "fecha": fecha,
                        "hora": hora,
                        "telefono": telefono,
                        "campaña": campaña,
                        "anexo": anexo,
                    },
                    "evaluacion": evaluacion,
                })

                logger.info(f"✅ {archivo} en {time.perf_counter() - inicio:.2f}s")

            except Exception as e:
                resultados_fallidos.append({"archivo": archivo, "error": str(e)})

        return {
            "exitosos": resultados_exitosos,
            "fallidos": resultados_fallidos,
            "duracion_total": time.perf_counter() - inicio_total,
        }

    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)
