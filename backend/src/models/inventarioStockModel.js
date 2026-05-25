const { sequelize, Sequelize } = require('../config/sql');
const InventarioModel = require('./inventarioModel');
const { Inventario, Receta } = InventarioModel.models;

class CategoriasInventario extends Sequelize.Model {}
CategoriasInventario.init({
  IdCategoriaInventario: {
    type: Sequelize.DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Nombre: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false
  },
  Descripcion: {
    type: Sequelize.DataTypes.STRING,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'CategoriasInventario',
  tableName: 'categorias_inventario',
  schema: 'cafeteriadb',
  timestamps: false
});

// Relación
Inventario.belongsTo(CategoriasInventario, { foreignKey: 'IdCategoriaInventario', as: 'CategoriaDetalle' });

class InventarioStockModel {
  static get sequelizeModel() {
    return CategoriasInventario;
  }

  static async obtenerProducto(id) {
    return await Inventario.findByPk(id);
  }

  static async actualizarProducto(id, cantidad) {
    const affected = await Inventario.update(
      { Cantidad: cantidad },
      { where: { IdInventario: id } }
    );
    
    if (affected[0] === 0) {
      throw new Error('No se pudo actualizar - ninguna fila afectada');
    }

    return await Inventario.findByPk(id);
  }

  static async obtenerProductosPorCategoria(idCategoria) {
    return await Inventario.findAll({
      where: { IdCategoriaInventario: idCategoria },
      include: {
        model: CategoriasInventario,
        as: 'CategoriaDetalle'
      },
      order: [['NombreProducto', 'ASC']]
    });
  }

  static async obtenerCategorias() {
    return await CategoriasInventario.findAll({
      order: [['Nombre', 'ASC']]
    });
  }

  static async crearProducto({ IdCategoriaInventario, NombreProducto, Cantidad, ImagenUrl }) {
    const prod = await Inventario.create({
      IdCategoriaInventario,
      NombreProducto,
      Cantidad,
      ImagenUrl: ImagenUrl || null
    });
    return prod.IdInventario;
  }

  static async eliminarProducto(id) {
    const t = await sequelize.transaction();
    try {
      // 1. Eliminar referencias del producto en recetas
      await Receta.destroy({
        where: { IdInventario: id },
        transaction: t
      });

      // 2. Eliminar el producto de la tabla inventario
      const deletedRows = await Inventario.destroy({
        where: { IdInventario: id },
        transaction: t
      });

      if (deletedRows === 0) {
        throw new Error('Producto no encontrado en inventario');
      }

      await t.commit();
      return true;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  static async obtenerStatusDB() {
    // Verificar conectividad simple
    await sequelize.authenticate();

    // Consulta de metadatos de las tablas
    const [tablas] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'cafeteriadb' AND TABLE_NAME IN ('inventario', 'categorias_inventario')
    `);

    const tableNames = tablas.map(t => t.TABLE_NAME.toLowerCase());
    const totalCount = await Inventario.count();

    return {
      database: 'conectado',
      tablas: {
        inventario: tableNames.includes('inventario'),
        categorias_inventario: tableNames.includes('categorias_inventario')
      },
      total_productos: totalCount
    };
  }

  static async obtenerInventarioCompleto() {
    // Consulta directa de vista SQL Server
    const [result] = await sequelize.query(`
      SELECT * FROM cafeteriadb.vw_inventario_completo
      ORDER BY Categoria, Nombre
    `);
    return result;
  }

  static async obtenerStockCritico() {
    // Consulta directa de vista SQL Server
    const [result] = await sequelize.query(`
      SELECT * FROM cafeteriadb.vw_stock_critico
      ORDER BY Cantidad ASC
    `);
    return result;
  }

  static async obtenerStockBajo() {
    const { Op } = Sequelize;
    return await Inventario.findAll({
      where: {
        Cantidad: { [Op.lt]: 5 }
      },
      include: {
        model: CategoriasInventario,
        as: 'CategoriaDetalle'
      },
      order: [['Cantidad', 'ASC']]
    });
  }
}

module.exports = InventarioStockModel;
