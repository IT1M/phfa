import { geminiService } from '../services/gemini.service';
import { logger } from './logger';

/**
 * Process a medical document and extract all relevant information
 */
export async function processFullMedicalDocument(text: string) {
  try {
    const [entities, summary] = await Promise.all([
      geminiService.extractMedicalEntities(text),
      geminiService.summarizeDocument(text)
    ]);

    return {
      entities,
      summary,
      processedAt: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Error processing full medical document:', error);
    throw error;
  }
}

/**
 * Enhance search with natural language understanding
 */
export async function enhanceSearch(userQuery: string) {
  try {
    const parsedQuery = await geminiService.parseSearchQuery(userQuery);
    
    // Build SQL-compatible filters
    const filters: any = {};
    
    if (parsedQuery.conditions && parsedQuery.conditions.length > 0) {
      filters.diagnoses = parsedQuery.conditions;
    }
    
    if (parsedQuery.ageRange) {
      filters.ageMin = parsedQuery.ageRange.min;
      filters.ageMax = parsedQuery.ageRange.max;
    }
    
    if (parsedQuery.dateRange) {
      filters.dateStart = parsedQuery.dateRange.start;
      filters.dateEnd = parsedQuery.dateRange.end;
    }
    
    if (parsedQuery.medications && parsedQuery.medications.length > 0) {
      filters.medications = parsedQuery.medications;
    }
    
    if (parsedQuery.locations && parsedQuery.locations.length > 0) {
      filters.locations = parsedQuery.locations;
    }
    
    if (parsedQuery.urgencyLevel) {
      filters.urgency = parsedQuery.urgencyLevel;
    }
    
    return {
      parsedQuery,
      filters,
      originalQuery: userQuery
    };
  } catch (error) {
    logger.error('Error enhancing search:', error);
    throw error;
  }
}

/**
 * Batch process multiple documents
 */
export async function batchProcessDocuments(documents: { id: string; text: string }[]) {
  const results = [];
  
  for (const doc of documents) {
    try {
      const processed = await processFullMedicalDocument(doc.text);
      results.push({
        documentId: doc.id,
        success: true,
        data: processed
      });
    } catch (error) {
      logger.error(`Error processing document ${doc.id}:`, error);
      results.push({
        documentId: doc.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  return results;
}

/**
 * Saudi Arabia specific location normalization
 */
export const SAUDI_CITIES = [
  'Riyadh', 'الرياض',
  'Jeddah', 'جدة',
  'Mecca', 'مكة',
  'Medina', 'المدينة',
  'Dammam', 'الدمام',
  'Khobar', 'الخبر',
  'Dhahran', 'الظهران',
  'Taif', 'الطائف',
  'Tabuk', 'تبوك',
  'Abha', 'أبها',
  'Khamis Mushait', 'خميس مشيط',
  'Najran', 'نجران',
  'Jazan', 'جازان',
  'Hail', 'حائل',
  'Jubail', 'الجبيل',
  'Yanbu', 'ينبع',
  'Al-Ahsa', 'الأحساء',
  'Qatif', 'القطيف',
  'Buraidah', 'بريدة',
  'Unaizah', 'عنيزة'
];

/**
 * Common Arabic medical terms mapping
 */
export const ARABIC_MEDICAL_TERMS: Record<string, string> = {
  'سكري': 'diabetes',
  'ضغط': 'hypertension',
  'قلب': 'heart',
  'كلى': 'kidney',
  'كبد': 'liver',
  'رئة': 'lung',
  'معدة': 'stomach',
  'أمعاء': 'intestine',
  'دم': 'blood',
  'سرطان': 'cancer',
  'التهاب': 'inflammation',
  'حمى': 'fever',
  'صداع': 'headache',
  'ألم': 'pain',
  'كسر': 'fracture',
  'جرح': 'wound',
  'حساسية': 'allergy',
  'ربو': 'asthma',
  'كوليسترول': 'cholesterol',
  'غدة': 'gland'
};
