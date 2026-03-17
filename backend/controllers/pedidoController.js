const Pedido = require('../models/Pedido');
const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');

// Obtener todos los pedidos
exports.getPedidos = async (req, res) => {
    try {
        const pedidos = await Pedido.find()
            .populate('cliente', 'nombre email telefono')
            .populate('productos.producto', 'nombre precio categoria')
            .sort({ fechaPedido: -1 }); // Ordenar por fecha descendente
        
        res.json({
            success: true,
            count: pedidos.length,
            data: pedidos
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener pedidos',
            error: error.message 
        });
    }
};

// Obtener un pedido por ID
exports.getPedidoById = async (req, res) => {
    try {
        const pedido = await Pedido.findById(req.params.id)
            .populate('cliente')
            .populate('productos.producto');
        
        if (!pedido) {
            return res.status(404).json({ 
                success: false, 
                message: 'Pedido no encontrado' 
            });
        }
        
        res.json({
            success: true,
            data: pedido
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener pedido',
            error: error.message 
        });
    }
};

// Crear nuevo pedido
exports.createPedido = async (req, res) => {
    try {
        const { cliente, productos, direccionEnvio } = req.body;

        // Verificar que el cliente existe
        const clienteExistente = await Cliente.findById(cliente);
        if (!clienteExistente) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }

        // Verificar stock y calcular total
        let total = 0;
        const productosValidados = [];

        for (const item of productos) {
            const producto = await Producto.findById(item.producto);
            
            if (!producto) {
                return res.status(404).json({
                    success: false,
                    message: `Producto ${item.producto} no encontrado`
                });
            }

            if (producto.stock < item.cantidad) {
                return res.status(400).json({
                    success: false,
                    message: `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`
                });
            }

            // Calcular subtotal y acumular total
            const precioUnitario = producto.precio;
            total += precioUnitario * item.cantidad;

            productosValidados.push({
                producto: item.producto,
                cantidad: item.cantidad,
                precioUnitario: precioUnitario
            });
        }

        // Crear el pedido
        const pedido = new Pedido({
            cliente,
            productos: productosValidados,
            total,
            direccionEnvio: direccionEnvio || clienteExistente.direccion
        });

        const nuevoPedido = await pedido.save();

        // Actualizar stock de productos
        for (const item of productosValidados) {
            await Producto.findByIdAndUpdate(
                item.producto,
                { $inc: { stock: -item.cantidad } }
            );
        }

        // Poblar los datos para la respuesta
        await nuevoPedido.populate('cliente', 'nombre email');
        await nuevoPedido.populate('productos.producto', 'nombre precio');

        res.status(201).json({
            success: true,
            message: 'Pedido creado exitosamente',
            data: nuevoPedido
        });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            message: 'Error al crear pedido',
            error: error.message 
        });
    }
};

// Actualizar estado del pedido
exports.updatePedidoEstado = async (req, res) => {
    try {
        const { estado } = req.body;
        const estadosValidos = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];

        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({
                success: false,
                message: 'Estado no válido'
            });
        }

        const pedido = await Pedido.findById(req.params.id);
        
        if (!pedido) {
            return res.status(404).json({ 
                success: false, 
                message: 'Pedido no encontrado' 
            });
        }

        // Si se cancela un pedido, restaurar el stock
        if (estado === 'cancelado' && pedido.estado !== 'cancelado') {
            for (const item of pedido.productos) {
                await Producto.findByIdAndUpdate(
                    item.producto,
                    { $inc: { stock: item.cantidad } }
                );
            }
        }

        pedido.estado = estado;
        await pedido.save();

        await pedido.populate('cliente', 'nombre email');
        await pedido.populate('productos.producto', 'nombre precio');

        res.json({
            success: true,
            message: `Pedido ${estado} exitosamente`,
            data: pedido
        });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            message: 'Error al actualizar estado del pedido',
            error: error.message 
        });
    }
};

