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
    HF_AUTH_TOKEN: str = os.getenv(
        "HF_AUTH_TOKEN", "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"
    )

    # Configuración para WhisperX o modelado
    OMP_NUM_THREADS: str = "2"
    TOKENIZERS_PARALLELISM: str = "false"

    # SYS CALIDAD
    DB_HOST: str = os.getenv("DB_HOST", "192.168.1.36")
    DB_USER: str = os.getenv("DB_USER", "cob_bd")
    DB_PASS: str = os.getenv("DB_PASS", "33nKVs4@nC")
    DB_NAME: str = os.getenv("DB_NAME", "calidad")

    # SYS SISTEMAGEST
    DB_HOST_SISTEMAGEST: str = os.getenv("DB_HOST_SISTEMAGEST", "192.168.1.31")
    DB_USER_SISTEMAGEST: str = os.getenv("DB_USER_SISTEMAGEST", "cycwebcob")
    DB_PASS_SISTEMAGEST: str = os.getenv("DB_PASS_SISTEMAGEST", "k4&{'Ba7Np1")
    DB_NAME_SISTEMAGEST: str = os.getenv("DB_NAME_SISTEMAGEST", "SISTEMAGEST")


settings = Settings()

# Variables de entorno globales
os.environ["OMP_NUM_THREADS"] = settings.OMP_NUM_THREADS
os.environ["TOKENIZERS_PARALLELISM"] = settings.TOKENIZERS_PARALLELISM
