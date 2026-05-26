const request = require('supertest');
const express = require('express');

jest.mock('../config/sql', () => ({
  sequelize: {
    authenticate: jest.fn(),
    query: jest.fn(),
    transaction: jest.fn(),
    define: jest.fn(),
  },
  Sequelize: {
    Model: class Model { static init(){} static findAll(){} static findByPk(){} static create(){} static update(){} static destroy(){} static count(){} static belongsTo(){} static hasMany(){} },
    DataTypes: { INTEGER: 'INTEGER', STRING: 'STRING', DECIMAL: () => 'DECIMAL' },
    Op: { lt: Symbol('lt') },
  },
}));

jest.mock('../models/inventarioModel', () => ({
  models: {
    Inventario: class M { static init(){} static findAll(){} static findByPk(){} static create(){} static update(){} static destroy(){} static count(){} static belongsTo(){} },
    Receta:     class M { static init(){} static destroy(){} static belongsTo(){} },
    Producto:   class M { static init(){} static belongsTo(){} },
    Categoria:  class M { static init(){} static belongsTo(){} },
  },
  obtenerBebidas: jest.fn(), actualizarStock: jest.fn(),
  crearProducto: jest.fn(), obtenerInsumos: jest.fn(),
  crearNuevoInsumo: jest.fn(), crearProductoConReceta: jest.fn(),
  obtenerReceta: jest.fn(), actualizarReceta: jest.fn(),
}));

jest.mock('../models/inventarioStockModel', () => ({
  obtenerProducto:             jest.fn(),
  actualizarProducto:          jest.fn(),
  obtenerProductosPorCategoria: jest.fn(),
  obtenerCategorias:           jest.fn(),
  crearProducto:               jest.fn(),
  eliminarProducto:            jest.fn(),
  obtenerStatusDB:             jest.fn(),
  obtenerInventarioCompleto:   jest.fn(),
  obtenerStockCritico:         jest.fn(),
  obtenerStockBajo:            jest.fn(),
  sequelizeModel: class M { static init(){} static belongsTo(){} },
}));

const ErrorHandler         = require('../middleware/errorHandler');
const inventarioStockModel = require('../models/inventarioStockModel');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/inventario', require('../routes/inventarioStock'));
  app.use(ErrorHandler.handle);
  return app;
}

let app;
beforeAll(() => { app = buildApp(); });
beforeEach(() => jest.clearAllMocks());

