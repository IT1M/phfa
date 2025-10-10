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

export interface Procedure {
  name: string;
  date?: string;
  provider?: string;
  notes?: string;
}

export interface LabResult {
  test: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  date?: string;
  status?: string;
}

export interface Symptom {
  description: string;
  severity?: string;
  onset?: string;
  duration?: string;
}

export interface VitalSign {
  type: string;
  value: string;
  unit?: string;
  date?: string;
}

export interface MedicalEntities {
  patient_info?: PatientInfo;
  diagnoses?: Diagnosis[];
  medications?: Medication[];
  procedures?: Procedure[];
  lab_results?: LabResult[];
  symptoms?: Symptom[];
  vital_signs?: VitalSign[];
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

export interface ICD10Code {
  diagnosis: string;
  icd10: string;
  description: string;
}

export interface NormalizedTerm {
  original: string;
  normalized: string;
  language: 'ar' | 'en';
}
