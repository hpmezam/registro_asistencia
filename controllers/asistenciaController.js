// Backend/controllers/asistenciaController.js
const dayjs = require('dayjs');
const Asistencia = require('../models/asistencia');

// helper: convierte a número o undefined
const toNum = (v) => (v === '' || v === null || typeof v === 'undefined') ? undefined : Number(v);

exports.registrarAsistencia = async (req, res) => {
  try {
    let { user_id, workplace_id, latitud, longitud, tipo } = req.body || {};

    // normalizar posibles strings
    user_id = Number(user_id);
    workplace_id = Number(workplace_id);
    latitud = toNum(latitud);
    longitud = toNum(longitud);
    tipo = tipo ? String(tipo).toLowerCase() : undefined;

    if (!user_id || !workplace_id || typeof latitud === 'undefined' || typeof longitud === 'undefined') {
      return res.status(400).json({ ok: false, msg: 'Faltan campos requeridos', body: req.body });
    }

    const hoy = dayjs().format('YYYY-MM-DD');
    const ahora = dayjs().format('HH:mm:ss');

    let registro = await Asistencia.findOne({ where: { user_id, fecha: hoy } });

    // si no existe el registro del día → crear con hora_entrada
    if (!registro) {
      registro = await Asistencia.create({
        user_id,
        workplace_id,
        fecha: hoy,
        hora_entrada: ahora,
        latitud,
        longitud,
      });
      return res.json({ ok: true, accion: 'entrada', estadoRegistro: 'creado', data: registro });
    }

    // si no viene "tipo", decidir automáticamente
    if (!tipo) {
      tipo = registro.hora_entrada ? 'salida' : 'entrada';
    }

    if (tipo === 'entrada') {
      registro.hora_entrada = ahora;          // si ya tenía valor, lo actualiza (comportamiento previo)
      registro.latitud = latitud;
      registro.longitud = longitud;
      await registro.save();
      return res.json({ ok: true, accion: 'entrada', estadoRegistro: registro.hora_salida ? 'actualizado' : 'completado', data: registro });
    }

    // salida
    if (registro.hora_salida) {
      // ya tenía salida registrada: no sobreescribimos
      return res.json({ ok: true, accion: 'salida', estadoRegistro: 'ya_registrada', data: registro });
    }

    registro.hora_salida = ahora;
    registro.latitud = latitud;
    registro.longitud = longitud;
    await registro.save();

    return res.json({ ok: true, accion: 'salida', estadoRegistro: 'completado', data: registro });

  } catch (err) {
    console.error('registrarAsistencia error:', err);
    return res.status(500).json({ ok: false, msg: 'Error servidor', error: String(err) });
  }
};
