const inventarioModel = require('../models/inventarioModel');
const nodemailer = require('nodemailer');

module.exports = {

  obtenerBebidas: async () => {
    return await inventarioModel.obtenerBebidas();
  },

  actualizarStock: async (id, stock) => {
    if (stock < 0) throw new Error("El stock no puede ser negativo");
    await inventarioModel.actualizarStock(id, stock);
  },

  crearProducto: async (data) => {
    return await inventarioModel.crearProducto(data);
  },

  obtenerInsumos: async () => {
    return await inventarioModel.obtenerInsumos();
  },

  crearProductoConReceta: async (data) => {
    const idProducto = await inventarioModel.crearProductoConReceta(data);

    if (data.Receta && data.Receta.length > 0) {
      await inventarioModel.guardarReceta(idProducto, data.Receta);
    }

    return idProducto;
  },

  enviarOrdenCompra: async ({ producto, cantidad, motivo, destino, usuarioNombre }) => {

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: destino,
      subject: `ORDEN DE COMPRA: ${producto} - URGENCIA`,
      html: `
        <h3>Solicitud de Orden de Compra</h3>
        <p>Empleado: <strong>${usuarioNombre || 'Sistema'}</strong></p>
        <p><strong>Producto:</strong> ${producto}</p>
        <p><strong>Cantidad:</strong> ${cantidad}</p>
        <p><strong>Motivo:</strong> ${motivo || 'No especificado'}</p>
      `
    });

    return true;
  }

};