const express = require('express');
const router = express.Router();
const inventarioStockController = require('../controllers/inventarioStockController');

router.get('/status', inventarioStockController.getStatus);
router.get('/categorias', inventarioStockController.getCategorias);
router.get('/stock-bajo', inventarioStockController.getStockBajo);
router.get('/vistas/inventario-completo', inventarioStockController.getInventarioCompleto);
router.get('/vistas/stock-critico', inventarioStockController.getStockCritico);
router.get('/categoria/:idCategoria', inventarioStockController.getProductosPorCategoria);
router.get('/producto/:id', inventarioStockController.getProducto);
router.post('/producto', inventarioStockController.crearProducto);
router.put('/producto/:id', inventarioStockController.actualizarProducto);
router.delete('/producto/:id', inventarioStockController.eliminarProducto);

module.exports = router;
