import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from './auth';

export const auditLog = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const originalSend = res.json;

  res.json = function (data: any) {
    logAudit(req, res.statusCode);
    return originalSend.call(this, data);
  };

  next();
};

async function logAudit(req: AuthRequest, statusCode: number) {
  try {
    const action = `${req.method} ${req.path}`;
    const userId = req.user?.id || null;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, ip_address, user_agent, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, action, ipAddress, userAgent, { statusCode, body: req.body }]
    );
  } catch (error) {
    console.error('Audit logging error:', error);
  }
}
