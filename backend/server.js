import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import pool from "./db.js";

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Seguridad: Helmet para headers HTTP seguros
app.use(helmet());

// Configuración de CORS para permitir peticiones desde el frontend
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json({ limit: '10mb' })); // Limitar tamaño de payload

// Rate limiting global - previene ataques de fuerza bruta
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 requests por IP en 15 minutos
  message: { message: 'Demasiadas peticiones desde esta IP, intente nuevamente en 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Rate limiting estricto para login - previene ataques de fuerza bruta en autenticación
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 intentos de login por IP
  message: { message: 'Demasiados intentos de inicio de sesión, intente nuevamente en 15 minutos' },
  skipSuccessfulRequests: true,
});

/**
 * Middleware para validar que un ID sea un número válido
 */
const validateId = (req, res, next) => {
  const { id } = req.params;
  if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
    return res.status(400).json({ message: "ID inválido" });
  }
  next();
};

/**
 * Middleware para sanitizar inputs - previene XSS
 */
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Eliminar scripts y tags HTML peligrosos
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
          .trim();
      }
    });
  }
  next();
};

/**
 * Middleware para logging de peticiones sensibles
 */
const logSensitiveOperation = (operation) => {
  return (req, res, next) => {
    const timestamp = new Date().toISOString();
    const ip = req.ip || req.connection.remoteAddress;
    console.log(`[${timestamp}] ${operation} - IP: ${ip}`);
    next();
  };
};

/**
 * @route   POST /login
 * @desc    Autentica a un usuario por email y contraseña.
 * @access  Public
 * @body    { "email": "user@example.com", "password": "password123" }
 */
