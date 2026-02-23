const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/empleadoEventoController');

router.get('/', ctrl.listarTodas);
router.get('/evento/:evento_id', ctrl.listarPorEvento);
router.get('/:id', ctrl.obtener);
router.post('/', ctrl.crear);
router.delete('/:id', ctrl.eliminar);

module.exports = router;