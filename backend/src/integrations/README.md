# Healthcare Integration System

## Overview

This module provides a comprehensive integration framework for connecting with external healthcare systems including:

- **Saudi Ministry of Health (MOH)** - Patient data, insurance verification, medical records
- **Hospital Information Systems (HIS)** - Admissions, appointments, patient management
- **Laboratory Information Systems (LIS)** - Test ordering, results retrieval
- **Pharmacy Management Systems** - Prescriptions, drug interactions, inventory

## Architecture

### Base Integration Service

All integration services extend `BaseIntegrationService` which provides:
- HTTP client with retry logic
- Request/response logging
- Error handling
- Connection testing
- Configurable timeouts and retry attempts

### Integration Manager

The `IntegrationManager` centralizes all integration services and provides:
- Service initialization from database configuration
- Connection testing for all services
- Configuration management
- Webhook service coordination

### Webhook System

The webhook system enables event-driven notifications:
- Configurable event subscriptions
- HMAC-SHA256 signature verification
- Automatic retry with exponential backoff
- Delivery logging and monitoring

## Usage

### Initialize Integration Manager

```typescript
import { Pool } from 'pg';
import { IntegrationManager } from './integrations';

const pool = new Pool({ /* config */ });
const integrationManager = new IntegrationManager(pool);
```

### MOH Integration

```typescript
const mohService = integrationManager.getMOHService();

// Get patient by National ID
const patient = await mohService.getPatientByNationalId('1234567890');

// Verify insurance
const isValid = await mohService.verifyInsurance('1234567890', 'INS123456');

// Get medical history
const history = await mohService.getMedicalHistory('1234567890');
```

### HIS Integration

```typescript
const hisService = integrationManager.getHISService();

// Create admission
const admission = await hisService.createAdmission({
  patientId: 'P12345',
  department: 'Emergency',
  admittingPhysician: 'Dr. Sarah Ahmed',
  diagnosis: 'Acute appendicitis'
});

// Get active admissions
const admissions = await hisService.getActiveAdmissions('Emergency');
```

### LIS Integration

```typescript
const lisService = integrationManager.getLISService();

// Order test
const test = await lisService.orderTest({
  patientId: 'P12345',
  testType: 'CBC',
  orderedBy: 'Dr. Sarah Ahmed',
  priority: 'urgent'
});

// Get results
const results = await lisService.getTestResults(test.data.testId);
```

### Pharmacy Integration

```typescript
const pharmacyService = integrationManager.getPharmacyService();

// Check drug interactions
const interactions = await pharmacyService.checkDrugInteractions([
  'Amoxicillin',
  'Warfarin'
]);

// Create prescription
const prescription = await pharmacyService.createPrescription({
  patientId: 'P12345',
  prescribedBy: 'Dr. Sarah Ahmed',
  medications: [{
    name: 'Amoxicillin',
    dosage: '500mg',
    quantity: 21,
    instructions: 'Take 1 tablet 3 times daily'
  }]
});
```

### Webhooks

```typescript
// Register webhook
const webhookId = await integrationManager.webhookService.registerWebhook({
  url: 'https://your-server.com/webhook',
  events: ['document.processed', 'export.completed'],
  enabled: true,
  retryAttempts: 3
});

// Trigger event
await integrationManager.webhookService.triggerEvent(
  'document.processed',
  { documentId: '123', status: 'completed' }
);

// Verify webhook signature (in your webhook handler)
const isValid = integrationManager.webhookService.verifySignature(
  secret,
  signature,
  payload.data
);
```

## Configuration

### Database Schema

Run the migration to create required tables:

```bash
psql -U postgres -d medical_documents -f src/database/migrations/007_integrations.sql
```

### Environment Variables

Add to `.env`:

```bash
# MOH Integration
MOH_API_URL=https://api.moh.gov.sa/v1
MOH_API_KEY=your_api_key
MOH_ENABLED=true

# HIS Integration
HIS_API_URL=http://his.hospital.local:8080
HIS_USERNAME=integration_user
HIS_PASSWORD=secure_password
HIS_ENABLED=true

# LIS Integration
LIS_API_URL=http://lis.hospital.local:8081
LIS_API_KEY=your_api_key
LIS_ENABLED=true

# Pharmacy Integration
PHARMACY_API_URL=http://pharmacy.hospital.local:8082
PHARMACY_API_KEY=your_api_key
PHARMACY_ENABLED=true

# Integration Settings
INTEGRATION_TIMEOUT=30000
INTEGRATION_RETRY_ATTEMPTS=3

# Webhook Configuration
ENABLE_WEBHOOKS=true
WEBHOOK_RETRY_ATTEMPTS=3
WEBHOOK_TIMEOUT=10000
```

### API Configuration

Configure integrations via API:

```bash
POST /api/integrations/config
Authorization: Bearer <admin-token>

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

## API Endpoints

### Integration Management

- `GET /api/integrations/test` - Test all connections
- `POST /api/integrations/config` - Save integration config

### MOH Endpoints

- `GET /api/integrations/moh/patient/:nationalId` - Get patient data
- `POST /api/integrations/moh/insurance/verify` - Verify insurance
- `GET /api/integrations/moh/patient/:nationalId/history` - Get medical history

### HIS Endpoints

- `GET /api/integrations/his/patient/:patientId` - Get patient record
- `POST /api/integrations/his/admission` - Create admission
- `GET /api/integrations/his/admissions/active` - Get active admissions

### LIS Endpoints

- `POST /api/integrations/lis/order` - Order test
- `GET /api/integrations/lis/results/:testId` - Get test results
- `GET /api/integrations/lis/patient/:patientId/tests` - Get patient tests

### Pharmacy Endpoints

- `POST /api/integrations/pharmacy/prescription` - Create prescription
- `POST /api/integrations/pharmacy/interactions` - Check drug interactions
- `GET /api/integrations/pharmacy/inventory/:medication` - Check inventory

### Webhook Endpoints

- `GET /api/integrations/webhooks` - List webhooks
- `POST /api/integrations/webhooks` - Register webhook
- `DELETE /api/integrations/webhooks/:id` - Unregister webhook
- `GET /api/integrations/webhooks/:id/logs` - Get delivery logs

## Testing

Run integration examples:

```bash
npm run test:integrations
```

Test specific integration:

```bash
curl -X GET http://localhost:5000/api/integrations/test \
  -H "Authorization: Bearer <token>"
```

## Error Handling

All integration methods return `IntegrationResponse<T>`:

```typescript
interface IntegrationResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
  timestamp: Date;
}
```

Example error handling:

```typescript
const result = await mohService.getPatientByNationalId('1234567890');

if (!result.success) {
  console.error(`Error ${result.statusCode}: ${result.error}`);
  return;
}

console.log('Patient:', result.data);
```

## Security

- All API calls require JWT authentication
- Webhook signatures use HMAC-SHA256
- API keys stored encrypted in database
- Rate limiting applied per user role
- All requests logged for audit trail

## Monitoring

Integration calls are logged with:
- Request/response details
- Execution time
- Success/failure status
- Error messages

Webhook deliveries are logged with:
- Delivery attempts
- Success/failure status
- Response codes
- Error messages

## Documentation

- **API Specification**: `/api-docs` (Swagger UI)
- **OpenAPI Spec**: `/api-docs.yaml`
- **Integration Guide**: `docs/INTEGRATION_GUIDE.md`
- **Examples**: `src/examples/integration-usage.ts`
