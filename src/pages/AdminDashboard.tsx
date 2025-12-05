import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, UserCheck, CheckCircle, XCircle, Save } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';
import { User, ServiceRequest } from '../types';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ServiceRequest[]>([]);
  const [agentsList, setAgentsList] = useState<User[]>([]);
  
  const [selectedAssignments, setSelectedAssignments] = useState<Record<string, string>>({});

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [usersRes, requestsRes, agentsRes] = await Promise.all([
        api.get('/admin/users/pending'),
        // FIX: Use params object to correctly encode 'Pending Triage'
        api.get('/requests', { params: { status: 'Pending Triage' } }), 
        api.get('/admin/agents')
      ]);

      setPendingUsers(usersRes.data);
      
      // FIX: Double-check filter on frontend to ensure only unassigned requests are shown
      // This handles cases where backend might return all if param parsing fails
      const unassignedOnly = requestsRes.data.filter((r: any) => r.status === 'Pending Triage');
      setPendingRequests(unassignedOnly);
      
      setAgentsList(agentsRes.data);
    } catch (error: any) {
      console.error("Dashboard Fetch Error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUserStatus = async (userId: string, status: 'Active' | 'Rejected') => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { status });
      toast.success(`User ${status === 'Active' ? 'approved' : 'rejected'} successfully`);
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error: any) {
      toast.error(error.message || "Failed to update user status");
    }
  };

  const handleAssignAgent = async (requestId: string) => {
    const agentId = selectedAssignments[requestId];
    if (!agentId) {
      toast.error("Please select an agent first");
      return;
    }
    try {
      await api.patch(`/requests/${requestId}/assign`, { agentId });
      toast.success("Agent assigned successfully");
      // Remove from list immediately upon assignment
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      const newAssignments = { ...selectedAssignments };
      delete newAssignments[requestId];
      setSelectedAssignments(newAssignments);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to assign agent");
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <>
      <div className="mb-6">
        <p className="text-sm text-[#4A5568] mb-2">Admin Dashboard</p>
      </div>

      <div className="mb-8">
        <h1 className="mb-1 text-[#1A202C]">Welcome back! 👋</h1>
        <p className="text-[#4A5568]">Here's what needs your attention today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <p className="text-sm text-[#4A5568]">Pending Approvals</p>
            <div className="w-8 h-8 bg-[#F39C12]/10 rounded-lg flex items-center justify-center">
              <UserCheck size={20} className="text-[#F39C12]" />
            </div>
          </div>
          <p className="text-3xl text-[#1A202C]">{loading ? '-' : pendingUsers.length}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <p className="text-sm text-[#4A5568]">Unassigned Requests</p>
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Briefcase size={20} className="text-[#4A5568]" />
            </div>
          </div>
          <p className="text-3xl text-[#1A202C]">{loading ? '-' : pendingRequests.length}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <p className="text-sm text-[#4A5568]">Active Agents</p>
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-[#4A5568]" />
            </div>
          </div>
          <p className="text-3xl text-[#1A202C]">{loading ? '-' : agentsList.filter((a: any) => a.status === 'Active').length}</p>
        </div>
      </div>

      {/* Pending User Approvals */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <UserCheck size={20} className="text-[#F39C12]" />
            <h3 className="text-[#1A202C]">Pending User Approvals</h3>
          </div>
          <p className="text-sm text-[#4A5568]">New user registrations awaiting approval</p>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs text-[#4A5568]">Name</th>
                <th className="px-6 py-3 text-left text-xs text-[#4A5568]">Email</th>
                <th className="px-6 py-3 text-left text-xs text-[#4A5568]">Role</th>
                <th className="px-6 py-3 text-left text-xs text-[#4A5568]">Registered</th>
                <th className="px-6 py-3 text-left text-xs text-[#4A5568]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-[#4A5568]">Loading...</td></tr>
              ) : pendingUsers.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-[#4A5568]">No pending approvals.</td></tr>
              ) : (
                pendingUsers.map((user: any) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-[#1A202C]">{user.fullName || user.name}</td>
                    <td className="px-6 py-4 text-sm text-[#4A5568]">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-[#4A5568] capitalize">{user.role}</td>
                    <td className="px-6 py-4 text-sm text-[#4A5568]">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleUserStatus(user.id, 'Active')}
                          className="text-[#2ECC71] hover:text-[#27ae60] text-sm flex items-center gap-1"
                        >
                          <CheckCircle size={14} />
                          Approve
                        </button>
                        <button 
                          onClick={() => handleUserStatus(user.id, 'Rejected')}
                          className="text-[#E74C3C] hover:text-[#c0392b] text-sm flex items-center gap-1"
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Triage */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <Briefcase size={20} className="text-[#E74C3C]" />
            <h3 className="text-[#1A202C]">Unassigned Requests</h3>
          </div>
          <p className="text-sm text-[#4A5568]">Client requests that need to be assigned to agents</p>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs text-[#4A5568]">Client</th>
                <th className="px-6 py-3 text-left text-xs text-[#4A5568]">Category</th>
                <th className="px-6 py-3 text-left text-xs text-[#4A5568]">Priority</th>
                <th className="px-6 py-3 text-left text-xs text-[#4A5568]">Received</th>
                <th className="px-6 py-3 text-left text-xs text-[#4A5568]">Assign To</th>
                <th className="px-6 py-3 text-left text-xs text-[#4A5568]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-[#4A5568]">Loading...</td></tr>
              ) : pendingRequests.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-[#4A5568]">No unassigned requests.</td></tr>
              ) : (
                pendingRequests.map((request: any) => (
                  <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-[#1A202C]">
                      {request.Client?.companyName || "Unknown Client"}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#4A5568]">
                      {request.Category?.name || "General"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          request.priority === 'High'
                            ? 'bg-[#E74C3C]/10 text-[#E74C3C]'
                            : request.priority === 'Medium'
                            ? 'bg-[#F39C12]/10 text-[#F39C12]'
                            : 'bg-[#3498DB]/10 text-[#3498DB]'
                        }`}
                      >
                        {(request.priority || 'Medium').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#4A5568]">{formatDate(request.createdAt)}</td>
                    <td className="px-6 py-4">
                      <select 
                        className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#2EC4B6]"
                        value={selectedAssignments[request.id] || ""}
                        onChange={(e) => setSelectedAssignments({
                          ...selectedAssignments,
                          [request.id]: e.target.value
                        })}
                      >
                        <option value="">Select agent...</option>
                        {agentsList.map((agent: any) => (
                          <option key={agent.id} value={agent.id}>
                            {agent.fullName || agent.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleAssignAgent(request.id)}
                        disabled={!selectedAssignments[request.id]}
                        className="text-[#2EC4B6] hover:text-[#26a599] text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <Save size={16} />
                        Assign
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}