// PROYECTO: CoffeeTrack
// SCRIPT DE INICIALIZACIÓN NOSQL (MONGODB)
// OBJETIVO: Configuración de colecciones, índices y validadores


db = db.getSiblingDB('coffeetrack_nosql');

print("--- Iniciando configuración de base de datos NoSQL ---");

// 1. Colección: HistorialAcciones (Auditoría Crítica)
db.createCollection("HistorialAcciones", {
   validator: {
      $jsonSchema: {
         bsonType: "object",
         required: ["fechaHora", "idUsuario", "modulo", "accion"],
         properties: {
            accion: { enum: ["INSERT", "UPDATE", "DELETE", "CANCEL"], description: "Tipo de operación" }
         }
      }
   }
});
db.HistorialAcciones.createIndex({ "fechaHora": -1 });
db.HistorialAcciones.createIndex({ "idUsuario": 1 });

// 2. Colección: LogsSistema (Diagnóstico Técnico)
db.createCollection("LogsSistema");
db.LogsSistema.createIndex({ "fechaHora": -1 });
db.LogsSistema.createIndex({ "nivel": 1 }); // Error, Warning, Info

// 3. Colección: RegistroAccesos (Seguridad)
db.createCollection("RegistroAccesos");
db.RegistroAccesos.createIndex({ "idUsuario": 1, "fechaHora": -1 });
db.RegistroAccesos.createIndex({ "ipOrigen": 1 });

print("--- Configuración NoSQL finalizada con éxito ---");