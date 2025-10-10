/**
 * Enterprise Security Module
 * Exports all security services and utilities
 */

export { EncryptionService, default as encryptionService } from './encryption.service';
export { MFAService } from './mfa.service';
export { RBACService, Role, Permission } from './rbac.service';
export { SessionService } from './session.service';
export { IPWhitelistService } from './ip-whitelist.service';
export { ThreatDetectionService, ThreatLevel, ThreatType } from './threat-detection.service';
export { AuditService, AuditAction } from './audit.service';
export { DataRetentionService } from './data-retention.service';
export { BackupEncryptionService, default as backupEncryptionService } from './backup-encryption.service';
export { SecurityMonitoringService } from './monitoring.service';

/**
 * Initialize all security services
 */
import { Pool } from 'pg';

export function initializeSecurity(pool: Pool) {
  const services = {
    encryption: require('./encryption.service').default,
    mfa: new (require('./mfa.service').MFAService)(pool),
    rbac: new (require('./rbac.service').RBACService)(pool),
    session: new (require('./session.service').SessionService)(pool),
    ipWhitelist: new (require('./ip-whitelist.service').IPWhitelistService)(pool),
    threatDetection: new (require('./threat-detection.service').ThreatDetectionService)(pool),
    audit: new (require('./audit.service').AuditService)(pool),
    dataRetention: new (require('./data-retention.service').DataRetentionService)(pool),
    backupEncryption: require('./backup-encryption.service').default,
    monitoring: new (require('./monitoring.service').SecurityMonitoringService)(pool)
  };

  // Start monitoring
  services.monitoring.startMonitoring();

  // Start data retention schedule
  services.dataRetention.startRetentionSchedule();

  // Set up threat detection alerts
  services.threatDetection.on('threat', async (threat) => {
    console.warn('🚨 Security Threat Detected:', threat);
    // Send alert notification
  });

  services.monitoring.on('alert', async (alert) => {
    console.error('🚨 Security Alert:', alert);
    // Send alert notification
  });

  return services;
}
