"""Lectura de la plantilla de evaluación y catálogos (CALIDAD.* / SISTEMAGEST.*)."""


class ConfiguracionEvaluacionError(ValueError):
    """La plantilla activa no permite producir una calificación confiable."""


def obtener_tipo_cartera(conn, id_cartera: str) -> str:
    """'castigo' | 'vigente' según SISTEMAGEST (tipo_cartera.id = 3 es castigo)."""
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
    """Carga la única plantilla activa de la cartera y todo su árbol, validado.

    {id_modelo, nombre_modelo, items: [{id_item, nombre, peso, criterios: [
        {id_criterio, nombre, peso, acciones: [{id_accion, nombre, peso}]}]}]}
    """
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
    return construir_arbol(model["ID_MODELO"], model["NOMBRE"], rows)


def construir_arbol(id_modelo, nombre_modelo, rows: list) -> dict:
    """Árbol validado a partir de las filas planas del JOIN (separado para probarlo sin BD)."""
    if not rows:
        raise ConfiguracionEvaluacionError(f"La plantilla {id_modelo} no tiene ítems activos.")
    items, idx_items, idx_crit = [], {}, {}
    sin_acciones = set()
    for row in rows:
        item_id = row["ID_ITEM"]
        if item_id not in idx_items:
            idx_items[item_id] = {"id_item": item_id, "nombre": row["NOMBRE_ITEM"],
                                  "peso": float(row["PESO_ITEM"] or 0), "criterios": []}
            items.append(idx_items[item_id])
        criterio_id = row["ID_CRITERIO"]
        if criterio_id is None:
            continue
        if criterio_id not in idx_crit:
            idx_crit[criterio_id] = {"id_criterio": criterio_id, "nombre": row["NOMBRE_CRITERIO"],
                                     "peso": float(row["PESO_CRITERIO"] or 0), "acciones": []}
            idx_items[item_id]["criterios"].append(idx_crit[criterio_id])
        if row["ID_ACCION"] is None:
            sin_acciones.add(criterio_id)
            continue
        idx_crit[criterio_id]["acciones"].append({"id_accion": row["ID_ACCION"], "nombre": row["NOMBRE_ACCION"],
                                                  "peso": float(row["PESO_ACCION"] or 0)})

    items_sin_criterios = [str(i["id_item"]) for i in items if not i["criterios"]]
    if items_sin_criterios:
        raise ConfiguracionEvaluacionError(
            "La plantilla tiene ítems sin criterios activos: " + ", ".join(items_sin_criterios))
    if sin_acciones:
        raise ConfiguracionEvaluacionError(
            "La plantilla tiene criterios sin acciones activas: " + ", ".join(map(str, sorted(sin_acciones))))
    if sum(i["peso"] for i in items) <= 0:
        raise ConfiguracionEvaluacionError("La plantilla activa no tiene pesos válidos en sus ítems.")
    return {"id_modelo": id_modelo, "nombre_modelo": nombre_modelo, "items": items}


def obtener_motivos_no_pago(conn, id_cartera: str) -> list:
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """SELECT ID_MOTIVO_NO_PAGO AS id, NOMBRE_MOTIVO_NO_PAGO AS nombre
               FROM CALIDAD.MOTIVO_NO_PAGO
               WHERE ID_CARTERA = %s AND ID_ESTADO = 1
               ORDER BY NOMBRE_MOTIVO_NO_PAGO""",
            (id_cartera,),
        )
        return cursor.fetchall()
    finally:
        cursor.close()
