const Evento = require('../models/eventoModel');

// POST /api/eventos
async function crearEvento(req, res) {
  try {
    const { titulo, descripcion, fecha_inicio, hora, lugar_id } = req.body;
    const evento = await Evento.create({ titulo, descripcion, fecha_inicio, hora, lugar_id });
    res.json(evento);
  } catch (e) { res.status(400).json({ error: e.message }); }
}

// GET /api/eventos
async function listarEventos(_req, res) {
  try {
    const eventos = await Evento.findAll({
      order: [['fecha_inicio', 'ASC NULLS LAST'], ['id', 'DESC']]
    });
    res.json(eventos);
  } catch (e) { res.status(400).json({ error: e.message }); }
}

// GET /api/eventos/:id
async function obtenerEvento(req, res) {
  try {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json(evento);
  } catch (e) { res.status(400).json({ error: e.message }); }
}

// PUT /api/eventos/:id
async function actualizarEvento(req, res) {
  try {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
    const { titulo, descripcion, fecha_inicio, hora, lugar_id } = req.body;
    await evento.update({ titulo, descripcion, fecha_inicio, hora, lugar_id });
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
}

// DELETE /api/eventos/:id
async function eliminarEvento(req, res) {
  try {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
    await evento.destroy();
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
}

module.exports = { crearEvento, listarEventos, obtenerEvento, actualizarEvento, eliminarEvento };