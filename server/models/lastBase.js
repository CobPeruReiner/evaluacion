// const { db, DataTypes } = require('../utils/database.util');

// const Base = db.define('base', {
//     id: {
//         primaryKey: true,
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//     },
//     FECHAGEST: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     "HORA GESTIÓN": {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     id_cartera: {
//         type: DataTypes.STRING,
//         allowNull: true,
//     },
//     CARTERA: {
//         type: DataTypes.STRING,
//         allowNull: true,
//     },
//     IDENTIFICADOR: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     ACCION: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     EFECTO: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     MOTIVO: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     PESO: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     GRUPO: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     CONTACTO: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     OBSERVACION: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     NUMCONTAC: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     GESTOR: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     SUCURSAL: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     PISOS: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     PUERTA: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     FACHADA: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     MONTO: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     FECHA: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     "BUSQUEDA AUDIO": {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     "¿SE ENCONTRÓ AUDIO?": {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     ASESOR: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     ficha: {
//         type: DataTypes.STRING,
//         allowNull: true,
//     },
//     estado: {
//         type: DataTypes.STRING,
//         allowNull: false,
//         defaultValue: 'pendiente'
//     },
// },{
//     freezeTableName: true,
//     initialAutoIncrement: 1000
// });

// module.exports = { Base };