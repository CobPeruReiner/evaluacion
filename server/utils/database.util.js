const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv')

dotenv.config({ path: './config.env' });

const db = new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB,
    logging: false,
    define: {
        timestamps: false
    },
});

const dbWeb = new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST_WEB,
    username: process.env.DB_USER_WEB,
    password: process.env.DB_PASSWORD_WEB,
    database: process.env.DB_WEB,
    logging: false,
    define: {
        timestamps: false
    },
});

module.exports = { db, dbWeb, DataTypes };