const mongoose = require('mongoose');

const ErrorLogSchema = new mongoose.Schema({

    mensaje: String,

    stack: String,

    fecha: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model(
    'errores_logs',
    ErrorLogSchema
);