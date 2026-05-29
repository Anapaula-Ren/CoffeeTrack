const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const usuariosMiddleware = require('../middleware/usuariosMiddleware');
const RegistroLog = require('../models/RegistroLog');

router.post('/usuarios', async (req, res) => {

    try {

        const { usuario, correo } = req.body;

        // AQUI TU INSERT SQL SERVER

        await RegistroLog.create({
            usuario,
            correo
        });

        res.json({
            ok: true,
            mensaje: 'Usuario registrado'
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            ok: false,
            mensaje: 'Error'
        });

    }

});

router.get('/', usuariosController.getUsuarios);
router.post('/', usuariosMiddleware.validarCrearUsuario, usuariosController.crearUsuario);
router.put('/:id', usuariosMiddleware.validarActualizarUsuario, usuariosController.actualizarUsuario);
router.delete('/:id', usuariosController.eliminarUsuario);

module.exports = router;
