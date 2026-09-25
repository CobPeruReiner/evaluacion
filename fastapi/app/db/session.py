import mysql.connector
from app.core.config import settings


def get_database_connection():
    """Abre la única conexión MySQL del entorno actual."""
    missing = [
        name
        for name, value in {
            "DB_HOST": settings.DB_HOST,
            "DB_USER": settings.DB_USER,
            "DB_PASS": settings.DB_PASS,
            "DB_NAME": settings.DB_NAME,
        }.items()
        if not value
    ]
    if missing:
        raise RuntimeError(f"Faltan variables de conexión: {', '.join(missing)}")
    return mysql.connector.connect(
        host=settings.DB_HOST,
        user=settings.DB_USER,
        password=settings.DB_PASS,
        database=settings.DB_NAME,
    )


# Compatibilidad temporal: ambos nombres comparten la única configuración.
def SyS_Calidad():
    return get_database_connection()


def SyS_Sistemagest():
    return get_database_connection()
