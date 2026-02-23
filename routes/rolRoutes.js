const { Router } = require('express');
const router = Router();
const ctrl = require('../controllers/rolController');

router.get('/', ctrl.obtenerRoles);
router.get('/:id', ctrl.obtenerRolPorId);
router.post('/', ctrl.crearRol);
router.put('/:id', ctrl.actualizarRol);
router.delete('/:id', ctrl.eliminarRol);

module.exports = router;