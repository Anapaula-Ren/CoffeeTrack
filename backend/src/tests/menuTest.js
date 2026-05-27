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

jest.mock('../models/menuModel', () => ({
  obtenerMenu: jest.fn(),
  obtenerCategorias: jest.fn(),
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
  app.use('/api/menu', require('../routes/menu'));
  app.use(ErrorHandler.handle);
  return app;
}

const menuModel = require('../models/menuModel');

let app;
beforeAll(() => {
  app = buildApp();
});

const MENU_MOCK = [
  {
    IdProducto: 1,
    Nombre: 'Espresso',
    Descripcion: 'Café espresso',
    Precio: 25.00,
    Stock: 100,
    IdCategoria: 1,
    Categoria: { IdCategoria: 1, Nombre: 'Bebidas Calientes' },
  },
  {
    IdProducto: 2,
    Nombre: 'Capuchino',
    Descripcion: 'Capuchino con leche',
    Precio: 30.00,
    Stock: 80,
    IdCategoria: 1,
    Categoria: { IdCategoria: 1, Nombre: 'Bebidas Calientes' },
  },
  {
    IdProducto: 3,
    Nombre: 'Frappé',
    Descripcion: 'Café helado',
    Precio: 35.00,
    Stock: 50,
    IdCategoria: 2,
    Categoria: { IdCategoria: 2, Nombre: 'Bebidas Frías' },
  },
];

const CATEGORIAS_MOCK = [
  { IdCategoria: 1, Nombre: 'Bebidas Calientes' },
  { IdCategoria: 2, Nombre: 'Bebidas Frías' },
  { IdCategoria: 3, Nombre: 'Postres' },
];

describe('GET /api/menu', () => {

  beforeEach(() => jest.clearAllMocks());

  test('obtiene el menú completo → 200 con productos', async () => {
    menuModel.obtenerMenu.mockResolvedValue(MENU_MOCK);

    const res = await request(app)
      .get('/api/menu');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(3);
    expect(res.body[0]).toMatchObject({
      IdProducto: 1,
      Nombre: 'Espresso',
      Precio: 25.00,
    });
  });

  test('menú vacío → 200 con array vacío', async () => {
    menuModel.obtenerMenu.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/menu');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test('error de base de datos → 500', async () => {
    menuModel.obtenerMenu.mockRejectedValue(new Error('Base de datos no disponible'));

    const res = await request(app)
      .get('/api/menu');

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Base de datos');
  });

});

describe('GET /api/menu/categorias', () => {

  beforeEach(() => jest.clearAllMocks());

  test('obtiene categorías → 200 con datos', async () => {
    menuModel.obtenerCategorias.mockResolvedValue(CATEGORIAS_MOCK);

    const res = await request(app)
      .get('/api/menu/categorias');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(3);
    expect(res.body[0]).toMatchObject({
      IdCategoria: 1,
      Nombre: 'Bebidas Calientes',
    });
  });

  test('sin categorías → 200 con array vacío', async () => {
    menuModel.obtenerCategorias.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/menu/categorias');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test('error de base de datos → 500', async () => {
    menuModel.obtenerCategorias.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .get('/api/menu/categorias');

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

});