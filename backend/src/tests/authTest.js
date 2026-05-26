const request = require('supertest');
const express = require('express');

jest.mock('../config/sql', () => ({
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(true),
    transaction: jest.fn(),
    query: jest.fn(),
    define: jest.fn(),
    sync: jest.fn(),
  },
  Sequelize: {
    Model: class Model {
      static init() {}
      static findAll() {}
      static findByPk() {}
      static create() {}
      static update() {}
      static destroy() {}
      static belongsTo() {}
      static hasMany() {}
      static belongsToMany() {}
    },
    DataTypes: {
      INTEGER: 'INTEGER',
      STRING: 'STRING',
      DECIMAL: () => 'DECIMAL',
      DATE: 'DATE',
      BOOLEAN: 'BOOLEAN',
      TEXT: 'TEXT',
      FLOAT: 'FLOAT',
    },
    QueryTypes: { SELECT: 'SELECT' },
    NOW: 'NOW',
  },
}));

jest.mock('../config/nosql', () => ({
  connectMongo: jest.fn().mockResolvedValue(true),
}));

jest.mock('../models/usuariosModel', () => ({
  buscarPorCorreo: jest.fn(),
  sequelizeModel: class FakeModel {
    static init() {} static belongsTo() {} static hasMany() {}
  },
}));
jest.mock('../models/inventarioModel', () => ({
  models: {
    Producto:   class M { static init(){} static belongsTo(){} static hasMany(){} },
    Categoria:  class M { static init(){} static belongsTo(){} static hasMany(){} },
    Inventario: class M { static init(){} static belongsTo(){} static hasMany(){} },
    Receta:     class M { static init(){} static belongsTo(){} static hasMany(){} },
  },
  obtenerBebidas: jest.fn(), actualizarStock: jest.fn(),
  crearProducto: jest.fn(), obtenerInsumos: jest.fn(),
  crearNuevoInsumo: jest.fn(), crearProductoConReceta: jest.fn(),
  obtenerReceta: jest.fn(), actualizarReceta: jest.fn(),
}));
jest.mock('../models/clientesModel', () => ({
  sequelizeModel: class M { static init(){} static belongsTo(){} static hasMany(){} },
  buscarOCrearCliente: jest.fn(), obtenerTodos: jest.fn(),
}));
jest.mock('../models/pedidosModel', () => ({
  models: {},
  crearPedido: jest.fn(), obtenerPedidosPendientes: jest.fn(),
  obtenerPedidosCompletados: jest.fn(), obtenerDetallePedido: jest.fn(),
  completarPedido: jest.fn(), obtenerTiposLeche: jest.fn(),
  crearPedidoPersonalizado: jest.fn(),
}));

jest.mock('bcrypt', () => ({ compare: jest.fn() }));

const cors = require('cors');
const path = require('path');
const ErrorHandler = require('../middleware/errorHandler');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(cors());
  app.use('/api/auth', require('../routes/auth'));
  app.use(ErrorHandler.handle);
  return app;
}

const bcrypt        = require('bcrypt');
const usuariosModel = require('../models/usuariosModel');

let app;
beforeAll(() => {
  app = buildApp();
});

const USUARIO_MOCK = {
  IdUsuario: 1,
  Nombre: 'Juan Pérez',
  Rol: 'admin',
  Correo: 'juan@coffeetrack.com',
  Contrasena: '$2b$10$hashedpassword',
};

describe('POST /api/auth/login', () => {

  beforeEach(() => jest.clearAllMocks());

  test('credenciales válidas → 200 con datos del usuario', async () => {
    usuariosModel.buscarPorCorreo.mockResolvedValue(USUARIO_MOCK);
    bcrypt.compare.mockResolvedValue(true);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'juan@coffeetrack.com', password: 'correcta123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.usuario).toMatchObject({
      IdUsuario: 1,
      Nombre: 'Juan Pérez',
      Rol: 'admin',
      Correo: 'juan@coffeetrack.com',
    });
    expect(res.body.usuario.Contrasena).toBeUndefined();
  });

  test('contraseña incorrecta → 401 "Credenciales inválidas"', async () => {
    usuariosModel.buscarPorCorreo.mockResolvedValue(USUARIO_MOCK);
    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'juan@coffeetrack.com', password: 'incorrecta' });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Credenciales inválidas');
  });

  test('email no registrado → 401 "Credenciales inválidas"', async () => {
    usuariosModel.buscarPorCorreo.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noexiste@coffeetrack.com', password: 'cualquiera' });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Credenciales inválidas');
  });

  test('body vacío → 401', async () => {
    usuariosModel.buscarPorCorreo.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('solo email, sin password → 401', async () => {
    usuariosModel.buscarPorCorreo.mockResolvedValue(USUARIO_MOCK);
    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'juan@coffeetrack.com' });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('error de DB → 500', async () => {
    usuariosModel.buscarPorCorreo.mockRejectedValue(new Error('DB connection failed'));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'juan@coffeetrack.com', password: 'cualquiera' });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test('contraseña texto plano coincide → 200', async () => {
    const usuarioTextoPlano = { ...USUARIO_MOCK, Contrasena: 'password123' };
    usuariosModel.buscarPorCorreo.mockResolvedValue(usuarioTextoPlano);
    bcrypt.compare.mockRejectedValue(new Error('invalid hash'));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'juan@coffeetrack.com', password: 'password123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

});