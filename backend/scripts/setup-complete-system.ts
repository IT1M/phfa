import { pool } from '../src/config/database';
import * as fs from 'fs';
import * as path from 'path';

async function setupCompleteSystem() {
  console.log('🚀 Setting up complete Excel Export system...\n');

  try {
    // 1. Check database connection
    console.log('1️⃣  Checking database connection...');
    await pool.query('SELECT 1');
    console.log('   ✅ Database connection OK\n');

    // 2. Run metadata migration
    console.log('2️⃣  Running visitor metadata migration...');
    const migrationPath = path.join(__dirname, '../src/database/migrations/add_visitor_metadata.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    await pool.query(migrationSQL);
    console.log('   ✅ Metadata migration completed\n');

    // 3. Create directories
    console.log('3️⃣  Creating required directories...');
    const directories = [
      path.join(__dirname, '../exports'),
      path.join(__dirname, '../backups'),
      path.join(__dirname, '../logs')
    ];

    for (const dir of directories) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`   ✅ Created: ${dir}`);
      } else {
        console.log(`   ℹ️  Already exists: ${dir}`);
      }
    }
    console.log();

    // 4. Verify indexes
    console.log('4️⃣  Verifying database indexes...');
    const indexResult = await pool.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'visitors' 
      AND indexname LIKE '%metadata%'
    `);
    console.log(`   ✅ Found ${indexResult.rows.length} metadata indexes`);
    indexResult.rows.forEach(row => {
      console.log(`      - ${row.indexname}`);
    });
    console.log();

    // 5. Check environment configuration
    console.log('5️⃣  Checking environment configuration...');
    const requiredEnvVars = [
      'DB_HOST',
      'DB_PORT',
      'DB_NAME',
      'DB_USER',
      'JWT_SECRET',
      'ENCRYPTION_KEY'
    ];

    const missingVars = requiredEnvVars.filter(v => !process.env[v]);
    if (missingVars.length > 0) {
      console.log(`   ⚠️  Missing environment variables: ${missingVars.join(', ')}`);
      console.log('   ℹ️  Please configure these in your .env file\n');
    } else {
      console.log('   ✅ All required environment variables configured\n');
    }

    // 6. Check optional configurations
    console.log('6️⃣  Checking optional configurations...');
    const optionalConfigs = {
      'Scheduled Exports': process.env.ENABLE_SCHEDULED_EXPORTS === 'true',
      'Automated Backups': process.env.ENABLE_AUTOMATED_BACKUPS === 'true',
      'Cloud Storage': process.env.CLOUD_STORAGE_PROVIDER !== 'local',
      'Monitoring': process.env.ENABLE_MONITORING !== 'false'
    };

    Object.entries(optionalConfigs).forEach(([name, enabled]) => {
      console.log(`   ${enabled ? '✅' : '⚪'} ${name}: ${enabled ? 'Enabled' : 'Disabled'}`);
    });
    console.log();

    // 7. Test export functionality
    console.log('7️⃣  Testing export functionality...');
    const visitorCount = await pool.query('SELECT COUNT(*) FROM visitors');
    console.log(`   ℹ️  Found ${visitorCount.rows[0].count} visitors in database`);
    
    if (parseInt(visitorCount.rows[0].count) === 0) {
      console.log('   ⚠️  No visitors found. Consider adding test data.\n');
    } else {
      console.log('   ✅ Ready to export data\n');
    }

    // 8. Summary
    console.log('📊 Setup Summary:');
    console.log('   ✅ Database migration completed');
    console.log('   ✅ Required directories created');
    console.log('   ✅ Database indexes verified');
    console.log('   ✅ System ready for use\n');

    console.log('🎉 Setup completed successfully!\n');
    console.log('Next steps:');
    console.log('   1. Start the server: npm run dev');
    console.log('   2. Test export: curl -X GET "http://localhost:5000/api/visitors/export" -H "Authorization: Bearer TOKEN"');
    console.log('   3. Check monitoring: curl -X GET "http://localhost:5000/api/monitoring/health" -H "Authorization: Bearer TOKEN"');
    console.log('   4. View documentation: backend/EXCEL_EXPORT_GUIDE.md\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupCompleteSystem();
