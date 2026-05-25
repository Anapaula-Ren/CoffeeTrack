const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

router.get('/', menuController.getMenu);
router.get('/categorias', menuController.getCategorias);

module.exports = router;
