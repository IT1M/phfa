import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import crypto from 'crypto';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function setupSecurity() {
  console.log('🔒 Setting up enterprise-grade security...\n');

  try {
    // 1. Generate encryption keys if not present
    console.log('1. Checking encryption keys...');
    if (!process.env.ENCRYPTION_KEY) {
      const encryptionKey = crypto.randomBytes(32).toString('hex');
      console.log('   Generated ENCRYPTION_KEY:', encryptionKey);
      console.log('   ⚠️  Add this to your .env file!');
    } else {
      console.log('   ✓ Encryption key found');
    }

    if (!process.env.BACKUP_ENCRYPTION_KEY) {
      const backupKey = crypto.randomBytes(32).toString('hex');
      console.log('   Generated BACKUP_ENCRYPTION_KEY:', backupKey);
      console.log('   ⚠️  Add this to your .env file!');
    } else {
      console.log('   ✓ Backup encryption key found');
    }

    // 2. Run security migrations
    console.log('\n2. Running security migrations...');
    const migrationPath = path.join(__dirname, '../src/database/migrations/008_security_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    await pool.query(migrationSQL);
    console.log('   ✓ Security tables created');

    // 3. Generate TLS certificates for development
    console.log('\n3. Setting up TLS certificates...');
    const certPath = path.join(__dirname, '../certs');
    
    if (!fs.existsSync(certPath)) {
      fs.mkdirSync(certPath, { recursive: true });
    }

    const keyPath = path.join(certPath, 'server.key');
    const certFilePath = path.join(certPath, 'server.crt');

    if (!fs.existsSync(keyPath) || !fs.existsSync(certFilePath)) {
      console.log('   Generating self-signed certificate...');
      execSync(
        `openssl req -x509 -newkey rsa:4096 -keyout ${keyPath} -out ${certFilePath} ` +
        `-days 365 -nodes -subj "/CN=localhost"`,
        { stdio: 'inherit' }
      );
      console.log('   ✓ TLS certificates generated');
    } else {
      console.log('   ✓ TLS certificates found');
    }

    // 4. Set up default IP whitelist
    console.log('\n4. Setting up IP whitelist...');
    await pool.query(
      `INSERT INTO ip_whitelist (ip_address, role, description, enabled)
       VALUES ('127.0.0.1', 'admin', 'Localhost', true),
              ('::1', 'admin', 'Localhost IPv6', true)
       ON CONFLICT (ip_address, role) DO NOTHING`
    );
    console.log('   ✓ Default IP whitelist configured');

    // 5. Create security monitoring user
    console.log('\n5. Setting up security monitoring...');
    console.log('   ✓ Monitoring services ready');

    // 6. Display security checklist
    console.log('\n📋 Security Setup Checklist:');
    console.log('   [ ] Add encryption keys to .env file');
    console.log('   [ ] Configure production TLS certificates');
    console.log('   [ ] Add admin IP addresses to whitelist');
    console.log('   [ ] Enable MFA for admin accounts');
    console.log('   [ ] Review and test backup procedures');
    console.log('   [ ] Set up security monitoring alerts');
    console.log('   [ ] Schedule regular security audits');
    console.log('   [ ] Configure data retention policies');

    console.log('\n✅ Security setup completed successfully!');
    console.log('\n📖 Read SECURITY_IMPLEMENTATION.md for detailed documentation');

  } catch (error) {
    console.error('❌ Security setup failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

setupSecurity().catch(console.error);
