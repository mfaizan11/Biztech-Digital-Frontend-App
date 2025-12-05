import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Power, Search, Building } from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';

export function AdminClients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await api.get('/admin/clients');
      setClients(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (client: any) => {
    const newStatus = client.status === 'Active' ? 'Rejected' : 'Active';
    const confirmMsg = client.status === 'Active' 
      ? "Deactivate this client? They will no longer be able to log in."
      : "Activate this client account?";

    if (!window.confirm(confirmMsg)) return;

    try {
      // Re-using the generic user status update endpoint or specific client endpoint
      await api.patch(`/admin/users/${client.id}/status`, { status: newStatus });
      toast.success(`Client ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully`);
      fetchClients();
    } catch (error: any) {
      toast.error("Failed to update status");
    }
  };

  const filteredClients = clients.filter(c => 
    (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="mb-2 text-[#0D1B2A]">Client Management</h1>
          <p className="text-[#4A5568]">Oversee client accounts and activity</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2EC4B6] w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="col-span-full text-center py-8 text-[#4A5568]">Loading clients...</p>
        ) : filteredClients.length === 0 ? (
          <p className="col-span-full text-center py-8 text-[#4A5568]">No clients found.</p>
        ) : (
          filteredClients.map((client) => (
            <div key={client.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                    {(client.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#0D1B2A]">{client.name}</h3>
                    <p className="text-xs text-[#4A5568]">{client.company || 'Individual'}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  client.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {client.status}
                </span>
              </div>

              <div className="space-y-2 mb-6 text-sm">
                <div className="flex items-center gap-2 text-[#4A5568]">
                  <Mail size={14} /> <span className="truncate">{client.email}</span>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-2 text-[#4A5568]">
                    <Phone size={14} /> <span>{client.phone}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-gray-100 mb-4 text-center">
                <div>
                  <p className="text-xs text-gray-400">Projects</p>
                  <p className="font-semibold text-[#0D1B2A]">{client.totalProjects}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Active</p>
                  <p className="font-semibold text-[#2EC4B6]">{client.activeProjects}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Requests</p>
                  <p className="font-semibold text-[#0D1B2A]">{client.totalRequests}</p>
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={() => handleToggleStatus(client)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    client.status === 'Active' 
                      ? 'text-red-600 hover:bg-red-50' 
                      : 'text-green-600 hover:bg-green-50'
                  }`}
                >
                  <Power size={14} />
                  {client.status === 'Active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}