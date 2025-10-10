import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { RBACService, Permission, Role } from '../security/rbac.service';
import { SessionService } from '../security/session.service';
import { IPWhitelistService } from '../security/ip-whitelist.service';
import { ThreatDetectionService } from '../security/threat-detection.service';
import { AuditService, AuditAction } from '../security/audit.service';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    role: Role;
    email: string;
  };
  session?: any;
}

/**
 * Security Middleware Factory
 */
export class SecurityMiddleware {
  private rbacService: RBACService;
  private sessionService: SessionService;
  private ipWhitelistService: IPWhitelistService;
  private threatService: ThreatDetectionService;
  private auditService: AuditService;

  constructor(pool: Pool) {
    this.rbacService = new RBACService(pool);
    this.sessionService = new SessionService(pool);
    this.ipWhitelistService = new IPWhitelistService(pool);
    this.threatService = new ThreatDetectionService(pool);
    this.auditService = new AuditService(pool);
  }

  /**
   * Authenticate request
   */
  authenticate() {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const sessionId = req.headers['x-session-id'] as string;
        const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

        if (!sessionId) {
          return res.status(401).json({ error: 'No session provided' });
        }

        const session = await this.sessionService.validateSession(sessionId, ipAddress);

        if (!session) {
          return res.status(401).json({ error: 'Invalid or expired session' });
        }

        const role = await this.rbacService.getUserRole(session.userId);
        
        if (!role) {
          return res.status(401).json({ error: 'User not found' });
        }

        req.user = {
          id: session.userId,
          role,
          email: '' // Fetch from DB if needed
        };
        req.session = session;

        next();
      } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ error: 'Authentication failed' });
      }
    };
  }

  /**
   * Check permission
   */
  requirePermission(...permissions: Permission[]) {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const hasPermission = this.rbacService.hasAnyPermission(req.user.role, permissions);

      if (!hasPermission) {
        await this.auditService.log({
          userId: req.user.id,
          action: AuditAction.SECURITY_EVENT,
          resource: req.path,
          ipAddress: req.ip || 'unknown',
          userAgent: req.headers['user-agent'] || 'unknown',
          details: { reason: 'insufficient_permissions', required: permissions },
          success: false
        });

        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    };
  }

  /**
   * Check role
   */
  requireRole(...roles: Role[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Insufficient role' });
      }

      next();
    };
  }

  /**
   * IP Whitelist check
   */
  checkIPWhitelist() {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return next();
      }

      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const isWhitelisted = await this.ipWhitelistService.isWhitelisted(ipAddress, req.user.role);

      if (!isWhitelisted) {
        await this.auditService.log({
          userId: req.user.id,
          action: AuditAction.SECURITY_EVENT,
          resource: req.path,
          ipAddress,
          userAgent: req.headers['user-agent'] || 'unknown',
          details: { reason: 'ip_not_whitelisted' },
          success: false
        });

        return res.status(403).json({ error: 'Access denied from this IP address' });
      }

      next();
    };
  }

  /**
   * Threat detection
   */
  detectThreats() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

      // Check for suspicious IP
      if (this.threatService.isSuspiciousIP(ipAddress)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Check for SQL injection
      const queryString = JSON.stringify(req.query);
      if (this.threatService.detectSQLInjection(queryString, ipAddress)) {
        return res.status(400).json({ error: 'Invalid request' });
      }

      // Check for XSS
      const bodyString = JSON.stringify(req.body);
      if (this.threatService.detectXSS(bodyString, ipAddress)) {
        return res.status(400).json({ error: 'Invalid request' });
      }

      next();
    };
  }

  /**
   * Audit logging
   */
  auditLog(action: AuditAction, resource: string) {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
      const originalSend = res.json;
      
      res.json = function(data: any) {
        const success = res.statusCode < 400;
        
        this.auditService.log({
          userId: req.user?.id,
          action,
          resource,
          resourceId: req.params.id ? parseInt(req.params.id) : undefined,
          ipAddress: req.ip || 'unknown',
          userAgent: req.headers['user-agent'] || 'unknown',
          details: { method: req.method, path: req.path },
          success
        }).catch(console.error);

        return originalSend.call(this, data);
      }.bind(this);

      next();
    };
  }
}
