const Producto = require('../models/Producto');

// Obtener todos los productos
exports.getProductos = async (req, res) => {
    try {
        const productos = await Producto.find().populate('proveedor', 'nombre empresa');
        res.json({
            success: true,
            count: productos.length,
            data: productos
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener productos',
            error: error.message 
        });
    }
};

// Obtener un producto por ID
exports.getProductoById = async (req, res) => {
    try {
        const producto = await Producto.findById(req.params.id).populate('proveedor');
        
        if (!producto) {
            return res.status(404).json({ 
                success: false, 
                message: 'Producto no encontrado' 
            });
        }
        
        res.json({
            success: true,
            data: producto
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener producto',
            error: error.message 
        });
    }
};

// Crear nuevo producto
exports.createProducto = async (req, res) => {
    try {
        // Validar que el precio sea positivo
        if (req.body.precio < 0) {
            return res.status(400).json({
                success: false,
                message: 'El precio no puede ser negativo'
            });
        }

        // Validar que el stock no sea negativo
        if (req.body.stock < 0) {
            return res.status(400).json({
                success: false,
                message: 'El stock no puede ser negativo'
            });
        }

        const producto = new Producto(req.body);
        const nuevoProducto = await producto.save();
        
        // Poblar el proveedor para la respuesta
        await nuevoProducto.populate('proveedor', 'nombre empresa');
        
        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            data: nuevoProducto
        });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            message: 'Error al crear producto',
            error: error.message 
        });
    }
};

// Actualizar producto
exports.updateProducto = async (req, res) => {
    try {
        // Validar que el precio sea positivo si viene en la actualización
        if (req.body.precio && req.body.precio < 0) {
            return res.status(400).json({
                success: false,
                message: 'El precio no puede ser negativo'
            });
        }

        // Validar que el stock no sea negativo si viene en la actualización
        if (req.body.stock && req.body.stock < 0) {
            return res.status(400).json({
                success: false,
                message: 'El stock no puede ser negativo'
            });
        }

        const producto = await Producto.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        ).populate('proveedor', 'nombre empresa');

        if (!producto) {
            return res.status(404).json({ 
                success: false, 
                message: 'Producto no encontrado' 
            });
        }

        res.json({
            success: true,
            message: 'Producto actualizado exitosamente',
            data: producto
        });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            message: 'Error al actualizar producto',
            error: error.message 
        });
    }
};

// Eliminar producto
exports.deleteProducto = async (req, res) => {
    try {
        // Verificar si el producto está en algún pedido antes de eliminar
        const Pedido = require('../models/Pedido');
        const pedidoConProducto = await Pedido.findOne({
            'productos.producto': req.params.id
        });

        if (pedidoConProducto) {
            return res.status(400).json({
                success: false,
                message: 'No se puede eliminar el producto porque tiene pedidos asociados'
            });
        }

        const producto = await Producto.findByIdAndDelete(req.params.id);

        if (!producto) {
            return res.status(404).json({ 
                success: false, 
                message: 'Producto no encontrado' 
            });
        }

        res.json({
            success: true,
            message: 'Producto eliminado exitosamente'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al eliminar producto',
            error: error.message 
        });
    }
};

// Actualizar stock
exports.updateStock = async (req, res) => {
    try {
        const { cantidad, operacion } = req.body; // operacion: 'sumar' o 'restar'

        const producto = await Producto.findById(req.params.id);
        
        if (!producto) {
            return res.status(404).json({ 
                success: false, 
                message: 'Producto no encontrado' 
            });
        }

        let nuevoStock;
        if (operacion === 'sumar') {
            nuevoStock = producto.stock + cantidad;
        } else if (operacion === 'restar') {
            if (producto.stock < cantidad) {
                return res.status(400).json({
                    success: false,
                    message: 'Stock insuficiente'
                });
            }
            nuevoStock = producto.stock - cantidad;
        } else {
            return res.status(400).json({
                success: false,
                message: 'Operación no válida. Use "sumar" o "restar"'
            });
        }

        producto.stock = nuevoStock;
        await producto.save();

        res.json({
            success: true,
            message: 'Stock actualizado exitosamente',
            data: {
                producto: producto.nombre,
                stockAnterior: producto.stock - (operacion === 'sumar' ? cantidad : -cantidad),
                stockActual: producto.stock
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al actualizar stock',
            error: error.message 
        });
    }
};

// Obtener productos por categoría
exports.getProductosByCategoria = async (req, res) => {
    try {
        const productos = await Producto.find({ 
            categoria: req.params.categoria,
            activo: true 
        }).populate('proveedor', 'nombre');

        res.json({
            success: true,
            count: productos.length,
            data: productos
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener productos por categoría',
            error: error.message 
        });
    }
};

// Obtener productos con bajo stock
exports.getProductosBajoStock = async (req, res) => {
    try {
        const limite = parseInt(req.query.limite) || 10;
        
        const productos = await Producto.find({ 
            stock: { $lt: limite },
            activo: true 
        }).populate('proveedor', 'nombre empresa telefono');

        res.json({
            success: true,
            count: productos.length,
            data: productos
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener productos con bajo stock',
            error: error.message 
        });
    }
};