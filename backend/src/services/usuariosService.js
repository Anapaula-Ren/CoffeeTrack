const bcrypt = require('bcrypt');
const usuariosModel = require('../models/usuariosModel');
const { AppError } = require('../middleware/errorHandler');

class UsuariosService {
  async obtenerUsuarios() {
    return await usuariosModel.obtenerUsuarios();
  }

  async crearUsuario({ nombre, correo, contrasena, rol }) {
    const existente = await usuariosModel.buscarPorCorreo(correo);
    if (existente) {
      throw new AppError('El correo ya está registrado.', 400);
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(contrasena, saltRounds);

    return await usuariosModel.insertarUsuario({
      nombre,
      correo,
      contrasena: hashedPassword,
      rol
    });
  }

  async actualizarUsuario(id, data) {
    return await usuariosModel.actualizarUsuario(id, data);
  }

  async eliminarUsuario(id) {
    return await usuariosModel.eliminarUsuario(id);
  }
}

module.exports = new UsuariosService();
