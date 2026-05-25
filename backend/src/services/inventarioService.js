const inventarioModel = require('../models/inventarioModel');
const nodemailer = require('nodemailer');
const { AppError } = require('../middleware/errorHandler');

class InventarioService {
  async obtenerBebidas() {
    return await inventarioModel.obtenerBebidas();
  }

  async actualizarStock(id, stock) {
    return await inventarioModel.actualizarStock(id, stock);
  }

  async crearProducto(data) {
    return await inventarioModel.crearProducto(data);
  }

  async enviarOrdenCompra({ producto, cantidad, motivo, destino, usuarioNombre }) {
    const emailUser = process.env.EMAIL || process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      throw new AppError('Configuración de correo incompleta en el servidor.', 500);
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    const info = await transporter.sendMail({
      from: emailUser,
      to: destino,
      subject: `ORDEN DE COMPRA: ${producto} - URGENCIAS`,
      html: `
        <h3>Nueva Solicitud de Orden de Compra</h3>
        <p>El empleado ${usuarioNombre || 'Sistema'} ha solicitado una orden urgente de inventario.</p>
        <hr>
        <p><strong>Producto Solicitado:</strong> ${producto}</p>
        <p><strong>Cantidad a Ordenar:</strong> ${cantidad} unidades</p>
        <p><strong>Motivo / Observaciones:</strong> ${motivo || 'No especificado'}</p>
        <p>Por favor, procesar esta orden lo antes posible.</p>
      `
    });

    return info.messageId;
  }

  async obtenerInsumos() {
    return await inventarioModel.obtenerInsumos();
  }

  async crearNuevoInsumo(data) {
    return await inventarioModel.crearNuevoInsumo(data);
  }

  async crearProductoConReceta(data) {
    return await inventarioModel.crearProductoConReceta(data);
  }

  async obtenerReceta(idProducto) {
    return await inventarioModel.obtenerReceta(idProducto);
  }

  async actualizarReceta(idProducto, receta) {
    return await inventarioModel.actualizarReceta(idProducto, receta);
  }
}

module.exports = new InventarioService();
