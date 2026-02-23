const Evento = require('../models/eventoModel');
const Lugar = require('../models/lugarModel');
// ================= ASOCIACIONES =================
Evento.belongsTo(Lugar, { foreignKey: 'lugar_id', as: 'lugar' });
// ================= CREAR =================
const crearEvento = async (req, res) => {
  try {
    const { titulo, descripcion, fecha, hora, lugar_id } = req.body;

    const evento = await Evento.create({
      titulo,
      descripcion,
      fecha,
      hora,
      lugar_id
    });

    res.status(201).json(evento);
  } catch (err) {
    res.status(500).json({
      error: 'Error al crear evento',
      detalle: err.message
    });
  }
};


// ================= LISTAR =================
const obtenerEventos = async (_req, res) => {
  try {
    const eventos = await Evento.findAll();
    res.json(eventos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
};


// ================= OBTENER POR ID =================
const obtenerEventoPorId = async (req, res) => {
  try {
    const evento = await Evento.findByPk(req.params.id);

    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    res.json(evento);
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar evento' });
  }
};


// ================= ACTUALIZAR =================
const actualizarEvento = async (req, res) => {
  try {
    const evento = await Evento.findByPk(req.params.id);

    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    const { titulo, descripcion, fecha, hora, lugar_id } = req.body;

    await evento.update({
      titulo,
      descripcion,
      fecha,
      hora,
      lugar_id
    });

    res.json({ message: 'Evento actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar evento' });
  }
};


// ================= ELIMINAR =================
const eliminarEvento = async (req, res) => {
  try {
    const evento = await Evento.findByPk(req.params.id);

    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    await evento.destroy();

    res.json({ message: 'Evento eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar evento' });
  }
};


module.exports = {
  crearEvento,
  obtenerEventos,
  obtenerEventoPorId,
  actualizarEvento,
  eliminarEvento
};