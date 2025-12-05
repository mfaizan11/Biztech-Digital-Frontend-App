import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Loader2, Search } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import api from '../lib/api';
import { toast } from 'sonner';

export function AdminProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      const mapped = res.data.map((p: any) => ({
        id: p.id,
        name: p.Request?.Category?.name || 'Project',
        clientName: p.Client?.companyName || p.Client?.User?.fullName || 'Unknown',
        agentName: p.Agent?.fullName || 'Unassigned',
        status: p.globalStatus,
        progress: p.progressPercent,
        ecd: p.ecd ? new Date(p.ecd).toLocaleDateString() : 'TBD',
        createdAt: new Date(p.createdAt).toLocaleDateString()
      }));
      setProjects(mapped);
    } catch (error) {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesFilter = filter === 'All' || p.status === filter;
    const matchesSearch = 
      p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.agentName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="mb-2 text-[#0D1B2A]">Global Projects</h1>
          <p className="text-[#4A5568]">Oversee all ongoing and completed projects</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['All', 'Pending', 'In Progress', 'Delivered'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === status 
                  ? 'bg-[#2EC4B6] text-white' 
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search client or agent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2EC4B6] w-full md:w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#4A5568]">Project</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#4A5568]">Client</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#4A5568]">Assigned Agent</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#4A5568]">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#4A5568]">ECD</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#4A5568]">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-[#2EC4B6]" /></td></tr>
              ) : filteredProjects.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No projects match your criteria.</td></tr>
              ) : (
                filteredProjects.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-[#1A202C]">Project #{p.id}</p>
                      <p className="text-xs text-[#4A5568]">{p.name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#1A202C]">{p.clientName}</td>
                    <td className="px-6 py-4 text-sm text-[#4A5568]">{p.agentName}</td>
                    <td className="px-6 py-4">
                      <div className="w-24">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{p.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-[#2EC4B6] h-1.5 rounded-full" style={{ width: `${p.progress}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#4A5568]">{p.ecd}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={p.status.toLowerCase()} />
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