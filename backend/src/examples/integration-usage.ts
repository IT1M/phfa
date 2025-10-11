/**
 * Integration Usage Examples
 * Demonstrates how to use the healthcare integration services
 */

import { Pool } from 'pg';
import { IntegrationManager } from '../integrations/integration-manager.service';
import { WebhookEventType } from '../integrations/types';

async function exampleUsage() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  const integrationManager = new IntegrationManager(pool);

  // Example 1: MOH Patient Lookup
  console.log('\n=== MOH Patient Lookup ===');
  const mohService = integrationManager.getMOHService();
  if (mohService) {
    const patientResult = await mohService.getPatientByNationalId('1234567890');
    console.log('Patient Data:', patientResult);

    // Verify insurance
    const insuranceResult = await mohService.verifyInsurance('1234567890', 'INS123456');
    console.log('Insurance Valid:', insuranceResult);
  }

  // Example 2: HIS Patient Admission
  console.log('\n=== HIS Patient Admission ===');
  const hisService = integrationManager.getHISService();
  if (hisService) {
    const admissionResult = await hisService.createAdmission({
      patientId: 'P12345',
      department: 'Emergency',
      admittingPhysician: 'Dr. Sarah Ahmed',
      diagnosis: 'Acute appendicitis',
      notes: 'Patient requires immediate surgery'
    });
    console.log('Admission Created:', admissionResult);

    // Get active admissions
    const activeAdmissions = await hisService.getActiveAdmissions('Emergency');
    console.log('Active Admissions:', activeAdmissions);
  }

  // Example 3: LIS Test Ordering
  console.log('\n=== LIS Test Ordering ===');
  const lisService = integrationManager.getLISService();
  if (lisService) {
    const testOrder = await lisService.orderTest({
      patientId: 'P12345',
      testType: 'CBC',
      orderedBy: 'Dr. Sarah Ahmed',
      priority: 'urgent',
      notes: 'Pre-operative screening'
    });
    console.log('Test Ordered:', testOrder);

    // Get test results
    if (testOrder.success && testOrder.data) {
      const results = await lisService.getTestResults(testOrder.data.testId);
      console.log('Test Results:', results);
    }
  }

  // Example 4: Pharmacy Prescription
  console.log('\n=== Pharmacy Prescription ===');
  const pharmacyService = integrationManager.getPharmacyService();
  if (pharmacyService) {
    // Check drug interactions first
    const interactions = await pharmacyService.checkDrugInteractions([
      'Amoxicillin',
      'Warfarin'
    ]);
    console.log('Drug Interactions:', interactions);

    // Create prescription
    const prescription = await pharmacyService.createPrescription({
      patientId: 'P12345',
      prescribedBy: 'Dr. Sarah Ahmed',
      medications: [
        {
          name: 'Amoxicillin',
          dosage: '500mg',
          quantity: 21,
          instructions: 'Take 1 tablet 3 times daily',
          duration: '7 days'
        }
      ],
      notes: 'Post-operative antibiotic'
    });
    console.log('Prescription Created:', prescription);
  }

  // Example 5: Webhook Registration
  console.log('\n=== Webhook Registration ===');
  const webhookId = await integrationManager.webhookService.registerWebhook({
    url: 'https://your-server.com/webhook',
    events: [
      WebhookEventType.DOCUMENT_PROCESSED,
      WebhookEventType.EXPORT_COMPLETED
    ],
    enabled: true,
    retryAttempts: 3,
    headers: {
      'X-Custom-Header': 'value'
    }
  });
  console.log('Webhook Registered:', webhookId);

  // Example 6: Trigger Webhook Event
  console.log('\n=== Trigger Webhook Event ===');
  await integrationManager.webhookService.triggerEvent(
    WebhookEventType.DOCUMENT_PROCESSED,
    {
      documentId: '123',
      status: 'completed',
      processingTime: 5000,
      extractedData: {
        patientName: 'Ahmed Mohammed',
        documentType: 'Lab Report'
      }
    }
  );
  console.log('Webhook event triggered');

  // Example 7: Test All Connections
  console.log('\n=== Test All Connections ===');
  const connectionTests = await integrationManager.testAllConnections();
  console.log('Connection Test Results:', connectionTests);

  await pool.end();
}

// Run examples if executed directly
if (require.main === module) {
  exampleUsage()
    .then(() => {
      console.log('\n✓ Integration examples completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('✗ Integration examples failed:', error);
      process.exit(1);
    });
}

export { exampleUsage };
