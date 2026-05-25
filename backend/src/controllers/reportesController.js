const reportesService = require('../services/reportesService');

class ReportesController {
  async getTopProductos(req, res, next) {
    const { inicio, fin } = req.body;
    try {
      const top = await reportesService.obtenerTopProductos(inicio, fin);
      res.json(top);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportesController();
