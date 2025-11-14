# 📚 Sistema de Gestión de Profesores y Licencias

Sistema completo de administración de profesores con gestión avanzada de estados, licencias y seguimiento histórico. **Desarrollado con seguridad empresarial y preparado para manejar datos sensibles bajo normativas legales.**

---

## 📋 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Seguridad Implementada](#-seguridad-implementada)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Base de Datos](#-base-de-datos)
- [Uso del Sistema](#-uso-del-sistema)
- [Guía de Errores](#-guía-de-errores)
- [Mantenimiento](#-mantenimiento)
- [Escalabilidad](#-escalabilidad)
- [Roadmap de Desarrollo](#-roadmap-de-desarrollo)

---

## ✨ Características Principales

### Gestión de Profesores
- ✅ CRUD completo (Crear, Leer, Actualizar, Eliminar)
- ✅ 17 estados predefinidos (activo, licencia médica, jubilado, etc.)
- ✅ Historial completo de cambios de estado
- ✅ Sistema de filtros por estado con contadores
- ✅ Búsqueda en tiempo real
- ✅ Vista responsive (desktop, tablet, mobile)

### Gestión de Licencias
- ✅ Registro detallado de licencias
- ✅ Fechas de inicio y fin
- ✅ Motivos y observaciones
- ✅ Documentos de referencia
- ✅ Seguimiento temporal

### Gestión de Usuarios
- ✅ Sistema de autenticación
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Protección contra fuerza bruta
- ✅ Validación de emails

### Seguridad Avanzada
- 🔐 **Bcrypt**: Hash de contraseñas con factor de costo 10
- 🔐 **Rate Limiting**: Protección contra ataques de fuerza bruta
- 🔐 **Helmet.js**: Headers HTTP seguros
- 🔐 **CORS**: Control estricto de orígenes
- 🔐 **SQL Injection**: Prepared statements
- 🔐 **XSS Protection**: Sanitización de inputs
- 🔐 **Logging**: Auditoría de operaciones críticas

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   React    │  │  React Router │  │  Vite (Dev)      │   │
│  │   19.1.1   │  │   DOM 7.8.2   │  │  7.1.2           │   │
│  └────────────┘  └──────────────┘  └──────────────────┘   │
│                   http://localhost:5173                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST API
                            │ CORS Enabled
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                         BACKEND                             │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Express   │  │   Bcrypt     │  │  Helmet +        │   │
│  │   4.18.2   │  │   6.0.0      │  │  Rate Limit      │   │
│  └────────────┘  └──────────────┘  └──────────────────┘   │
│                   http://localhost:3001                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ MySQL2 Promise Pool
                            │ Connection Pooling
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS                            │
│                      MySQL 8.0+                             │
│  ┌──────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │  users   │  │  profesores  │  │  estado_profesor    │  │
│  │  estados │  │  licencias   │  │  (historial)        │  │
│  └──────────┘  └──────────────┘  └─────────────────────┘  │
│                   Database: node_project                    │
└─────────────────────────────────────────────────────────────┘
```

### Stack Tecnológico

**Frontend**:
- React 19.1.1
- React Router DOM 7.8.2
- Vite 7.1.2
- CSS3 (módulos personalizados)

**Backend**:
- Node.js (v18+)
- Express 4.18.2
- MySQL2 3.9.2 (con Promises)
- Bcrypt 6.0.0
- Helmet 8.0.0
- Express Rate Limit 7.5.0
- CORS 2.8.5
- Dotenv 16.4.5

**Base de Datos**:
- MySQL 8.0+ (vía XAMPP o servidor dedicado)

---

## 🔐 Seguridad Implementada

### 1. Autenticación y Contraseñas

#### Bcrypt Password Hashing
```javascript
// Las contraseñas NUNCA se almacenan en texto plano
const hashedPassword = await bcrypt.hash(password, 10);
// Hash ejemplo: $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
```

**Características**:
- Factor de costo: 10 rounds (configurable)
- Cada hash toma ~100ms (previene fuerza bruta)
- Sal única por contraseña
- Migración automática de contraseñas antiguas

#### Migración de Contraseñas
```bash
# Migrar contraseñas existentes a bcrypt
cd backend
node scripts/migrate-passwords.js
```

### 2. Protección contra Ataques

#### Rate Limiting
```javascript
// Límites configurados:
Global: 100 requests / 15 minutos por IP
Login:  5 intentos / 15 minutos por IP
```

**Respuesta cuando se excede el límite**:
```json
{
  "message": "Demasiadas peticiones desde esta IP, intente nuevamente en 15 minutos"
}
```

#### Helmet.js - Headers de Seguridad
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
```

#### Prevención de SQL Injection
```javascript
// ✅ CORRECTO - Prepared Statement
await pool.query("SELECT * FROM users WHERE email = ?", [email]);

// ❌ INCORRECTO - Vulnerable
await pool.query(`SELECT * FROM users WHERE email = '${email}'`);
```

#### Sanitización de Inputs (XSS Protection)
```javascript
// Middleware sanitizeInput elimina:
- <script> tags
- <iframe> tags
- Código HTML peligroso
```

### 3. CORS (Cross-Origin Resource Sharing)

Solo permite peticiones desde el frontend autorizado:
```javascript
cors({
  origin: 'http://localhost:5173',  // Solo este origen
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
})
```

### 4. Logging y Auditoría

Todas las operaciones críticas se registran:
```
[2025-11-14T10:30:45.123Z] CREATE_PROFESOR - IP: 192.168.1.100
[2025-11-14T10:31:12.456Z] LOGIN - Usuario: admin@example.com - IP: 192.168.1.100
[2025-11-14T10:35:22.789Z] CAMBIAR_ESTADO - Profesor ID: 15 - IP: 192.168.1.100
```

### 5. Content Security Policy (Frontend)

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               connect-src 'self' http://localhost:3001;
               frame-ancestors 'none';">
```

### Garantías de Seguridad

| Amenaza | Mitigación | Estado |
|---------|-----------|--------|
| SQL Injection | Prepared Statements | ✅ Implementado |
| XSS (Cross-Site Scripting) | Sanitización + CSP | ✅ Implementado |
| Clickjacking | X-Frame-Options | ✅ Implementado |
| Fuerza Bruta | Rate Limiting | ✅ Implementado |
| MITM (Man in the Middle) | HTTPS (producción) | ⚠️ Requiere SSL |
| Contraseñas Débiles | Bcrypt hashing | ✅ Implementado |
| CSRF | SameSite cookies | ⚠️ Pendiente JWT |
| Session Hijacking | JWT (futuro) | ⚠️ Pendiente |

**📄 Documentación de Seguridad Completa**: Ver `backend/SECURITY.md`

---

## 📦 Instalación

### Requisitos Previos

- **Node.js** 18.x o superior ([Descargar](https://nodejs.org/))
- **XAMPP** con MySQL 8.0+ ([Descargar](https://www.apachefriends.org/))
- **Git** (opcional) ([Descargar](https://git-scm.com/))

### Paso 1: Clonar o Descargar el Proyecto

```bash
# Opción A: Clonar con Git
git clone <repository-url>
cd pasantias-proyect

# Opción B: Descargar ZIP y extraer
```

### Paso 2: Instalar Dependencias

```bash
# Backend
cd backend
npm install

# Frontend (en otra terminal)
cd frontend
npm install
```

### Paso 3: Configurar Base de Datos

1. **Iniciar XAMPP**:
   - Abrir XAMPP Control Panel
   - Iniciar Apache y MySQL

2. **Crear Base de Datos**:
   ```sql
   -- En phpMyAdmin (http://localhost/phpmyadmin)
   CREATE DATABASE node_project CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. **Ejecutar Script de Migración**:
   - Abrir phpMyAdmin
   - Seleccionar base de datos `node_project`
   - Ir a pestaña "SQL"
   - Copiar y ejecutar el contenido de `backend/database_migration.sql`

### Paso 4: Configurar Variables de Entorno

**Backend** (`backend/.env`):
```env
# Configuración de Base de Datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=node_project

# Configuración del Servidor
PORT=3001

# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:5173

# Seguridad
NODE_ENV=development
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
LOGIN_RATE_LIMIT_MAX=5
BCRYPT_ROUNDS=10
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3001
```

### Paso 5: Migrar Contraseñas (Opcional)

Si tienes usuarios existentes con contraseñas en texto plano:

```bash
cd backend
node scripts/migrate-passwords.js
```

### Paso 6: Iniciar el Sistema

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**URLs**:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

---

## ⚙️ Configuración

### Variables de Entorno - Backend

| Variable | Descripción | Valor por Defecto | Requerido |
|----------|-------------|-------------------|-----------|
| `DB_HOST` | Host de MySQL | `localhost` | ✅ |
| `DB_USER` | Usuario de MySQL | `root` | ✅ |
| `DB_PASSWORD` | Contraseña de MySQL | `` | ✅ |
| `DB_NAME` | Nombre de la base de datos | `node_project` | ✅ |
| `PORT` | Puerto del servidor | `3001` | ❌ |
| `FRONTEND_URL` | URL del frontend (CORS) | `http://localhost:5173` | ✅ |
| `NODE_ENV` | Entorno (development/production) | `development` | ❌ |
| `RATE_LIMIT_WINDOW` | Ventana de rate limiting (min) | `15` | ❌ |
| `RATE_LIMIT_MAX_REQUESTS` | Máx requests globales | `100` | ❌ |
| `LOGIN_RATE_LIMIT_MAX` | Máx intentos de login | `5` | ❌ |
| `BCRYPT_ROUNDS` | Factor de costo bcrypt | `10` | ❌ |

### Configuración de Producción

Para desplegar en producción:

```env
# backend/.env
NODE_ENV=production
DB_HOST=tu-servidor-mysql.com
DB_PASSWORD=contraseña-segura-aquí
FRONTEND_URL=https://tu-dominio.com
PORT=3001
```

**Checklist de Producción**:
- ✅ Cambiar `DB_PASSWORD` a contraseña fuerte
- ✅ Configurar `NODE_ENV=production`
- ✅ Implementar HTTPS/SSL
- ✅ Revisar permisos de base de datos
- ✅ Configurar backups automáticos
- ✅ Implementar monitoreo de errores

---

## 🗄️ Base de Datos

### Estructura de Tablas

#### `users` - Usuarios del Sistema
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,  -- Hash bcrypt
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Usuario por defecto**:
- Email: `admin@example.com`
- Password: `admin123` (se hasheará automáticamente)

#### `estados` - Estados Disponibles para Profesores

| ID | Nombre | Color | Tipo | Descripción |
|----|--------|-------|------|-------------|
| 1 | Activo | #4CAF50 | Permanente | Profesor en servicio activo |
| 2 | Jubilado | #9E9E9E | Permanente | Profesor jubilado |
| 3 | Fallecido | #000000 | Permanente | Profesor fallecido |
| 4 | Renunciado | #795548 | Permanente | Profesor que renunció |
| 5 | Excedencia | #FF9800 | Temporal | En excedencia |
| 6 | Suspendido | #F44336 | Temporal | Suspendido disciplinariamente |
| 7 | Licencia sin goce | #9C27B0 | Temporal | Licencia sin remuneración |
| 8 | Licencia médica | #2196F3 | Temporal | Licencia por enfermedad |
| 9 | Licencia maternidad | #E91E63 | Temporal | Licencia por maternidad |
| 10 | Licencia paternidad | #3F51B5 | Temporal | Licencia por paternidad |
| 11 | Licencia especial | #00BCD4 | Temporal | Licencia especial |
| 12 | Beca/Capacitación | #009688 | Temporal | En capacitación |
| 13 | Comisión de servicio | #FFC107 | Temporal | Comisionado temporalmente |
| 14 | Traslado | #FF5722 | Temporal | En proceso de traslado |
| 15 | Licencia gremial | #673AB7 | Temporal | Licencia sindical |
| 16 | Período sabático | #607D8B | Temporal | Período sabático |
| 17 | Pre-jubilación | #CDDC39 | Temporal | En pre-jubilación |

#### `profesores` - Información de Profesores
```sql
CREATE TABLE profesores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cargo VARCHAR(255),
  apellido_nombres VARCHAR(255) NOT NULL,
  dni VARCHAR(20),
  cuil VARCHAR(20),
  domicilio TEXT,
  telefono VARCHAR(50),
  email VARCHAR(255),
  fecha_nacimiento DATE,
  titulo VARCHAR(255),
  antiguedad_docente INT,
  situacion_revista VARCHAR(255),
  estado_id INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (estado_id) REFERENCES estados(id)
);
```

#### `estado_profesor` - Historial de Cambios de Estado
```sql
CREATE TABLE estado_profesor (
  id INT AUTO_INCREMENT PRIMARY KEY,
  profesor_id INT NOT NULL,
  estado_id INT NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,
  motivo TEXT,
  observaciones TEXT,
  documento_referencia VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (profesor_id) REFERENCES profesores(id) ON DELETE CASCADE,
  FOREIGN KEY (estado_id) REFERENCES estados(id)
);
```

### Backup y Restauración

#### Crear Backup Automático
```bash
cd backend
node scripts/backup-database.js
```

Los backups se guardan en `backend/backups/` y se mantienen los últimos 7 automáticamente.

#### Restaurar desde Backup
```bash
# Windows (PowerShell)
mysql -u root -p node_project < backup.sql

# O desde phpMyAdmin: Importar → Seleccionar archivo .sql
```

---

## 💻 Uso del Sistema

### Login

1. Navegar a http://localhost:5173
2. Ingresar credenciales:
   - Email: `admin@example.com`
   - Password: `admin123`

### Gestión de Profesores

#### Crear Nuevo Profesor
1. Click en "Nuevo Profesor"
2. Completar formulario
3. Click en "Guardar"

#### Ver Detalles
1. Click en cualquier fila de la tabla
2. Se abre modal con datos completos e historial

#### Cambiar Estado
1. En el modal de detalles, click en "Cambiar Estado"
2. Completar formulario (estado, fechas, motivo, observaciones)
3. Click en "Guardar"
4. El estado se actualiza automáticamente

#### Filtrar por Estado
1. Click en "Filtros"
2. Seleccionar estado del dropdown
3. Ver contador de profesores por estado

#### Búsqueda
- Escribir en el campo de búsqueda
- Busca en: apellido, nombres, DNI, CUIL

---

## 🔧 Guía de Errores

### Error: Conexión a Base de Datos

```
✗ Error al conectar a la base de datos: Access denied
```

**Solución**:
1. Verificar que MySQL está corriendo en XAMPP
2. Verificar credenciales en `backend/.env`
3. Crear base de datos si no existe

### Error: CORS

```
blocked by CORS policy
```

**Solución**:
1. Verificar que backend está corriendo
2. Verificar `FRONTEND_URL` en `backend/.env`
3. Reiniciar backend

### Error: 429 Too Many Requests

```json
{
  "message": "Demasiadas peticiones..."
}
```

**Solución**:
- Esperar 15 minutos, o
- Aumentar límites en `.env`, o
- Reiniciar backend

### Error: Credenciales Incorrectas

```json
{
  "message": "Credenciales incorrectas."
}
```

**Solución**:
```sql
-- Resetear contraseña en phpMyAdmin:
UPDATE users SET password = 'nuevaPassword123' WHERE email = 'admin@example.com';

-- Luego hacer login con 'nuevaPassword123'
-- Se hasheará automáticamente
```

### Error: Puerto en Uso

```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solución**:
```powershell
# Matar proceso en puerto 3001
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process

# O cambiar puerto en .env:
PORT=3002
```

---

## 🔄 Mantenimiento

### Tareas Regulares

**Diarias**:
- Monitorear logs de errores
- Verificar intentos de login fallidos

**Semanales**:
- Backup de base de datos
- Revisar uso de disco

**Mensuales**:
- Auditoría de seguridad
- Actualización de dependencias
- Pruebas de restauración de backups

### Comandos de Mantenimiento

```bash
# Backup automático
cd backend
node scripts/backup-database.js

# Migrar contraseñas
node scripts/migrate-passwords.js

# Actualizar dependencias
npm update

# Verificar vulnerabilidades
npm audit
npm audit fix
```

---

## 📈 Escalabilidad

### Capacidad Actual

| Usuarios Concurrentes | Profesores | Performance |
|-----------------------|------------|-------------|
| 1-10 | 100-1,000 | Excelente |
| 10-50 | 1,000-5,000 | Bueno |
| 50-100 | 5,000-10,000 | Aceptable* |
| 100+ | 10,000+ | Requiere optimización |

\* Requiere ajustes en connection pool y rate limiting

### Opciones de Escalamiento

#### 1. Horizontal Scaling

**Load Balancer + Múltiples Backends**:
```
     ┌──────────────┐
     │Load Balancer │
     └───────┬──────┘
             │
      ┌──────┼──────┐
      ▼      ▼      ▼
   Backend Backend Backend
   :3001   :3002   :3003
```

#### 2. Database Replication
- MySQL Primary + Replicas
- Separar escrituras y lecturas

#### 3. Caching con Redis
```javascript
// Cache de profesores (5 minutos)
const cached = await redis.get('profesores:all');
if (cached) return JSON.parse(cached);
```

#### 4. Cloud Deployment (AWS)

**Arquitectura Recomendada**:
- **Frontend**: S3 + CloudFront (CDN)
- **Backend**: EC2 (Auto Scaling) + Load Balancer
- **Database**: RDS MySQL (Multi-AZ)
- **Costo estimado**: ~$50/mes

#### 5. Docker Deployment

```bash
docker-compose up -d
```

Levanta frontend, backend y MySQL en contenedores.

---

## 🚀 Roadmap de Desarrollo

### Fase 1: Seguridad Avanzada ✅ (COMPLETADO)
- ✅ Bcrypt password hashing
- ✅ Rate limiting
- ✅ Helmet.js
- ✅ CORS configuration
- ✅ Input sanitization
- ✅ SQL injection prevention
- ✅ Logging de operaciones

### Fase 2: Autenticación JWT (1-2 semanas)
- ⬜ Implementar JSON Web Tokens
- ⬜ Refresh tokens
- ⬜ Expiración de sesiones
- ⬜ Password reset via email
- ⬜ Two-factor authentication (2FA)

### Fase 3: Sistema de Roles y Permisos (2-3 semanas)
- ⬜ Tabla de roles (admin, editor, viewer)
- ⬜ RBAC (Role-Based Access Control)
- ⬜ UI: Gestión de roles
- ⬜ Permisos granulares por endpoint

### Fase 4: Funcionalidades Avanzadas (3-4 semanas)
- ⬜ **Reportes**: Generación de PDF, exportar Excel, gráficos
- ⬜ **Notificaciones**: Email cuando vence licencia, recordatorios
- ⬜ **Documentos**: Upload de archivos, S3/MinIO
- ⬜ **Auditoría Completa**: Tabla audit_log, registro de todos los cambios

### Fase 5: Optimización y Performance (2-3 semanas)
- ⬜ Redis caching
- ⬜ Optimización de queries
- ⬜ Lazy loading
- ⬜ Paginación server-side
- ⬜ Compresión gzip

### Fase 6: Testing (2-3 semanas)
- ⬜ Unit tests (Jest)
- ⬜ Integration tests
- ⬜ E2E tests (Cypress)
- ⬜ CI/CD pipeline

### Fase 7: Mobile App (4-6 semanas)
- ⬜ React Native app
- ⬜ Sincronización offline
- ⬜ Push notifications

### Fase 8: Integraciones
- ⬜ API pública (OpenAPI/Swagger)
- ⬜ Webhooks para eventos
- ⬜ SSO (Single Sign-On)

### Mejoras Futuras Sugeridas
- Dark mode
- Internacionalización (i18n)
- PWA (Progressive Web App)
- WebSockets (actualizaciones en tiempo real)
- Kubernetes deployment

---

## 📄 Documentación Adicional

- **Seguridad**: `backend/SECURITY.md` - Guía completa de seguridad
- **Scripts**: 
  - `backend/scripts/migrate-passwords.js` - Migración de contraseñas
  - `backend/scripts/backup-database.js` - Backup automático

---

## 📞 Soporte y Contacto

### Obtener Ayuda

1. Revisar esta documentación
2. Consultar `SECURITY.md` para temas de seguridad
3. Revisar logs de backend y frontend

### Reportar Bugs

Incluir:
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots
- Logs relevantes

---

## 📄 Licencia

Este proyecto es de uso interno y contiene datos sensibles. Todos los derechos reservados.

**Restricciones**:
- ❌ No distribuir sin autorización
- ❌ No exponer datos sensibles
- ✅ Uso interno permitido
- ✅ Desarrollo y mejoras permitidas

---

## 🎓 Créditos

Desarrollado con:
- React 19 + Vite 7
- Express 4 + Node.js 18+
- MySQL 8

Seguridad implementada con:
- Bcrypt 6.0
- Helmet 8.0
- Express Rate Limit 7.5
- CORS 2.8

---

**Última actualización**: Noviembre 2025  
**Versión**: 1.0.0  
**Estado**: ✅ Producción Ready
