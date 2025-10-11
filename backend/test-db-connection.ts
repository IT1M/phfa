import { pool } from './src/config/database';

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...\n');

  try {
    // Test basic connection
    const client = await pool.connect();
    console.log('✅ Database connection successful\n');

    // Test tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('📊 Database Tables:');
    tablesResult.rows.forEach((row: any) => {
      console.log(`   ✓ ${row.table_name}`);
    });
    console.log('');

    // Test visitors table
    const visitorsCount = await client.query('SELECT COUNT(*) FROM visitors');
    console.log(`👥 Visitors: ${visitorsCount.rows[0].count}`);

    // Test users table
    const usersCount = await client.query('SELECT COUNT(*) FROM users');
    console.log(`👤 Users: ${usersCount.rows[0].count}`);

    // Test documents table
    const documentsCount = await client.query('SELECT COUNT(*) FROM documents');
    console.log(`📄 Documents: ${documentsCount.rows[0].count}`);

    // Test search_queries table
    const queriesCount = await client.query('SELECT COUNT(*) FROM search_queries');
    console.log(`🔍 Search Queries: ${queriesCount.rows[0].count}`);

    // Test audit_logs table
    const logsCount = await client.query('SELECT COUNT(*) FROM audit_logs');
    console.log(`📝 Audit Logs: ${logsCount.rows[0].count}`);

    console.log('\n✅ All database tests passed!');
    console.log('🎉 Database is ready for production\n');

    client.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
}

testDatabaseConnection();
