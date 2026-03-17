const mongoose = require('mongoose');
require('dotenv').config();

async function testear() {
    console.log('🔍 Probando conexión a MongoDB Atlas...');
    console.log('Base de datos: tiendaCris');
    
    const uri = process.env.MONGODB_URI;
    // Mostrar URI ocultando contraseña
    const uriOculta = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
    console.log('📌 URI:', uriOculta);
    
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('✅ CONECTADO EXITOSAMENTE a MongoDB Atlas');
        
        // Verificar que la base de datos tiendaCris existe
        const db = mongoose.connection.db;
        console.log('📁 Base de datos actual:', db.databaseName);
        
        // Listar colecciones
        const collections = await db.listCollections().toArray();
        if (collections.length > 0) {
            console.log('📚 Colecciones encontradas:');
            collections.forEach(col => console.log(`   - ${col.name}`));
        } else {
            console.log('📚 No hay colecciones aún. Se crearán al insertar datos.');
        }
        
        await mongoose.disconnect();
        console.log('👋 Desconectado');
        
    } catch (error) {
        console.error('❌ ERROR DE CONEXIÓN:');
        console.error(error.message);
        
        if (error.message.includes('Authentication failed')) {
            console.log('\n🔧 SOLUCIÓN: La contraseña es incorrecta');
            console.log('1. Verifica la contraseña del usuario natasandoval85');
            console.log('2. Si tiene caracteres especiales, codifícalos');
        }
        if (error.message.includes('ECONNREFUSED')) {
            console.log('\n🔧 SOLUCIÓN: Problema de red');
            console.log('1. Verifica que tu IP esté permitida en Network Access');
            console.log('2. Agrega 0.0.0.0/0 temporalmente para pruebas');
        }
    }
}

testear();