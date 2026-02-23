const { Router } = require('express');
const router = Router();
const ctrl = require('../controllers/cargoController');

router.get('/', ctrl.obtenerCargos);
router.get('/:id', ctrl.obtenerCargoPorId);
router.post('/', ctrl.crearCargo);
router.put('/:id', ctrl.actualizarCargo);
router.delete('/:id', ctrl.eliminarCargo);

module.exports = router;