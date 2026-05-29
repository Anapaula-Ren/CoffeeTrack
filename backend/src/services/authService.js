const bcrypt = require('bcrypt');
const usuariosModel = require('../models/usuariosModel');
const { AppError } = require('../middleware/errorHandler');
const ActividadLog = require('../models/ActividadLog');
const LoginLog = require('../models/LoginLog');

console.log('Login');
class AuthService {

  async login(email, password) {

    const usuario = await usuariosModel.buscarPorCorreo(email);

    if (!usuario) {
      throw new AppError('Credenciales inválidas', 401);
    }

    let passwordMatch = false;

    // Validar bcrypt
    try {

      passwordMatch = await bcrypt.compare(
        password,
        usuario.Contrasena
      );

    } catch (error) {

      passwordMatch = false;

    }

    // Compatibilidad texto plano
    if (!passwordMatch) {

      passwordMatch = (
        password === usuario.Contrasena
      );

    }

    if (!passwordMatch) {
      throw new AppError('Credenciales inválidas', 401);
    }

    
    // LOG MONGODB
    try {

      await LoginLog.create({

        usuario: usuario.Correo,

        estado: 'LOGIN_EXITOSO',

        ip: 'LOCAL'

      });

      await ActividadLog.create({

    tipo: 'LOGIN',

    usuario: usuario.Correo,

    descripcion: 'Inicio de sesión exitoso'

});

    } catch (mongoError) {

    console.log('ERROR MONGO');

    console.log(mongoError);

}
    console.log('Login guardado');
    return {

      IdUsuario: usuario.IdUsuario,

      Nombre: usuario.Nombre,

      Rol: usuario.Rol,

      Correo: usuario.Correo

    };
    
  }
  
}



module.exports = new AuthService();