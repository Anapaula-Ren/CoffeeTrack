const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');

router.get('/bebidas',        inventarioController.getBebidas);
router.put('/productos/:id',  inventarioController.actualizarStock);
router.post('/productos',     inventarioController.crearProducto);
router.post('/ordenar',       inventarioController.enviarOrdenCompra);

router.get('/insumos', inventarioController.getInsumos);
router.post('/nuevo-insumo', inventarioController.crearNuevoInsumo);
router.post('/productos-con-receta', inventarioController.crearProductoConReceta);

router.get('/productos/:id/receta', inventarioController.getReceta);
router.put('/productos/:id/receta', inventarioController.actualizarReceta);

module.exports = router;
