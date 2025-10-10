# Google Gemini API Integration for Medical Text Processing

## Overview
This integration uses Google Gemini Pro to process medical documents with support for Arabic/English bilingual content.

## API Key
The Gemini API key is configured in `.env`:
```
GEMINI_API_KEY=AIzaSyCV3Kb2rHMQoyAiYkrAFA82UlcGbYAAC0M
```

## Endpoints

### 1. Extract Medical Entities
**POST** `/api/gemini/extract-entities`

Extracts structured medical information from text.

**Request:**
```json
{
  "text": "المريض محمد أحمد، 45 سنة، ذكر. التشخيص: السكري من النوع الثاني. الأدوية: ميتفورمين 500mg مرتين يومياً"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "patient_info": {
      "name": "محمد أحمد",
      "age": 45,
      "gender": "male"
    },
    "diagnoses": [
      {
        "condition": "Type 2 Diabetes",
        "icd10Code": "E11",
        "severity": "moderate"
      }
    ],
    "medications": [
      {
        "name": "Metformin",
        "dosage": "500mg",
        "frequency": "twice daily"
      }
    ],
    "procedures": [],
    "lab_results": [],
    "symptoms": [],
    "vital_signs": []
  }
}
```

### 2. Parse Natural Language Search
**POST** `/api/gemini/parse-query`

Converts natural language queries into structured search parameters.

**Request:**
```json
{
  "query": "مرضى السكري في الرياض بين 40-60 سنة خلال الشهر الماضي"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conditions": ["diabetes"],
    "ageRange": { "min": 40, "max": 60 },
    "dateRange": { "start": "2025-09-10", "end": "2025-10-10" },
    "locations": ["Riyadh"],
    "urgencyLevel": "medium",
    "rawQuery": "مرضى السكري في الرياض بين 40-60 سنة خلال الشهر الماضي"
  }
}
```

### 3. Summarize Document
**POST** `/api/gemini/summarize`

Generates clinical summaries of medical documents.

**Request:**
```json
{
  "text": "Patient presented with chest pain and shortness of breath. ECG shows ST elevation. Troponin levels elevated. Diagnosed with acute myocardial infarction. Started on aspirin, clopidogrel, and heparin. Scheduled for cardiac catheterization."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "chiefComplaint": "Chest pain and shortness of breath",
    "keyFindings": [
      "ST elevation on ECG",
      "Elevated troponin levels"
    ],
    "diagnosis": "Acute myocardial infarction",
    "treatmentPlan": [
      "Aspirin",
      "Clopidogrel",
      "Heparin",
      "Cardiac catheterization scheduled"
    ],
    "followUp": "Cardiac catheterization and cardiology consultation"
  }
}
```

### 4. Translate Medical Text
**POST** `/api/gemini/translate`

Translates medical text between Arabic and English.

**Request:**
```json
{
  "text": "Patient has hypertension and diabetes",
  "targetLang": "ar"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "translation": "المريض يعاني من ارتفاع ضغط الدم والسكري",
    "targetLang": "ar"
  }
}
```

### 5. Normalize Medical Terms
**POST** `/api/gemini/normalize-terms`

Normalizes Arabic medical terms to standard English terminology.

**Request:**
```json
{
  "text": "المريض يعاني من سكري وضغط وألم في القلب"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    { "original": "سكري", "normalized": "diabetes", "language": "ar" },
    { "original": "ضغط", "normalized": "hypertension", "language": "ar" },
    { "original": "ألم في القلب", "normalized": "chest pain", "language": "ar" }
  ]
}
```

### 6. Extract ICD-10 Codes
**POST** `/api/gemini/icd10-codes`

Maps diagnoses to ICD-10 codes.

**Request:**
```json
{
  "diagnoses": ["Type 2 Diabetes", "Hypertension", "Chronic Kidney Disease"]
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "diagnosis": "Type 2 Diabetes",
      "icd10": "E11",
      "description": "Type 2 diabetes mellitus"
    },
    {
      "diagnosis": "Hypertension",
      "icd10": "I10",
      "description": "Essential (primary) hypertension"
    },
    {
      "diagnosis": "Chronic Kidney Disease",
      "icd10": "N18",
      "description": "Chronic kidney disease"
    }
  ]
}
```

## Usage Examples

### Process Full Document
```typescript
import { processFullMedicalDocument } from './utils/gemini-helper';

const result = await processFullMedicalDocument(documentText);
console.log(result.entities);
console.log(result.summary);
```

### Enhance Search
```typescript
import { enhanceSearch } from './utils/gemini-helper';

const enhanced = await enhanceSearch("مرضى السكري في جدة");
// Use enhanced.filters for database queries
```

### Batch Processing
```typescript
import { batchProcessDocuments } from './utils/gemini-helper';

const documents = [
  { id: '1', text: 'document 1 text...' },
  { id: '2', text: 'document 2 text...' }
];

const results = await batchProcessDocuments(documents);
```

## Supported Features

### Medical Entity Types
- Patient demographics (name, age, gender, ID)
- Diagnoses with ICD-10 codes
- Medications (name, dosage, frequency, route)
- Procedures and treatments
- Lab results with reference ranges
- Symptoms and vital signs

### Natural Language Understanding
- Medical conditions
- Age ranges (e.g., "30-40 years", "أطفال", "elderly")
- Date ranges (e.g., "last month", "2024", "الشهر الماضي")
- Medications
- Saudi cities (Riyadh, Jeddah, Mecca, Medina, etc.)
- Urgency levels (low, medium, high, critical)

### Bilingual Support
- Arabic/English code-switching
- Medical term translation
- Terminology normalization
- Saudi dialect understanding

## Saudi Arabia Specific Features

### Supported Cities
Riyadh, Jeddah, Mecca, Medina, Dammam, Khobar, Dhahran, Taif, Tabuk, Abha, Khamis Mushait, Najran, Jazan, Hail, Jubail, Yanbu, Al-Ahsa, Qatif, Buraidah, Unaizah

### Common Arabic Medical Terms
The system recognizes and normalizes common Arabic medical terms including:
- سكري (diabetes)
- ضغط (hypertension)
- قلب (heart)
- كلى (kidney)
- And many more...

## Error Handling

All endpoints return consistent error responses:
```json
{
  "error": "Error message description"
}
```

## Authentication

All endpoints require authentication. Include JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Rate Limiting

Gemini API has rate limits. Consider implementing caching for frequently processed documents.

## Best Practices

1. **Batch Processing**: Use batch processing for multiple documents
2. **Caching**: Cache results for identical text inputs
3. **Error Handling**: Always handle API errors gracefully
4. **Validation**: Validate extracted data before storing
5. **Privacy**: Ensure PHI/PII is handled according to regulations
