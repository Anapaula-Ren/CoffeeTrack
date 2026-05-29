const mongoose = require('mongoose');

const RegistroLogSchema = new mongoose.Schema({

    usuario: {
        type: String,
        required: true
    },

    correo: {
        type: String,
        required: true
    },

    fechaRegistro: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model(
    'registro_usuarios',
    RegistroLogSchema
);