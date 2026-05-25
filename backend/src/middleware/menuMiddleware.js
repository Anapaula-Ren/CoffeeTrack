module.exports = {

  validarCategoriaQuery: (req, res, next) => {
    const { categoria } = req.query;

    if (categoria && typeof categoria !== "string") {
      return res.status(400).json({ error: "La categoría debe ser texto." });
    }

    next();
  }

};
