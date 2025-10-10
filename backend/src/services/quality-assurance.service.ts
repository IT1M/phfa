import { DocumentProcessingResult, QualityMetrics, ValidationResult } from '../types/document-processor.types';

export class QualityAssuranceService {
  private confidenceThresholds = {
    critical: 0.9,
    high: 0.8,
    medium: 0.7,
    low: 0.6
  };

  /**
   * Assess overall quality of document processing results
   */
  async assessQuality(result: DocumentProcessingResult): Promise<QualityMetrics> {
    const textClarity = this.assessTextClarity(result.extracted_text, result.confidence_score);
    const formCompleteness = this.assessFormCompleteness(result.entities);
    const entityCoverage = this.assessMedicalEntityCoverage(result.entities);
    const validationScore = await this.calculateValidationScore(result);

    const overallConfidence = this.calculateOverallConfidence([
      result.confidence_score,
      textClarity,
      formCompleteness,
      entityCoverage,
      validationScore
    ]);

    return {
      overall_confidence: overallConfidence,
      text_clarity: textClarity,
      form_completeness: formCompleteness,
      medical_entity_coverage: entityCoverage,
      validation_score: validationScore
    };
  }

  /**
   * Flag documents that require manual review
   */
  flagForReview(result: DocumentProcessingResult, quality: QualityMetrics): string[] {
    const flags = [];

    if (quality.overall_confidence < this.confidenceThresholds.medium) {
      flags.push('LOW_OVERALL_CONFIDENCE');
    }

    if (quality.text_clarity < this.confidenceThresholds.medium) {
      flags.push('POOR_TEXT_CLARITY');
    }

    if (quality.form_completeness < 0.5) {
      flags.push('INCOMPLETE_FORM_DATA');
    }

    if (quality.medical_entity_coverage < 0.3) {
      flags.push('INSUFFICIENT_MEDICAL_ENTITIES');
    }

    if (!result.entities.patient?.name) {
      flags.push('MISSING_PATIENT_IDENTIFICATION');
    }

    if (result.entities.diagnoses.length === 0) {
      flags.push('NO_DIAGNOSES_EXTRACTED');
    }

    // Check for suspicious patterns
    if (this.hasSuspiciousPatterns(result.extracted_text)) {
      flags.push('SUSPICIOUS_CONTENT_PATTERNS');
    }

    // Check for incomplete medical information
    if (this.hasIncompleteMedicalInfo(result.entities)) {
      flags.push('INCOMPLETE_MEDICAL_INFORMATION');
    }

    return flags;
  }

  /**
   * Create manual verification interface data
   */
  createVerificationInterface(result: DocumentProcessingResult, quality: QualityMetrics) {
    return {
      document_id: result.document_id,
      verification_required: quality.overall_confidence < this.confidenceThresholds.high,
      priority: this.calculateVerificationPriority(quality),
      sections: this.createVerificationSections(result, quality),
      suggested_corrections: this.generateSuggestedCorrections(result),
      confidence_breakdown: this.createConfidenceBreakdown(result, quality)
    };
  }

  /**
   * Track extraction accuracy metrics
   */
  trackAccuracyMetrics(result: DocumentProcessingResult, groundTruth?: any) {
    if (!groundTruth) {
      return null;
    }

    const metrics = {
      patient_info_accuracy: this.calculateFieldAccuracy(result.entities.patient, groundTruth.patient),
      diagnosis_accuracy: this.calculateArrayAccuracy(result.entities.diagnoses, groundTruth.diagnoses),
      medication_accuracy: this.calculateArrayAccuracy(result.entities.medications, groundTruth.medications),
      procedure_accuracy: this.calculateArrayAccuracy(result.entities.procedures, groundTruth.procedures),
      lab_results_accuracy: this.calculateArrayAccuracy(result.entities.lab_results, groundTruth.lab_results)
    };

    return {
      ...metrics,
      overall_accuracy: this.calculateOverallAccuracy(Object.values(metrics))
    };
  }

  private assessTextClarity(text: string, ocrConfidence: number): number {
    // Assess text clarity based on various factors
    let clarity = ocrConfidence;

    // Check for common OCR errors
    const ocrErrorPatterns = [
      /[Il1|]{3,}/, // Multiple similar characters
      /[0O]{3,}/, // Multiple zeros/Os
      /\s{3,}/, // Multiple spaces
      /[^\w\s\u0600-\u06FF.,!?;:()\-]{2,}/ // Multiple special characters
    ];

    for (const pattern of ocrErrorPatterns) {
      if (pattern.test(text)) {
        clarity -= 0.1;
      }
    }

    // Check text length and completeness
    if (text.length < 100) {
      clarity -= 0.2; // Very short text might indicate poor extraction
    }

    // Check for balanced Arabic/English content if mixed
    const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
    const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
    
    if (arabicChars > 0 && englishChars > 0) {
      const ratio = Math.min(arabicChars, englishChars) / Math.max(arabicChars, englishChars);
      if (ratio < 0.1) {
        clarity -= 0.1; // Heavily skewed might indicate language detection issues
      }
    }

    return Math.max(0, Math.min(1, clarity));
  }

