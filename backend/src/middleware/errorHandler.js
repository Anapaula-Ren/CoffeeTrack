class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const handle = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  console.error('❌ Error capturado:', err.message || err);

  // 1. Errores de Validación de Sequelize
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const message = err.errors.map(el => el.message).join('. ');
    return res.status(400).json({
      success: false,
      message: `Error de validación: ${message}`
    });
  }

  // 2. Errores de Clave Foránea de Sequelize
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Error de base de datos: Referencia de relación no válida.'
    });
  }

  // 3. Errores Operativos Personalizados (AppError)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  // 4. Errores Generales o Desconocidos
  return res.status(500).json({
    success: false,
    message: err.message || 'Error interno del servidor'
  });
};

module.exports = {
  AppError,
  handle
};
