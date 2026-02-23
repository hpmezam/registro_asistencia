const jwt = require('jsonwebtoken');
const Empleado = require('../models/empleadoModel');
const Rol = require('../models/rolModel');
const Cargo = require('../models/cargoModel');


// ================= CREAR =================
const crearEmpleado = async (req, res) => {
  try {
    const {
      cedula,
      nombre,
      apellido,
      email,
      password,
      rol_id,
      cargo_id
    } = req.body;

    const empleado = await Empleado.create({
      cedula,
      nombre,
      apellido,
      email,
      rol_id,
      cargo_id,
      create_at: new Date()
    });

    if (password) {
      await empleado.setPassword(password);
      await empleado.save();
    }

    res.status(201).json(empleado);

  } catch (err) {
    res.status(500).json({
      error: 'Error al crear empleado',
      detalle: err.message
    });
  }
};


// ================= LISTAR =================
const obtenerEmpleados = async (_req, res) => {
  try {
    const empleados = await Empleado.findAll();
    res.json(empleados);
  } catch (err) {
    console.error('ERROR REAL:', err); 
    res.status(500).json({
      error: 'Error al obtener empleados',
      detalle: err.message
    });
  }
};


// ================= OBTENER POR ID =================
const obtenerEmpleadoPorId = async (req, res) => {
  try {
    const empleado = await Empleado.findByPk(req.params.id, {
      include: [Rol, Cargo]
    });

    if (!empleado) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    res.json(empleado);
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar empleado' });
  }
};


// ================= ACTUALIZAR =================
const actualizarEmpleado = async (req, res) => {
  try {
    const empleado = await Empleado.scope('withPassword').findByPk(req.params.id);

    if (!empleado) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    const {
      cedula,
      nombre,
      apellido,
      email,
      rol_id,
      cargo_id,
      password
    } = req.body;

    await empleado.update({
      cedula,
      nombre,
      apellido,
      email,
      rol_id,
      cargo_id
    });

    if (password) {
      await empleado.setPassword(password);
      await empleado.save();
    }

    res.json({ message: 'Empleado actualizado correctamente' });

  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar empleado' });
  }
};


// ================= ELIMINAR =================
const eliminarEmpleado = async (req, res) => {
  try {
    const empleado = await Empleado.findByPk(req.params.id);

    if (!empleado) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    await empleado.destroy();

    res.json({ message: 'Empleado eliminado correctamente' });

  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar empleado' });
  }
};


// ================= LOGIN =================
const loginEmpleado = async (req, res) => {
  try {
    const { cedula, password } = req.body;

    const empleado = await Empleado.scope('withPassword').findOne({
      where: { cedula },
      include: [Rol, Cargo]
    });

    if (!empleado) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const passwordOK = await empleado.validatePassword(password);

    if (!passwordOK) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      {
        id: empleado.id,
        rol_id: empleado.rol_id
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '12h' }
    );

    res.json({
      token,
      empleado
    });

  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};


module.exports = {
  crearEmpleado,
  obtenerEmpleados,
  obtenerEmpleadoPorId,
  actualizarEmpleado,
  eliminarEmpleado,
  loginEmpleado
};