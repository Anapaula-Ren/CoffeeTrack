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

jest.mock('../services/reportesService', () => ({
  obtenerTopProductos: jest.fn(),
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
  app.use('/api/reportes', require('../routes/reportes'));
  app.use(ErrorHandler.handle);
  return app;
}

const reportesService = require('../services/reportesService');

let app;
beforeAll(() => {
  app = buildApp();
});

const TOP_PRODUCTOS_MOCK = [
  {
    IdProducto: 1,
    Nombre: 'Espresso',
    TotalVentas: 250,
    CantidadVendida: 50,
    Ingresos: 1250.00,
  },
  {
    IdProducto: 2,
    Nombre: 'Capuchino',
    TotalVentas: 180,
    CantidadVendida: 36,
    Ingresos: 1080.00,
  },
  {
    IdProducto: 3,
    Nombre: 'Frappé',
    TotalVentas: 120,
    CantidadVendida: 24,
    Ingresos: 840.00,
  },
];

describe('POST /api/reportes/top', () => {
  beforeEach(() => jest.clearAllMocks());

  test('obtiene top productos con rango válido → 200', async () => {
    reportesService.obtenerTopProductos.mockResolvedValue(TOP_PRODUCTOS_MOCK);

    const res = await request(app)
      .post('/api/reportes/top')
      .send({
        inicio: '2024-05-01',
        fin: '2024-05-31',
      });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(3);
    expect(res.body[0]).toMatchObject({
      IdProducto: 1,
      Nombre: 'Espresso',
      TotalVentas: 250,
    });
  });

  test('obtiene top productos en orden descendente', async () => {
    reportesService.obtenerTopProductos.mockResolvedValue(TOP_PRODUCTOS_MOCK);

    const res = await request(app)
      .post('/api/reportes/top')
      .send({
        inicio: '2024-05-01',
        fin: '2024-05-31',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body[0].TotalVentas).toBeGreaterThanOrEqual(res.body[1].TotalVentas);
    expect(res.body[1].TotalVentas).toBeGreaterThanOrEqual(res.body[2].TotalVentas);
  });

  test('sin datos en rango → 200 con array vacío', async () => {
    reportesService.obtenerTopProductos.mockResolvedValue([]);

    const res = await request(app)
      .post('/api/reportes/top')
      .send({
        inicio: '2024-01-01',
        fin: '2024-01-02',
      });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test('sin fecha inicio → 400 "Campos obligatorios"', async () => {
    const res = await request(app)
      .post('/api/reportes/top')
      .send({
        fin: '2024-05-31',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('obligatorios');
  });

  test('sin fecha fin → 400 "Campos obligatorios"', async () => {
    const res = await request(app)
      .post('/api/reportes/top')
      .send({
        inicio: '2024-05-01',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('obligatorios');
  });

  test('formato de fecha inválido en inicio → 400', async () => {
    const res = await request(app)
      .post('/api/reportes/top')
      .send({
        inicio: 'fecha-invalida',
        fin: '2024-05-31',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('Formato');
  });

  test('formato de fecha inválido en fin → 400', async () => {
    const res = await request(app)
      .post('/api/reportes/top')
      .send({
        inicio: '2024-05-01',
        fin: 'fecha-invalida',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('Formato');
  });

  test('fecha inicio mayor que fecha fin → 400', async () => {
    const res = await request(app)
      .post('/api/reportes/top')
      .send({
        inicio: '2024-05-31',
        fin: '2024-05-01',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('no puede ser mayor');
  });

  test('error de base de datos → 500', async () => {
    reportesService.obtenerTopProductos.mockRejectedValue(
      new Error('Stored procedure error')
    );

    const res = await request(app)
      .post('/api/reportes/top')
      .send({
        inicio: '2024-05-01',
        fin: '2024-05-31',
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });
});