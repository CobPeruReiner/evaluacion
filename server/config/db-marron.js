const { Sequelize } = require("sequelize");

const dbMarron = new Sequelize("asterisk", "cob_bd", "KOmzT([GWhCf", {
  host: "192.168.1.93",
  port: 3306,
  dialect: "mysql",
  logging: false,
  define: { timestamps: false },
});

module.exports = dbMarron;
