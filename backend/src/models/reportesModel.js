const { sequelize, Sequelize } = require('../config/sql.js');

class ReportesModel {
  static async obtenerTopProductos(inicio, fin) {
    const [result] = await sequelize.query(
      'EXEC cafeteriadb.sp_top_productos @fecha_inicio = :inicio, @fecha_fin = :fin',
      {
        replacements: { inicio, fin }
      }
    );
    return result;
  }
}

module.exports = ReportesModel;
