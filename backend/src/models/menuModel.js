const InventarioModel = require('./inventarioModel');
const { Producto, Categoria } = InventarioModel.models;

class MenuModel {
  static async obtenerMenu() {
    return await Producto.findAll({
      include: {
        model: Categoria,
        required: true
      },
      order: [
        [Categoria, 'Nombre', 'ASC'],
        ['Nombre', 'ASC']
      ]
    });
  }

  static async obtenerCategorias() {
    return await Categoria.findAll();
  }
}

module.exports = MenuModel;
