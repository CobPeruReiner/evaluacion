# Usa una imagen oficial de Python ligera y reciente
FROM python:3.11-slim-bookworm

# Ajustes útiles
ENV PIP_NO_CACHE_DIR=1 \
  PYTHONDONTWRITEBYTECODE=1 \
  PYTHONUNBUFFERED=1 \
  MPLBACKEND=Agg

WORKDIR /app

# Dependencias del sistema necesarias para audio
RUN apt-get update && apt-get install -y --no-install-recommends \
  ffmpeg \
  libsndfile1 \
  && rm -rf /var/lib/apt/lists/*

# Instala dependencias de Python primero (mejor cache)
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copia el código de la app
COPY . .

# EntryPoint que precalienta modelos en runtime (no en build)
COPY docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
