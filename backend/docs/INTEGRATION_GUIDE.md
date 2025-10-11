# Healthcare Integration Guide

## Overview

This guide covers integration with external healthcare systems and webhook configuration for the Medical Document Management System.

## Table of Contents

1. [Supported Integrations](#supported-integrations)
2. [Authentication](#authentication)
3. [Rate Limiting](#rate-limiting)
4. [Integration Setup](#integration-setup)
5. [Webhook System](#webhook-system)
6. [Error Handling](#error-handling)
7. [Examples](#examples)

## Supported Integrations

### 1. Saudi Ministry of Health (MOH)
- Patient data lookup by National ID
- Insurance verification
- Medical history retrieval
- Vaccination records
- Infectious disease reporting

### 2. Hospital Information System (HIS)
- Patient admission/discharge
- Active admissions tracking
- Appointment scheduling
- Discharge summaries
- Patient status updates

### 3. Laboratory Information System (LIS)
- Test ordering
- Results retrieval
- Pending tests tracking
- Test history
- Status updates

### 4. Pharmacy Management System
- Prescription creation
- Medication dispensing
- Drug interaction checking
- Inventory checking
- Medication history

## Authentication

All API requests require JWT authentication:

```bash
Authorization: Bearer <your-jwt-token>
```

### Getting a Token

```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "your-username",
  "password": "your-password"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "...",
  "expiresIn": "24h"
}
```

## Rate Limiting

| User Type | Requests/Minute |
|-----------|----------------|
| Guest     | 10             |
| Authenticated | 100        |
| Admin     | 500            |

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

## Integration Setup

### Configuration

Integration configurations are stored in the database. Use the admin panel or API to configure:

```bash
POST /api/integrations/config
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Saudi MOH",
  "type": "moh",
  "baseUrl": "https://api.moh.gov.sa/v1",
  "apiKey": "your-api-key",
  "timeout": 30000,
  "retryAttempts": 3,
  "enabled": true
}
```

### Environment Variables

Add to `.env`:

```bash
# MOH Integration
MOH_API_URL=https://api.moh.gov.sa/v1
MOH_API_KEY=your_moh_api_key

# HIS Integration
HIS_API_URL=http://his.hospital.local:8080
HIS_USERNAME=integration_user
HIS_PASSWORD=secure_password

# LIS Integration
LIS_API_URL=http://lis.hospital.local:8081
LIS_API_KEY=your_lis_api_key

# Pharmacy Integration
PHARMACY_API_URL=http://pharmacy.hospital.local:8082
PHARMACY_API_KEY=your_pharmacy_api_key
```

### Testing Connections

```bash
GET /api/integrations/test
Authorization: Bearer <admin-token>
```

Response:
```json
{
  "success": true,
  "results": {
    "moh": true,
    "his": true,
    "lis": false,
    "pharmacy": true
  }
}
```

## Webhook System

### Webhook Events

| Event | Description |
|-------|-------------|
| `document.processed` | Document processing completed |
| `visitor.registered` | New visitor registered |
| `search.query` | Search query performed (analytics) |
| `system.health` | System health alert |
| `export.completed` | Data export completed |
| `integration.error` | Integration API error |

### Registering a Webhook

```bash
POST /api/integrations/webhooks
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "url": "https://your-server.com/webhook",
  "events": ["document.processed", "export.completed"],
  "enabled": true,
  "retryAttempts": 3,
  "headers": {
    "X-Custom-Header": "value"
  }
}
```

Response:
```json
{
  "success": true,
  "webhookId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Webhook Payload

All webhooks receive:

```json
{
  "event": "document.processed",
  "timestamp": "2025-01-10T10:30:00Z",
  "data": {
    "documentId": "123",
    "status": "completed",
    "processingTime": 5000
  },
  "signature": "sha256=abc123..."
}
```

### Verifying Webhook Signatures

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload.data))
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Express middleware
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const isValid = verifyWebhook(req.body, signature, WEBHOOK_SECRET);
  
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process webhook
  res.json({ received: true });
});
```

### Webhook Retry Logic

- Failed deliveries are retried with exponential backoff
- Default: 3 attempts (configurable)
- Backoff: 1s, 2s, 4s
- All attempts are logged

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Patient not found",
  "statusCode": 404,
  "timestamp": "2025-01-10T10:30:00Z"
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable - Integration disabled |

## Examples

### MOH Patient Lookup

```bash
GET /api/integrations/moh/patient/1234567890
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "nationalId": "1234567890",
    "name": "Ahmed Mohammed",
    "dateOfBirth": "1990-01-15",
    "gender": "male",
    "insuranceNumber": "INS123456",
    "medicalHistory": [...]
  },
  "statusCode": 200,
  "timestamp": "2025-01-10T10:30:00Z"
}
```

### HIS Create Admission

```bash
POST /api/integrations/his/admission
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": "P12345",
  "department": "Emergency",
  "admittingPhysician": "Dr. Sarah Ahmed",
  "diagnosis": "Acute appendicitis",
  "notes": "Patient requires immediate surgery"
}
```

### LIS Order Test

```bash
POST /api/integrations/lis/order
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": "P12345",
  "testType": "CBC",
  "orderedBy": "Dr. Sarah Ahmed",
  "priority": "urgent",
  "notes": "Pre-operative screening"
}
```

### Pharmacy Create Prescription

```bash
POST /api/integrations/pharmacy/prescription
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": "P12345",
  "prescribedBy": "Dr. Sarah Ahmed",
  "medications": [
    {
      "name": "Amoxicillin",
      "dosage": "500mg",
      "quantity": 21,
      "instructions": "Take 1 tablet 3 times daily",
      "duration": "7 days"
    }
  ],
  "notes": "Post-operative antibiotic"
}
```

### Check Drug Interactions

```bash
POST /api/integrations/pharmacy/interactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "medications": ["Amoxicillin", "Warfarin", "Aspirin"]
}
```

## Best Practices

1. **Always verify webhook signatures** to prevent unauthorized access
2. **Implement idempotency** for webhook handlers
3. **Use retry logic** for failed integration calls
4. **Log all integration requests** for audit trails
5. **Monitor rate limits** to avoid throttling
6. **Cache frequently accessed data** to reduce API calls
7. **Handle timeouts gracefully** with appropriate fallbacks
8. **Test integrations** in staging before production
9. **Keep API keys secure** using environment variables
10. **Monitor webhook delivery** logs for failures

## Support

For integration support:
- Email: integration-support@healthcare.sa
- Documentation: https://docs.healthcare.sa
- Status Page: https://status.healthcare.sa
