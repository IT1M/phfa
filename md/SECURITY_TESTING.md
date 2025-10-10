# 🧪 Security Testing & Penetration Testing Guide

## Automated Security Testing

### 1. Encryption Testing

Test AES-256 encryption:

```bash
# Create test file
cat > test-encryption.ts << 'EOF'
import encryptionService from './src/security/encryption.service';

async function testEncryption() {
  const plaintext = 'Sensitive patient data: SSN 123-45-6789';
  
  // Test encryption
  const encrypted = await encryptionService.encrypt(plaintext);
  console.log('Encrypted:', encrypted);
  
  // Test decryption
  const decrypted = await encryptionService.decrypt(encrypted);
  console.log('Decrypted:', decrypted);
  
  // Verify
  console.log('Match:', plaintext === decrypted ? '✅' : '❌');
  
  // Test PII encryption
  const patient = {
    name: 'John Doe',
    ssn: '123-45-6789',
    email: 'john@example.com',
    phone: '+966501234567'
  };
  
  const encryptedPatient = await encryptionService.encryptPII(patient);
  console.log('Encrypted Patient:', encryptedPatient);
  
  const decryptedPatient = await encryptionService.decryptPII(encryptedPatient);
  console.log('Decrypted Patient:', decryptedPatient);
}

testEncryption();
EOF

ts-node test-encryption.ts
```

### 2. MFA Testing

Test multi-factor authentication:

```bash
# Test MFA flow
curl -X POST http://localhost:5000/api/security/mfa/enable \
  -H "Content-Type: application/json" \
  -d '{"method": "email"}'

# Verify code (use code from email)
curl -X POST http://localhost:5000/api/security/mfa/verify \
  -H "Content-Type: application/json" \
  -d '{"code": "123456"}'
```

### 3. RBAC Testing

Test role-based access control:

```bash
# Test as different roles
for role in admin doctor nurse guest; do
  echo "Testing as $role..."
  curl -H "x-user-role: $role" http://localhost:5000/api/patients
done
```

### 4. Session Management Testing

Test session timeout and validation:

```bash
# Create session
SESSION=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "password": "test"}' | jq -r '.sessionId')

# Use session
curl -H "x-session-id: $SESSION" http://localhost:5000/api/patients

# Wait 31 minutes and test expiration
sleep 1860
curl -H "x-session-id: $SESSION" http://localhost:5000/api/patients
# Should return 401 Unauthorized
```

## Penetration Testing

### SQL Injection Testing

```bash
# Test SQL injection in search
curl "http://localhost:5000/api/patients?search='; DROP TABLE patients; --"
# Should be blocked by threat detection

# Test in body
curl -X POST http://localhost:5000/api/patients \
  -H "Content-Type: application/json" \
  -d '{"name": "John OR 1=1"}'
# Should be sanitized
```

### XSS Testing

```bash
# Test XSS in input
curl -X POST http://localhost:5000/api/patients \
  -H "Content-Type: application/json" \
  -d '{"name": "<script>alert(\"XSS\")</script>"}'
# Should be blocked by threat detection

# Test in query
curl "http://localhost:5000/api/patients?search=<img src=x onerror=alert(1)>"
# Should be blocked
```

### Brute Force Testing

```bash
# Test failed login attempts
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username": "admin", "password": "wrong'$i'"}'
done

# After 5 attempts, IP should be blocked
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "correct"}'
# Should return 403 Forbidden
```

### Session Hijacking Testing

```bash
# Get valid session
SESSION=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "password": "test"}' | jq -r '.sessionId')

# Try to use from different IP
curl -H "x-session-id: $SESSION" \
  -H "X-Forwarded-For: 1.2.3.4" \
  http://localhost:5000/api/patients
# Should be rejected due to IP mismatch
```

### Privilege Escalation Testing

```bash
# Login as guest
GUEST_SESSION=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "guest", "password": "guest"}' | jq -r '.sessionId')

# Try to access admin endpoint
curl -H "x-session-id: $GUEST_SESSION" \
  http://localhost:5000/api/admin/users
# Should return 403 Forbidden

# Try to modify role
curl -X PUT http://localhost:5000/api/users/1 \
  -H "x-session-id: $GUEST_SESSION" \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
# Should return 403 Forbidden
```

### Data Exfiltration Testing

```bash
# Test bulk download detection
for i in {1..60}; do
  curl -H "x-session-id: $SESSION" \
    http://localhost:5000/api/documents/$i/download &
done
wait

# Should trigger data exfiltration alert
curl -H "x-session-id: $SESSION" \
  http://localhost:5000/api/security/threats
# Should show data_exfiltration threat
```

### TLS/SSL Testing

```bash
# Test TLS version
openssl s_client -connect localhost:5000 -tls1_2
# Should fail (only TLS 1.3 allowed)

openssl s_client -connect localhost:5000 -tls1_3
# Should succeed

# Test cipher suites
nmap --script ssl-enum-ciphers -p 5000 localhost

# Test certificate
openssl s_client -connect localhost:5000 -showcerts
```

## Security Scanning Tools

### 1. OWASP ZAP

```bash
# Install OWASP ZAP
docker pull owasp/zap2docker-stable

# Run automated scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://localhost:5000
```

### 2. Nikto

