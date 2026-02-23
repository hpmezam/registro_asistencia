const express = require('express');
const router = express.Router();
const asistenciaController = require('../controllers/asistenciaController');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/authz');

// Solo autenticado — empleado registra su propia asistencia
router.post('/entrada',    auth, asistenciaController.registrarEntrada);
router.put('/salida/:id',  auth, asistenciaController.registrarSalida);

// Solo autenticado — consultas
router.get('/',    auth, asistenciaController.obtenerAsistencias);
router.get('/rango',    auth, asistenciaController.obtenerAsistenciasRango);
router.get('/resumen',    auth, asistenciaController.resumenAsistencias);
router.get('/:id', auth, asistenciaController.obtenerAsistenciaPorId);

// Solo Admin — eliminar
router.delete('/:id', auth, requireRole(1), asistenciaController.eliminarAsistencia);

module.exports = router;