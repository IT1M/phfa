import { pool } from '../src/config/database';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
  console.log('🔄 Running visitor metadata migration...');

  try {
    const migrationPath = path.join(__dirname, '../src/database/migrations/add_visitor_metadata.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    await pool.query(migrationSQL);

    console.log('✅ Migration completed successfully!');
    console.log('📊 Visitor metadata column is ready for Excel exports');

    // Verify the migration
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'visitors' AND column_name = 'metadata'
    `);

    if (result.rows.length > 0) {
      console.log('✅ Verified: metadata column exists');
      console.log(`   Type: ${result.rows[0].data_type}`);
    }

    // Check indexes
    const indexResult = await pool.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'visitors' 
      AND indexname LIKE '%metadata%'
    `);

    console.log(`✅ Created ${indexResult.rows.length} metadata indexes`);
    indexResult.rows.forEach(row => {
      console.log(`   - ${row.indexname}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