  private assessFormCompleteness(entities: any): number {
    const requiredFields = [
      'patient.name',
      'patient.age',
      'patient.gender'
    ];

    const optionalFields = [
      'patient.id',
      'patient.contact',
      'patient.date_of_birth'
    ];

    let completeness = 0;
    let totalWeight = 0;

    // Check required fields (higher weight)
    for (const field of requiredFields) {
      const weight = 0.3;
      totalWeight += weight;
      if (this.getNestedValue(entities, field)) {
        completeness += weight;
      }
    }

    // Check optional fields (lower weight)
    for (const field of optionalFields) {
      const weight = 0.1;
      totalWeight += weight;
      if (this.getNestedValue(entities, field)) {
        completeness += weight;
      }
    }

    // Check for presence of medical data
    if (entities.diagnoses && entities.diagnoses.length > 0) {
      completeness += 0.2;
      totalWeight += 0.2;
    }

    if (entities.medications && entities.medications.length > 0) {
      completeness += 0.1;
      totalWeight += 0.1;
    }

    if (entities.lab_results && entities.lab_results.length > 0) {
      completeness += 0.1;
      totalWeight += 0.1;
    }

    return totalWeight > 0 ? completeness / totalWeight : 0;
  }

  private assessMedicalEntityCoverage(entities: any): number {
    let coverage = 0;
    let maxCoverage = 0;

    // Patient information (30% of total coverage)
    maxCoverage += 0.3;
    if (entities.patient && Object.keys(entities.patient).length > 0) {
      coverage += 0.3 * (Object.keys(entities.patient).length / 8); // 8 possible patient fields
    }

    // Diagnoses (25% of total coverage)
    maxCoverage += 0.25;
    if (entities.diagnoses && entities.diagnoses.length > 0) {
      coverage += 0.25;
    }

    // Medications (20% of total coverage)
    maxCoverage += 0.2;
    if (entities.medications && entities.medications.length > 0) {
      coverage += 0.2;
    }

    // Procedures (15% of total coverage)
    maxCoverage += 0.15;
    if (entities.procedures && entities.procedures.length > 0) {
      coverage += 0.15;
    }

    // Lab results (10% of total coverage)
    maxCoverage += 0.1;
    if (entities.lab_results && entities.lab_results.length > 0) {
      coverage += 0.1;
    }

    return coverage;
  }

  private async calculateValidationScore(result: DocumentProcessingResult): Promise<number> {
    let score = 1.0;

    // Check for validation flags
    if (result.validation_flags) {
      const criticalFlags = result.validation_flags.filter(flag => 
        flag.includes('CRITICAL') || flag.includes('MISSING_PATIENT')
      );
      score -= criticalFlags.length * 0.3;

      const warningFlags = result.validation_flags.filter(flag => 
        flag.includes('WARNING') || flag.includes('LOW_CONFIDENCE')
      );
      score -= warningFlags.length * 0.1;
    }

    // Validate medical terminology
    const medicalTerms = this.extractMedicalTerms(result.entities);
    const validTerms = medicalTerms.filter(term => this.isValidMedicalTerm(term));
    const termValidityRatio = medicalTerms.length > 0 ? validTerms.length / medicalTerms.length : 1;
    score *= termValidityRatio;

    return Math.max(0, Math.min(1, score));
  }

  private calculateOverallConfidence(scores: number[]): number {
    const validScores = scores.filter(score => !isNaN(score) && score >= 0);
    if (validScores.length === 0) return 0;
    
    return validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
  }

  private hasSuspiciousPatterns(text: string): boolean {
    const suspiciousPatterns = [
      /(.)\1{10,}/, // Repeated character more than 10 times
      /[^\w\s\u0600-\u06FF.,!?;:()\-]{5,}/, // Long sequences of special characters
      /^\s*$/, // Empty or whitespace-only text
      /^.{1,10}$/ // Extremely short text
    ];

    return suspiciousPatterns.some(pattern => pattern.test(text));
  }

  private hasIncompleteMedicalInfo(entities: any): boolean {
    // Check if essential medical information is missing
    const hasPatientInfo = entities.patient && entities.patient.name;
    const hasMedicalData = (entities.diagnoses && entities.diagnoses.length > 0) ||
                          (entities.medications && entities.medications.length > 0) ||
                          (entities.procedures && entities.procedures.length > 0) ||
                          (entities.lab_results && entities.lab_results.length > 0);

    return !hasPatientInfo || !hasMedicalData;
  }

