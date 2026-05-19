require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Bases de datos

app.use(express.json());
app.use(cors());

// Rutas
app.use('/api', (req, res) => {
  res.json({ message: 'API base funcionando' });
});

app.listen(PORT, () => {
  console.log(`Servidor Express iniciado en: http://localhost:${PORT}`);
  console.log('¡Tu API está lista para recibir peticiones del frontend!');
});