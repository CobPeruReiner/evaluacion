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
                NOMBRE,
                PESO,
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
#                 ID_ACCION,
#                 NOMBRE,
#                 PESO,
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
                ID_ACCION,
                NOMBRE,
                PESO,
                ID_CRITERIO,
                ESTADO_ACCION,
                FE_ACTUALIZACION
            FROM ACCION_CRITERIO 
            WHERE ID_CRITERIO = %s
              AND ESTADO_ACCION = 1
            ORDER BY
              PESO ASC,
              FE_ACTUALIZACION DESC,
              ID_ACCION DESC
            """,
            (id_criterio,),
        )
        return cursor.fetchall()
    finally:
        cursor.close()


def obtener_configuracion_evaluacion(conn, id_cartera: str) -> tuple[dict, dict]:
    """Carga criterios y acciones de la plantilla en dos consultas, no una por fila."""
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT c.ID_CRITERIO, c.NOMBRE, c.PESO, c.ID_ITEM, c.EVALUADOR_KEY
            FROM ITEM i
            INNER JOIN CRITERIO c ON c.ID_ITEM = i.ID_ITEM AND c.ID_ESTADO = 1
            WHERE i.ID_CARTERA = %s AND i.ID_ESTADO = 1
            ORDER BY c.ID_ITEM, c.ID_CRITERIO
            """,
            (id_cartera,),
        )
        criterios_por_item = {}
        criterios = cursor.fetchall()
        for criterio in criterios:
            criterios_por_item.setdefault(criterio["ID_ITEM"], []).append(criterio)

        if not criterios:
            return criterios_por_item, {}

        ids = [criterio["ID_CRITERIO"] for criterio in criterios]
        placeholders = ", ".join(["%s"] * len(ids))
        cursor.execute(
            f"""
            SELECT ID_ACCION, NOMBRE, PESO, ID_CRITERIO, ESTADO_ACCION, FE_ACTUALIZACION
            FROM ACCION_CRITERIO
            WHERE ID_CRITERIO IN ({placeholders}) AND ESTADO_ACCION = 1
            ORDER BY ID_CRITERIO, PESO ASC, FE_ACTUALIZACION DESC, ID_ACCION DESC
            """,
            tuple(ids),
        )
        acciones_por_criterio = {}
        for accion in cursor.fetchall():
            acciones_por_criterio.setdefault(accion["ID_CRITERIO"], []).append(accion)
        return criterios_por_item, acciones_por_criterio
    finally:
        cursor.close()
