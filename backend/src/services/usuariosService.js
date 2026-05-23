const usuariosModel = require('../models/usuariosModel');

module.exports = {

  obtenerUsuarios: async () => {
    return await usuariosModel.obtenerUsuarios();
  },

  crearUsuario: async (data) => {
    const { correo } = data;

    const existente = await usuariosModel.buscarPorCorreo(correo);
    if (existente) {
      throw new Error("El correo ya está registrado.");
    }

    const idUsuario = await usuariosModel.insertarUsuario(data);
    return { idUsuario };
  },

  actualizarUsuario: async (id, data) =>
    await usuariosModel.actualizarUsuario(id, data),

  eliminarUsuario: async (id) =>
    await usuariosModel.eliminarUsuario(id)

};