```bash
# Install Nikto
brew install nikto  # macOS
apt-get install nikto  # Linux

# Run scan
nikto -h https://localhost:5000
```

### 3. SQLMap

```bash
# Install SQLMap
pip install sqlmap

# Test SQL injection
sqlmap -u "http://localhost:5000/api/patients?search=test" \
  --batch --random-agent
```

### 4. Burp Suite

1. Download Burp Suite Community Edition
2. Configure browser proxy to 127.0.0.1:8080
3. Browse application
4. Use Burp Scanner to find vulnerabilities

## Load Testing

### Test concurrent sessions

```bash
# Install Apache Bench
brew install httpd  # macOS

# Test 1000 requests with 100 concurrent
ab -n 1000 -c 100 -H "x-session-id: $SESSION" \
  https://localhost:5000/api/patients
```

### Test rate limiting

```bash
# Test rate limit for guest users
for i in {1..20}; do
  curl http://localhost:5000/api/patients
done
# Should be rate limited after 10 requests
```

## Compliance Testing

### HIPAA Audit Trail

```bash
# Verify all actions are logged
curl http://localhost:5000/api/security/audit/user/1

# Check audit log retention
psql -d medical_documents -c \
  "SELECT COUNT(*), MIN(created_at), MAX(created_at) FROM audit_logs"
```

### Data Encryption Verification

```bash
# Check database encryption
psql -d medical_documents -c \
  "SELECT ssn, email FROM patients LIMIT 1"
# Should show encrypted values (base64 strings)
```

### Right to be Forgotten

```bash
# Test patient anonymization
curl -X POST http://localhost:5000/api/security/retention/anonymize/123

# Verify anonymization
psql -d medical_documents -c \
  "SELECT * FROM patients WHERE id = 123"
# Should show ANONYMIZED values
```

## Security Checklist

### Pre-Production
- [ ] All encryption keys generated and secured
- [ ] TLS certificates from trusted CA
- [ ] IP whitelist configured
- [ ] MFA enabled for all admin accounts
- [ ] Rate limiting tested
- [ ] Session timeout verified
- [ ] Audit logging functional
- [ ] Backup encryption tested
- [ ] Data retention policies configured

### Penetration Testing
- [ ] SQL injection testing passed
- [ ] XSS testing passed
- [ ] CSRF protection verified
- [ ] Brute force protection tested
- [ ] Session hijacking prevented
- [ ] Privilege escalation blocked
- [ ] Data exfiltration detection working
- [ ] TLS 1.3 enforced

### Compliance
- [ ] HIPAA audit trail complete
- [ ] 7-year log retention configured
- [ ] Data encryption verified
- [ ] Right to be forgotten implemented
- [ ] Data portability tested
- [ ] Breach notification procedures documented

### Monitoring
- [ ] Threat detection alerts working
- [ ] Security dashboard accessible
- [ ] Failed login monitoring active
- [ ] Unusual access detection enabled
- [ ] Automated security scanning scheduled

## Automated Testing Script

```bash
#!/bin/bash
# security-test.sh

echo "🔒 Running Security Tests..."

# Test encryption
echo "Testing encryption..."
ts-node test-encryption.ts || exit 1

# Test SQL injection
echo "Testing SQL injection protection..."
RESPONSE=$(curl -s "http://localhost:5000/api/patients?search='; DROP TABLE patients; --")
if [[ $RESPONSE == *"Invalid request"* ]]; then
  echo "✅ SQL injection blocked"
else
  echo "❌ SQL injection not blocked"
  exit 1
fi

# Test XSS
echo "Testing XSS protection..."
RESPONSE=$(curl -s -X POST http://localhost:5000/api/patients \
  -H "Content-Type: application/json" \
  -d '{"name": "<script>alert(1)</script>"}')
if [[ $RESPONSE == *"Invalid request"* ]]; then
  echo "✅ XSS blocked"
else
  echo "❌ XSS not blocked"
  exit 1
fi

# Test brute force
echo "Testing brute force protection..."
for i in {1..6}; do
  curl -s -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username": "test", "password": "wrong"}' > /dev/null
done
RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "password": "correct"}')
if [[ $RESPONSE == *"Access denied"* ]]; then
  echo "✅ Brute force protection working"
else
  echo "❌ Brute force protection not working"
  exit 1
fi

echo "✅ All security tests passed!"
```

## Reporting

After testing, generate a security report:

```bash
# Generate report
cat > security-report.md << EOF
# Security Test Report

**Date**: $(date)
**Tester**: [Your Name]

## Test Results

### Encryption
- [x] AES-256 encryption working
- [x] TLS 1.3 enforced
- [x] Field-level PII encryption

### Access Control
- [x] MFA functional
- [x] RBAC permissions correct
- [x] Session management working
- [x] IP whitelisting active

### Threat Detection
- [x] SQL injection blocked
- [x] XSS attacks prevented
- [x] Brute force protection active
- [x] Data exfiltration detected

### Compliance
- [x] Audit trail complete
- [x] Data retention policies active
- [x] Right to be forgotten working
- [x] Data portability functional

## Recommendations

1. [Add any findings]
2. [Add any recommendations]

## Next Steps

1. Schedule quarterly penetration testing
2. Update security documentation
3. Train team on security procedures
EOF

cat security-report.md
```

---

**Remember**: Security testing should be performed regularly, not just once!
