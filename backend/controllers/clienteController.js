const Cliente = require('../models/Cliente');

// Obtener todos los clientes
exports.getClientes = async (req, res) => {
    try {
        const clientes = await Cliente.find();
        res.json(clientes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener un cliente por ID
exports.getClienteById = async (req, res) => {
    try {
        const cliente = await Cliente.findById(req.params.id);
        if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
        res.json(cliente);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Crear nuevo cliente
exports.createCliente = async (req, res) => {
    try {
        const cliente = new Cliente(req.body);
        const nuevoCliente = await cliente.save();
        res.status(201).json(nuevoCliente);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Actualizar cliente
exports.updateCliente = async (req, res) => {
    try {
        const cliente = await Cliente.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        );
        res.json(cliente);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Eliminar cliente
exports.deleteCliente = async (req, res) => {
    try {
        await Cliente.findByIdAndDelete(req.params.id);
        res.json({ message: 'Cliente eliminado' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};