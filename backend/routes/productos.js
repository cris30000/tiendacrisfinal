const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

router.get('/', productoController.getProductos);
router.get('/bajo-stock', productoController.getProductosBajoStock);
router.get('/categoria/:categoria', productoController.getProductosByCategoria);
router.get('/:id', productoController.getProductoById);
router.post('/', productoController.createProducto);
router.put('/:id', productoController.updateProducto);
router.patch('/:id/stock', productoController.updateStock);
router.delete('/:id', productoController.deleteProducto);

module.exports = router;