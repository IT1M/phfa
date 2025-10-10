// Admin Dashboard Types

export interface DashboardMetrics {
  visitors: VisitorMetrics;
  documents: DocumentMetrics;
  processing: ProcessingMetrics;
  errors: ErrorMetrics;
  timestamp: string;
}

export interface VisitorMetrics {
  total: number;
  active_today: number;
  active_week: number;
  new_today: number;
}

export interface DocumentMetrics {
  total: number;
  uploaded_today: number;
  processed: number;
  failed: number;
}

export interface ProcessingMetrics {
  in_progress: number;
  queued: number;
  avg_processing_time: number;
}

export interface ErrorMetrics {
  total_errors: number;
  errors_today: number;
}

export interface RealtimeStats {
  active_users: number;
  processing_docs: number;
  recent_errors: number;
  avg_processing_time: number;
}

export interface Visitor {
  id: string;
  email: string;
  registration_date: string;
  last_activity: string;
  activity_count: number;
  is_active: boolean;
  metadata: {
    language?: string;
    device_type?: string;
    city?: string;
    region?: string;
    notifications_enabled?: string;
  };
}

export interface VisitorListResponse {
  data: Visitor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TimelineData {
  date: string;
  count: number;
}

export interface GeographicData {
  region: string;
  city: string;
  count: number;
}

export interface EngagementScore {
  id: string;
  email: string;
  engagement_level: 'high' | 'medium' | 'low';
  activity_count: number;
  days_since_activity: number;
}

export interface QueueItem {
  id: string;
  filename: string;
  status: 'pending' | 'processing' | 'processed' | 'failed';
  upload_date: string;
  started_at?: string;
  uploader_email?: string;
  wait_time?: number;
}

export interface ProcessingStats {
  date: string;
  total: number;
  successful: number;
  failed: number;
  avg_time: number;
}

export interface FailedDocument {
  id: string;
  filename: string;
  upload_date: string;
  error_message?: string;
  uploader_email?: string;
}

export interface UsagePattern {
  hour: number;
  activity_count: number;
}

export interface TrendAnalysis {
  visitors: TimelineData[];
  documents: TimelineData[];
  searches: TimelineData[];
}

export interface DeviceAnalytics {
  device: string;
  count: number;
  avg_activity: number;
}

export interface LanguageDistribution {
  language: string;
  count: number;
}

export interface SystemConfig {
  key: string;
  value: string;
  updated_at: string;
}

export interface Setting {
  key: string;
  value: string;
  label: string;
  type: 'text' | 'password' | 'number' | 'boolean';
  category: 'api' | 'email' | 'security';
}
