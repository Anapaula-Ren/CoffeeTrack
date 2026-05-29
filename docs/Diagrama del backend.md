# 🗺️ Arquitectura de Software - Backend (Node.js)

Este documento detalla la estructura interna, el flujo de datos por capas y los componentes tecnológicos que integran el backend de **CoffeeTrack**. La API está desarrollada sobre **Node.js** utilizando el framework **Express**.

---

## 🏗️ Diagrama de Arquitectura de Capas

A continuación se presenta el flujo de una petición HTTP desde que el cliente interactúa con la interfaz gráfica (Frontend en Live Server) hasta la persistencia y validación de datos:

```mermaid
graph TD
    %% Estilos de los bloques (Gama de Azules con Texto Negro)
    classDef cliente fill:#d0e1fd,stroke:#1d4ed8,stroke-width:2px,color:#000;
    classDef core fill:#93c5fd,stroke:#1e40af,stroke-width:2px,color:#000;
    classDef capa fill:#f0f7ff,stroke:#3b82f6,stroke-width:1px,color:#000;
    classDef bd fill:#60a5fa,stroke:#1e40af,stroke-width:1px,color:#000;
    classDef test fill:#e0f2fe,stroke:#0284c7,stroke-width:1px,stroke-dasharray: 5 5,color:#000;

    %% Nodos del Diagrama
    Cliente([CLIENTE / FRONTEND]):::cliente
    Server[backend/src/server.js<br><i>Carga .env con dotenv</i>]:::core
    Routes[src/routes/<br><i>Manejo de CORS</i>]:::capa
    Middleware[src/middleware/<br><i>Seguridad con bcrypt</i>]:::capa
    Controllers[src/controllers/<br><i>Respuestas HTTP</i>]:::capa
    Services[src/services/<br><i>Lógica de negocio + nodemailer</i>]:::capa
    Models[src/models/<br><i>Modelado de Datos</i>]:::capa

    MongoDB[(MongoDB<br>via Mongoose)]:::bd
    SQLServer[(SQL Server<br>via mssql / tedious)]:::bd

    Tests{src/tests/<br>jest + supertest}:::test

    %% Conexiones (Flujo)
    Cliente -->|Petición HTTP| Server
    Server --> Routes
    Routes --> Middleware
    Middleware --> Controllers
    Controllers --> Services
    Services --> Models

    Models --> MongoDB
    Models --> SQLServer

    %% Relación de las pruebas
    Tests -.->|Simula peticiones| Server