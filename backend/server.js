import express from "express";
import cors from "cors";
import pool from "./db.js";

const app = express();

// Configuración de CORS para permitir peticiones desde el frontend
app.use(cors({
  origin: 'http://localhost:5173'
}));

app.use(express.json());

/**
 * @route   POST /login
 * @desc    Autentica a un usuario por email y contraseña.
 * @access  Public
 * @body    { "email": "user@example.com", "password": "password123" }
 */
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Correo y contraseña son requeridos." });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "Credenciales incorrectas." });
    }

    const user = rows[0];
    const match = (password === user.password); // Comparación directa sin encriptación

    if (match) {
      res.json({ message: "Login exitoso." });
    } else {
      res.status(401).json({ message: "Credenciales incorrectas." });
    }
  } catch (error) {
    console.error("Error en el login:", error);
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
    const [rows] = await pool.query("SELECT * FROM profesores ORDER BY apellido_nombres ASC");
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
app.post("/profesores", async (req, res) => {
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

    await pool.query(
      `INSERT INTO profesores (cargo, apellido_nombres, cargo_titular, cargo_provisional, cargo_interino, cargo_suplente, actos_administrativos, documento_n, cupof, foja_n, toma_posesion, encargado_lab_especialidad, fecha_nacimiento) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [cargo, apellido_nombres, cargo_titular, cargo_provisional, cargo_interino, cargo_suplente, actos_administrativos, documento_n, cupof, foja_n, toma_posesion, encargado_lab_especialidad, fecha_nacimiento]
    );
    res.status(201).json({ message: "Profesor creado correctamente" });
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
app.put("/profesores/:id", async (req, res) => {
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
      [cargo, apellido_nombres, cargo_titular, cargo_provisional, cargo_interino, cargo_suplente, actos_administrativos, documento_n, cupof, foja_n, toma_posesion, encargado_lab_especialidad, fecha_nacimiento, id]
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
app.delete("/profesores/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM profesores WHERE id=?", [id]);
    res.json({ message: "Profesor eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar profesor:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

app.listen(3001, () => {
  console.log("Servidor backend corriendo en http://localhost:3001");
});
