const { Sequelize } = require("sequelize");

const dbAzul = new Sequelize("asterisk", "cob_bd", "C0br4nz4", {
  host: "192.168.1.100",
  port: 3306,
  dialect: "mysql",
  logging: false,
  define: { timestamps: false },
});

module.exports = dbAzul;
