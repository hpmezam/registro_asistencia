// models/Empleado.js
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const Empleado = db.define('empleado', {
  id:        { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  cedula:    { type: DataTypes.STRING, allowNull: false, unique: true },
  nombre:    { type: DataTypes.STRING, allowNull: false },
  apellido:  { type: DataTypes.STRING, allowNull: false },
  cargo:     { type: DataTypes.STRING, allowNull: false, defaultValue: 'empleado' },
  rol:       { type: DataTypes.ENUM('admin','empleado'), allowNull: false, defaultValue: 'empleado' },
  lugar_id:  { type: DataTypes.INTEGER, allowNull: true },

  // Si algun dia usas password:
  password_hash: { type: DataTypes.STRING, allowNull: true, field: 'password_hash' },

  // MUY IMPORTANTE: nombre de columna EXACTO en la BD
  device_token: { type: DataTypes.TEXT, allowNull: true, field: 'device_token' }
}, {
  tableName: 'empleados',
  timestamps: false,
  freezeTableName: true,
  defaultScope: {
    attributes: { exclude: ['password_hash'] }
  },
  scopes: {
    withPassword: {
      attributes: { include: ['password_hash'] }
    }
  }
});


// 🔐 Métodos para contraseña
Empleado.prototype.setPassword = async function (plainPassword) {
  const salt = await bcrypt.genSalt(10);
  this.password_hash = await bcrypt.hash(plainPassword, salt);
};

Empleado.prototype.validatePassword = function (plainPassword) {
  return bcrypt.compare(
    plainPassword,
    this.getDataValue('password_hash')
  );
};

module.exports = Empleado;
