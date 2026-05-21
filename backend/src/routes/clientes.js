const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');

router.get('/buscar', clientesController.buscarClientes);
router.post('/', clientesController.crearCliente);

module.exports = router;