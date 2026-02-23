const express = require('express');
const router = express.Router();
const empleadoController = require('../controllers/empleadoController');

console.log('empleadoController keys:', Object.keys(empleadoController || {}));

router.post('/login-empleado', empleadoController.loginEmpleado);

router.get('/', empleadoController.obtenerEmpleados);
router.get('/:id', empleadoController.obtenerEmpleadoPorId);
router.post('/', empleadoController.crearEmpleado);
router.put('/:id', empleadoController.actualizarEmpleado);
router.patch('/:id/lugar', empleadoController.actualizarLugar);
router.delete('/:id', empleadoController.eliminarEmpleado);

module.exports = router;
