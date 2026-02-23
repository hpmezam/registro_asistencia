const Empleado = require('./Empleado');
const Rol = require('./Rol');
const Cargo = require('./Cargo');

// 🔗 Relaciones

Rol.hasMany(Empleado, { foreignKey: 'rol_id' });
Empleado.belongsTo(Rol, { foreignKey: 'rol_id' });

Cargo.hasMany(Empleado, { foreignKey: 'cargo_id' });
Empleado.belongsTo(Cargo, { foreignKey: 'cargo_id' });

module.exports = {
  Empleado,
  Rol,
  Cargo
};