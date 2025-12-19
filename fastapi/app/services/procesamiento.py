# import os
# import uuid
# import shutil
# import zipfile
# import logging
# import base64
# import time

# from fastapi import UploadFile
# from app.services.helpers.audio_converter import convertir_a_wav_mono_16k
# from app.services.helpers.transcription import (
#     transcribir_audio,
#     alinear_segmentos,
#     obtener_diarizacion,
#     asignar_hablantes,
# )
# from app.services.helpers.roles_classifier import etiquetar_roles_v2
# from app.services.evaluator import evaluar_llamada

# logger = logging.getLogger(__name__)


# async def procesar_archivo(file: UploadFile, version_roles: str, id_cartera: str):

#     logger.info(
#         "============================== PROCESANDO ARCHIVO =============================="
#     )

#     temp_dir = f"temp_{uuid.uuid4().hex[:6]}"
#     os.makedirs(temp_dir, exist_ok=True)
#     zip_path = os.path.join(temp_dir, file.filename)

#     resultados_exitosos = []
#     resultados_fallidos = []

#     tiempo_total_inicio = time.perf_counter()

#     try:
#         # Guardar el archivo ZIP subido
#         with open(zip_path, "wb") as f:
#             f.write(await file.read())
#         logger.info(f"📦 Archivo ZIP guardado: {zip_path}")

#         # Extraer el ZIP
#         with zipfile.ZipFile(zip_path, "r") as zip_ref:
#             zip_ref.extractall(temp_dir)
#         logger.info(f"📂 Contenido extraído en: {temp_dir}")

#         archivos_audio = [
#             f for f in os.listdir(temp_dir) if f.lower().endswith((".wav", ".mp3"))
#         ]

#         if not archivos_audio:
#             raise Exception("El ZIP no contiene archivos de audio válidos.")

#         for archivo in archivos_audio:
#             try:
#                 logger.info(f"🔊 Procesando archivo: {archivo}")
#                 ruta_audio_original = os.path.join(temp_dir, archivo)

#                 tiempo_inicio_audio = time.perf_counter()

#                 # Convertir audio a WAV mono 16kHz
#                 ruta_audio = convertir_a_wav_mono_16k(ruta_audio_original, temp_dir)

#                 # Transcripción
#                 result = transcribir_audio(ruta_audio)
#                 segmentos = [
#                     seg
#                     for seg in result["segments"]
#                     if seg["text"].strip() and seg["text"].strip() not in ["...", "--"]
#                 ]

#                 if not segmentos:
#                     raise Exception("No se detectaron segmentos útiles.")

#                 # Alineación + Diarización
#                 aligned = alinear_segmentos(result, ruta_audio)
#                 diarizacion = obtener_diarizacion(ruta_audio)
#                 result["segments"] = aligned["segments"]
#                 result["word_segments"] = aligned["word_segments"]
#                 result = asignar_hablantes(result, diarizacion)

#                 # Formatear transcripción
#                 transcripcion = [
#                     {
#                         "start": seg["start"],
#                         "end": seg["end"],
#                         "speaker": seg.get("speaker", "Desconocido"),
#                         "text": seg["text"],
#                     }
#                     for seg in result["segments"]
#                     if "speaker" in seg
#                 ]

#                 # Clasificar roles
#                 if version_roles == "v2":
#                     transcripcion = etiquetar_roles_v2(transcripcion)
#                 else:
#                     transcripcion = etiquetar_roles_v2(transcripcion)

#                 # Evaluación
#                 evaluacion = evaluar_llamada(transcripcion, id_cartera)

#                 # Codificar audio original en base64
#                 with open(ruta_audio_original, "rb") as f:
#                     audio_base64 = base64.b64encode(f.read()).decode("utf-8")

#                 # Metadatos del archivo
#                 nombre_base = archivo.replace("-all", "").rsplit(".", 1)[0]
#                 partes = nombre_base.split("_")
#                 if len(partes) == 4:
#                     fecha_hora, telefono, campaña, anexo = partes
#                     fecha, hora = (
#                         fecha_hora.split("-") if "-" in fecha_hora else ("", "")
#                     )
#                 else:
#                     fecha = hora = telefono = campaña = anexo = ""

#                 resultados_exitosos.append(
#                     {
#                         "archivo": archivo,
#                         "transcripcion": transcripcion,
#                         "audio_base64": audio_base64,
#                         "metadatos": {
#                             "fecha": fecha,
#                             "hora": hora,
#                             "telefono": telefono,
#                             "campaña": campaña,
#                             "anexo": anexo,
#                         },
#                         "evaluacion": evaluacion,
#                     }
#                 )

#                 duracion_audio = time.perf_counter() - tiempo_inicio_audio
#                 logger.info(f"✅ Procesado {archivo} en {duracion_audio:.2f} seg")

#             except Exception as e:
#                 logger.error(f"⚠️ Error procesando {archivo}: {e}")
#                 resultados_fallidos.append({"archivo": archivo, "error": str(e)})

#         duracion_total = time.perf_counter() - tiempo_total_inicio
#         logger.info(
#             f"🎯 Procesamiento total finalizado en {duracion_total:.2f} segundos"
#         )

#         return {"exitosos": resultados_exitosos, "fallidos": resultados_fallidos}

#     except Exception as e:
#         logger.exception("❌ Error durante el procesamiento general")
#         return {"error": str(e)}

#     finally:
#         try:
#             shutil.rmtree(temp_dir)
#             logger.info(f"🧹 Carpeta temporal eliminada: {temp_dir}")
#         except Exception as e:
#             logger.warning(f"⚠️ No se pudo eliminar carpeta temporal {temp_dir}: {e}")

import os
import uuid
import asyncio
from concurrent.futures import ProcessPoolExecutor
from fastapi import UploadFile
from app.services.procesamiento_sync import procesar_archivo_sync

executor = ProcessPoolExecutor(max_workers=4)

async def procesar_archivo(file: UploadFile, version_roles: str, id_cartera: str):
    temp_dir = f"temp_{uuid.uuid4().hex[:6]}"
    os.makedirs(temp_dir, exist_ok=True)

    zip_path = os.path.join(temp_dir, file.filename)

    try:
        with open(zip_path, "wb") as f:
            f.write(await file.read())

        loop = asyncio.get_running_loop()

        resultado = await loop.run_in_executor(
            executor,
            procesar_archivo_sync,
            zip_path,
            version_roles,
            id_cartera,
            temp_dir
        )

        return resultado

    except Exception as e:
        return {"error": str(e)}
