# Gemini API - Quick Reference Card

## 🔑 API Key
```
AIzaSyCV3Kb2rHMQoyAiYkrAFA82UlcGbYAAC0M
```

## 🚀 Quick Start
```bash
cd backend
npm install
npm run dev
npx ts-node test-gemini.ts
```

## 📡 Endpoints

### 1. Extract Entities
```bash
POST /api/gemini/extract-entities
Body: { "text": "medical text here" }
```

### 2. Parse Search Query
```bash
POST /api/gemini/parse-query
Body: { "query": "search query here" }
```

### 3. Summarize Document
```bash
POST /api/gemini/summarize
Body: { "text": "document text here" }
```

### 4. Translate Text
```bash
POST /api/gemini/translate
Body: { "text": "text to translate", "targetLang": "ar" }
```

### 5. Normalize Terms
```bash
POST /api/gemini/normalize-terms
Body: { "text": "text with medical terms" }
```

### 6. Extract ICD-10 Codes
```bash
POST /api/gemini/icd10-codes
Body: { "diagnoses": ["diagnosis1", "diagnosis2"] }
```

## 💻 Code Examples

### Backend
```typescript
import { geminiService } from './services/gemini.service';

// Extract entities
const entities = await geminiService.extractMedicalEntities(text);

// Parse query
const parsed = await geminiService.parseSearchQuery(query);

// Summarize
const summary = await geminiService.summarizeDocument(text);

// Translate
const translation = await geminiService.translateMedicalText(text, 'ar');
```

### Frontend
```typescript
import { geminiClient } from '@/lib/gemini-client';

const entities = await geminiClient.extractEntities(text);
const parsed = await geminiClient.parseQuery(query);
const summary = await geminiClient.summarize(text);
const translation = await geminiClient.translate(text, 'ar');
```

## 🧪 Test Examples

### Arabic Medical Text
```
المريض أحمد محمد، 45 سنة، ذكر
التشخيص: السكري من النوع الثاني
الأدوية: ميتفورمين 500mg مرتين يومياً
```

### Search Query
```
مرضى السكري في الرياض بين 40-60 سنة خلال الشهر الماضي
```

### English Medical Text
```
Patient presents with chest pain and shortness of breath.
ECG shows ST elevation. Diagnosed with acute MI.
Started on aspirin and clopidogrel.
```

## 🌍 Saudi Cities
Riyadh, Jeddah, Mecca, Medina, Dammam, Khobar, Dhahran, Taif, Tabuk, Abha, Khamis Mushait, Najran, Jazan, Hail, Jubail, Yanbu, Al-Ahsa, Qatif, Buraidah, Unaizah

## 🏥 Arabic Medical Terms
- سكري → diabetes
- ضغط → hypertension
- قلب → heart
- كلى → kidney
- كبد → liver
- رئة → lung
- معدة → stomach
- دم → blood
- سرطان → cancer
- التهاب → inflammation
- حمى → fever
- صداع → headache
- ألم → pain

## 📁 Key Files
- Service: `backend/src/services/gemini.service.ts`
- Routes: `backend/src/routes/gemini.ts`
- Helpers: `backend/src/utils/gemini-helper.ts`
- Client: `src/lib/gemini-client.ts`
- Test: `backend/test-gemini.ts`

## 🔧 Configuration
```env
# backend/.env
GEMINI_API_KEY=AIzaSyCV3Kb2rHMQoyAiYkrAFA82UlcGbYAAC0M
```

## 📚 Documentation
- Full Docs: `backend/GEMINI_INTEGRATION.md`
- Quick Start: `backend/README_GEMINI.md`
- Examples: `backend/src/examples/gemini-usage.ts`
- Checklist: `backend/INTEGRATION_CHECKLIST.md`

## ⚡ Common Tasks

### Process a Document
```typescript
import { processFullMedicalDocument } from './utils/gemini-helper';
const result = await processFullMedicalDocument(text);
```

### Enhance Search
```typescript
import { enhanceSearch } from './utils/gemini-helper';
const enhanced = await enhanceSearch(userQuery);
// Use enhanced.filters for database queries
```

### Batch Process
```typescript
import { batchProcessDocuments } from './utils/gemini-helper';
const results = await batchProcessDocuments(documents);
```

## 🐛 Troubleshooting

### API Key Not Working
1. Check `.env` file has correct key
2. Restart server after updating `.env`
3. Verify key in Google Cloud Console

### Authentication Errors
1. Include JWT token in Authorization header
2. Check token expiration
3. Verify user has proper permissions

### Rate Limiting
1. Implement caching
2. Add exponential backoff
3. Monitor usage in Google Cloud Console

## 📞 Quick Help
```bash
# Test integration
npx ts-node test-gemini.ts

# Check server logs
tail -f backend/logs/combined.log

# Verify dependencies
npm list @google/generative-ai
```

---
**Status**: ✅ Ready to use
**Version**: 1.0.0
**Last Updated**: 2025-10-10
