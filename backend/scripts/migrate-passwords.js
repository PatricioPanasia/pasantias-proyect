/**
 * Script para migrar contraseñas existentes a bcrypt
 * Ejecutar: node scripts/migrate-passwords.js
 */

import bcrypt from 'bcrypt';
import pool from '../db.js';
import dotenv from 'dotenv';

dotenv.config();

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10;

async function migratePasswords() {
  console.log('🔐 Iniciando migración de contraseñas a bcrypt...\n');
  
  try {
    // Obtener usuarios con contraseñas sin hashear
    const [users] = await pool.query(
      "SELECT id, email, password FROM users WHERE password NOT LIKE '$2b$%'"
    );
    
    if (users.length === 0) {
      console.log('✓ Todas las contraseñas ya están hasheadas con bcrypt.\n');
      process.exit(0);
    }
    
    console.log(`📊 Encontrados ${users.length} usuarios con contraseñas sin hashear:\n`);
    
    let migrated = 0;
    let failed = 0;
    
    for (const user of users) {
      try {
        // Hashear contraseña
        const hashedPassword = await bcrypt.hash(user.password, BCRYPT_ROUNDS);
        
        // Actualizar en base de datos
        await pool.query(
          'UPDATE users SET password = ? WHERE id = ?',
          [hashedPassword, user.id]
        );
        
        console.log(`   ✓ ${user.email} (ID: ${user.id})`);
        migrated++;
        
      } catch (error) {
        console.error(`   ✗ Error con ${user.email}:`, error.message);
        failed++;
      }
    }
    
    console.log(`\n📈 Resumen de migración:`);
    console.log(`   ✓ Migradas exitosamente: ${migrated}`);
    if (failed > 0) {
      console.log(`   ✗ Fallidas: ${failed}`);
    }
    console.log(`\n🎉 Migración completada!\n`);
    
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

migratePasswords();
