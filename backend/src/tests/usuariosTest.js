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

jest.mock('../services/usuariosService', () => ({
  obtenerUsuarios: jest.fn(),
  crearUsuario: jest.fn(),
  actualizarUsuario: jest.fn(),
  eliminarUsuario: jest.fn(),
}));

jest.mock('../middleware/errorHandler', () => ({
  handle: (err, req, res, next) => {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  },
}));

const cors = require('cors');
const ErrorHandler = require('../middleware/errorHandler');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(cors());
  app.use('/api/usuarios', require('../routes/usuarios'));
  app.use(ErrorHandler.handle);
  return app;
}

const usuariosService = require('../services/usuariosService');

let app;
beforeAll(() => {
  app = buildApp();
});

const MOCK_USUARIOS = [
  {
    IdUsuario: 1,
    Nombre: 'Admin User',
    Correo: 'admin@coffetrack.com',
    Rol: 'administrador',
  },
  {
    IdUsuario: 2,
    Nombre: 'Barista User',
    Correo: 'barista@coffetrack.com',
    Rol: 'barista',
  },
  {
    IdUsuario: 3,
    Nombre: 'Cliente User',
    Correo: 'cliente@coffetrack.com',
    Rol: 'cliente',
  },
];

describe('GET /api/usuarios', () => {
  beforeEach(() => jest.clearAllMocks());

  test('obtiene lista de usuarios → 200', async () => {
    usuariosService.obtenerUsuarios.mockResolvedValue(MOCK_USUARIOS);

    const res = await request(app).get('/api/usuarios');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(3);
    expect(res.body[0]).toMatchObject({
      IdUsuario: 1,
      Nombre: 'Admin User',
      Correo: 'admin@coffetrack.com',
    });
  });

  test('lista vacía de usuarios → 200 con array vacío', async () => {
    usuariosService.obtenerUsuarios.mockResolvedValue([]);

    const res = await request(app).get('/api/usuarios');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test('error de base de datos → 500', async () => {
    usuariosService.obtenerUsuarios.mockRejectedValue(
      new Error('Database connection failed')
    );

    const res = await request(app).get('/api/usuarios');

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/usuarios', () => {
  beforeEach(() => jest.clearAllMocks());

  test('crea usuario exitosamente → 200', async () => {
    usuariosService.crearUsuario.mockResolvedValue(4);

    const res = await request(app)
      .post('/api/usuarios')
      .send({
        nombre: 'New User',
        correo: 'newuser@coffetrack.com',
        contrasena: 'secure123',
        rol: 'cliente',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.id).toBe(4);
    expect(res.body.message).toContain('exitosamente');
  });

  test('sin nombre → 400', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .send({
        correo: 'newuser@coffetrack.com',
        contrasena: 'secure123',
        rol: 'cliente',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('obligatorios');
  });

  test('sin correo → 400', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .send({
        nombre: 'New User',
        contrasena: 'secure123',
        rol: 'cliente',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('obligatorios');
  });

  test('sin contraseña → 400', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .send({
        nombre: 'New User',
        correo: 'newuser@coffetrack.com',
        rol: 'cliente',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('obligatorios');
  });

  test('sin rol → 400', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .send({
        nombre: 'New User',
        correo: 'newuser@coffetrack.com',
        contrasena: 'secure123',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('obligatorios');
  });

  test('correo duplicado → 400', async () => {
    usuariosService.crearUsuario.mockRejectedValue({
      statusCode: 400,
      message: 'El correo ya está registrado.',
    });

    const res = await request(app)
      .post('/api/usuarios')
      .send({
        nombre: 'Another Admin',
        correo: 'admin@coffetrack.com',
        contrasena: 'secure123',
        rol: 'administrador',
      });

    expect(res.statusCode).toBe(400);
  });

  test('error de base de datos → 500', async () => {
    usuariosService.crearUsuario.mockRejectedValue(
      new Error('Database insert failed')
    );

    const res = await request(app)
      .post('/api/usuarios')
      .send({
        nombre: 'New User',
        correo: 'newuser@coffetrack.com',
        contrasena: 'secure123',
        rol: 'cliente',
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('PUT /api/usuarios/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  test('actualiza usuario exitosamente → 200', async () => {
    usuariosService.actualizarUsuario.mockResolvedValue(1);

    const res = await request(app)
      .put('/api/usuarios/1')
      .send({
        nombre: 'Updated Name',
        correo: 'updated@coffetrack.com',
        rol: 'barista',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('actualizado');
  });

  test('sin nombre → 400', async () => {
    const res = await request(app)
      .put('/api/usuarios/1')
      .send({
        correo: 'updated@coffetrack.com',
        rol: 'barista',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('obligatorios');
  });

  test('sin correo → 400', async () => {
    const res = await request(app)
      .put('/api/usuarios/1')
      .send({
        nombre: 'Updated Name',
        rol: 'barista',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('obligatorios');
  });

  test('sin rol → 400', async () => {
    const res = await request(app)
      .put('/api/usuarios/1')
      .send({
        nombre: 'Updated Name',
        correo: 'updated@coffetrack.com',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('obligatorios');
  });

  test('error de base de datos → 500', async () => {
    usuariosService.actualizarUsuario.mockRejectedValue(
      new Error('Database update failed')
    );

    const res = await request(app)
      .put('/api/usuarios/1')
      .send({
        nombre: 'Updated Name',
        correo: 'updated@coffetrack.com',
        rol: 'barista',
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('DELETE /api/usuarios/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  test('elimina usuario exitosamente → 200', async () => {
    usuariosService.eliminarUsuario.mockResolvedValue(1);

    const res = await request(app).delete('/api/usuarios/1');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('eliminado');
  });

  test('usuario no existe → 200', async () => {
    usuariosService.eliminarUsuario.mockResolvedValue(0);

    const res = await request(app).delete('/api/usuarios/999');

    expect(res.statusCode).toBe(200);
  });

  test('error de base de datos → 500', async () => {
    usuariosService.eliminarUsuario.mockRejectedValue(
      new Error('Database delete failed')
    );

    const res = await request(app).delete('/api/usuarios/1');

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });
});