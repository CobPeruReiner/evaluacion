import mysql.connector
from app.core.config import settings


def SyS_Calidad():
    """
    Crea una nueva conexión a la base de datos MySQL usando los parámetros del archivo config.
    """
    return mysql.connector.connect(
        host=settings.DB_HOST,
        user=settings.DB_USER,
        password=settings.DB_PASS,
        database=settings.DB_NAME,
    )


def SyS_Sistemagest():
    """
    Crea una nueva conexión a la base de datos MySQL usando los parámetros del archivo config.
    """
    return mysql.connector.connect(
        host=settings.DB_HOST_SISTEMAGEST,
        user=settings.DB_USER_SISTEMAGEST,
        password=settings.DB_PASS_SISTEMAGEST,
        database=settings.DB_NAME_SISTEMAGEST,
    )
