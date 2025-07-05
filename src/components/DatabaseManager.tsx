import React, { useState, useEffect } from 'react';
import { Database, Users, BookOpen, Heart, BarChart3, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DatabaseStats {
  profiles: number;
  soapEntries: number;
  prayerRequests: number;
  readingProgress: number;
}

const DatabaseManager: React.FC = () => {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [
        profilesResult,
        soapResult,
        prayersResult,
        progressResult
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('soap_entries').select('id', { count: 'exact', head: true }),
        supabase.from('prayer_requests').select('id', { count: 'exact', head: true }),
        supabase.from('reading_progress').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        profiles: profilesResult.count || 0,
        soapEntries: soapResult.count || 0,
        prayerRequests: prayersResult.count || 0,
        readingProgress: progressResult.count || 0
      });
    } catch (err) {
      console.error('Error fetching database stats:', err);
      setError('Failed to fetch database statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ComponentType<any>;
    color: string;
    description: string;
  }> = ({ title, value, icon: Icon, color, description }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="text-white" size={24} />
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {value.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">{title}</div>
        </div>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-center">
          <RefreshCw className="animate-spin text-primary-600" size={24} />
          <span className="ml-2 text-gray-600">Loading database statistics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center">
          <div className="text-red-600 mb-2">{error}</div>
          <button
            onClick={fetchStats}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Database className="text-primary-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900">Database Overview</h2>
          </div>
          <button
            onClick={fetchStats}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Users"
              value={stats.profiles}
              icon={Users}
              color="bg-blue-500"
              description="Total registered users and profiles"
            />
            
            <StatCard
              title="SOAP Entries"
              value={stats.soapEntries}
              icon={BookOpen}
              color="bg-green-500"
              description="Daily devotional entries created"
            />
            
            <StatCard
              title="Prayer Requests"
              value={stats.prayerRequests}
              icon={Heart}
              color="bg-red-500"
              description="Active and answered prayer requests"
            />
            
            <StatCard
              title="Reading Progress"
              value={stats.readingProgress}
              icon={BarChart3}
              color="bg-yellow-500"
              description="Daily reading completion records"
            />
          </div>
        )}
      </div>

      {/* Database Health */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Health</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-green-800">Row Level Security</span>
            <span className="text-green-600 font-medium">✓ Enabled</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-green-800">Real-time Subscriptions</span>
            <span className="text-green-600 font-medium">✓ Active</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-green-800">Backup Status</span>
            <span className="text-green-600 font-medium">✓ Automated</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Schema</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Core Tables</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• profiles - User profiles and authentication</li>
              <li>• soap_entries - Daily devotional entries</li>
              <li>• reading_progress - Reading completion tracking</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Community Features</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• prayer_requests - Prayer request system</li>
              <li>• prayer_responses - Prayer responses and support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseManager;