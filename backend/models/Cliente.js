const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    telefono: String,
    fechaNacimiento: { type: Date, required: true }, // Fecha de nacimiento
    direccion: {
        calle: String,
        ciudad: String,
        codigoPostal: String,
        pais: String
    },
    fechaRegistro: { type: Date, default: Date.now },
    activo: { type: Boolean, default: true }
});

// Método virtual para calcular la edad automáticamente
clienteSchema.virtual('edad').get(function() {
    if (!this.fechaNacimiento) return null;
    
    const hoy = new Date();
    const nacimiento = new Date(this.fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    
    return edad;
});

// Asegurar que los virtuales se incluyan en el JSON
clienteSchema.set('toJSON', { virtuals: true });
clienteSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Cliente', clienteSchema);