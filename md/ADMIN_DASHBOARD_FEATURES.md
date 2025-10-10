# Admin Dashboard Features Guide

## 🎯 Quick Access

```
Main Dashboard:     http://localhost:3000/admin
Visitors:          http://localhost:3000/admin/visitors
Documents:         http://localhost:3000/admin/documents
Analytics:         http://localhost:3000/admin/analytics
Settings:          http://localhost:3000/admin/settings
```

## 📊 Dashboard Overview Features

### Real-Time Metrics (Auto-refresh every 30s)
```
┌─────────────────────────────────────────────────────────┐
│  🔴 LIVE    Active: 12  |  Processing: 3  |  Avg: 45s  │
└─────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Total        │ Active       │ Documents    │ Errors       │
│ Visitors     │ Today        │ Processed    │ Today        │
│              │              │              │              │
│   1,234      │    156       │    892       │     3        │
│   👥         │    📈        │    📄        │    ⚠️        │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### Trend Charts (30 Days)
```
Visitor Registrations          Document Uploads
     ▁▂▃▅▇█▇▅▃▂▁                  ▁▃▅▇█▇▅▃▁
```

### Processing Queue
```
┌─────────────────────────────────────────────────────┐
│ Processing Queue                          3 items   │
├─────────────────────────────────────────────────────┤
│ 🔄 report.pdf          user@email.com    Wait: 2m   │
│ 🔄 scan.jpg            user2@email.com   Wait: 5m   │
│ ⏳ document.docx       user3@email.com   Wait: 1m   │
└─────────────────────────────────────────────────────┘
```

## 👥 Visitor Management Features

### Visitor Table with Bulk Actions
```
┌─────────────────────────────────────────────────────────────┐
│ 🔍 Search visitors...              [Export] [Email Selected]│
├─────────────────────────────────────────────────────────────┤
│ ☑ Email              Registration  Activity  Status         │
├─────────────────────────────────────────────────────────────┤
│ ☑ user1@email.com    2025-01-01    45       🟢 Active      │
│ ☐ user2@email.com    2025-01-02    23       🟢 Active      │
│ ☐ user3@email.com    2024-12-28    12       ⚪ Inactive    │
└─────────────────────────────────────────────────────────────┘
```

### Registration Timeline
```
Registrations (30 Days)
  50│                                    ██
  40│                          ██        ██
  30│              ██          ██        ██
  20│      ██      ██    ██    ██        ██
  10│  ██  ██  ██  ██    ██    ██    ██  ██
   0└──────────────────────────────────────
     Jan 1                            Jan 30
```

### Geographic Distribution
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Riyadh       │ Jeddah       │ Dammam       │ Mecca        │
│   245        │   189        │   156        │   134        │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### Engagement Scores
```
Top Engaged Visitors
┌─────────────────────────────────────────────────────────┐
│ user1@email.com    [HIGH]     85 activities  2 days ago │
│ user2@email.com    [HIGH]     67 activities  1 day ago  │
│ user3@email.com    [MEDIUM]   34 activities  3 days ago │
│ user4@email.com    [MEDIUM]   28 activities  5 days ago │
│ user5@email.com    [LOW]      15 activities  7 days ago │
└─────────────────────────────────────────────────────────┘
```

## 📄 Document Management Features

### Success Rate Dashboard
```
┌──────────────┬──────────────┬──────────────┐
│ Success Rate │ In Queue     │ Failed       │
│              │              │              │
│   94.5%      │     3        │     12       │
│   ✅         │     ⏳       │     ❌       │
└──────────────┴──────────────┴──────────────┘
```

### Processing Statistics (7 Days)
```
Successful Processing          Failed Processing
  100│  ██                        10│
   80│  ██  ██                     8│      ▄
   60│  ██  ██  ██                 6│  ▄   █
   40│  ██  ██  ██  ██             4│  █   █   ▄
   20│  ██  ██  ██  ██  ██         2│  █   █   █
    0└──────────────────────        0└──────────────
