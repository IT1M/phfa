import { pool } from '../config/database';
import { logger } from '../utils/logger';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

export interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    total: number;
    free: number;
    used: number;
    usagePercent: number;
  };
  disk: {
    total: number;
    free: number;
    used: number;
    usagePercent: number;
  };
  database: {
    connections: number;
    activeQueries: number;
    tableSize: number;
  };
  exports: {
    totalFiles: number;
    totalSize: number;
    oldestFile: Date | null;
    newestFile: Date | null;
  };
}

export interface ExportMetrics {
  totalExports: number;
  successfulExports: number;
  failedExports: number;
  averageSize: number;
  averageDuration: number;
  lastExportTime: Date | null;
}

export class MonitoringService {
  private metricsHistory: SystemMetrics[] = [];
  private maxHistorySize = 1000;
  private exportDir: string;

  constructor() {
    this.exportDir = process.env.EXPORT_DIR || path.join(__dirname, '../../exports');
  }

  /**
   * Collect current system metrics
   */
  async collectMetrics(): Promise<SystemMetrics> {
    const metrics: SystemMetrics = {
      timestamp: new Date(),
      cpu: this.getCPUMetrics(),
      memory: this.getMemoryMetrics(),
      disk: await this.getDiskMetrics(),
      database: await this.getDatabaseMetrics(),
      exports: await this.getExportMetrics()
    };

    // Store in history
    this.metricsHistory.push(metrics);
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory.shift();
    }

