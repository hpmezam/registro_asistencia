const Empleado = require('../models/empleadoModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
   try {
    const { cedula } = req.body;

    const empleado = await Empleado.scope('withSecret').findOne({ where: { cedula } });
    if (!empleado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Validar si tiene rol admin
    const rol = empleado.rol?.toLowerCase().trim();

    if (rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado: No tiene permisos de administrador.' });
    }
    const valido= await empleado.validatePassword(req.body.password);
    
    if (!valido) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: empleado.id, rol: empleado.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      mensaje: 'Login exitoso',
      token,
      empleado: {
        cedula: empleado.cedula,
        nombre: empleado.nombre,
        apellido: empleado.apellido,
        rol: empleado.rol,
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
