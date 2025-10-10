import crypto from 'crypto';
import { Pool } from 'pg';

interface MFAToken {
  userId: number;
  token: string;
  expiresAt: Date;
  verified: boolean;
}

/**
 * Multi-Factor Authentication Service
 * Supports TOTP, SMS, and Email-based MFA
 */
export class MFAService {
  private pool: Pool;
  private tokenExpiry = 10 * 60 * 1000; // 10 minutes

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Generate 6-digit MFA code
   */
  generateCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Create MFA token for user
   */
  async createMFAToken(userId: number, method: 'email' | 'sms'): Promise<string> {
    const code = this.generateCode();
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
    const expiresAt = new Date(Date.now() + this.tokenExpiry);

    await this.pool.query(
      `INSERT INTO mfa_tokens (user_id, token_hash, method, expires_at, verified)
       VALUES ($1, $2, $3, $4, false)
       ON CONFLICT (user_id) 
       DO UPDATE SET token_hash = $2, method = $3, expires_at = $4, verified = false, created_at = NOW()`,
      [userId, hashedCode, method, expiresAt]
    );

    return code;
  }

  /**
   * Verify MFA code
   */
  async verifyCode(userId: number, code: string): Promise<boolean> {
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

    const result = await this.pool.query(
      `SELECT * FROM mfa_tokens 
       WHERE user_id = $1 AND token_hash = $2 AND expires_at > NOW() AND verified = false`,
      [userId, hashedCode]
    );

    if (result.rows.length === 0) {
      return false;
    }

    // Mark as verified
    await this.pool.query(
      `UPDATE mfa_tokens SET verified = true WHERE user_id = $1`,
      [userId]
    );

    return true;
  }

  /**
   * Check if user has verified MFA
   */
  async isVerified(userId: number): Promise<boolean> {
    const result = await this.pool.query(
      `SELECT verified FROM mfa_tokens 
       WHERE user_id = $1 AND expires_at > NOW()`,
      [userId]
    );

    return result.rows.length > 0 && result.rows[0].verified;
  }

  /**
   * Enable MFA for user
   */
  async enableMFA(userId: number, method: 'email' | 'sms' | 'totp'): Promise<void> {
    await this.pool.query(
      `UPDATE users SET mfa_enabled = true, mfa_method = $1 WHERE id = $2`,
      [method, userId]
    );
  }

  /**
   * Disable MFA for user
   */
  async disableMFA(userId: number): Promise<void> {
    await this.pool.query(
      `UPDATE users SET mfa_enabled = false, mfa_method = NULL WHERE id = $1`,
      [userId]
    );
    
    await this.pool.query(
      `DELETE FROM mfa_tokens WHERE user_id = $1`,
      [userId]
    );
  }

  /**
   * Clean expired tokens
   */
  async cleanExpiredTokens(): Promise<void> {
    await this.pool.query(
      `DELETE FROM mfa_tokens WHERE expires_at < NOW()`
    );
  }
}
