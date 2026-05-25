const clientesModel = require('../models/clientesModel');

class ClientesService {
  async buscarClientes(nombre) {
    return await clientesModel.buscarPorNombre(nombre);
  }

  async crearCliente(nombre, email) {
    return await clientesModel.crear(nombre, email);
  }
}

module.exports = new ClientesService();
