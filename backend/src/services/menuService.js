const menuModel = require('../models/menuModel');

class MenuService {
  async obtenerMenu() {
    return await menuModel.obtenerMenu();
  }

  async obtenerCategorias() {
    return await menuModel.obtenerCategorias();
  }
}

module.exports = new MenuService();
