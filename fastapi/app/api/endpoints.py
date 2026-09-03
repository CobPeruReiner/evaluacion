import json
import os
import shutil
import re
import uuid
from pathlib import Path
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from celery.result import AsyncResult
from app.celery_app import celery_app
from app.tasks import process_zip_task

router = APIRouter()
JOB_STORAGE = Path(os.getenv("JOB_STORAGE", "/data/jobs"))
CHUNK_SIZE = 1024 * 1024
MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_BYTES", str(1024 * 1024 * 1024)))


async def save_upload(upload: UploadFile, destination: Path) -> int:
    size = 0
    with destination.open("wb") as target:
        while chunk := await upload.read(CHUNK_SIZE):
            size += len(chunk)
            if size > MAX_UPLOAD_BYTES:
                target.close()
                destination.unlink(missing_ok=True)
                raise HTTPException(status_code=413, detail="El ZIP excede el tamaño permitido.")
            target.write(chunk)
    return size


@router.get("/health")
def health():
    return {"ok": True, "service": "speech-api"}


@router.post("/jobs", status_code=202)
async def create_job(
    file: UploadFile = File(...),
    version_roles: str = Form("v2"),
    id_cartera: str = Form(...),
):
    if not file.filename or not file.filename.lower().endswith(".zip"):
        raise HTTPException(status_code=400, detail="Debes enviar un archivo ZIP válido.")
    job_id = str(uuid.uuid4())
    job_dir = JOB_STORAGE / job_id
    job_dir.mkdir(parents=True, exist_ok=False)
    zip_path = job_dir / "source.zip"
    try:
        await save_upload(file, zip_path)
        process_zip_task.delay(job_id, str(zip_path), id_cartera, version_roles)
        return {"ok": True, "job_id": job_id, "status": "queued"}
    except Exception:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise
    finally:
        await file.close()


@router.get("/jobs/{job_id}")
def get_job(job_id: str, include_result: bool = False):
    if not re.fullmatch(r"[a-f0-9-]{36}", job_id, flags=re.IGNORECASE):
        raise HTTPException(status_code=400, detail="Identificador de trabajo inválido.")
    if not (JOB_STORAGE / job_id).is_dir():
        raise HTTPException(status_code=404, detail="Trabajo no encontrado.")
    result = AsyncResult(job_id, app=celery_app)
    response = {"ok": True, "job_id": job_id, "status": result.status.lower()}
    if result.status == "PROGRESS":
        response["progress"] = result.info or {}
    elif result.status == "SUCCESS":
        response["status"] = "completed"
        response["summary"] = result.result
        result_path = Path(result.result["result_path"])
        if include_result and result_path.is_file():
            response["result"] = json.loads(result_path.read_text(encoding="utf-8"))
    elif result.status == "FAILURE":
        response["status"] = "failed"
        response["error"] = "El lote no pudo procesarse. Revisa el registro del worker."
    return JSONResponse(content=response)
