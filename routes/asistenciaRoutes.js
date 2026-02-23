const express = require('express');
const router = express.Router();
const asistenciaController = require('../controllers/asistenciaController');

router.get('/', asistenciaController.obtenerAsistencias);
router.get('/:id', asistenciaController.obtenerAsistenciaPorId);

router.post('/entrada', asistenciaController.registrarEntrada);
router.put('/salida/:id', asistenciaController.registrarSalida);

router.delete('/:id', asistenciaController.eliminarAsistencia);

module.exports = router;