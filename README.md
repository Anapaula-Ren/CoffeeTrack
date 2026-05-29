# ☕ CoffeeTrack - Manual de Usuario e Instalación Final

¡Bienvenido a **CoffeeTrack**, el sistema de gestión integral para nuestra cafetería! Este manual está diseñado específicamente para que cualquier usuario final, administrador o mesero pueda instalar, ejecutar y utilizar la aplicación desde cero de forma sencilla.

El sistema cuenta con un control de acceso basado en roles (RBAC) para proteger la seguridad de la información. Esto significa que las pantallas y pestañas se adaptarán automáticamente dependiendo del usuario que inicie sesión (por ejemplo, el personal de meseros no tendrá acceso al módulo de inventario ni a la gestión de usuarios, y el personal de inventario no podrá visualizar el panel de pedidos).

---

## 🛠️ Requisitos del Sistema

Antes de iniciar la aplicación, asegúrate de tener instalados los siguientes componentes en tu computadora:

* **Docker & Docker Desktop** (Indispensable para las bases de datos)
* **Node.js** (Versión 20 LTS recomendada)
* Un navegador web moderno (Google Chrome, Microsoft Edge, Brave, etc.)

---

## 🚀 Guía de Instalación y Despliegue Local

Sigue estos cuatro sencillos pasos en orden para poner a funcionar el sistema en tu equipo local:

### Paso 1: Descargar el Proyecto
Abre tu terminal o consola de comandos y clona el repositorio oficial del proyecto utilizando Git:
```bash
git clone [https://github.com/Anapaula-Ren/CoffeeTrack.git](https://github.com/Anapaula-Ren/CoffeeTrack.git)
cd CoffeeTrack
```
### Paso 2: Inicializar las Bases de Datos con Docker 🐳
Gracias a la configuración de contenedores, no necesitas instalar SQL Server ni MongoDB en tu computadora de forma local. El archivo docker-compose.yml se encarga de levantar, enlazar e inicializar todo en segundos.

Asegúrate de tener Docker Desktop abierto y ejecutándose.

En la raíz del proyecto, ejecuta el siguiente comando en tu terminal:

```bash
docker-compose up -d
```
¿Qué está pasando en segundo plano?

Se creará el contenedor sqlserver_db con el puerto 1433 expuesto y la contraseña por defecto.

Se creará el contenedor mongodb_nosql cargando los esquemas NoSQL iniciales.

Se ejecutará un contenedor temporal de inicialización automatizada (db-init) que esperará 25 segundos a que el servidor esté listo e inyectará de forma automática tu script de base de datos base 01_schema_inicial.sql con las tablas, relaciones y stored procedures (como el descuento automático de stock de café y leches).
### Paso 3: Levantar el Servidor (Backend)
El servidor se encarga de procesar las reglas de negocio, la autenticación y la conexión con tus contenedores de bases de datos.

1. Abre una terminal y navega a la carpeta del backend:
   ```bash
   cd backend
Instala los módulos requeridos por la aplicación ejecutando:

```Bash
npm install
```
Entra a la carpeta de código fuente (src):

```Bash
cd src
```
Inicia el servidor ejecutando directamente el archivo principal:

```bash
node server.js
```
Sabrás que está listo cuando la consola te confirme las conexiones exitosas:

```bash
Servidor Express iniciado en: http://localhost:3000

¡Conexión a la base de datos MongoDB exitosa!

¡Conexión de base de datos SQL exitosa!
```
### Paso 4: Abrir la Interfaz Visual (Frontend)
La interfaz gráfica contiene todas las pantallas de interacción para los meseros y administradores (archivos HTML/JS estáticos).

1. En Visual Studio Code, busca el archivo principal de la interfaz dentro de la carpeta `frontend/` (por lo general `index.html`).
2. Dale clic derecho al archivo y selecciona **Open with Live Server** (o presiona el botón **Go Live** en la barra inferior de VS Code).
3. El sistema se desplegará automáticamente en tu navegador web en la dirección local que te asigne la extensión (normalmente `http://127.0.0.1:5500/frontend/index.html`).
4. ¡Listo! La interfaz ya está conectada e interactuando en tiempo real con la API del backend en el puerto 3000.