#!/usr/bin/env bash
set -e
# Los modelos se cargan solamente en el proceso Celery que procesa audios.
# La API HTTP debe iniciar rápido y nunca duplicar modelos de inferencia.
exec "$@"
