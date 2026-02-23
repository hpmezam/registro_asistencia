const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Asistencia = db.define('asistencia', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  empleado_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['diaria', 'evento']]
    }
  },
  // Solo requerido cuando tipo = 'evento'
  empleado_evento_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  // Solo requerido cuando tipo = 'evento'
  eventos_id: {
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
  latitud_registro: {
    type: DataTypes.STRING,
    allowNull: true
  },
  longitud_registro: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'asistencia',
  timestamps: false,
  freezeTableName: true
});

module.exports = Asistencia;