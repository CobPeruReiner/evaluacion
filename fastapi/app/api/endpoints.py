from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse
from app.services.procesamiento import procesar_archivo

router = APIRouter()

@router.post("/procesar")
async def procesar(
    file: UploadFile = File(...),
    version_roles: str = Form("v2"),
    id_cartera: str = Form(None)
):
    """
    Endpoint para procesar un archivo ZIP con audios.

    Params:
    - file: archivo ZIP que contiene audios en .wav o .mp3
    - version_roles: versión del clasificador de roles (default: v2)
    - id_cartera: ID de cartera para evaluación

    Returns:
    - JSON con resultados exitosos y fallidos
    """
    resultado = await procesar_archivo(file, version_roles, id_cartera)

    if "error" in resultado:
        return JSONResponse(content=resultado, status_code=500)

    return JSONResponse(content=resultado)
