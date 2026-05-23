const express = require('express');
const router = express.Router();

const inventarioController = require('../controllers/inventarioController');
const inventarioMiddleware = require('../middleware/inventarioMiddleware');

router.get('/bebidas', inventarioController.getBebidas);
router.get('/insumos', inventarioController.obtenerInsumos);
router.put('/:id/stock', inventarioMiddleware.validarActualizacionStock, inventarioController.actualizarStock);
router.post('/', inventarioMiddleware.validarNuevoProducto, inventarioController.crearProducto);
router.post('/productos-con-receta', inventarioController.crearProductoConReceta);
router.post('/orden', inventarioMiddleware.validarOrdenCompra, inventarioController.enviarOrdenCompra);

module.exports = router;