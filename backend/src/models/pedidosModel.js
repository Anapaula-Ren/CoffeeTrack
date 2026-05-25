const { sequelize, Sequelize } = require('../config/sql.js');
const ClientesModel = require('./clientesModel');
const Cliente = ClientesModel.sequelizeModel;

// 1. Definición de Modelos Sequelize
class Pedido extends Sequelize.Model {}
Pedido.init({
  IdPedido: {
    type: Sequelize.DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  IdCliente: Sequelize.DataTypes.INTEGER,
  Fecha: {
    type: Sequelize.DataTypes.DATE,
    defaultValue: Sequelize.NOW
  },
  Total: Sequelize.DataTypes.DECIMAL(10, 2),
  IdUsuario: Sequelize.DataTypes.INTEGER,
  Estado: Sequelize.DataTypes.STRING
}, {
  sequelize,
  modelName: 'Pedido',
  tableName: 'Pedidos',
  schema: 'cafeteriadb',
  timestamps: false
});

class DetallePedido extends Sequelize.Model {}
DetallePedido.init({
  IdPedido: {
    type: Sequelize.DataTypes.INTEGER,
    primaryKey: true
  },
  IdProducto: {
    type: Sequelize.DataTypes.INTEGER,
    primaryKey: true
  },
  Cantidad: Sequelize.DataTypes.INTEGER,
  Subtotal: Sequelize.DataTypes.DECIMAL(10, 2)
}, {
  sequelize,
  modelName: 'DetallePedido',
  tableName: 'DetallePedidos',
  schema: 'cafeteriadb',
  timestamps: false
});

class TipoLeche extends Sequelize.Model {}
TipoLeche.init({
  IdLeche: {
    type: Sequelize.DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Nombre: Sequelize.DataTypes.STRING,
  IdInventario: Sequelize.DataTypes.INTEGER,
  CantidadBase: Sequelize.DataTypes.DECIMAL(10, 3)
}, {
  sequelize,
  modelName: 'TipoLeche',
  tableName: 'TiposLeche',
  schema: 'cafeteriadb',
  timestamps: false
});

class ShotCafe extends Sequelize.Model {}
ShotCafe.init({
  CantidadShots: {
    type: Sequelize.DataTypes.INTEGER,
    primaryKey: true
  },
  ExtraCafe: Sequelize.DataTypes.DECIMAL(10, 3)
}, {
  sequelize,
  modelName: 'ShotCafe',
  tableName: 'ShotsCafe',
  schema: 'cafeteriadb',
  timestamps: false
});

// Importar modelos necesarios para relaciones
const InventarioModel = require('./inventarioModel');
const { Producto, Inventario, Receta } = InventarioModel.models;
const UsuariosModel = require('./usuariosModel');
const Usuario = UsuariosModel.sequelizeModel;

// Relaciones
Pedido.belongsTo(Cliente, { foreignKey: 'IdCliente', as: 'ClienteDetalle' });
Pedido.belongsTo(Usuario, { foreignKey: 'IdUsuario', as: 'UsuarioDetalle' });
Pedido.hasMany(DetallePedido, { foreignKey: 'IdPedido', as: 'Detalles' });
DetallePedido.belongsTo(Producto, { foreignKey: 'IdProducto', as: 'ProductoDetalle' });

class PedidosModel {
  static get models() {
    return { Pedido, DetallePedido, TipoLeche, ShotCafe };
  }

  static async obtenerPedidosPendientes() {
    return await Pedido.findAll({
      where: { Estado: 'Pendiente' },
      include: [
        { model: Cliente, as: 'ClienteDetalle', attributes: ['Nombre'] },
        { model: Usuario, as: 'UsuarioDetalle', attributes: ['Nombre'] }
      ],
      order: [['Fecha', 'DESC']]
    });
  }

  static async obtenerPedidosCompletados() {
    return await Pedido.findAll({
      where: { Estado: 'Completado' },
      include: [
        { model: Cliente, as: 'ClienteDetalle', attributes: ['Nombre'] },
        { model: Usuario, as: 'UsuarioDetalle', attributes: ['Nombre'] }
      ],
      order: [['Fecha', 'DESC']]
    });
  }

  static async obtenerDetallePedido(id) {
    return await DetallePedido.findAll({
      where: { IdPedido: id },
      include: {
        model: Producto,
        as: 'ProductoDetalle',
        attributes: ['Nombre', 'Precio']
      }
    });
  }

  static async obtenerClientePedido(id) {
    const pedido = await Pedido.findByPk(id, {
      include: {
        model: Cliente,
        as: 'ClienteDetalle',
        attributes: ['Nombre', 'Email']
      }
    });
    return pedido ? pedido.ClienteDetalle : null;
  }

  static async completarPedido(id) {
    const affected = await Pedido.update(
      { Estado: 'Completado' },
      { where: { IdPedido: id } }
    );
    return affected[0];
  }

  static async obtenerTiposLeche() {
    return await TipoLeche.findAll({ order: [['Nombre', 'ASC']] });
  }

  static async crearPedido({ idCliente, total, idUsuario, productos }) {
    const t = await sequelize.transaction();
    try {
      // 1. Calcular IVA usando función SQL Server
      const [ivaRes] = await sequelize.query(
        'SELECT cafeteriadb.CalcularIVA(:total) AS iva',
        { replacements: { total }, type: Sequelize.QueryTypes.SELECT, transaction: t }
      );
      const iva = parseFloat(ivaRes.iva);
      const totalConIVA = parseFloat((parseFloat(total) + iva).toFixed(2));

      // 2. Crear Pedido
      const newPedido = await Pedido.create({
        IdCliente: idCliente,
        Total: totalConIVA,
        IdUsuario: idUsuario,
        Estado: 'Pendiente'
      }, { transaction: t });

      const idPedido = newPedido.IdPedido;

      // 3. Crear Detalles y aplicar lógica personalizada
      for (const prod of productos) {
        await DetallePedido.create({
          IdPedido: idPedido,
          IdProducto: prod.id,
          Cantidad: prod.cantidad,
          Subtotal: prod.subtotal
        }, { transaction: t });

        if (prod.personalizado) {
          const { idLeche, shots } = prod.personalizado;

          // Recetas base del producto
          const baseRecipe = await Receta.findAll({
            where: { IdProducto: prod.id },
            transaction: t
          });

          // Obtener tipos leches disponibles en BD para reversar si corresponde
          const allMilks = await TipoLeche.findAll({ transaction: t });
          const allMilkInventarioIds = allMilks.map(m => m.IdInventario);

          const originalMilkInsumo = baseRecipe.find(item => allMilkInventarioIds.includes(item.IdInventario));

          // A. Deshacer el descuento automático del trigger para la leche base
          if (originalMilkInsumo) {
            await Inventario.increment(
              { Cantidad: parseFloat(originalMilkInsumo.CantidadInsumo) },
              { where: { IdInventario: originalMilkInsumo.IdInventario }, transaction: t }
            );
          }

          // B. Descontar leche seleccionada
          if (idLeche > 0) {
            const selectedMilk = await TipoLeche.findByPk(idLeche, { transaction: t });
            if (selectedMilk) {
              const milkInv = await Inventario.findByPk(selectedMilk.IdInventario, { transaction: t });
              if (milkInv) {
                const currentStock = parseFloat(milkInv.Cantidad);
                const reqQty = parseFloat(selectedMilk.CantidadBase);
                if (currentStock < reqQty) {
                  throw new Error(`Stock insuficiente para '${milkInv.NombreProducto}'. Disponible: ${currentStock}, Requerido: ${reqQty}`);
                }
                
                await Inventario.decrement(
                  { Cantidad: reqQty },
                  { where: { IdInventario: selectedMilk.IdInventario }, transaction: t }
                );
              }
            }
          }

          // C. Descontar extra café (shots)
          if (shots > 0) {
            const shotConfig = await ShotCafe.findByPk(shots, { transaction: t });
            if (shotConfig) {
              const extraCafe = parseFloat(shotConfig.ExtraCafe);
              const coffeeInv = await Inventario.findOne({
                where: { NombreProducto: 'Café molido' },
                transaction: t
              });

              if (coffeeInv) {
                const currentStock = parseFloat(coffeeInv.Cantidad);
                if (currentStock < extraCafe) {
                  throw new Error(`Stock insuficiente para 'Café molido'. Disponible: ${currentStock}, Requerido: ${extraCafe}`);
                }

                await Inventario.decrement(
                  { Cantidad: extraCafe },
                  { where: { IdInventario: coffeeInv.IdInventario }, transaction: t }
                );
              }
            }
          }
        }
      }

      await t.commit();
      return { idPedido, totalConIVA };

    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  static async crearPedidoPersonalizado({ idProducto, idLeche, shots, idCliente, idUsuario }) {
    const t = await sequelize.transaction();
    try {
      // 1. Receta base
      const baseRecipe = await Receta.findAll({
        where: { IdProducto: idProducto },
        transaction: t
      });

      // 2. Leche seleccionada
      let newMilk = null;
      if (idLeche > 0) {
        newMilk = await TipoLeche.findByPk(idLeche, { transaction: t });
        if (!newMilk) {
          throw new Error('El tipo de leche seleccionado no existe.');
        }
      }

      // 3. Todas las leches
      const allMilks = await TipoLeche.findAll({ transaction: t });
      const allMilkInventarioIds = allMilks.map(m => m.IdInventario);

      // 4. Configuración shots
      let extraCafe = 0;
      if (shots > 0) {
        const shotConfig = await ShotCafe.findByPk(shots, { transaction: t });
        if (!shotConfig) {
          throw new Error('La cantidad de shots seleccionada no es válida.');
        }
        extraCafe = parseFloat(shotConfig.ExtraCafe);
      }

      // 5. Modificar receta en memoria
      const modifiedRecipe = baseRecipe
        .filter(item => !allMilkInventarioIds.includes(item.IdInventario))
        .map(item => ({
          IdInventario: item.IdInventario,
          CantidadInsumo: parseFloat(item.CantidadInsumo)
        }));

      if (newMilk) {
        modifiedRecipe.push({
          IdInventario: newMilk.IdInventario,
          CantidadInsumo: parseFloat(newMilk.CantidadBase)
        });
      }

      if (extraCafe > 0) {
        const coffeeInv = await Inventario.findOne({
          where: { NombreProducto: 'Café molido' },
          transaction: t
        });
        if (!coffeeInv) {
          throw new Error("No se encontró el insumo 'Café molido' en el inventario.");
        }

        const coffeeIndex = modifiedRecipe.findIndex(item => item.IdInventario === coffeeInv.IdInventario);
        if (coffeeIndex !== -1) {
          modifiedRecipe[coffeeIndex].CantidadInsumo += extraCafe;
        } else {
          modifiedRecipe.push({
            IdInventario: coffeeInv.IdInventario,
            CantidadInsumo: extraCafe
          });
        }
      }

      // 6. Validar y descontar stock
      for (const item of modifiedRecipe) {
        const invItem = await Inventario.findByPk(item.IdInventario, { transaction: t });
        if (!invItem) {
          throw new Error(`El insumo con ID ${item.IdInventario} no se encuentra en el inventario.`);
        }

        const currentStock = parseFloat(invItem.Cantidad);
        const requiredAmount = item.CantidadInsumo;

        if (currentStock < requiredAmount) {
          throw new Error(`Stock insuficiente para '${invItem.NombreProducto}'. Disponible: ${currentStock}, Requerido: ${requiredAmount}`);
        }

        // Descontar inventario
        await Inventario.decrement(
          { Cantidad: requiredAmount },
          { where: { IdInventario: item.IdInventario }, transaction: t }
        );
      }

      // 7. Crear el pedido
      const prodInfo = await Producto.findByPk(idProducto, { transaction: t });
      if (!prodInfo) {
        throw new Error('Producto no encontrado en el catálogo de productos.');
      }

      const precioBase = parseFloat(prodInfo.Precio);
      const nombreProdCat = prodInfo.Nombre;

      const [ivaRes] = await sequelize.query(
        'SELECT cafeteriadb.CalcularIVA(:precio) AS iva',
        { replacements: { precio: precioBase }, type: Sequelize.QueryTypes.SELECT, transaction: t }
      );
      const iva = parseFloat(ivaRes.iva);
      const totalConIVA = parseFloat((precioBase + iva).toFixed(2));

      // Insertar en Pedidos
      const newPedido = await Pedido.create({
        IdCliente: idCliente,
        Total: totalConIVA,
        IdUsuario: idUsuario,
        Estado: 'Pendiente'
      }, { transaction: t });

      // Insertar en DetallePedidos
      await DetallePedido.create({
        IdPedido: newPedido.IdPedido,
        IdProducto: idProducto,
        Cantidad: 1,
        Subtotal: precioBase
      }, { transaction: t });

      await t.commit();
      return { idPedido: newPedido.IdPedido, producto: nombreProdCat };

    } catch (innerError) {
      await t.rollback();
      throw innerError;
    }
  }

}

module.exports = PedidosModel;
