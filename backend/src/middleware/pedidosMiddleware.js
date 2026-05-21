module.exports = {

  validarCrearPedido: (req, res, next) => {
    const { idCliente, total, idUsuario, productos } = req.body;

    if (!idCliente || !total || !idUsuario || !productos) {
      return res.status(400).json({
        success: false,
        message: "Faltan datos obligatorios para crear el pedido"
      });
    }

    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({
        success: false,
        message: "El pedido debe incluir productos"
      });
    }

    next();
  },

  validarActualizarEstado: (req, res, next) => {
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({
        success: false,
        message: "Debe proporcionar un estado"
      });
    }

    next();
  }

};