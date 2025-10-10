# Excel Export Feature - Comprehensive Guide

## Overview

The Excel export functionality provides comprehensive visitor data export with Saudi-specific formatting, multiple sheets, analytics, and automated scheduling.

## Features

### ✅ Implemented Features

1. **One-Click Export**
   - Admin panel integration
   - Real-time data fetching from PostgreSQL
   - Multiple export formats (standard, streaming)

2. **Multi-Sheet Excel Generation**
   - **Sheet 1 - Visitors**: Detailed visitor information
   - **Sheet 2 - Analytics**: Statistical analysis and metrics
   - **Sheet 3 - Timeline**: Temporal trends and patterns

3. **Saudi-Specific Formatting**
   - Bilingual headers (Arabic/English)
   - Saudi date format (dd/mm/yyyy)
   - Saudi Arabia timezone (Asia/Riyadh)
   - Right-to-left text support
   - Currency in SAR (ready for future implementation)

4. **Advanced Excel Features**
   - Auto-filters on all data sheets
   - Conditional formatting (status colors)
   - Professional styling and borders
   - Column width optimization
   - Number formatting

5. **Scheduled Exports**
   - Daily automated exports
   - Configurable schedule (default: 2 AM Saudi time)
   - Automatic cleanup of old exports
   - Retention policy (default: 30 days)

6. **Cloud Storage Integration**
   - Local storage (default)
   - AWS S3 support (ready to configure)
   - Azure Blob Storage (ready to configure)
   - Google Cloud Storage (ready to configure)

7. **Performance Optimization**
   - Streaming support for large datasets
   - Chunked data processing
   - Memory-efficient operations

## API Endpoints

### 1. Export Visitors (Comprehensive)

```http
GET /api/visitors/export
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `startDate` (optional): Start date for filtering (ISO 8601)
- `endDate` (optional): End date for filtering (ISO 8601)
- `includeInactive` (optional): Include inactive visitors (boolean)
- `stream` (optional): Use streaming for large datasets (boolean)

**Response:**
- Excel file download (.xlsx)
- Filename format: `visitor-export-YYYY-MM-DD.xlsx`

**Example:**
```bash
curl -X GET "http://localhost:5000/api/visitors/export?startDate=2025-01-01&endDate=2025-01-31" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  --output visitors.xlsx
```

### 2. Export Date Range

```http
POST /api/visitors/export/date-range
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "startDate": "2025-01-01",
  "endDate": "2025-01-31"
}
```

**Response:**
- Excel file download
- Saved to exports directory

### 3. List Available Exports

```http
GET /api/visitors/exports/list
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "exports": [
    {
      "filename": "visitor-export-2025-01-10.xlsx",
      "size": 245678,
      "date": "2025-01-10T02:00:00.000Z"
    }
  ]
}
```

### 4. Download Specific Export

```http
GET /api/visitors/exports/:filename
Authorization: Bearer <admin_token>
```

**Example:**
```bash
curl -X GET "http://localhost:5000/api/visitors/exports/visitor-export-2025-01-10.xlsx" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  --output export.xlsx
```

### 5. Get Analytics

```http
GET /api/visitors/analytics
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "total_visitors": 1250,
  "active_last_week": 450,
  "active_last_month": 890,
  "avg_activity_count": 12.5,
  "arabic_users": 800,
  "english_users": 450
}
```

### 6. Get Detailed Analytics

```http
GET /api/visitors/analytics/detailed?startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer <admin_token>
```

## Excel Sheet Structure

### Sheet 1: الزوار - Visitors

| Column | Arabic | English | Format |
|--------|--------|---------|--------|
| A | البريد الإلكتروني | Email | Text |
| B | تاريخ التسجيل | Registration Date | dd/mm/yyyy hh:mm |
| C | آخر نشاط | Last Activity | dd/mm/yyyy hh:mm |
| D | المدينة | City | Text |
| E | المنطقة | Region | Text |
| F | عدد الزيارات | Visit Count | Number |
| G | عمليات البحث | Searches | Number |
| H | المستندات | Documents | Number |
| I | اللغة | Language | Text (العربية/English) |
| J | الإشعارات | Notifications | Text (مفعل/معطل) |
| K | نوع الجهاز | Device Type | Text |
| L | الحالة | Status | Text (نشط/غير نشط) |

**Features:**
- Auto-filters enabled
- Conditional formatting (green for active, red for inactive)
- Borders on all cells
- Bold header with blue background

### Sheet 2: التحليلات - Analytics

**Summary Statistics:**
- Total visitors
- Active visitors
- Active last week/month
- Average activity count
- Language distribution
- Notification preferences

**Geographic Distribution:**
- Top 20 regions and cities
- Visitor count per location

**Device Types:**
- Device type breakdown
- Count per device type
- Pie chart visualization (ready)

### Sheet 3: الجدول الزمني - Timeline

**Daily Trends (Last 90 Days):**
- Date
- New registrations
- Active registrations
- Percentage active

**Weekly Trends (Last 6 Months):**
- Week start date
- Total registrations
- Average activity

**Monthly Trends (Last 12 Months):**
- Month
- Total registrations
- Average activity
- Active days

**Peak Usage Times:**
- Hourly activity distribution
- Activity count per hour
- Percentage of total activity

## Configuration

### Environment Variables

Add to your `.env` file:

```env
# Excel Export Configuration
ENABLE_SCHEDULED_EXPORTS=true
EXPORT_SCHEDULE_HOUR=2
EXPORT_SCHEDULE_MINUTE=0
EXPORT_DIR=./exports
EXPORT_RETENTION_DAYS=30

