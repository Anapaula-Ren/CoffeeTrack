const reportesService = require('../services/reportesService');

module.exports = {

  getTopProductos: async (req, res) => {
    try {
      const { inicio, fin } = req.body;
      const productos = await reportesService.obtenerTopProductos(inicio, fin);
      res.json(productos);
    } catch (error) {
      console.error("Error en reporte top:", error);
      res.status(500).json({ error: error.message });
    }
  }

};