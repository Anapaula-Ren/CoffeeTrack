const { getPool, sql } = require('../config/sql.js');

module.exports = {

  obtenerBebidas: async () => {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT p.IdProducto, p.Nombre, p.Descripcion, p.Precio, p.Stock, p.ImagenUrl
      FROM cafeteriadb.Productos p
      JOIN cafeteriadb.Categorias c ON p.IdCategoria = c.IdCategoria
      WHERE c.Nombre = 'Bebidas'
      ORDER BY p.Nombre
    `);
    return result.recordset;
  },

  actualizarStock: async (id, stock) => {
    const pool = await getPool();
    await pool.request()
      .input('stock', sql.Int, stock)
      .input('id', sql.Int, id)
      .query(`
        UPDATE cafeteriadb.Productos
        SET Stock = @stock
        WHERE IdProducto = @id
      `);
  },

  crearProducto: async (data) => {
    const { Nombre, Descripcion, Precio, Stock, IdCategoria, Imagen } = data;

    const pool = await getPool();
    const result = await pool.request()
      .input('Nombre', sql.NVarChar, Nombre)
      .input('Descripcion', sql.NVarChar, Descripcion)
      .input('Precio', sql.Decimal, Precio)
      .input('Stock', sql.Int, Stock)
      .input('IdCategoria', sql.Int, IdCategoria)
      .input('Imagen', sql.NVarChar, Imagen)
      .query(`
        INSERT INTO cafeteriadb.Productos (Nombre, Descripcion, Precio, Stock, IdCategoria, ImagenUrl)
        OUTPUT INSERTED.IdProducto
        VALUES (@Nombre, @Descripcion, @Precio, @Stock, @IdCategoria, @Imagen)
      `);

    return result.recordset[0].IdProducto;
  },

  obtenerInsumos: async () => {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT IdInventario, NombreProducto, CantidadDisponible, UnidadMedida
      FROM cafeteriadb.Inventario
      ORDER BY NombreProducto
    `);
    return result.recordset;
  },

  crearProductoConReceta: async (data) => {
    const { Nombre, Descripcion, Precio, Stock, IdCategoria, Imagen } = data;

    const pool = await getPool();
    const result = await pool.request()
      .input('Nombre', sql.NVarChar, Nombre)
      .input('Descripcion', sql.NVarChar, Descripcion)
      .input('Precio', sql.Decimal, Precio)
      .input('Stock', sql.Int, Stock)
      .input('IdCategoria', sql.Int, IdCategoria)
      .input('Imagen', sql.NVarChar, Imagen)
      .query(`
        INSERT INTO cafeteriadb.Productos (Nombre, Descripcion, Precio, Stock, IdCategoria, ImagenUrl)
        OUTPUT INSERTED.IdProducto
        VALUES (@Nombre, @Descripcion, @Precio, @Stock, @IdCategoria, @Imagen)
      `);

    return result.recordset[0].IdProducto;
  },

  guardarReceta: async (idProducto, receta) => {
    const pool = await getPool();

    for (const item of receta) {
      await pool.request()
        .input('IdProducto', sql.Int, idProducto)
        .input('IdInventario', sql.Int, item.IdInventario)
        .input('CantidadInsumo', sql.Decimal, item.CantidadInsumo)
        .query(`
          INSERT INTO cafeteriadb.ProductosRecetas (IdProducto, IdInventario, CantidadInsumo)
          VALUES (@IdProducto, @IdInventario, @CantidadInsumo)
        `);
    }
  }

};