describe('GET /api/inventario/producto/:id', () => {

  test('producto encontrado → 200 con datos', async () => {
    inventarioStockModel.obtenerProducto.mockResolvedValue({
      IdInventario: 1, NombreProducto: 'Café molido', Cantidad: 10
    });
    const res = await request(app).get('/api/inventario/producto/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.producto.NombreProducto).toBe('Café molido');
  });

  test('producto no encontrado → 404', async () => {
    inventarioStockModel.obtenerProducto.mockResolvedValue(null);
    const res = await request(app).get('/api/inventario/producto/999');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Producto no encontrado');
  });

  test('error de DB → 500', async () => {
    inventarioStockModel.obtenerProducto.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/inventario/producto/1');
    expect(res.statusCode).toBe(500);
  });

});

describe('PUT /api/inventario/producto/:id (actualizarProducto)', () => {

  test('cantidad válida → 200 con producto actualizado', async () => {
    inventarioStockModel.actualizarProducto.mockResolvedValue({
      IdInventario: 1, NombreProducto: 'Café molido', Cantidad: 15
    });
    const res = await request(app)
      .put('/api/inventario/producto/1')
      .send({ cantidad: 15 });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.cantidad_actualizada).toBe(15);
    expect(res.body.producto.nombre).toBe('Café molido');
  });

  test('cantidad undefined → 400 por middleware validarCantidad', async () => {
    const res = await request(app)
      .put('/api/inventario/producto/1')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('cantidad es requerida');
    expect(inventarioStockModel.actualizarProducto).not.toHaveBeenCalled();
  });

  test('cantidad no numérica → 400 por middleware validarCantidad', async () => {
    const res = await request(app)
      .put('/api/inventario/producto/1')
      .send({ cantidad: 'abc' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('cantidad debe ser numérica');
  });

  test('ninguna fila afectada → 500', async () => {
    inventarioStockModel.actualizarProducto.mockRejectedValue(
      new Error('No se pudo actualizar - ninguna fila afectada')
    );
    const res = await request(app)
      .put('/api/inventario/producto/1')
      .send({ cantidad: 5 });
    expect(res.statusCode).toBe(500);
  });

});

describe('DELETE /api/inventario/producto/:id', () => {

  test('elimina producto correctamente → 200', async () => {
    inventarioStockModel.eliminarProducto.mockResolvedValue(true);
    const res = await request(app).delete('/api/inventario/producto/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Producto eliminado correctamente');
  });

  test('producto no existe → 500 (lanzado por el model)', async () => {
    inventarioStockModel.eliminarProducto.mockRejectedValue(
      new Error('Producto no encontrado en inventario')
    );
    const res = await request(app).delete('/api/inventario/producto/999');
    expect(res.statusCode).toBe(500);
  });

});

describe('GET /api/inventario/categorias', () => {

  test('devuelve categorías → 200', async () => {
    inventarioStockModel.obtenerCategorias.mockResolvedValue([
      { IdCategoriaInventario: 1, Nombre: 'Lácteos' },
      { IdCategoriaInventario: 2, Nombre: 'Granos' },
    ]);
    const res = await request(app).get('/api/inventario/categorias');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test('error de DB → 500', async () => {
    inventarioStockModel.obtenerCategorias.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/inventario/categorias');
    expect(res.statusCode).toBe(500);
  });

});

describe('GET /api/inventario/categoria/:idCategoria', () => {

  test('devuelve productos de la categoría → 200', async () => {
    inventarioStockModel.obtenerProductosPorCategoria.mockResolvedValue([
      { IdInventario: 1, NombreProducto: 'Leche entera', Cantidad: 5 },
    ]);
    const res = await request(app).get('/api/inventario/categoria/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(inventarioStockModel.obtenerProductosPorCategoria).toHaveBeenCalledWith('1');
  });

  test('error de DB → 500', async () => {
    inventarioStockModel.obtenerProductosPorCategoria.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/inventario/categoria/1');
    expect(res.statusCode).toBe(500);
  });

});

describe('GET /api/inventario/stock-bajo', () => {

  test('devuelve productos con stock bajo → 200', async () => {
    inventarioStockModel.obtenerStockBajo.mockResolvedValue([
      { IdInventario: 3, NombreProducto: 'Azúcar', Cantidad: 2 },
    ]);
    const res = await request(app).get('/api/inventario/stock-bajo');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  test('sin productos con stock bajo → lista vacía', async () => {
    inventarioStockModel.obtenerStockBajo.mockResolvedValue([]);
    const res = await request(app).get('/api/inventario/stock-bajo');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

});

describe('GET /api/inventario/status (conexión DB)', () => {

  test('DB conectada → 200 con status ok', async () => {
    inventarioStockModel.obtenerStatusDB.mockResolvedValue({
      database: 'conectado',
      tablas: { inventario: true, categorias_inventario: true },
      total_productos: 25
    });
    const res = await request(app).get('/api/inventario/status');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database).toBe('conectado');
    expect(res.body.total_productos).toBe(25);
    expect(res.body.timestamp).toBeDefined();
  });

  test('DB no disponible → 500', async () => {
    inventarioStockModel.obtenerStatusDB.mockRejectedValue(new Error('ECONNREFUSED'));
    const res = await request(app).get('/api/inventario/status');
    expect(res.statusCode).toBe(500);
  });

});