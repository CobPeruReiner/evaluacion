const { Sequelize } = require("sequelize");

const dbRojo = new Sequelize("asterisk", "ares", "aresvela", {
  host: "192.168.1.60",
  port: 3306,
  dialect: "mysql",
  logging: false,
  define: { timestamps: false },
});

module.exports = dbRojo;
