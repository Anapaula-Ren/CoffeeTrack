const mongoose = require("mongoose");

async function connectMongo() {
    const uri = process.env.MONGO_URI;

    if (!uri) {
        console.error("No se encontró MONGO_URI en variables de entorno");
        process.exit(1);
    }

    try {
        await mongoose.connect(uri, {
            dbName: process.env.MONGO_DB || "miapp",
        });

        console.log("¡Conexión a la base de datos MongoDB exitosa!");
    } catch (err) {
        console.error("¡Error al conectar con la base de datos MongoDB!", err.message);
        process.exit(1); 
    }
}

module.exports = { connectMongo };