import { BackupService } from '../src/services/backupService';

async function performFullBackup() {
  console.log('💾 Starting full backup (database + exports)...\n');

  const backupService = new BackupService();

  try {
    const result = await backupService.performFullBackup();

    console.log('📊 Backup Results:\n');

    // Database backup
    if (result.database.success) {
      console.log('✅ Database backup: SUCCESS');
      console.log(`   Filename: ${result.database.filename}`);
      console.log(`   Size: ${(result.database.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Duration: ${result.database.duration}ms\n`);
    } else {
      console.log('❌ Database backup: FAILED');
      console.log(`   Error: ${result.database.error}\n`);
    }

    // Exports backup
    if (result.exports) {
      if (result.exports.success) {
        console.log('✅ Exports backup: SUCCESS');
        console.log(`   Filename: ${result.exports.filename}`);
        console.log(`   Size: ${(result.exports.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Duration: ${result.exports.duration}ms\n`);
      } else {
        console.log('❌ Exports backup: FAILED');
        console.log(`   Error: ${result.exports.error}\n`);
      }
    }

    // Statistics
    const stats = await backupService.getBackupStatistics();
    console.log('📈 Backup Statistics:');
    console.log(`   Total backups: ${stats.totalBackups}`);
    console.log(`   Database backups: ${stats.databaseBackups}`);
    console.log(`   Export backups: ${stats.exportBackups}`);
    console.log(`   Total size: ${stats.totalSize} MB\n`);

    if (result.database.success) {
      console.log('🎉 Full backup completed successfully!');
      process.exit(0);
    } else {
      console.log('⚠️  Backup completed with errors');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
}

performFullBackup();
