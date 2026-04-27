# Usa una imagen oficial de Python ligera y reciente
FROM python:3.10-slim-bookworm

# Ajustes útiles
ENV PIP_NO_CACHE_DIR=1 \
  PYTHONDONTWRITEBYTECODE=1 \
  PYTHONUNBUFFERED=1 \
  MPLBACKEND=Agg

WORKDIR /app

# Dependencias del sistema necesarias para audio + PyAV
RUN apt-get update && apt-get install -y --no-install-recommends \
  ffmpeg \
  libsndfile1 \
  pkg-config \
  libavcodec-dev \
  libavdevice-dev \
  libavfilter-dev \
  libavformat-dev \
  libavutil-dev \
  libswresample-dev \
  libswscale-dev \
  gcc \
  g++ \
  make \
  && rm -rf /var/lib/apt/lists/*

# Instala dependencias de Python primero (mejor cache)
COPY requirements.txt .
RUN pip install --upgrade pip && \
  pip install -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu

# Copia el código de la app
COPY . .

# EntryPoint que precalienta modelos en runtime (no en build)
COPY docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
