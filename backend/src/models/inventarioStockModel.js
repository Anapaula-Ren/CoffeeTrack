const { getPool, sql } = require('../config/sql.js');

module.exports = {
  obtenerProducto: async (id) => {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT IdInventario, NombreProducto, Cantidad
        FROM cafeteriadb.inventario
        WHERE IdInventario = @id
      `);
    return result.recordset[0] || null;
  },

  actualizarCantidad: async (id, cantidad) => {
    const pool = await getPool();
    return await pool.request()
      .input('cantidad', sql.Decimal(10, 3), cantidad)
      .input('id', sql.Int, id)
      .query(`
        UPDATE cafeteriadb.inventario
        SET Cantidad = @cantidad
        WHERE IdInventario = @id
      `);
  },

  obtenerCategorias: async () => {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT IdCategoriaInventario, Nombre, Descripcion
      FROM cafeteriadb.categorias_inventario
      ORDER BY Nombre
    `);
    return result.recordset;
  },

  obtenerProductosPorCategoria: async (idCategoria) => {
    const pool = await getPool();
    const result = await pool.request()
      .input('idCategoria', sql.Int, idCategoria)
      .query(`
        SELECT i.IdInventario, i.NombreProducto, i.Cantidad, c.Nombre as Categoria
        FROM cafeteriadb.inventario i
        JOIN cafeteriadb.categorias_inventario c 
          ON i.IdCategoriaInventario = c.IdCategoriaInventario
        WHERE i.IdCategoriaInventario = @idCategoria
        ORDER BY i.NombreProducto
      `);

    return result.recordset;
  },

  crearProducto: async (data) => {
    const { IdCategoriaInventario, NombreProducto, Cantidad } = data;
    const pool = await getPool();

    const result = await pool.request()
      .input('IdCategoriaInventario', sql.Int, IdCategoriaInventario)
      .input('NombreProducto', sql.NVarChar, NombreProducto)
      .input('Cantidad', sql.Decimal(10, 3), Cantidad || 0)
      .query(`
        INSERT INTO cafeteriadb.inventario (IdCategoriaInventario, NombreProducto, Cantidad)
        OUTPUT INSERTED.IdInventario
        VALUES (@IdCategoriaInventario, @NombreProducto, @Cantidad)
      `);

    return result.recordset[0];
  },

  eliminarProducto: async (id) => {
    const pool = await getPool();
    return await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM cafeteriadb.inventario WHERE IdInventario = @id');
  },

  obtenerInventarioCompleto: async () => {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT * FROM cafeteriadb.vw_inventario_completo
      ORDER BY Categoria, Nombre
    `);
    return result.recordset;
  },

  obtenerStockCritico: async () => {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT * FROM cafeteriadb.vw_stock_critico
      ORDER BY Cantidad ASC
    `);
    return result.recordset;
  },

  obtenerStockBajo: async () => {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        i.IdInventario as ID,
        i.NombreProducto as Nombre,
        c.Nombre as Categoria,
        i.Cantidad as Cantidad,
        CASE
          WHEN i.Cantidad <= 2 THEN 'CRÍTICO'
          WHEN i.Cantidad <= 5 THEN 'BAJO'
          ELSE 'NORMAL'
        END as Estado
      FROM cafeteriadb.inventario i
      JOIN cafeteriadb.categorias_inventario c ON i.IdCategoriaInventario = c.IdCategoriaInventario
      WHERE i.Cantidad < 5
      ORDER BY i.Cantidad ASC
    `);
    return result.recordset;
  }
};