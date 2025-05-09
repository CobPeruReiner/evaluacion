const { db, DataTypes } = require('../utils/database.util');

const Base = db.define('base', {
    id: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
    },
    FECHAGEST: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    id_cartera: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    CARTERA: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    IDENTIFICADOR: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    ACCION: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    EFECTO: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    MOTIVO: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    PESO: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    HOMOLO: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    CONTACTO: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    OBSERV: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    ID_CONT: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    ASESOR: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    SUCURSAL: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    PISOS: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    PUERTA: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    FACHADA: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    MONTO: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    USUARIO: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    FICHA: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    ESTADO: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pendiente'
    },
},{
    freezeTableName: true,
    initialAutoIncrement: 1000
});

module.exports = { Base };