const model = require('../models/inventarioStockModel');

module.exports = {
  obtenerProducto: async (id) => {
    return await model.obtenerProducto(id);
  },

  actualizarProducto: async (id, cantidad) => {
    await model.actualizarCantidad(id, cantidad);
    return await model.obtenerProducto(id);
  },

  obtenerCategorias: async () => {
    return await model.obtenerCategorias();
  },

  obtenerProductosPorCategoria: async (idCategoria) => {
    return await model.obtenerProductosPorCategoria(idCategoria);
  },

  crearProducto: async (data) => {
    return await model.crearProducto(data);
  },

  eliminarProducto: async (id) => {
    return await model.eliminarProducto(id);
  },

  obtenerInventarioCompleto: async () => {
    return await model.obtenerInventarioCompleto();
  },

  obtenerStockCritico: async () => {
    return await model.obtenerStockCritico();
  },

  obtenerStockBajo: async () => {
    return await model.obtenerStockBajo();
  }
};