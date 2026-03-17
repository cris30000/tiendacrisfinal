const Proveedor = require('../models/Proveedor');
const Producto = require('../models/Producto');

// Obtener todos los proveedores
exports.getProveedores = async (req, res) => {
    try {
        const proveedores = await Proveedor.find().populate('productos', 'nombre precio stock');
        
        res.json({
            success: true,
            count: proveedores.length,
            data: proveedores
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener proveedores',
            error: error.message 
        });
    }
};

// Obtener un proveedor por ID
exports.getProveedorById = async (req, res) => {
    try {
        const proveedor = await Proveedor.findById(req.params.id)
            .populate('productos', 'nombre precio stock categoria');
        
        if (!proveedor) {
            return res.status(404).json({ 
                success: false, 
                message: 'Proveedor no encontrado' 
            });
        }
        
        res.json({
            success: true,
            data: proveedor
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener proveedor',
            error: error.message 
        });
    }
};

// Crear nuevo proveedor
exports.createProveedor = async (req, res) => {
    try {
        // Verificar si ya existe un proveedor con el mismo email
        const proveedorExistente = await Proveedor.findOne({ email: req.body.email });
        
        if (proveedorExistente) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un proveedor con este email'
            });
        }

        const proveedor = new Proveedor(req.body);
        const nuevoProveedor = await proveedor.save();
        
        res.status(201).json({
            success: true,
            message: 'Proveedor creado exitosamente',
            data: nuevoProveedor
        });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            message: 'Error al crear proveedor',
            error: error.message 
        });
    }
};

// Actualizar proveedor
exports.updateProveedor = async (req, res) => {
    try {
        // Si se actualiza el email, verificar que no exista otro proveedor con ese email
        if (req.body.email) {
            const proveedorExistente = await Proveedor.findOne({ 
                email: req.body.email,
                _id: { $ne: req.params.id }
            });
            
            if (proveedorExistente) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe otro proveedor con este email'
                });
            }
        }

        const proveedor = await Proveedor.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );

        if (!proveedor) {
            return res.status(404).json({ 
                success: false, 
                message: 'Proveedor no encontrado' 
            });
        }

        res.json({
            success: true,
            message: 'Proveedor actualizado exitosamente',
            data: proveedor
        });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            message: 'Error al actualizar proveedor',
            error: error.message 
        });
    }
};

// Eliminar proveedor
exports.deleteProveedor = async (req, res) => {
    try {
        // Verificar si el proveedor tiene productos asociados
        const productosAsociados = await Producto.find({ proveedor: req.params.id });
        
        if (productosAsociados.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'No se puede eliminar el proveedor porque tiene productos asociados',
                productos: productosAsociados.map(p => p.nombre)
            });
        }

        const proveedor = await Proveedor.findByIdAndDelete(req.params.id);

        if (!proveedor) {
            return res.status(404).json({ 
                success: false, 
                message: 'Proveedor no encontrado' 
            });
        }

        res.json({
            success: true,
            message: 'Proveedor eliminado exitosamente'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al eliminar proveedor',
            error: error.message 
        });
    }
};

// Obtener productos de un proveedor
exports.getProductosByProveedor = async (req, res) => {
    try {
        const productos = await Producto.find({ proveedor: req.params.id });
        
        res.json({
            success: true,
            count: productos.length,
            data: productos
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener productos del proveedor',
            error: error.message 
        });
    }
};

// Buscar proveedores por nombre o empresa
exports.searchProveedores = async (req, res) => {
    try {
        const { termino } = req.query;
        
        const proveedores = await Proveedor.find({
            $or: [
                { nombre: { $regex: termino, $options: 'i' } },
                { empresa: { $regex: termino, $options: 'i' } },
                { email: { $regex: termino, $options: 'i' } }
            ]
        });

        res.json({
            success: true,
            count: proveedores.length,
            data: proveedores
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al buscar proveedores',
            error: error.message 
        });
    }
};

// Obtener proveedores activos/inactivos
exports.getProveedoresByEstado = async (req, res) => {
    try {
        const estado = req.params.estado === 'activos';
        
        const proveedores = await Proveedor.find({ activo: estado });
        
        res.json({
            success: true,
            count: proveedores.length,
            data: proveedores
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener proveedores por estado',
            error: error.message 
        });
    }
};