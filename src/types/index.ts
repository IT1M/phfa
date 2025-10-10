export interface GuestUser {
  email: string;
  sessionId: string;
  createdAt: string;
  expiresAt: string;
  privacyAccepted: boolean;
}

export interface MedicalDocument {
  id: string;
  title: string;
  type: 'report' | 'scan' | 'prescription' | 'lab-result' | 'other';
  uploadDate: string;
  fileUrl: string;
  thumbnailUrl?: string;
  tags: string[];
  medicalCondition?: string;
  annotations?: Annotation[];
}

export interface Annotation {
  id: string;
  text: string;
  position: { x: number; y: number };
  createdAt: string;
}

export interface SearchFilters {
  dateRange?: { start: string; end: string };
  documentType?: string[];
  medicalCondition?: string[];
  tags?: string[];
}

export interface VisitorAnalytics {
  id: string;
  email: string;
  visitCount: number;
  lastVisit: string;
  documentsViewed: number;
  searchQueries: string[];
}

export type Theme = 'light' | 'dark';
export type Locale = 'en' | 'ar';
