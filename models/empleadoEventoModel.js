const { DataTypes } = require('sequelize');
const db = require('../config/db');

const EmpleadoEvento = db.define('empleado_evento', {
  id:           { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  empleado_id:  { type: DataTypes.INTEGER },
  evento_id: { type: DataTypes.INTEGER, allowNull: true }
}, {
  tableName: 'empleados_eventos',
  timestamps: false,
  freezeTableName: true
});

module.exports = EmpleadoEvento;