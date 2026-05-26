describe('Configuración SQL (Sequelize)', () => {

  beforeEach(() => jest.resetModules());

  test('exporta instancia de sequelize con método authenticate', () => {
    jest.mock('../config/sql', () => {
      const { Sequelize } = jest.requireActual('sequelize');
      const sequelize = new Sequelize('sqlite::memory:', { logging: false });
      return { sequelize, Sequelize };
    });

    const { sequelize } = require('../config/sql');
    expect(sequelize).toBeDefined();
    expect(typeof sequelize.authenticate).toBe('function');
  });

  test('sequelize.authenticate() resuelve cuando la DB responde OK', async () => {
    const mockAuthenticate = jest.fn().mockResolvedValue(true);
    jest.mock('../config/sql', () => ({
      sequelize: { authenticate: mockAuthenticate },
      Sequelize: jest.fn(),
    }));

    const { sequelize } = require('../config/sql');
    await expect(sequelize.authenticate()).resolves.not.toThrow();
  });

  test('sequelize.authenticate() rechaza cuando la DB no está disponible', async () => {
    const mockAuthenticate = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));
    jest.mock('../config/sql', () => ({
      sequelize: { authenticate: mockAuthenticate },
      Sequelize: jest.fn(),
    }));

    const { sequelize } = require('../config/sql');
    await expect(sequelize.authenticate()).rejects.toThrow('ECONNREFUSED');
  });

});

describe('connectMongo (MongoDB)', () => {

  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    jest.resetAllMocks();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  test('conecta exitosamente cuando MONGO_URI está definida', async () => {
    process.env.MONGO_URI = 'mongodb://localhost:27017';
    process.env.MONGO_DB  = 'coffeetrack_test';

    const mockConnect = jest.fn().mockResolvedValue(true);
    jest.mock('mongoose', () => ({ connect: mockConnect }));

    const { connectMongo } = require('../config/nosql');
    await connectMongo();

    expect(mockConnect).toHaveBeenCalledWith(
      'mongodb://localhost:27017',
      { dbName: 'coffeetrack_test' }
    );
  });

  test('usa dbName "miapp" por defecto si MONGO_DB no está definida', async () => {
    process.env.MONGO_URI = 'mongodb://localhost:27017';
    delete process.env.MONGO_DB;

    const mockConnect = jest.fn().mockResolvedValue(true);
    jest.mock('mongoose', () => ({ connect: mockConnect }));

    const { connectMongo } = require('../config/nosql');
    await connectMongo();

    expect(mockConnect).toHaveBeenCalledWith(
      'mongodb://localhost:27017',
      { dbName: 'miapp' }
    );
  });

  test('llama process.exit(1) si MONGO_URI no está definida', async () => {
    delete process.env.MONGO_URI;
    jest.mock('mongoose', () => ({ connect: jest.fn() }));

    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});

    const { connectMongo } = require('../config/nosql');
    await connectMongo();

    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });

  test('llama process.exit(1) si mongoose.connect() falla', async () => {
    process.env.MONGO_URI = 'mongodb://localhost:27017';

    const mockConnect = jest.fn().mockRejectedValue(new Error('Connection refused'));
    jest.mock('mongoose', () => ({ connect: mockConnect }));

    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});

    const { connectMongo } = require('../config/nosql');
    await connectMongo();

    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });

});