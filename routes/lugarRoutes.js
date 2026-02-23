const express = require('express'); 
const router = express.Router();
const lugarController = require('../controllers/lugarController');
const fetch = require('node-fetch');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/authz');

// Solo autenticado
router.get('/', auth, lugarController.obtenerLugares);

// Solo Admin
router.post('/',      auth, requireRole(1), lugarController.crearLugar);
router.put('/:id',    auth, requireRole(1), lugarController.actualizarLugar);
router.delete('/:id', auth, requireRole(1), lugarController.eliminarLugar);

// ✅ Pública — proxy Nominatim (no necesita auth)
router.get('/nominatim', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'Latitud y longitud son requeridas' });

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`, {
      headers: { 'User-Agent': 'miapp@ejemplo.com' }
    });
    if (!response.ok) throw new Error('Error al comunicarse con Nominatim');
    const data = await response.json();
    const name = data.name || data.address?.road || data.address?.neighbourhood || 'Sin nombre';
    const display_name = data.display_name || 'Sin dirección';
    res.json({ name, display_name });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener datos de Nominatim' });
  }
});

module.exports = router;