import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Target,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  Plus,
  Users,
  Compass,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export default function UniversityChallengesPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'assigned' | 'under_review' | 'accepted' | 'rejected' | 'priority'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadChallenges();
  }, [activeTab]);

  const loadChallenges = async () => {
    setLoading(true);
    try {
      let query = `?status=${activeTab !== 'all' && activeTab !== 'priority' ? activeTab : 'all'}`;
      if (activeTab === 'priority') query += `&priority=high`;
      const res = await apiClient.get(`/university/challenges${query}`);
      if (res.data.success) {
        setChallenges(res.data.data);
      }
    } catch (err) {
      console.warn('Fallback for challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await apiClient.patch(`/university/challenges/${id}/status`, { status: newStatus });
      if (res.data.success) {
        setActionSuccess(`Challenge ${id} marked as ${newStatus}.`);
        loadChallenges();
        if (selectedItem) setSelectedItem(null);
      }
    } catch (err: any) {
      alert('Failed to update challenge status');
    }
  };

  const filtered = challenges.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return c.title.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.domain.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#133054] text-amber-400 flex items-center justify-center font-bold shadow-xs shrink-0">
            <Target size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Societal Challenge Management
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Review, accept and route municipal societal problem statements matched to university expertise.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadChallenges()}
            className="p-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-xs cursor-pointer transition-colors"
            title="Refresh List"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:text-emerald-900 p-1">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Tabs & Search Card */}
      <div className="gov-card bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Tab Header Bar */}
        <div className="border-b border-slate-200 p-3 sm:p-4 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Challenges' },
              { id: 'assigned', label: 'Assigned' },
              { id: 'under_review', label: 'Under Review' },
              { id: 'accepted', label: 'Accepted' },
              { id: 'rejected', label: 'Rejected' },
              { id: 'priority', label: 'Priority Only' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#133054] text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search challenges by ID or keyword..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700"
            />
          </div>
        </div>

        {/* Master Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#133054] text-white uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="px-4 py-3">Challenge ID</th>
                <th className="px-4 py-3">Problem Title</th>
                <th className="px-4 py-3">Domain</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Stage / Status</th>
                <th className="px-4 py-3">Assigned Faculty</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No societal challenges found matching current criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-blue-900 whitespace-nowrap">
                      {item.id}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 max-w-xs">
                      <span className="line-clamp-1">{item.title}</span>
                      <span className="text-[10px] text-slate-500 font-normal block mt-0.5">
                        {item.aiClassification}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-medium">
                      {item.domain}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {item.location}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          item.priority === 'high'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-semibold text-blue-900 block">{item.currentStage}</span>
                      <span className="text-[10px] text-slate-500 font-medium">{item.status}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-medium whitespace-nowrap">
                      {item.facultyMentor || 'Unassigned'}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          title="View Details & Review"
                        >
                          <Eye size={15} />
                        </button>
                        {item.status !== 'Accepted' && (
                          <button
                            onClick={() => handleStatusChange(item.id, 'Accepted')}
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                            title="Accept Challenge"
                          >
                            <Check size={15} />
                          </button>
                        )}
                        {item.status !== 'Rejected' && (
                          <button
                            onClick={() => handleStatusChange(item.id, 'Rejected')}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Reject Challenge"
                          >
                            <X size={15} />
                          </button>
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

      {/* Review Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 bg-[#133054] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target size={17} className="text-amber-300" />
                <h3 className="font-extrabold text-sm text-white">
                  Challenge Dossier — {selectedItem.id}
                </h3>
              </div>
              <button onClick={() => setSelectedItem(null)} className="p-1 rounded-lg text-slate-300 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs text-slate-800">
              <div>
                <span className="font-bold text-slate-900 text-sm block">{selectedItem.title}</span>
                <span className="text-[11px] text-slate-500 block">Domain: {selectedItem.domain} • Location: {selectedItem.location}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">Civic Problem Statement:</span>
                <p className="text-slate-600 leading-relaxed">{selectedItem.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px]">
                <div><span className="text-slate-500">AI Classification:</span> <strong className="block text-slate-800">{selectedItem.aiClassification}</strong></div>
                <div><span className="text-slate-500">Validation:</span> <strong className="block text-emerald-700">{selectedItem.validationStatus}</strong></div>
                <div><span className="text-slate-500">Assigned Date:</span> <strong className="block text-slate-800">{selectedItem.assignedDate}</strong></div>
                <div><span className="text-slate-500">Status:</span> <strong className="block text-blue-900">{selectedItem.status}</strong></div>
              </div>

              <div className="pt-2 flex justify-between gap-2 border-t border-slate-100">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="gov-button-secondary text-xs py-2 px-4"
                >
                  Close
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange(selectedItem.id, 'Rejected')}
                    className="px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded-md font-bold hover:bg-red-100"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedItem.id, 'Accepted')}
                    className="gov-button-primary text-xs py-2 px-4"
                  >
                    Accept Challenge
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
