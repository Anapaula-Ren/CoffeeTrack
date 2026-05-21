const bcrypt = require('bcrypt');
const usuarioModel = require('../models/usuariosModel');

const login = async (email, password) => {
  const usuario = await usuarioModel.findByEmail(email);

  if (!usuario) {
    throw new Error('Credenciales Inválidas');
  }

  const passwordMatch = await bcrypt.compare(password, usuario.Contrasena);

  if (!passwordMatch) {
    throw new Error('Credenciales Inválidas');
  }

  return {
    IdUsuario: usuario.IdUsuario,
    Nombre: usuario.Nombre,
    Rol: usuario.Rol,
    Correo: usuario.Correo
  };
};

module.exports = { login };