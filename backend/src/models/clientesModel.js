const { getPool, sql } = require('../config/sql.js');

const buscarClientes = async (nombre) => {
  const pool = await getPool();
  const result = await pool.request()
    .input('nombre', sql.NVarChar, `%${nombre}%`)
    .query(`
      SELECT * 
      FROM cafeteriadb.Clientes 
      WHERE Nombre LIKE @nombre
    `);

  return result.recordset;
};

const crearCliente = async (nombre, email) => {
  const pool = await getPool();
  const result = await pool.request()
    .input('nombre', sql.NVarChar, nombre)
    .input('email', sql.NVarChar, email || null)
    .query(`
      INSERT INTO cafeteriadb.Clientes (Nombre, Email)
      OUTPUT INSERTED.IdCliente
      VALUES (@nombre, @email)
    `);

  return result.recordset[0]; 
};

module.exports = { buscarClientes, crearCliente };