const { sequelize, Sequelize } = require('../config/sql.js');

class Usuario extends Sequelize.Model {}
Usuario.init({
  IdUsuario: {
    type: Sequelize.DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Nombre: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false
  },
  Correo: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  Contrasena: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false
  },
  Rol: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Usuario',
  tableName: 'Usuarios',
  schema: 'cafeteriadb',
  timestamps: false
});

class UsuariosModel {
  static get sequelizeModel() {
    return Usuario;
  }

  static async obtenerUsuarios() {
    return await Usuario.findAll({
      attributes: ['IdUsuario', 'Nombre', 'Correo', 'Rol']
    });
  }

  static async buscarPorCorreo(correo) {
    return await Usuario.findOne({
      where: { Correo: correo }
    });
  }

  static async insertarUsuario({ nombre, correo, contrasena, rol }) {
    const user = await Usuario.create({
      Nombre: nombre,
      Correo: correo,
      Contrasena: contrasena,
      Rol: rol
    });
    return user.IdUsuario;
  }

  static async actualizarUsuario(id, { nombre, correo, rol }) {
    await Usuario.update(
      { Nombre: nombre, Correo: correo, Rol: rol },
      { where: { IdUsuario: id } }
    );
  }

  static async eliminarUsuario(id) {
    await Usuario.destroy({
      where: { IdUsuario: id }
    });
  }
}

module.exports = UsuariosModel;