    return metrics;
  }

  /**
   * Get CPU metrics
   */
  private getCPUMetrics() {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    });

    const usage = 100 - ~~(100 * totalIdle / totalTick);
    const loadAverage = os.loadavg();

    return { usage, loadAverage };
  }

  /**
   * Get memory metrics
   */
  private getMemoryMetrics() {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    const usagePercent = (used / total) * 100;

    return {
      total: Math.round(total / 1024 / 1024), // MB
      free: Math.round(free / 1024 / 1024),
      used: Math.round(used / 1024 / 1024),
      usagePercent: Math.round(usagePercent * 100) / 100
    };
  }

  /**
   * Get disk metrics
   */
  private async getDiskMetrics() {
    try {
      const stats = fs.statfsSync ? fs.statfsSync(this.exportDir) : null;
      
      if (stats) {
        const total = stats.blocks * stats.bsize;
        const free = stats.bfree * stats.bsize;
        const used = total - free;
        const usagePercent = (used / total) * 100;

        return {
          total: Math.round(total / 1024 / 1024 / 1024), // GB
          free: Math.round(free / 1024 / 1024 / 1024),
          used: Math.round(used / 1024 / 1024 / 1024),
          usagePercent: Math.round(usagePercent * 100) / 100
        };
      }
    } catch (error) {
      logger.warn('Could not get disk metrics:', error);
    }

    return { total: 0, free: 0, used: 0, usagePercent: 0 };
  }

  /**
   * Get database metrics
   */
  private async getDatabaseMetrics() {
    try {
      // Get connection count
      const connResult = await pool.query(`
        SELECT count(*) as connections 
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `);

      // Get active queries
      const queryResult = await pool.query(`
        SELECT count(*) as active_queries 
        FROM pg_stat_activity 
        WHERE state = 'active' AND datname = current_database()
      `);

      // Get table size
      const sizeResult = await pool.query(`
        SELECT pg_size_pretty(pg_total_relation_size('visitors')) as size,
               pg_total_relation_size('visitors') as bytes
      `);

      return {
        connections: parseInt(connResult.rows[0].connections),
        activeQueries: parseInt(queryResult.rows[0].active_queries),
        tableSize: parseInt(sizeResult.rows[0].bytes) / 1024 / 1024 // MB
      };
    } catch (error) {
      logger.error('Error getting database metrics:', error);
      return { connections: 0, activeQueries: 0, tableSize: 0 };
    }
  }

  /**
   * Get export directory metrics
   */
  private async getExportMetrics() {
    try {
      if (!fs.existsSync(this.exportDir)) {
        return { totalFiles: 0, totalSize: 0, oldestFile: null, newestFile: null };
      }

      const files = fs.readdirSync(this.exportDir)
        .filter(f => f.endsWith('.xlsx'))
        .map(f => {
          const filepath = path.join(this.exportDir, f);
          const stats = fs.statSync(filepath);
          return { name: f, size: stats.size, mtime: stats.mtime };
        });

      const totalFiles = files.length;
      const totalSize = files.reduce((sum, f) => sum + f.size, 0);
      const oldestFile = files.length > 0 
        ? files.reduce((oldest, f) => f.mtime < oldest.mtime ? f : oldest).mtime 
        : null;
      const newestFile = files.length > 0 
        ? files.reduce((newest, f) => f.mtime > newest.mtime ? f : newest).mtime 
        : null;

      return {
        totalFiles,
        totalSize: Math.round(totalSize / 1024 / 1024), // MB
        oldestFile,
        newestFile
      };
    } catch (error) {
      logger.error('Error getting export metrics:', error);
      return { totalFiles: 0, totalSize: 0, oldestFile: null, newestFile: null };
    }
  }

  /**
   * Get export statistics from audit logs
   */
  async getExportStatistics(days: number = 30): Promise<ExportMetrics> {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_exports,
          COUNT(CASE WHEN metadata->>'status' = 'success' THEN 1 END) as successful_exports,
          COUNT(CASE WHEN metadata->>'status' = 'failed' THEN 1 END) as failed_exports,
          AVG((metadata->>'file_size')::bigint) as average_size,
          AVG((metadata->>'duration')::integer) as average_duration,
          MAX(created_at) as last_export_time
        FROM audit_logs
        WHERE action = 'export_visitors'
          AND created_at >= NOW() - INTERVAL '${days} days'
      `);

      const row = result.rows[0];

      return {
        totalExports: parseInt(row.total_exports) || 0,
        successfulExports: parseInt(row.successful_exports) || 0,
        failedExports: parseInt(row.failed_exports) || 0,
        averageSize: Math.round(parseFloat(row.average_size) / 1024 / 1024) || 0, // MB
        averageDuration: Math.round(parseFloat(row.average_duration)) || 0, // ms
        lastExportTime: row.last_export_time
      };
    } catch (error) {
      logger.error('Error getting export statistics:', error);
      return {
        totalExports: 0,
        successfulExports: 0,
        failedExports: 0,
        averageSize: 0,
        averageDuration: 0,
        lastExportTime: null
      };
    }
  }

  /**
   * Check system health
   */
  async checkHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    checks: Record<string, { status: string; message: string }>;
  }> {
    const checks: Record<string, { status: string; message: string }> = {};
    let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Check database connection
    try {
      await pool.query('SELECT 1');
      checks.database = { status: 'healthy', message: 'Database connection OK' };
    } catch (error) {
      checks.database = { status: 'critical', message: 'Database connection failed' };
      overallStatus = 'critical';
    }

    // Check memory usage
    const memory = this.getMemoryMetrics();
    if (memory.usagePercent > 90) {
      checks.memory = { status: 'critical', message: `Memory usage critical: ${memory.usagePercent}%` };
      overallStatus = 'critical';
    } else if (memory.usagePercent > 75) {
      checks.memory = { status: 'warning', message: `Memory usage high: ${memory.usagePercent}%` };
      if (overallStatus === 'healthy') overallStatus = 'warning';
    } else {
      checks.memory = { status: 'healthy', message: `Memory usage OK: ${memory.usagePercent}%` };
    }

    // Check disk space
    const disk = await this.getDiskMetrics();
    if (disk.usagePercent > 90) {
      checks.disk = { status: 'critical', message: `Disk usage critical: ${disk.usagePercent}%` };
      overallStatus = 'critical';
    } else if (disk.usagePercent > 80) {
      checks.disk = { status: 'warning', message: `Disk usage high: ${disk.usagePercent}%` };
      if (overallStatus === 'healthy') overallStatus = 'warning';
    } else {
      checks.disk = { status: 'healthy', message: `Disk usage OK: ${disk.usagePercent}%` };
    }

    // Check export directory
    try {
      if (!fs.existsSync(this.exportDir)) {
        checks.exportDir = { status: 'warning', message: 'Export directory does not exist' };
        if (overallStatus === 'healthy') overallStatus = 'warning';
      } else {
        checks.exportDir = { status: 'healthy', message: 'Export directory OK' };
      }
    } catch (error) {
      checks.exportDir = { status: 'critical', message: 'Cannot access export directory' };
      overallStatus = 'critical';
    }

    return { status: overallStatus, checks };
  }

  /**
   * Log export operation for monitoring
   */
  async logExportOperation(
    userId: string,
    status: 'success' | 'failed',
    fileSize: number,
    duration: number,
    error?: string
  ) {
    try {
      await pool.query(`
        INSERT INTO audit_logs (user_id, action, resource_type, metadata)
        VALUES ($1, 'export_visitors', 'export', $2)
      `, [
        userId,
        JSON.stringify({
          status,
          file_size: fileSize,
          duration,
          error: error || null,
          timestamp: new Date().toISOString()
        })
      ]);
    } catch (error) {
      logger.error('Error logging export operation:', error);
    }
  }

  /**
   * Get metrics history
   */
  getMetricsHistory(limit: number = 100): SystemMetrics[] {
    return this.metricsHistory.slice(-limit);
  }

  /**
   * Generate monitoring report
   */
  async generateReport(): Promise<string> {
    const metrics = await this.collectMetrics();
    const health = await this.checkHealth();
    const exportStats = await this.getExportStatistics();

    const report = `
=== SYSTEM MONITORING REPORT ===
Generated: ${new Date().toISOString()}

SYSTEM HEALTH: ${health.status.toUpperCase()}
${Object.entries(health.checks).map(([key, value]) => 
  `  ${key}: ${value.status} - ${value.message}`
).join('\n')}

CPU METRICS:
  Usage: ${metrics.cpu.usage}%
  Load Average: ${metrics.cpu.loadAverage.map(l => l.toFixed(2)).join(', ')}

MEMORY METRICS:
  Total: ${metrics.memory.total} MB
  Used: ${metrics.memory.used} MB (${metrics.memory.usagePercent}%)
  Free: ${metrics.memory.free} MB

DISK METRICS:
  Total: ${metrics.disk.total} GB
  Used: ${metrics.disk.used} GB (${metrics.disk.usagePercent}%)
  Free: ${metrics.disk.free} GB

DATABASE METRICS:
  Connections: ${metrics.database.connections}
  Active Queries: ${metrics.database.activeQueries}
  Visitors Table Size: ${metrics.database.tableSize.toFixed(2)} MB

EXPORT METRICS:
  Total Files: ${metrics.exports.totalFiles}
  Total Size: ${metrics.exports.totalSize} MB
  Oldest File: ${metrics.exports.oldestFile?.toISOString() || 'N/A'}
  Newest File: ${metrics.exports.newestFile?.toISOString() || 'N/A'}

EXPORT STATISTICS (Last 30 Days):
  Total Exports: ${exportStats.totalExports}
  Successful: ${exportStats.successfulExports}
  Failed: ${exportStats.failedExports}
  Average Size: ${exportStats.averageSize} MB
  Average Duration: ${exportStats.averageDuration} ms
  Last Export: ${exportStats.lastExportTime?.toISOString() || 'N/A'}

=== END OF REPORT ===
    `.trim();

    return report;
  }
}
