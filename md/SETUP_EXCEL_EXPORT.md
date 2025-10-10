# Excel Export Setup Guide

## 📋 Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- Admin user account created
- Backend server configured

## 🚀 Installation Steps

### Step 1: Run Database Migration

```bash
cd backend
npm run migrate:export
```

Expected output:
```
🔄 Running visitor metadata migration...
✅ Migration completed successfully!
📊 Visitor metadata column is ready for Excel exports
✅ Verified: metadata column exists
   Type: jsonb
✅ Created 4 metadata indexes
   - idx_visitors_metadata_language
   - idx_visitors_metadata_region
   - idx_visitors_metadata_city
   - idx_visitors_metadata_device
```

### Step 2: Configure Environment

Add to `backend/.env`:

```env
# Excel Export Configuration
ENABLE_SCHEDULED_EXPORTS=true
EXPORT_SCHEDULE_HOUR=2
EXPORT_SCHEDULE_MINUTE=0
EXPORT_DIR=./exports
EXPORT_RETENTION_DAYS=30

# Cloud Storage (Optional - for production)
CLOUD_STORAGE_PROVIDER=local
CLOUD_STORAGE_BUCKET=
CLOUD_STORAGE_PATH=exports
CLOUD_STORAGE_REGION=me-south-1
```

### Step 3: Create Exports Directory

```bash
mkdir -p backend/exports
```

### Step 4: Restart Server

```bash
cd backend
npm run dev
```

Look for this message:
```
📅 Scheduled exports enabled at 2:0 (Saudi Arabia time)
```

### Step 5: Test Export Functionality

#### Get Admin Token
```bash
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your_password"}' \
  | jq -r '.token')
```

#### Test Export
```bash
curl -X GET "http://localhost:5000/api/visitors/export" \
  -H "Authorization: Bearer $TOKEN" \
  --output test-export.xlsx
```

#### Verify File
```bash
file test-export.xlsx
# Should output: test-export.xlsx: Microsoft Excel 2007+
```

#### Open in Excel
```bash
open test-export.xlsx  # macOS
# or
xdg-open test-export.xlsx  # Linux
# or just double-click on Windows
```

### Step 6: Verify Excel Content

The file should contain 3 sheets:

1. **الزوار - Visitors**
   - Bilingual headers (Arabic/English)
   - Visitor data with all fields
   - Auto-filters enabled
   - Conditional formatting on status

2. **التحليلات - Analytics**
   - Summary statistics
   - Geographic distribution
   - Device types breakdown

3. **الجدول الزمني - Timeline**
   - Daily/weekly/monthly trends
   - Peak usage times

### Step 7: Test API Endpoints

#### Get Analytics
```bash
curl -X GET "http://localhost:5000/api/visitors/analytics" \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:
```json
{
  "total_visitors": 150,
  "active_last_week": 45,
  "active_last_month": 89,
  "avg_activity_count": 12.5,
  "arabic_users": 80,
  "english_users": 70
}
```

#### List Available Exports
```bash
curl -X GET "http://localhost:5000/api/visitors/exports/list" \
  -H "Authorization: Bearer $TOKEN"
```

### Step 8: Add Frontend Component (Optional)

If you have a React frontend:

```bash
# Component is already created at:
# src/components/admin/VisitorExportPanel.tsx
```

Add to your admin page:
```tsx
import { VisitorExportPanel } from '@/components/admin/VisitorExportPanel';

export default function AdminPage() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <VisitorExportPanel />
    </div>
  );
}
```

## ✅ Verification Checklist

- [ ] Database migration completed successfully
- [ ] Environment variables configured
- [ ] Exports directory created
- [ ] Server shows scheduled export message
- [ ] Test export generates valid Excel file
- [ ] Excel file contains 3 sheets
- [ ] Headers are bilingual (Arabic/English)
- [ ] Dates formatted as dd/mm/yyyy
- [ ] Analytics endpoint returns data
- [ ] List exports endpoint works
- [ ] Frontend component displays (if applicable)

## 🧪 Run Tests

```bash
cd backend
npm run test:export
```

Expected: All tests pass ✅

## 📊 Test with Sample Data

If you need sample data for testing:

```sql
-- Insert sample visitors
INSERT INTO visitors (email, encrypted_email, metadata) VALUES
('visitor1@example.com', 'encrypted1', '{"language":"ar","device_type":"mobile","city":"Riyadh","region":"Riyadh Region","notifications_enabled":"true"}'),
('visitor2@example.com', 'encrypted2', '{"language":"en","device_type":"desktop","city":"Jeddah","region":"Makkah Region","notifications_enabled":"false"}'),
('visitor3@example.com', 'encrypted3', '{"language":"ar","device_type":"tablet","city":"Dammam","region":"Eastern Region","notifications_enabled":"true"}');

