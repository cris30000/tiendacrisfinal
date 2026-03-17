const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');

router.get('/', pedidoController.getPedidos);
router.get('/estadisticas', pedidoController.getPedidosEstadisticas);
router.get('/cliente/:clienteId', pedidoController.getPedidosByCliente);
router.get('/estado/:estado', pedidoController.getPedidosByEstado);
router.get('/rango-fechas', pedidoController.getPedidosByFechas);
router.get('/:id', pedidoController.getPedidoById);
router.post('/', pedidoController.createPedido);
router.put('/:id', pedidoController.updatePedido);
router.patch('/:id/estado', pedidoController.updatePedidoEstado);
router.delete('/:id', pedidoController.deletePedido);

module.exports = router;