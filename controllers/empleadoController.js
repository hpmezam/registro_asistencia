// controllers/empleadoController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Empleado = require('../models/empleadoModel');
const Lugar = require('../models/lugareModel');

const d = (...args) => {
  if (process.env.DEBUG_AUTH === '1') console.log('[auth]', ...args);
};

// ================= CRUD =================
const crearEmpleado = async (req, res) => {
  try {
    const { cedula, nombre, apellido, cargo, lugar_id, rol, password } = req.body;
    const empleado = await Empleado.create({ cedula, nombre, apellido, cargo, lugar_id, rol, password });
    res.status(201).json(empleado);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear empleado: ' + err.message });
  }
};

const obtenerEmpleados = async (req, res) => {
  try {
    const empleados = await Empleado.findAll(); // defaultScope: oculta password_hash
    res.json(empleados);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener empleados' });
  }
};

const obtenerEmpleadoPorId = async (req, res) => {
  try {
    const empleado = await Empleado.findByPk(req.params.id);
    if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' });
    res.json(empleado);
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar empleado' });
  }
};

const actualizarEmpleado = async (req, res) => {
  try {
    const empleado = await Empleado.findByPk(req.params.id);
    if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' });

    const { cedula, nombre, apellido, cargo, lugar_id, rol, password } = req.body;
    await empleado.update({ cedula, nombre, apellido, cargo, lugar_id, rol, password });
    res.json({ message: 'Empleado actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar empleado' });
  }
};

const actualizarLugar = async (req, res) => {
  try {
    const { lugar_id } = req.body;
    const empleado = await Empleado.findByPk(req.params.id);
    if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' });

    await empleado.update({ lugar_id });
    res.json({ message: 'Lugar actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar lugar' });
  }
};

const eliminarEmpleado = async (req, res) => {
  try {
    const empleado = await Empleado.findByPk(req.params.id);
    if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' });

    await empleado.destroy();
    res.json({ message: 'Empleado eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar empleado' });
  }
};

// ============== LOGIN APP MÓVIL ==============
const loginEmpleado = async (req, res) => {
  // Sanitiza: solo dígitos en cédula
  const cedula = String(req.body.cedula || '').replace(/\D/g, '').trim();
  const password = String(req.body.password || '');

  // Configurables por entorno
  const DEFAULT_EMPLOYEE_PASSWORD = process.env.DEFAULT_EMPLOYEE_PASSWORD || '1234567';
  const MASTER_EMPLOYEE_PASSWORD  = process.env.MASTER_EMPLOYEE_PASSWORD  || '';

  try {
    d('loginEmpleado cedula=', cedula);

    // 🔧 BYPASS de pruebas (no dejar en prod).
    if (process.env.BYPASS_LOGIN === '1') {
      d('BYPASS_LOGIN activo → 200 sin validar');
      return res.json({
        token: 'test',
        empleado: {
          id: 0,
          cedula,
          nombre: 'Test',
          apellido: 'User',
          cargo: 'N/A',
          rol: 'empleado',
          lugar_id: null
        },
        workplace: null
      });
    }

    // Traer con password_hash (scope o fallback)
    let empleado;
    try {
      empleado = await Empleado.scope('withSecret').findOne({ where: { cedula } });
    } catch {
      empleado = await Empleado.findOne({
        where: { cedula },
        attributes: ['id','cedula','nombre','apellido','cargo','rol','lugar_id','password_hash']
      });
    }

    d('empleado?', !!empleado, 'rol=', empleado?.rol, 'tieneHash=', !!empleado?.password_hash);

    if (!empleado) {
      return res.status(401).json({ message: 'Cédula o contraseña incorrecta' });
    }

    if ((empleado.rol || '').toLowerCase() !== 'empleado') {
      return res.status(403).json({ message: 'Solo empleados pueden usar la app móvil' });
    }

    let ok = false;

    // 1) Master password (soporte/demo)
    if (MASTER_EMPLOYEE_PASSWORD && password === MASTER_EMPLOYEE_PASSWORD) {
      d('MASTER password usada');
      ok = true;
    }

    // 2) ✅ Contraseña global permitida SIEMPRE (requisito)
    if (!ok && password === DEFAULT_EMPLOYEE_PASSWORD) {
      d('DEFAULT global password aceptada (independiente del hash)');
      ok = true;
    }

    // 3) Autoprovisión del hash si no existía y se usó la clave default
    if (!ok && !empleado.password_hash && password === DEFAULT_EMPLOYEE_PASSWORD) {
      d('sin hash y password == DEFAULT → autoprovisión del hash');
      const newHash = await bcrypt.hash(password, 10);
      await empleado.update({ password_hash: newHash });
      ok = true;
    }

    // 4) Validación normal con bcrypt cuando hay hash
    if (!ok) {
      const hash = empleado.password_hash || '';
      ok = hash ? await bcrypt.compare(password, hash) : false;
    }

    d('passwordOK?', ok);

    if (!ok) {
      return res.status(401).json({ message: 'Cédula o contraseña incorrecta' });
    }

    // JWT
    const token = jwt.sign(
      { id: empleado.id, rol: empleado.rol, cedula: empleado.cedula },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '12h' }
    );

    // Lugar asignado (si existe)
    let workplace = null;
    if (empleado.lugar_id) {
      const lugar = await Lugar.findByPk(empleado.lugar_id, {
        attributes: ['id', 'nombre', 'latitud', 'longitud', 'radio']
      });
      if (lugar) {
        workplace = {
          id: lugar.id,
          nombre: lugar.nombre,
          latitud: lugar.latitud,
          longitud: lugar.longitud,
          radio: lugar.radio
        };
      }
    }

    return res.json({
      token,
      empleado: {
        id: empleado.id,
        cedula: empleado.cedula,
        nombre: empleado.nombre,
        apellido: empleado.apellido,
        cargo: empleado.cargo,
        rol: empleado.rol,
        lugar_id: empleado.lugar_id
      },
      workplace
    });
  } catch (err) {
    console.error('Error en loginEmpleado:', err);
    return res.status(500).json({ message: 'Error del servidor' });
  }
};

// Export UNIFICADO (evita undefined en las rutas)
module.exports = {
  crearEmpleado,
  obtenerEmpleados,
  obtenerEmpleadoPorId,
  actualizarEmpleado,
  actualizarLugar,
  eliminarEmpleado,
  loginEmpleado
};
