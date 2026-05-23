const menuService = require('../services/menuService');

module.exports = {

  getMenu: async (req, res) => {
    try {
      const menu = await menuService.obtenerMenu();
      res.json(menu);
    } catch (error) {
      console.error("Error al obtener el menú:", error);
      res.status(500).json({ error: "Error interno del servidor al obtener el menú" });
    }
  },

  getCategorias: async (req, res) => {
    try {
      const categorias = await menuService.obtenerCategorias();
      res.json(categorias);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      res.status(500).json({ error: "Error al obtener categorías" });
    }
  }

};