  private calculateVerificationPriority(quality: QualityMetrics): 'low' | 'medium' | 'high' | 'critical' {
    if (quality.overall_confidence < this.confidenceThresholds.low) {
      return 'critical';
    } else if (quality.overall_confidence < this.confidenceThresholds.medium) {
      return 'high';
    } else if (quality.overall_confidence < this.confidenceThresholds.high) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private createVerificationSections(result: DocumentProcessingResult, quality: QualityMetrics) {
    const sections = [];

    // Patient information section
    sections.push({
      section: 'patient_info',
      confidence: this.calculateSectionConfidence(result.entities.patient),
      requires_review: !result.entities.patient?.name,
      fields: this.createFieldVerification(result.entities.patient, 'patient')
    });

    // Diagnoses section
    sections.push({
      section: 'diagnoses',
      confidence: this.calculateArrayConfidence(result.entities.diagnoses),
      requires_review: result.entities.diagnoses.length === 0,
      items: result.entities.diagnoses.map(diagnosis => ({
        ...diagnosis,
        requires_review: diagnosis.confidence < this.confidenceThresholds.medium
      }))
    });

    // Medications section
    sections.push({
      section: 'medications',
      confidence: this.calculateArrayConfidence(result.entities.medications),
      requires_review: false,
      items: result.entities.medications.map(medication => ({
        ...medication,
        requires_review: !medication.dosage || !medication.frequency
      }))
    });

    return sections;
  }

  private generateSuggestedCorrections(result: DocumentProcessingResult) {
    const suggestions = [];

    // Patient information suggestions
    if (!result.entities.patient?.name) {
      suggestions.push({
        field: 'patient.name',
        suggestion: 'Patient name is required for proper identification',
        priority: 'critical'
      });
    }

    // Diagnosis suggestions
    for (const diagnosis of result.entities.diagnoses) {
      if (!diagnosis.icd10_code) {
        suggestions.push({
          field: 'diagnosis.icd10_code',
          suggestion: `Consider adding ICD-10 code for "${diagnosis.condition}"`,
          priority: 'medium'
        });
      }
    }

    return suggestions;
  }

  private createConfidenceBreakdown(result: DocumentProcessingResult, quality: QualityMetrics) {
    return {
      ocr_confidence: result.confidence_score,
      text_clarity: quality.text_clarity,
      form_completeness: quality.form_completeness,
      entity_coverage: quality.medical_entity_coverage,
      validation_score: quality.validation_score,
      overall_confidence: quality.overall_confidence
    };
  }

  private calculateFieldAccuracy(extracted: any, groundTruth: any): number {
    if (!groundTruth) return 0;
    
    const fields = Object.keys(groundTruth);
    let correct = 0;

    for (const field of fields) {
      if (extracted && extracted[field] === groundTruth[field]) {
        correct++;
      }
    }

    return fields.length > 0 ? correct / fields.length : 0;
  }

  private calculateArrayAccuracy(extracted: any[], groundTruth: any[]): number {
    if (!groundTruth || groundTruth.length === 0) return 0;
    
    let matches = 0;
    for (const truthItem of groundTruth) {
      const match = extracted.find(item => this.itemsMatch(item, truthItem));
      if (match) matches++;
    }

    return matches / groundTruth.length;
  }

  private calculateOverallAccuracy(accuracies: number[]): number {
    const validAccuracies = accuracies.filter(acc => !isNaN(acc));
    return validAccuracies.length > 0 ? 
      validAccuracies.reduce((sum, acc) => sum + acc, 0) / validAccuracies.length : 0;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  }

  private extractMedicalTerms(entities: any): string[] {
    const terms = [];
    
    if (entities.diagnoses) {
      terms.push(...entities.diagnoses.map(d => d.condition));
    }
    
    if (entities.medications) {
      terms.push(...entities.medications.map(m => m.name));
    }
    
    if (entities.procedures) {
      terms.push(...entities.procedures.map(p => p.name));
    }

    return terms.filter(term => term && typeof term === 'string');
  }

  private isValidMedicalTerm(term: string): boolean {
    // Basic validation - in production, use medical terminology database
    return term.length > 2 && /^[a-zA-Z\u0600-\u06FF\s\-]+$/.test(term);
  }

  private calculateSectionConfidence(section: any): number {
    if (!section) return 0;
    
    const fields = Object.keys(section);
    const filledFields = fields.filter(field => section[field]);
    
    return fields.length > 0 ? filledFields.length / fields.length : 0;
  }

  private calculateArrayConfidence(array: any[]): number {
    if (!array || array.length === 0) return 0;
    
    const confidences = array
      .map(item => item.confidence)
      .filter(conf => typeof conf === 'number');
    
    return confidences.length > 0 ? 
      confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length : 0.5;
  }

  private createFieldVerification(obj: any, prefix: string) {
    if (!obj) return [];
    
    return Object.keys(obj).map(key => ({
      field: `${prefix}.${key}`,
      value: obj[key],
      confidence: 0.8, // Default confidence
      requires_review: !obj[key] || (typeof obj[key] === 'string' && obj[key].length < 2)
    }));
  }

  private itemsMatch(item1: any, item2: any): boolean {
    // Simple matching logic - in production, use more sophisticated comparison
    if (item1.name && item2.name) {
      return item1.name.toLowerCase() === item2.name.toLowerCase();
    }
    if (item1.condition && item2.condition) {
      return item1.condition.toLowerCase() === item2.condition.toLowerCase();
    }
    return false;
  }
}