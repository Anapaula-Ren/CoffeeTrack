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

jest.mock('../models/pedidosModel', () => ({
  obtenerPedidosPendientes: jest.fn(),
  obtenerPedidosCompletados: jest.fn(),
  obtenerDetallePedido: jest.fn(),
  obtenerClientePedido: jest.fn(),
  obtenerTiposLeche: jest.fn(),
  completarPedido: jest.fn(),
  crearPedido: jest.fn(),
  crearPedidoPersonalizado: jest.fn(),
}));

jest.mock('../services/pedidosService', () => ({
  obtenerPedidosPendientes: jest.fn(),
  obtenerPedidosCompletados: jest.fn(),
  obtenerDetallePedido: jest.fn(),
  obtenerClientePedido: jest.fn(),
  obtenerTiposLeche: jest.fn(),
  completarPedido: jest.fn(),
  crearPedido: jest.fn(),
  crearPedidoPersonalizado: jest.fn(),
  enviarTicket: jest.fn(),
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
  app.use('/api/pedidos', require('../routes/pedidos'));
  app.use(ErrorHandler.handle);
  return app;
}

const pedidosService = require('../services/pedidosService');

let app;
beforeAll(() => {
  app = buildApp();
});

const PEDIDOS_PENDIENTES_MOCK = [
  {
    IdPedido: 1,
    IdCliente: 1,
    Fecha: '2024-05-27T10:30:00',
    Total: 87.20,
    Estado: 'Pendiente',
    IdUsuario: 1,
    NombreCliente: 'Juan Pérez',
    NombreUsuario: 'Admin User',
    IVA: 13.20,
  },
  {
    IdPedido: 2,
    IdCliente: 2,
    Fecha: '2024-05-27T11:00:00',
    Total: 116.00,
    Estado: 'Pendiente',
    IdUsuario: 1,
    NombreCliente: 'María López',
    NombreUsuario: 'Admin User',
    IVA: 16.00,
  },
];

const PEDIDOS_COMPLETADOS_MOCK = [
  {
    IdPedido: 3,
    IdCliente: 3,
    Fecha: '2024-05-26T14:30:00',
    Total: 98.00,
    Estado: 'Completado',
    IdUsuario: 1,
    NombreCliente: 'Carlos García',
    NombreUsuario: 'Admin User',
    IVA: 14.00,
  },
];

const TIPOS_LECHE_MOCK = [
  { IdLeche: 1, Nombre: 'Leche entera' },
  { IdLeche: 2, Nombre: 'Leche descremada' },
  { IdLeche: 3, Nombre: 'Leche de almendra' },
];

const DETALLE_PEDIDO_MOCK = [
  {
    IdPedido: 1,
    IdProducto: 1,
    Cantidad: 2,
    Subtotal: 50.00,
    NombreProducto: 'Espresso',
    PrecioUnitario: 25.00,
  },
  {
    IdPedido: 1,
    IdProducto: 2,
    Cantidad: 1,
    Subtotal: 30.00,
    NombreProducto: 'Capuchino',
    PrecioUnitario: 30.00,
  },
];

const CLIENTE_PEDIDO_MOCK = {
  Nombre: 'Juan Pérez',
  Email: 'juan@example.com',
};

describe('GET /api/pedidos', () => {
  beforeEach(() => jest.clearAllMocks());

  test('obtiene pedidos pendientes → 200 con lista', async () => {
    pedidosService.obtenerPedidosPendientes.mockResolvedValue(PEDIDOS_PENDIENTES_MOCK);

    const res = await request(app)
      .get('/api/pedidos');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toMatchObject({
      IdPedido: 1,
      Estado: 'Pendiente',
      NombreCliente: 'Juan Pérez',
    });
  });

  test('sin pedidos pendientes → 200 con array vacío', async () => {
    pedidosService.obtenerPedidosPendientes.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/pedidos');

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(0);
  });

  test('error de base de datos → 500', async () => {
    pedidosService.obtenerPedidosPendientes.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .get('/api/pedidos');

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/pedidos/completados', () => {
  beforeEach(() => jest.clearAllMocks());

  test('obtiene pedidos completados → 200', async () => {
    pedidosService.obtenerPedidosCompletados.mockResolvedValue(PEDIDOS_COMPLETADOS_MOCK);

    const res = await request(app)
      .get('/api/pedidos/completados');

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].Estado).toBe('Completado');
  });

  test('sin pedidos completados → 200 con array vacío', async () => {
    pedidosService.obtenerPedidosCompletados.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/pedidos/completados');

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(0);
  });
});

describe('GET /api/pedidos/leches', () => {
  beforeEach(() => jest.clearAllMocks());

  test('obtiene tipos de leche → 200', async () => {
    pedidosService.obtenerTiposLeche.mockResolvedValue(TIPOS_LECHE_MOCK);

    const res = await request(app)
      .get('/api/pedidos/leches');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(3);
    expect(res.body[0].Nombre).toBe('Leche entera');
  });

  test('error al obtener leches → 500', async () => {
    pedidosService.obtenerTiposLeche.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .get('/api/pedidos/leches');

    expect(res.statusCode).toBe(500);
  });
});

describe('GET /api/pedidos/:id/detalle', () => {
  beforeEach(() => jest.clearAllMocks());

  test('obtiene detalle del pedido → 200', async () => {
    pedidosService.obtenerDetallePedido.mockResolvedValue(DETALLE_PEDIDO_MOCK);

    const res = await request(app)
      .get('/api/pedidos/1/detalle');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0].NombreProducto).toBe('Espresso');
  });

  test('pedido no encontrado → 200 con array vacío', async () => {
    pedidosService.obtenerDetallePedido.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/pedidos/999/detalle');

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(0);
  });
});

