import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download } from 'lucide-react';
import { ServiceRequest } from '../types';
import api from '../lib/api';
import { toast } from 'sonner';

export function AdminRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get('/requests');
        setRequests(res.data);
      } catch (error) {
        toast.error("Failed to fetch requests");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleViewPdf = (pdfPath: string) => {
    const baseUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api/v1', '') 
      : 'http://localhost:3000';
    const fullUrl = `${baseUrl}/${pdfPath.replace(/\\/g, '/')}`;
    window.open(fullUrl, '_blank');
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="mb-2 text-[#0D1B2A]">Service Requests</h1>
        <p className="text-[#4A5568]">Monitor and manage all service requests</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200 flex items-center gap-2">
          <FileText className="text-[#2EC4B6]" size={24} />
          <h3 className="text-[#0D1B2A]">All Service Requests</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#4A5568]">ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#4A5568]">Client</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#4A5568]">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#4A5568]">Agent</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#4A5568]">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#4A5568]">Proposal</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center">Loading...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center">No requests found.</td></tr>
              ) : (
                requests.map((request: any) => (
                  <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-sm text-[#4A5568]">#{request.id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-[#1A202C]">{request.Client?.companyName || "Unknown"}</p>
                        <p className="text-xs text-[#4A5568]">{request.Client?.User?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{request.Category?.name}</td>
                    <td className="px-6 py-4 text-sm text-[#4A5568]">
                      {request.AssignedAgent ? request.AssignedAgent.fullName : 'Unassigned'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {request.Proposal?.pdfPath ? (
                        <button
                          onClick={() => handleViewPdf(request.Proposal.pdfPath)}
                          className="text-[#3498DB] hover:text-[#2980B9] flex items-center gap-1 text-xs font-medium"
                        >
                          <Download size={14} /> View PDF
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
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