// Actualizar pedido completo
exports.updatePedido = async (req, res) => {
    try {
        // No permitir actualizar pedidos entregados o cancelados
        const pedidoActual = await Pedido.findById(req.params.id);
        
        if (!pedidoActual) {
            return res.status(404).json({ 
                success: false, 
                message: 'Pedido no encontrado' 
            });
        }

        if (pedidoActual.estado === 'entregado' || pedidoActual.estado === 'cancelado') {
            return res.status(400).json({
                success: false,
                message: `No se puede actualizar un pedido ${pedidoActual.estado}`
            });
        }

        // Aquí iría la lógica de actualización completa
        // Por simplicidad, solo actualizamos campos básicos
        const pedido = await Pedido.findByIdAndUpdate(
            req.params.id,
            { direccionEnvio: req.body.direccionEnvio },
            { new: true }
        )
        .populate('cliente', 'nombre email')
        .populate('productos.producto', 'nombre precio');

        res.json({
            success: true,
            message: 'Pedido actualizado exitosamente',
            data: pedido
        });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            message: 'Error al actualizar pedido',
            error: error.message 
        });
    }
};

// Eliminar pedido
exports.deletePedido = async (req, res) => {
    try {
        const pedido = await Pedido.findById(req.params.id);
        
        if (!pedido) {
            return res.status(404).json({ 
                success: false, 
                message: 'Pedido no encontrado' 
            });
        }

        // No permitir eliminar pedidos entregados
        if (pedido.estado === 'entregado') {
            return res.status(400).json({
                success: false,
                message: 'No se puede eliminar un pedido entregado'
            });
        }

        // Si el pedido no está cancelado, restaurar stock
        if (pedido.estado !== 'cancelado') {
            for (const item of pedido.productos) {
                await Producto.findByIdAndUpdate(
                    item.producto,
                    { $inc: { stock: item.cantidad } }
                );
            }
        }

        await pedido.deleteOne();

        res.json({
            success: true,
            message: 'Pedido eliminado exitosamente'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al eliminar pedido',
            error: error.message 
        });
    }
};

// Obtener pedidos por cliente
exports.getPedidosByCliente = async (req, res) => {
    try {
        const pedidos = await Pedido.find({ cliente: req.params.clienteId })
            .populate('productos.producto', 'nombre precio')
            .sort({ fechaPedido: -1 });

        res.json({
            success: true,
            count: pedidos.length,
            data: pedidos
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener pedidos del cliente',
            error: error.message 
        });
    }
};

// Obtener pedidos por estado
exports.getPedidosByEstado = async (req, res) => {
    try {
        const pedidos = await Pedido.find({ estado: req.params.estado })
            .populate('cliente', 'nombre email')
            .populate('productos.producto', 'nombre')
            .sort({ fechaPedido: -1 });

        res.json({
            success: true,
            count: pedidos.length,
            data: pedidos
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener pedidos por estado',
            error: error.message 
        });
    }
};

// Obtener estadísticas de pedidos
exports.getPedidosEstadisticas = async (req, res) => {
    try {
        const totalPedidos = await Pedido.countDocuments();
        const pedidosPorEstado = await Pedido.aggregate([
            {
                $group: {
                    _id: "$estado",
                    count: { $sum: 1 },
                    totalVentas: { $sum: "$total" }
                }
            }
        ]);

        const ventasTotales = await Pedido.aggregate([
            {
                $match: { estado: { $ne: 'cancelado' } }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$total" },
                    promedio: { $avg: "$total" }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                totalPedidos,
                pedidosPorEstado,
                ventasTotales: ventasTotales[0] || { total: 0, promedio: 0 }
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener estadísticas',
            error: error.message 
        });
    }
};

// Obtener pedidos por rango de fechas
exports.getPedidosByFechas = async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;
        
        const pedidos = await Pedido.find({
            fechaPedido: {
                $gte: new Date(fechaInicio),
                $lte: new Date(fechaFin)
            }
        })
        .populate('cliente', 'nombre')
        .sort({ fechaPedido: -1 });

        res.json({
            success: true,
            count: pedidos.length,
            data: pedidos
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener pedidos por fechas',
            error: error.message 
        });
    }
};