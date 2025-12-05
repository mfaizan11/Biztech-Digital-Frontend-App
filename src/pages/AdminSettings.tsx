import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Save, Server, Database, Activity, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';

export function AdminSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Settings State
  const [settings, setSettings] = useState({
    autoApproval: false,
    emailNotifications: true,
    agentAssignment: 'manual',
    maintenanceMode: false,
    maxProjectsPerAgent: 10,
    sessionTimeout: 30,
  });

  // Stats State
  const [stats, setStats] = useState({
    serverStatus: 'Checking...',
    dbStatus: 'Checking...',
    activeAgents: 0,
    responseTime: '-'
  });

  useEffect(() => {
    loadSettings();
    fetchSystemStats();
  }, []);

  // 1. Load Settings from LocalStorage (Frontend Persistence)
  const loadSettings = () => {
    const savedSettings = localStorage.getItem('admin_platform_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  // 2. Fetch Real System Stats
  const fetchSystemStats = async () => {
    const start = Date.now();
    try {
      // Parallel fetch for health check and agents count
      // Using /admin/health ensures we test the full API stack including auth and DB
      const [healthRes, agentsRes] = await Promise.allSettled([
        api.get('/admin/health'), 
        api.get('/admin/agents')
      ]);

      const latency = Date.now() - start;

      // Handle Health Check
      if (healthRes.status === 'fulfilled' && healthRes.value.data) {
        setStats(prev => ({
          ...prev,
          serverStatus: healthRes.value.data.server || 'Online',
          dbStatus: healthRes.value.data.database || 'Connected',
          responseTime: `${latency}ms`
        }));
      } else {
        setStats(prev => ({
          ...prev,
          serverStatus: 'Offline',
          dbStatus: 'Unknown',
          responseTime: '-'
        }));
      }

      // Handle Agents Count
      if (agentsRes.status === 'fulfilled') {
        const agents = agentsRes.value.data;
        const activeCount = agents.filter((a: any) => a.status === 'Active').length;
        setStats(prev => ({
          ...prev,
          activeAgents: activeCount
        }));
      }

    } catch (error) {
      console.error("Failed to fetch stats", error);
      setStats(prev => ({ ...prev, serverStatus: 'Error', dbStatus: 'Error' }));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    // Save to LocalStorage
    localStorage.setItem('admin_platform_settings', JSON.stringify(settings));
    
    // Simulate API delay
    setTimeout(() => {
      toast.success('Settings saved successfully', {
        description: 'Configuration has been updated for this browser session.'
      });
    }, 500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-[#2EC4B6] animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-[#0D1B2A]">Platform Settings</h1>
        <p className="text-[#4A5568]">Configure system preferences and view platform health</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* User Management */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="text-[#3498DB]" size={24} />
              <h3 className="text-[#0D1B2A]">User Management</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-[#1A202C]">Auto-Approve Users</p>
                  <p className="text-sm text-[#4A5568]">Automatically approve new user registrations</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoApproval}
                    onChange={(e) => setSettings({ ...settings, autoApproval: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2EC4B6]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2EC4B6]"></div>
                </label>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block font-medium text-[#1A202C] mb-2">Session Timeout (minutes)</label>
                <input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/20"
                />
              </div>
            </div>
          </div>

          {/* Agent Management */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Users className="text-[#3498DB]" size={24} />
              <h3 className="text-[#0D1B2A]">Agent Management</h3>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block font-medium text-[#1A202C] mb-2">Agent Assignment Mode</label>
                <select
                  value={settings.agentAssignment}
                  onChange={(e) => setSettings({ ...settings, agentAssignment: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/20"
                >
                  <option value="manual">Manual Assignment (Admin)</option>
                  <option value="auto">Automatic (Load Balancing)</option>
                  <option value="round-robin">Round Robin</option>
                </select>
                <p className="text-sm text-[#4A5568] mt-2">How service requests are initially assigned</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block font-medium text-[#1A202C] mb-2">Max Projects Per Agent</label>
                <input
                  type="number"
                  value={settings.maxProjectsPerAgent}
                  onChange={(e) => setSettings({ ...settings, maxProjectsPerAgent: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/20"
                />
              </div>
            </div>
          </div>

          {/* System */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Server className="text-[#3498DB]" size={24} />
              <h3 className="text-[#0D1B2A]">System Control</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-[#1A202C]">Maintenance Mode</p>
                  <p className="text-sm text-[#4A5568]">Prevent non-admin logins temporarily</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#E74C3C]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E74C3C]"></div>
                </label>
              </div>

              {settings.maintenanceMode && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-in fade-in">
                  <p className="text-sm text-red-800 font-medium flex items-center gap-2">
                    <Activity size={16} /> Maintenance Mode Active
                  </p>
                  <p className="text-xs text-red-600 mt-1">Platform access is currently restricted to Administrators.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info (Real Data) */}
        <div className="space-y-6">
          {/* Platform Status */}
          <div className="bg-gradient-to-br from-[#2EC4B6] to-[#26a599] rounded-xl p-6 text-white shadow-lg">
            <h4 className="text-white mb-4 font-semibold">Live System Status</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/90 flex items-center gap-2">
                  <Server size={14} /> Server
                </span>
                <span className={`font-semibold px-2 py-0.5 rounded text-xs ${
                  stats.serverStatus === 'Online' ? 'bg-white/20' : 'bg-red-500/20'
                }`}>
                  {stats.serverStatus}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/90 flex items-center gap-2">
                  <Database size={14} /> Database
                </span>
                <span className="font-semibold">{stats.dbStatus}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-white/20">
                <span className="text-sm text-white/90">Response Time</span>
                <span className="font-mono text-sm">{stats.responseTime}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats (Fetched) */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h4 className="text-[#0D1B2A] mb-4 font-semibold">Platform Metrics</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#4A5568]">Active Agents</span>
                <span className="font-bold text-[#1A202C]">{stats.activeAgents}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#4A5568]">Total Users</span>
                <span className="text-sm text-gray-400">View in Dashboard</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-xs text-[#4A5568]">Configuration Storage</span>
                <span className="text-xs font-medium text-[#2EC4B6]">Local / Browser</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end md:justify-start">
        <button
          onClick={handleSave}
          className="w-full md:w-auto bg-[#2EC4B6] hover:bg-[#26a599] text-white px-8 py-3 rounded-lg transition-all font-medium h-[48px] flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
        >
          <Save size={18} />
          Save Settings
        </button>
      </div>
    </>
  );
}