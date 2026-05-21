const pedidosModel = require('../models/pedidosModel.js');
const nodemailer = require('nodemailer');

module.exports = {

  obtenerPedidos: async () => {
    return await pedidosModel.obtenerPedidos();
  },

  obtenerPedidosPendientes: async () => {
    return await pedidosModel.obtenerPedidosPendientes();
  },

  crearPedido: async (data) => {
    return await pedidosModel.crearPedidoConDetalles(data);
  },

  actualizarEstado: async (idPedido, estado) => {
    return await pedidosModel.actualizarEstado(idPedido, estado);
  },

  enviarRecordatorio: async (email, ticket) => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Recordatorio de Pedido",
      text: `Tu pedido sigue pendiente. Ticket: ${ticket}`
    });
  }

};