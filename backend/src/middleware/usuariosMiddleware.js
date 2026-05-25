module.exports = {

  validarCrearUsuario: (req, res, next) => {
    const { nombre, correo, contrasena, rol } = req.body;

    if (!nombre || !correo || !contrasena || !rol) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son obligatorios."
      });
    }

    next();
  },

  validarActualizarUsuario: (req, res, next) => {
    const { nombre, correo, rol } = req.body;

    if (!nombre || !correo || !rol) {
      return res.status(400).json({
        success: false,
        message: "Nombre, correo y rol son obligatorios."
      });
    }

    next();
  }

};
