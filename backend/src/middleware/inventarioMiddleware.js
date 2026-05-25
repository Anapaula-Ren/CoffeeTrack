module.exports = {

  validarActualizacionStock: (req, res, next) => {
    const { stock } = req.body;
    if (stock == null || isNaN(stock)) {
      return res.status(400).json({ error: "El stock debe ser un número válido" });
    }
    next();
  },

  validarNuevoProducto: (req, res, next) => {
    const { Nombre, Precio, Stock, IdCategoria } = req.body;

    if (!Nombre || Precio == null || Stock == null || !IdCategoria) {
      return res.status(400).json({ error: "Faltan datos obligatorios del producto" });
    }
    next();
  },

  validarOrdenCompra: (req, res, next) => {
    const { producto, cantidad, destino } = req.body;

    if (!producto || !cantidad || !destino) {
      return res.status(400).json({ error: "Datos de orden incompletos" });
    }
    next();
  }

};
