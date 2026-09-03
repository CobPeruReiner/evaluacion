import os
from celery import Celery

celery_app = Celery(
    "speech_jobs",
    broker=os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0"),
    backend=os.getenv("CELERY_RESULT_BACKEND", "redis://redis:6379/1"),
)
celery_app.conf.update(
    task_track_started=True,
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    result_expires=60 * 60 * 24,
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    # Un lote puede durar más de una hora. Sin este valor Redis podría volver
    # a entregar la misma tarea mientras el worker aún la está procesando.
    broker_transport_options={"visibility_timeout": 12 * 60 * 60},
    result_backend_transport_options={"visibility_timeout": 12 * 60 * 60},
)
