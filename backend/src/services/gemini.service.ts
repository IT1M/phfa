import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCV3Kb2rHMQoyAiYkrAFA82UlcGbYAAC0M';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

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

class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  async extractMedicalEntities(text: string): Promise<MedicalEntities> {
    try {
      const prompt = `Extract medical entities from this Arabic/English text and return JSON with patient_info, diagnoses, medications, procedures, lab_results, symptoms, and vital_signs. Normalize Arabic medical terms to their English equivalents.

Text: ${text}

Return ONLY valid JSON without any markdown formatting or code blocks. Structure:
{
  "patient_info": {"name": "", "age": 0, "gender": "", "patientId": "", "nationalId": ""},
  "diagnoses": [{"condition": "", "icd10Code": "", "severity": "", "date": ""}],
  "medications": [{"name": "", "dosage": "", "frequency": "", "route": "", "startDate": "", "endDate": ""}],
  "procedures": [{"name": "", "date": "", "provider": "", "notes": ""}],
  "lab_results": [{"test": "", "value": "", "unit": "", "referenceRange": "", "date": "", "status": ""}],
  "symptoms": [{"description": "", "severity": "", "onset": "", "duration": ""}],
  "vital_signs": [{"type": "", "value": "", "unit": "", "date": ""}]
}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      // Clean response and parse JSON
      const cleanedText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const entities = JSON.parse(cleanedText);
      logger.info('Medical entities extracted successfully');
      return entities;
    } catch (error) {
      logger.error('Error extracting medical entities:', error);
      throw new Error('Failed to extract medical entities');
    }
  }

  async parseSearchQuery(query: string): Promise<SearchQuery> {
    try {
      const prompt = `Parse this medical search query and extract structured information. Handle both Arabic and English.

Query: ${query}

Extract:
- Medical conditions/diagnoses
- Age ranges (e.g., "30-40 years", "أطفال", "elderly")
- Date ranges (e.g., "last month", "2024", "الشهر الماضي")
- Medications mentioned
- Saudi cities/locations (Riyadh, Jeddah, Mecca, Medina, Dammam, etc.)
- Urgency level (low, medium, high, critical)

Return ONLY valid JSON without markdown:
{
  "conditions": [""],
  "ageRange": {"min": 0, "max": 0},
  "dateRange": {"start": "", "end": ""},
  "medications": [""],
  "locations": [""],
  "urgencyLevel": "",
  "rawQuery": "${query}"
}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      const cleanedText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const parsedQuery = JSON.parse(cleanedText);
      logger.info('Search query parsed successfully');
      return parsedQuery;
    } catch (error) {
      logger.error('Error parsing search query:', error);
      throw new Error('Failed to parse search query');
    }
  }

  async summarizeDocument(text: string): Promise<DocumentSummary> {
    try {
      const prompt = `Summarize this medical document in both Arabic and English. Focus on clinical information.

Document: ${text}

Generate a concise summary with:
- Chief complaint (الشكوى الرئيسية)
- Key findings (النتائج الرئيسية)
- Diagnosis (التشخيص)
- Treatment plan (خطة العلاج)
- Follow-up requirements (متطلبات المتابعة)

Return ONLY valid JSON without markdown:
{
  "chiefComplaint": "",
  "keyFindings": [""],
  "diagnosis": "",
  "treatmentPlan": [""],
  "followUp": ""
}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      const cleanedText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const summary = JSON.parse(cleanedText);
      logger.info('Document summarized successfully');
      return summary;
    } catch (error) {
      logger.error('Error summarizing document:', error);
      throw new Error('Failed to summarize document');
    }
  }

  async translateMedicalText(text: string, targetLang: 'ar' | 'en'): Promise<string> {
    try {
      const langName = targetLang === 'ar' ? 'Arabic' : 'English';
      const prompt = `Translate this medical text to ${langName}. Maintain medical terminology accuracy and use standard medical terms.

Text: ${text}

Return ONLY the translated text without any additional formatting or explanations.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const translation = response.text().trim();
      
      logger.info(`Text translated to ${langName}`);
      return translation;
    } catch (error) {
      logger.error('Error translating text:', error);
      throw new Error('Failed to translate text');
    }
  }

  async normalizeMedicalTerms(text: string): Promise<{ original: string; normalized: string; language: string }[]> {
    try {
      const prompt = `Identify and normalize medical terms in this bilingual text (Arabic/English). Map Arabic terms to standard English medical terminology.

Text: ${text}

Return ONLY valid JSON array without markdown:
[
  {"original": "term in text", "normalized": "standard medical term", "language": "ar or en"}
]`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      const cleanedText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const terms = JSON.parse(cleanedText);
      logger.info('Medical terms normalized');
      return terms;
    } catch (error) {
      logger.error('Error normalizing medical terms:', error);
      throw new Error('Failed to normalize medical terms');
    }
  }

  async extractICD10Codes(diagnoses: string[]): Promise<{ diagnosis: string; icd10: string; description: string }[]> {
    try {
      const prompt = `Map these diagnoses to ICD-10 codes. Handle both Arabic and English terms.

Diagnoses: ${diagnoses.join(', ')}

Return ONLY valid JSON array without markdown:
[
  {"diagnosis": "original diagnosis", "icd10": "code", "description": "ICD-10 description"}
]`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      const cleanedText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const codes = JSON.parse(cleanedText);
      logger.info('ICD-10 codes extracted');
      return codes;
    } catch (error) {
      logger.error('Error extracting ICD-10 codes:', error);
      throw new Error('Failed to extract ICD-10 codes');
    }
  }
}

export const geminiService = new GeminiService();
