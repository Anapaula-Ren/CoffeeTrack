const bcrypt = require('bcrypt');
const usuariosModel = require('../models/usuariosModel');
const { AppError } = require('../middleware/errorHandler');
const RegistroLog = require('../models/RegistroLog');
const ActividadLog = require('../models/ActividadLog');

class UsuariosService {
  async obtenerUsuarios() {
    return await usuariosModel.obtenerUsuarios();
  }

  async crearUsuario({ nombre, correo, contrasena, rol }) {

    const existente = await usuariosModel.buscarPorCorreo(correo);

    if (existente) {
      throw new AppError('El correo ya está registrado.', 400);
    }

    const saltRounds = 10;

    const hashedPassword = await bcrypt.hash(
      contrasena,
      saltRounds
    );

    const usuarioCreado = await usuariosModel.insertarUsuario({

      nombre,

      correo,

      contrasena: hashedPassword,

      rol

    });

    // LOG MONGODB

    try {

      await RegistroLog.create({

        usuario: nombre,

        correo: correo

      });

      await ActividadLog.create({

    tipo: 'REGISTRO_USUARIO',

    usuario: correo,

    descripcion: 'Nuevo usuario registrado'

});

      console.log('USUARIO REGISTRADO EN MONGO');

    } catch (mongoError) {

      console.log('ERROR REGISTRO LOG');

      console.log(mongoError);

    }

    return usuarioCreado;
}

  async actualizarUsuario(id, data) {
    return await usuariosModel.actualizarUsuario(id, data);
  }

  async eliminarUsuario(id) {
    return await usuariosModel.eliminarUsuario(id);
  }
}

module.exports = new UsuariosService();
