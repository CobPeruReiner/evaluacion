const dbAmarillo = require("../config/db-amarillo");
const dbAzul = require("../config/db-azul");
const dbGris = require("../config/db-gris");
const dbMarron = require("../config/db-marron");
const dbRojo = require("../config/db-rojo");

const obtenerConexionPorColor = (color) => {
  switch (color) {
    case "ROJO":
      return dbRojo;
    case "MARRON":
      return dbMarron;
    case "AZUL":
      return dbAzul;
    case "AMARILLO":
      return dbAmarillo;
    case "GRIS":
      return dbGris;
    default:
      return null;
  }
};

module.exports = { obtenerConexionPorColor };
