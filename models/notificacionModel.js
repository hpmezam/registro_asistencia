//Model de notificaciones, para guardar un histórico de envíos
const { DataTypes } = require('sequelize');
const db = require('../config/db');
const Notificacion = db.define('notificacion', {
  id:        { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  titulo:    { type: DataTypes.STRING, allowNull: false },
  mensaje:    { type: DataTypes.TEXT, allowNull: false },
  fecha_envio: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  evento_id: { type: DataTypes.INTEGER, allowNull: true }, // si quieres relacionar con eventos
}, {
  tableName: 'notificaciones',
  timestamps: false,
  underscored: true,
    freezeTableName: true,
});
const NotificacionDetalle = require('./notificaciodetalleModel');
Notificacion.hasMany(NotificacionDetalle, { foreignKey: 'notificacion_id', as: 'detalles' });
NotificacionDetalle.belongsTo(Notificacion, { foreignKey: 'notificacion_id' })
module.exports = Notificacion;