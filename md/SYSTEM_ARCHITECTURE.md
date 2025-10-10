# 🏗️ System Architecture - Complete Excel Export System

## Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ADMIN PANEL (React)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   Export     │  │   Backup     │  │  Monitoring  │             │
│  │   Controls   │  │   Controls   │  │   Dashboard  │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      EXPRESS API SERVER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   /visitors  │  │   /backups   │  │  /monitoring │             │
│  │  (6 routes)  │  │  (7 routes)  │  │  (5 routes)  │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        SERVICE LAYER                                │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │ ExcelExport      │  │ CloudStorage     │  │ Monitoring      │  │
│  │ Service          │  │ Service          │  │ Service         │  │
│  │ - Generate       │  │ - S3 Upload      │  │ - Metrics       │  │
│  │ - Stream         │  │ - Azure Upload   │  │ - Health        │  │
│  │ - Format         │  │ - GCS Upload     │  │ - Reports       │  │
│  └──────────────────┘  └──────────────────┘  └─────────────────┘  │
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │ ScheduledExport  │  │ Backup           │  │ Visitor         │  │
│  │ Service          │  │ Service          │  │ Service         │  │
│  │ - Daily Export   │  │ - DB Backup      │  │ - Register      │  │
│  │ - Cleanup        │  │ - File Backup    │  │ - Track         │  │
│  │ - Cloud Upload   │  │ - Restore        │  │ - Analytics     │  │
│  └──────────────────┘  └──────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │   PostgreSQL     │  │  File System     │  │  Cloud Storage  │  │
│  │   Database       │  │  - exports/      │  │  - AWS S3       │  │
│  │   - visitors     │  │  - backups/      │  │  - Azure Blob   │  │
│  │   - users        │  │  - logs/         │  │  - Google GCS   │  │
│  │   - documents    │  │                  │  │                 │  │
│  │   - audit_logs   │  │                  │  │                 │  │
│  └──────────────────┘  └──────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Export Flow

```
┌─────────┐
│  Admin  │
│  Click  │
│ Export  │
└────┬────┘
     │
     ▼
┌─────────────────────┐
│ GET /api/visitors/  │
│      export         │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ ExcelExportService  │
│ - Fetch data        │
│ - Generate sheets   │
│ - Apply formatting  │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│   PostgreSQL        │
│   Query visitors    │
│   + related data    │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│  Generate Excel     │
│  - Sheet 1: Data    │
│  - Sheet 2: Stats   │
│  - Sheet 3: Trends  │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│  Save to ./exports  │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ CloudStorageService │
│ Upload to cloud     │
│ (if configured)     │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│  Download to User   │
└─────────────────────┘
```

### 2. Scheduled Export Flow

```
┌─────────────────────┐
│  2:00 AM Daily      │
│  (Saudi Time)       │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ ScheduledExport     │
│ Service Triggered   │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ Generate Export     │
│ (Previous day data) │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ Save to ./exports/  │
│ visitor-export-     │
│ YYYY-MM-DD.xlsx     │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ Upload to Cloud     │
│ (if enabled)        │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ Cleanup Old Files   │
│ (older than 30 days)│
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ Log Operation       │
│ to audit_logs       │
└─────────────────────┘
```

### 3. Backup Flow

```
┌─────────────────────┐
│  3:00 AM Daily      │
│  (Saudi Time)       │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│  BackupService      │
│  Triggered          │
└────┬────────────────┘
     │
     ├─────────────────┐
     │                 │
     ▼                 ▼
┌──────────┐    ┌──────────┐
│ Database │    │ Exports  │
│  Backup  │    │  Backup  │
│          │    │          │
│ pg_dump  │    │ tar.gz   │
└────┬─────┘    └────┬─────┘
     │               │
     └───────┬───────┘
             │
             ▼
┌─────────────────────┐
│ Save to ./backups/  │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ Upload to Cloud     │
│ (if enabled)        │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ Cleanup Old Backups │
│ (older than 30 days)│
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ Log Operation       │
└─────────────────────┘
```

