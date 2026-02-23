// Backend/models/evento.js
const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Evento = db.define('eventos', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  titulo:{ type: DataTypes.STRING, allowNull: false },
  descripcion: { type: DataTypes.TEXT },
  fecha_inicio:{ type: DataTypes.DATEONLY },
  hora:{ type: DataTypes.TIME },
  lugar_id:    { type: DataTypes.INTEGER }
}, { tableName: 'eventos', timestamps: false });

module.exports = Evento;
