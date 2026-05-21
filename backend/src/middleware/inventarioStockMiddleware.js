module.exports = {
  validarCantidad: (req, res, next) => {
    const { cantidad } = req.body;

    if (cantidad === undefined)
      return res.status(400).json({ success: false, message: 'cantidad es requerida' });

    if (isNaN(parseFloat(cantidad)))
      return res.status(400).json({ success: false, message: 'cantidad debe ser numérica' });

    next();
  }
};