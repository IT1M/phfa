/**
 * Example usage of Gemini API integration for medical text processing
 */

import { geminiService } from '../services/gemini.service';
import { processFullMedicalDocument, enhanceSearch, batchProcessDocuments } from '../utils/gemini-helper';

// Example 1: Extract medical entities from Arabic text
async function example1() {
  const arabicText = `
    المريض: أحمد محمد العلي
    العمر: 52 سنة
    الجنس: ذكر
    رقم الهوية: 1234567890
    
    التشخيص: السكري من النوع الثاني، ارتفاع ضغط الدم
    
    الأدوية الموصوفة:
    - ميتفورمين 500mg مرتين يومياً
    - أملوديبين 5mg مرة واحدة يومياً
    
    الفحوصات المخبرية:
    - سكر الدم الصائم: 145 mg/dL (المعدل الطبيعي: 70-100)
    - HbA1c: 7.8% (المعدل الطبيعي: <5.7%)
    - ضغط الدم: 145/90 mmHg
    
    الأعراض: صداع، دوخة، عطش شديد
  `;

  const entities = await geminiService.extractMedicalEntities(arabicText);
  console.log('Extracted Entities:', JSON.stringify(entities, null, 2));
}

// Example 2: Parse natural language search query
async function example2() {
  const queries = [
    'مرضى السكري في الرياض بين 40-60 سنة',
    'patients with hypertension in Jeddah last month',
    'حالات طارئة في مكة خلال الأسبوع الماضي',
    'diabetic patients on metformin aged 50-70'
  ];

  for (const query of queries) {
    const parsed = await geminiService.parseSearchQuery(query);
    console.log(`Query: ${query}`);
    console.log('Parsed:', JSON.stringify(parsed, null, 2));
    console.log('---');
  }
}

// Example 3: Summarize medical document
async function example3() {
  const medicalReport = `
    Patient: Sarah Ahmed
    Age: 35 years
    Gender: Female
    
    Chief Complaint: Severe abdominal pain for 2 days
    
    History of Present Illness:
    Patient presents with acute onset of right lower quadrant pain that started 48 hours ago.
    Pain is constant, sharp, and worsens with movement. Associated with nausea and vomiting.
    No fever initially, but developed low-grade fever (38.2°C) today.
    
    Physical Examination:
    - Vital Signs: BP 120/80, HR 95, Temp 38.2°C
    - Abdomen: Tender in RLQ, positive McBurney's point, rebound tenderness present
    - Rovsing's sign positive
    
    Laboratory Results:
    - WBC: 15,000/μL (elevated)
    - Neutrophils: 85%
    - CRP: 45 mg/L (elevated)
    
    Imaging:
    CT scan shows inflamed appendix with surrounding fat stranding, consistent with acute appendicitis.
    
    Diagnosis: Acute appendicitis
    
    Treatment Plan:
    1. NPO (nothing by mouth)
    2. IV fluids and antibiotics (Ceftriaxone + Metronidazole)
    3. Surgical consultation for appendectomy
    4. Pain management with IV analgesics
    
    Follow-up: Post-operative care and wound monitoring
  `;

  const summary = await geminiService.summarizeDocument(medicalReport);
  console.log('Document Summary:', JSON.stringify(summary, null, 2));
}

// Example 4: Translate medical text
async function example4() {
  const englishText = 'Patient has type 2 diabetes and hypertension. Prescribed metformin and amlodipine.';
  const arabicTranslation = await geminiService.translateMedicalText(englishText, 'ar');
  console.log('English:', englishText);
  console.log('Arabic:', arabicTranslation);

  const arabicText = 'المريض يعاني من التهاب رئوي حاد ويحتاج إلى مضادات حيوية';
  const englishTranslation = await geminiService.translateMedicalText(arabicText, 'en');
  console.log('Arabic:', arabicText);
  console.log('English:', englishTranslation);
}

