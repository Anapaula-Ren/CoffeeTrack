const mongoose = require('mongoose');

const VentaLogSchema = new mongoose.Schema({

    usuario: String,

    productos: Array,

    total: Number,

    fecha: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model(
    'ventas_logs',
    VentaLogSchema
);