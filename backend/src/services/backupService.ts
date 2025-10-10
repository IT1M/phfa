import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../utils/logger';
import { CloudStorageService } from './cloudStorageService';

const execAsync = promisify(exec);

export interface BackupConfig {
  enabled: boolean;
  schedule: string; // cron format
  retention: number; // days
  backupDir: string;
  includeExports: boolean;
  cloudUpload: boolean;
}

export interface BackupResult {
  success: boolean;
  filename: string;
  size: number;
  duration: number;
  error?: string;
}

export class BackupService {
  private config: BackupConfig;
  private cloudStorage: CloudStorageService;
  private isRunning: boolean = false;

  constructor() {
    this.config = {
      enabled: process.env.ENABLE_AUTOMATED_BACKUPS === 'true',
      schedule: process.env.BACKUP_SCHEDULE || '0 3 * * *', // 3 AM daily
      retention: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
      backupDir: process.env.BACKUP_DIR || path.join(__dirname, '../../backups'),
      includeExports: process.env.BACKUP_INCLUDE_EXPORTS === 'true',
      cloudUpload: process.env.BACKUP_CLOUD_UPLOAD === 'true'
    };

    this.cloudStorage = new CloudStorageService();
    this.ensureBackupDirectory();
  }

  private ensureBackupDirectory() {
    if (!fs.existsSync(this.config.backupDir)) {
      fs.mkdirSync(this.config.backupDir, { recursive: true });
      logger.info(`Created backup directory: ${this.config.backupDir}`);
    }
  }

  /**
   * Perform database backup
   */
  async backupDatabase(): Promise<BackupResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `db-backup-${timestamp}.sql`;
    const filepath = path.join(this.config.backupDir, filename);

    try {
      logger.info('Starting database backup...');

      const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || '5432',
        database: process.env.DB_NAME || 'medical_documents',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD
      };

      // Set password environment variable for pg_dump
      const env = { ...process.env, PGPASSWORD: dbConfig.password };

      // Execute pg_dump
      const command = `pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -F c -f ${filepath}`;
      
      await execAsync(command, { env });

      const stats = fs.statSync(filepath);
      const duration = Date.now() - startTime;

      logger.info(`Database backup completed: ${filename} (${stats.size} bytes, ${duration}ms)`);

      // Upload to cloud if enabled
      if (this.config.cloudUpload) {
        await this.cloudStorage.uploadFile(filepath, filename);
      }

