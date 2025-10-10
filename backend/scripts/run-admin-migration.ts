import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function runAdminMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Running admin dashboard migration...');
    
    const migrationPath = path.join(__dirname, '../src/database/migrations/006_admin_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    
    await client.query('BEGIN');
    await client.query(migrationSQL);
    await client.query('COMMIT');
    
    console.log('✅ Admin dashboard migration completed successfully!');
    console.log('');
    console.log('Created tables:');
    console.log('  - system_config');
    console.log('  - system_logs');
    console.log('  - search_logs');
    console.log('');
    console.log('Added indexes for performance optimization');
    console.log('');
    console.log('Next steps:');
    console.log('1. Start the backend server: npm run dev');
    console.log('2. Access admin dashboard: http://localhost:3000/admin');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runAdminMigration().catch(console.error);
