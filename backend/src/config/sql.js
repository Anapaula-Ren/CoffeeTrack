const sql = require('mssql');

const config = {
  server:   process.env.DB_SERVER,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port:     parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt:                true,
    trustServerCertificate: true
  },
  pool: {
    max:               10,
    min:               0,
    idleTimeoutMillis: 30000
  }
};

let pool;

async function getPool() {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}

async function testDbConnection() {
  try {
    const pool = await getPool();
    await pool.request().query('SELECT 1');
    console.log('¡Conexión a la base de datos SQL Server exitosa!');
  } catch (err) {
    console.error('¡Error al conectar con la base de datos SQL Server!', err.message);
  }
}

module.exports = { getPool, testDbConnection, sql };