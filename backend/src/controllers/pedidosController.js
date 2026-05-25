const pedidosService = require('../services/pedidosService');

class PedidosController {
  async getPedidosPendientes(req, res, next) {
    try {
      const pedidos = await pedidosService.obtenerPedidosPendientes();
      res.json(pedidos);
    } catch (error) {
      next(error);
    }
  }

  async getPedidosCompletados(req, res, next) {
    try {
      const pedidos = await pedidosService.obtenerPedidosCompletados();
      res.json(pedidos);
    } catch (error) {
      next(error);
    }
  }

  async getDetallePedido(req, res, next) {
    const { id } = req.params;
    try {
      const detalle = await pedidosService.obtenerDetallePedido(id);
      res.json(detalle);
    } catch (error) {
      next(error);
    }
  }

  async getClientePedido(req, res, next) {
    const { id } = req.params;
    try {
      const cliente = await pedidosService.obtenerClientePedido(id);
      if (!cliente) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
      }
      res.json({
        nombre: cliente.Nombre,
        email: cliente.Email
      });
    } catch (error) {
      next(error);
    }
  }

  async completarPedido(req, res, next) {
    const { id } = req.params;
    try {
      const affected = await pedidosService.completarPedido(id);
      if (affected === 0) {
        return res.status(404).json({ success: false, message: 'Pedido no encontrado.' });
      }
      res.json({ success: true, message: 'Estado del pedido actualizado a Completado.' });
    } catch (error) {
      next(error);
    }
  }

  async crearPedido(req, res, next) {
    try {
      const result = await pedidosService.crearPedido(req.body);
      res.json({ success: true, message: 'Pedido registrado correctamente', idPedido: result.idPedido });
    } catch (error) {
      next(error);
    }
  }

  async enviarTicket(req, res, next) {
    try {
      const messageId = await pedidosService.enviarTicket(req.body);
      res.json({ success: true, message: 'Ticket enviado correctamente', messageId });
    } catch (error) {
      next(error);
    }
  }

  async getTiposLeche(req, res, next) {
    try {
      const leches = await pedidosService.obtenerTiposLeche();
      res.json(leches);
    } catch (error) {
      next(error);
    }
  }

  async crearPedidoPersonalizado(req, res, next) {
    const { idProducto, idLeche, shots, idCliente, idUsuario } = req.body;
    try {
      const result = await pedidosService.crearPedidoPersonalizado({ idProducto, idLeche, shots, idCliente, idUsuario });
      res.json({
        success: true,
        message: 'Pedido personalizado registrado y descontado del inventario correctamente',
        idPedido: result.idPedido,
        producto: result.producto
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PedidosController();
