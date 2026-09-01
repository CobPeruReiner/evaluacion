import logging

logger = logging.getLogger(__name__)


def obtener_id_item(conn, nombre_item: str, id_cartera: str) -> int:
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT
                ID_ITEM
            FROM ITEM 
            WHERE NOMBRE_ITEM = %s AND ID_CARTERA = %s AND ID_ESTADO = 1
        """,
            (nombre_item, id_cartera),
        )
        row = cursor.fetchone()
        return row["ID_ITEM"] if row else None
    finally:
        cursor.close()


def obtener_criterios_por_item(conn, id_item: int) -> list:
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT
                ID_CRITERIO,
                NOMBRE,
                PESO,
                ID_ITEM
            FROM CRITERIO 
            WHERE ID_ITEM = %s AND ID_ESTADO = 1
        """,
            (id_item,),
        )
        return cursor.fetchall()
    finally:
        cursor.close()


def obtener_acciones_por_criterio(conn, id_criterio: int) -> list:
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT
                ID_ACCION,
                NOMBRE,
                PESO,
                ID_CRITERIO,
                ESTADO_ACCION
            FROM ACCION_CRITERIO 
            WHERE ID_CRITERIO = %s AND ESTADO_ACCION = 1
        """,
            (id_criterio,),
        )
        return cursor.fetchall()
    finally:
        cursor.close()
