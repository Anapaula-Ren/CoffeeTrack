const usuariosService = require('../services/usuariosService');

class UsuariosController {
  async getUsuarios(req, res, next) {
    try {
      const usuarios = await usuariosService.obtenerUsuarios();
      res.json(usuarios);
    } catch (error) {
      next(error);
    }
  }

  async crearUsuario(req, res, next) {
    const { nombre, correo, contrasena, rol } = req.body;
    try {
      const id = await usuariosService.crearUsuario({ nombre, correo, contrasena, rol });
      res.json({
        success: true,
        id,
        message: 'Usuario creado exitosamente.'
      });
    } catch (error) {
      next(error);
    }
  }

  async actualizarUsuario(req, res, next) {
    const { id } = req.params;
    const { nombre, correo, rol } = req.body;
    try {
      await usuariosService.actualizarUsuario(id, { nombre, correo, rol });
      res.json({ success: true, message: 'Usuario actualizado correctamente.' });
    } catch (error) {
      next(error);
    }
  }

  async eliminarUsuario(req, res, next) {
    const { id } = req.params;
    try {
      await usuariosService.eliminarUsuario(id);
      res.json({ success: true, message: 'Usuario eliminado correctamente.' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UsuariosController();
