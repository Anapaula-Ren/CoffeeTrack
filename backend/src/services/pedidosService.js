const pedidosModel = require('../models/pedidosModel');
const nodemailer = require('nodemailer');
const { AppError } = require('../middleware/errorHandler');
const VentaLog = require('../models/VentaLog');
const ActividadLog = require('../models/ActividadLog');

class PedidosService {
  async obtenerPedidosPendientes() {
    const rawPedidos = await pedidosModel.obtenerPedidosPendientes();
    return rawPedidos.map(pedido => {
      const total = parseFloat(pedido.Total);
      const subtotal = parseFloat((total / 1.16).toFixed(2));
      const iva = parseFloat((total - subtotal).toFixed(2));
      return {
        IdPedido: pedido.IdPedido,
        IdCliente: pedido.IdCliente,
        Fecha: pedido.Fecha,
        Total: total,
        Estado: pedido.Estado,
        IdUsuario: pedido.IdUsuario,
        NombreCliente: pedido.ClienteDetalle ? pedido.ClienteDetalle.Nombre : 'Sin Cliente',
        NombreUsuario: pedido.UsuarioDetalle ? pedido.UsuarioDetalle.Nombre : 'Sin Usuario',
        IVA: iva
      };
    });
  }

  async obtenerPedidosCompletados() {
    const rawPedidos = await pedidosModel.obtenerPedidosCompletados();
    return rawPedidos.map(pedido => {
      const total = parseFloat(pedido.Total);
      const subtotal = parseFloat((total / 1.16).toFixed(2));
      const iva = parseFloat((total - subtotal).toFixed(2));
      return {
        IdPedido: pedido.IdPedido,
        IdCliente: pedido.IdCliente,
        Fecha: pedido.Fecha,
        Total: total,
        Estado: pedido.Estado,
        IdUsuario: pedido.IdUsuario,
        NombreCliente: pedido.ClienteDetalle ? pedido.ClienteDetalle.Nombre : 'Sin Cliente',
        NombreUsuario: pedido.UsuarioDetalle ? pedido.UsuarioDetalle.Nombre : 'Sin Usuario',
        IVA: iva
      };
    });
  }

  async obtenerDetallePedido(id) {
    const rawDetails = await pedidosModel.obtenerDetallePedido(id);
    return rawDetails.map(item => ({
      IdPedido: item.IdPedido,
      IdProducto: item.IdProducto,
      Cantidad: item.Cantidad,
      Subtotal: parseFloat(item.Subtotal),
      NombreProducto: item.ProductoDetalle ? item.ProductoDetalle.Nombre : 'Producto Desconocido',
      PrecioUnitario: item.ProductoDetalle ? parseFloat(item.ProductoDetalle.Precio) : 0.00
    }));
  }

  async obtenerClientePedido(id) {
    return await pedidosModel.obtenerClientePedido(id);
  }

  async completarPedido(id) {
    return await pedidosModel.completarPedido(id);
  }

  async obtenerTiposLeche() {
    return await pedidosModel.obtenerTiposLeche();
  }

async crearPedido(data) {

    console.log('DATA PEDIDO');

    console.log(data);

    const pedido = await pedidosModel.crearPedido(data);

    try {

        console.log('INTENTANDO GUARDAR LOG');

        const log = await VentaLog.create({

            usuario: data.usuarioRol || data.idUsuario,

            productos: data.productos || [],

            total: data.total || 0

        });

        await ActividadLog.create({

    tipo: 'VENTA',

    usuario: String(
        data.usuarioRol || data.idUsuario
    ),

    descripcion: 'Venta realizada',

    total: data.total || 0

});

        console.log('LOG GUARDADO');

        console.log(log);

    } catch (mongoError) {

        console.log('ERROR MONGO');

        console.log(mongoError);

    }

    return pedido;
}

  async enviarTicket({ orderId, email, orderSummary, details }) {
    const emailUser = process.env.EMAIL || process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      throw new AppError('Configuración de correo incompleta en el servidor.', 500);
    }

    const subtotal = parseFloat(orderSummary.Total) - parseFloat(orderSummary.IVA);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    const ticketHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .ticket { max-width: 600px; margin: 0 auto; border: 2px solid #5a3d31; border-radius: 10px; padding: 20px; }
          .header { text-align: center; background: #5a3d31; color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .product-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .product-table th, .product-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          .product-table th { background: #f5f5f5; }
          .total-breakdown { text-align: right; font-size: 1.1em; margin-top: 20px; }
          .total-breakdown div { margin: 5px 0; }
          .total-final { font-size: 1.3em; font-weight: bold; border-top: 2px solid #5a3d31; padding-top: 10px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="header">
            <h1>CoffeeTrack</h1>
            <h2>Ticket de Compra #${orderId}</h2>
          </div>
          <div class="details">
            <p><strong>Cliente:</strong> ${orderSummary.NombreCliente}</p>
            <p><strong>Fecha:</strong> ${new Date(orderSummary.Fecha).toLocaleString('es-MX')}</p>
            <p><strong>Atendido por:</strong> ${orderSummary.NombreUsuario}</p>
            <p><strong>Estado:</strong> ${orderSummary.Estado}</p>
          </div>
          <table class="product-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unit.</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${details.map(item => `
                <tr>
                  <td>${item.NombreProducto}</td>
                  <td>${item.Cantidad}</td>
                  <td>$${parseFloat(item.PrecioUnitario).toFixed(2)}</td>
                  <td>$${parseFloat(item.Subtotal).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total-breakdown">
            <div><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</div>
            <div><strong>IVA (16%):</strong> $${parseFloat(orderSummary.IVA).toFixed(2)}</div>
            <div class="total-final"><strong>TOTAL:</strong> $${parseFloat(orderSummary.Total).toFixed(2)}</div>
          </div>
          <div class="footer">
            <p>¡Gracias por su preferencia!</p>
            <p>Visítanos nuevamente en CoffeeTrack</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: emailUser,
      to: email,
      subject: `Ticket de Compra - CoffeeTrack #${orderId}`,
      html: ticketHTML
    });

    return info.messageId;
  }
}

module.exports = new PedidosService();
