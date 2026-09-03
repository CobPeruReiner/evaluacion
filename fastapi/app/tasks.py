import json
import os
from pathlib import Path
from app.celery_app import celery_app


@celery_app.task(bind=True, name="speech.process_zip")
def process_zip_task(self, job_id: str, zip_path: str, id_cartera: str, version_roles: str):
    from app.services.procesamiento_sync import procesar_archivo_sync

    job_dir = Path(os.getenv("JOB_STORAGE", "/data/jobs")) / job_id

    def report(stage: str, current: int = 0, total: int = 0, filename: str | None = None):
        self.update_state(
            state="PROGRESS",
            meta={"stage": stage, "current": current, "total": total, "filename": filename},
        )

    report("Preparando lote")
    result = procesar_archivo_sync(
        zip_path=Path(zip_path),
        job_dir=job_dir,
        version_roles=version_roles,
        id_cartera=id_cartera,
        progress=report,
    )
    result_path = job_dir / "result.json"
    result_path.write_text(json.dumps(result, ensure_ascii=False), encoding="utf-8")
    return {
        "result_path": str(result_path),
        "exitosos": len(result["exitosos"]),
        "fallidos": len(result["fallidos"]),
        "duracion_total": result["duracion_total"],
    }
