const mongoose = require('mongoose');

const LoginLogSchema = new mongoose.Schema({

    usuario: String,

    estado: String,

    ip: String,

    fecha: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model(
    'login_logs',
    LoginLogSchema
);