const mongoose = require('mongoose');

const ActividadLogSchema = new mongoose.Schema({

    tipo: {
        type: String,
        required: true
    },

    usuario: {
        type: String,
        required: true
    },

    descripcion: {
        type: String,
        required: true
    },

    total: {
        type: Number,
        default: 0
    },

    fecha: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model(
    'logs_actividades',
    ActividadLogSchema
);