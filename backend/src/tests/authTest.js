const request = require('supertest');

jest.mock('../config/sql', () => ({
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(true),
    define: jest.fn(),
    sync: jest.fn(),
  },
  Sequelize: jest.fn(),
}));

jest.mock('../config/nosql', () => ({
  connectMongo: jest.fn().mockResolvedValue(true),
}));

jest.mock('../models/usuariosModel', () => ({
  buscarPorCorreo: jest.fn(),
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

const bcrypt            = require('bcrypt');
const usuariosModel     = require('../models/usuariosModel');

let app;
beforeAll(() => {

  jest.isolateModules(() => {
    const express = require('express');
    const original = express.application.listen;
    express.application.listen = jest.fn().mockReturnValue({ close: jest.fn() });

    app = require('../server');

    express.application.listen = original;
  });
});

const USUARIO_MOCK = {
  IdUsuario: 1,
  Nombre: 'Juan Pérez',
  Rol: 'admin',
  Correo: 'juan@coffeetrack.com',
  Contrasena: '$2b$10$hashedpassword',   // hash ficticio
};

describe('POST /api/auth/login', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  test('body vacío → 401 (usuario no encontrado)', async () => {
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

  test('error de DB → 500 con mensaje de error', async () => {
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