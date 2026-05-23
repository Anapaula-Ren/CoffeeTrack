const reportesModel = require('../models/reportesModel');

module.exports = {

  obtenerTopProductos: async (inicio, fin) => {

    if (!inicio || !fin) {
      throw new Error("Debes proporcionar fecha de inicio y fecha de fin.");
    }

    if (new Date(inicio) > new Date(fin)) {
      throw new Error("La fecha de inicio no puede ser mayor que la fecha final.");
    }

    return await reportesModel.obtenerTopProductos(inicio, fin);
  }

};