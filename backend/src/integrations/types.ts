/**
 * External Healthcare Integration Types
 */

export interface IntegrationConfig {
  name: string;
  type: IntegrationType;
  baseUrl: string;
  apiKey?: string;
  credentials?: {
    username: string;
    password: string;
  };
  timeout?: number;
  retryAttempts?: number;
  enabled: boolean;
}

export enum IntegrationType {
  MOH = 'moh',
  HIS = 'his',
  LIS = 'lis',
  PHARMACY = 'pharmacy',
  GEMINI = 'gemini',
  FHIR = 'fhir'
}

export enum WebhookEventType {
  DOCUMENT_PROCESSED = 'document.processed',
  VISITOR_REGISTERED = 'visitor.registered',
  SEARCH_QUERY = 'search.query',
  SYSTEM_HEALTH = 'system.health',
  EXPORT_COMPLETED = 'export.completed',
  INTEGRATION_ERROR = 'integration.error'
}

export interface WebhookConfig {
  id: string;
  url: string;
  events: WebhookEventType[];
  secret: string;
  enabled: boolean;
  retryAttempts: number;
  headers?: Record<string, string>;
}

export interface WebhookPayload {
  event: WebhookEventType;
  timestamp: Date;
  data: any;
  signature: string;
}

export interface MOHPatientData {
  nationalId: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  insuranceNumber?: string;
  medicalHistory?: any[];
}

export interface HISPatientRecord {
  patientId: string;
  admissionDate?: Date;
  dischargeDate?: Date;
  department: string;
  diagnosis: string[];
  procedures: string[];
  medications: any[];
}

export interface LISTestResult {
  testId: string;
  patientId: string;
  testType: string;
  results: any;
  performedDate: Date;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface PharmacyOrder {
  orderId: string;
  patientId: string;
  medications: {
    name: string;
    dosage: string;
    quantity: number;
    instructions: string;
  }[];
  prescribedBy: string;
  status: 'pending' | 'filled' | 'cancelled';
}

export interface IntegrationResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
  timestamp: Date;
}
