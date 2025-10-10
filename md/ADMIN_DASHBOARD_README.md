# Admin Dashboard Documentation

## Overview

Comprehensive admin dashboard for system management with real-time monitoring, visitor analytics, document processing tracking, and system configuration.

## Features

### 1. Dashboard Overview (`/admin`)
- **Real-time Metrics**: Live system stats updated every 30 seconds
- **Active Users**: Current active users in the last 5 minutes
- **Processing Status**: Documents in queue and processing
- **Error Tracking**: Recent system errors and alerts
- **Trend Charts**: 30-day visitor and document trends
- **Quick Stats**: Processing times, success rates, activity metrics

### 2. Visitor Management (`/admin/visitors`)
- **Visitor Table**: Sortable, searchable table with all visitors
- **Bulk Operations**: 
  - Select multiple visitors for export
  - Send bulk emails to selected visitors
  - Export to Excel with one click
- **Timeline Chart**: Registration trends over 30 days
- **Geographic Distribution**: Visitor locations by city/region
- **Engagement Scoring**: 
  - High: 50+ activities
  - Medium: 20-50 activities
  - Low: <20 activities
- **Date Range Filtering**: Filter visitors by registration date
- **Pagination**: Navigate through large visitor lists

### 3. Document Management (`/admin/documents`)
- **Processing Queue**: Real-time view of documents being processed
- **Success Rate**: Overall processing success percentage
- **Failed Documents**: List of failed processing attempts with error messages
- **Processing Stats**: 7-day charts showing successful vs failed processing
- **Wait Time Tracking**: How long documents have been in queue
- **Auto-refresh**: Updates every 30 seconds

### 4. Analytics (`/admin/analytics`)
- **Trend Analysis**: Visitors, documents, and searches over time
- **Usage Patterns**: Hourly activity heatmap showing peak usage times
- **Device Distribution**: Breakdown by device type (mobile, desktop, tablet)
- **Language Distribution**: User language preferences
- **AI-Powered Insights**:
  - Peak usage time identification
  - Growth rate calculations
  - Predictive analytics
- **Customizable Time Range**: 7, 30, or 90 days

### 5. Settings (`/admin/settings`)
- **API Configuration**: Gemini API keys and settings
- **Email Settings**: SMTP configuration for notifications
- **Security Settings**: Rate limits, encryption keys
- **Quick Actions**:
  - Test email configuration
  - Test Gemini API
  - Clear cache
  - Reset to defaults
- **System Information**: Node version, environment, uptime

## API Endpoints

### Dashboard
```
GET /api/admin/dashboard/metrics       - Get all dashboard metrics
GET /api/admin/dashboard/realtime      - Get real-time stats
```

### Visitors
```
GET /api/admin/visitors                - List visitors (paginated)
GET /api/admin/visitors/timeline       - Registration timeline
GET /api/admin/visitors/geographic     - Geographic distribution
GET /api/admin/visitors/engagement     - Engagement scores
POST /api/admin/visitors/bulk-email    - Send bulk emails
POST /api/admin/visitors/export        - Export visitor data
```

### Documents
```
GET /api/admin/documents/queue         - Processing queue
GET /api/admin/documents/stats         - Processing statistics
GET /api/admin/documents/failed        - Failed documents
```

### Analytics
```
GET /api/admin/analytics/trends        - Trend analysis
GET /api/admin/analytics/usage-patterns - Hourly usage patterns
GET /api/admin/analytics/devices       - Device analytics
GET /api/admin/analytics/languages     - Language distribution
```

### Settings
```
GET /api/admin/settings                - Get all settings
PUT /api/admin/settings/:key           - Update setting
```

## Database Schema

