const Lugar = require('../models/lugareModel');

// Helper mínimo para sanear el radio
function normalizarRadio(valor) {
  const n = Number(valor);
  if (!Number.isFinite(n)) return 10;   // por defecto
  if (n < 1) return 10;                 // mínimo 1 (mantén tu criterio)
  return Math.floor(n);                 // entero
}

// Obtener todos los lugares (para mostrar en el mapa o lista)
exports.obtenerLugares = async (req, res) => {
  try {
    const lugares = await Lugar.findAll();
    res.json(lugares);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los lugares' });
  }
};

// Crear un nuevo lugar (requiere nombre, ubicación, latitud y longitud)
exports.crearLugar = async (req, res) => {
  try {
    let { nombre, ubicacion, latitud, longitud, descripcion, radio } = req.body;

    // Validación simple (radio NO bloquea la creación; se normaliza)
    if (!nombre || !ubicacion || !latitud || !longitud) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const nuevo = await Lugar.create({
      nombre,
      ubicacion,
      latitud,
      longitud,
      descripcion,
      radio: normalizarRadio(radio) // <- saneo y default
    });

    res.status(201).json(nuevo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Actualizar un lugar existente por ID
exports.actualizarLugar = async (req, res) => {
  const { id } = req.params;
  try {
    const lugar = await Lugar.findByPk(id);
    if (!lugar) {
      return res.status(404).json({ error: 'Lugar no encontrado' });
    }

    // Copia de body y saneo SOLO si viene radio
    const updates = { ...req.body };
    if (Object.prototype.hasOwnProperty.call(updates, 'radio')) {
      updates.radio = normalizarRadio(updates.radio);
    }

    await lugar.update(updates);
    res.json(lugar);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar un lugar por ID
exports.eliminarLugar = async (req, res) => {
  const { id } = req.params;
  try {
    const lugar = await Lugar.findByPk(id);
    if (!lugar) {
      return res.status(404).json({ error: 'Lugar no encontrado' });
    }

    await lugar.destroy();
    res.json({ mensaje: 'Lugar eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
