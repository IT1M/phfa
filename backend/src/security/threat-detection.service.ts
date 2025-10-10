import { Pool } from 'pg';
import { EventEmitter } from 'events';

export enum ThreatLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ThreatType {
  BRUTE_FORCE = 'brute_force',
  SUSPICIOUS_IP = 'suspicious_ip',
  UNUSUAL_ACCESS = 'unusual_access',
  DATA_EXFILTRATION = 'data_exfiltration',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  SQL_INJECTION = 'sql_injection',
  XSS_ATTEMPT = 'xss_attempt'
}

interface ThreatEvent {
  type: ThreatType;
  level: ThreatLevel;
  userId?: number;
  ipAddress: string;
  details: any;
  timestamp: Date;
}

/**
 * Real-time Threat Detection Service
 */
export class ThreatDetectionService extends EventEmitter {
  private pool: Pool;
  private failedLoginAttempts: Map<string, number> = new Map();
  private suspiciousIPs: Set<string> = new Set();
  private readonly maxFailedAttempts = 5;
  private readonly suspiciousThreshold = 10;

  constructor(pool: Pool) {
    super();
    this.pool = pool;
    this.startMonitoring();
  }

  /**
   * Record failed login attempt
   */
  async recordFailedLogin(ipAddress: string, username: string): Promise<void> {
    const key = `${ipAddress}:${username}`;
    const attempts = (this.failedLoginAttempts.get(key) || 0) + 1;
    this.failedLoginAttempts.set(key, attempts);

    if (attempts >= this.maxFailedAttempts) {
      await this.reportThreat({
        type: ThreatType.BRUTE_FORCE,
        level: ThreatLevel.HIGH,
        ipAddress,
        details: { username, attempts },
        timestamp: new Date()
      });
      
      this.suspiciousIPs.add(ipAddress);
    }

    // Clean up after 15 minutes
    setTimeout(() => this.failedLoginAttempts.delete(key), 15 * 60 * 1000);
  }

  /**
   * Clear failed login attempts
   */
  clearFailedAttempts(ipAddress: string, username: string): void {
    const key = `${ipAddress}:${username}`;
    this.failedLoginAttempts.delete(key);
  }

  /**
   * Detect unusual access patterns
   */
  async detectUnusualAccess(userId: number, ipAddress: string, resource: string): Promise<void> {
    // Check if IP is from different location than usual
    const result = await this.pool.query(
      `SELECT DISTINCT ip_address FROM audit_logs 
       WHERE user_id = $1 AND created_at > NOW() - INTERVAL '30 days'
       LIMIT 10`,
      [userId]
    );

    const knownIPs = result.rows.map(row => row.ip_address);
    
    if (!knownIPs.includes(ipAddress) && knownIPs.length > 0) {
      await this.reportThreat({
        type: ThreatType.UNUSUAL_ACCESS,
        level: ThreatLevel.MEDIUM,
        userId,
        ipAddress,
        details: { resource, knownIPs },
        timestamp: new Date()
      });
    }
  }

  /**
   * Detect potential data exfiltration
   */
  async detectDataExfiltration(userId: number, downloadCount: number): Promise<void> {
    if (downloadCount > 50) {
      await this.reportThreat({
        type: ThreatType.DATA_EXFILTRATION,
        level: ThreatLevel.CRITICAL,
        userId,
        ipAddress: 'unknown',
        details: { downloadCount },
        timestamp: new Date()
      });
    }
  }

  /**
   * Detect SQL injection attempts
   */
  detectSQLInjection(input: string, ipAddress: string): boolean {
    const sqlPatterns = [
      /(\bOR\b|\bAND\b).*=.*=/i,
      /UNION.*SELECT/i,
      /DROP.*TABLE/i,
      /INSERT.*INTO/i,
      /DELETE.*FROM/i,
      /--/,
      /;.*DROP/i
    ];

    const isSQLInjection = sqlPatterns.some(pattern => pattern.test(input));

    if (isSQLInjection) {
      this.reportThreat({
        type: ThreatType.SQL_INJECTION,
        level: ThreatLevel.CRITICAL,
        ipAddress,
        details: { input },
        timestamp: new Date()
      });
    }

    return isSQLInjection;
  }

  /**
   * Detect XSS attempts
   */
  detectXSS(input: string, ipAddress: string): boolean {
    const xssPatterns = [
      /<script[^>]*>.*<\/script>/i,
      /javascript:/i,
      /onerror=/i,
      /onload=/i,
      /<iframe/i
    ];

    const isXSS = xssPatterns.some(pattern => pattern.test(input));

    if (isXSS) {
      this.reportThreat({
        type: ThreatType.XSS_ATTEMPT,
        level: ThreatLevel.HIGH,
        ipAddress,
        details: { input },
        timestamp: new Date()
      });
    }

    return isXSS;
  }

  /**
   * Report threat
   */
  private async reportThreat(threat: ThreatEvent): Promise<void> {
    await this.pool.query(
      `INSERT INTO security_threats (type, level, user_id, ip_address, details, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [threat.type, threat.level, threat.userId, threat.ipAddress, JSON.stringify(threat.details), threat.timestamp]
    );

    this.emit('threat', threat);
  }

  /**
   * Check if IP is suspicious
   */
  isSuspiciousIP(ipAddress: string): boolean {
    return this.suspiciousIPs.has(ipAddress);
  }

  /**
   * Start monitoring
   */
  private startMonitoring(): void {
    // Clean up old data every hour
    setInterval(() => {
      this.failedLoginAttempts.clear();
    }, 60 * 60 * 1000);
  }

  /**
   * Get recent threats
   */
  async getRecentThreats(limit: number = 100): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT * FROM security_threats ORDER BY timestamp DESC LIMIT $1`,
      [limit]
    );
    
    return result.rows;
  }
}
