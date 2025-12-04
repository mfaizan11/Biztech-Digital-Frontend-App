import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Briefcase, Loader2 } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { Project } from '../types';
import api from '../lib/api';
import { toast } from 'sonner';

export function AgentProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'planning' | 'in-progress' | 'review' | 'completed'>('all');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        const mappedData: Project[] = res.data.map((p: any) => ({
          id: p.id.toString(),
          name: `Project #${p.id}`,
          client: p.Client?.companyName || 'Unknown',
          category: p.Request?.Category?.name || 'Service',
          status: mapStatus(p.globalStatus),
          progress: p.progressPercent || 0,
          startDate: new Date(p.createdAt).toLocaleDateString(),
          estimatedCompletion: p.ecd ? new Date(p.ecd).toLocaleDateString() : 'TBD',
          budget: p.Request?.Proposal?.totalAmount ? `$${p.Request.Proposal.totalAmount}` : 'TBD',
          milestones: [],
          deliverables: []
        }));
        setProjects(mappedData);
      } catch (error) {
        toast.error("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const mapStatus = (status: string) => {
    const lower = status?.toLowerCase() || 'pending';
    if (lower === 'pending') return 'planning';
    if (lower === 'in progress') return 'in-progress';
    if (lower === 'delivered') return 'review';
    return lower;
  };

  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter(p => p.status === activeFilter);

  const filterButtons = [
    { id: 'all', label: 'All Projects' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'planning', label: 'Planning' },
    { id: 'review', label: 'Review' },
    { id: 'completed', label: 'Completed' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 text-[#2EC4B6] animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="mb-2 text-[#0D1B2A]">Projects</h1>
        <p className="text-[#4A5568]">Manage and track all your client projects</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <p className="text-sm text-[#4A5568] mb-2">Total Projects</p>
          <p className="text-3xl font-semibold text-[#2EC4B6]">{projects.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <p className="text-sm text-[#4A5568] mb-2">In Progress</p>
          <p className="text-3xl font-semibold text-[#F39C12]">{projects.filter(p => p.status === 'in-progress').length}</p>
        </div>
      </div>

      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        {filterButtons.map((filter) => (
          <button
            key={filter.id}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              filter.id === activeFilter
                ? 'bg-[#2EC4B6] text-white'
                : 'bg-white text-[#4A5568] border border-gray-200 hover:border-[#2EC4B6]'
            }`}
            onClick={() => setActiveFilter(filter.id as any)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-[#0D1B2A]">{project.name}</h3>
                    <StatusBadge status={project.status} />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-[#4A5568]">
                    <span>{project.client}</span>
                    <span>•</span>
                    <span>{project.category}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#4A5568] mb-1">Budget</p>
                  <p className="text-xl font-semibold text-[#2EC4B6]">{project.budget}</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#4A5568]">Progress</span>
                  <span className="text-[#1A202C] font-medium">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-[#2EC4B6] to-[#26a599] h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button
                  onClick={() => navigate(`/agent/project-management/${project.id}`)}
                  className="bg-[#2EC4B6] text-white px-6 py-2.5 rounded-lg hover:bg-[#26a599] transition-all font-medium flex items-center gap-2 h-[44px]"
                >
                  <ExternalLink size={18} />
                  Manage
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Briefcase className="mx-auto mb-4 text-gray-400" size={64} />
            <h3 className="mb-2 text-[#0D1B2A]">No Projects Found</h3>
          </div>
        )}
      </div>
    </>
  );
}