app.post("/login", loginLimiter, sanitizeInput, async (req, res) => {
  const { email, password } = req.body;

  // Validación de entrada
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Correo y contraseña son requeridos." });
  }

  // Validación de formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Formato de email inválido." });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    
    if (rows.length === 0) {
      // No revelar si el usuario existe o no (seguridad)
      return res.status(401).json({ message: "Credenciales incorrectas." });
    }

    const user = rows[0];
    
    // Verificar contraseña con bcrypt si está hasheada, sino comparación directa (retrocompatibilidad)
    let match = false;
    if (user.password.startsWith('$2b$')) {
      // Contraseña hasheada con bcrypt
      match = await bcrypt.compare(password, user.password);
    } else {
      // Contraseña en texto plano (para retrocompatibilidad)
      match = password === user.password;
      
      // Si coincide, actualizar a bcrypt
      if (match) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query("UPDATE users SET password = ? WHERE id = ?", [
          hashedPassword,
          user.id,
        ]);
        console.log(`⚠️  Contraseña migrada a bcrypt para usuario: ${email}`);
      }
    }

    if (match) {
      // Log de login exitoso
      console.log(`✓ Login exitoso - Usuario: ${email} - IP: ${req.ip}`);
      
      // No enviar información sensible
      res.json({ 
        message: "Login exitoso.",
        user: {
          id: user.id,
          email: user.email,
          // No enviar password ni otros datos sensibles
        }
      });
    } else {
      // Log de intento fallido
      console.log(`✗ Login fallido - Email: ${email} - IP: ${req.ip}`);
      res.status(401).json({ message: "Credenciales incorrectas." });
    }
  } catch (error) {
    console.error("Error en el login:", error);
    // No revelar detalles del error al cliente
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

/**
 * @route   GET /profesores
 * @desc    Obtiene todos los profesores de la base de datos.
 * @access  Public (debería ser privado en una app real)
 */
app.get("/profesores", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM profesores ORDER BY apellido_nombres ASC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener profesores:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

/**
 * @route   POST /profesores
 * @desc    Crea un nuevo profesor.
 * @access  Public (debería ser privado)
 * @body    { "cargo": "...", "apellido_nombres": "...", ... }
 */
app.post("/profesores", sanitizeInput, logSensitiveOperation('CREATE_PROFESOR'), async (req, res) => {
  try {
    const {
      cargo,
      apellido_nombres,
      cargo_titular,
      cargo_provisional,
      cargo_interino,
      cargo_suplente,
      actos_administrativos,
      documento_n,
      cupof,
      foja_n,
      toma_posesion,
      encargado_lab_especialidad,
      fecha_nacimiento,
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO profesores (cargo, apellido_nombres, cargo_titular, cargo_provisional, cargo_interino, cargo_suplente, actos_administrativos, documento_n, cupof, foja_n, toma_posesion, encargado_lab_especialidad, fecha_nacimiento) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cargo,
        apellido_nombres,
        cargo_titular,
        cargo_provisional,
        cargo_interino,
        cargo_suplente,
        actos_administrativos,
        documento_n,
        cupof,
        foja_n,
        toma_posesion,
        encargado_lab_especialidad,
        fecha_nacimiento,
      ]
    );
    res.status(201).json({
      message: "Profesor creado correctamente",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error al crear profesor:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

/**
 * @route   PUT /profesores/:id
 * @desc    Actualiza un profesor existente.
 * @access  Public (debería ser privado)
 * @param   id - El ID del profesor a actualizar.
 * @body    { "cargo": "...", "apellido_nombres": "...", ... }
 */
app.put("/profesores/:id", validateId, sanitizeInput, logSensitiveOperation('UPDATE_PROFESOR'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      cargo,
      apellido_nombres,
      cargo_titular,
      cargo_provisional,
      cargo_interino,
      cargo_suplente,
      actos_administrativos,
      documento_n,
      cupof,
      foja_n,
      toma_posesion,
      encargado_lab_especialidad,
      fecha_nacimiento,
    } = req.body;

    await pool.query(
      `UPDATE profesores SET cargo=?, apellido_nombres=?, cargo_titular=?, cargo_provisional=?, cargo_interino=?, cargo_suplente=?, actos_administrativos=?, documento_n=?, cupof=?, foja_n=?, toma_posesion=?, encargado_lab_especialidad=?, fecha_nacimiento=? 
       WHERE id=?`,
      [
        cargo,
        apellido_nombres,
        cargo_titular,
        cargo_provisional,
        cargo_interino,
        cargo_suplente,
        actos_administrativos,
        documento_n,
        cupof,
        foja_n,
        toma_posesion,
        encargado_lab_especialidad,
        fecha_nacimiento,
        id,
      ]
    );
    res.json({ message: "Profesor actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar profesor:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

/**
 * @route   DELETE /profesores/:id
 * @desc    Elimina un profesor por su ID.
 * @access  Public (debería ser privado)
 * @param   id - El ID del profesor a eliminar.
 */
app.delete("/profesores/:id", validateId, logSensitiveOperation('DELETE_PROFESOR'), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM profesores WHERE id=?", [id]);
    res.json({ message: "Profesor eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar profesor:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

/**
 * @route   GET /estados
 * @desc    Obtiene todos los estados/roles disponibles.
 * @access  Public
 */
app.get("/estados", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM estados_profesor ORDER BY nombre ASC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener estados:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

/**
 * @route   GET /profesores/:id/estado-actual
 * @desc    Obtiene el estado actual de un profesor con todos sus detalles.
 * @access  Public
 */
app.get("/profesores/:id/estado-actual", validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT pe.*, ep.nombre as estado_nombre, ep.color as estado_color, 
              ep.requiere_detalles, ep.descripcion as estado_descripcion,
              DATEDIFF(pe.fecha_fin, CURDATE()) as dias_restantes
       FROM profesor_estados pe
       INNER JOIN estados_profesor ep ON pe.estado_id = ep.id
       WHERE pe.profesor_id = ? AND pe.activo = TRUE
       LIMIT 1`,
      [id]
    );
    
    if (rows.length === 0) {
      return res.json(null);
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener estado actual:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

/**
 * @route   GET /profesores/:id/historial-estados
 * @desc    Obtiene el historial completo de estados de un profesor.
 * @access  Public
 */
app.get("/profesores/:id/historial-estados", validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT pe.*, ep.nombre as estado_nombre, ep.color as estado_color,
              ea.nombre as estado_anterior_nombre
       FROM profesor_estados pe
       INNER JOIN estados_profesor ep ON pe.estado_id = ep.id
       LEFT JOIN estados_profesor ea ON pe.estado_anterior_id = ea.id
       WHERE pe.profesor_id = ?
       ORDER BY pe.fecha_inicio DESC`,
      [id]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener historial de estados:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

/**
 * @route   POST /profesores/:id/cambiar-estado
 * @desc    Cambia el estado de un profesor.
 * @access  Public
 * @body    {
 *   "estado_id": 8,
 *   "fecha_inicio": "2024-01-15",
 *   "fecha_fin": "2024-02-15", // Opcional, solo para estados temporales
 *   "motivo": "Licencia médica por enfermedad",
 *   "observaciones": "Debe presentar certificado al retorno",
 *   "documento_referencia": "EXP-2024-001"
 * }
 */
app.post("/profesores/:id/cambiar-estado", validateId, sanitizeInput, logSensitiveOperation('CAMBIAR_ESTADO'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      estado_id,
      fecha_inicio,
      fecha_fin,
      motivo,
      observaciones,
      documento_referencia,
    } = req.body;

    // Validar que el estado existe
    const [estadoExists] = await pool.query(
      "SELECT * FROM estados_profesor WHERE id = ?",
      [estado_id]
    );
    
    if (estadoExists.length === 0) {
      return res.status(400).json({ message: "El estado especificado no existe" });
    }

    // Obtener el estado anterior si existe
    const [estadoAnterior] = await pool.query(
      "SELECT estado_id FROM profesor_estados WHERE profesor_id = ? AND activo = TRUE LIMIT 1",
      [id]
    );

    const estadoAnteriorId = estadoAnterior.length > 0 ? estadoAnterior[0].estado_id : null;

    // Desactivar el estado anterior
    await pool.query(
      "UPDATE profesor_estados SET activo = FALSE, fecha_fin = IFNULL(fecha_fin, ?) WHERE profesor_id = ? AND activo = TRUE",
      [fecha_inicio, id]
    );

    // Insertar el nuevo estado
    const [result] = await pool.query(
      `INSERT INTO profesor_estados 
       (profesor_id, estado_id, fecha_inicio, fecha_fin, motivo, observaciones, documento_referencia, estado_anterior_id, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        id,
        estado_id,
        fecha_inicio,
        fecha_fin || null,
        motivo || null,
        observaciones || null,
        documento_referencia || null,
        estadoAnteriorId,
      ]
    );

    // Actualizar el estado actual en la tabla profesores
    await pool.query(
      "UPDATE profesores SET estado_actual_id = ? WHERE id = ?",
      [estado_id, id]
    );

    res.status(201).json({
      message: "Estado cambiado correctamente",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error al cambiar estado:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

/**
 * @route   POST /profesores/:id/finalizar-estado
 * @desc    Finaliza el estado actual de un profesor y retorna al estado anterior.
 * @access  Public
 */
app.post("/profesores/:id/finalizar-estado", validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha_fin } = req.body;

    // Obtener el estado actual
    const [estadoActual] = await pool.query(
      "SELECT * FROM profesor_estados WHERE profesor_id = ? AND activo = TRUE LIMIT 1",
      [id]
    );

    if (estadoActual.length === 0) {
      return res.status(400).json({ message: "El profesor no tiene un estado activo" });
    }

    const estadoAnteriorId = estadoActual[0].estado_anterior_id;

    // Desactivar el estado actual
    await pool.query(
      "UPDATE profesor_estados SET activo = FALSE, fecha_fin = ? WHERE profesor_id = ? AND activo = TRUE",
      [fecha_fin || new Date().toISOString().split('T')[0], id]
    );

    // Si existe estado anterior, reactivarlo
    if (estadoAnteriorId) {
      // Crear nuevo registro con el estado anterior
      await pool.query(
        `INSERT INTO profesor_estados 
         (profesor_id, estado_id, fecha_inicio, fecha_fin, motivo, activo)
         VALUES (?, ?, ?, NULL, 'Retorno tras finalización de estado temporal', TRUE)`,
        [id, estadoAnteriorId, fecha_fin || new Date().toISOString().split('T')[0]]
      );

      // Actualizar estado actual en tabla profesores
      await pool.query(
        "UPDATE profesores SET estado_actual_id = ? WHERE id = ?",
        [estadoAnteriorId, id]
      );
    } else {
      // Si no hay estado anterior, poner en NULL
      await pool.query(
        "UPDATE profesores SET estado_actual_id = NULL WHERE id = ?",
        [id]
      );
    }

    res.json({ message: "Estado finalizado correctamente" });
  } catch (error) {
    console.error("Error al finalizar estado:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

/**
 * @route   GET /profesores-con-estado
 * @desc    Obtiene todos los profesores con su estado actual incluido.
 * @access  Public
 */
app.get("/profesores-con-estado", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.*,
        ep.nombre as estado_nombre,
        ep.color as estado_color,
        ep.requiere_detalles as estado_requiere_detalles,
        pe.fecha_inicio as estado_fecha_inicio,
        pe.fecha_fin as estado_fecha_fin,
        pe.motivo as estado_motivo,
        DATEDIFF(pe.fecha_fin, CURDATE()) as dias_restantes
      FROM profesores p
      LEFT JOIN profesor_estados pe ON p.id = pe.profesor_id AND pe.activo = TRUE
      LEFT JOIN estados_profesor ep ON pe.estado_id = ep.id
      ORDER BY p.apellido_nombres ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener profesores con estado:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

app.listen(PORT, () => {
  console.log(`✓ Servidor backend corriendo en http://localhost:${PORT}`);
  console.log(`✓ CORS habilitado para: ${FRONTEND_URL}`);
});