### 4. Monitoring Flow

```
┌─────────────────────┐
│  Every 5 Minutes    │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ MonitoringService   │
│ Collect Metrics     │
└────┬────────────────┘
     │
     ├──────┬──────┬──────┬──────┐
     │      │      │      │      │
     ▼      ▼      ▼      ▼      ▼
  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐
  │CPU │ │Mem │ │Disk│ │ DB │ │Exp │
  └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘
    │      │      │      │      │
    └──────┴──────┴──────┴──────┘
                  │
                  ▼
         ┌─────────────────┐
         │ Store in Memory │
         │ (Last 1000)     │
         └────┬────────────┘
              │
              ▼
         ┌─────────────────┐
         │ Check Thresholds│
         └────┬────────────┘
              │
              ▼
         ┌─────────────────┐
         │ Log Warnings    │
         │ (if needed)     │
         └─────────────────┘

┌─────────────────────┐
│  Every 10 Minutes   │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ Health Check        │
│ - Database          │
│ - Memory            │
│ - Disk              │
│ - Export Dir        │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ Status: healthy/    │
│ warning/critical    │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│ Log Status          │
└─────────────────────┘
```

## Service Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│                    VisitorService                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ - registerVisitor()                                  │  │
│  │ - trackActivity()                                    │  │
│  │ - getAnalytics()                                     │  │
│  │ - exportToExcel() ──────────────────────┐           │  │
│  └──────────────────────────────────────────┼───────────┘  │
└─────────────────────────────────────────────┼───────────────┘
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 ExcelExportService                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ - generateVisitorExport()                            │  │
│  │ - createVisitorsSheet()                              │  │
│  │ - createAnalyticsSheet()                             │  │
│  │ - createTimelineSheet()                              │  │
│  │ - streamVisitorExport()                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────┐
│              ScheduledExportService                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ - scheduleDailyExport()                              │  │
│  │ - performDailyExport() ──────────────┐              │  │
│  │ - exportDateRange()                  │              │  │
│  │ - cleanupOldExports()                │              │  │
│  └──────────────────────────────────────┼──────────────┘  │
└─────────────────────────────────────────┼──────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────┐
│               CloudStorageService                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ - uploadFile()                                       │  │
│  │ - deleteFile()                                       │  │
│  │ - uploadToS3()                                       │  │
│  │ - uploadToAzure()                                    │  │
│  │ - uploadToGCS()                                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                        visitors                             │
├─────────────────────────────────────────────────────────────┤
│ id                  UUID PRIMARY KEY                        │
│ email               VARCHAR(255) UNIQUE                     │
│ encrypted_email     TEXT                                    │
│ registration_date   TIMESTAMP                               │
│ last_activity       TIMESTAMP                               │
│ activity_count      INTEGER                                 │
│ is_active           BOOLEAN                                 │
│ metadata            JSONB ◄─── NEW                          │
│ created_at          TIMESTAMP                               │
│ updated_at          TIMESTAMP                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Foreign Keys
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  documents   │    │search_queries│    │ audit_logs   │
├──────────────┤    ├──────────────┤    ├──────────────┤
│ visitor_id   │    │ visitor_id   │    │ visitor_id   │
│ file_name    │    │ query_text   │    │ action       │
│ file_size    │    │ result_count │    │ metadata     │
│ ...          │    │ ...          │    │ ...          │
└──────────────┘    └──────────────┘    └──────────────┘
```

## File System Structure

```
backend/
├── exports/                          # Generated Excel files
│   ├── visitor-export-2025-10-10.xlsx
│   ├── visitor-export-2025-10-09.xlsx
│   └── visitor-export-2025-10-08.xlsx
│
├── backups/                          # Backup files
│   ├── db-backup-2025-10-10.sql
│   ├── db-backup-2025-10-09.sql
│   ├── exports-backup-2025-10-10.tar.gz
│   └── exports-backup-2025-10-09.tar.gz
│
├── logs/                             # Application logs
│   ├── combined.log
│   └── error.log
│
└── src/
    ├── services/
    │   ├── excelExportService.ts     # Excel generation
    │   ├── scheduledExportService.ts # Scheduling
    │   ├── cloudStorageService.ts    # Cloud upload
    │   ├── monitoringService.ts      # Monitoring
    │   ├── backupService.ts          # Backups
    │   └── visitorService.ts         # Visitor management
    │
    ├── routes/
    │   ├── visitors.ts               # Export endpoints
    │   ├── backups.ts                # Backup endpoints
    │   └── monitoring.ts             # Monitoring endpoints
    │
    ├── config/
    │   └── export.config.ts          # Export configuration
    │
    └── database/
        └── migrations/
            └── add_visitor_metadata.sql
