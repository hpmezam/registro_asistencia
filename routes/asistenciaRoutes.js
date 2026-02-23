const express = require('express');
const router = express.Router();
const asistenciaController = require('../controllers/asistenciaController');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/authz');

// ── Rutas estáticas primero (antes que /:id) ──
router.post('/entrada',  auth, asistenciaController.registrarEntrada);
router.put('/salida',    auth, asistenciaController.registrarSalida);   // ← sin :id
router.get('/activa',    auth, asistenciaController.asistenciaActiva);
router.get('/mis',       auth, asistenciaController.misAsistencias);
router.get('/rango',     auth, asistenciaController.obtenerAsistenciasRango);
router.get('/resumen',   auth, asistenciaController.resumenAsistencias);
router.get('/',          auth, asistenciaController.obtenerAsistencias);

// ── Rutas dinámicas al final ──
router.get('/:id',       auth, asistenciaController.obtenerAsistenciaPorId);
router.delete('/:id',    auth, requireRole(1), asistenciaController.eliminarAsistencia);

module.exports = router;