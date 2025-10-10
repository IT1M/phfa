import crypto from 'crypto';
import { Pool } from 'pg';

interface Session {
  id: string;
  userId: number;
  ipAddress: string;
  userAgent: string;
  expiresAt: Date;
  lastActivity: Date;
}

/**
 * Session Management Service
 * - Secure session handling
 * - Automatic timeout
 * - IP tracking
 */
export class SessionService {
  private pool: Pool;
  private sessionTimeout = 30 * 60 * 1000; // 30 minutes
  private maxSessions = 5; // Max concurrent sessions per user

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Create new session
   */
  async createSession(
    userId: number,
    ipAddress: string,
    userAgent: string
  ): Promise<string> {
    const sessionId = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + this.sessionTimeout);

    // Clean old sessions
    await this.cleanUserSessions(userId);

    await this.pool.query(
      `INSERT INTO sessions (id, user_id, ip_address, user_agent, expires_at, last_activity)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [sessionId, userId, ipAddress, userAgent, expiresAt]
    );

    return sessionId;
  }

  /**
   * Validate session
   */
  async validateSession(sessionId: string, ipAddress: string): Promise<Session | null> {
    const result = await this.pool.query(
      `SELECT * FROM sessions WHERE id = $1 AND expires_at > NOW()`,
      [sessionId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const session = result.rows[0];

    // Verify IP address
    if (session.ip_address !== ipAddress) {
      await this.invalidateSession(sessionId);
      return null;
    }

    // Update last activity
    await this.updateActivity(sessionId);

    return {
      id: session.id,
      userId: session.user_id,
      ipAddress: session.ip_address,
      userAgent: session.user_agent,
      expiresAt: session.expires_at,
      lastActivity: session.last_activity
    };
  }

  /**
   * Update session activity
   */
  async updateActivity(sessionId: string): Promise<void> {
    const expiresAt = new Date(Date.now() + this.sessionTimeout);
    
    await this.pool.query(
      `UPDATE sessions SET last_activity = NOW(), expires_at = $1 WHERE id = $2`,
      [expiresAt, sessionId]
    );
  }

  /**
   * Invalidate session
   */
  async invalidateSession(sessionId: string): Promise<void> {
    await this.pool.query(`DELETE FROM sessions WHERE id = $1`, [sessionId]);
  }

  /**
   * Invalidate all user sessions
   */
  async invalidateUserSessions(userId: number): Promise<void> {
    await this.pool.query(`DELETE FROM sessions WHERE user_id = $1`, [userId]);
  }

  /**
   * Clean expired sessions
   */
  async cleanExpiredSessions(): Promise<void> {
    await this.pool.query(`DELETE FROM sessions WHERE expires_at < NOW()`);
  }

  /**
   * Clean old user sessions (keep only recent ones)
   */
  private async cleanUserSessions(userId: number): Promise<void> {
    await this.pool.query(
      `DELETE FROM sessions 
       WHERE user_id = $1 
       AND id NOT IN (
         SELECT id FROM sessions 
         WHERE user_id = $1 
         ORDER BY last_activity DESC 
         LIMIT $2
       )`,
      [userId, this.maxSessions - 1]
    );
  }

  /**
   * Get active sessions for user
   */
  async getUserSessions(userId: number): Promise<Session[]> {
    const result = await this.pool.query(
      `SELECT * FROM sessions WHERE user_id = $1 AND expires_at > NOW() ORDER BY last_activity DESC`,
      [userId]
    );

    return result.rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      expiresAt: row.expires_at,
      lastActivity: row.last_activity
    }));
  }
}