describe('GET /api/pedidos/:id/cliente', () => {
  beforeEach(() => jest.clearAllMocks());

  test('obtiene cliente del pedido → 200', async () => {
    pedidosService.obtenerClientePedido.mockResolvedValue(CLIENTE_PEDIDO_MOCK);

    const res = await request(app)
      .get('/api/pedidos/1/cliente');

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      nombre: 'Juan Pérez',
      email: 'juan@example.com',
    });
  });

  test('pedido no encontrado → 404', async () => {
    pedidosService.obtenerClientePedido.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/pedidos/999/cliente');

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Pedido no encontrado');
  });
});

describe('PUT /api/pedidos/:id/completar', () => {
  beforeEach(() => jest.clearAllMocks());

  test('completa pedido exitosamente → 200', async () => {
    pedidosService.completarPedido.mockResolvedValue(1);

    const res = await request(app)
      .put('/api/pedidos/1/completar');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('Completado');
  });

  test('pedido no encontrado → 404', async () => {
    pedidosService.completarPedido.mockResolvedValue(0);

    const res = await request(app)
      .put('/api/pedidos/999/completar');

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Pedido no encontrado.');
  });

  test('error de base de datos → 500', async () => {
    pedidosService.completarPedido.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .put('/api/pedidos/1/completar');

    expect(res.statusCode).toBe(500);
  });
});

describe('POST /api/pedidos/personalizado', () => {
  beforeEach(() => jest.clearAllMocks());

  test('crea pedido personalizado → 200', async () => {
    pedidosService.crearPedidoPersonalizado.mockResolvedValue({
      idPedido: 10,
      producto: 'Capuchino personalizado',
    });

    const res = await request(app)
      .post('/api/pedidos/personalizado')
      .send({
        idProducto: 2,
        tipoLeche: 1,
        shots: 2,
        idCliente: 1,
        idUsuario: 1,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.idPedido).toBe(10);
  });

  test('error al crear pedido → 500', async () => {
    pedidosService.crearPedidoPersonalizado.mockRejectedValue(
      new Error('Stock insuficiente')
    );

    const res = await request(app)
      .post('/api/pedidos/personalizado')
      .send({
        idProducto: 2,
        tipoLeche: 1,
        shots: 2,
        idCliente: 1,
        idUsuario: 1,
      });

    expect(res.statusCode).toBe(500);
  });
});