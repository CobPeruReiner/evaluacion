from fastapi import FastAPI
import os
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router as api_router
import logging

# Configuración del logger global
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)

# Crear instancia de FastAPI
app = FastAPI(
    title="API de Evaluación de Llamadas",
    version="1.0.0"
)

# La API es consumida por el backend Node. Si alguna UI necesita llamarla de
# forma directa, se habilitan únicamente sus orígenes explícitos.
cors_origins = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "").split(",") if origin.strip()]
if cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type", "Authorization"],
    )

# Incluir rutas
app.include_router(api_router, prefix="/api/v1")
