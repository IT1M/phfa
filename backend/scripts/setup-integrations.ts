/**
 * Setup Integration System
 * Initializes database tables and default configurations
 */

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function setupIntegrations() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  try {
    console.log('🔧 Setting up integration system...\n');

    // Run migration
    console.log('📋 Running integration migration...');
    const migrationPath = path.join(__dirname, '../src/database/migrations/007_integrations.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    await pool.query(migrationSQL);
    console.log('✓ Migration completed\n');

    // Check existing configurations
    console.log('🔍 Checking integration configurations...');
    const configResult = await pool.query('SELECT name, type, enabled FROM integration_configs');
    
    if (configResult.rows.length > 0) {
      console.log('\nExisting integrations:');
      configResult.rows.forEach(row => {
        const status = row.enabled ? '✓ Enabled' : '✗ Disabled';
        console.log(`  - ${row.name} (${row.type}): ${status}`);
      });
    } else {
      console.log('  No integrations configured yet');
    }

    // Check webhooks
    console.log('\n🔗 Checking webhooks...');
    const webhookResult = await pool.query('SELECT COUNT(*) as count FROM webhooks');
    console.log(`  Found ${webhookResult.rows[0].count} webhook(s)`);

    console.log('\n✅ Integration system setup completed!\n');
    console.log('Next steps:');
    console.log('1. Configure integration endpoints in .env file');
    console.log('2. Enable integrations via admin panel or API');
    console.log('3. Test connections: GET /api/integrations/test');
    console.log('4. View API docs: http://localhost:5000/api-docs\n');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupIntegrations();
