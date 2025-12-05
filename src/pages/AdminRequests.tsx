import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, User, ArrowLeft, Clock, Briefcase, FileCheck, ArrowRight, Loader2, Search } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import api from '../lib/api';
import { toast } from 'sonner';

interface TimelineItem {
  requestId: string;
  category: string;
  details: string;
  requestDate: string;
  requestStatus: string;
  agentName: string | null;
  proposal: {
    id: string;
    status: string;
    amount: string;
    date: string;
    pdf: string;
  } | null;
  project: {
    id: string;
    status: string;
    progress: number;
    startDate: string;
    completionDate: string;
  } | null;
}

interface ClientSummary {
  clientId: string;
  name: string;
  company: string;
  email: string;
  totalRequests: number;
}

export function AdminRequests() {
  const navigate = useNavigate();
  const [view, setView] = useState<'list' | 'timeline'>('list');
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientSummary | null>(null);
  const [timelineData, setTimelineData] = useState<TimelineItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      // This hits /api/v1/admin/clients - Must correspond to backend route
      const res = await api.get('/admin/clients');
      const formatted = res.data.map((c: any) => ({
        clientId: c.clientId,
        name: c.name,
        company: c.company,
        email: c.email,
        totalRequests: c.totalRequests
      }));
      setClients(formatted);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  const handleClientClick = async (client: ClientSummary) => {
    setSelectedClient(client);
    setView('timeline');
    setLoading(true);
    try {
      // This hits /api/v1/requests/timeline/:id
      const res = await api.get(`/requests/timeline/${client.clientId}`);
      setTimelineData(res.data);
    } catch (error) {
      toast.error("Failed to load timeline");
      setView('list');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setView('list');
    setSelectedClient(null);
    setTimelineData([]);
  };

  const handleViewPdf = (pdfPath: string) => {
    const baseUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api/v1', '') 
      : 'http://localhost:3000';
    const fullUrl = `${baseUrl}/${pdfPath.replace(/\\/g, '/')}`;
    window.open(fullUrl, '_blank');
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="mb-8">
        <h1 className="mb-2 text-[#0D1B2A]">Request Timelines</h1>
        <p className="text-[#4A5568]">Track the complete lifecycle of client requests</p>
      </div>

      {view === 'list' && (
        <>
          <div className="mb-6 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by client or company..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2EC4B6]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full flex justify-center py-12">
                <Loader2 className="animate-spin text-[#2EC4B6]" size={32} />
              </div>
            ) : filteredClients.length === 0 ? (
              <p className="col-span-full text-center text-gray-500 py-12">No clients found.</p>
            ) : (
              filteredClients.map(client => (
                <div 
                  key={client.clientId}
                  onClick={() => handleClientClick(client)}
                  className="bg-white rounded-xl border border-gray-200 p-6 cursor-pointer hover:border-[#2EC4B6] hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold group-hover:bg-[#2EC4B6] group-hover:text-white transition-colors">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#0D1B2A]">{client.name}</h3>
                        <p className="text-xs text-gray-500">{client.company}</p>
                      </div>
                    </div>
                    <div className="bg-[#F0FDFA] text-[#2EC4B6] px-2 py-1 rounded text-xs font-bold">
                      {client.totalRequests} Requests
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400 group-hover:text-[#2EC4B6] transition-colors mt-4">
                    <span>View Timeline</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {view === 'timeline' && selectedClient && (
        <div className="animate-in slide-in-from-right-4 fade-in duration-300">
          <button 
            onClick={handleBack} 
            className="flex items-center gap-2 text-gray-500 hover:text-[#0D1B2A] mb-6 transition-colors"
          >
            <ArrowLeft size={18} /> Back to Clients
          </button>

          <div className="bg-[#0D1B2A] text-white p-6 rounded-xl shadow-lg mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{selectedClient.name}</h2>
              <p className="text-gray-400">{selectedClient.company}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Total Requests</p>
              <p className="text-xl font-bold">{timelineData.length}</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-[#2EC4B6]" size={32} />
            </div>
          ) : timelineData.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <Clock className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-500">No request history found for this client.</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto pb-12">
              {timelineData.map(item => (
                <div key={item.requestId} className="mb-8 relative pl-8 border-l-2 border-gray-200 last:border-0">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#2EC4B6] border-4 border-white shadow-sm"></div>
                  
                  {/* Request Block */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4 relative hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-[#2EC4B6]/10 text-[#2EC4B6] text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                            Request #{item.requestId}
                          </span>
                          <span className="text-sm text-gray-500">{new Date(item.requestDate).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-lg font-bold text-[#0D1B2A]">{item.category}</h3>
                      </div>
                      <StatusBadge status={item.requestStatus.toLowerCase()} />
                    </div>
                    
                    <p className="text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg text-sm border border-gray-100">
                      {item.details}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <User size={14} />
                      <span>Assigned Agent: <span className="font-medium text-[#0D1B2A]">{item.agentName || 'Pending Assignment'}</span></span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 border-t border-gray-100 pt-4">
                      {/* Proposal Step */}
                      <div className={`p-4 rounded-lg border ${item.proposal ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100 border-dashed'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <FileCheck size={18} className={item.proposal ? 'text-blue-600' : 'text-gray-400'} />
                          <span className={`font-semibold ${item.proposal ? 'text-blue-900' : 'text-gray-400'}`}>Proposal</span>
                        </div>
                        {item.proposal ? (
                          <>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-blue-700">Status: {item.proposal.status}</span>
                              <span className="font-bold text-blue-900">${item.proposal.amount}</span>
                            </div>
                            {item.proposal.pdf && (
                              <button 
                                onClick={() => handleViewPdf(item.proposal!.pdf)}
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-2"
                              >
                                <Download size={12} /> View PDF
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">Not generated yet</span>
                        )}
                      </div>

                      {/* Project Step */}
                      <div className={`p-4 rounded-lg border ${item.project ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100 border-dashed'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Briefcase size={18} className={item.project ? 'text-green-600' : 'text-gray-400'} />
                          <span className={`font-semibold ${item.project ? 'text-green-900' : 'text-gray-400'}`}>Active Project</span>
                        </div>
                        {item.project ? (
                          <>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-green-700">{item.project.status}</span>
                              <span className="font-bold text-green-900">{item.project.progress}%</span>
                            </div>
                            <div className="w-full bg-green-200 rounded-full h-1.5 mb-2">
                              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${item.project.progress}%` }}></div>
                            </div>
                            {item.project.completionDate && (
                              <p className="text-xs text-green-700 mt-1">ECD: {item.project.completionDate}</p>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">Project not started</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="pl-8 relative">
                <div className="absolute -left-[5px] top-0 w-3 h-3 rounded-full bg-gray-300"></div>
                <p className="text-sm text-gray-400">Account Created</p>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}