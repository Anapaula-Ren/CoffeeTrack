# 🗄️ Modelo Entidad-Relación de la Base de Datos (cafeteriadb)

Este documento contiene la estructura formal, llaves primarias, llaves foráneas y el mapa de relaciones que rige el almacenamiento de datos del sistema **CoffeeTrack**.

El motor relacional principal corre sobre **SQL Server 2022** (containerizado en Docker) bajo el esquema de base de datos `cafeteriadb`.

---

## 📊 Diagrama de Base de Datos (Mermaid ER)


```mermaid
erDiagram

    %% Relaciones
    usuarios ||--o{ pedidos : "realiza (1:N)"
    clientes ||--o{ pedidos : "realiza (1:N)"
    categorias ||--o{ productos : "clasifica (1:N)"
    categorias_inventario ||--o{ inventario : "clasifica (1:N)"
    pedidos ||--o{ detallepedidos : "contiene (1:N)"
    productos ||--o{ detallepedidos : "incluye (1:N)"
    productos ||--o{ recetas : "se compone de (1:N)"
    inventario ||--o{ recetas : "requiere (1:N)"

    %% Definición de Entidades
    usuarios {
        int id_usuario PK
        string nombre
        string rol
        string correo
        string contrasena
    }
    clientes {
        int id_cliente PK
        string nombre
        string correo
    }
    categorias {
        int id_categoria PK
        string nombre
        string descripcion
    }
    categorias_inventario {
        int id_categoria_inv PK
        string nombre
        string descripcion
    }
    pedidos {
        int id_pedido PK
        int id_usuario FK
        int id_cliente FK
        datetime fecha
        decimal total
    }
    productos {
        int id_producto PK
        string nombre
        decimal precio
        int id_categoria FK
    }
    inventario {
        int id_ingrediente PK
        string nombre
        decimal cantidad_actual
        string unidad_medida
        int id_categoria_inv FK
    }
    detallepedidos {
        int id_detalle PK
        int id_pedido FK
        int id_producto FK
        int cantidad
        decimal subtotal
    }
    recetas {
        int id_receta PK
        int id_producto FK
        int id_ingrediente FK
        decimal cantidad_requerida
    }