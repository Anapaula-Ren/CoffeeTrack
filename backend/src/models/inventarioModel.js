const { sequelize, Sequelize } = require('../config/sql');

// 1. Definición de Modelos Sequelize
class Categoria extends Sequelize.Model {}
Categoria.init({
  IdCategoria: {
    type: Sequelize.DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Nombre: Sequelize.DataTypes.STRING
}, {
  sequelize,
  modelName: 'Categoria',
  tableName: 'Categorias',
  schema: 'cafeteriadb',
  timestamps: false
});

class Producto extends Sequelize.Model {}
Producto.init({
  IdProducto: {
    type: Sequelize.DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Nombre: Sequelize.DataTypes.STRING,
  Descripcion: Sequelize.DataTypes.STRING,
  Precio: Sequelize.DataTypes.DECIMAL(10, 2),
  Stock: Sequelize.DataTypes.INTEGER,
  IdCategoria: Sequelize.DataTypes.INTEGER,
  ImagenUrl: Sequelize.DataTypes.STRING
}, {
  sequelize,
  modelName: 'Producto',
  tableName: 'Productos',
  schema: 'cafeteriadb',
  timestamps: false
});

class Inventario extends Sequelize.Model {}
Inventario.init({
  IdInventario: {
    type: Sequelize.DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  IdCategoriaInventario: Sequelize.DataTypes.INTEGER,
  NombreProducto: Sequelize.DataTypes.STRING,
  Cantidad: Sequelize.DataTypes.DECIMAL(10, 3),
  ImagenUrl: Sequelize.DataTypes.STRING
}, {
  sequelize,
  modelName: 'Inventario',
  tableName: 'inventario',
  schema: 'cafeteriadb',
  timestamps: false
});

class Receta extends Sequelize.Model {}
Receta.init({
  IdProducto: {
    type: Sequelize.DataTypes.INTEGER,
    primaryKey: true
  },
  IdInventario: {
    type: Sequelize.DataTypes.INTEGER,
    primaryKey: true
  },
  CantidadInsumo: Sequelize.DataTypes.DECIMAL(10, 3)
}, {
  sequelize,
  modelName: 'Receta',
  tableName: 'recetas',
  schema: 'cafeteriadb',
  timestamps: false
});

// Relaciones
Producto.belongsTo(Categoria, { foreignKey: 'IdCategoria' });
Receta.belongsTo(Inventario, { foreignKey: 'IdInventario' });

class InventarioModel {
  static get models() {
    return { Producto, Categoria, Inventario, Receta };
  }

  static async obtenerBebidas() {
    return await Producto.findAll({
      include: {
        model: Categoria,
        where: { Nombre: 'Bebidas' }
      },
      order: [['Nombre', 'ASC']]
    });
  }

  static async actualizarStock(id, stock) {
    await Producto.update({ Stock: stock }, { where: { IdProducto: id } });
  }

  static async crearProducto({ Nombre, Descripcion, Precio, Stock, IdCategoria, Imagen }) {
    const prod = await Producto.create({
      Nombre,
      Descripcion,
      Precio,
      Stock,
      IdCategoria,
      ImagenUrl: Imagen || null
    });
    return prod.IdProducto;
  }

  static async obtenerInsumos() {
    return await Inventario.findAll({
      attributes: ['IdInventario', 'NombreProducto'],
      order: [['NombreProducto', 'ASC']]
    });
  }

  static async crearNuevoInsumo({ nombre, categoria, cantidad, imagen }) {
    const insumo = await Inventario.create({
      IdCategoriaInventario: categoria,
      NombreProducto: nombre,
      Cantidad: cantidad || 0,
      ImagenUrl: imagen || null
    });
    return insumo.IdInventario;
  }

  static async crearProductoConReceta({ Nombre, Descripcion, Precio, Stock, IdCategoria, Imagen, Receta: ingredientes }, tTransaction = null) {
    const useTransaction = tTransaction || await sequelize.transaction();
    try {
      const prod = await Producto.create({
        Nombre,
        Descripcion,
        Precio,
        Stock,
        IdCategoria,
        ImagenUrl: Imagen || null
      }, { transaction: useTransaction });

      if (ingredientes && Array.isArray(ingredientes) && ingredientes.length > 0) {
        for (const ing of ingredientes) {
          await Receta.create({
            IdProducto: prod.IdProducto,
            IdInventario: ing.IdInventario,
            CantidadInsumo: ing.CantidadInsumo
          }, { transaction: useTransaction });
        }
      }

      if (!tTransaction) await useTransaction.commit();
      return prod.IdProducto;
    } catch (err) {
      if (!tTransaction) await useTransaction.rollback();
      throw err;
    }
  }

  static async obtenerReceta(idProducto) {
    return await Receta.findAll({
      where: { IdProducto: idProducto },
      include: {
        model: Inventario,
        attributes: ['NombreProducto']
      }
    });
  }

  static async actualizarReceta(idProducto, ingredientes) {
    const t = await sequelize.transaction();
    try {
      await Receta.destroy({
        where: { IdProducto: idProducto },
        transaction: t
      });

      if (ingredientes && Array.isArray(ingredientes) && ingredientes.length > 0) {
        for (const ing of ingredientes) {
          await Receta.create({
            IdProducto: idProducto,
            IdInventario: ing.IdInventario,
            CantidadInsumo: ing.CantidadInsumo
          }, { transaction: t });
        }
      }

      await t.commit();
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }
}

module.exports = InventarioModel;
