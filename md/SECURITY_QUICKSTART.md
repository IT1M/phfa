# 🚀 Security Quick Start Guide

## 5-Minute Setup

### 1. Generate Encryption Keys

```bash
cd backend

# Generate encryption key
echo "ENCRYPTION_KEY=$(openssl rand -hex 32)" >> .env

# Generate backup encryption key
echo "BACKUP_ENCRYPTION_KEY=$(openssl rand -hex 32)" >> .env
```

### 2. Run Security Setup

```bash
npm run setup:security
```

This will:
- Create all security tables
- Generate TLS certificates
- Set up IP whitelist
- Configure monitoring

### 3. Start the Server

```bash
npm run dev
```

The server will now run with:
- ✅ AES-256 encryption
- ✅ TLS 1.3 (HTTPS)
- ✅ Session management
- ✅ Threat detection
- ✅ Audit logging

## Essential Security Features

### Multi-Factor Authentication (MFA)

Enable MFA for a user:

```bash
curl -X POST https://localhost:5000/api/security/mfa/enable \
  -H "Content-Type: application/json" \
  -H "x-session-id: YOUR_SESSION" \
  -d '{"method": "email"}'
```

### IP Whitelisting

Add admin IP address:

```bash
curl -X POST https://localhost:5000/api/security/ip-whitelist \
  -H "Content-Type: application/json" \
  -d '{
    "ipAddress": "YOUR_IP_ADDRESS",
    "role": "admin",
    "description": "Admin workstation"
  }'
```

### View Security Dashboard

Access at: `https://localhost:5000/admin/security`

Features:
- Real-time threat monitoring
- Failed login attempts
- Active sessions
- Audit logs
- Data retention status

## Security Checklist

### Immediate (Day 1)
- [x] Generate encryption keys
- [x] Run security setup
- [x] Configure TLS certificates
- [ ] Add admin IP addresses to whitelist
- [ ] Enable MFA for admin accounts
- [ ] Test backup/restore procedures

### Week 1
- [ ] Review all user roles and permissions
- [ ] Set up security monitoring alerts
- [ ] Configure email notifications
- [ ] Test incident response procedures
- [ ] Document security policies

### Monthly
- [ ] Review audit logs
- [ ] Check threat detection reports
- [ ] Verify backup integrity
- [ ] Update IP whitelist
- [ ] Review data retention status

### Quarterly
- [ ] Rotate encryption keys
- [ ] Security audit
- [ ] Penetration testing
- [ ] Update TLS certificates
- [ ] Review compliance status

## Common Tasks

### View Audit Logs

```bash
# Get user audit logs
curl https://localhost:5000/api/security/audit/user/1

# Get resource audit logs
curl https://localhost:5000/api/security/audit/resource/patient/123

# Search audit logs
curl -X POST https://localhost:5000/api/security/audit/search \
  -H "Content-Type: application/json" \
  -d '{"action": "login", "success": false}'
```

### View Threats

```bash
curl https://localhost:5000/api/security/threats?limit=50
```

### Export Patient Data (GDPR/Right to be Forgotten)

```bash
curl https://localhost:5000/api/security/retention/export/123
```

### Anonymize Patient (Right to be Forgotten)

```bash
curl -X POST https://localhost:5000/api/security/retention/anonymize/123
```

## Environment Variables

Key security variables in `.env`:

```bash
# Encryption
ENCRYPTION_KEY=<64-char-hex>
BACKUP_ENCRYPTION_KEY=<64-char-hex>

# TLS
TLS_CERT_PATH=./certs
TLS_MIN_VERSION=TLSv1.3

# Session
SESSION_TIMEOUT=1800000  # 30 minutes
MAX_SESSIONS_PER_USER=5

# Monitoring
ENABLE_THREAT_DETECTION=true
ENABLE_SECURITY_MONITORING=true
MONITORING_INTERVAL=60000  # 1 minute

# IP Whitelist
ADMIN_WHITELIST_IPS=127.0.0.1,::1

# Data Retention
MEDICAL_RECORD_RETENTION_DAYS=3650  # 10 years
AUDIT_LOG_RETENTION_DAYS=2555       # 7 years
```

## Roles & Permissions

### Admin
- Full system access
- User management
- Security configuration
- Audit log access
- Data export

### Doctor
- Patient management
- Medical records (full)
- Document management
- Prescription creation

### Nurse
- Assigned patient access
- Medical records (limited)
- Document viewing
- Basic patient updates

### Guest
- View own patient data
- View own documents
- Read-only access

## Security Features Summary

### ✅ Encryption
- AES-256-GCM for data at rest
- TLS 1.3 for data in transit
- Field-level PII encryption
- Encrypted backups

### ✅ Access Control
- Multi-factor authentication
- Role-based permissions (4 roles, 17 permissions)
- Session management with timeout
- IP whitelisting for admin access

### ✅ Compliance
- HIPAA-equivalent standards
- Saudi data protection laws
- 7-year audit trail
- Right to be forgotten
- Data portability (FHIR export)

### ✅ Monitoring
- Real-time threat detection
- Automated security scanning
- Failed login tracking
- Unusual access detection
- Security dashboard

## Troubleshooting

### Certificate Errors

If you see TLS certificate errors:

```bash
# Regenerate certificates
npm run generate:certs

# Or use production certificates
cp /path/to/cert.pem certs/server.crt
cp /path/to/key.pem certs/server.key
```

### Database Connection Issues

```bash
# Check database connection
psql -h localhost -U postgres -d medical_documents

# Run migrations
npm run migrate
```

### Permission Denied

```bash
# Check user role
SELECT id, username, role FROM users WHERE id = YOUR_USER_ID;

# Update role if needed
UPDATE users SET role = 'admin' WHERE id = YOUR_USER_ID;
```

## Support

- 📖 Full Documentation: `SECURITY_IMPLEMENTATION.md`
- 🔒 Compliance Guide: `SAUDI_COMPLIANCE.md`
- 🐛 Issues: Create a GitHub issue
- 📧 Security: security@your-domain.com

## Next Steps

1. Read `SECURITY_IMPLEMENTATION.md` for detailed documentation
2. Review `SAUDI_COMPLIANCE.md` for compliance requirements
3. Set up monitoring alerts
4. Schedule regular security audits
5. Train team on security procedures

---

**Remember**: Security is an ongoing process, not a one-time setup!
