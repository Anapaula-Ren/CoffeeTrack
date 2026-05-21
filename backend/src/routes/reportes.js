const express = require('express');
const router = express.Router();

const reportesController = require('../controllers/reportesController');
const reportesMiddleware = require('../middleware/reportesMiddleware');

router.post('/top-productos', reportesMiddleware.validarRangoFechas, reportesController.getTopProductos);

module.exports = router;