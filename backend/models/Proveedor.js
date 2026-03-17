const mongoose = require('mongoose');

const proveedorSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true },
    telefono: String,
    empresa: String,
    direccion: {
        calle: String,
        ciudad: String,
        codigoPostal: String,
        pais: String
    },
    productos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Producto' }],
    activo: { type: Boolean, default: true }
});

module.exports = mongoose.model('Proveedor', proveedorSchema);