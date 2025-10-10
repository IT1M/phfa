import { Router } from 'express';
import { Pool } from 'pg';
import { SecurityMiddleware } from '../middleware/security.middleware';
import { MFAService } from '../security/mfa.service';
import { ThreatDetectionService } from '../security/threat-detection.service';
import { AuditService } from '../security/audit.service';
import { DataRetentionService } from '../security/data-retention.service';
import { IPWhitelistService } from '../security/ip-whitelist.service';
import { Role, Permission } from '../security/rbac.service';

export function createSecurityRoutes(pool: Pool): Router {
  const router = Router();
  const security = new SecurityMiddleware(pool);
  const mfaService = new MFAService(pool);
  const threatService = new ThreatDetectionService(pool);
  const auditService = new AuditService(pool);
  const retentionService = new DataRetentionService(pool);
  const ipWhitelistService = new IPWhitelistService(pool);

  // MFA Routes
  router.post('/mfa/enable', security.authenticate(), async (req, res) => {
    try {
      const { method } = req.body;
      await mfaService.enableMFA(req.user!.id, method);
      res.json({ message: 'MFA enabled successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to enable MFA' });
    }
  });

  router.post('/mfa/disable', security.authenticate(), async (req, res) => {
    try {
      await mfaService.disableMFA(req.user!.id);
      res.json({ message: 'MFA disabled successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to disable MFA' });
    }
  });

  router.post('/mfa/verify', security.authenticate(), async (req, res) => {
    try {
      const { code } = req.body;
      const verified = await mfaService.verifyCode(req.user!.id, code);
      
      if (verified) {
        res.json({ message: 'MFA verified successfully' });
      } else {
        res.status(400).json({ error: 'Invalid or expired code' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to verify MFA' });
    }
  });

  // Threat Detection Routes
  router.get(
    '/threats',
    security.authenticate(),
    security.requirePermission(Permission.VIEW_SECURITY_LOGS),
    async (req, res) => {
      try {
        const { limit = 100 } = req.query;
        const threats = await threatService.getRecentThreats(Number(limit));
        res.json(threats);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch threats' });
      }
    }
  );

  // Audit Log Routes
  router.get(
    '/audit/user/:userId',
    security.authenticate(),
    security.requirePermission(Permission.VIEW_AUDIT_LOGS),
    async (req, res) => {
      try {
        const { userId } = req.params;
        const { limit = 100 } = req.query;
        const logs = await auditService.getUserLogs(Number(userId), Number(limit));
        res.json(logs);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch audit logs' });
      }
    }
  );

  router.get(
    '/audit/resource/:resource/:resourceId',
    security.authenticate(),
    security.requirePermission(Permission.VIEW_AUDIT_LOGS),
    async (req, res) => {
      try {
        const { resource, resourceId } = req.params;
        const { limit = 100 } = req.query;
        const logs = await auditService.getResourceLogs(resource, Number(resourceId), Number(limit));
        res.json(logs);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch audit logs' });
      }
    }
  );

  router.post(
    '/audit/search',
    security.authenticate(),
    security.requirePermission(Permission.VIEW_AUDIT_LOGS),
    async (req, res) => {
      try {
        const filters = req.body;
        const { limit = 100 } = req.query;
        const logs = await auditService.searchLogs(filters, Number(limit));
        res.json(logs);
      } catch (error) {
        res.status(500).json({ error: 'Failed to search audit logs' });
      }
    }
  );

  // Data Retention Routes
  router.post(
    '/retention/anonymize/:patientId',
    security.authenticate(),
    security.requireRole(Role.ADMIN),
    async (req, res) => {
      try {
        const { patientId } = req.params;
        await retentionService.anonymizePatient(Number(patientId));
        res.json({ message: 'Patient data anonymized successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to anonymize patient data' });
      }
    }
  );

  router.get(
    '/retention/export/:patientId',
    security.authenticate(),
    async (req, res) => {
      try {
        const { patientId } = req.params;
        const data = await retentionService.exportPatientData(Number(patientId));
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: 'Failed to export patient data' });
      }
    }
  );

  router.get(
    '/retention/status',
    security.authenticate(),
    security.requireRole(Role.ADMIN),
    async (req, res) => {
      try {
        const status = await retentionService.getRetentionStatus();
        res.json(status);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch retention status' });
      }
    }
  );

  // IP Whitelist Routes
  router.get(
    '/ip-whitelist',
    security.authenticate(),
    security.requireRole(Role.ADMIN),
    async (req, res) => {
      try {
        const { role } = req.query;
        const ips = await ipWhitelistService.getWhitelistedIPs(role as Role);
        res.json(ips);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch IP whitelist' });
      }
    }
  );

  router.post(
    '/ip-whitelist',
    security.authenticate(),
    security.requireRole(Role.ADMIN),
    async (req, res) => {
      try {
        const { ipAddress, role, description } = req.body;
        await ipWhitelistService.addIP(ipAddress, role, description);
        res.json({ message: 'IP added to whitelist' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to add IP to whitelist' });
      }
    }
  );

  router.delete(
    '/ip-whitelist/:ipAddress/:role',
    security.authenticate(),
    security.requireRole(Role.ADMIN),
    async (req, res) => {
      try {
        const { ipAddress, role } = req.params;
        await ipWhitelistService.removeIP(ipAddress, role as Role);
        res.json({ message: 'IP removed from whitelist' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to remove IP from whitelist' });
      }
    }
  );

  return router;
}
