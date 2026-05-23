const clientesModel = require('../models/clientesModel');

const buscarClientes = async (nombre) => {
  return await clientesModel.buscarClientes(nombre);
};

const crearCliente = async (nombre, email) => {
  return await clientesModel.crearCliente(nombre, email);
};

module.exports = { buscarClientes, crearCliente };