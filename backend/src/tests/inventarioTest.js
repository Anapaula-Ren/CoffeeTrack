const request = require('supertest');
const express = require('express');

jest.mock('../config/sql', () => ({
  sequelize: { authenticate: jest.fn(), define: jest.fn(), sync: jest.fn(), transaction: jest.fn() },
  Sequelize: {
    Model: class Model { static init(){} static findAll(){} static create(){} static update(){} static destroy(){} static belongsTo(){} static hasMany(){} },
    DataTypes: { INTEGER: 'INTEGER', STRING: 'STRING', DECIMAL: () => 'DECIMAL' },
  },
}));

jest.mock('../models/inventarioModel', () => ({
  obtenerBebidas:         jest.fn(),
  actualizarStock:        jest.fn(),
  crearProducto:          jest.fn(),
  obtenerInsumos:         jest.fn(),
  crearNuevoInsumo:       jest.fn(),
  crearProductoConReceta: jest.fn(),
  obtenerReceta:          jest.fn(),
  actualizarReceta:       jest.fn(),
  models: {},
}));

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({ sendMail: jest.fn() }),
}));

const ErrorHandler    = require('../middleware/errorHandler');
const inventarioModel = require('../models/inventarioModel');
const nodemailer      = require('nodemailer');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/inventario', require('../routes/inventario'));
  app.use(ErrorHandler.handle);
  return app;
}

let app;
beforeAll(() => { app = buildApp(); });
beforeEach(() => jest.clearAllMocks());

describe('GET /api/inventario/bebidas', () => {

  test('devuelve lista de bebidas → 200', async () => {
    inventarioModel.obtenerBebidas.mockResolvedValue([
      { IdProducto: 1, Nombre: 'Café Latte', Precio: 45.00 },
      { IdProducto: 2, Nombre: 'Capuccino',  Precio: 50.00 },
    ]);
    const res = await request(app).get('/api/inventario/bebidas');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test('lista vacía → 200', async () => {
    inventarioModel.obtenerBebidas.mockResolvedValue([]);
    const res = await request(app).get('/api/inventario/bebidas');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('error de DB → 500', async () => {
    inventarioModel.obtenerBebidas.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/inventario/bebidas');
    expect(res.statusCode).toBe(500);
  });

});

describe('PUT /api/inventario/productos/:id (actualizarStock)', () => {

  test('stock válido → 200', async () => {
    inventarioModel.actualizarStock.mockResolvedValue(true);
    const res = await request(app)
      .put('/api/inventario/productos/1')
      .send({ stock: 20 });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // NOTA: el middleware validarActualizacionStock existe en inventarioMiddleware.js
  // pero no está conectado en routes/inventario.js, por lo tanto stock inválido
  // pasa igual al controller sin validación previa.
  test('stock null → pasa al controller sin validar (middleware no conectado)', async () => {
    inventarioModel.actualizarStock.mockResolvedValue(true);
    const res = await request(app)
      .put('/api/inventario/productos/1')
      .send({ stock: null });
    expect(res.statusCode).toBe(200);
  });

  test('error de DB → 500', async () => {
    inventarioModel.actualizarStock.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .put('/api/inventario/productos/1')
      .send({ stock: 10 });
    expect(res.statusCode).toBe(500);
  });

});

describe('POST /api/inventario/productos (crearProducto)', () => {

  test('datos completos → 201 con id', async () => {
    inventarioModel.crearProducto.mockResolvedValue(10);
    const res = await request(app)
      .post('/api/inventario/productos')
      .send({ Nombre: 'Café Americano', Precio: 35, Stock: 100, IdCategoria: 1 });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.id).toBe(10);
  });

  test('body vacío → pasa al controller sin validar (middleware no conectado)', async () => {
    inventarioModel.crearProducto.mockResolvedValue(11);
    const res = await request(app)
      .post('/api/inventario/productos')
      .send({});
    expect(res.statusCode).toBe(201);
  });

  test('error de DB → 500', async () => {
    inventarioModel.crearProducto.mockRejectedValue(new Error('Insert failed'));
    const res = await request(app)
      .post('/api/inventario/productos')
      .send({ Nombre: 'Test', Precio: 10, Stock: 5, IdCategoria: 1 });
    expect(res.statusCode).toBe(500);
  });

});

describe('POST /api/inventario/ordenar (enviarOrdenCompra)', () => {

  const ordenValida = { producto: 'Café molido', cantidad: 5, destino: 'prov@mail.com', motivo: 'Stock bajo', usuarioNombre: 'Admin' };

  beforeEach(() => {
    process.env.EMAIL = 'test@coffeetrack.com';
    process.env.EMAIL_PASSWORD = 'testpass';
  });

  test('orden válida → 200 con messageId', async () => {
    nodemailer.createTransport().sendMail.mockResolvedValue({ messageId: 'abc123' });
    const res = await request(app).post('/api/inventario/ordenar').send(ordenValida);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.messageId).toBe('abc123');
  });

  test('sin configuración de email → 500', async () => {
    delete process.env.EMAIL; delete process.env.EMAIL_USER;
    delete process.env.EMAIL_PASSWORD; delete process.env.EMAIL_PASS;
    const res = await request(app).post('/api/inventario/ordenar').send(ordenValida);
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toContain('Configuración de correo incompleta');
  });

  test('fallo SMTP → 500', async () => {
    nodemailer.createTransport().sendMail.mockRejectedValue(new Error('SMTP error'));
    const res = await request(app).post('/api/inventario/ordenar').send(ordenValida);
    expect(res.statusCode).toBe(500);
  });

});

describe('GET /api/inventario/insumos', () => {

  test('devuelve insumos → 200', async () => {
    inventarioModel.obtenerInsumos.mockResolvedValue([
      { IdInventario: 1, NombreProducto: 'Café molido' },
    ]);
    const res = await request(app).get('/api/inventario/insumos');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  test('error de DB → 500', async () => {
    inventarioModel.obtenerInsumos.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/inventario/insumos');
    expect(res.statusCode).toBe(500);
  });

});

describe('GET /api/inventario/productos/:id/receta', () => {

  test('devuelve receta → 200', async () => {
    inventarioModel.obtenerReceta.mockResolvedValue([
      { IdInventario: 1, CantidadInsumo: 0.02 },
    ]);
    const res = await request(app).get('/api/inventario/productos/1/receta');
    expect(res.statusCode).toBe(200);
    expect(inventarioModel.obtenerReceta).toHaveBeenCalledWith('1');
  });

  test('error de DB → 500', async () => {
    inventarioModel.obtenerReceta.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/inventario/productos/1/receta');
    expect(res.statusCode).toBe(500);
  });

});

describe('PUT /api/inventario/productos/:id/receta', () => {

  test('actualiza receta → 200', async () => {
    inventarioModel.actualizarReceta.mockResolvedValue(true);
    const res = await request(app)
      .put('/api/inventario/productos/1/receta')
      .send({ Receta: [{ IdInventario: 1, CantidadInsumo: 0.03 }] });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Receta actualizada correctamente');
  });

  test('error de DB → 500', async () => {
    inventarioModel.actualizarReceta.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .put('/api/inventario/productos/1/receta')
      .send({ Receta: [] });
    expect(res.statusCode).toBe(500);
  });

});