const express = require('express');
const router = express.Router();

const usuariosController = require('../controllers/usuariosController');
const usuariosMiddleware = require('../middleware/usuariosMiddleware');

// Obtener todos
router.get('/', usuariosController.getUsuarios);

// Crear
router.post('/', usuariosMiddleware.validarCrearUsuario, usuariosController.crearUsuario);

// Actualizar
router.put('/:id', usuariosMiddleware.validarActualizarUsuario, usuariosController.actualizarUsuario);

// Eliminar
router.delete('/:id', usuariosController.eliminarUsuario);

module.exports = router;