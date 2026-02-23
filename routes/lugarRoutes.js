const express = require('express'); 
const router = express.Router();
const lugarController = require('../controllers/lugarController');
const fetch = require('node-fetch');

// Obtener todos los lugares (ej. para mostrar en mapa)
router.get('/', lugarController.obtenerLugares);

// Crear un nuevo lugar con ubicación GPS
router.post('/', lugarController.crearLugar);

// Actualizar un lugar por ID
router.put('/:id', lugarController.actualizarLugar);
// Eliminar un lugar por ID
router.delete('/:id', lugarController.eliminarLugar);

// Ruta adicional: proxy a Nominatim para geocodificación inversa
router.get('/nominatim', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitud y longitud son requeridas' });
  }

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`, {
      headers: {
        'User-Agent': 'miapp@ejemplo.com' // Puedes cambiar esto por tu correo real
      }
    });

    if (!response.ok) {
      throw new Error('Error al comunicarse con Nominatim');
    }

    const data = await response.json();

    // Extraer nombre y dirección amigable
    const name = data.name || data.address?.road || data.address?.neighbourhood || 'Sin nombre';
    const display_name = data.display_name || 'Sin dirección';

    res.json({ name, display_name });
  } catch (err) {
    console.error('Error en proxy Nominatim:', err);
    res.status(500).json({ error: 'Error al obtener datos de Nominatim' });
  }
});

module.exports = router;
