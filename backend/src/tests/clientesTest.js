const request = require('supertest');
const express = require('express');

jest.mock('../config/sql', () => ({
  sequelize: { authenticate: jest.fn(), define: jest.fn(), sync: jest.fn() },
  Sequelize: {
    Model: class Model { static init(){} static findAll(){} static create(){} },
    DataTypes: { INTEGER: 'INTEGER', STRING: 'STRING' },
    Op: { like: Symbol('like') },
  },
}));

jest.mock('../models/clientesModel', () => ({
  buscarPorNombre: jest.fn(),
  crear: jest.fn(),
  sequelizeModel: class M { static init(){} },
}));

const ErrorHandler = require('../middleware/errorHandler');
const clientesModel = require('../models/clientesModel');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/clientes', require('../routes/clientes'));
  app.use(ErrorHandler.handle);
  return app;
}

let app;
beforeAll(() => { app = buildApp(); });
beforeEach(() => jest.clearAllMocks());

describe('GET /api/clientes/buscar', () => {

  test('devuelve lista de clientes que coinciden con el nombre', async () => {
    const mockClientes = [
      { IdCliente: 1, Nombre: 'Ana López', Email: 'ana@mail.com' },
      { IdCliente: 2, Nombre: 'Ana García', Email: 'garcia@mail.com' },
    ];
    clientesModel.buscarPorNombre.mockResolvedValue(mockClientes);

    const res = await request(app)
      .get('/api/clientes/buscar')
      .query({ nombre: 'Ana' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].Nombre).toBe('Ana López');
    expect(clientesModel.buscarPorNombre).toHaveBeenCalledWith('Ana');
  });

  test('devuelve lista vacía si no hay coincidencias', async () => {
    clientesModel.buscarPorNombre.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/clientes/buscar')
      .query({ nombre: 'NoExiste' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('sin parámetro nombre → busca con undefined (comportamiento por defecto)', async () => {
    clientesModel.buscarPorNombre.mockResolvedValue([]);

    const res = await request(app).get('/api/clientes/buscar');

    expect(res.statusCode).toBe(200);
    expect(clientesModel.buscarPorNombre).toHaveBeenCalledWith(undefined);
  });

  test('error de DB → 500', async () => {
    clientesModel.buscarPorNombre.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .get('/api/clientes/buscar')
      .query({ nombre: 'Ana' });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

});

describe('POST /api/clientes', () => {

  test('crea cliente con nombre y email → 200 con id y nombre', async () => {
    clientesModel.crear.mockResolvedValue({ IdCliente: 5 });

    const res = await request(app)
      .post('/api/clientes')
      .send({ nombre: 'Carlos Ruiz', email: 'carlos@mail.com' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.id).toBe(5);
    expect(res.body.nombre).toBe('Carlos Ruiz');
    expect(clientesModel.crear).toHaveBeenCalledWith('Carlos Ruiz', 'carlos@mail.com');
  });

  test('crea cliente sin email → 200 (email es opcional)', async () => {
    clientesModel.crear.mockResolvedValue({ IdCliente: 6 });

    const res = await request(app)
      .post('/api/clientes')
      .send({ nombre: 'Pedro Sin Email' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(clientesModel.crear).toHaveBeenCalledWith('Pedro Sin Email', undefined);
  });

  test('body vacío → llama crear con undefined (sin validación en controller)', async () => {
    clientesModel.crear.mockResolvedValue({ IdCliente: 7 });

    const res = await request(app)
      .post('/api/clientes')
      .send({});

    expect(res.statusCode).toBe(200);
    expect(clientesModel.crear).toHaveBeenCalledWith(undefined, undefined);
  });

  test('error de DB al crear → 500', async () => {
    clientesModel.crear.mockRejectedValue(new Error('Insert failed'));

    const res = await request(app)
      .post('/api/clientes')
      .send({ nombre: 'Error Cliente', email: 'err@mail.com' });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test('error de validación Sequelize → 400', async () => {
    const seqError = {
      name: 'SequelizeValidationError',
      errors: [{ message: 'Nombre no puede ser nulo' }],
    };
    clientesModel.crear.mockRejectedValue(seqError);

    const res = await request(app)
      .post('/api/clientes')
      .send({ email: 'sinNombre@mail.com' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Error de validación');
  });

});