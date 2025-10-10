# Gemini API Integration - Quick Start Guide

## Setup

1. **Install dependencies** (already done):
```bash
npm install @google/generative-ai
```

2. **Configure API key** in `.env`:
```env
GEMINI_API_KEY=AIzaSyCV3Kb2rHMQoyAiYkrAFA82UlcGbYAAC0M
```

3. **Start the server**:
```bash
npm run dev
```

## Test the Integration

Run the test script:
```bash
npx ts-node test-gemini.ts
```

## API Endpoints

All endpoints require authentication (JWT token in Authorization header).

### 1. Extract Medical Entities
```bash
curl -X POST http://localhost:5000/api/gemini/extract-entities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "text": "المريض محمد، 45 سنة، ذكر. التشخيص: السكري"
  }'
```

### 2. Parse Search Query
```bash
curl -X POST http://localhost:5000/api/gemini/parse-query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "مرضى السكري في الرياض بين 40-60 سنة"
  }'
```

### 3. Summarize Document
```bash
curl -X POST http://localhost:5000/api/gemini/summarize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "text": "Patient presents with chest pain..."
  }'
```

### 4. Translate Medical Text
```bash
curl -X POST http://localhost:5000/api/gemini/translate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "text": "Patient has diabetes",
    "targetLang": "ar"
  }'
```

### 5. Normalize Medical Terms
```bash
curl -X POST http://localhost:5000/api/gemini/normalize-terms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "text": "المريض يعاني من سكري وضغط"
  }'
```

### 6. Extract ICD-10 Codes
```bash
curl -X POST http://localhost:5000/api/gemini/icd10-codes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "diagnoses": ["Type 2 Diabetes", "Hypertension"]
  }'
```

## Usage in Code

### Import the service
```typescript
import { geminiService } from './services/gemini.service';
```

### Extract medical entities
```typescript
const entities = await geminiService.extractMedicalEntities(text);
console.log(entities.patient_info);
console.log(entities.diagnoses);
console.log(entities.medications);
```

### Parse search query
```typescript
const parsed = await geminiService.parseSearchQuery(userQuery);
// Use parsed.conditions, parsed.ageRange, etc. for database queries
```

### Use helper functions
```typescript
import { processFullMedicalDocument, enhanceSearch } from './utils/gemini-helper';

// Process entire document
const result = await processFullMedicalDocument(documentText);

// Enhance search with NLP
const enhanced = await enhanceSearch(userQuery);
```

## Features

✅ **Medical Entity Extraction**
- Patient demographics
- Diagnoses with ICD-10 codes
- Medications (name, dosage, frequency)
- Procedures and treatments
- Lab results with reference ranges
- Symptoms and vital signs

✅ **Natural Language Search**
- Parse user queries in Arabic/English
- Extract medical conditions, age ranges, dates
- Identify medications and locations
- Determine urgency levels

✅ **Document Summarization**
- Chief complaint
- Key findings
- Diagnosis
- Treatment plan
- Follow-up requirements

✅ **Bilingual Processing**
- Arabic/English code-switching
- Medical term translation
- Terminology normalization
- Saudi dialect support

✅ **Saudi Arabia Specific**
- Recognizes Saudi cities (Riyadh, Jeddah, Mecca, etc.)
- Common Arabic medical terms
- Local healthcare context

## Examples

See `src/examples/gemini-usage.ts` for comprehensive examples of all features.

## Error Handling

All functions throw errors that should be caught:
```typescript
try {
  const entities = await geminiService.extractMedicalEntities(text);
} catch (error) {
  console.error('Failed to extract entities:', error);
}
```

## Rate Limits

Google Gemini API has rate limits. Consider:
- Implementing caching for repeated queries
- Batch processing for multiple documents
- Adding retry logic with exponential backoff

## Security

- API key is stored in `.env` (never commit to git)
- All endpoints require authentication
- Validate and sanitize user inputs
- Handle PHI/PII according to regulations

## Next Steps

1. Test the endpoints with Postman or curl
2. Integrate with your document processing pipeline
3. Add caching layer for performance
4. Implement error handling and retry logic
5. Monitor API usage and costs
