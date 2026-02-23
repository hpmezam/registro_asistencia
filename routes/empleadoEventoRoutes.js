// routes/empleadoRoutes.js
const { Router } = require('express');
const router = Router();
const ctrl = require('../controllers/empleadoController');

// 🔐 Login
router.post('/login', ctrl.loginEmpleado);

// 📌 CRUD
router.get('/', ctrl.obtenerEmpleados);
router.get('/:id', ctrl.obtenerEmpleadoPorId);
router.post('/', ctrl.crearEmpleado);
router.put('/:id', ctrl.actualizarEmpleado);
router.delete('/:id', ctrl.eliminarEmpleado);

module.exports = router;