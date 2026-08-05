def obtener_tipo_cartera(conn, id_cartera: str) -> str:
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT
                CASE WHEN t.id = 3 THEN 'castigo'
                     WHEN t.id = 1 THEN 'vigente'
                     ELSE 'vigente'
                END AS tipo
            FROM SISTEMAGEST.cartera c
            LEFT JOIN SISTEMAGEST.tipo_cartera t ON c.tipo = t.id
            WHERE c.id = %s
            """,
            (id_cartera,),
        )
        row = cursor.fetchone()
        return row["tipo"] if row else "vigente"
    finally:
        cursor.close()


def obtener_items_por_cartera(conn, id_cartera: str) -> list:
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT 
                ID_ITEM, 
                NOMBRE_ITEM, 
                PESO_ITEM
            FROM CALIDAD.ITEM
            WHERE ID_CARTERA = %s 
              AND ID_ESTADO = 1
            ORDER BY ID_ITEM
        """,
            (id_cartera,),
        )
        return cursor.fetchall()
    finally:
        cursor.close()


def obtener_criterios_por_item(conn, id_item: int) -> list:
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT
                ID_CRITERIO,
                NOMBRE_CRITERIO,
                PESO_CRITERIO,
                ID_ITEM,
                EVALUADOR_KEY
            FROM CALIDAD.CRITERIO
            WHERE ID_ITEM = %s AND ID_ESTADO = 1
        """,
            (id_item,),
        )
        return cursor.fetchall()
    finally:
        cursor.close()


# def obtener_acciones_por_criterio(conn, id_criterio: int) -> list:
#     cursor = conn.cursor(dictionary=True)
#     try:
#         cursor.execute(
#             """
#             SELECT
#                 ID_ACCION_CRITERIO,
#                 NOMBRE_ACCION_CRITERIO,
#                 PESO_ACCION_CRITERIO,
#                 ID_CRITERIO,
#                 ESTADO_ACCION
#             FROM CALIDAD.ACCION_CRITERIO
#             WHERE ID_CRITERIO = %s AND ESTADO_ACCION = 1
#         """,
#             (id_criterio,),
#         )
#         return cursor.fetchall()
#     finally:
#         cursor.close()


def obtener_acciones_por_criterio(conn, id_criterio: int) -> list:
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT
                ID_ACCION_CRITERIO,
                NOMBRE_ACCION_CRITERIO,
                PESO_ACCION_CRITERIO,
                ID_CRITERIO,
                ESTADO_ACCION,
                FECHA_ACTUALIZACION
            FROM ACCION_CRITERIO 
            WHERE ID_CRITERIO = %s
              AND ESTADO_ACCION = 1
            ORDER BY
              PESO_ACCION_CRITERIO ASC,
              FECHA_ACTUALIZACION DESC,
              ID_ACCION_CRITERIO DESC
            """,
            (id_criterio,),
        )
        return cursor.fetchall()
    finally:
        cursor.close()
