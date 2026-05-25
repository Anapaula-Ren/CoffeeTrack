const menuService = require('../services/menuService');

class MenuController {
  async getMenu(req, res, next) {
    try {
      const menu = await menuService.obtenerMenu();
      res.json(menu);
    } catch (error) {
      next(error);
    }
  }

  async getCategorias(req, res, next) {
    try {
      const categorias = await menuService.obtenerCategorias();
      res.json(categorias);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MenuController();
