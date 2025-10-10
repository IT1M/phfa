import { BackupService } from '../src/services/backupService';

async function backupDatabase() {
  console.log('💾 Starting database backup...\n');

  const backupService = new BackupService();

  try {
    const result = await backupService.backupDatabase();

    if (result.success) {
      console.log('✅ Database backup completed successfully!');
      console.log(`   Filename: ${result.filename}`);
      console.log(`   Size: ${(result.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Duration: ${result.duration}ms\n`);
      process.exit(0);
    } else {
      console.log('❌ Database backup failed!');
      console.log(`   Error: ${result.error}\n`);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
}

backupDatabase();
