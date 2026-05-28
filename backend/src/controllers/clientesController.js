const clientesService = require('../services/clientesService');

class ClientesController {
  async buscarClientes(req, res, next) {
    const { nombre } = req.query;
    try {
      const clientes = await clientesService.buscarClientes(nombre);
      res.json(clientes);
    } catch (error) {
      next(error);
    }
  }

  async crearCliente(req, res, next) {
    const { nombre, email } = req.body;
    try {
      const client = await clientesService.crearCliente(nombre, email);
      res.json({
        success: true,
        id: client.IdCliente,
        nombre
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ClientesController();
