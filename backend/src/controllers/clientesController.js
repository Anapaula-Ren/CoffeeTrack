const clientesService = require('../services/clientesService');

const buscarClientes = async (req, res) => {
  const { nombre } = req.query;

  try {
    const clientes = await clientesService.buscarClientes(nombre);
    res.json(clientes);
  } catch (error) {
    console.error('Error al buscar cliente:', error);
    res.status(500).json({ error: 'Error al buscar cliente' });
  }
};

const crearCliente = async (req, res) => {
  const { nombre, email } = req.body;

  try {
    const nuevo = await clientesService.crearCliente(nombre, email);

    res.json({
      success: true,
      id: nuevo.IdCliente,
      nombre
    });

  } catch (error) {
    console.error('Error al registrar cliente:', error);
    res.status(500).json({ success: false, message: 'Error al registrar cliente' });
  }
};

module.exports = { buscarClientes, crearCliente };