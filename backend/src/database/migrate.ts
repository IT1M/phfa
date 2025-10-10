import { pool } from '../config/database';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger';

async function runMigrations() {
  try {
    console.log('🔄 Starting database migrations...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    
    // Execute the schema
    await pool.query(schema);
    
    console.log('✅ Database migrations completed successfully');
    logger.info('Database migrations completed');
    
    // Insert default admin user if not exists
    await createDefaultAdmin();
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    logger.error('Migration failed:', error);
    process.exit(1);
  }
}

async function createDefaultAdmin() {
  try {
    const bcrypt = require('bcryptjs');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@medical-docs.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    // Check if admin already exists
    const existingAdmin = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [adminEmail]
    );
    
    if (existingAdmin.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      await pool.query(
        `INSERT INTO users (email, password_hash, role) 
         VALUES ($1, $2, 'admin')`,
        [adminEmail, hashedPassword]
      );
      
      console.log(`✅ Default admin user created: ${adminEmail}`);
      console.log(`🔑 Default password: ${adminPassword}`);
      console.log('⚠️  Please change the default password after first login');
    } else {
      console.log('ℹ️  Admin user already exists');
    }
    
  } catch (error) {
    console.error('❌ Failed to create default admin:', error);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

export { runMigrations };