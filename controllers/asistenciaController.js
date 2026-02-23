const Asistencia = require('../models/asistenciaModel');


// ================= REGISTRAR ENTRADA =================
const registrarEntrada = async (req, res) => {
  try {
    const empleado_id = req.user.id; // ← del token JWT
    const { eventos_id, empleado_evento_id, tipo } = req.body;

    const asistencia = await Asistencia.create({
      empleado_id,
      eventos_id,
      empleado_evento_id,
      tipo,
      hora_entrada: new Date()
    });

    res.status(201).json(asistencia);
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar entrada', detalle: err.message });
  }
};
// ================= VER SI YA TIENE ENTRADA ACTIVA =================
// GET /api/asistencias/activa
const asistenciaActiva = async (req, res) => {
  try {
    const empleado_id = req.user.id; // ← del token JWT

    const activa = await Asistencia.findOne({
      where: {
        empleado_id,
        hora_salida: null  // sin salida = sigue activa
      },
      order: [['id', 'DESC']]
    });

    res.json(activa || null);
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar asistencia activa', detalle: err.message });
  }
};
const misAsistencias = async (req, res) => {
  try {
    const empleado_id = req.user.id; // ← del token JWT
    const { desde, hasta } = req.query;

    const where = { empleado_id };

    if (desde || hasta) {
      where.hora_entrada = {};
      if (desde) where.hora_entrada[Op.gte] = new Date(desde + 'T00:00:00');
      if (hasta) where.hora_entrada[Op.lte] = new Date(hasta + 'T23:59:59');
    }

    const asistencias = await Asistencia.findAll({
      where,
      order: [['id', 'DESC']]
    });

    res.json(asistencias);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener asistencias', detalle: err.message });
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
    res.status(500).json({ error: 'Error al registrar salida', detalle: err.message });
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
    res.status(500).json({ error: 'Error al obtener asistencias', detalle: err.message });
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
    res.status(500).json({ error: 'Error al buscar asistencia', detalle: err.message });
  }
};

const obtenerAsistenciasRango = async (req, res) => {
  try {
    const { desde, hasta, empleadoId } = req.query;
    const where = {};

    if (empleadoId) where.empleado_id = empleadoId;

    if (desde || hasta) {
      where.hora_entrada = {};
      if (desde) where.hora_entrada[Op.gte] = new Date(desde + 'T00:00:00');
      if (hasta) where.hora_entrada[Op.lte] = new Date(hasta + 'T23:59:59');
    }

    const asistencias = await Asistencia.findAll({
      where,
      order: [['id', 'DESC']]
    });
    res.json(asistencias);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener asistencias', detalle: err.message });
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
    res.status(500).json({ error: 'Error al eliminar asistencia', detalle: err.message });
  }
};
// En asistenciasController.js - agregar este import al inicio
const { Op } = require('sequelize');

// ================= RESUMEN KPIs =================
const resumenAsistencias = async (req, res) => {
  try {
    const { desde, hasta, empleadoId } = req.query;
    const where = {};

    if (empleadoId) where.empleado_id = Number(empleadoId);

    if (desde || hasta) {
      where.hora_entrada = {};
      if (desde) where.hora_entrada[Op.gte] = new Date(desde + 'T00:00:00');
      if (hasta) where.hora_entrada[Op.lte] = new Date(hasta + 'T23:59:59');
    }

    // Solo registros que tengan ambas horas para calcular duración
    const registros = await Asistencia.findAll({
      where: {
        ...where,
        hora_salida: { [Op.ne]: null }  // solo los que tienen salida
      }
    });

    let totalSeg = 0;
    registros.forEach(r => {
      const diff = new Date(r.hora_salida) - new Date(r.hora_entrada);
      if (diff > 0) totalSeg += Math.floor(diff / 1000);
    });

    res.json({
      horas: Math.floor(totalSeg / 3600),
      minutos: Math.floor((totalSeg % 3600) / 60),
      segundos: totalSeg % 60,
      totalRegistros: registros.length
    });

  } catch (err) {
    res.status(500).json({ error: 'Error al calcular resumen', detalle: err.message });
  }
};

module.exports = {
  registrarEntrada,
  registrarSalida,
  obtenerAsistencias,
  obtenerAsistenciaPorId,
  obtenerAsistenciasRango,
  resumenAsistencias,
  eliminarAsistencia,
  asistenciaActiva,
  misAsistencias
};