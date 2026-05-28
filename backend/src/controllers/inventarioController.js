const inventarioService = require('../services/inventarioService');

class InventarioController {
  async getBebidas(req, res, next) {
    try {
      const bebidas = await inventarioService.obtenerBebidas();
      res.json(bebidas);
    } catch (error) {
      next(error);
    }
  }

  async actualizarStock(req, res, next) {
    const { id } = req.params;
    const { stock } = req.body;
    try {
      await inventarioService.actualizarStock(id, stock);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async crearProducto(req, res, next) {
    try {
      const id = await inventarioService.crearProducto(req.body);
      res.status(201).json({ success: true, id });
    } catch (error) {
      next(error);
    }
  }

  async enviarOrdenCompra(req, res, next) {
    try {
      const messageId = await inventarioService.enviarOrdenCompra(req.body);
      res.json({ success: true, message: 'Orden de compra enviada por correo con éxito.', messageId });
    } catch (error) {
      next(error);
    }
  }

  async getInsumos(req, res, next) {
    try {
      const insumos = await inventarioService.obtenerInsumos();
      res.json(insumos);
    } catch (error) {
      next(error);
    }
  }

  async crearNuevoInsumo(req, res, next) {
    try {
      const id = await inventarioService.crearNuevoInsumo(req.body);
      res.status(201).json({ success: true, id });
    } catch (error) {
      next(error);
    }
  }

  async crearProductoConReceta(req, res, next) {
    try {
      const id = await inventarioService.crearProductoConReceta(req.body);
      res.status(201).json({ success: true, id });
    } catch (error) {
      next(error);
    }
  }

  async getReceta(req, res, next) {
    const { id } = req.params;
    try {
      const receta = await inventarioService.obtenerReceta(id);
      res.json(receta);
    } catch (error) {
      next(error);
    }
  }

  async actualizarReceta(req, res, next) {
    const { id } = req.params;
    const { Receta } = req.body;
    try {
      await inventarioService.actualizarReceta(id, Receta);
      res.json({ success: true, message: 'Receta actualizada correctamente' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InventarioController();
