// routes/notificacionesroutes.js
const { Router } = require('express');
const router = Router();
const ctrl = require('../controllers/notificacionescontroller');

router.patch('/empleados/:id/device-token', ctrl.guardarToken);
router.delete('/empleados/:id/device-token', ctrl.borrarToken);

router.post('/', ctrl.enviarNotificaciones);
router.post('/broadcast', ctrl.enviarBroadcast);
router.post('/empleados/:id/test', ctrl.enviarTestAEmpleado);

router.get('/tokens/stats', ctrl.tokensStats);
router.get('/listado', ctrl.listarNotificaciones);

module.exports = router;
