const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ message: 'API funcionando correctamente' });
});

// Modelo simple de Cliente
const clienteSchema = new mongoose.Schema({
    nombre: String,
    email: String,
    telefono: String
});

const Cliente = mongoose.model('Cliente', clienteSchema);

// Rutas
app.get('/api/clientes', async (req, res) => {
    try {
        const clientes = await Cliente.find();
        res.json({ success: true, data: clientes });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/clientes', async (req, res) => {
    try {
        console.log('Creando cliente:', req.body);
        const cliente = new Cliente(req.body);
        const resultado = await cliente.save();
        res.status(201).json({ success: true, data: resultado });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Conectar a MongoDB y arrancar servidor
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ Conectado a MongoDB Atlas');
        console.log('📁 Base de datos:', mongoose.connection.name);
        
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
            console.log(`📌 Prueba: http://localhost:${PORT}/api/clientes`);
        });
    })
    .catch(err => {
        console.error('❌ Error conectando a MongoDB:');
        console.error(err.message);
        process.exit(1);
    });