const { getPool, sql } = require('../config/sql.js');

module.exports = {

  obtenerMenu: async () => {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT 
        p.IdProducto, 
        p.Nombre, 
        p.Descripcion, 
        p.Precio, 
        p.Stock, 
        p.ImagenUrl, 
        c.Nombre AS Categoria
      FROM cafeteriadb.Productos p
      JOIN cafeteriadb.Categorias c ON p.IdCategoria = c.IdCategoria
      ORDER BY c.Nombre, p.Nombre
    `);

    return result.recordset;
  },

  obtenerCategorias: async () => {
    const pool = await getPool();
    const result = await pool.request()
      .query(`SELECT * FROM cafeteriadb.Categorias`);
    
    return result.recordset;
  }

};