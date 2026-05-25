module.exports = {

  validarRangoFechas: (req, res, next) => {
    const { inicio, fin } = req.body;

    if (!inicio || !fin) {
      return res.status(400).json({ error: "Los campos 'inicio' y 'fin' son obligatorios." });
    }

    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);

    if (isNaN(fechaInicio) || isNaN(fechaFin)) {
      return res.status(400).json({ error: "Formato de fecha inválido." });
    }

    if (fechaInicio > fechaFin) {
      return res.status(400).json({ error: "La fecha de inicio no puede ser mayor que la fecha de fin." });
    }

    next();
  }

};
