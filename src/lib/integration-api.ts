/**
 * Integration API Client
 * مكتبة شاملة للتكامل مع جميع أنظمة الرعاية الصحية الخارجية
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// أنواع البيانات
export interface IntegrationResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
  timestamp: string;
}

export interface MOHPatientData {
  nationalId: string;
  name: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  insuranceNumber?: string;
  medicalHistory?: any[];
}

export interface HISPatientRecord {
  patientId: string;
  admissionDate?: string;
  dischargeDate?: string;
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
  performedDate: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface PharmacyOrder {
  orderId: string;
  patientId: string;
  medications: Array<{
    name: string;
    dosage: string;
    quantity: number;
    instructions: string;
  }>;
  prescribedBy: string;
  status: 'pending' | 'filled' | 'cancelled';
}

export interface WebhookConfig {
  url: string;
  events: string[];
  enabled: boolean;
  retryAttempts: number;
  headers?: Record<string, string>;
}

class IntegrationAPI {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // إضافة التوكن تلقائياً
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // معالجة الأخطاء
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // ==================== وزارة الصحة (MOH) ====================
  
  async getMOHPatient(nationalId: string): Promise<IntegrationResponse<MOHPatientData>> {
    const response = await this.client.get(`/integrations/moh/patient/${nationalId}`);
    return response.data;
  }

  async verifyInsurance(nationalId: string, insuranceNumber: string): Promise<IntegrationResponse<boolean>> {
    const response = await this.client.post('/integrations/moh/insurance/verify', {
      nationalId,
      insuranceNumber,
    });
    return response.data;
  }

  async getMedicalHistory(nationalId: string): Promise<IntegrationResponse<any[]>> {
    const response = await this.client.get(`/integrations/moh/patient/${nationalId}/history`);
    return response.data;
  }

  async getVaccinationRecords(nationalId: string): Promise<IntegrationResponse<any[]>> {
    const response = await this.client.get(`/integrations/moh/patient/${nationalId}/vaccinations`);
    return response.data;
  }

  // ==================== نظام معلومات المستشفى (HIS) ====================
  
  async getHISPatient(patientId: string): Promise<IntegrationResponse<HISPatientRecord>> {
    const response = await this.client.get(`/integrations/his/patient/${patientId}`);
    return response.data;
  }

  async createAdmission(data: {
    patientId: string;
    department: string;
    admittingPhysician: string;
    diagnosis: string;
    notes?: string;
  }): Promise<IntegrationResponse<HISPatientRecord>> {
    const response = await this.client.post('/integrations/his/admission', data);
    return response.data;
  }

  async getActiveAdmissions(department?: string): Promise<IntegrationResponse<HISPatientRecord[]>> {
    const params = department ? `?department=${department}` : '';
    const response = await this.client.get(`/integrations/his/admissions/active${params}`);
    return response.data;
  }

  async scheduleAppointment(data: {
    patientId: string;
    department: string;
    physician: string;
    appointmentDate: string;
    type: string;
  }): Promise<IntegrationResponse<any>> {
    const response = await this.client.post('/integrations/his/appointments', data);
    return response.data;
  }

  // ==================== نظام معلومات المختبر (LIS) ====================
  
  async orderLabTest(data: {
    patientId: string;
    testType: string;
    orderedBy: string;
    priority: 'routine' | 'urgent' | 'stat';
    notes?: string;
  }): Promise<IntegrationResponse<LISTestResult>> {
    const response = await this.client.post('/integrations/lis/order', data);
    return response.data;
  }

  async getLabResults(testId: string): Promise<IntegrationResponse<LISTestResult>> {
    const response = await this.client.get(`/integrations/lis/results/${testId}`);
    return response.data;
  }

  async getPatientTests(patientId: string, status?: string): Promise<IntegrationResponse<LISTestResult[]>> {
    const params = status ? `?status=${status}` : '';
    const response = await this.client.get(`/integrations/lis/patient/${patientId}/tests${params}`);
    return response.data;
  }

  async getPendingTests(): Promise<IntegrationResponse<LISTestResult[]>> {
    const response = await this.client.get('/integrations/lis/tests/pending');
    return response.data;
  }

  // ==================== نظام الصيدلية ====================
  
  async createPrescription(data: {
    patientId: string;
    prescribedBy: string;
    medications: Array<{
      name: string;
      dosage: string;
      quantity: number;
      instructions: string;
      duration?: string;
    }>;
    notes?: string;
  }): Promise<IntegrationResponse<PharmacyOrder>> {
    const response = await this.client.post('/integrations/pharmacy/prescription', data);
    return response.data;
  }

  async checkDrugInteractions(medications: string[]): Promise<IntegrationResponse<any>> {
    const response = await this.client.post('/integrations/pharmacy/interactions', { medications });
    return response.data;
  }

  async getPatientMedications(patientId: string): Promise<IntegrationResponse<PharmacyOrder[]>> {
    const response = await this.client.get(`/integrations/pharmacy/patient/${patientId}/medications`);
    return response.data;
  }

  async checkInventory(medicationName: string): Promise<IntegrationResponse<{ available: boolean; quantity: number }>> {
    const response = await this.client.get(`/integrations/pharmacy/inventory/${medicationName}`);
    return response.data;
  }

  // ==================== Webhooks ====================
  
  async registerWebhook(config: WebhookConfig): Promise<{ success: boolean; webhookId: string }> {
    const response = await this.client.post('/integrations/webhooks', config);
    return response.data;
  }

  async listWebhooks(): Promise<{ success: boolean; webhooks: any[] }> {
    const response = await this.client.get('/integrations/webhooks');
    return response.data;
  }

  async deleteWebhook(webhookId: string): Promise<{ success: boolean }> {
    const response = await this.client.delete(`/integrations/webhooks/${webhookId}`);
    return response.data;
  }

  async getWebhookLogs(webhookId: string): Promise<{ success: boolean; logs: any[] }> {
    const response = await this.client.get(`/integrations/webhooks/${webhookId}/logs`);
    return response.data;
  }

  // ==================== اختبار الاتصالات ====================
  
  async testConnections(): Promise<{ success: boolean; results: Record<string, boolean> }> {
    const response = await this.client.get('/integrations/test');
    return response.data;
  }
}

export const integrationAPI = new IntegrationAPI();
