import os
from dotenv import load_dotenv

# Cargar variables desde archivo .env si existe
load_dotenv()

# Configuración general del sistema
class Settings:
    # Device para los modelos
    DEVICE: str = os.getenv("DEVICE", "cpu")
    MODEL_SIZE: str = os.getenv("MODEL_SIZE", "medium")

    # Token HuggingFace (para diarización)
    HF_AUTH_TOKEN: str = os.getenv("HF_AUTH_TOKEN", "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")

    # Configuración para WhisperX o modelado
    OMP_NUM_THREADS: str = "2"
    TOKENIZERS_PARALLELISM: str = "false"

    # Configuración base de datos
    DB_HOST: str = os.getenv("DB_HOST", "192.168.1.39")
    DB_USER: str = os.getenv("DB_USER", "raul")
    DB_PASS: str = os.getenv("DB_PASS", "loquecallamoslosadmin1")
    DB_NAME: str = os.getenv("DB_NAME", "calidad")

settings = Settings()

# Variables de entorno globales
os.environ["OMP_NUM_THREADS"] = settings.OMP_NUM_THREADS
os.environ["TOKENIZERS_PARALLELISM"] = settings.TOKENIZERS_PARALLELISM
