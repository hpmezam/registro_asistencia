const EmpleadoEvento = require('../models/empleadoEventoModel');
const Empleado = require('../models/empleadoModel');
const Evento = require('../models/eventoModel');

// Asociaciones (si no las tenés en un archivo central, ponelas aquí)
EmpleadoEvento.belongsTo(Empleado, { foreignKey: 'empleado_id' });
EmpleadoEvento.belongsTo(Evento,   { foreignKey: 'evento_id' });

const include = [
  { model: Empleado, attributes: ['id', 'nombre', 'apellido', 'cedula'] },
  { model: Evento,   attributes: ['id', 'titulo', 'fecha'] }
];

// GET /api/asignaciones
async function listarTodas(_req, res) {
  try {
    const asignaciones = await EmpleadoEvento.findAll({ include, order: [['id', 'DESC']] });
    res.json(asignaciones);
  } catch (e) { res.status(400).json({ error: e.message }); }
}

// GET /api/asignaciones/evento/:evento_id
async function listarPorEvento(req, res) {
  try {
    const asignaciones = await EmpleadoEvento.findAll({
      where: { evento_id: req.params.evento_id },
      include,
      order: [['id', 'ASC']]
    });
    res.json(asignaciones);
  } catch (e) { res.status(400).json({ error: e.message }); }
}

// GET /api/asignaciones/:id
async function obtener(req, res) {
  try {
    const asignacion = await EmpleadoEvento.findByPk(req.params.id, { include });
    if (!asignacion) return res.status(404).json({ error: 'Asignación no encontrada' });
    res.json(asignacion);
  } catch (e) { res.status(400).json({ error: e.message }); }
}

// POST /api/asignaciones
async function crear(req, res) {
  try {
    const { empleado_id, evento_id } = req.body;
    const asignacion = await EmpleadoEvento.create({ empleado_id, evento_id });
    res.json(asignacion);
  } catch (e) { res.status(400).json({ error: e.message }); }
}

// DELETE /api/asignaciones/:id
async function eliminar(req, res) {
  try {
    const asignacion = await EmpleadoEvento.findByPk(req.params.id);
    if (!asignacion) return res.status(404).json({ error: 'Asignación no encontrada' });
    await asignacion.destroy();
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
}

module.exports = { listarTodas, listarPorEvento, obtener, crear, eliminar };