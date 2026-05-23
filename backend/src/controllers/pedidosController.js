const pedidosService = require('../services/pedidosService');

module.exports = {

  getPedidosPendientes: async (req, res) => {
    try {
      const pedidos = await pedidosService.obtenerPedidosPendientes();
      res.json({ success: true, pedidos });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getPedidosCompletados: async (req, res) => {
    try {
      const pedidos = await pedidosService.obtenerPedidosCompletados();
      res.json({ success: true, pedidos });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getDetallePedido: async (req, res) => {
    try {
      const { id } = req.params;
      const detalle = await pedidosService.obtenerDetallePedido(id);
      res.json({ success: true, detalle });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getClientePedido: async (req, res) => {
    try {
      const { id } = req.params;
      const cliente = await pedidosService.obtenerClientePedido(id);
      res.json({ success: true, cliente });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  completarPedido: async (req, res) => {
    try {
      const { id } = req.params;
      await pedidosService.completarPedido(id);
      res.json({ success: true, message: "Pedido completado correctamente" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  crearPedido: async (req, res) => {
    try {
      const data = req.body;
      const result = await pedidosService.crearPedido(data);
      res.json({ success: true, message: "Pedido registrado correctamente", ...result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  enviarTicket: async (req, res) => {
    try {
      await pedidosService.enviarTicket(req.body);
      res.json({ success: true, message: "Ticket enviado correctamente" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

};