// Example 5: Normalize medical terms
async function example5() {
  const mixedText = 'المريض يعاني من سكري وضغط وألم في القلب مع صداع شديد';
  const normalized = await geminiService.normalizeMedicalTerms(mixedText);
  console.log('Normalized Terms:', JSON.stringify(normalized, null, 2));
}

// Example 6: Extract ICD-10 codes
async function example6() {
  const diagnoses = [
    'Type 2 Diabetes Mellitus',
    'Essential Hypertension',
    'Chronic Kidney Disease Stage 3',
    'Acute Myocardial Infarction',
    'Pneumonia'
  ];

  const codes = await geminiService.extractICD10Codes(diagnoses);
  console.log('ICD-10 Codes:', JSON.stringify(codes, null, 2));
}

// Example 7: Process full medical document
async function example7() {
  const documentText = `
    المريض: خالد بن عبدالله
    العمر: 68 سنة
    
    الشكوى الرئيسية: ألم في الصدر وضيق في التنفس
    
    التشخيص: احتشاء عضلة القلب الحاد
    
    الفحوصات:
    - تخطيط القلب: ارتفاع في ST segment
    - تروبونين: مرتفع
    
    العلاج:
    - أسبرين 300mg
    - كلوبيدوجريل 300mg
    - هيبارين IV
    
    الخطة: قسطرة قلبية عاجلة
  `;

  const result = await processFullMedicalDocument(documentText);
  console.log('Full Processing Result:', JSON.stringify(result, null, 2));
}

// Example 8: Enhance search with NLP
async function example8() {
  const userQuery = 'أريد البحث عن مرضى السكري في جدة الذين تتراوح أعمارهم بين 50 و 70 سنة خلال الشهر الماضي';
  const enhanced = await enhanceSearch(userQuery);
  console.log('Enhanced Search:', JSON.stringify(enhanced, null, 2));
  
  // Use enhanced.filters for database queries
  // Example SQL generation:
  console.log('\nGenerated SQL WHERE conditions:');
  if (enhanced.filters.diagnoses) {
    console.log(`diagnoses LIKE ANY(ARRAY[${enhanced.filters.diagnoses.map((d: string) => `'%${d}%'`).join(', ')}])`);
  }
  if (enhanced.filters.ageMin && enhanced.filters.ageMax) {
    console.log(`age BETWEEN ${enhanced.filters.ageMin} AND ${enhanced.filters.ageMax}`);
  }
  if (enhanced.filters.locations) {
    console.log(`location IN (${enhanced.filters.locations.map((l: string) => `'${l}'`).join(', ')})`);
  }
}

// Example 9: Batch process multiple documents
async function example9() {
  const documents = [
    {
      id: 'doc1',
      text: 'Patient A: Diabetes, Age 45, Metformin 500mg'
    },
    {
      id: 'doc2',
      text: 'المريض ب: ضغط الدم، العمر 60، أملوديبين 5mg'
    },
    {
      id: 'doc3',
      text: 'Patient C: Asthma, Age 30, Salbutamol inhaler'
    }
  ];

  const results = await batchProcessDocuments(documents);
  console.log('Batch Processing Results:', JSON.stringify(results, null, 2));
}

// Run examples
async function runExamples() {
  console.log('=== Example 1: Extract Medical Entities ===');
  await example1();
  
  console.log('\n=== Example 2: Parse Search Queries ===');
  await example2();
  
  console.log('\n=== Example 3: Summarize Document ===');
  await example3();
  
  console.log('\n=== Example 4: Translate Medical Text ===');
  await example4();
  
  console.log('\n=== Example 5: Normalize Medical Terms ===');
  await example5();
  
  console.log('\n=== Example 6: Extract ICD-10 Codes ===');
  await example6();
  
  console.log('\n=== Example 7: Process Full Document ===');
  await example7();
  
  console.log('\n=== Example 8: Enhance Search ===');
  await example8();
  
  console.log('\n=== Example 9: Batch Processing ===');
  await example9();
}

// Uncomment to run:
// runExamples().catch(console.error);

export {
  example1,
  example2,
  example3,
  example4,
  example5,
  example6,
  example7,
  example8,
  example9
};
