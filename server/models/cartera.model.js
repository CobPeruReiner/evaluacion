const { db, DataTypes } = require('../utils/database.util');

const Cartera = db.define('carteras', {
  idcliente: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cliente: {
    type: DataTypes.STRING,
    allowNull: false
  },
  idcartera: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cartera: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tramo: {
    type: DataTypes.STRING,
    allowNull: false
  },
},{
  freezeTableName: true
});
// Cartera.removeAttribute('id');
module.exports = { Cartera };