-- Insert sample search queries
INSERT INTO search_queries (visitor_id, query_text, query_type, result_count)
SELECT id, 'medical records', 'document', 5 FROM visitors LIMIT 1;

-- Insert sample documents
INSERT INTO documents (visitor_id, file_name, file_path, file_size, mime_type)
SELECT id, 'test.pdf', '/uploads/test.pdf', 1024, 'application/pdf' FROM visitors LIMIT 1;
```

Then test export again:
```bash
curl -X GET "http://localhost:5000/api/visitors/export" \
  -H "Authorization: Bearer $TOKEN" \
  --output sample-export.xlsx
```

## 🔧 Troubleshooting

### Issue: Migration fails

**Solution:**
```bash
# Check database connection
psql -h localhost -U postgres -d medical_documents -c "SELECT 1;"

# Check if table exists
psql -h localhost -U postgres -d medical_documents -c "\d visitors"

# Run migration manually
psql -h localhost -U postgres -d medical_documents -f backend/src/database/migrations/add_visitor_metadata.sql
```

### Issue: Export returns 401 Unauthorized

**Solution:**
- Verify admin token is valid
- Check user has admin role:
```sql
SELECT email, role FROM users WHERE email = 'admin@example.com';
```
- Update role if needed:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

### Issue: Export returns empty file

**Solution:**
- Check if visitors exist:
```sql
SELECT COUNT(*) FROM visitors;
```
- Check date range parameters
- Verify database connection in logs

### Issue: Scheduled export not running

**Solution:**
- Check environment variable:
```bash
grep ENABLE_SCHEDULED_EXPORTS backend/.env
```
- Check server logs:
```bash
tail -f backend/logs/combined.log | grep "Scheduled export"
```
- Verify timezone:
```bash
TZ=Asia/Riyadh date
```

### Issue: Excel file won't open

**Solution:**
- Verify file size:
```bash
ls -lh test-export.xlsx
```
- Check file type:
```bash
file test-export.xlsx
```
- Try streaming mode for large datasets:
```bash
curl -X GET "http://localhost:5000/api/visitors/export?stream=true" \
  -H "Authorization: Bearer $TOKEN" \
  --output stream-export.xlsx
```

## 🎯 Next Steps

### For Development
1. Test all export endpoints
2. Verify data accuracy
3. Test with large datasets
4. Check performance metrics

### For Production
1. Configure cloud storage (S3/Azure/GCS)
2. Set up monitoring and alerts
3. Configure backup retention
4. Test scheduled exports
5. Set up email notifications (optional)

### Cloud Storage Setup (Production)

#### AWS S3
```bash
npm install @aws-sdk/client-s3
```

Update `.env`:
```env
CLOUD_STORAGE_PROVIDER=s3
CLOUD_STORAGE_BUCKET=your-bucket-name
CLOUD_STORAGE_REGION=me-south-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

Uncomment S3 code in `backend/src/services/scheduledExportService.ts`

#### Azure Blob Storage
```bash
npm install @azure/storage-blob
```

Update `.env`:
```env
CLOUD_STORAGE_PROVIDER=azure
CLOUD_STORAGE_BUCKET=your-container
AZURE_STORAGE_CONNECTION_STRING=your-connection-string
```

#### Google Cloud Storage
```bash
npm install @google-cloud/storage
```

Update `.env`:
```env
CLOUD_STORAGE_PROVIDER=gcs
CLOUD_STORAGE_BUCKET=your-bucket
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
```

## 📚 Documentation

- **Complete Guide**: `backend/EXCEL_EXPORT_GUIDE.md`
- **Quick Start**: `backend/EXCEL_EXPORT_QUICK_START.md`
- **Implementation Summary**: `EXCEL_EXPORT_IMPLEMENTATION.md`
- **This Setup Guide**: `SETUP_EXCEL_EXPORT.md`

## 🎉 Success!

If all steps completed successfully, you now have:

✅ Fully functional Excel export system
✅ Saudi-specific formatting and localization
✅ Multiple sheets with comprehensive data
✅ Automated daily exports
✅ Cloud storage ready (optional)
✅ Admin panel integration
✅ Complete test coverage
✅ Production-ready code

## 📞 Support

For issues:
1. Check logs: `tail -f backend/logs/combined.log`
2. Review documentation in `backend/EXCEL_EXPORT_GUIDE.md`
3. Run tests: `npm run test:export`
4. Verify configuration: `backend/.env`

## 🚀 Ready to Use!

Your Excel export system is now fully configured and ready for production use!

Test it out:
```bash
curl -X GET "http://localhost:5000/api/visitors/export" \
  -H "Authorization: Bearer $TOKEN" \
  --output my-first-export.xlsx

open my-first-export.xlsx
```

Enjoy your comprehensive visitor data exports! 📊✨
