import logging

logger = logging.getLogger(__name__)

def obtener_id_item(conn, nombre_item: str, id_cartera: str) -> int:
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT ID_ITEM 
            FROM ITEM
            WHERE NOMBRE_ITEM = %s AND ID_CARTERA = %s
        """, (nombre_item, id_cartera))
        row = cursor.fetchone()
        return row["ID_ITEM"] if row else None
    finally:
        cursor.close()

def obtener_criterios_por_item(conn, id_item: int) -> list:
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT ID_CRITERIO, NOMBRE_CRITERIO 
            FROM CRITERIO 
            WHERE ID_ITEM = %s
        """, (id_item,))
        return cursor.fetchall()
    finally:
        cursor.close()

def obtener_acciones_por_criterio(conn, id_criterio: int) -> list:
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT NOMBRE_ACCION_CRITERIO, PESO_ACCION_CRITERIO 
            FROM ACCION_CRITERIO 
            WHERE ID_CRITERIO = %s
        """, (id_criterio,))
        return cursor.fetchall()
    finally:
        cursor.close()
