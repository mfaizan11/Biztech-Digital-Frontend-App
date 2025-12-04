import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, FolderOpen, ArrowRight, AlertCircle, Download, Check, Loader2 } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../contexts/AuthContext';
import { ServiceRequest } from '../types';
import api from '../lib/api';
import { toast } from 'sonner';

export function ClientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State for real data
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function to map Backend Database Status -> Frontend Visual Status
  const mapBackendStatus = (dbStatus: string) => {
    switch (dbStatus) {
      case 'Pending Triage': return 'pending-review';
      case 'Assigned': return 'in-progress';
      case 'Quoted': return 'action-required';
      case 'Converted': return 'approved';
      case 'Rejected': return 'rejected';
      default: return 'pending';
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await api.get('/requests');
      
      const mappedRequests = response.data.map((req: any) => ({
        id: req.id.toString(),
        client: user?.name || '',
        clientEmail: user?.email || '',
        category: req.Category?.name || 'General Service',
        dateSubmitted: new Date(req.createdAt).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric'
        }),
        createdAt: req.createdAt,
        status: mapBackendStatus(req.status),
        details: req.details,
        proposalAmount: req.Proposal ? `$${req.Proposal.totalAmount}` : undefined,
        proposalId: req.Proposal?.id,
        pdfPath: req.Proposal?.pdfPath
      }));

      setRequests(mappedRequests);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
      toast.error("Could not load your requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const handleViewPdf = (pdfPath?: string) => {
    if (!pdfPath) {
      toast.error("Proposal PDF not available");
      return;
    }
    
    // Construct proper URL
    // import.meta.env.VITE_API_URL is typically "http://localhost:3000/api/v1"
    // Backend serves static files at root "/uploads" -> "http://localhost:3000/uploads/..."
    const baseUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api/v1', '') 
      : 'http://localhost:3000';
    
    const cleanPath = pdfPath.replace(/\\/g, '/'); // Fix Windows backslashes
    const fullUrl = `${baseUrl}/${cleanPath}`;
    
    window.open(fullUrl, '_blank');
  };

  const handleAcceptProposal = async (proposalId?: string) => {
    if (!proposalId) return;
    
    if(!window.confirm("Are you sure you want to accept this proposal? A new project will be created.")) return;

    try {
      await api.patch(`/proposals/${proposalId}/accept`);
      toast.success("Proposal Accepted! Project started.");
      fetchRequests(); // Refresh data
    } catch (error) {
      toast.error("Failed to accept proposal");
    }
  };

  const actionRequiredRequest = requests.find(r => r.status === 'action-required');
  const hasActionRequired = !!actionRequiredRequest;

  const pendingCount = requests.filter(r => r.status === 'pending-review' || r.status === 'pending').length;
  const actionCount = requests.filter(r => r.status === 'action-required').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#2EC4B6] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA]">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="mb-2 text-[#0D1B2A]">Welcome, {user?.name || 'Business Owner'}!</h1>
          <p className="text-[#4A5568]">Request services, review proposals, and manage your projects</p>
        </div>

        {/* ... Rest of the dashboard content ... */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-[#2EC4B6] to-[#26a599] rounded-xl p-8 text-white shadow-lg">
              <h2 className="mb-3 text-white">Ready to grow your business?</h2>
              <p className="mb-6 text-white/90">
                Start a new service request and receive custom proposals from our digital experts
              </p>
              <button
                onClick={() => navigate('/needs-assessment')}
                className="bg-white text-[#2EC4B6] px-8 py-3 rounded-lg hover:bg-gray-50 transition-all font-medium flex items-center gap-2 group h-[48px]"
              >
                Start New Request
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Proposal Alert */}
            {hasActionRequired && actionRequiredRequest && (
              <div className="bg-gradient-to-br from-[#FFF4E6] to-[#FFF9F0] border-2 border-[#F39C12] rounded-xl p-6 shadow-md">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#F39C12] rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-[#0D1B2A]">New Proposal Received!</h3>
                    <p className="text-sm text-[#4A5568] mb-4">
                      {actionRequiredRequest.category} - <span className="font-semibold text-[#0D1B2A]">{actionRequiredRequest.proposalAmount || 'Price TBD'}</span>
                    </p>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleViewPdf(actionRequiredRequest.pdfPath)}
                        className="bg-white border-2 border-[#0D1B2A] text-[#0D1B2A] px-6 py-2.5 rounded-lg hover:bg-[#0D1B2A] hover:text-white transition-all font-medium flex items-center gap-2 h-[44px]"
                      >
                        <Download size={18} />
                        View PDF
                      </button>
                      <button 
                        onClick={() => handleAcceptProposal(actionRequiredRequest.proposalId)}
                        className="bg-[#2EC4B6] text-white px-6 py-2.5 rounded-lg hover:bg-[#26a599] transition-all font-medium flex items-center gap-2 h-[44px]"
                      >
                        <Check size={18} />
                        Accept Quote
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* My Requests Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[#0D1B2A]">My Requests</h3>
                <button
                  onClick={() => navigate('/needs-assessment')}
                  className="text-[#2EC4B6] hover:text-[#26a599] text-sm font-medium flex items-center gap-1"
                >
                  <Plus size={16} />
                  New Request
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#4A5568]">Service Category</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#4A5568]">Date Submitted</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#4A5568]">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#4A5568]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-[#4A5568]">
                          No requests found. Start a new one!
                        </td>
                      </tr>
                    ) : (
                      requests.map((request) => (
                        <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <span className="text-[#1A202C] font-medium">{request.category}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-[#4A5568] text-sm">{request.dateSubmitted}</span>
                          </td>
                          <td className="py-4 px-4">
                            <StatusBadge status={request.status} />
                          </td>
                          <td className="py-4 px-4">
                            {request.pdfPath && (
                              <button 
                                onClick={() => handleViewPdf(request.pdfPath)}
                                className="text-sm text-[#3498DB] hover:underline flex items-center gap-1"
                              >
                                <FileText size={14} /> Review Quote
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <p className="text-sm text-[#4A5568] mb-2">Total Requests</p>
                <p className="text-3xl font-semibold text-[#0D1B2A]">{requests.length}</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <p className="text-sm text-[#4A5568] mb-2">Pending Review</p>
                <p className="text-3xl font-semibold text-[#F39C12]">
                  {pendingCount}
                </p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <p className="text-sm text-[#4A5568] mb-2">Action Required</p>
                <p className="text-3xl font-semibold text-[#E74C3C]">
                  {actionCount}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h4 className="text-[#0D1B2A] mb-4">Quick Actions</h4>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/needs-assessment')}
                  className="w-full text-left px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-[#2EC4B6] hover:bg-[#F0FDFA] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#2EC4B6]/10 rounded-lg flex items-center justify-center group-hover:bg-[#2EC4B6] transition-colors">
                      <Plus className="text-[#2EC4B6] group-hover:text-white" size={18} />
                    </div>
                    <p className="text-[#1A202C] text-sm font-medium">Request New Service</p>
                  </div>
                </button>
                <button
                  onClick={() => navigate('/my-documents')}
                  className="w-full text-left px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-[#2EC4B6] hover:bg-[#F0FDFA] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#2EC4B6]/10 rounded-lg flex items-center justify-center group-hover:bg-[#2EC4B6] transition-colors">
                      <FolderOpen className="text-[#2EC4B6] group-hover:text-white" size={18} />
                    </div>
                    <p className="text-[#1A202C] text-sm font-medium">My Vault</p>
                  </div>
                </button>
                <button
                  onClick={() => navigate('/my-profile')}
                  className="w-full text-left px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-[#2EC4B6] hover:bg-[#F0FDFA] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#2EC4B6]/10 rounded-lg flex items-center justify-center group-hover:bg-[#2EC4B6] transition-colors">
                      <FileText className="text-[#2EC4B6] group-hover:text-white" size={18} />
                    </div>
                    <p className="text-[#1A202C] text-sm font-medium">View My Profile</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Workflow Guide */}
            <div className="bg-gradient-to-br from-[#0D1B2A] to-[#1a2d42] rounded-xl p-6 text-white shadow-lg">
              <h4 className="text-white mb-4">How It Works</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#2EC4B6] rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Submit Request</p>
                    <p className="text-xs text-gray-300">Complete needs assessment</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#2EC4B6] rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Review Proposal</p>
                    <p className="text-xs text-gray-300">Agent creates custom quote</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#2EC4B6] rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Accept & Start</p>
                    <p className="text-xs text-gray-300">Work begins on milestones</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Button */}
            <button className="w-full bg-[#2EC4B6] hover:bg-[#26a599] text-white py-4 rounded-lg transition-colors font-medium shadow-md">
              Need help? Contact your agent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}