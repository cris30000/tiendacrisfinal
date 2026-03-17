const express = require('express');
const router = express.Router();
const proveedorController = require('../controllers/proveedorController');

router.get('/', proveedorController.getProveedores);
router.get('/search', proveedorController.searchProveedores);
router.get('/estado/:estado', proveedorController.getProveedoresByEstado);
router.get('/:id', proveedorController.getProveedorById);
router.get('/:id/productos', proveedorController.getProductosByProveedor);
router.post('/', proveedorController.createProveedor);
router.put('/:id', proveedorController.updateProveedor);
router.delete('/:id', proveedorController.deleteProveedor);

module.exports = router;