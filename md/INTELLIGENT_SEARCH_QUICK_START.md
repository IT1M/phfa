# Intelligent Medical Search - Quick Start Guide

## 🚀 Quick Setup

### 1. Prerequisites
- Backend server running on `http://localhost:5000`
- Gemini API key configured in `.env`
- Database with indexed documents

### 2. Test the System

```bash
# Navigate to backend
cd backend

# Run test script
npx ts-node test-intelligent-search.ts
```

## 📝 Basic Usage

### Simple Search

```typescript
// POST /api/intelligent-search
const response = await fetch('http://localhost:5000/api/intelligent-search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    query: 'مرضى السكري فوق 50 سنة',
    page: 1,
    pageSize: 20
  })
});

const { data } = await response.json();
console.log(`Found ${data.total} results`);
```

## 🎯 Query Examples

### Arabic Queries
```
مرضى السكري فوق 50 سنة في الرياض
نساء تحت 40 سنة مع تاريخ سرطان الثدي
مرضى حساسية البنسلين
حالات طوارئ قلبية في جدة
```

### English Queries
```
Cardiac patients with diabetes in Jeddah
Women under 40 with breast cancer history
Patients allergic to penicillin
Emergency cases last week
```

### Mixed Language
```
مرضى diabetes في الرياض
Patients with سكري and hypertension
```

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/intelligent-search` | POST | Main search |
| `/api/intelligent-search/suggestions` | GET | Get suggestions |
| `/api/intelligent-search/similar-patients` | POST | Find similar |
| `/api/intelligent-search/bulk` | POST | Bulk search |
| `/api/intelligent-search/analytics` | GET | Get analytics |
| `/api/intelligent-search/parse-query` | POST | Parse query |
| `/api/intelligent-search/translate` | POST | Translate text |
| `/api/intelligent-search/normalize-terms` | POST | Normalize terms |
| `/api/intelligent-search/extract-icd10` | POST | Extract ICD-10 |

## 🎨 Frontend Component

```tsx
import IntelligentSearch from '@/components/search/IntelligentSearch';

function SearchPage() {
  return (
    <div className="container">
      <IntelligentSearch />
    </div>
  );
}
```

## 🔍 Search Features

### Supported Filters
- ✅ Medical conditions (diabetes, hypertension, cancer, etc.)
- ✅ Age ranges (e.g., "فوق 50 سنة", "under 40")
- ✅ Date ranges (e.g., "last month", "الشهر الماضي")
- ✅ Medications (e.g., "metformin", "insulin")
- ✅ Locations (Saudi cities: Riyadh, Jeddah, Mecca, etc.)
- ✅ Gender (male, female)
- ✅ Urgency levels (low, medium, high, critical)

### Result Ranking
Results are ranked by:
1. Text relevance (full-text search score)
2. Patient information completeness
3. Medical entity matches
4. Contextual relevance

## 📊 Response Format

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "documentId": "uuid",
        "patientName": "أحمد محمد",
        "patientId": "P12345",
        "relevanceScore": 8.5,
        "matchedConditions": ["diabetes"],
        "matchedMedications": ["metformin"],
        "snippet": "...relevant text...",
        "highlights": ["diabetes", "50 years"],
        "metadata": {...},
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 45,
    "page": 1,
    "pageSize": 20,
    "totalPages": 3,
    "executionTime": 234,
    "query": "مرضى السكري فوق 50 سنة",
    "filters": {
      "conditions": ["diabetes"],
      "ageRange": {"min": 50},
      "locations": ["Riyadh"]
    }
  }
}
```

## 🧪 Testing Commands

```bash
# Test basic search
curl -X POST http://localhost:5000/api/intelligent-search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"query": "مرضى السكري"}'

# Test query parsing
curl -X POST http://localhost:5000/api/intelligent-search/parse-query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"query": "مرضى السكري فوق 50 سنة"}'

# Get suggestions
curl -X GET http://localhost:5000/api/intelligent-search/suggestions \
  -H "Authorization: Bearer YOUR_TOKEN"

# Translate text
curl -X POST http://localhost:5000/api/intelligent-search/translate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"text": "مريض يعاني من السكري", "targetLang": "en"}'
```

## ⚡ Performance Tips

1. **Use pagination** - Don't load all results at once
2. **Cache suggestions** - Store recent searches locally
3. **Debounce input** - Wait for user to finish typing
4. **Index optimization** - Ensure database indexes are created

## 🐛 Troubleshooting

### No results found?
- Check if documents are indexed
- Verify medical entities are extracted
- Try simpler queries

### Slow performance?
- Check database indexes
- Monitor Gemini API response time
- Consider caching parsed queries

### Incorrect parsing?
- Review query structure
- Add more context to query
- Use example queries as reference

## 📚 Additional Resources

- Full documentation: `INTELLIGENT_SEARCH_GUIDE.md`
- API reference: See guide for detailed endpoint docs
- Test script: `backend/test-intelligent-search.ts`

## 🔐 Security Notes

- All endpoints require authentication
- Rate limiting: 100 requests per 15 minutes
- User can only search their own documents
- Search queries are logged for analytics

## 💡 Pro Tips

1. **Be specific** - More details = better results
2. **Use medical terms** - System understands medical terminology
3. **Mix languages** - Arabic and English work together
4. **Save searches** - Use suggestions for quick access
5. **Explore similar** - Find related patients easily

---

**Need help?** Check the full guide or contact the development team.
