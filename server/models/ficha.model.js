const { db, DataTypes } = require('../utils/database.util');

const Ficha = db.define('ficha', {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: true,
    },
    id_evaluacion: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    cartera: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    tramo: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    agente: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    agente_dni: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    mes_llamada: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    fecha_llamada: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    semana_llamada: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    telefono: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    dni_cliente: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    resultado: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    hora_llamada: {
        type: DataTypes.TIME,
        allowNull: true,
    },
    tmo_segundos: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    tipo_llamada: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    tipo_gestion: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    alerta: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    descripcion_alerta: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    motivo_no_pago: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    responsabilidad_no_fcr: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    motivo_no_fcr: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    // audio_nombre: {
    //     type: DataTypes.STRING,
    //     allowNull: true,
    // },
    fecha_monitoreo: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    nombre_monitor: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    rol: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    hora_inicio: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    hora_fin: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    duracion_monitoreo: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    saludo_11: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    contactar_con_persona_12: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    identificacion_gestor_13: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    apertura: {
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
    apertura_completado: {
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
    brindar_informacion_21: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    indagar_motivo_no_pago_22: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    asesorar_23: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    indagacion: {
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
    indagacion_completado: {
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
    mantiene_sentido_urgencia_31: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    perseverancia_objetivo_32: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    manejo: {
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
    manejo_completado: {
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
    reafirmar_acuerdos_41: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    despedida_cliente_42: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    cierre: {
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
    cierre_completado: {
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
    escucha_activa_51: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    comunicacion_cliente_52: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    amabilidad_cliente_53: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    habilidades: {
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
    habilidades_completado: {
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
    uso_herramientas_61: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    registro_gestiones_62: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    herramientas: {
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
    herramientas_completado: {
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
    calificacion_final: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    observaciones: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    tipo_ficha: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    feedback_recibido: {
        type: DataTypes.TINYINT,
        allowNull: true,
    },
    feedback_compromiso: {
        type: DataTypes.STRING,
        allowNull: true,
    },
});

module.exports = { Ficha };