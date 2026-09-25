import mysql.connector
from app.core.config import settings


def get_database_connection():
    """Abre la única conexión MySQL del entorno actual.

    La aplicación consulta explícitamente CALIDAD.* y SISTEMAGEST.*; por eso
    SISTEMAGEST es solo la base por defecto y no una segunda conexión.
    """
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


# Compatibilidad temporal para módulos heredados que no participan en el flujo
# actual. Ambos nombres usan exactamente la misma configuración del entorno.
def SyS_Calidad():
    return get_database_connection()


def SyS_Sistemagest():
    return get_database_connection()
