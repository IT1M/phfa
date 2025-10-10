import { Pool } from 'pg';

export enum AuditAction {
  LOGIN = 'login',
  LOGOUT = 'logout',
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  DOWNLOAD = 'download',
  EXPORT = 'export',
  PERMISSION_CHANGE = 'permission_change',
  SECURITY_EVENT = 'security_event'
}

interface AuditLog {
  userId?: number;
  action: AuditAction;
  resource: string;
  resourceId?: number;
  ipAddress: string;
  userAgent: string;
  details?: any;
  success: boolean;
}

/**
 * Comprehensive Audit Logging Service
 * HIPAA-compliant audit trail
 */
export class AuditService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Log audit event
   */
  async log(log: AuditLog): Promise<void> {
    await this.pool.query(
      `INSERT INTO audit_logs 
       (user_id, action, resource, resource_id, ip_address, user_agent, details, success, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [
        log.userId,
        log.action,
        log.resource,
        log.resourceId,
        log.ipAddress,
        log.userAgent,
        JSON.stringify(log.details),
        log.success
      ]
    );
  }

  /**
   * Get audit logs for user
   */
  async getUserLogs(userId: number, limit: number = 100): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT * FROM audit_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [userId, limit]
    );
    
    return result.rows;
  }

  /**
   * Get audit logs for resource
   */
  async getResourceLogs(resource: string, resourceId: number, limit: number = 100): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT al.*, u.username, u.email 
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.resource = $1 AND al.resource_id = $2 
       ORDER BY al.created_at DESC LIMIT $3`,
      [resource, resourceId, limit]
    );
    
    return result.rows;
  }

  /**
   * Search audit logs
   */
  async searchLogs(filters: {
    userId?: number;
    action?: AuditAction;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    ipAddress?: string;
    success?: boolean;
  }, limit: number = 100): Promise<any[]> {
    let query = `SELECT al.*, u.username, u.email FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.userId) {
      query += ` AND al.user_id = $${paramIndex++}`;
      params.push(filters.userId);
    }

    if (filters.action) {
      query += ` AND al.action = $${paramIndex++}`;
      params.push(filters.action);
    }

    if (filters.resource) {
      query += ` AND al.resource = $${paramIndex++}`;
      params.push(filters.resource);
    }

    if (filters.startDate) {
      query += ` AND al.created_at >= $${paramIndex++}`;
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      query += ` AND al.created_at <= $${paramIndex++}`;
      params.push(filters.endDate);
    }

    if (filters.ipAddress) {
      query += ` AND al.ip_address = $${paramIndex++}`;
      params.push(filters.ipAddress);
    }

    if (filters.success !== undefined) {
      query += ` AND al.success = $${paramIndex++}`;
      params.push(filters.success);
    }

    query += ` ORDER BY al.created_at DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  /**
   * Get failed access attempts
   */
  async getFailedAttempts(hours: number = 24): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT * FROM audit_logs 
       WHERE success = false 
       AND created_at > NOW() - INTERVAL '${hours} hours'
       ORDER BY created_at DESC`,
      []
    );
    
    return result.rows;
  }

  /**
   * Clean old audit logs (retention policy)
   */
  async cleanOldLogs(retentionDays: number = 2555): Promise<void> {
    // 7 years retention for HIPAA compliance
    await this.pool.query(
      `DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '${retentionDays} days'`
    );
  }
}
