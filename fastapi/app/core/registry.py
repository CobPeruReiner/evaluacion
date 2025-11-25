# core/registry.py
from logging import getLogger

logger = getLogger(__name__)

# APERTURA
from app.services.acciones.Apertura.apertura_acciones import (
    seleccionar_accion_saludo,
    seleccionar_accion_contacto,
    seleccionar_accion_identificacion,
)

# INDAGACIÓN / ASESORAMIENTO
from app.services.acciones.Indagacion.indagacion_acciones import (
    seleccionar_accion_info_producto,
    seleccionar_accion_indagar_pago,
    seleccionar_accion_asesorar,
)

# CIERRE
from app.services.acciones.CierreLlamada.CLlamada_acciones import (
    seleccionar_accion_reafirmar,
    seleccionar_accion_despedida,
)

# HABILIDADES BLANDAS
from app.services.acciones.HabilidadesBlandas.HBlandas_acciones import (
    seleccionar_accion_amabilidad,
    seleccionar_accion_comunicacion,
    seleccionar_accion_escucha,
)

# MANEJO LLAMADA
from app.services.acciones.ManejoLlamada.MLlamada_acciones import (
    seleccionar_accion_perseverancia,
    seleccionar_accion_compromiso,
)

# USO DE HERRAMIENTAS (tomadas de tu bloque scotiabank existentes)
from app.services.acciones.Scotiabank.scotiabank_acciones import (
    seleccionar_accion_sigue_guion_politicas,
    seleccionar_accion_registra_gestion,
    seleccionar_accion_resume_acuerdos,
)

EVALUATORS = {
    # ======= APERTURA =======
    "apertura.saludo": seleccionar_accion_saludo,
    "apertura.contacto": seleccionar_accion_contacto,
    "apertura.identificacion": seleccionar_accion_identificacion,
    # ======= INDAGACIÓN / ASESORAMIENTO =======
    "indagacion.info_producto": seleccionar_accion_info_producto,
    "indagacion.indagar_pago": seleccionar_accion_indagar_pago,
    "indagacion.asesorar": seleccionar_accion_asesorar,
    # ======= CIERRE =======
    "cierre.reafirmar": seleccionar_accion_reafirmar,
    "cierre.despedida": seleccionar_accion_despedida,
    "cierre.resumen": seleccionar_accion_resume_acuerdos,
    # ======= HABILIDADES BLANDAS =======
    "habilidades.amabilidad": seleccionar_accion_amabilidad,
    "habilidades.comunicacion": seleccionar_accion_comunicacion,
    "habilidades.escucha": seleccionar_accion_escucha,
    # ======= MANEJO DE LLAMADA =======
    "manejo.perseverancia": seleccionar_accion_perseverancia,
    "manejo.compromiso": seleccionar_accion_compromiso,
    # ======= USO DE HERRAMIENTAS =======
    "uso.sigue_guion": seleccionar_accion_sigue_guion_politicas,
    "uso.registro_gestion": seleccionar_accion_registra_gestion,
}
