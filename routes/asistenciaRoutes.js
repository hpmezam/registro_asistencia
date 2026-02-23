const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/asistenciaController');

router.post('/', ctrl.registrarAsistencia);
router.post('/entrada', ctrl.registrarAsistencia);
router.post('/salida', ctrl.registrarAsistencia);
router.post('/checkin', ctrl.registrarAsistencia);

module.exports = router;
