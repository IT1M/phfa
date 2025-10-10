import { Pool } from 'pg';
import { EventEmitter } from 'events';

interface SecurityMetrics {
  failedLogins: number;
  activeSessions: number;
  threats: {
    total: number;
    byLevel: Record<string, number>;
    byType: Record<string, number>;
  };
  auditLogs: {
    total: number;
    failed: number;
  };
  dataRetention: {
    anonymizedPatients: number;
    archivedDocuments: number;
  };
}

/**
 * Security Monitoring & Alerting Service
 */
export class SecurityMonitoringService extends EventEmitter {
  private pool: Pool;
  private metricsInterval: NodeJS.Timeout | null = null;

  constructor(pool: Pool) {
    super();
    this.pool = pool;
  }

  /**
   * Start monitoring
   */
  startMonitoring(intervalMs: number = 60000): void {
    this.metricsInterval = setInterval(async () => {
      try {
        const metrics = await this.collectMetrics();
        this.emit('metrics', metrics);
        await this.checkAlerts(metrics);
      } catch (error) {
        console.error('Monitoring error:', error);
      }
    }, intervalMs);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
  }

  /**
   * Collect security metrics
   */
  async collectMetrics(): Promise<SecurityMetrics> {
    const [
      failedLogins,
      activeSessions,
      threats,
      auditLogs,
      dataRetention
    ] = await Promise.all([
      this.getFailedLogins(),
      this.getActiveSessions(),
      this.getThreats(),
      this.getAuditStats(),
      this.getRetentionStats()
    ]);

    return {
      failedLogins,
      activeSessions,
      threats,
      auditLogs,
      dataRetention
    };
  }

  /**
   * Get failed login count (last hour)
   */
  private async getFailedLogins(): Promise<number> {
    const result = await this.pool.query(
      `SELECT COUNT(*) as count FROM audit_logs 
       WHERE action = 'login' AND success = false 
       AND created_at > NOW() - INTERVAL '1 hour'`
    );
    return parseInt(result.rows[0].count);
  }

  /**
   * Get active sessions count
   */
  private async getActiveSessions(): Promise<number> {
    const result = await this.pool.query(
      `SELECT COUNT(*) as count FROM sessions WHERE expires_at > NOW()`
    );
    return parseInt(result.rows[0].count);
  }

  /**
   * Get threat statistics
   */
  private async getThreats(): Promise<any> {
    const [total, byLevel, byType] = await Promise.all([
      this.pool.query(
        `SELECT COUNT(*) as count FROM security_threats 
         WHERE timestamp > NOW() - INTERVAL '24 hours'`
      ),
      this.pool.query(
        `SELECT level, COUNT(*) as count FROM security_threats 
         WHERE timestamp > NOW() - INTERVAL '24 hours'
         GROUP BY level`
      ),
      this.pool.query(
        `SELECT type, COUNT(*) as count FROM security_threats 
         WHERE timestamp > NOW() - INTERVAL '24 hours'
         GROUP BY type`
      )
    ]);

    return {
      total: parseInt(total.rows[0].count),
      byLevel: byLevel.rows.reduce((acc, row) => {
        acc[row.level] = parseInt(row.count);
        return acc;
      }, {}),
      byType: byType.rows.reduce((acc, row) => {
        acc[row.type] = parseInt(row.count);
        return acc;
      }, {})
    };
  }

  /**
   * Get audit log statistics
   */
  private async getAuditStats(): Promise<any> {
    const [total, failed] = await Promise.all([
      this.pool.query(
        `SELECT COUNT(*) as count FROM audit_logs 
         WHERE created_at > NOW() - INTERVAL '24 hours'`
      ),
      this.pool.query(
        `SELECT COUNT(*) as count FROM audit_logs 
         WHERE success = false AND created_at > NOW() - INTERVAL '24 hours'`
      )
    ]);

    return {
      total: parseInt(total.rows[0].count),
      failed: parseInt(failed.rows[0].count)
    };
  }

  /**
   * Get data retention statistics
   */
  private async getRetentionStats(): Promise<any> {
    const result = await this.pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM patients WHERE anonymized = true) as anonymized_patients,
        (SELECT COUNT(*) FROM documents WHERE archived = true) as archived_documents
    `);

    return {
      anonymizedPatients: parseInt(result.rows[0].anonymized_patients),
      archivedDocuments: parseInt(result.rows[0].archived_documents)
    };
  }

  /**
   * Check for alerts
   */
  private async checkAlerts(metrics: SecurityMetrics): Promise<void> {
    // Alert on high failed login attempts
    if (metrics.failedLogins > 50) {
      this.emit('alert', {
        level: 'high',
        type: 'failed_logins',
        message: `High number of failed logins: ${metrics.failedLogins}`,
        metrics
      });
    }

    // Alert on critical threats
    if (metrics.threats.byLevel['critical'] > 0) {
      this.emit('alert', {
        level: 'critical',
        type: 'security_threat',
        message: `Critical security threats detected: ${metrics.threats.byLevel['critical']}`,
        metrics
      });
    }

    // Alert on high threat count
    if (metrics.threats.total > 100) {
      this.emit('alert', {
        level: 'high',
        type: 'threat_spike',
        message: `Unusual threat activity: ${metrics.threats.total} threats in 24h`,
        metrics
      });
    }
  }

  /**
   * Get security dashboard data
   */
  async getDashboardData(): Promise<any> {
    const metrics = await this.collectMetrics();
    
    const recentThreats = await this.pool.query(
      `SELECT * FROM security_threats 
       ORDER BY timestamp DESC LIMIT 10`
    );

    const recentAuditLogs = await this.pool.query(
      `SELECT al.*, u.username FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.success = false
       ORDER BY al.created_at DESC LIMIT 10`
    );

    return {
      metrics,
      recentThreats: recentThreats.rows,
      recentFailedActions: recentAuditLogs.rows,
      timestamp: new Date()
    };
  }
}
