#!/usr/bin/env bash
set -e

python - <<'PY'
import os
try:
    import whisperx
    device = os.getenv("DEVICE", "cpu")
    size = os.getenv("MODEL_SIZE", "medium")
    compute = os.getenv("COMPUTE_TYPE", "int8")
    # Si usas token HF privado:
    # os.environ["HF_AUTH_TOKEN"] ya viene del environment del contenedor si lo definiste

    # Descarga/prepara modelo ASR
    asr_options = {
        "max_new_tokens": 128,
        "clip_timestamps": False,
        "hallucination_silence_threshold": 0.1,
    }

    whisperx.load_model(
        size,
        device=device,
        compute_type=compute,
        asr_options=asr_options
    )

    # Descarga/prepara modelo de alineación (español)
    whisperx.load_align_model(language_code='es', device=device)
    print("Modelos WhisperX preparados.")
except Exception as e:
    print("Aviso: no se pudo preparar modelos en arranque:", e)
PY

exec "$@"
