# Usa una imagen oficial de Python ligera y reciente
FROM python:3.11-slim-bookworm

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Instala dependencias del sistema necesarias para procesamiento de audio.
RUN apt-get update && apt-get install -y \
  ffmpeg \
  libsndfile1 \
  && rm -rf /var/lib/apt/lists/*

# Copia el archivo de requisitos e instala las dependencias de Python.
COPY requirements.txt .
RUN pip install -r requirements.txt

# --- Gestión de Modelos WhisperX y Token de Hugging Face ---
ARG HF_AUTH_TOKEN_BUILD
ARG DEVICE_BUILD="cpu"
ARG MODEL_SIZE_BUILD="medium"

# Establece los argumentos de construcción como variables de entorno temporales para el proceso de construcción.
ENV HF_AUTH_TOKEN=${HF_AUTH_TOKEN_BUILD}
ENV DEVICE=${DEVICE_BUILD}
ENV MODEL_SIZE=${MODEL_SIZE_BUILD}

# Descarga los modelos de WhisperX durante la construcción de la imagen.
RUN python -c "import os, whisperx; whisperx.load_model(os.getenv('MODEL_SIZE'), device=os.getenv('DEVICE'), compute_type='int8'); whisperx.load_align_model(language_code='es', device=os.getenv('DEVICE'));"

# Copia el resto del código de tu aplicación al contenedor.
COPY . .

# Expone el puerto en el que se ejecutará la aplicación FastAPI.
EXPOSE 8000

# Comando para iniciar la aplicación FastAPI usando Uvicorn.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]