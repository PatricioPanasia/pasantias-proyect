/**
 * Script de Backup de Base de Datos
 * Ejecutar: node scripts/backup-database.js
 * 
 * Genera un dump SQL de la base de datos con timestamp
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const execAsync = promisify(exec);

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'node_project';

// Directorio de backups
const BACKUP_DIR = path.join(process.cwd(), 'backups');

async function createBackup() {
  console.log('💾 Iniciando backup de base de datos...\n');
  
  try {
    // Crear directorio de backups si no existe
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      console.log(`📁 Directorio de backups creado: ${BACKUP_DIR}\n`);
    }
    
    // Nombre del archivo con timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    const filename = `backup_${DB_NAME}_${timestamp}_${time}.sql`;
    const filepath = path.join(BACKUP_DIR, filename);
    
    // Comando mysqldump
    const passwordArg = DB_PASSWORD ? `-p${DB_PASSWORD}` : '';
    const command = `mysqldump -h ${DB_HOST} -u ${DB_USER} ${passwordArg} ${DB_NAME} > "${filepath}"`;
    
    console.log(`📊 Base de datos: ${DB_NAME}`);
    console.log(`📂 Archivo: ${filename}\n`);
    
    // Ejecutar backup
    await execAsync(command);
    
    // Verificar que el archivo se creó
    const stats = fs.statSync(filepath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    
    console.log(`✓ Backup completado exitosamente!`);
    console.log(`   Tamaño: ${sizeMB} MB`);
    console.log(`   Ubicación: ${filepath}\n`);
    
    // Limpiar backups antiguos (mantener últimos 7)
    cleanOldBackups();
    
  } catch (error) {
    console.error('❌ Error al crear backup:', error.message);
    console.error('\n⚠️  Asegúrate de que:');
    console.error('   1. MySQL está instalado y en el PATH');
    console.error('   2. Las credenciales en .env son correctas');
    console.error('   3. Tienes permisos para ejecutar mysqldump\n');
    process.exit(1);
  }
}

function cleanOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('backup_') && f.endsWith('.sql'))
      .map(f => ({
        name: f,
        path: path.join(BACKUP_DIR, f),
        time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);
    
    if (files.length > 7) {
      const toDelete = files.slice(7);
      console.log(`🗑️  Eliminando ${toDelete.length} backups antiguos...`);
      
      toDelete.forEach(file => {
        fs.unlinkSync(file.path);
        console.log(`   ✓ Eliminado: ${file.name}`);
      });
      
      console.log('');
    }
  } catch (error) {
    console.error('⚠️  Error al limpiar backups antiguos:', error.message);
  }
}

createBackup();
