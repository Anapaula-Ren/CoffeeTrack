jest.mock('sequelize', () => {
  const mockAuthenticate = jest.fn();
  const MockSequelize = jest.fn().mockImplementation(() => ({
    authenticate: mockAuthenticate,
  }));
  MockSequelize._mockAuthenticate = mockAuthenticate;
  return { Sequelize: MockSequelize };
});

jest.mock('mongoose', () => ({
  connect: jest.fn(),
}));

const mongoose = require('mongoose');

describe('Configuración SQL (Sequelize)', () => {

  beforeEach(() => {
    jest.resetModules();
    process.env.DB_NAME     = 'testdb';
    process.env.DB_USER     = 'testuser';
    process.env.DB_PASSWORD = 'testpass';
    process.env.DB_SERVER   = 'localhost';
    process.env.DB_PORT     = '1433';
  });

  test('exporta instancia de sequelize', () => {
    const { sequelize } = require('../config/sql');
    expect(sequelize).toBeDefined();
    expect(typeof sequelize.authenticate).toBe('function');
  });

  test('sequelize.authenticate() resuelve cuando la DB responde OK', async () => {
    const { Sequelize } = require('sequelize');
    Sequelize._mockAuthenticate.mockResolvedValue(true);

    const { sequelize } = require('../config/sql');
    await expect(sequelize.authenticate()).resolves.not.toThrow();
  });

  test('sequelize.authenticate() rechaza cuando la DB no está disponible', async () => {
    const { Sequelize } = require('sequelize');
    Sequelize._mockAuthenticate.mockRejectedValue(new Error('ECONNREFUSED'));

    const { sequelize } = require('../config/sql');
    await expect(sequelize.authenticate()).rejects.toThrow('ECONNREFUSED');
  });

});

describe('connectMongo (MongoDB)', () => {

  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  test('conecta exitosamente cuando MONGO_URI está definida', async () => {
    process.env.MONGO_URI = 'mongodb://localhost:27017';
    process.env.MONGO_DB  = 'coffeetrack_test';

    mongoose.connect.mockResolvedValue(true);

    const { connectMongo } = require('../config/nosql');
    await expect(connectMongo()).resolves.not.toThrow();
    expect(mongoose.connect).toHaveBeenCalledWith(
      'mongodb://localhost:27017',
      { dbName: 'coffeetrack_test' }
    );
  });

  test('usa dbName "miapp" por defecto si MONGO_DB no está definida', async () => {
    process.env.MONGO_URI = 'mongodb://localhost:27017';
    delete process.env.MONGO_DB;

    mongoose.connect.mockResolvedValue(true);

    const { connectMongo } = require('../config/nosql');
    await connectMongo();

    expect(mongoose.connect).toHaveBeenCalledWith(
      'mongodb://localhost:27017',
      { dbName: 'miapp' }
    );
  });

  test('llama process.exit(1) si MONGO_URI no está definida', async () => {
    delete process.env.MONGO_URI;

    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});

    const { connectMongo } = require('../config/nosql');
    await connectMongo();

    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });

  test('llama process.exit(1) si mongoose.connect() falla', async () => {
    process.env.MONGO_URI = 'mongodb://localhost:27017';
    mongoose.connect.mockRejectedValue(new Error('Connection refused'));

    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});

    const { connectMongo } = require('../config/nosql');
    await connectMongo();

    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });

});