import { ExcelExportService } from './excelExportService';
import { CloudStorageService } from './cloudStorageService';
import { logger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

export class ScheduledExportService {
  private excelService: ExcelExportService;
  private cloudStorage: CloudStorageService;
  private exportDir: string;
  private isRunning: boolean = false;

  constructor() {
    this.excelService = new ExcelExportService();
    this.cloudStorage = new CloudStorageService();
    this.exportDir = process.env.EXPORT_DIR || path.join(__dirname, '../../exports');
    this.ensureExportDirectory();
  }

  private ensureExportDirectory() {
    if (!fs.existsSync(this.exportDir)) {
      fs.mkdirSync(this.exportDir, { recursive: true });
    }
  }

  /**
   * Schedule daily export at specified time (Saudi Arabia timezone)
   */
  async scheduleDailyExport(hour: number = 2, minute: number = 0) {
    if (this.isRunning) {
      logger.warn('Scheduled export is already running');
      return;
    }

    this.isRunning = true;
    logger.info(`Scheduled daily export at ${hour}:${minute} (Saudi Arabia time)`);

    const scheduleNextExport = () => {
      const now = new Date();
      
      // Convert to Saudi Arabia timezone (UTC+3)
      const saudiTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Riyadh' }));
      
      const scheduledTime = new Date(saudiTime);
      scheduledTime.setHours(hour, minute, 0, 0);

      // If scheduled time has passed today, schedule for tomorrow
      if (scheduledTime <= saudiTime) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const delay = scheduledTime.getTime() - saudiTime.getTime();

      setTimeout(async () => {
        try {
          await this.performDailyExport();
        } catch (error) {
          logger.error('Error performing scheduled export:', error);
        }
        scheduleNextExport(); // Schedule next export
      }, delay);

      logger.info(`Next export scheduled for: ${scheduledTime.toISOString()}`);
    };

    scheduleNextExport();
  }

  /**
   * Perform daily export
   */
  private async performDailyExport() {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `visitor-export-${timestamp}.xlsx`;
    const filepath = path.join(this.exportDir, filename);

    logger.info(`Starting daily export: ${filename}`);

    try {
      // Generate export for previous day
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const workbook = await this.excelService.generateVisitorExport({
        startDate: yesterday,
        endDate: today,
        includeInactive: true
      });

      await workbook.xlsx.writeFile(filepath);

      logger.info(`Daily export completed: ${filepath}`);

      // Upload to cloud storage if configured
      await this.uploadToCloudStorage(filepath, filename);

      // Clean up old exports (keep last 30 days)
      await this.cleanupOldExports(30);

    } catch (error) {
      logger.error('Error in daily export:', error);
      throw error;
    }
  }

  /**
   * Export on-demand with custom date range
   */
  async exportDateRange(startDate: Date, endDate: Date): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `visitor-export-${timestamp}.xlsx`;
    const filepath = path.join(this.exportDir, filename);

    logger.info(`Generating on-demand export: ${filename}`);

    const workbook = await this.excelService.generateVisitorExport({
      startDate,
      endDate,
      includeInactive: true
    });

    await workbook.xlsx.writeFile(filepath);

    logger.info(`On-demand export completed: ${filepath}`);

    return filepath;
  }

  /**
   * Upload export to cloud storage
   */
  private async uploadToCloudStorage(filepath: string, filename: string) {
    const provider = process.env.CLOUD_STORAGE_PROVIDER || 'local';

    if (provider === 'local') {
      logger.info('Using local storage, skipping cloud upload');
      return;
    }

    try {
      const result = await this.cloudStorage.uploadFile(filepath, filename);
      
      if (result.success) {
        logger.info(`File uploaded to cloud storage: ${result.url}`);
      } else {
        logger.error(`Cloud upload failed: ${result.error}`);
      }
    } catch (error) {
      logger.error('Error uploading to cloud storage:', error);
      // Don't throw - local file is still available
    }
  }

  /**
   * Clean up old export files
   */
  private async cleanupOldExports(daysToKeep: number) {
    try {
      const files = fs.readdirSync(this.exportDir);
      const now = Date.now();
      const maxAge = daysToKeep * 24 * 60 * 60 * 1000;

      let deletedCount = 0;

      files.forEach(file => {
        const filepath = path.join(this.exportDir, file);
        const stats = fs.statSync(filepath);
        const age = now - stats.mtimeMs;

        if (age > maxAge) {
          fs.unlinkSync(filepath);
          deletedCount++;
          logger.info(`Deleted old export: ${file}`);
        }
      });

      if (deletedCount > 0) {
        logger.info(`Cleaned up ${deletedCount} old export files`);
      }
    } catch (error) {
      logger.error('Error cleaning up old exports:', error);
    }
  }

  /**
   * Get list of available exports
   */
  async listExports(): Promise<Array<{ filename: string; size: number; date: Date }>> {
    const files = fs.readdirSync(this.exportDir);
    
    return files
      .filter(file => file.endsWith('.xlsx'))
      .map(file => {
        const filepath = path.join(this.exportDir, file);
        const stats = fs.statSync(filepath);
        return {
          filename: file,
          size: stats.size,
          date: stats.mtime
        };
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  /**
   * Stop scheduled exports
   */
  stop() {
    this.isRunning = false;
    logger.info('Scheduled export service stopped');
  }
}