# Cloud Storage (Optional)
CLOUD_STORAGE_PROVIDER=local
CLOUD_STORAGE_BUCKET=
CLOUD_STORAGE_PATH=exports
CLOUD_STORAGE_REGION=me-south-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

### Scheduled Exports

The system automatically exports visitor data daily at the configured time (default: 2 AM Saudi Arabia time).

**To enable:**
```env
ENABLE_SCHEDULED_EXPORTS=true
```

**To customize schedule:**
```env
EXPORT_SCHEDULE_HOUR=3
EXPORT_SCHEDULE_MINUTE=30
```

### Cloud Storage Setup

#### AWS S3

1. Install AWS SDK:
```bash
npm install @aws-sdk/client-s3
```

2. Configure environment:
```env
CLOUD_STORAGE_PROVIDER=s3
CLOUD_STORAGE_BUCKET=your-bucket-name
CLOUD_STORAGE_PATH=exports
CLOUD_STORAGE_REGION=me-south-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

3. Uncomment S3 upload code in `scheduledExportService.ts`

#### Azure Blob Storage

1. Install Azure SDK:
```bash
npm install @azure/storage-blob
```

2. Configure environment:
```env
CLOUD_STORAGE_PROVIDER=azure
CLOUD_STORAGE_BUCKET=your-container-name
AZURE_STORAGE_CONNECTION_STRING=your-connection-string
```

#### Google Cloud Storage

1. Install GCS SDK:
```bash
npm install @google-cloud/storage
```

2. Configure environment:
```env
CLOUD_STORAGE_PROVIDER=gcs
CLOUD_STORAGE_BUCKET=your-bucket-name
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
```

## Usage Examples

### Frontend Integration (React)

```typescript
// Export button component
const ExportButton = () => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/visitors/export', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `visitors-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleExport} disabled={loading}>
      {loading ? 'Exporting...' : 'Export to Excel'}
    </button>
  );
};
```

### Date Range Export

```typescript
const exportDateRange = async (startDate: Date, endDate: Date) => {
  const response = await fetch('/api/visitors/export/date-range', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    })
  });

  const blob = await response.blob();
  // Handle download...
};
```

### List and Download Previous Exports

```typescript
const listExports = async () => {
  const response = await fetch('/api/visitors/exports/list', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const { exports } = await response.json();
  return exports;
};

const downloadExport = async (filename: string) => {
  const response = await fetch(`/api/visitors/exports/${filename}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const blob = await response.blob();
  // Handle download...
};
```

## Database Schema Updates

The visitor metadata now supports additional fields:

```sql
-- Visitor metadata structure
{
  "language": "ar" | "en",
  "device_type": "mobile" | "desktop" | "tablet",
  "city": "Riyadh",
  "region": "Riyadh Region",
  "notifications_enabled": "true" | "false",
  "user_agent": "...",
  "ip_address": "..."
}
```

## Performance Considerations

### Standard Export
- Suitable for up to 10,000 records
- Loads all data into memory
- Generates complete workbook

### Streaming Export
- Recommended for 10,000+ records
- Processes data in chunks (1,000 records)
- Memory-efficient
- Use `?stream=true` query parameter

```bash
curl -X GET "http://localhost:5000/api/visitors/export?stream=true" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  --output visitors.xlsx
```

## Security

- **Authentication Required**: All export endpoints require admin authentication
- **Authorization**: Only users with 'admin' role can access exports
- **Rate Limiting**: Standard rate limits apply
- **Audit Logging**: All export operations are logged
- **Data Encryption**: Visitor emails are encrypted in database

## Monitoring

Check logs for export operations:

```bash
# View export logs
tail -f backend/logs/combined.log | grep "export"

# Check scheduled export status
tail -f backend/logs/combined.log | grep "Scheduled export"
```

## Troubleshooting

### Export fails with large datasets
- Use streaming mode: `?stream=true`
- Increase Node.js memory: `NODE_OPTIONS=--max-old-space-size=4096`

### Scheduled exports not running
- Check `ENABLE_SCHEDULED_EXPORTS=true` in .env
- Verify server logs for scheduling confirmation
- Check timezone configuration

### Cloud upload fails
- Verify credentials in .env
- Check bucket/container permissions
- Review cloud provider logs

### Missing data in export
- Verify date range parameters
- Check `includeInactive` parameter
- Ensure database has data for the period

## Future Enhancements

- [ ] Chart generation in Excel (pie charts, line graphs)
- [ ] Pivot tables for advanced analysis
- [ ] PDF export option
- [ ] Email delivery of scheduled exports
- [ ] Custom column selection
- [ ] Export templates
- [ ] Multi-language support for all text
- [ ] Real-time export progress tracking
- [ ] Compression for large files
- [ ] Export scheduling UI in admin panel

## Support

For issues or questions:
1. Check logs: `backend/logs/combined.log`
2. Review this documentation
3. Check API endpoint responses
4. Verify environment configuration

## License

Part of the Medical Document Management System
