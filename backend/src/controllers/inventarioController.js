const inventarioService = require('../services/inventarioService');

module.exports = {

  getBebidas: async (req, res) => {
    try {
      const bebidas = await inventarioService.obtenerBebidas();
      res.json(bebidas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  actualizarStock: async (req, res) => {
    try {
      const { id } = req.params;
      const { stock } = req.body;

      await inventarioService.actualizarStock(id, stock);

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  crearProducto: async (req, res) => {
    try {
      const idProducto = await inventarioService.crearProducto(req.body);
      res.status(201).json({ success: true, id: idProducto });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  obtenerInsumos: async (req, res) => {
    try {
      const insumos = await inventarioService.obtenerInsumos();
      res.json(insumos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  crearProductoConReceta: async (req, res) => {
    try {
      const idProducto = await inventarioService.crearProductoConReceta(req.body);
      res.status(201).json({ success: true, idProducto });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  enviarOrdenCompra: async (req, res) => {
    try {
      await inventarioService.enviarOrdenCompra(req.body);
      res.json({ success: true, message: 'Orden de compra enviada correctamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

};