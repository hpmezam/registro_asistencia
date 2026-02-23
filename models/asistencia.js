// Backend/models/asistencia.js
const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Asistencia = db.define('Asistencia', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:      { type: DataTypes.INTEGER, allowNull: false },
  workplace_id: { type: DataTypes.INTEGER, allowNull: false },
  fecha:        { type: DataTypes.DATEONLY, allowNull: false },
  hora_entrada: { type: DataTypes.TIME, allowNull: true },
  hora_salida:  { type: DataTypes.TIME, allowNull: true },
  // ⬇⬇⬇ CAMBIAR a DOUBLE
  latitud:  { type: DataTypes.DOUBLE, allowNull: true },
  longitud: { type: DataTypes.DOUBLE, allowNull: true },
 
}, {
  tableName: 'asistencias',
  timestamps: false,
  underscored: true,
  freezeTableName: true
});

module.exports = Asistencia;
