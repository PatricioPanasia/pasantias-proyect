import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "node_project",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Seguridad: Prevenir inyección SQL y otros ataques
  multipleStatements: false, // Deshabilitar múltiples queries por seguridad
  charset: 'utf8mb4', // Soporte completo de caracteres UTF-8
});

// Función para hashear contraseñas existentes (ejecutar una sola vez)
export async function migratePasswordsToHash() {
  try {
    const [users] = await pool.query("SELECT id, password FROM users WHERE password NOT LIKE '$2b$%'");
    
    if (users.length > 0) {
      console.log(`\n⚠️  Encontradas ${users.length} contraseñas sin hashear. Iniciando migración...`);
      
      const bcrypt = (await import('bcrypt')).default;
      
      for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await pool.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, user.id]);
        console.log(`   ✓ Usuario ID ${user.id} - Contraseña migrada a bcrypt`);
      }
      
      console.log(`✓ Migración completada: ${users.length} contraseñas hasheadas\n`);
    }
  } catch (error) {
    console.error('Error en migración de contraseñas:', error);
  }
}

// Verificar conexión al iniciar
pool.getConnection()
  .then(connection => {
    console.log('✓ Conexión exitosa a la base de datos MySQL');
    connection.release();
    
    // Migrar contraseñas existentes a bcrypt (solo se ejecuta si hay contraseñas sin hashear)
    migratePasswordsToHash();
  })
  .catch(err => {
    console.error('✗ Error al conectar a la base de datos:', err.message);
    process.exit(1); // Salir si no hay conexión a la BD
  });

export default pool;
