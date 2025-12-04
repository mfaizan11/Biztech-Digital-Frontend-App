import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Upload, Lock, Unlock, Download, FileText, Loader2, User, Edit2, Save, X } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { ProgressCircle } from '../components/ProgressCircle';
import api from '../lib/api';
import { toast } from 'sonner';
import { ProjectNotes } from '../components/ProjectNotes';

export function ProjectCommandCenter() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [project, setProject] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [vaultData, setVaultData] = useState<string>("");
  
  // UI State
  const [showCredentials, setShowCredentials] = useState(false);
  const [isEditingVault, setIsEditingVault] = useState(false);
  const [vaultInput, setVaultInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingVault, setIsSavingVault] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      // 1. Fetch Project
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
      setAssets(res.data.Assets || []);

      // 2. Fetch Vault (Client sees their own vault)
      const clientRes = await api.get('/clients/me');
      const fetchedVault = clientRes.data.technicalVault || "";
      setVaultData(fetchedVault);
      setVaultInput(fetchedVault); // Initialize input

    } catch (error) {
      console.error("Failed to load project", error);
      toast.error("Failed to load project details");
      navigate('/my-projects');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      
      // FIX: Explicitly set Content-Type to undefined to let browser set multipart/form-data with boundary
      const res = await api.post(`/projects/${id}/assets?type=ClientAsset`, formData, {
        headers: {
          'Content-Type': undefined
        } as any
      });
      
      toast.success("File uploaded successfully");
      setAssets(prev => [...prev, res.data]);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
      // Clear input value to allow uploading same file again if needed
      e.target.value = '';
    }
  };

  const handleSaveVault = async () => {
    try {
      setIsSavingVault(true);
      // Send updated vault data to backend (encrypted on server side)
      await api.put('/clients/me', {
        technicalVault: vaultInput
      });
      
      setVaultData(vaultInput);
      setIsEditingVault(false);
      setShowCredentials(true); // Ensure view is open to see changes
      toast.success("Credentials updated securely");
    } catch (error) {
      toast.error("Failed to save credentials");
    } finally {
      setIsSavingVault(false);
    }
  };

  const getFileUrl = (path: string) => {
    const baseUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api/v1', '') 
      : 'http://localhost:3000';
    return `${baseUrl}/${path.replace(/\\/g, '/')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#2EC4B6] animate-spin" />
      </div>
    );
  }

  if (!project) return null;

  const clientAssets = assets.filter(a => a.type === 'ClientAsset');
  const deliverables = assets.filter(a => a.type === 'Deliverable');

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      
      {/* Project Banner Header */}
      <div className="bg-[#0D1B2A] text-white py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/my-projects')}
            className="text-[#2EC4B6] hover:text-white mb-6 flex items-center gap-2 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={18} />
            Back to Projects
          </button>
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-white">{project.Request?.Category?.name || 'Project'}</h1>
                <StatusBadge status={project.globalStatus?.toLowerCase() || 'pending'} />
              </div>
              <p className="text-gray-400 text-sm">
                Project ID: #{project.id} • Started {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            {/* Agent Info Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3 border border-white/20">
              <div className="w-10 h-10 bg-[#2EC4B6] rounded-full flex items-center justify-center text-white font-bold">
                {project.Agent?.fullName?.charAt(0) || <User size={20} />}
              </div>
              <div>
                <p className="text-xs text-gray-400">Assigned Agent</p>
                <p className="text-sm font-medium text-white">{project.Agent?.fullName || 'Unassigned'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Project Overview */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="mb-4 text-[#0D1B2A] font-semibold text-lg">Project Overview</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                {project.Request?.details || 'No description available for this project.'}
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Service Type</p>
                  <p className="text-[#0D1B2A] font-medium">{project.Request?.Category?.name || 'General'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Priority</p>
                  <p className="text-[#0D1B2A] font-medium">{project.Request?.priority || 'Normal'}</p>
                </div>
              </div>
            </div>

            {/* Assets & Deliverables */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[#0D1B2A] font-semibold text-lg">Files & Deliverables</h3>
                <label className={`bg-[#2EC4B6] hover:bg-[#26a599] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm cursor-pointer ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                  {isUploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                  {isUploading ? 'Uploading...' : 'Upload File'}
                  <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                </label>
              </div>

              {/* Client Assets */}
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Your Uploads</h4>
                {clientAssets.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">You haven't uploaded any files yet.</p>
                ) : (
                  <div className="space-y-2">
                    {clientAssets.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <FileText className="text-[#3498DB] flex-shrink-0" size={20} />
                          <div className="min-w-0">
                            <p className="text-[#0D1B2A] text-sm font-medium truncate">{file.fileName}</p>
                            <p className="text-xs text-gray-500">{new Date(file.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <a 
                          href={getFileUrl(file.filePath)} 
                          target="_blank"
                          rel="noreferrer" 
                          className="text-gray-400 hover:text-[#2EC4B6] transition-colors p-1"
                        >
                          <Download size={18} />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Deliverables */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Deliverables from Agent</h4>
                {deliverables.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No deliverables uploaded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {deliverables.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-[#2EC4B6]/5 rounded-lg border border-[#2EC4B6]/10">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <FileText className="text-[#2EC4B6] flex-shrink-0" size={20} />
                          <div className="min-w-0">
                            <p className="text-[#0D1B2A] text-sm font-medium truncate">{file.fileName}</p>
                            <p className="text-xs text-gray-500">
                              Uploaded by {project.Agent?.fullName || 'Agent'} • {new Date(file.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <a 
                          href={getFileUrl(file.filePath)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#2EC4B6] hover:text-[#26a599] transition-colors p-1"
                        >
                          <Download size={18} />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* NEW: Project Notes */}
            <ProjectNotes projectId={id!} />

            {/* Technical Vault */}
            <div className="bg-[#0D1B2A] rounded-xl p-6 shadow-lg text-white border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Lock className="text-[#2EC4B6]" size={24} />
                  <h3 className="text-white font-semibold">Technical Vault</h3>
                </div>
                {!isEditingVault && (
                  <button 
                    onClick={() => {
                      setIsEditingVault(true);
                      setVaultInput(vaultData); // Pre-fill with existing data
                      setShowCredentials(true); // Ensure open when editing
                    }}
                    className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                )}
              </div>
              
              <p className="text-gray-300 mb-6 text-sm">
                Securely store credentials (host, login, API keys) accessible only to your assigned agent.
              </p>
              
              {isEditingVault ? (
                <div className="mb-4 animate-in fade-in">
                  <textarea
                    value={vaultInput}
                    onChange={(e) => setVaultInput(e.target.value)}
                    rows={6}
                    placeholder="e.g.,&#10;Host: ftp.example.com&#10;User: admin&#10;Pass: secret123"
                    className="w-full bg-black/40 border border-[#2EC4B6]/50 rounded-lg p-3 text-sm text-white font-mono focus:outline-none focus:border-[#2EC4B6] resize-y"
                  />
                  <div className="flex gap-2 mt-3">
                    <button 
                      onClick={handleSaveVault}
                      disabled={isSavingVault}
                      className="bg-[#2EC4B6] hover:bg-[#26a599] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors disabled:opacity-70"
                    >
                      {isSavingVault ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                      Save
                    </button>
                    <button 
                      onClick={() => {
                        setIsEditingVault(false);
                        setVaultInput(vaultData); // Revert
                      }}
                      disabled={isSavingVault}
                      className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      <X size={14} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {showCredentials && (
                    <div className="bg-white/10 rounded-lg p-4 mb-4 border border-white/10 animate-in fade-in slide-in-from-top-2">
                      <p className="font-mono text-sm text-[#2EC4B6] whitespace-pre-wrap break-all">
                        {vaultData || "No credentials saved."}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => setShowCredentials(!showCredentials)}
                    className="w-full bg-[#2EC4B6] hover:bg-[#26a599] text-white font-medium px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    {showCredentials ? <Lock size={18} /> : <Unlock size={18} />}
                    {showCredentials ? 'Hide Credentials' : 'Reveal Credentials'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right Column - Progress Metrics */}
          <div className="space-y-6">
            
            {/* Progress Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
              <h4 className="mb-6 text-[#0D1B2A] font-semibold">Project Progress</h4>
              <div className="flex justify-center mb-6">
                <ProgressCircle percentage={project.progressPercent || 0} size={140} />
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Current Status</p>
                <p className="text-[#0D1B2A] font-medium">{project.globalStatus || 'Pending'}</p>
              </div>
            </div>

            {/* ECD Card */}
            <div className="bg-gradient-to-br from-[#2EC4B6] to-[#26a599] rounded-xl p-6 shadow-lg text-white">
              <div className="flex items-center gap-3 mb-3">
                <Calendar size={24} />
                <h4 className="font-semibold">Estimated Completion</h4>
              </div>
              <p className="text-3xl font-bold">
                {project.ecd 
                  ? new Date(project.ecd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : 'TBD'}
              </p>
              {project.ecd && (
                <p className="text-sm text-white/80 mt-2">
                  {Math.ceil((new Date(project.ecd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
                </p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}