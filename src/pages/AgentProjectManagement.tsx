import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Calendar, Settings, Lock, FileText, Download, Loader2, Eye, EyeOff } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { ProgressCircle } from '../components/ProgressCircle';
import { ProjectNotes } from '../components/ProjectNotes';
import api from '../lib/api';
import { toast } from 'sonner';

export function AgentProjectManagement() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [project, setProject] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [vaultData, setVaultData] = useState<string | null>(null);
  const [showVault, setShowVault] = useState(false);

  // Form State
  const [progress, setProgress] = useState(0);
  const [ecd, setEcd] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      const projectData = res.data;
      
      setProject(projectData);
      setProgress(projectData.progressPercent || 0);
      setEcd(projectData.ecd || '');
      setAssets(projectData.Assets || []); 
    } catch (error) {
      toast.error("Failed to load project details");
      navigate('/agent/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStatus = async () => {
    try {
      setIsSaving(true);
      await api.patch(`/projects/${id}`, {
        progressPercent: progress,
        ecd: ecd
      });
      toast.success("Project status updated successfully");
      // Update local state to reflect changes in UI instantly
      setProject((prev: any) => ({ ...prev, progressPercent: progress, ecd: ecd }));
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      // Query param type=Deliverable marks this as an agent upload
      // Content-Type is undefined to let browser set boundary
      const res = await api.post(`/projects/${id}/assets?type=Deliverable`, formData, {
        headers: { 'Content-Type': undefined } as any
      });
      
      toast.success("File uploaded successfully");
      setAssets([...assets, res.data]); // Add new asset to list
    } catch (error) {
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleToggleVault = async () => {
    if (showVault) {
      setShowVault(false);
      return;
    }

    try {
      const res = await api.get(`/projects/${id}/vault`);
      setVaultData(res.data.vault);
      setShowVault(true);
    } catch (error) {
      toast.error("Failed to access client vault");
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
      <div className="flex items-center justify-center h-screen bg-[#F8F9FA]">
        <Loader2 className="w-8 h-8 text-[#2EC4B6] animate-spin" />
      </div>
    );
  }

  // Filter assets
  const clientAssets = assets.filter(a => a.type === 'ClientAsset');
  const deliverables = assets.filter(a => a.type === 'Deliverable');

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <header className="bg-[#0D1B2A] text-white py-6 px-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/agent/dashboard')}
            className="text-[#2EC4B6] hover:text-white mb-4 flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="mb-2 text-2xl font-bold text-white">{project?.Request?.Category?.name || 'Project'} Request</h2>
              <p className="text-gray-400 text-sm">Client: {project?.Client?.companyName || 'Unknown'}</p>
            </div>
            <StatusBadge status={project?.globalStatus?.toLowerCase() || 'pending'} />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Controls */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Update Status Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="text-[#2EC4B6]" size={24} />
                <h3 className="text-[#0D1B2A] font-semibold">Update Project Status</h3>
              </div>

              <div className="mb-6">
                <label className="block mb-3 text-sm text-gray-700">Progress Percentage</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) => setProgress(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2EC4B6]"
                  />
                  <div className="w-16 text-center font-mono font-bold text-[#2EC4B6]">
                    {progress}%
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block mb-3 text-sm text-gray-700">Estimated Completion Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="date"
                    value={ecd}
                    onChange={(e) => setEcd(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#2EC4B6]"
                  />
                </div>
              </div>

              <button 
                onClick={handleSaveStatus}
                disabled={isSaving}
                className="w-full bg-[#2EC4B6] hover:bg-[#26a599] text-white px-4 py-3 rounded-lg transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : 'Save Changes'}
              </button>
            </div>

            {/* Upload Deliverables */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <Upload className="text-[#2EC4B6]" size={24} />
                <h3 className="text-[#0D1B2A] font-semibold">Upload Deliverables</h3>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#2EC4B6] transition-colors relative">
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="animate-spin text-[#2EC4B6] mb-2" size={32} />
                    <p className="text-gray-500">Uploading...</p>
                  </div>
                ) : (
                  <>
                    <input 
                      type="file" 
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                    <p className="text-gray-700 mb-2 font-medium">Click or Drag to Upload</p>
                    <p className="text-xs text-gray-500">Supported: PDF, ZIP, PNG, JPG</p>
                  </>
                )}
              </div>

              {/* List Uploaded Deliverables */}
              {deliverables.length > 0 && (
                <div className="mt-6 space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Uploaded Files</h4>
                  {deliverables.map((file, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileText size={16} className="text-[#2EC4B6] flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate">{file.fileName}</span>
                      </div>
                      <a 
                        href={getFileUrl(file.filePath)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-[#2EC4B6]"
                      >
                        <Download size={16} />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Client Assets - Added Back */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="mb-4 text-[#0D1B2A] font-semibold">Client Assets</h3>
              {clientAssets.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No assets uploaded by client yet.</p>
              ) : (
                <div className="space-y-2">
                  {clientAssets.map((asset, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center text-blue-500 flex-shrink-0">
                          <FileText size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[#0D1B2A] text-sm font-medium truncate">{asset.fileName}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(asset.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <a
                        href={getFileUrl(asset.filePath)}
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="text-[#2EC4B6] hover:text-[#26a599] transition-colors p-2 rounded hover:bg-gray-100"
                        title="Download Asset"
                      >
                        <Download size={16} />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Project Notes */}
            <ProjectNotes projectId={id!} />

          </div>

          {/* Right Column - Preview & Info */}
          <div className="space-y-6">
            
            {/* Progress Preview */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h4 className="mb-6 text-[#0D1B2A] text-center font-semibold">Current Progress</h4>
              <div className="flex justify-center mb-4">
                <ProgressCircle percentage={progress} size={140} />
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Client View Preview</p>
              </div>
            </div>

            {/* ECD Preview */}
            <div className="bg-gradient-to-br from-[#2EC4B6] to-[#26a599] rounded-xl p-6 shadow-lg text-white">
              <div className="flex items-center gap-3 mb-3">
                <Calendar size={24} />
                <h4 className="font-semibold">Target Completion</h4>
              </div>
              <p className="text-2xl font-bold text-white">
                {ecd ? new Date(ecd).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                }) : 'Not Set'}
              </p>
              {ecd && (
                <p className="text-sm text-white mt-2">
                  {Math.ceil((new Date(ecd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
                </p>
              )}
            </div>

            {/* Project Stats */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h4 className="mb-4 text-[#0D1B2A] font-semibold">Project Stats</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Files Uploaded</span>
                  <span className="font-bold text-[#0D1B2A]">{deliverables.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Client Assets</span>
                  <span className="font-bold text-[#0D1B2A]">{clientAssets.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Days Active</span>
                  <span className="font-bold text-[#0D1B2A]">
                    {Math.floor((new Date().getTime() - new Date(project?.createdAt).getTime()) / (1000 * 3600 * 24))}
                  </span>
                </div>
              </div>
            </div>

            {/* Credentials Access */}
            <div className="bg-gradient-to-br from-[#0D1B2A] to-[#1B2838] rounded-xl p-6 shadow-lg text-white border border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <Lock size={20} className="text-[#2EC4B6]" />
                <h4 className="font-semibold">Client Credentials</h4>
              </div>
              
              {showVault ? (
                <div className="bg-black/30 p-3 rounded mb-4 break-all">
                  <p className="text-sm font-mono text-[#2EC4B6] whitespace-pre-wrap">{vaultData || "No credentials found."}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-300 mb-4">
                  Access securely stored client credentials for this project.
                </p>
              )}

              <button 
                onClick={handleToggleVault}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
              >
                {showVault ? <EyeOff size={16} /> : <Eye size={16} />}
                {showVault ? 'Hide Credentials' : 'View Vault'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}