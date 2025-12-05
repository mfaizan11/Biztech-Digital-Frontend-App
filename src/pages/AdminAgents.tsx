import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Mail, Phone, Power, Trash2 } from 'lucide-react';
import { Agent } from '../types';
import { toast } from 'sonner';
import api from '../lib/api';

export function AdminAgents() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<any[]>([]);
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [newAgent, setNewAgent] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: ''
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await api.get('/admin/agents');
      const mappedAgents = res.data.map((u: any) => ({
        id: u.id,
        name: u.fullName,
        email: u.email,
        phone: u.mobile,
        status: u.status, // Preserve case for logic
        joinedDate: new Date(u.createdAt).toLocaleDateString()
      }));
      setAgents(mappedAgents);
    } catch (error) {
      toast.error("Failed to load agents");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAgent = async () => {
    if (!newAgent.fullName || !newAgent.email || !newAgent.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await api.post('/admin/agents', {
        fullName: newAgent.fullName,
        email: newAgent.email,
        mobile: newAgent.phone,
        password: newAgent.password
      });
      
      toast.success(`Agent ${newAgent.fullName} created successfully!`);
      setShowAddAgent(false);
      setNewAgent({ fullName: '', email: '', phone: '', password: '' });
      fetchAgents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create agent");
    }
  };

  const handleToggleStatus = async (agent: any) => {
    // If Active -> Set Rejected (Inactive), Else -> Set Active
    const newStatus = agent.status === 'Active' ? 'Rejected' : 'Active';
    const confirmMsg = agent.status === 'Active' 
      ? "Deactivate this agent? They will no longer be able to log in."
      : "Activate this agent account?";

    if (!window.confirm(confirmMsg)) return;

    try {
      await api.patch(`/admin/agents/${agent.id}/status`, { status: newStatus });
      toast.success(`Agent ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully`);
      fetchAgents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this agent? This action cannot be undone.")) return;

    try {
      await api.delete(`/admin/agents/${id}`);
      toast.success("Agent deleted successfully");
      fetchAgents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete agent");
    }
  };

  return (
    <>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="mb-2 text-[#0D1B2A]">Agent Management</h1>
          <p className="text-[#4A5568]">Create, manage, and monitor agent accounts</p>
        </div>
        <button
          onClick={() => setShowAddAgent(true)}
          className="flex items-center gap-2 bg-[#2EC4B6] text-white px-6 py-2.5 rounded-lg hover:bg-[#26a599] transition-all font-medium"
        >
          <Plus size={20} /> Add New Agent
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <p className="col-span-full text-center py-8 text-[#4A5568]">Loading agents...</p>
        ) : agents.length === 0 ? (
          <p className="col-span-full text-center py-8 text-[#4A5568]">No agents found.</p>
        ) : (
          agents.map((agent) => (
            <div key={agent.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow relative group">
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                    agent.status === 'Active' ? 'bg-gradient-to-br from-[#2EC4B6] to-[#26a599]' : 'bg-gray-400'
                  }`}>
                    {agent.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#0D1B2A]">{agent.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      agent.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {agent.status === 'Active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-[#4A5568]">
                  <Mail size={14} /> <span className="truncate">{agent.email}</span>
                </div>
                {agent.phone && (
                  <div className="flex items-center gap-2 text-sm text-[#4A5568]">
                    <Phone size={14} /> <span>{agent.phone}</span>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <p className="text-xs text-gray-400">Joined: {agent.joinedDate}</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleToggleStatus(agent)}
                    className={`p-2 rounded-lg transition-colors ${
                      agent.status === 'Active' 
                        ? 'text-orange-500 hover:bg-orange-50' 
                        : 'text-green-500 hover:bg-green-50'
                    }`}
                    title={agent.status === 'Active' ? 'Deactivate' : 'Activate'}
                  >
                    <Power size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(agent.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Agent"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Agent Modal */}
      {showAddAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#0D1B2A]">Add New Agent</h2>
              <button onClick={() => setShowAddAgent(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newAgent.fullName}
                  onChange={(e) => setNewAgent({ ...newAgent, fullName: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  value={newAgent.email}
                  onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="text"
                  value={newAgent.phone}
                  onChange={(e) => setNewAgent({ ...newAgent, phone: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password *</label>
                <input
                  type="password"
                  value={newAgent.password}
                  onChange={(e) => setNewAgent({ ...newAgent, password: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              
              <button onClick={handleAddAgent} className="w-full bg-[#2EC4B6] text-white py-3 rounded-lg hover:bg-[#26a599] font-medium">
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}