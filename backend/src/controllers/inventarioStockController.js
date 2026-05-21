const service = require('../services/inventarioStockService');

module.exports = {
  getProducto: async (req, res) => {
    try {
      const producto = await service.obtenerProducto(req.params.id);
      if (!producto) return res.status(404).json({ success: false, message: 'Producto no encontrado' });

      res.json({ success: true, producto });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  actualizarProducto: async (req, res) => {
    try {
      const updated = await service.actualizarProducto(req.params.id, req.body.cantidad);
      res.json({ success: true, updated });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getCategorias: async (req, res) => {
    try {
      const categorias = await service.obtenerCategorias();
    res.json(categorias);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getProductosPorCategoria: async (req, res) => {
    try {
      const productos = await service.obtenerProductosPorCategoria(req.params.idCategoria);
      res.json(productos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  crearProducto: async (req, res) => {
    try {
      const result = await service.crearProducto(req.body);
      res.status(201).json({ success: true, id: result.IdInventario });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  eliminarProducto: async (req, res) => {
    try {
      await service.eliminarProducto(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getInventarioCompleto: async (req, res) => {
    try {
      const data = await service.obtenerInventarioCompleto();
      res.json(data);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getStockCritico: async (req, res) => {
    try {
      const data = await service.obtenerStockCritico();
      res.json(data);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getStockBajo: async (req, res) => {
    try {
      const data = await service.obtenerStockBajo();
      res.json(data);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};