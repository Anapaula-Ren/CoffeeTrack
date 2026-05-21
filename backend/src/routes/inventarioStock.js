const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/inventarioStockController');
const mid = require('../middleware/inventarioStockMiddleware');

router.get('/categorias', ctrl.getCategorias);
router.get('/categoria/:idCategoria', ctrl.getProductosPorCategoria);
router.get('/producto/:id', ctrl.getProducto);
router.put('/producto/:id', mid.validarCantidad, ctrl.actualizarProducto);
router.post('/producto', ctrl.crearProducto);
router.delete('/producto/:id', ctrl.eliminarProducto);

router.get('/completo', ctrl.getInventarioCompleto);
router.get('/stock-critico', ctrl.getStockCritico);
router.get('/stock-bajo', ctrl.getStockBajo);

module.exports = router;