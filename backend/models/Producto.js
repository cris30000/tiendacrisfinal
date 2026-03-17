const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: String,
    precio: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    categoria: String,
    proveedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Proveedor' },
    imagen: String,
    activo: { type: Boolean, default: true }
});

module.exports = mongoose.model('Producto', productoSchema);