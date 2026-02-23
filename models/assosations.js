const Evento         = require('./eventoModel');
const Puesto         = require('./puestoeventoModel');
const EmpleadoEvento = require('./empleadoeventoModel');
const Empleado       = require('./empleadoModel');
const Lugar          = require('./lugareModel');

// Evento
Evento.belongsTo(Lugar,          { foreignKey: 'lugar_id',    as: 'lugar' });
Evento.hasMany(Puesto,           { foreignKey: 'evento_id',   as: 'puestos' });
Evento.hasMany(EmpleadoEvento,   { foreignKey: 'evento_id',   as: 'asignaciones' });

// Puesto
Puesto.belongsTo(Evento,         { foreignKey: 'evento_id',   as: 'evento' });
Puesto.hasMany(EmpleadoEvento,   { foreignKey: 'workplace_id',as: 'asignaciones' });

// EmpleadoEvento
EmpleadoEvento.belongsTo(Evento,  { foreignKey: 'evento_id',   as: 'evento' });
EmpleadoEvento.belongsTo(Empleado,{ foreignKey: 'empleado_id', as: 'empleado' });
EmpleadoEvento.belongsTo(Puesto,  { foreignKey: 'workplace_id',as: 'puesto' });

module.exports = { Evento, Puesto, EmpleadoEvento, Empleado, Lugar };