const authService = require('../services/authService');

class AuthController {
  async login(req, res, next) {
    const { email, password } = req.body;
    try {
      const usuario = await authService.login(email, password);
      res.json({
        success: true,
        usuario
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
