# Excel Export - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Environment Configuration

Add to `backend/.env`:

```env
# Enable scheduled exports
ENABLE_SCHEDULED_EXPORTS=true
EXPORT_SCHEDULE_HOUR=2
EXPORT_SCHEDULE_MINUTE=0
EXPORT_DIR=./exports
EXPORT_RETENTION_DAYS=30
```

### 2. Create Exports Directory

```bash
cd backend
mkdir exports
```

### 3. Restart Server

```bash
npm run dev
```

You should see:
```
📅 Scheduled exports enabled at 2:0 (Saudi Arabia time)
```

## 📊 Quick Export (API)

### Export All Visitors

```bash
curl -X GET "http://localhost:5000/api/visitors/export" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  --output visitors.xlsx
```

### Export with Date Range

```bash
curl -X GET "http://localhost:5000/api/visitors/export?startDate=2025-01-01&endDate=2025-01-31" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  --output visitors-january.xlsx
```

### Export with Streaming (Large Datasets)

```bash
curl -X GET "http://localhost:5000/api/visitors/export?stream=true" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  --output visitors-large.xlsx
```

## 🎨 Frontend Integration

### Add to Admin Panel

```tsx
import { VisitorExportPanel } from '@/components/admin/VisitorExportPanel';

// In your admin page
<VisitorExportPanel />
```

### Simple Export Button

```tsx
const ExportButton = () => {
  const handleExport = async () => {
    const response = await fetch('/api/visitors/export', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'visitors.xlsx';
    a.click();
  };

  return <button onClick={handleExport}>Export</button>;
};
```

## 📋 What You Get

### Excel File Structure

1. **Sheet 1: الزوار - Visitors**
   - Email, dates, location, activity metrics
   - Bilingual headers (Arabic/English)
   - Auto-filters and conditional formatting

2. **Sheet 2: التحليلات - Analytics**
   - Summary statistics
   - Geographic distribution
   - Device types breakdown

3. **Sheet 3: الجدول الزمني - Timeline**
   - Daily/weekly/monthly trends
   - Peak usage times
   - Activity patterns

## ⚙️ Configuration Options

### Schedule Different Time

```env
EXPORT_SCHEDULE_HOUR=3    # 3 AM
EXPORT_SCHEDULE_MINUTE=30 # 3:30 AM
```

### Change Retention Period

```env
EXPORT_RETENTION_DAYS=60  # Keep for 60 days
```

### Disable Scheduled Exports

```env
ENABLE_SCHEDULED_EXPORTS=false
```

## 🔐 Security

All export endpoints require:
- Authentication (Bearer token)
- Admin role authorization

## 📝 Testing

### Test Export Endpoint

```bash
# Get admin token first
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r '.token')

# Test export
curl -X GET "http://localhost:5000/api/visitors/export" \
  -H "Authorization: Bearer $TOKEN" \
  --output test-export.xlsx

# Verify file
file test-export.xlsx
```

### Test Analytics Endpoint

```bash
curl -X GET "http://localhost:5000/api/visitors/analytics" \
  -H "Authorization: Bearer $TOKEN"
```

## 🐛 Troubleshooting

### Export returns 401
- Check admin token is valid
- Verify user has admin role

### Export returns empty file
- Check database has visitor data
- Verify date range parameters

### Scheduled export not running
- Check `ENABLE_SCHEDULED_EXPORTS=true`
- Look for scheduling message in logs
- Verify server is running continuously

### Large dataset timeout
- Use streaming mode: `?stream=true`
- Increase timeout in nginx/proxy
- Consider date range filtering

## 📚 Full Documentation

See `EXCEL_EXPORT_GUIDE.md` for complete documentation.

## 🎯 Next Steps

1. ✅ Configure environment variables
2. ✅ Test export endpoint
3. ✅ Add to admin panel
4. ⬜ Configure cloud storage (optional)
5. ⬜ Set up monitoring
6. ⬜ Schedule automated backups

## 💡 Tips

- Use date range filtering for better performance
- Enable streaming for datasets > 10,000 records
- Schedule exports during low-traffic hours
- Monitor export directory size
- Set up cloud storage for backups

## 🆘 Support

Check logs for issues:
```bash
tail -f backend/logs/combined.log | grep export
```

Common log messages:
- `✅ Excel export generated successfully`
- `📅 Next export scheduled for: ...`
- `❌ Error generating Excel export: ...`
