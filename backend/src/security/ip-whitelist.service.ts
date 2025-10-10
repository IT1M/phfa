import { Pool } from 'pg';
import { Role } from './rbac.service';

/**
 * IP Whitelisting Service
 * Restrict admin access to specific IP addresses
 */
export class IPWhitelistService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Check if IP is whitelisted for role
   */
  async isWhitelisted(ipAddress: string, role: Role): Promise<boolean> {
    // Only enforce for admin role
    if (role !== Role.ADMIN) {
      return true;
    }

    const result = await this.pool.query(
      `SELECT 1 FROM ip_whitelist 
       WHERE ip_address = $1 AND role = $2 AND enabled = true`,
      [ipAddress, role]
    );

    return result.rows.length > 0;
  }

  /**
   * Add IP to whitelist
   */
  async addIP(ipAddress: string, role: Role, description?: string): Promise<void> {
    await this.pool.query(
      `INSERT INTO ip_whitelist (ip_address, role, description, enabled)
       VALUES ($1, $2, $3, true)
       ON CONFLICT (ip_address, role) DO UPDATE SET enabled = true`,
      [ipAddress, role, description]
    );
  }

  /**
   * Remove IP from whitelist
   */
  async removeIP(ipAddress: string, role: Role): Promise<void> {
    await this.pool.query(
      `DELETE FROM ip_whitelist WHERE ip_address = $1 AND role = $2`,
      [ipAddress, role]
    );
  }

  /**
   * Disable IP
   */
  async disableIP(ipAddress: string, role: Role): Promise<void> {
    await this.pool.query(
      `UPDATE ip_whitelist SET enabled = false WHERE ip_address = $1 AND role = $2`,
      [ipAddress, role]
    );
  }

  /**
   * Get all whitelisted IPs
   */
  async getWhitelistedIPs(role?: Role): Promise<any[]> {
    const query = role
      ? `SELECT * FROM ip_whitelist WHERE role = $1 ORDER BY created_at DESC`
      : `SELECT * FROM ip_whitelist ORDER BY created_at DESC`;
    
    const params = role ? [role] : [];
    const result = await this.pool.query(query, params);
    
    return result.rows;
  }
}
