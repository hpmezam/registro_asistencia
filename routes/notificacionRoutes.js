const { Router } = require('express');
const router = Router();
const ctrl = require('../controllers/notificacionController');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/authz');

// Empleado registra/borra su propio token
router.patch('/empleados/:id/device-token',  auth, ctrl.guardarToken);
router.delete('/empleados/:id/device-token', auth, ctrl.borrarToken);

// Solo Admin puede enviar
router.post('/',          auth, requireRole(1), ctrl.enviarNotificaciones);
router.post('/broadcast', auth, requireRole(1), ctrl.enviarBroadcast);

// Solo autenticado
router.get('/tokens/stats', auth, ctrl.tokensStats);
router.get('/listado',      auth, ctrl.listarNotificaciones);

module.exports = router;