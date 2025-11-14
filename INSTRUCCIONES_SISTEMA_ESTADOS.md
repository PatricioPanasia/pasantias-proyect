# Sistema de Roles/Estados para Profesores - Instrucciones de Instalación

## 📋 Resumen del Sistema

Se ha implementado un sistema completo de roles/estados para profesores que permite:

- ✅ Asignar estados con colores distintivos a cada profesor
- ✅ Ver el estado actual de cada profesor en la lista (con indicador de color)
- ✅ Hacer clic en cualquier profesor para ver su detalle completo
- ✅ Cambiar el estado de un profesor con justificación y fechas
- ✅ Estados temporales que finalizan automáticamente y retornan al estado anterior
- ✅ Historial completo de cambios de estado
- ✅ 17 tipos de estados predefinidos con colores específicos

## 🗄️ Paso 1: Actualizar la Base de Datos

1. Abre **phpMyAdmin** (http://localhost/phpmyadmin)
2. Selecciona tu base de datos `node_project`
3. Ve a la pestaña **SQL**
4. Copia y pega TODO el contenido del archivo:
   ```
   backend/database_migration.sql
   ```
5. Haz clic en **Continuar** para ejecutar el script

Esto creará:
- Tabla `estados_profesor` con los 17 estados y sus colores
- Tabla `profesor_estados` para el historial de estados
- Vista `profesores_con_estado` para consultas optimizadas
- Procedimientos y eventos automáticos

## 🚀 Paso 2: Iniciar el Servidor Backend

Abre una terminal en la carpeta `backend`:

```powershell
cd backend
node server.js
```

Deberías ver: `Servidor backend corriendo en http://localhost:3001`

## 🎨 Paso 3: Iniciar el Frontend

Abre OTRA terminal en la carpeta `frontend`:

```powershell
cd frontend
npm run dev
```

Deberías ver algo como: `Local: http://localhost:5173`

## ✨ Paso 4: Usar el Sistema

1. **Ingresa a la aplicación** (http://localhost:5173)
   - Usuario: `test@test.com`
   - Contraseña: `password`

2. **Ir a "Ver Profesores Cargados"**
   - Verás todos los profesores con su estado (si tienen)
   - Los estados se muestran con un punto de color y el nombre

3. **Ver Detalle de un Profesor**
   - Haz clic en cualquier fila de la tabla (o tarjeta en móvil)
   - Se abrirá un modal con:
     - Estado actual con todos los detalles
     - Información completa del profesor
     - Historial de estados en formato timeline

4. **Cambiar el Estado de un Profesor**
   - Desde el detalle del profesor, haz clic en "Cambiar Estado"
   - Selecciona el nuevo estado
   - Completa los campos (algunos son obligatorios según el estado)
   - Guarda el cambio

5. **Finalizar un Estado Temporal**
   - Si un estado tiene fecha de finalización
   - Puedes finalizarlo manualmente desde el detalle
   - El profesor volverá automáticamente al estado anterior

## 🎨 Estados Disponibles

| Estado | Color | Requiere Detalles |
|--------|-------|-------------------|
| Titular | Azul (#2563eb) | No |
| Titular Interino | Azul claro (#3b82f6) | No |
| Titular Confirmado/Definitivo | Azul oscuro (#1d4ed8) | No |
| Provisional | Violeta (#8b5cf6) | No |
| Suplente | Violeta claro (#a855f7) | No |
| Ad Honorem | Rosa (#ec4899) | No |
| Activo/En Servicio | Verde (#10b981) | No |
| **Con Licencia** | **Naranja (#f59e0b)** | **Sí** |
| **En Disponibilidad** | **Naranja oscuro (#f97316)** | **Sí** |
| **En Cambio de Funciones** | **Cian (#06b6d4)** | **Sí** |
| **Afectado a Servicios Provisorios** | **Cian claro (#0ea5e9)** | **Sí** |
| **Bajo Sumario** | **Rojo (#ef4444)** | **Sí** |
| **Suspendido** | **Rojo oscuro (#dc2626)** | **Sí** |
| Jubilado/Retirado | Gris (#6b7280) | No |
| **Cesanteado/Exonerado** | **Rojo muy oscuro (#991b1b)** | **Sí** |
| **Reincorporado** | **Verde claro (#22c55e)** | **Sí** |
| Periodo de Prueba | Amarillo (#fbbf24) | No |

Los estados marcados en **negrita** requieren obligatoriamente especificar motivo/justificación.

## 📊 Endpoints del Backend

### Estados
- `GET /estados` - Obtiene todos los estados disponibles
- `GET /profesores-con-estado` - Obtiene profesores con su estado actual

### Estado de un Profesor
- `GET /profesores/:id/estado-actual` - Estado actual de un profesor
- `GET /profesores/:id/historial-estados` - Historial completo de estados
- `POST /profesores/:id/cambiar-estado` - Cambiar el estado de un profesor
- `POST /profesores/:id/finalizar-estado` - Finalizar el estado actual

## 🔍 Verificar que Todo Funciona

1. **Base de datos**: Ejecuta en phpMyAdmin:
   ```sql
   SELECT * FROM estados_profesor;
   ```
   Deberías ver 17 estados.

2. **Backend**: Verifica que no hay errores en la terminal del backend

3. **Frontend**: Verifica que los profesores se cargan correctamente

## ⚠️ Notas Importantes

- Los estados temporales (con fecha de fin) se finalizan automáticamente cada día
- Al finalizar un estado temporal, el profesor vuelve al estado anterior automáticamente
- El historial de estados se mantiene completo y no se elimina
- Cada cambio de estado queda registrado con fecha, motivo y usuario

## 🐛 Solución de Problemas

### Error: "Cannot read property 'estado_nombre'"
- Asegúrate de haber ejecutado el script SQL completo
- Verifica que las tablas `estados_profesor` y `profesor_estados` existan

### No se muestran los colores
- Limpia la caché del navegador (Ctrl + F5)
- Verifica que los archivos CSS se hayan creado correctamente

### El servidor backend no arranca
- Verifica que no haya otro proceso usando el puerto 3001
- Revisa que las credenciales de MySQL en `db.js` sean correctas

## 📝 Próximas Mejoras Sugeridas

- [ ] Agregar filtros por estado en la lista de profesores
- [ ] Notificaciones automáticas de estados próximos a vencer
- [ ] Exportar reportes de profesores por estado
- [ ] Dashboard con estadísticas de estados
- [ ] Permisos según rol de usuario (admin, supervisor, etc.)

---

¡El sistema está listo para usar! 🎉
