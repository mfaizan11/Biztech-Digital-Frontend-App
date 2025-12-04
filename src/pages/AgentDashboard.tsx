import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, FolderOpen, Clock, Loader2, Eye, Send, RefreshCw, FilePlus } from 'lucide-react';
import { ProposalGenerator } from '../components/ProposalGenerator';
import { StatusBadge } from '../components/StatusBadge';
import { Project } from '../types';
import api from '../lib/api';
import { toast } from 'sonner';

export function AgentDashboard() {
  const navigate = useNavigate();
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  
  const [requests, setRequests] = useState<any[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [requestsRes, projectsRes] = await Promise.all([
        api.get('/requests'),
        api.get('/projects')
      ]);

      const mappedRequests = requestsRes.data.map((req: any) => ({
        id: req.id.toString(),
        client: req.Client?.companyName || 'Unknown Client',
        clientEmail: req.Client?.User?.email || '',
        category: req.Category?.name || 'General',
        priority: req.priority,
        createdAt: new Date(req.createdAt).toLocaleDateString(),
        status: req.status === 'Assigned' ? 'pending' : req.status.toLowerCase(),
        details: req.details,
        // Proposal Info
        pdfPath: req.Proposal?.pdfPath,
        proposalId: req.Proposal?.id,
        proposalStatus: req.Proposal?.status // 'Draft', 'Sent', etc.
      }));

      const mappedProjects: Project[] = projectsRes.data.map((p: any) => ({
        id: p.id.toString(),
        name: `Project #${p.id}`,
        client: p.Client?.companyName || 'Unknown',
        status: mapBackendStatus(p.globalStatus),
        progress: p.progressPercent || 0,
        ecd: p.ecd ? new Date(p.ecd).toLocaleDateString() : 'TBD',
        category: p.Request?.Category?.name || 'General'
      }));

      setRequests(mappedRequests);
      setProjects(mappedProjects);
    } catch (error) {
      console.error("Dashboard Load Error", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const mapBackendStatus = (status: string) => {
    const lower = status?.toLowerCase() || '';
    if (lower === 'in progress') return 'in-progress';
    if (lower === 'pending') return 'planning';
    return lower;
  };

  const getPDFUrl = (path: string) => {
    const baseUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api/v1', '') 
      : 'http://localhost:3000';
    return `${baseUrl}/${path.replace(/\\/g, '/')}`;
  };

  const handleSendToClient = async (proposalId: string) => {
    if (!window.confirm("Send this proposal to the client? This will email them and update their dashboard.")) return;
    
    setSendingId(proposalId);
    try {
      await api.post(`/proposals/${proposalId}/send`, {});
      toast.success("Proposal sent successfully!");
      fetchData(); // Refresh to update status
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send proposal");
    } finally {
      setSendingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-[#2EC4B6] animate-spin" />
      </div>
    );
  }

  const relevantRequests = requests.filter(r => 
    r.status === 'pending' || 
    r.status === 'assigned' || 
    r.status === 'new' || 
    r.status === 'quoted'
  );

  return (
    <>
      <div className="mb-6">
        <p className="text-sm text-[#4A5568] mb-2">Agent Dashboard</p>
      </div>

      <div className="mb-8">
        <h1 className="mb-1 text-[#1A202C]">Welcome back! 👋</h1>
        <p className="text-[#4A5568]">Here's what needs your attention today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <p className="text-sm text-[#4A5568]">Relevant Requests</p>
            <div className="w-8 h-8 bg-[#2EC4B6]/10 rounded-lg flex items-center justify-center">
              <Briefcase className="text-[#2EC4B6]" size={20} />
            </div>
          </div>
          <p className="text-3xl text-[#2EC4B6]">{relevantRequests.length}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <p className="text-sm text-[#4A5568]">Active Projects</p>
            <div className="w-8 h-8 bg-[#F39C12]/10 rounded-lg flex items-center justify-center">
              <FolderOpen className="text-[#F39C12]" size={20} />
            </div>
          </div>
          <p className="text-3xl text-[#F39C12]">{projects.length}</p>
        </div>
      </div>

      {/* Service Requests Table */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="text-[#2EC4B6]" size={20} />
            <h3 className="text-[#1A202C]">Service Requests</h3>
          </div>
          <p className="text-sm text-[#4A5568]">Manage client requests and proposals.</p>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs text-[#4A5568] font-semibold">Client</th>
                <th className="px-6 py-3 text-left text-xs text-[#4A5568] font-semibold">Category</th>
                <th className="px-6 py-3 text-left text-xs text-[#4A5568] font-semibold">Priority</th>
                <th className="px-6 py-3 text-left text-xs text-[#4A5568] font-semibold">Date</th>
                <th className="px-6 py-3 text-left text-xs text-[#4A5568] font-semibold">Status</th>
                <th className="px-6 py-3 text-center text-xs text-[#4A5568] font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {relevantRequests.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-[#4A5568]">No requests found.</td></tr>
              ) : (
                relevantRequests.map((request) => (
                  <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-[#1A202C]">{request.client}</p>
                        <p className="text-xs text-[#4A5568]">{request.clientEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#1A202C]">{request.category}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        request.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {request.priority || 'Medium'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#4A5568]">{request.createdAt}</td>
                    <td className="px-6 py-4">
                      {/* Custom Badge Logic based on Proposal Status */}
                      {request.proposalStatus === 'Draft' ? (
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">Draft Generated</span>
                      ) : request.proposalStatus === 'Sent' ? (
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">Sent to Client</span>
                      ) : (
                        <StatusBadge status={request.status} label="Pending Review" />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        
                        {/* CASE 1: No PDF Generated yet */}
                        {!request.pdfPath && (
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowProposalModal(true);
                            }}
                            className="bg-[#2EC4B6] text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-[#26a599] transition-colors flex items-center gap-1"
                          >
                            <FilePlus size={14} /> Create Proposal
                          </button>
                        )}

                        {/* CASE 2: PDF Generated (Draft or Sent) */}
                        {request.pdfPath && (
                          <>
                            {/* 1. View PDF */}
                            <button
                              onClick={() => window.open(getPDFUrl(request.pdfPath), '_blank')}
                              className="text-gray-600 hover:text-[#3498DB] p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                              title="View Generated PDF"
                            >
                              <Eye size={16} />
                            </button>

                            {/* 2. Send to Client (Only if Draft) */}
                            {request.proposalStatus === 'Draft' && (
                              <button
                                onClick={() => handleSendToClient(request.proposalId)}
                                disabled={sendingId === request.proposalId}
                                className="text-white bg-[#3498DB] hover:bg-[#2980B9] px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1 transition-colors disabled:opacity-70"
                                title="Send to Client Dashboard & Email"
                              >
                                {sendingId === request.proposalId ? <Loader2 className="animate-spin" size={14}/> : <Send size={14} />}
                                Send to Client
                              </button>
                            )}

                            {/* 3. Re-create / Overwrite */}
                            <button
                              onClick={() => {
                                if(window.confirm("This will overwrite the existing proposal draft. Continue?")) {
                                  setSelectedRequest(request);
                                  setShowProposalModal(true);
                                }
                              }}
                              className="text-gray-500 hover:text-[#E74C3C] p-2 rounded-lg hover:bg-red-50 transition-colors"
                              title="Create New (Overwrite)"
                            >
                              <RefreshCw size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Projects */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FolderOpen className="text-[#F39C12]" size={20} />
              <h3 className="text-[#1A202C]">Active Projects</h3>
            </div>
            <p className="text-sm text-[#4A5568]">Manage ongoing client projects</p>
          </div>
          <button onClick={() => navigate('/agent/projects')} className="text-[#2EC4B6] hover:text-[#26a599] text-sm font-medium">
            View All
          </button>
        </div>

        <div className="p-6 space-y-4">
          {projects.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No active projects.</div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:border-[#2EC4B6] transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-[#1A202C] mb-1">{project.name}</h4>
                    <p className="text-sm text-[#4A5568]">{project.client}</p>
                  </div>
                  <StatusBadge status={project.status} />
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-xs text-[#4A5568]">
                    <Clock size={14} />
                    <span>ECD: {project.ecd}</span>
                  </div>
                  <button
                    onClick={() => navigate('/agent/project-management/' + project.id)}
                    className="text-[#2EC4B6] hover:text-[#26a599] text-sm font-medium"
                  >
                    Manage →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Proposal Generator Modal */}
      {showProposalModal && selectedRequest && (
        <ProposalGenerator
          requestId={selectedRequest.id}
          clientEmail={selectedRequest.clientEmail}
          clientName={selectedRequest.client}
          serviceCategory={selectedRequest.category}
          onClose={() => {
            setShowProposalModal(false);
            setSelectedRequest(null);
          }}
          onSuccess={() => {
            fetchData(); 
          }}
        />
      )}
    </>
  );
}