const inventarioStockModel = require('../models/inventarioStockModel');

class InventarioStockService {
  async obtenerProducto(id) {
    return await inventarioStockModel.obtenerProducto(id);
  }

  async actualizarProducto(id, cantidad) {
    return await inventarioStockModel.actualizarProducto(id, cantidad);
  }

  async obtenerProductosPorCategoria(idCategoria) {
    return await inventarioStockModel.obtenerProductosPorCategoria(idCategoria);
  }

  async obtenerCategorias() {
    return await inventarioStockModel.obtenerCategorias();
  }

  async crearProducto(data) {
    return await inventarioStockModel.crearProducto(data);
  }

  async eliminarProducto(id) {
    return await inventarioStockModel.eliminarProducto(id);
  }

  async obtenerStatusDB() {
    return await inventarioStockModel.obtenerStatusDB();
  }

  async obtenerInventarioCompleto() {
    return await inventarioStockModel.obtenerInventarioCompleto();
  }

  async obtenerStockCritico() {
    return await inventarioStockModel.obtenerStockCritico();
  }

  async obtenerStockBajo() {
    return await inventarioStockModel.obtenerStockBajo();
  }
}

module.exports = new InventarioStockService();
