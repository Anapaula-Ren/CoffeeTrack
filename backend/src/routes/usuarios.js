const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const usuariosMiddleware = require('../middleware/usuariosMiddleware');

router.get('/', usuariosController.getUsuarios);
router.post('/', usuariosMiddleware.validarCrearUsuario, usuariosController.crearUsuario);
router.put('/:id', usuariosMiddleware.validarActualizarUsuario, usuariosController.actualizarUsuario);
router.delete('/:id', usuariosController.eliminarUsuario);

module.exports = router;
