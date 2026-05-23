const usuariosService = require('../services/usuariosService');

module.exports = {

  getUsuarios: async (req, res) => {
    try {
      const usuarios = await usuariosService.obtenerUsuarios();
      res.json({ success: true, usuarios });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  crearUsuario: async (req, res) => {
    try {
      const data = req.body;
      const result = await usuariosService.crearUsuario(data);

      res.json({
        success: true,
        id: result.idUsuario,
        message: "Usuario creado exitosamente."
      });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  actualizarUsuario: async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;

      await usuariosService.actualizarUsuario(id, data);

      res.json({ success: true, message: "Usuario actualizado correctamente." });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  eliminarUsuario: async (req, res) => {
    try {
      const { id } = req.params;
      await usuariosService.eliminarUsuario(id);

      res.json({ success: true, message: "Usuario eliminado correctamente." });

    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

};