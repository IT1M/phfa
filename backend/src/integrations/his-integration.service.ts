/**
 * Hospital Information System (HIS) Integration Service
 */

import { BaseIntegrationService } from './base-integration.service';
import { IntegrationConfig, HISPatientRecord, IntegrationResponse } from './types';
import { logger } from '../utils/logger';

export class HISIntegrationService extends BaseIntegrationService {
  constructor(config: IntegrationConfig) {
    super(config);
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest('get', '/api/health');
      return response.success;
    } catch (error) {
      logger.error('[HIS] Connection test failed:', error);
      return false;
    }
  }

  async getPatientRecord(patientId: string): Promise<IntegrationResponse<HISPatientRecord>> {
    return this.makeRequest<HISPatientRecord>('get', `/api/patients/${patientId}`);
  }

  async getActiveAdmissions(department?: string): Promise<IntegrationResponse<HISPatientRecord[]>> {
    const params = department ? `?department=${department}` : '';
    return this.makeRequest<HISPatientRecord[]>('get', `/api/admissions/active${params}`);
  }

  async createAdmission(data: {
    patientId: string;
    department: string;
    admittingPhysician: string;
    diagnosis: string;
    notes?: string;
  }): Promise<IntegrationResponse<HISPatientRecord>> {
    return this.makeRequest<HISPatientRecord>('post', '/api/admissions', data);
  }

  async updatePatientStatus(patientId: string, status: string): Promise<IntegrationResponse<void>> {
    return this.makeRequest<void>('put', `/api/patients/${patientId}/status`, { status });
  }

  async getDischargeSummary(admissionId: string): Promise<IntegrationResponse<any>> {
    return this.makeRequest<any>('get', `/api/admissions/${admissionId}/discharge-summary`);
  }

  async scheduleAppointment(data: {
    patientId: string;
    department: string;
    physician: string;
    appointmentDate: Date;
    type: string;
  }): Promise<IntegrationResponse<any>> {
    return this.makeRequest<any>('post', '/api/appointments', data);
  }
}
