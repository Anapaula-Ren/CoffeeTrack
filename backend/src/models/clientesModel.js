const { sequelize, Sequelize } = require('../config/sql');

class Cliente extends Sequelize.Model {}
Cliente.init({
  IdCliente: {
    type: Sequelize.DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Nombre: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false
  },
  Email: {
    type: Sequelize.DataTypes.STRING,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Cliente',
  tableName: 'Clientes',
  schema: 'cafeteriadb',
  timestamps: false
});

class ClientesModel {
  static get sequelizeModel() {
    return Cliente;
  }

  static async buscarPorNombre(nombre) {
    const { Op } = Sequelize;
    return await Cliente.findAll({
      where: {
        Nombre: {
          [Op.like]: `%${nombre}%`
        }
      }
    });
  }

  static async crear(nombre, email) {
    return await Cliente.create({
      Nombre: nombre,
      Email: email || null
    });
  }
}

module.exports = ClientesModel;
