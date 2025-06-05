const { Sequelize } = require("sequelize");

const dbGris = new Sequelize("asterisk", "cob_bd", "KOmzT([GWhCf", {
  host: "192.168.1.32",
  port: 3306,
  dialect: "mysql",
  logging: false,
  define: { timestamps: false },
});

module.exports = dbGris;
