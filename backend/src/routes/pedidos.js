const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidosController');
const pedidosMiddleware = require('../middleware/pedidosMiddleware');

router.get('/', pedidosController.getPedidosPendientes);
router.get('/completados', pedidosController.getPedidosCompletados);
router.get('/leches', pedidosController.getTiposLeche);
router.post('/personalizado', pedidosController.crearPedidoPersonalizado);
router.get('/:id/detalle', pedidosController.getDetallePedido);
router.get('/:id/cliente', pedidosController.getClientePedido);
router.put('/:id/completar', pedidosController.completarPedido);
router.post('/', pedidosMiddleware.validarCrearPedido, pedidosController.crearPedido);
router.post('/enviar-ticket', pedidosController.enviarTicket);

module.exports = router;
