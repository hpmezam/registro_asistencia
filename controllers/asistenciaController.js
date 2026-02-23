const Asistencia = require('../models/asistenciaModel');


// ================= REGISTRAR ENTRADA =================
const registrarEntrada = async (req, res) => {
  try {
    const { empleado_id, eventos_id, empleado_evento_id, tipo } = req.body;

    const asistencia = await Asistencia.create({
      empleado_id,
      eventos_id,
      empleado_evento_id,
      tipo,
      hora_entrada: new Date()
    });

    res.status(201).json(asistencia);
  } catch (err) {
    res.status(500).json({
      error: 'Error al registrar entrada',
      detalle: err.message
    });
  }
};


// ================= REGISTRAR SALIDA =================
const registrarSalida = async (req, res) => {
  try {
    const asistencia = await Asistencia.findByPk(req.params.id);

    if (!asistencia) {
      return res.status(404).json({ error: 'Asistencia no encontrada' });
    }

    if (asistencia.hora_salida) {
      return res.status(400).json({ error: 'La salida ya fue registrada' });
    }

    await asistencia.update({
      hora_salida: new Date()
    });

    res.json({ message: 'Salida registrada correctamente' });

  } catch (err) {
    res.status(500).json({ error: 'Error al registrar salida' });
  }
};


// ================= LISTAR TODAS =================
const obtenerAsistencias = async (_req, res) => {
  try {
    const asistencias = await Asistencia.findAll({
      order: [['id', 'DESC']]
    });
    res.json(asistencias);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener asistencias' });
  }
};


// ================= OBTENER POR ID =================
const obtenerAsistenciaPorId = async (req, res) => {
  try {
    const asistencia = await Asistencia.findByPk(req.params.id);

    if (!asistencia) {
      return res.status(404).json({ error: 'Asistencia no encontrada' });
    }

    res.json(asistencia);
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar asistencia' });
  }
};


// ================= ELIMINAR =================
const eliminarAsistencia = async (req, res) => {
  try {
    const asistencia = await Asistencia.findByPk(req.params.id);

    if (!asistencia) {
      return res.status(404).json({ error: 'Asistencia no encontrada' });
    }

    await asistencia.destroy();

    res.json({ message: 'Asistencia eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar asistencia' });
  }
};


module.exports = {
  registrarEntrada,
  registrarSalida,
  obtenerAsistencias,
  obtenerAsistenciaPorId,
  eliminarAsistencia
};