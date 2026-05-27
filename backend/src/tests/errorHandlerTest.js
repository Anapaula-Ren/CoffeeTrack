const { AppError, handle } = require('../middleware/errorHandler');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}
const mockReq  = {};
const mockNext = jest.fn();

describe('AppError', () => {

  test('crea error con statusCode y status "fail" (4xx)', () => {
    const err = new AppError('No autorizado', 401);
    expect(err.message).toBe('No autorizado');
    expect(err.statusCode).toBe(401);
    expect(err.status).toBe('fail');
    expect(err.isOperational).toBe(true);
  });

  test('crea error con status "error" (5xx)', () => {
    const err = new AppError('Error interno', 500);
    expect(err.status).toBe('error');
    expect(err.statusCode).toBe(500);
  });

  test('es instancia de Error', () => {
    const err = new AppError('Test', 400);
    expect(err).toBeInstanceOf(Error);
  });

});

describe('ErrorHandler.handle', () => {

  beforeEach(() => jest.clearAllMocks());

  test('AppError 401 → responde 401 con success:false y mensaje', () => {
    const res = mockRes();
    const err = new AppError('Credenciales inválidas', 401);

    handle(err, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Credenciales inválidas',
    });
  });

  test('AppError 404 → responde 404', () => {
    const res = mockRes();
    const err = new AppError('Recurso no encontrado', 404);

    handle(err, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Recurso no encontrado',
    });
  });

  test('SequelizeValidationError → 400 con mensaje de validación', () => {
    const res = mockRes();
    const err = {
      name: 'SequelizeValidationError',
      errors: [
        { message: 'El correo no puede ser nulo' },
        { message: 'El nombre es requerido' },
      ],
    };

    handle(err, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(false);
    expect(body.message).toContain('Error de validación');
    expect(body.message).toContain('El correo no puede ser nulo');
  });

  test('SequelizeUniqueConstraintError → 400', () => {
    const res = mockRes();
    const err = {
      name: 'SequelizeUniqueConstraintError',
      errors: [{ message: 'El correo ya está registrado' }],
    };

    handle(err, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].success).toBe(false);
  });

  test('SequelizeForeignKeyConstraintError → 400 con mensaje de relación', () => {
    const res = mockRes();
    const err = { name: 'SequelizeForeignKeyConstraintError' };

    handle(err, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Error de base de datos: Referencia de relación no válida.',
    });
  });

  test('error genérico → 500 con success:false', () => {
    const res = mockRes();
    const err = new Error('Algo salió muy mal');

    handle(err, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json.mock.calls[0][0].success).toBe(false);
  });

  test('error sin mensaje → "Error interno del servidor"', () => {
    const res = mockRes();
    const err = {};   
    handle(err, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Error interno del servidor',
    });
  });

});