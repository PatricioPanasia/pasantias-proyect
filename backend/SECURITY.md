# 🔐 Documento de Seguridad

## Medidas de Seguridad Implementadas

### 1. **Autenticación y Contraseñas**

#### Bcrypt Password Hashing
- **Implementación**: Todas las contraseñas se almacenan hasheadas con bcrypt
- **Factor de costo**: 10 rounds (configurable via `BCRYPT_ROUNDS` en `.env`)
- **Beneficios**:
  - Imposible revertir el hash a contraseña original
  - Protección contra ataques de fuerza bruta (cada hash toma ~100ms)
  - Resistente a rainbow tables

#### Migración Automática
- Las contraseñas existentes en texto plano se migran automáticamente
- Al primer login exitoso, la contraseña se convierte a bcrypt
- Script manual disponible: `node scripts/migrate-passwords.js`

### 2. **Protección contra Ataques**

#### Rate Limiting
- **Global**: 100 requests por IP cada 15 minutos
- **Login**: 5 intentos cada 15 minutos por IP
- **Beneficios**:
  - Previene ataques de fuerza bruta
  - Mitiga ataques DDoS
  - Protege contra credential stuffing

#### Helmet.js - Seguridad HTTP Headers
Headers configurados automáticamente:
- `X-Content-Type-Options: nosniff` - Previene MIME sniffing
- `X-Frame-Options: DENY` - Previene clickjacking
- `X-XSS-Protection: 1; mode=block` - Protección XSS
- `Strict-Transport-Security` - Fuerza HTTPS en producción
- `Content-Security-Policy` - Control de recursos cargados

#### Prevención de Inyección SQL
- **Prepared Statements**: Todas las queries usan placeholders (`?`)
- **Múltiples Statements Deshabilitados**: `multipleStatements: false`
- **Validación de IDs**: Middleware `validateId` valida todos los parámetros numéricos

#### Sanitización de Inputs
- Middleware `sanitizeInput` elimina scripts y tags peligrosos
- Protección contra XSS (Cross-Site Scripting)
- Validación de formato de email

### 3. **CORS (Cross-Origin Resource Sharing)**

```javascript
cors({
  origin: FRONTEND_URL,           // Solo permite frontend autorizado
  credentials: true,              // Permite cookies/auth
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
})
```

### 4. **Logging y Auditoría**

- Log de todos los intentos de login (exitosos y fallidos)
- Log de operaciones sensibles (crear/editar/eliminar profesores)
- Registro de IP en cada operación crítica
- Formato: `[timestamp] operación - IP: xxx.xxx.xxx.xxx`

### 5. **Seguridad en Base de Datos**

- Connection pooling con límite de 10 conexiones
- UTF-8 encoding completo (`utf8mb4`)
- Variables de entorno para credenciales
- Archivo `.env` excluido del control de versiones

### 6. **Frontend Security Headers**

En `index.html`:
- Content Security Policy (CSP)
- X-Frame-Options
- Referrer Policy
- XSS Protection

---

## Configuración de Seguridad

### Variables de Entorno (.env)

```env
# Rate Limiting
RATE_LIMIT_WINDOW=15              # Ventana en minutos
RATE_LIMIT_MAX_REQUESTS=100       # Máx requests globales
LOGIN_RATE_LIMIT_MAX=5            # Máx intentos de login

# Bcrypt
BCRYPT_ROUNDS=10                  # Factor de costo (8-12 recomendado)

# Modo
NODE_ENV=production               # production | development
```

---

## Checklist de Seguridad para Producción

### Antes del Deploy

- [ ] Cambiar `DB_PASSWORD` a una contraseña fuerte
- [ ] Configurar `NODE_ENV=production`
- [ ] Cambiar `FRONTEND_URL` a la URL de producción
- [ ] Ejecutar migración de contraseñas: `node scripts/migrate-passwords.js`
- [ ] Verificar que `.env` está en `.gitignore`
- [ ] Configurar HTTPS/SSL en el servidor
- [ ] Revisar permisos de base de datos (principio de mínimo privilegio)
- [ ] Configurar backups automáticos de base de datos
- [ ] Implementar logging a archivo (no solo consola)
- [ ] Configurar monitoreo de errores (ej: Sentry)

### Recomendaciones Adicionales

1. **Implementar JWT**:
   - Autenticación basada en tokens
   - Sesiones sin estado
   - Refresh tokens para seguridad adicional

2. **HTTPS Obligatorio**:
   - Usar certificados SSL (Let's Encrypt gratis)
   - Redirigir todo HTTP a HTTPS
   - Configurar HSTS

3. **Validación Avanzada**:
   - Implementar express-validator
   - Validar todos los inputs del lado del servidor
   - Sanitizar datos antes de renderizar

4. **Auditoría**:
   - Implementar tabla de audit_log
   - Registrar TODAS las modificaciones de datos
   - Incluir usuario, timestamp, IP, acción

5. **Backups**:
   - Backups diarios automáticos
   - Almacenamiento offsite
   - Pruebas regulares de restauración

---

## Vulnerabilidades Conocidas y Mitigaciones

### ⚠️ Sin Autenticación en Endpoints

**Estado**: La mayoría de endpoints están públicos (comentado como `@access Public`)

**Riesgo**: Cualquiera puede modificar/eliminar datos

**Mitigación Futura**:
```javascript
// Implementar middleware de autenticación
const requireAuth = (req, res, next) => {
  // Verificar JWT token
  // Si válido: next()
  // Si no: res.status(401).json(...)
};

app.post("/profesores", requireAuth, sanitizeInput, async (req, res) => {
  // ...
});
```

### ⚠️ Sin Roles/Permisos

**Estado**: No hay sistema de roles (admin, usuario, etc.)

**Riesgo**: Todos los usuarios autenticados tienen los mismos permisos

**Mitigación Futura**:
- Tabla `roles` en BD
- Middleware `requireRole(['admin', 'editor'])`
- Control granular por endpoint

---

## Respuesta a Incidentes

### En caso de brecha de seguridad:

1. **Inmediato**:
   - Desconectar servidor de internet
   - Cambiar TODAS las contraseñas (DB, admin, etc.)
   - Revisar logs de acceso

2. **Investigación**:
   - Identificar punto de entrada
   - Determinar datos comprometidos
   - Documentar timeline del incidente

3. **Remediación**:
   - Parchear vulnerabilidad
   - Notificar a usuarios afectados
   - Implementar medidas adicionales

4. **Post-mortem**:
   - Analizar causa raíz
   - Actualizar políticas de seguridad
   - Capacitar al equipo

---

## Contacto de Seguridad

Para reportar vulnerabilidades de seguridad:
- **Email**: security@[tu-dominio].com
- **Política**: Divulgación responsable - 90 días

---

**Última actualización**: Noviembre 2025  
**Próxima revisión**: Cada 3 meses o después de cambios mayores
