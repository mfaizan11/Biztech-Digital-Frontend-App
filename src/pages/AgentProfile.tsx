import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Mail, Phone, Award, Briefcase, Save, Loader2, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { toast } from 'sonner';

export function AgentProfile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [stats, setStats] = useState({
    totalClients: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalRevenue: '$0', // Backend revenue tracking not implemented yet
    avgRating: 5.0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch User Details
        const userRes = await api.get('/auth/me');
        const userData = userRes.data;

        setFormData(prev => ({
          ...prev,
          fullName: userData.fullName || '',
          email: userData.email || '',
          phone: userData.mobile || ''
        }));

        // 2. Fetch Projects for Stats
        const projectsRes = await api.get('/projects');
        const projects = projectsRes.data;
        
        // Calculate Stats
        const active = projects.filter((p: any) => p.globalStatus === 'In Progress' || p.globalStatus === 'Pending').length;
        const completed = projects.filter((p: any) => p.globalStatus === 'Delivered').length;
        
        // Count unique clients
        const uniqueClients = new Set(projects.map((p: any) => p.clientId)).size;

        setStats(prev => ({
          ...prev,
          activeProjects: active,
          completedProjects: completed,
          totalClients: uniqueClients
        }));

      } catch (error) {
        console.error("Profile load error", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      const payload: any = {
        fullName: formData.fullName,
        mobile: formData.phone
      };

      if (formData.newPassword) {
        payload.password = formData.newPassword;
      }

      const res = await api.put('/auth/me', payload);
      
      // Update Context
      updateUser({ name: formData.fullName });
      
      toast.success("Profile updated successfully");
      setIsEditing(false);
      
      // Clear password fields
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 text-[#2EC4B6] animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="mb-2 text-[#0D1B2A]">My Profile</h1>
          <p className="text-[#4A5568]">Manage your professional information and settings</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all h-[44px] border-2 ${
            isEditing 
              ? 'bg-gray-100 border-gray-300 text-gray-700' 
              : 'border-[#2EC4B6] text-[#2EC4B6] hover:bg-[#F0FDFA]'
          }`}
        >
          <Edit2 size={18} />
          {isEditing ? 'Cancel Editing' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card & Stats */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-[#2EC4B6] to-[#26a599] rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-semibold">
                {formData.fullName.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-[#0D1B2A] mb-1">{formData.fullName}</h3>
              <p className="text-sm text-[#4A5568] mb-2">Digital Agent</p>
              <div className="flex items-center justify-center gap-2">
                <Award className="text-[#F39C12]" size={16} />
                <span className="text-sm font-medium text-[#F39C12]">{stats.avgRating} Rating</span>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#2EC4B6]/10 rounded-lg flex items-center justify-center">
                  <Mail className="text-[#2EC4B6]" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#4A5568]">Email</p>
                  <p className="text-sm font-medium text-[#1A202C] truncate">{formData.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#3498DB]/10 rounded-lg flex items-center justify-center">
                  <Phone className="text-[#3498DB]" size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#4A5568]">Phone</p>
                  <p className="text-sm font-medium text-[#1A202C]">{formData.phone || 'Not Set'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="bg-gradient-to-br from-[#0D1B2A] to-[#1a2d42] rounded-xl p-6 text-white shadow-lg">
            <h4 className="text-white mb-4">Performance Stats</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Total Clients</span>
                <span className="font-semibold">{stats.totalClients}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Active Projects</span>
                <span className="font-semibold">{stats.activeProjects}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Completed</span>
                <span className="font-semibold">{stats.completedProjects}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* General Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-[#0D1B2A] mb-6">General Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#1A202C] mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2EC4B6] disabled:bg-gray-50 disabled:text-gray-500"
                  disabled={!isEditing}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#1A202C] mb-2">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                  title="Email cannot be changed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A202C] mb-2">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2EC4B6] disabled:bg-gray-50 disabled:text-gray-500"
                  disabled={!isEditing}
                  placeholder="+971..."
                />
              </div>
            </div>
          </div>

          {/* Security Settings (Password Update) */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="text-[#2EC4B6]" size={24} />
              <h3 className="text-[#0D1B2A]">Security Settings</h3>
            </div>
            
            {isEditing ? (
              <div className="space-y-4">
                <p className="text-sm text-[#4A5568] bg-blue-50 p-3 rounded-lg">
                  Leave these fields blank if you do not want to change your password.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#1A202C] mb-2">New Password</label>
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2EC4B6]"
                      placeholder="Min 8 characters"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1A202C] mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2EC4B6]"
                      placeholder="Confirm password"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Click "Edit Profile" to change your password.</p>
            )}
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                className="flex-1 bg-[#2EC4B6] hover:bg-[#26a599] text-white py-3 rounded-lg transition-all font-medium h-[48px] flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Save Changes
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
                }}
                className="flex-1 bg-white border-2 border-gray-300 text-[#1A202C] py-3 rounded-lg hover:bg-gray-50 transition-all font-medium h-[48px]"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}