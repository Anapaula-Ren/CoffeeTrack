const menuModel = require('../models/menuModel');

module.exports = {

  obtenerMenu: async () => {
    const menu = await menuModel.obtenerMenu();
    return menu;
  },

  obtenerCategorias: async () => {
    const categorias = await menuModel.obtenerCategorias();
    return categorias;
  }

};