```

## Cloud Storage Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Local File System                         │
│                   ./exports/                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Upload (if configured)
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│  AWS S3  │  │  Azure   │  │  Google  │
│          │  │   Blob   │  │   GCS    │
│ Bahrain  │  │ Storage  │  │          │
│ Region   │  │          │  │          │
└──────────┘  └──────────┘  └──────────┘
     │             │             │
     └─────────────┴─────────────┘
                   │
                   ▼
         ┌─────────────────┐
         │  Redundant      │
         │  Storage        │
         │  - Durability   │
         │  - Availability │
         │  - Scalability  │
         └─────────────────┘
```

## Monitoring Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  System Components                          │
├─────────────────────────────────────────────────────────────┤
│  CPU  │  Memory  │  Disk  │  Database  │  Exports          │
└───┬───────┬────────┬─────────┬────────────┬─────────────────┘
    │       │        │         │            │
    └───────┴────────┴─────────┴────────────┘
                     │
                     ▼
         ┌─────────────────────┐
         │ MonitoringService   │
         │ - Collect Metrics   │
         │ - Check Health      │
         │ - Store History     │
         └──────────┬──────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Metrics  │ │  Health  │ │  Logs    │
│ History  │ │  Status  │ │          │
│ (Memory) │ │          │ │ Winston  │
└──────────┘ └──────────┘ └──────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │   API Endpoints     │
         │ - /metrics          │
         │ - /health           │
         │ - /report           │
         └─────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Request                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
         ┌─────────────────────┐
         │  Rate Limiter       │
         │  (Express)          │
         └──────────┬──────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │  Authentication     │
         │  (JWT Bearer Token) │
         └──────────┬──────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │  Authorization      │
         │  (Admin Role Check) │
         └──────────┬──────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │  Input Validation   │
         │  (Joi Schema)       │
         └──────────┬──────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │  Business Logic     │
         │  (Services)         │
         └──────────┬──────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │  Audit Logging      │
         │  (audit_logs table) │
         └──────────┬──────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │  Response           │
         └─────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Server                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Node.js Application                     │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Express Server (Port 5000)                    │  │  │
│  │  │  - API Routes                                  │  │  │
│  │  │  - Services                                    │  │  │
│  │  │  - Scheduled Tasks                             │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              PostgreSQL Database                     │  │
│  │  - visitors, users, documents, audit_logs           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              File System                             │  │
│  │  - exports/  - backups/  - logs/                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Upload
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Cloud Storage                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │  AWS S3  │  │  Azure   │  │  Google  │                 │
│  │          │  │   Blob   │  │   GCS    │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

## Summary

This architecture provides:

✅ **Scalability**: Cloud storage and efficient processing  
✅ **Reliability**: Automated backups and monitoring  
✅ **Security**: Multi-layer authentication and authorization  
✅ **Performance**: Streaming support and optimized queries  
✅ **Maintainability**: Clean separation of concerns  
✅ **Observability**: Comprehensive monitoring and logging  

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: October 10, 2025
