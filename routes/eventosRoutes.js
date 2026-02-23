const { Router } = require('express');
const router = Router();
const ctrl = require('../controllers/eventoController');

router.get('/',      ctrl.listarEventos);
router.get('/:id',   ctrl.obtenerEvento);
router.post('/',     ctrl.crearEvento);
router.put('/:id',   ctrl.actualizarEvento);
router.delete('/:id', ctrl.eliminarEvento);

module.exports = router;