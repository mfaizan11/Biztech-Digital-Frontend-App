import React, { useState } from 'react';
import { Save, Loader2, Plus, Trash2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';

interface ProposalItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface ProposalGeneratorProps {
  requestId: string;
  clientEmail: string;
  clientName: string;
  serviceCategory: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProposalGenerator({ 
  requestId, 
  clientEmail, 
  clientName, 
  serviceCategory,
  onClose,
  onSuccess
}: ProposalGeneratorProps) {
  const [proposalData, setProposalData] = useState({
    title: `${serviceCategory} Proposal`,
    clientName: clientName,
    validUntil: '',
    projectDuration: '',
    deliveryDate: '',
    description: '',
    items: [
      { id: '1', description: 'Initial Setup & Planning', quantity: 1, unitPrice: 500 }
    ] as ProposalItem[],
    terms: 'Payment terms: 50% upfront, 50% upon completion.\nAll deliverables will be provided in agreed formats.\nRevisions included: 2 rounds of revisions.',
    notes: ''
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const addItem = () => {
    const newItem: ProposalItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0
    };
    setProposalData({
      ...proposalData,
      items: [...proposalData.items, newItem]
    });
  };

  const removeItem = (id: string) => {
    setProposalData({
      ...proposalData,
      items: proposalData.items.filter(item => item.id !== id)
    });
  };

  const updateItem = (id: string, field: keyof ProposalItem, value: string | number) => {
    setProposalData({
      ...proposalData,
      items: proposalData.items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    });
  };

  const calculateSubtotal = () => {
    return proposalData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1; // 10% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      
      const backendItems = proposalData.items.map(item => ({
        description: item.description,
        price: item.quantity * item.unitPrice 
      }));

      // Only create, do NOT send email yet
      await api.post('/proposals', {
        requestId,
        items: backendItems
      });

      toast.success('Proposal Generated! You can now view or send it from the dashboard.');
      onSuccess(); // Refresh dashboard
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to generate proposal');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2EC4B6] to-[#26a599] p-6 rounded-t-2xl text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">Create Proposal Draft</h2>
              <p className="text-white/90">Prepare proposal for {clientName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-[#1A202C] mb-2">Proposal Title</label>
              <input
                type="text"
                value={proposalData.title}
                onChange={(e) => setProposalData({ ...proposalData, title: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A202C] mb-2">Client Name</label>
              <input
                type="text"
                value={proposalData.clientName}
                readOnly
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A202C] mb-2">Valid Until</label>
              <input
                type="date"
                value={proposalData.validUntil}
                onChange={(e) => setProposalData({ ...proposalData, validUntil: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A202C] mb-2">Estimated Delivery Date</label>
              <input
                type="date"
                value={proposalData.deliveryDate}
                onChange={(e) => setProposalData({ ...proposalData, deliveryDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/20"
              />
            </div>
          </div>

          {/* Project Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#1A202C] mb-2">Project Description</label>
            <textarea
              value={proposalData.description}
              onChange={(e) => setProposalData({ ...proposalData, description: e.target.value })}
              rows={4}
              placeholder="Describe the project scope, objectives, and deliverables..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/20"
            />
          </div>

          {/* Line Items */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[#0D1B2A]">Line Items</h3>
              <button
                onClick={addItem}
                className="flex items-center gap-2 text-[#2EC4B6] hover:text-[#26a599] font-medium"
              >
                <Plus size={18} />
                Add Item
              </button>
            </div>

            <div className="space-y-3">
              {proposalData.items.map((item, index) => (
                <div key={item.id} className="flex gap-3 items-start bg-gray-50 p-4 rounded-lg">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-6">
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2EC4B6]"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2EC4B6]"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <input
                        type="number"
                        placeholder="Price"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2EC4B6]"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg font-medium text-[#1A202C]">
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  {proposalData.items.length > 1 && (
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-4 bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg">
              <div className="max-w-md ml-auto space-y-2">
                <div className="flex justify-between text-[#4A5568]">
                  <span>Subtotal:</span>
                  <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#4A5568]">
                  <span>Tax (10%):</span>
                  <span className="font-medium">${calculateTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-semibold text-[#0D1B2A] pt-2 border-t-2 border-gray-300">
                  <span>Total:</span>
                  <span className="text-[#2EC4B6]">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#1A202C] mb-2">Terms & Conditions</label>
            <textarea
              value={proposalData.terms}
              onChange={(e) => setProposalData({ ...proposalData, terms: e.target.value })}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/20"
            />
          </div>

          {/* Email Preview Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Mail className="text-blue-600 flex-shrink-0 mt-1" size={20} />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 mb-1">Send to:</p>
                <p className="text-sm text-blue-700">{clientEmail}</p>
                <p className="text-xs text-blue-600 mt-2">
                  This action will generate the PDF draft. You can review and send it from the dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-2xl">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-[#2EC4B6] to-[#26a599] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2 h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {isGenerating ? 'Generating...' : 'Generate & Save Draft'}
          </button>
        </div>
      </div>
    </div>
  );
}