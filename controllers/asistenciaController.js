const { Op } = require('sequelize');
const Asistencia = require('../models/asistenciaModel');
const Lugar      = require('../models/lugarModel');
const Evento     = require('../models/eventoModel');
const Empleado   = require('../models/empleadoModel');
// ================= HELPER: calcular distancia Haversine (metros) =================
const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // radio de la Tierra en metros
  const rad = (x) => (x * Math.PI) / 180;

  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ================= HELPER: obtener lugar según tipo =================
const obtenerLugar = async (tipo, body, empleado_id) => {
  if (tipo === 'evento') {
    const evento = await Evento.findByPk(body.eventos_id);
    if (!evento)        return { error: 'Evento no encontrado' };
    if (!evento.lugar_id) return { error: 'El evento no tiene un lugar asignado' };

    const lugar = await Lugar.findByPk(evento.lugar_id);
    if (!lugar) return { error: 'Lugar del evento no encontrado' };

    return { lugar };
  }

  if (tipo === 'diaria') {
    const empleado = await Empleado.findByPk(empleado_id);
    if (!empleado)        return { error: 'Empleado no encontrado' };
    if (!empleado.lugar_id) return { error: 'El empleado no tiene un lugar asignado' };

    const lugar = await Lugar.findByPk(empleado.lugar_id);
    if (!lugar) return { error: 'Lugar del empleado no encontrado' };

    return { lugar };
  }
};
// ================= HELPER: validar que está dentro del radio =================
const validarUbicacion = (lugar, latitud_registro, longitud_registro) => {
  if (!latitud_registro || !longitud_registro) {
    return 'Se requieren latitud_registro y longitud_registro para registrar asistencia';
  }

  const distancia = calcularDistancia(
    parseFloat(lugar.latitud),
    parseFloat(lugar.longitud),
    parseFloat(latitud_registro),
    parseFloat(longitud_registro)
  );

  if (distancia > parseFloat(lugar.radio)) {
    return `Fuera del área permitida. Distancia: ${Math.round(distancia)}m, Radio permitido: ${lugar.radio}m`;
  }

  return null; // dentro del radio
};
// ================= HELPER: validar campos según tipo =================
const validarCamposPorTipo = (tipo, body) => {
  if (!tipo || !['diaria', 'evento'].includes(tipo)) {
    return 'El campo tipo debe ser "diaria" o "evento"';
  }
  if (tipo === 'evento') {
    if (!body.eventos_id)         return 'eventos_id es requerido para tipo evento';
    if (!body.empleado_evento_id) return 'empleado_evento_id es requerido para tipo evento';
  }
  if (tipo === 'diaria') {
    if (body.eventos_id || body.empleado_evento_id) {
      return 'eventos_id y empleado_evento_id no aplican para tipo diaria';
    }
  }
  return null;
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
const registrarEntrada = async (req, res) => {
  try {
    const empleado_id = req.user.id;
    const { tipo, eventos_id, empleado_evento_id, latitud_registro, longitud_registro } = req.body;

    // 1. Validar campos por tipo
    const errorTipo = validarCamposPorTipo(tipo, req.body);
    if (errorTipo) return res.status(400).json({ error: errorTipo });

    // 2. Verificar si ya tiene una asistencia activa
    const activa = await Asistencia.findOne({
      where: { empleado_id, hora_salida: null },
      order: [['id', 'DESC']]
    });
    if (activa) {
      return res.status(400).json({ 
        error: 'Ya tienes una asistencia activa, debes registrar tu salida primero',
        asistencia_activa: activa  // devuelves el registro para que el frontend lo use
      });
    }

    // 3. Obtener lugar correspondiente
    const { lugar, error: errorLugar } = await obtenerLugar(tipo, req.body, empleado_id);
    if (errorLugar) return res.status(400).json({ error: errorLugar });

    // 4. Validar que está dentro del radio
    const errorUbicacion = validarUbicacion(lugar, latitud_registro, longitud_registro);
    if (errorUbicacion) return res.status(400).json({ error: errorUbicacion });

    // 5. Registrar entrada
    const asistencia = await Asistencia.create({
      empleado_id,
      tipo,
      eventos_id:         tipo === 'evento' ? eventos_id         : null,
      empleado_evento_id: tipo === 'evento' ? empleado_evento_id : null,
      hora_entrada:       new Date(),
      latitud_registro:   latitud_registro  ?? null,
      longitud_registro:  longitud_registro ?? null
    });

    res.status(201).json(asistencia);
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar entrada', detalle: err.message });
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
    const empleado_id = req.user.id;

    // 1. Verificar que tiene una asistencia activa
    const asistencia = await Asistencia.findOne({
      where: { empleado_id, hora_salida: null },
      order: [['id', 'DESC']]
    });

    if (!asistencia) {
      return res.status(400).json({ error: 'No tienes una asistencia activa para registrar salida' });
    }

    const { latitud_registro, longitud_registro } = req.body;

    // 2. Obtener lugar correspondiente
    const { lugar, error: errorLugar } = await obtenerLugar(
      asistencia.tipo,
      { eventos_id: asistencia.eventos_id },
      asistencia.empleado_id
    );
    if (errorLugar) return res.status(400).json({ error: errorLugar });

    // 3. Validar que está dentro del radio
    const errorUbicacion = validarUbicacion(lugar, latitud_registro, longitud_registro);
    if (errorUbicacion) return res.status(400).json({ error: errorUbicacion });

    // 4. Registrar salida
    await asistencia.update({
      hora_salida: new Date(),
      ...(latitud_registro  != null && { latitud_registro }),
      ...(longitud_registro != null && { longitud_registro })
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