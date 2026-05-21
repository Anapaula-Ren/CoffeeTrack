const { getPool, sql } = require('../config/sql.js');

module.exports = {

  obtenerTopProductos: async (inicio, fin) => {
    const pool = await getPool();

    const result = await pool.request()
      .input('fecha_inicio', sql.Date, inicio)
      .input('fecha_fin', sql.Date, fin)
      .execute('cafeteriadb.sp_top_productos');

    return result.recordset;
  }

};