### system_config
```sql
CREATE TABLE system_config (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### system_logs
```sql
CREATE TABLE system_logs (
  id SERIAL PRIMARY KEY,
  level VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### search_logs
```sql
CREATE TABLE search_logs (
  id SERIAL PRIMARY KEY,
  visitor_id INTEGER REFERENCES visitors(id),
  query TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Setup Instructions

### 1. Run Database Migration
```bash
cd backend
npm run migrate
```

### 2. Start Backend Server
```bash
cd backend
npm run dev
```

### 3. Start Frontend
```bash
npm run dev
```

### 4. Access Admin Dashboard
Navigate to: `http://localhost:3000/admin`

## Authentication

All admin routes require authentication with admin role:
- Middleware: `authenticate` + `authorize('admin')`
- JWT token must be included in Authorization header
- Role must be 'admin' in user claims

## Real-time Updates

The dashboard uses polling for real-time updates:
- Dashboard metrics: Every 30 seconds
- Document queue: Every 30 seconds
- Realtime stats: Every 30 seconds

For WebSocket support (optional):
```typescript
// Install socket.io-client
npm install socket.io-client

// Connect to WebSocket
import io from 'socket.io-client';
const socket = io('http://localhost:5000');

socket.on('metrics:update', (data) => {
  // Update metrics
});
```

## Excel Export Features

### Visitor Export
- Comprehensive visitor data with metadata
- Activity history and engagement metrics
- Geographic information
- Device and language preferences
- Formatted with Saudi Arabia date format
- Streaming support for large datasets

### Export Endpoints
```
GET /api/visitors/export               - Export all visitors
GET /api/visitors/export?stream=true   - Stream export
POST /api/visitors/export/date-range   - Export date range
GET /api/visitors/exports/list         - List available exports
GET /api/visitors/exports/:filename    - Download export file
```

## Performance Optimization

### Database Indexes
```sql
CREATE INDEX idx_system_logs_level ON system_logs(level);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);
CREATE INDEX idx_search_logs_created_at ON search_logs(created_at);
CREATE INDEX idx_visitors_registration_date ON visitors(registration_date);
CREATE INDEX idx_documents_status ON documents(status);
```

### Caching Strategy
- Metrics cached for 5 minutes
- Analytics cached for 15 minutes
- Settings cached until update

### Query Optimization
- Pagination for large datasets
- Indexed columns for sorting
- Aggregated queries for statistics
- Streaming for large exports

## Security Considerations

1. **Authentication**: All routes require admin authentication
2. **Rate Limiting**: Admin routes have higher rate limits
3. **Input Validation**: All inputs validated with Joi
4. **SQL Injection**: Parameterized queries only
5. **XSS Protection**: Sanitized outputs
6. **CORS**: Configured for specific origins
7. **Audit Logging**: All admin actions logged

## Monitoring & Alerts

### System Health Checks
- Database connectivity
- API availability
- Processing queue status
- Error rate monitoring
- Resource usage tracking

### Alert Thresholds
- Error rate > 5% in last hour
- Processing queue > 100 items
- Failed documents > 10 in last hour
- Database connection failures

## Customization

### Adding New Metrics
1. Add query to `AdminService`
2. Create API endpoint in `admin.ts`
3. Add component to dashboard
4. Update types if needed

### Adding New Charts
```typescript
<AnalyticsChart
  title="Your Chart Title"
  data={yourData}
  color="#your-color"
/>
```

### Custom Settings
Add to `system_config` table:
```sql
INSERT INTO system_config (key, value) 
VALUES ('your_setting', 'value');
```

## Troubleshooting

### Dashboard Not Loading
- Check backend server is running
- Verify authentication token
- Check browser console for errors
- Verify database connection

### Real-time Updates Not Working
- Check polling interval settings
- Verify API endpoints responding
- Check network tab for failed requests

### Export Failing
- Check disk space for exports
- Verify export directory permissions
- Check database query performance
- Try streaming export for large datasets

## Future Enhancements

- [ ] WebSocket real-time updates
- [ ] Advanced filtering and search
- [ ] Custom report builder
- [ ] Email campaign scheduler
- [ ] A/B testing dashboard
- [ ] Machine learning predictions
- [ ] Mobile app for monitoring
- [ ] Slack/Discord notifications
- [ ] Multi-tenant support
- [ ] Role-based access control

## Support

For issues or questions:
1. Check logs: `backend/logs/`
2. Review error messages in UI
3. Check database connectivity
4. Verify environment variables
5. Review API responses in Network tab
