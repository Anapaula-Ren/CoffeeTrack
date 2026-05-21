const authService = require('../services/authService');

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const usuario = await authService.login(email, password);

    return res.json({
      success: true,
      usuario
    });

  } catch (error) {

    if (error.message === 'Credenciales Inválidas') {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    console.error('Error en login:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = { login };