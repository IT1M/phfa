export interface DocumentProcessingResult {
  document_id: string;
  extracted_text: string;
  entities: MedicalEntities;
  confidence_score: number;
  processing_time: number;
  document_type?: DocumentType;
  language?: string;
  metadata?: ProcessingMetadata;
  validation_flags?: string[];
}

export interface MedicalEntities {
  patient: PatientInfo;
  diagnoses: Diagnosis[];
  medications: Medication[];
  procedures: Procedure[];
  lab_results: LabResult[];
}

export interface PatientInfo {
  name?: string;
  age?: string;
  gender?: string;
  id?: string;
  contact?: string;
  date_of_birth?: string;
  address?: string;
  insurance_id?: string;
}

export interface Diagnosis {
  condition: string;
  icd10_code?: string;
  confidence: number;
  date?: string;
  severity?: string;
  status?: 'active' | 'resolved' | 'chronic';
}

export interface Medication {
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  route?: string;
  prescriber?: string;
  start_date?: string;
  end_date?: string;
}

export interface Procedure {
  name: string;
  date?: string;
  provider?: string;
  location?: string;
  cpt_code?: string;
  outcome?: string;
}

export interface LabResult {
  test_name: string;
  value: string;
  unit?: string;
  reference_range?: string;
  date?: string;
  status?: 'normal' | 'abnormal' | 'critical';
  lab_name?: string;
}

export interface ProcessingConfig {
  ocr_engines?: OCREngine[];
  confidence_threshold?: number;
  language_preference?: 'arabic' | 'english' | 'auto';
  enhance_images?: boolean;
  extract_forms?: boolean;
  validate_medical_terms?: boolean;
}

export interface ProcessingMetadata {
  file_path: string;
  file_size?: number;
  pages_processed: number;
  ocr_engine: OCREngine;
  enhancement_applied: boolean;
  processing_stages: ProcessingStage[];
}

export interface ProcessingStage {
  stage: string;
  duration_ms: number;
  success: boolean;
  details?: any;
}

export enum DocumentType {
  PDF = 'pdf',
  DOCX = 'docx',
  DICOM = 'dicom',
  IMAGE = 'image',
  AUDIO = 'audio',
  HANDWRITTEN = 'handwritten'
}

export enum OCREngine {
  TESSERACT = 'tesseract',
  GOOGLE_VISION = 'google_vision',
  AZURE_COGNITIVE = 'azure_cognitive',
  AWS_TEXTRACT = 'aws_textract'
}

export interface OCRResult {
  text: string;
  confidence: number;
  engine: OCREngine;
  bounding_boxes?: BoundingBox[];
  form_fields?: FormField[];
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  confidence: number;
}

export interface FormField {
  field_name: string;
  field_value: string;
  confidence: number;
  field_type: 'text' | 'checkbox' | 'signature' | 'date' | 'number';
}

export interface QualityMetrics {
  overall_confidence: number;
  text_clarity: number;
  form_completeness: number;
  medical_entity_coverage: number;
  validation_score: number;
}

export interface ValidationResult {
  is_valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

export interface ProcessingQueue {
  id: string;
  file_path: string;
  config: ProcessingConfig;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: Date;
  started_at?: Date;
  completed_at?: Date;
  result?: DocumentProcessingResult;
  error?: string;
}

export interface BatchProcessingRequest {
  files: string[];
  config: ProcessingConfig;
  callback_url?: string;
  priority?: 'low' | 'normal' | 'high';
}

export interface BatchProcessingResult {
  batch_id: string;
  total_files: number;
  processed_files: number;
  failed_files: number;
  results: DocumentProcessingResult[];
  errors: BatchProcessingError[];
  processing_time: number;
}

export interface BatchProcessingError {
  file_path: string;
  error_message: string;
  error_code: string;
}

// Arabic-specific types
export interface ArabicProcessingConfig extends ProcessingConfig {
  arabic_dialect?: 'msa' | 'gulf' | 'levantine' | 'maghreb';
  transliteration?: boolean;
  normalize_arabic?: boolean;
}

export interface HandwritingConfig {
  handwriting_model?: 'general' | 'medical' | 'arabic';
  confidence_threshold?: number;
  preprocessing_level?: 'basic' | 'advanced';
}

// Medical-specific validation types
export interface MedicalValidationRules {
  required_fields: string[];
  format_validations: { [key: string]: RegExp };
  value_ranges: { [key: string]: { min?: number; max?: number } };
  medical_term_dictionary: string[];
  icd10_codes: string[];
  drug_database: string[];
}

export interface ConfidenceScoring {
  ocr_confidence: number;
  entity_extraction_confidence: number;
  medical_term_confidence: number;
  overall_confidence: number;
  confidence_breakdown: { [key: string]: number };
}