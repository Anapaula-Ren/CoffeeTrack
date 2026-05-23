const { getPool, sql } = require('../config/sql');

module.exports = {

  obtenerPedidos: async () => {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT * FROM cafeteriadb.Pedidos ORDER BY Fecha DESC
    `);
    return result.recordset;
  },

  obtenerPedidosPendientes: async () => {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT * FROM cafeteriadb.Pedidos WHERE Estado = 'Pendiente'
    `);
    return result.recordset;
  },

  crearPedidoConDetalles: async ({ idCliente, total, idUsuario, productos }) => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      const ivaResult = await transaction.request()
        .input('total', sql.Decimal(10, 2), total)
        .query('SELECT cafeteriadb.CalcularIVA(@total) AS iva');

      const iva = parseFloat(ivaResult.recordset[0].iva);
      const totalConIVA = parseFloat((parseFloat(total) + iva).toFixed(2));

      const pedidoResult = await transaction.request()
        .input('idCliente', sql.Int, idCliente)
        .input('totalConIVA', sql.Decimal(10, 2), totalConIVA)
        .input('idUsuario', sql.Int, idUsuario)
        .query(`
          INSERT INTO cafeteriadb.Pedidos (IdCliente, Total, IdUsuario, Estado)
          OUTPUT INSERTED.IdPedido
          VALUES (@idCliente, @totalConIVA, @idUsuario, 'Pendiente')
        `);

      const idPedido = pedidoResult.recordset[0].IdPedido;

      for (const producto of productos) {
        await transaction.request()
          .input('idPedido', sql.Int, idPedido)
          .input('idProducto', sql.Int, producto.id)
          .input('cantidad', sql.Int, producto.cantidad)
          .input('subtotal', sql.Decimal(10, 2), producto.subtotal)
          .query(`
            INSERT INTO cafeteriadb.DetallePedidos (IdPedido, IdProducto, Cantidad, Subtotal)
            VALUES (@idPedido, @idProducto, @cantidad, @subtotal)
          `);
      }

      await transaction.commit();
      return { idPedido, totalConIVA };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  actualizarEstado: async (idPedido, nuevoEstado) => {
    const pool = await getPool();

    const result = await pool.request()
      .input('idPedido', sql.Int, idPedido)
      .input('estado', sql.VarChar(50), nuevoEstado)
      .query(`
        UPDATE cafeteriadb.Pedidos
        SET Estado = @estado
        WHERE IdPedido = @idPedido
      `);

    return result.rowsAffected;
  }

};