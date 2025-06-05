const { Sequelize } = require("sequelize");

const dbAmarillo = new Sequelize("asterisk", "cob_bd", "3-]E3jlzgs5B", {
  host: "192.168.1.36",
  port: 3306,
  dialect: "mysql",
  logging: false,
  define: { timestamps: false },
});

module.exports = dbAmarillo;