```

### Failed Documents List
```
┌─────────────────────────────────────────────────────────┐
│ Failed Documents                                        │
├─────────────────────────────────────────────────────────┤
│ ❌ corrupted.pdf                                        │
│    user@email.com • 2025-01-10 10:30                   │
│    Error: File format not supported                    │
├─────────────────────────────────────────────────────────┤
│ ❌ large_file.docx                                      │
│    user2@email.com • 2025-01-10 09:15                  │
│    Error: File size exceeds limit                      │
└─────────────────────────────────────────────────────────┘
```

## 📈 Analytics Features

### Multi-Metric Trends
```
┌─────────────────┬─────────────────┬─────────────────┐
│ Visitor Trends  │ Document Upload │ Search Activity │
│      ▁▃▅▇█      │      ▁▂▄▆█      │      ▂▄▆█▆      │
└─────────────────┴─────────────────┴─────────────────┘
```

### Hourly Usage Patterns
```
Activity by Hour
  100│                    ██
   80│              ██    ██    ██
   60│        ██    ██    ██    ██
   40│  ██    ██    ██    ██    ██    ██
   20│  ██    ██    ██    ██    ██    ██
    0└────────────────────────────────────
     0  2  4  6  8  10 12 14 16 18 20 22
```

### Device Distribution
```
┌─────────────────────────────────────────────────────┐
│ Device Distribution                                 │
├─────────────────────────────────────────────────────┤
│ Mobile      ████████████████████████ 60% (720)     │
│ Desktop     ████████████████ 40% (480)             │
│ Tablet      ████ 10% (120)                         │
└─────────────────────────────────────────────────────┘
```

### Language Distribution
```
┌─────────────────────────────────────────────────────┐
│ Language Distribution                               │
├─────────────────────────────────────────────────────┤
│ AR (Arabic)  ████████████████████████ 65% (780)    │
│ EN (English) ████████████████ 35% (420)            │
└─────────────────────────────────────────────────────┘
```

### AI-Powered Insights
```
┌──────────────────────────────────────────────────────┐
│ 🤖 AI-Powered Insights                               │
├──────────────────────────────────────────────────────┤
│ Peak Usage Time:        14:00 (2 PM)                │
│ Growth Rate:            +23.5%                       │
│ Predicted Next Week:    +15% increase                │
│ Recommendation:         Scale resources for peak     │
└──────────────────────────────────────────────────────┘
```

## ⚙️ Settings Features

### Configuration Panels
```
┌─────────────────────────────────────────────────────┐
│ 🔑 API Settings                                     │
├─────────────────────────────────────────────────────┤
│ Gemini API Key:  [••••••••••••••••••••]  [Save]    │
│ API Timeout:     [30000]                 [Save]    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 📧 Email Settings                                   │
├─────────────────────────────────────────────────────┤
│ SMTP Host:       [smtp.gmail.com]       [Save]    │
│ SMTP Port:       [587]                   [Save]    │
│ SMTP User:       [admin@example.com]     [Save]    │
│ SMTP Password:   [••••••••••]            [Save]    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 🛡️ Security Settings                                │
├─────────────────────────────────────────────────────┤
│ Guest Rate Limit:  [10]                  [Save]    │
│ Auth Rate Limit:   [100]                 [Save]    │
│ Enable 2FA:        [✓]                   [Save]    │
└─────────────────────────────────────────────────────┘
```

### Quick Actions
```
┌──────────────────────────────────────────────────────┐
│ Quick Actions                                        │
├──────────────────────────────────────────────────────┤
│ [Test Email Config]  [Test Gemini API]              │
│ [Clear Cache]        [Reset to Defaults]            │
└──────────────────────────────────────────────────────┘
```

### System Information
```
┌──────────────────────────────────────────────────────┐
│ System Information                                   │
├──────────────────────────────────────────────────────┤
│ Node Version:    v20.10.0                           │
│ Environment:     production                          │
│ Platform:        linux                               │
│ Uptime:          5h 23m                             │
└──────────────────────────────────────────────────────┘
```

## 🎯 Key Actions

### Visitor Management Actions
- ✅ Search and filter visitors
- ✅ Sort by any column
- ✅ Select multiple visitors
- ✅ Export to Excel (one-click)
- ✅ Send bulk emails
- ✅ View engagement scores
- ✅ Filter by date range
- ✅ View geographic distribution

### Document Management Actions
- ✅ Monitor processing queue
- ✅ View success rates
- ✅ Investigate failed documents
- ✅ Track processing times
- ✅ View error messages
- ✅ Auto-refresh status

### Analytics Actions
- ✅ View trend analysis
- ✅ Analyze usage patterns
- ✅ Check device distribution
- ✅ Review language preferences
- ✅ Get AI insights
- ✅ Export reports
- ✅ Customize time ranges

### Settings Actions
- ✅ Update API keys
- ✅ Configure email
- ✅ Adjust security settings
- ✅ Test configurations
- ✅ Clear cache
- ✅ Reset defaults
- ✅ View system info

## 🔔 Real-Time Features

### Live Updates
```
🔴 LIVE UPDATES ACTIVE
├─ Dashboard metrics: Every 30s
├─ Document queue: Every 30s
├─- Realtime stats: Every 30s
└─ System alerts: Instant
```

### Notifications
```
┌──────────────────────────────────────────────────────┐
│ 🔔 System Alerts                                     │
├──────────────────────────────────────────────────────┤
│ ⚠️  High error rate detected (5% in last hour)      │
│ ✅  Backup completed successfully                    │
│ 📊  Daily report generated                           │
└──────────────────────────────────────────────────────┘
```

## 📱 Responsive Design

### Desktop View
```
┌─────────────────────────────────────────────────────┐
│ [Sidebar]  │  [Main Content Area]                   │
│            │                                         │
│ Overview   │  ┌─────────┬─────────┬─────────┐      │
│ Visitors   │  │ Metric  │ Metric  │ Metric  │      │
│ Documents  │  └─────────┴─────────┴─────────┘      │
│ Analytics  │                                         │
│ Settings   │  [Charts and Tables]                   │
└─────────────────────────────────────────────────────┘
```

### Mobile View
```
┌──────────────────┐
│ [☰ Menu]         │
├──────────────────┤
│ ┌──────────────┐ │
│ │   Metric     │ │
│ └──────────────┘ │
│ ┌──────────────┐ │
│ │   Metric     │ │
│ └──────────────┘ │
│ ┌──────────────┐ │
│ │   Chart      │ │
│ └──────────────┘ │
└──────────────────┘
```

## 🎨 Color Coding

### Status Colors
- 🟢 Green: Active, Success, Healthy
- 🟡 Yellow: Warning, Pending, Medium
- 🔴 Red: Error, Failed, Critical
- ⚪ Gray: Inactive, Neutral, Unknown
- 🔵 Blue: Info, Processing, Primary

### Engagement Levels
- 🟢 HIGH: 50+ activities
- 🟡 MEDIUM: 20-50 activities
- ⚪ LOW: <20 activities

## 🚀 Performance Indicators

### Loading States
```
⏳ Loading...
🔄 Processing...
✅ Complete
❌ Failed
```

### Progress Bars
```
Processing: ████████████████░░░░ 80%
Success Rate: ████████████████████ 95%
```

## 📊 Export Formats

### Excel Export Structure
```
Sheet 1: Visitor Summary
├─ Email
├─ Registration Date
├─ Last Activity
├─ Activity Count
├─ Status
└─ Metadata

Sheet 2: Activity Details
├─ Visitor Email
├─ Activity Type
├─ Timestamp
└─ Details

Sheet 3: Geographic Data
├─ Region
├─ City
└─ Count
```

## 🎯 Quick Tips

1. **Real-time Monitoring**: Dashboard auto-refreshes every 30s
2. **Bulk Actions**: Select multiple visitors for batch operations
3. **Excel Export**: One-click export with comprehensive data
4. **Date Filtering**: Use date range for targeted analysis
5. **Engagement Scores**: Identify your most active users
6. **Error Tracking**: Monitor failed documents with error details
7. **Usage Patterns**: Identify peak hours for resource planning
8. **Device Analytics**: Optimize for your users' devices
9. **Quick Settings**: Test configurations before saving
10. **System Health**: Monitor uptime and performance

---

**Ready to use!** Access at: `http://localhost:3000/admin`
