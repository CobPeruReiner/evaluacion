class ConfiguracionEvaluacionError(ValueError):
    """La plantilla activa no permite producir una calificación confiable."""


def obtener_tipo_cartera(conn, id_cartera: str) -> str:
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT CASE WHEN tc.id = 3 THEN 'castigo' ELSE 'vigente' END AS tipo
            FROM SISTEMAGEST.cartera AS c
            LEFT JOIN SISTEMAGEST.tipo_cartera AS tc ON tc.id = c.tipo
            WHERE c.id = %s AND c.estado = 1
            LIMIT 1
            """,
            (id_cartera,),
        )
        row = cursor.fetchone()
        if not row:
            raise ConfiguracionEvaluacionError(f"La cartera activa {id_cartera} no existe en SISTEMAGEST.")
        return row["tipo"]
    finally:
        cursor.close()


def obtener_configuracion_evaluacion(conn, id_cartera: str) -> dict:
    """Carga una única plantilla activa y todo su árbol en dos consultas."""
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT ID_MODELO, NOMBRE
            FROM CALIDAD.MODELO_EVALUACION
            WHERE ID_CARTERA = %s AND ESTADO = 1
            ORDER BY ID_MODELO
            """,
            (id_cartera,),
        )
        models = cursor.fetchall()
        if not models:
            raise ConfiguracionEvaluacionError(f"La cartera {id_cartera} no tiene una plantilla activa.")
        if len(models) != 1:
            raise ConfiguracionEvaluacionError(
                f"La cartera {id_cartera} tiene {len(models)} plantillas activas; debe existir exactamente una."
            )
        model = models[0]
        cursor.execute(
            """
            SELECT i.ID_ITEM, i.NOMBRE AS NOMBRE_ITEM, i.PESO AS PESO_ITEM,
                   c.ID_CRITERIO, c.NOMBRE AS NOMBRE_CRITERIO, c.PESO AS PESO_CRITERIO,
                   a.ID_ACCION, a.NOMBRE AS NOMBRE_ACCION, a.PESO AS PESO_ACCION
            FROM CALIDAD.ITEM AS i
            LEFT JOIN CALIDAD.CRITERIO AS c
              ON c.ID_ITEM = i.ID_ITEM AND c.ESTADO = 1
            LEFT JOIN CALIDAD.ACCION_CRITERIO AS a
              ON a.ID_CRITERIO = c.ID_CRITERIO AND a.ESTADO = 1
            WHERE i.ID_MODELO = %s AND i.ESTADO = 1
            ORDER BY i.ID_ITEM, c.ID_CRITERIO, a.ID_ACCION
            """,
            (model["ID_MODELO"],),
        )
        rows = cursor.fetchall()
    finally:
        cursor.close()

    if not rows:
        raise ConfiguracionEvaluacionError(f"La plantilla {model['ID_MODELO']} no tiene ítems activos.")

    items, criterios_por_item, acciones_por_criterio = {}, {}, {}
    criterios_sin_acciones = set()
    for row in rows:
        item_id = row["ID_ITEM"]
        if item_id not in items:
            items[item_id] = {
                "ID_ITEM": item_id,
                "NOMBRE_ITEM": row["NOMBRE_ITEM"],
                "PESO_ITEM": float(row["PESO_ITEM"] or 0),
            }
            criterios_por_item[item_id] = []
        criterio_id = row["ID_CRITERIO"]
        if criterio_id is None:
            continue
        criterios = criterios_por_item[item_id]
        if not any(c["ID_CRITERIO"] == criterio_id for c in criterios):
            criterios.append({
                "ID_CRITERIO": criterio_id,
                "NOMBRE": row["NOMBRE_CRITERIO"],
                "PESO": float(row["PESO_CRITERIO"] or 0),
                "ID_ITEM": item_id,
            })
            acciones_por_criterio[criterio_id] = []
        if row["ID_ACCION"] is None:
            criterios_sin_acciones.add(criterio_id)
            continue
        acciones_por_criterio[criterio_id].append({
            "ID_ACCION": row["ID_ACCION"],
            "NOMBRE": row["NOMBRE_ACCION"],
            "PESO": float(row["PESO_ACCION"] or 0),
            "ID_CRITERIO": criterio_id,
        })

    items_sin_criterios = [item_id for item_id, criterios in criterios_por_item.items() if not criterios]
    if items_sin_criterios:
        raise ConfiguracionEvaluacionError(
            "La plantilla tiene ítems sin criterios activos: " + ", ".join(map(str, items_sin_criterios))
        )
    if criterios_sin_acciones:
        raise ConfiguracionEvaluacionError(
            "La plantilla tiene criterios sin acciones activas: " + ", ".join(map(str, sorted(criterios_sin_acciones)))
        )
    return {
        "id_modelo": model["ID_MODELO"],
        "nombre_modelo": model["NOMBRE"],
        "items": list(items.values()),
        "criterios_por_item": criterios_por_item,
        "acciones_por_criterio": acciones_por_criterio,
    }


def obtener_criterios_por_item(conn, id_item: int) -> list:
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """SELECT ID_CRITERIO, NOMBRE, PESO, ID_ITEM
               FROM CALIDAD.CRITERIO
               WHERE ID_ITEM = %s AND ESTADO = 1
               ORDER BY ID_CRITERIO""",
            (id_item,),
        )
        return cursor.fetchall()
    finally:
        cursor.close()


def obtener_acciones_por_criterio(conn, id_criterio: int) -> list:
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """SELECT ID_ACCION, NOMBRE, PESO, ID_CRITERIO
               FROM CALIDAD.ACCION_CRITERIO
               WHERE ID_CRITERIO = %s AND ESTADO = 1
               ORDER BY ID_ACCION""",
            (id_criterio,),
        )
        return cursor.fetchall()
    finally:
        cursor.close()