      return {
        success: true,
        filename,
        size: stats.size,
        duration
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error('Database backup failed:', error);

      return {
        success: false,
        filename,
        size: 0,
        duration,
        error: error.message
      };
    }
  }

  /**
   * Backup exports directory
   */
  async backupExports(): Promise<BackupResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `exports-backup-${timestamp}.tar.gz`;
    const filepath = path.join(this.config.backupDir, filename);

    try {
      logger.info('Starting exports backup...');

      const exportDir = process.env.EXPORT_DIR || path.join(__dirname, '../../exports');

      if (!fs.existsSync(exportDir)) {
        logger.warn('Export directory does not exist, skipping exports backup');
        return {
          success: true,
          filename,
          size: 0,
          duration: Date.now() - startTime
        };
      }

      // Create tar.gz archive
      const command = `tar -czf ${filepath} -C ${path.dirname(exportDir)} ${path.basename(exportDir)}`;
      await execAsync(command);

      const stats = fs.statSync(filepath);
      const duration = Date.now() - startTime;

      logger.info(`Exports backup completed: ${filename} (${stats.size} bytes, ${duration}ms)`);

      // Upload to cloud if enabled
      if (this.config.cloudUpload) {
        await this.cloudStorage.uploadFile(filepath, filename);
      }

      return {
        success: true,
        filename,
        size: stats.size,
        duration
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error('Exports backup failed:', error);

      return {
        success: false,
        filename,
        size: 0,
        duration,
        error: error.message
      };
    }
  }

  /**
   * Perform full backup (database + exports)
   */
  async performFullBackup(): Promise<{
    database: BackupResult;
    exports?: BackupResult;
  }> {
    logger.info('Starting full backup...');

    const database = await this.backupDatabase();
    let exports: BackupResult | undefined;

    if (this.config.includeExports) {
      exports = await this.backupExports();
    }

    // Clean up old backups
    await this.cleanupOldBackups();

    logger.info('Full backup completed');

    return { database, exports };
  }

  /**
   * Clean up old backup files
   */
  async cleanupOldBackups() {
    try {
      const files = fs.readdirSync(this.config.backupDir);
      const now = Date.now();
      const maxAge = this.config.retention * 24 * 60 * 60 * 1000;

      let deletedCount = 0;

      for (const file of files) {
        const filepath = path.join(this.config.backupDir, file);
        const stats = fs.statSync(filepath);
        const age = now - stats.mtimeMs;

        if (age > maxAge) {
          fs.unlinkSync(filepath);
          deletedCount++;
          logger.info(`Deleted old backup: ${file}`);
        }
      }

      if (deletedCount > 0) {
        logger.info(`Cleaned up ${deletedCount} old backup files`);
      }
    } catch (error) {
      logger.error('Error cleaning up old backups:', error);
    }
  }

  /**
   * Restore database from backup
   */
  async restoreDatabase(backupFilename: string): Promise<boolean> {
    try {
      logger.info(`Starting database restore from: ${backupFilename}`);

      const filepath = path.join(this.config.backupDir, backupFilename);

      if (!fs.existsSync(filepath)) {
        throw new Error(`Backup file not found: ${backupFilename}`);
      }

      const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || '5432',
        database: process.env.DB_NAME || 'medical_documents',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD
      };

      const env = { ...process.env, PGPASSWORD: dbConfig.password };

      // Execute pg_restore
      const command = `pg_restore -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -c ${filepath}`;
      
      await execAsync(command, { env });

      logger.info('Database restore completed successfully');
      return true;
    } catch (error: any) {
      logger.error('Database restore failed:', error);
      return false;
    }
  }

  /**
   * List available backups
   */
  async listBackups(): Promise<Array<{
    filename: string;
    type: 'database' | 'exports';
    size: number;
    date: Date;
  }>> {
    try {
      const files = fs.readdirSync(this.config.backupDir);

      return files
        .filter(f => f.endsWith('.sql') || f.endsWith('.tar.gz'))
        .map(file => {
          const filepath = path.join(this.config.backupDir, file);
          const stats = fs.statSync(filepath);
          
          return {
            filename: file,
            type: file.includes('db-backup') ? 'database' as const : 'exports' as const,
            size: stats.size,
            date: stats.mtime
          };
        })
        .sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch (error) {
      logger.error('Error listing backups:', error);
      return [];
    }
  }

  /**
   * Schedule automated backups
   */
  scheduleAutomatedBackups() {
    if (!this.config.enabled) {
      logger.info('Automated backups are disabled');
      return;
    }

    if (this.isRunning) {
      logger.warn('Automated backups are already scheduled');
      return;
    }

    this.isRunning = true;

    // Parse cron schedule (simplified - daily at specified hour)
    const hour = parseInt(process.env.BACKUP_SCHEDULE_HOUR || '3');
    const minute = parseInt(process.env.BACKUP_SCHEDULE_MINUTE || '0');

    logger.info(`Scheduled automated backups at ${hour}:${minute} (Saudi Arabia time)`);

    const scheduleNextBackup = () => {
      const now = new Date();
      const saudiTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Riyadh' }));
      
      const scheduledTime = new Date(saudiTime);
      scheduledTime.setHours(hour, minute, 0, 0);

      if (scheduledTime <= saudiTime) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const delay = scheduledTime.getTime() - saudiTime.getTime();

      setTimeout(async () => {
        try {
          await this.performFullBackup();
        } catch (error) {
          logger.error('Error performing scheduled backup:', error);
        }
        scheduleNextBackup();
      }, delay);

      logger.info(`Next backup scheduled for: ${scheduledTime.toISOString()}`);
    };

    scheduleNextBackup();
  }

  /**
   * Stop automated backups
   */
  stop() {
    this.isRunning = false;
    logger.info('Automated backup service stopped');
  }

  /**
   * Get backup statistics
   */
  async getBackupStatistics() {
    const backups = await this.listBackups();
    
    const dbBackups = backups.filter(b => b.type === 'database');
    const exportBackups = backups.filter(b => b.type === 'exports');

    const totalSize = backups.reduce((sum, b) => sum + b.size, 0);

    return {
      totalBackups: backups.length,
      databaseBackups: dbBackups.length,
      exportBackups: exportBackups.length,
      totalSize: Math.round(totalSize / 1024 / 1024), // MB
      oldestBackup: backups.length > 0 ? backups[backups.length - 1].date : null,
      newestBackup: backups.length > 0 ? backups[0].date : null
    };
  }
}
