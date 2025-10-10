// Admin API Client

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class AdminAPI {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Dashboard
  async getDashboardMetrics() {
    return this.request('/api/admin/dashboard/metrics');
  }

  async getRealtimeStats() {
    return this.request('/api/admin/dashboard/realtime');
  }

  // Visitors
  async getVisitors(params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    startDate?: string;
    endDate?: string;
  }) {
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    );
    return this.request(`/api/admin/visitors?${query}`);
  }

  async getVisitorTimeline(days: number = 30) {
    return this.request(`/api/admin/visitors/timeline?days=${days}`);
  }

  async getGeographicDistribution() {
    return this.request('/api/admin/visitors/geographic');
  }

  async getEngagementScores() {
    return this.request('/api/admin/visitors/engagement');
  }

  async bulkEmailVisitors(visitorIds: string[], subject: string, body: string) {
    return this.request('/api/admin/visitors/bulk-email', {
      method: 'POST',
      body: JSON.stringify({ visitorIds, subject, body }),
    });
  }

  async exportVisitors(visitorIds: string[]) {
    return this.request('/api/admin/visitors/export', {
      method: 'POST',
      body: JSON.stringify({ visitorIds }),
    });
  }

  // Documents
  async getDocumentQueue() {
    return this.request('/api/admin/documents/queue');
  }

  async getProcessingStats(days: number = 7) {
    return this.request(`/api/admin/documents/stats?days=${days}`);
  }

  async getFailedDocuments(limit: number = 50) {
    return this.request(`/api/admin/documents/failed?limit=${limit}`);
  }

  // Analytics
  async getTrends(days: number = 30) {
    return this.request(`/api/admin/analytics/trends?days=${days}`);
  }

  async getUsagePatterns(days: number = 30) {
    return this.request(`/api/admin/analytics/usage-patterns?days=${days}`);
  }

  async getDeviceAnalytics() {
    return this.request('/api/admin/analytics/devices');
  }

  async getLanguageDistribution() {
    return this.request('/api/admin/analytics/languages');
  }

  // Settings
  async getSettings() {
    return this.request('/api/admin/settings');
  }

  async updateSetting(key: string, value: string) {
    return this.request(`/api/admin/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
  }
}

export const adminAPI = new AdminAPI();
