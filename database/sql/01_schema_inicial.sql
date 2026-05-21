-- PROYECTO: CoffeeTrack
-- SCRIPTS INICIALES DE BASE DE DATOS RELACIONAL
-- FECHA: 19 de mayo de 2026

USE [master];
GO

-- 1. CREACIÓN DE LA BASE DE DATOS
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'cafeteriadb')
BEGIN
    CREATE DATABASE [cafeteriadb];
    PRINT 'Base de datos cafeteriadb creada.';
END
GO

USE [cafeteriadb];
GO

-- 2. CREACIÓN DE TABLAS (Sin dependencias primero)

-- Tabla: categorias
CREATE TABLE [dbo].[categorias] (
    [id_categoria] INT IDENTITY(1,1) PRIMARY KEY,
    [nombre] VARCHAR(100) NOT NULL,
    [descripcion] VARCHAR(255)
);

-- Tabla: categorias_inventario
CREATE TABLE [dbo].[categorias_inventario] (
    [id_categoria_inv] INT IDENTITY(1,1) PRIMARY KEY,
    [nombre] VARCHAR(100) NOT NULL,
    [descripcion] VARCHAR(255)
);

-- Tabla: clientes
CREATE TABLE [dbo].[clientes] (
    [id_cliente] INT IDENTITY(1,1) PRIMARY KEY,
    [nombre] VARCHAR(150) NOT NULL,
    [correo] VARCHAR(100),
    [telefono] VARCHAR(20),
    [puntos_lealtad] INT DEFAULT 0
);

-- Tabla: Usuarios (Con campo de contraseña preparado para encriptación)
CREATE TABLE [dbo].[Usuarios] (
    [id_usuario] INT IDENTITY(1,1) PRIMARY KEY,
    [nombre] VARCHAR(100) NOT NULL,
    [rol] VARCHAR(50) NOT NULL,
    [correo] VARCHAR(100) UNIQUE NOT NULL,
    [contrasena] VARCHAR(256) NOT NULL -- Tamaño optimizado para Hashes
);

-- 3. CREACIÓN DE TABLAS (Con llaves foráneas)

-- Tabla: productos
CREATE TABLE [dbo].[productos] (
    [id_producto] INT IDENTITY(1,1) PRIMARY KEY,
    [nombre] VARCHAR(150) NOT NULL,
    [precio] DECIMAL(10,2) NOT NULL,
    [id_categoria] INT NOT NULL,
    CONSTRAINT FK_Productos_Categorias FOREIGN KEY ([id_categoria]) 
        REFERENCES [dbo].[categorias]([id_categoria])
);

-- Tabla: inventario
CREATE TABLE [dbo].[inventario] (
    [id_ingrediente] INT IDENTITY(1,1) PRIMARY KEY,
    [nombre] VARCHAR(150) NOT NULL,
    [cantidad_actual] DECIMAL(10,2) NOT NULL,
    [unidad_medida] VARCHAR(20) NOT NULL,
    [id_categoria_inv] INT NOT NULL,
    CONSTRAINT FK_Inventario_CategoriasInv FOREIGN KEY ([id_categoria_inv]) 
        REFERENCES [dbo].[categorias_inventario]([id_categoria_inv])
);

-- Tabla: pedidos
CREATE TABLE [dbo].[pedidos] (
    [id_pedido] INT IDENTITY(1,1) PRIMARY KEY,
    [id_usuario] INT NOT NULL,
    [id_cliente] INT NULL,
    [fecha] DATETIME DEFAULT GETDATE(),
    [total] DECIMAL(10,2) NOT NULL,
    CONSTRAINT FK_Pedidos_Usuarios FOREIGN KEY ([id_usuario]) 
        REFERENCES [dbo].[Usuarios]([id_usuario]),
    CONSTRAINT FK_Pedidos_Clientes FOREIGN KEY ([id_cliente]) 
        REFERENCES [dbo].[clientes]([id_cliente])
);

-- Tabla: detallepedidos
CREATE TABLE [dbo].[detallepedidos] (
    [id_detalle] INT IDENTITY(1,1) PRIMARY KEY,
    [id_pedido] INT NOT NULL,
    [id_producto] INT NOT NULL,
    [cantidad] INT NOT NULL,
    [subtotal] DECIMAL(10,2) NOT NULL,
    CONSTRAINT FK_Detalle_Pedidos FOREIGN KEY ([id_pedido]) 
        REFERENCES [dbo].[pedidos]([id_pedido]),
    CONSTRAINT FK_Detalle_Productos FOREIGN KEY ([id_producto]) 
        REFERENCES [dbo].[productos]([id_producto])
);

-- Tabla: recetas (Relación Muchos a Muchos entre Productos e Ingredientes)
CREATE TABLE [dbo].[recetas] (
    [id_receta] INT IDENTITY(1,1) PRIMARY KEY,
    [id_producto] INT NOT NULL,
    [id_ingrediente] INT NOT NULL,
    [cantidad_requerida] DECIMAL(10,2) NOT NULL,
    CONSTRAINT FK_Recetas_Productos FOREIGN KEY ([id_producto]) 
        REFERENCES [dbo].[productos]([id_producto]),
    CONSTRAINT FK_Recetas_Inventario FOREIGN KEY ([id_ingrediente]) 
        REFERENCES [dbo].[inventario]([id_ingrediente])
);

PRINT 'Estructura de base de datos creada exitosamente.';
GO

-- 4. INSERCIÓN DE DATOS SEMILLA (Opcional, para pruebas iniciales)
INSERT INTO [dbo].[Usuarios] (nombre, rol, correo, contrasena)
VALUES ('Admin Coffee', 'Administrador', 'admin@coffeetrack.com', 'Contr321AS.');

PRINT 'Datos semilla insertados.';
GO