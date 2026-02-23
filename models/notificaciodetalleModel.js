const { DataTypes } = require('sequelize');
const db = require('../config/db');

const NotificacionDetalle = db.define('notificacion_detalle', {
  id:              { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  notificacion_id: { type: DataTypes.INTEGER, allowNull: false },
  empleado_id:     { type: DataTypes.INTEGER, allowNull: false },
  estado:          { type: DataTypes.STRING },
}, {
  tableName: 'notificaciones_detalle',
  timestamps: false,
  freezeTableName: true
});
const Empleado = require('./empleadoModel');
NotificacionDetalle.belongsTo(Empleado, { foreignKey: 'empleado_id' });
module.exports = NotificacionDetalle;