import mysql.connector
from app.core.config import settings

def obtener_conexion():
    """
    Crea una nueva conexión a la base de datos MySQL usando los parámetros del archivo config.
    """
    return mysql.connector.connect(
        host=settings.DB_HOST,
        user=settings.DB_USER,
        password=settings.DB_PASS,
        database=settings.DB_NAME
    )
