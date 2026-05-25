const bcrypt = require('bcrypt');
const usuariosModel = require('../models/usuariosModel');
const { AppError } = require('../middleware/errorHandler');

class AuthService {
  async login(email, password) {
    const usuario = await usuariosModel.buscarPorCorreo(email);
    if (!usuario) {
      throw new AppError('Credenciales inválidas', 401);
    }

    let passwordMatch = false;

    // 1. Intentar validar usando bcrypt
    try {
      passwordMatch = await bcrypt.compare(password, usuario.Contrasena);
    } catch (error) {
      passwordMatch = false;
    }

    // 2. Si falla bcrypt, intentar texto plano (soporte híbrido)
    if (!passwordMatch) {
      passwordMatch = (password === usuario.Contrasena);
    }

    if (!passwordMatch) {
      throw new AppError('Credenciales inválidas', 401);
    }

    return {
      IdUsuario: usuario.IdUsuario,
      Nombre: usuario.Nombre,
      Rol: usuario.Rol,
      Correo: usuario.Correo
    };
  }
}

module.exports = new AuthService();
