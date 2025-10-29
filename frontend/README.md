# Gestor de Profesores

Este es un proyecto Full-Stack para la gestión de profesores, construido con React en el frontend y Node.js/Express en el backend. La aplicación permite realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) sobre una base de datos de profesores, con un sistema de autenticación de usuarios.

## ✨ Características Principales

- **Autenticación de Usuarios**: Sistema de login seguro (sin encriptación por simplicidad) para proteger el acceso.
- **Gestión de Profesores (CRUD)**:
  - **Crear**: Formulario para añadir nuevos profesores con validaciones.
  - **Leer**: Visualización de todos los profesores en una tabla responsive (vista de tarjetas en móviles).
  - **Buscar**: Filtro dinámico para encontrar profesores por nombre, documento o cargo.
  - **Actualizar**: Edición de la información de un profesor existente.
  - **Eliminar**: Borrado de profesores con un modal de confirmación.
- **Diseño Moderno**: Interfaz de usuario con tema oscuro y estética *glassmorphism*.
- **Notificaciones**: Alertas visuales para feedback al usuario (éxito, error, confirmación).

---

## 🚀 Stack Tecnológico

- **Frontend**:
  - **React**: Biblioteca para construir la interfaz de usuario.
  - **Vite**: Herramienta de desarrollo frontend rápida.
  - **React Router**: Para la gestión de rutas en la aplicación.
- **Backend**:
  - **Node.js**: Entorno de ejecución de JavaScript del lado del servidor.
  - **Express**: Framework para construir la API REST.
  - **MySQL2**: Driver para la conexión con la base de datos MySQL.
  - **CORS**: Middleware para habilitar el intercambio de recursos entre orígenes.
- **Base de Datos**:
  - **MySQL**

---

## 📂 Estructura del Proyecto

El proyecto está organizado en dos carpetas principales:

```
apli1intror3/
├── backend/         # Contiene todo el código del servidor
│   ├── db.js        # Configuración de la conexión a la BD
│   └── server.js    # Lógica del servidor y endpoints de la API
└── frontend/        # Contiene todo el código de la interfaz de usuario
    ├── src/
    │   ├── components/ # Componentes reutilizables de React
    │   ├── styles/     # Archivos CSS para los estilos
    │   └── App.jsx     # Componente principal y enrutador
    └── index.html   # Punto de entrada HTML
```

---

## 🛠️ Instalación y Puesta en Marcha

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local.

### Prerrequisitos

- **Node.js**: Asegúrate de tener Node.js instalado (versión 18 o superior).
- **MySQL**: Necesitas un servidor de base de datos MySQL en ejecución.

### 1. Configuración de la Base de Datos

Primero, crea la base de datos y las tablas necesarias.

1.  Conéctate a tu servidor MySQL.
2.  Crea una base de datos (si no la tienes). El proyecto usa `node_project` por defecto.
    ```sql
    CREATE DATABASE IF NOT EXISTS node_project;
    ```
3.  Selecciona la base de datos:
    ```sql
    USE node_project;
    ```
4.  Ejecuta los siguientes scripts para crear las tablas `users` y `profesores`:

    ```sql
    -- Tabla para los usuarios del sistema
    CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (email)
    );

    -- Tabla para los profesores
    CREATE TABLE profesores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cargo VARCHAR(100) NOT NULL,
        apellido_nombres VARCHAR(255) NOT NULL,
        cargo_titular VARCHAR(255),
        cargo_provisional VARCHAR(255),
        cargo_interino VARCHAR(255),
        cargo_suplente VARCHAR(255),
        actos_administrativos TEXT,
        documento_n VARCHAR(20) NOT NULL,
        cupof VARCHAR(50),
        foja_n VARCHAR(50),
        toma_posesion DATE,
        encargado_lab_especialidad VARCHAR(255),
        fecha_nacimiento DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    ```
5.  Inserta un usuario de prueba para poder iniciar sesión:
    ```sql
    INSERT INTO users (email, password) VALUES ('test@test.com', 'password');
    ```

### 2. Configuración del Backend

1.  Abre una terminal y navega a la carpeta `backend`:
    ```bash
    cd backend
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Configura la conexión a la base de datos en el archivo `backend/db.js`. Asegúrate de que los datos (`host`, `user`, `password`, `database`) coincidan con tu configuración de MySQL.

### 3. Configuración del Frontend

1.  Abre **una nueva terminal** y navega a la carpeta `frontend`:
    ```bash
    cd frontend
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```

### 4. Ejecutar la Aplicación

1.  **Inicia el servidor backend**: En la terminal del backend, ejecuta:
    ```bash
    node server.js
    ```
    Deberías ver el mensaje: `Servidor backend corriendo en http://localhost:3001`.

2.  **Inicia el cliente frontend**: En la terminal del frontend, ejecuta:
    ```bash
    npm run dev
    ```
    La aplicación se abrirá automáticamente en tu navegador en una dirección como `http://localhost:5173`.

3.  **Inicia sesión** con las credenciales de prueba:
    - **Correo**: `test@test.com`
    - **Contraseña**: `password`

---

## 🔌 API Endpoints (Backend)

El backend expone los siguientes endpoints en `http://localhost:3001`:

| Método | Ruta                 | Descripción                               |
|--------|----------------------|-------------------------------------------|
| `POST` | `/login`             | Autentica a un usuario.                   |
| `GET`  | `/profesores`        | Obtiene la lista de todos los profesores. |
| `POST` | `/profesores`        | Crea un nuevo profesor.                   |
| `PUT`  | `/profesores/:id`    | Actualiza un profesor por su ID.          |
| `DELETE`| `/profesores/:id`    | Elimina un profesor por su ID.            |

---

## 🖼️ Componentes Principales (Frontend)

- **`App.jsx`**: Componente raíz que gestiona el estado global (lista de profesores, estado de login), define las rutas de la aplicación y contiene la lógica principal para las operaciones CRUD.
- **`Login.jsx`**: Renderiza el formulario de inicio de sesión y maneja la comunicación con el endpoint `/login` del backend.
- **`Menu.jsx`**: Menú principal que se muestra después de un login exitoso. Permite navegar a las diferentes secciones.
- **`ProfesorForm.jsx`**: Formulario para crear y editar profesores. Incluye validaciones de campos y se adapta si se está editando o creando.
- **`ProfesorList.jsx`**: Muestra la lista de profesores. Utiliza una tabla para la vista de escritorio y un diseño de tarjetas para dispositivos móviles, ofreciendo una experiencia responsive.
- **`Notificacion.jsx`**: Componente modal para mostrar mensajes de éxito, error o confirmación al usuario.
- **`ProtectedRoute.jsx`**: Un componente de orden superior que envuelve las rutas privadas. Si el usuario no está autenticado, lo redirige a la página de login.

---

## 🎨 Estilos y Diseño

El diseño de la aplicación se basa en un **tema oscuro** con una estética **minimalista** y de **glassmorphism**.

- **Variables CSS**: Los colores, tipografías y otros valores de diseño están centralizados como variables CSS en `frontend/src/styles/Index.css` para facilitar su modificación.
- **Responsividad**: La aplicación está diseñada para ser funcional tanto en escritorio como en dispositivos móviles.
- **Autocompletado**: Se han aplicado estilos específicos para que los campos autocompletados por el navegador mantengan la coherencia con el tema oscuro.

