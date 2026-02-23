const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Asistencia = db.define('asistencia', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  empleado_evento_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  hora_entrada: {
    type: DataTypes.DATE,
    allowNull: true
  },
  hora_salida: {
    type: DataTypes.DATE,
    allowNull: true
  },
  empleado_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  eventos_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['diaria', 'evento']]
    }
  }
}, {
  tableName: 'asistencia',
  timestamps: false,
  freezeTableName: true
});

module.exports = Asistencia;