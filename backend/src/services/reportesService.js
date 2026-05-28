const reportesModel = require('../models/reportesModel');

class ReportesService {
  async obtenerTopProductos(inicio, fin) {
    return await reportesModel.obtenerTopProductos(inicio, fin);
  }
}

module.exports = new ReportesService();
