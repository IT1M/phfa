/**
 * Pharmacy Management System Integration Service
 */

import { BaseIntegrationService } from './base-integration.service';
import { IntegrationConfig, PharmacyOrder, IntegrationResponse } from './types';
import { logger } from '../utils/logger';

export class PharmacyIntegrationService extends BaseIntegrationService {
  constructor(config: IntegrationConfig) {
    super(config);
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest('get', '/api/health');
      return response.success;
    } catch (error) {
      logger.error('[Pharmacy] Connection test failed:', error);
      return false;
    }
  }

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
    return this.makeRequest<PharmacyOrder>('post', '/api/prescriptions', data);
  }

  async getOrderStatus(orderId: string): Promise<IntegrationResponse<PharmacyOrder>> {
    return this.makeRequest<PharmacyOrder>('get', `/api/orders/${orderId}`);
  }

  async getPatientMedications(patientId: string): Promise<IntegrationResponse<PharmacyOrder[]>> {
    return this.makeRequest<PharmacyOrder[]>('get', `/api/patients/${patientId}/medications`);
  }

  async checkDrugInteractions(medications: string[]): Promise<IntegrationResponse<any>> {
    return this.makeRequest<any>('post', '/api/interactions/check', { medications });
  }

  async checkInventory(medicationName: string): Promise<IntegrationResponse<{ available: boolean; quantity: number }>> {
    return this.makeRequest<{ available: boolean; quantity: number }>('get', `/api/inventory/${medicationName}`);
  }

  async dispenseMedication(orderId: string, dispensedBy: string): Promise<IntegrationResponse<void>> {
    return this.makeRequest<void>('post', `/api/orders/${orderId}/dispense`, { dispensedBy });
  }

  async getMedicationHistory(patientId: string): Promise<IntegrationResponse<any[]>> {
    return this.makeRequest<any[]>('get', `/api/patients/${patientId}/history`);
  }
}
