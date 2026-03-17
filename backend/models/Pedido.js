const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
    productos: [{
        producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
        cantidad: Number,
        precioUnitario: Number
    }],
    fechaPedido: { type: Date, default: Date.now },
    estado: { 
        type: String, 
        enum: ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'],
        default: 'pendiente'
    },
    total: { type: Number, required: true },
    direccionEnvio: {
        calle: String,
        ciudad: String,
        codigoPostal: String,
        pais: String
    }
});

module.exports = mongoose.model('Pedido', pedidoSchema);