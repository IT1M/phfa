'use client';

import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Activity, Lock, Users, FileText } from 'lucide-react';

interface SecurityMetrics {
  failedLogins: number;
  activeSessions: number;
  threats: {
    total: number;
    byLevel: Record<string, number>;
    byType: Record<string, number>;
  };
  auditLogs: {
    total: number;
    failed: number;
  };
  dataRetention: {
    anonymizedPatients: number;
    archivedDocuments: number;
  };
}

interface Threat {
  id: number;
  type: string;
  level: string;
  ip_address: string;
  timestamp: string;
  details: any;
}

export default function SecurityDashboard() {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecurityData();
    const interval = setInterval(fetchSecurityData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchSecurityData = async () => {
    try {
      const response = await fetch('/api/security/dashboard');
      const data = await response.json();
      setMetrics(data.metrics);
      setThreats(data.recentThreats);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch security data:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading security dashboard...</div>;
  }

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="w-8 h-8" />
          Security Dashboard
        </h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={<AlertTriangle className="w-6 h-6" />}
          title="Failed Logins"
          value={metrics?.failedLogins || 0}
          subtitle="Last hour"
          color="text-red-600"
        />
        <MetricCard
          icon={<Activity className="w-6 h-6" />}
          title="Active Sessions"
          value={metrics?.activeSessions || 0}
          subtitle="Current"
          color="text-green-600"
        />
        <MetricCard
          icon={<Shield className="w-6 h-6" />}
          title="Threats Detected"
          value={metrics?.threats.total || 0}
          subtitle="Last 24 hours"
          color="text-orange-600"
        />
        <MetricCard
          icon={<FileText className="w-6 h-6" />}
          title="Audit Logs"
          value={metrics?.auditLogs.total || 0}
          subtitle="Last 24 hours"
          color="text-blue-600"
        />
      </div>

      {/* Threat Levels */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Threat Levels (24h)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(metrics?.threats.byLevel || {}).map(([level, count]) => (
            <div key={level} className={`p-4 rounded-lg ${getThreatLevelColor(level)}`}>
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-sm capitalize">{level}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Threats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Threats</h2>
        <div className="space-y-3">
          {threats.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No threats detected
            </div>
          ) : (
            threats.map((threat) => (
              <div
                key={threat.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className={`px-3 py-1 rounded-full text-sm ${getThreatLevelColor(threat.level)}`}>
                    {threat.level}
                  </div>
                  <div>
                    <div className="font-medium">{threat.type.replace(/_/g, ' ')}</div>
                    <div className="text-sm text-gray-500">
                      IP: {threat.ip_address} • {new Date(threat.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Data Retention */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Data Retention Status</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold">{metrics?.dataRetention.anonymizedPatients || 0}</div>
            <div className="text-sm text-gray-600">Anonymized Patients</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold">{metrics?.dataRetention.archivedDocuments || 0}</div>
            <div className="text-sm text-gray-600">Archived Documents</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, title, value, subtitle, color }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <div className={color}>{icon}</div>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-xs text-gray-400 mt-1">{subtitle}</div>
    </div>
  );
}
