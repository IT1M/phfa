/**
 * Frontend client for Gemini API integration
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PatientInfo {
  name?: string;
  age?: number;
  gender?: string;
  patientId?: string;
  nationalId?: string;
}

export interface Diagnosis {
  condition: string;
  icd10Code?: string;
  severity?: string;
  date?: string;
}

export interface Medication {
  name: string;
  dosage?: string;
  frequency?: string;
  route?: string;
  startDate?: string;
  endDate?: string;
}

export interface MedicalEntities {
  patient_info?: PatientInfo;
  diagnoses?: Diagnosis[];
  medications?: Medication[];
  procedures?: any[];
  lab_results?: any[];
  symptoms?: any[];
  vital_signs?: any[];
}

export interface SearchQuery {
  conditions?: string[];
  ageRange?: { min?: number; max?: number };
  dateRange?: { start?: string; end?: string };
  medications?: string[];
  locations?: string[];
  urgencyLevel?: 'low' | 'medium' | 'high' | 'critical';
  rawQuery: string;
}

export interface DocumentSummary {
  chiefComplaint?: string;
  keyFindings?: string[];
  diagnosis?: string;
  treatmentPlan?: string[];
  followUp?: string;
}

class GeminiClient {
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private async request<T>(endpoint: string, data: any): Promise<T> {
    const token = this.getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/gemini${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    const result: ApiResponse<T> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Request failed');
    }

    return result.data;
  }

  /**
   * Extract medical entities from text
   */
  async extractEntities(text: string): Promise<MedicalEntities> {
    return this.request<MedicalEntities>('/extract-entities', { text });
  }

  /**
   * Parse natural language search query
   */
  async parseQuery(query: string): Promise<SearchQuery> {
    return this.request<SearchQuery>('/parse-query', { query });
  }

  /**
   * Summarize medical document
   */
  async summarize(text: string): Promise<DocumentSummary> {
    return this.request<DocumentSummary>('/summarize', { text });
  }

  /**
   * Translate medical text
   */
  async translate(text: string, targetLang: 'ar' | 'en'): Promise<{ translation: string; targetLang: string }> {
    return this.request<{ translation: string; targetLang: string }>('/translate', { text, targetLang });
  }

  /**
   * Normalize medical terms
   */
  async normalizeTerms(text: string): Promise<{ original: string; normalized: string; language: string }[]> {
    return this.request<{ original: string; normalized: string; language: string }[]>('/normalize-terms', { text });
  }

  /**
   * Extract ICD-10 codes
   */
  async extractICD10Codes(diagnoses: string[]): Promise<{ diagnosis: string; icd10: string; description: string }[]> {
    return this.request<{ diagnosis: string; icd10: string; description: string }[]>('/icd10-codes', { diagnoses });
  }
}

export const geminiClient = new GeminiClient();
