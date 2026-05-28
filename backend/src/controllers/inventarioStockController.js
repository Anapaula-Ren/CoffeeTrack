const inventarioStockService = require('../services/inventarioStockService');

class InventarioStockController {
  async getProducto(req, res, next) {
    const { id } = req.params;
    try {
      const producto = await inventarioStockService.obtenerProducto(id);
      if (!producto) {
        return res.status(404).json({ success: false, message: 'Producto no encontrado' });
      }
      res.json({ success: true, producto });
    } catch (error) {
      next(error);
    }
  }

  async actualizarProducto(req, res, next) {
    const { id } = req.params;
    const { cantidad } = req.body;
    try {
      const updatedProduct = await inventarioStockService.actualizarProducto(id, cantidad);
      res.json({
        success: true,
        message: 'Producto actualizado correctamente',
        cantidad_actualizada: parseFloat(cantidad),
        producto: {
          id: updatedProduct.IdInventario,
          nombre: updatedProduct.NombreProducto,
          cantidad: updatedProduct.Cantidad
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductosPorCategoria(req, res, next) {
    const { idCategoria } = req.params;
    try {
      const productos = await inventarioStockService.obtenerProductosPorCategoria(idCategoria);
      res.json(productos);
    } catch (error) {
      next(error);
    }
  }

  async getCategorias(req, res, next) {
    try {
      const categorias = await inventarioStockService.obtenerCategorias();
      res.json(categorias);
    } catch (error) {
      next(error);
    }
  }

  async crearProducto(req, res, next) {
    try {
      const id = await inventarioStockService.crearProducto(req.body);
      res.status(201).json({
        success: true,
        message: 'Producto creado correctamente',
        id
      });
    } catch (error) {
      next(error);
    }
  }

  async eliminarProducto(req, res, next) {
    const { id } = req.params;
    try {
      await inventarioStockService.eliminarProducto(id);
      res.json({ success: true, message: 'Producto eliminado correctamente' });
    } catch (error) {
      next(error);
    }
  }

  async getStatus(req, res, next) {
    try {
      const dbStatus = await inventarioStockService.obtenerStatusDB();
      res.json({
        status: 'ok',
        database: dbStatus.database,
        tablas: dbStatus.tablas,
        total_productos: dbStatus.total_productos,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }

  async getInventarioCompleto(req, res, next) {
    try {
      const inventario = await inventarioStockService.obtenerInventarioCompleto();
      res.json(inventario);
    } catch (error) {
      next(error);
    }
  }

  async getStockCritico(req, res, next) {
    try {
      const criticos = await inventarioStockService.obtenerStockCritico();
      res.json(criticos);
    } catch (error) {
      next(error);
    }
  }

  async getStockBajo(req, res, next) {
    try {
      const bajo = await inventarioStockService.obtenerStockBajo();
      res.json(bajo);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InventarioStockController();
