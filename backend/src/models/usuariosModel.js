const { getPool, sql } = require('../config/sql.js');

const findByEmail = async (correo) => {
  const pool = await getPool();
  const result = await pool.request()
    .input('correo', sql.NVarChar, correo)
    .query(`
      SELECT TOP 1 *
      FROM cafeteriadb.Usuarios
      WHERE Correo = @correo
    `);

  return result.recordset[0] || null;
};

module.exports = {
  findByEmail,
};

const getUsuarios = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT IdUsuario, Nombre, Correo, Rol 
      FROM cafeteriadb.Usuarios
    `);

    res.json(result.recordset);

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

const crearUsuario = async (req, res) => {
  const { nombre, correo, contrasena, rol } = req.body;

  try {
    const pool = await getPool();

    const existing = await pool.request()
      .input('correo', sql.NVarChar, correo)
      .query(`
        SELECT IdUsuario 
        FROM cafeteriadb.Usuarios 
        WHERE Correo = @correo
      `);

    if (existing.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'El correo ya está registrado.' });
    }

    const result = await pool.request()
      .input('nombre',    sql.NVarChar, nombre)
      .input('correo',    sql.NVarChar, correo)
      .input('contrasena', sql.NVarChar, contrasena)
      .input('rol',       sql.NVarChar, rol)
      .query(`
        INSERT INTO cafeteriadb.Usuarios (Nombre, Correo, Contrasena, Rol)
        OUTPUT INSERTED.IdUsuario
        VALUES (@nombre, @correo, @contrasena, @rol)
      `);

    res.json({
      success: true,
      id:      result.recordset[0].IdUsuario,
      message: 'Usuario creado exitosamente.'
    });

  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ success: false, message: 'Error al crear usuario' });
  }
};

const actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, correo, rol } = req.body;

  try {
    const pool = await getPool();
    await pool.request()
      .input('nombre',  sql.NVarChar, nombre)
      .input('correo',  sql.NVarChar, correo)
      .input('rol',     sql.NVarChar, rol)
      .input('id',      sql.Int,      id)
      .query(`
        UPDATE cafeteriadb.Usuarios 
        SET Nombre = @nombre, Correo = @correo, Rol = @rol
        WHERE IdUsuario = @id
      `);

    res.json({ success: true, message: 'Usuario actualizado correctamente.' });

  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar usuario' });
  }
};

const eliminarUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM cafeteriadb.Usuarios WHERE IdUsuario = @id');

    res.json({ success: true, message: 'Usuario eliminado correctamente.' });

  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar usuario' });
  }
};

module.exports = { findByEmail, getUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario };