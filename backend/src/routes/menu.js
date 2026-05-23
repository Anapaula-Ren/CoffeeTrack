const express = require('express');
const router = express.Router();

const menuController = require('../controllers/menuController');
const menuMiddleware = require('../middleware/menuMiddleware');

router.get('/', menuMiddleware.validarCategoriaQuery, menuController.getMenu);
router.get('/categorias', menuController.getCategorias);

module.exports = router;