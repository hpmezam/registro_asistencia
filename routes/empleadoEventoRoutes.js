// routes/empleadoEventoRoutes.js
const { Router } = require('express');
const router = Router();
const ctrl = require('../controllers/empleadoEventoController');

// 📌 CRUD
router.get('/', ctrl.listarTodas);
router.get('/empleado/:empleado_id', ctrl.listarPorEmpleado);
router.get('/evento/:evento_id', ctrl.listarPorEvento);
router.get('/:id', ctrl.obtener);
router.post('/', ctrl.crear);
router.delete('/:id', ctrl.eliminar);

module.exports = router;