require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Bases de datos
const { testDbConnection } = require('./config/sql');
const { connectMongo } = require('./config/nosql');

app.use(express.json());
app.use(cors());

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/pedidos', require('./routes/pedidos'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/inventario', require('./routes/inventario'));
app.use('/api/reportes', require('./routes/reportes'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/inventario-stock', require('./routes/inventarioStock'));

app.listen(PORT, () => {
  console.log(`Servidor Express iniciado en: http://localhost:${PORT}`);
  console.log('¡Tu API está lista para recibir peticiones del frontend!');
  testDbConnection();
  connectMongo();
});