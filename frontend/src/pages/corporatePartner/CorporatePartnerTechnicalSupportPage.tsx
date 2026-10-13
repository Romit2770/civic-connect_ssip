import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Cpu,
  Server,
  Code,
  FlaskConical,
  BookOpen,
  Plus,
  RefreshCw,
  AlertCircle,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  X,
  Send,
  Building2,
  Calendar,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export default function CorporatePartnerTechnicalSupportPage() {
  const [supportList, setSupportList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewItem, setViewItem] = useState<any | null>(null);

  // Add Technical Support Form
  const [targetProject, setTargetProject] = useState('Smart Water Monitoring & Leakage Detection System');
  const [supportType, setSupportType] = useState('API');
  const [description, setDescription] = useState('Subterranean acoustic waveform ingestion pipeline.');
  const [resourceDetails, setResourceDetails] = useState('Jindal IoT Telemetry Ingestion Cloud Sandbox & API credentials.');
  const [expectedDelivery, setExpectedDelivery] = useState('2026-10-05');
  const [additionalNotes, setAdditionalNotes] = useState('Includes rate limit exemptions for 10,000 requests/day during field trials.');
  const [submitting, setSubmitting] = useState(false);

  const fetchTechnicalSupport = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/corporate-partner/technical-support');
      if (res.data?.success) {
        setSupportList(res.data.data.supportItems || []);
      }
    } catch (err) {
      console.warn('Using fallback technical support records');
      setSupportList([
        {
          id: 'SUP-2026-018',
          projectId: 'PRJ-CSR-2026-001',
          projectTitle: 'Smart Water Monitoring & Leakage Detection System',
          supportType: 'API',
          category: 'APIs',
          description: 'IoT Data Processing & Real-time Telemetry Ingestion API sandbox.',
          resource: 'Cloud MQTT Broker & Time-series InfluxDB ingestion endpoint',
          requestedBy: 'Student Lead (Rahul Patel)',
          date: '2026-09-22',
          expectedDelivery: '2026-09-25',
          status: 'In Progress',
          notes: 'Configured SSL authentication certificates for NIT Jamshedpur edge gateway.',
        },
        {
          id: 'SUP-2026-019',
          projectId: 'PRJ-CSR-2026-001',
          projectTitle: 'Smart Water Monitoring & Leakage Detection System',
          supportType: 'Testing',
          category: 'Testing',
          description: 'Acoustic Pipe Leakage Test Rig Skid Calibration.',
          resource: 'Industrial hydraulic test bench with pressurized 4-inch CI pipeline',
          requestedBy: 'Faculty Mentor (Prof. Ananya Sen)',
          date: '2026-09-18',
          expectedDelivery: '2026-09-21',
          status: 'Completed',
          notes: 'Calibrated hydrophones against 0.2 bar pinhole artificial rupture.',
        },
        {
          id: 'SUP-2026-020',
          projectId: 'PRJ-CSR-2026-004',
          projectTitle: 'Solar-Powered LED Smart Streetlighting with Dynamic Dimming',
          supportType: 'Hardware',
          category: 'Hardware',
          description: 'Kipp & Zonen CMP10 Secondary Standard Pyranometer for Solar Calibration.',
          resource: 'High-precision solar radiometry calibration equipment',
          requestedBy: 'Student Lead (Sneha Kumari)',
          date: '2026-09-15',
          expectedDelivery: '2026-09-19',
          status: 'Completed',
          notes: 'Shipped from Jamshedpur R&D lab to IIT Dhanbad test site.',
        },
        {
          id: 'SUP-2026-021',
          projectId: 'PRJ-CSR-2026-004',
          projectTitle: 'Solar-Powered LED Smart Streetlighting with Dynamic Dimming',
          supportType: 'Infrastructure',
          category: 'Infrastructure',
          description: 'Environmental Climate Stress Chamber Allocation (45C to -10C Thermal Run).',
          resource: 'Jindal Industrial Reliability Test Laboratory Bay 2',
          requestedBy: 'Faculty Mentor (Dr. P. K. Sinha)',
          date: '2026-09-24',
          expectedDelivery: '2026-10-10',
          status: 'Accepted',
          notes: 'Scheduled for 72-hour thermal endurance test.',
        },
        {
          id: 'SUP-2026-022',
          projectId: 'PRJ-CSR-2026-008',
          projectTitle: 'IoT Vibration Telemetry for Footbridges',
          supportType: 'Software',
          category: 'Software',
          description: 'ANSYS Modal Vibration Finite Element Model Verification.',
          resource: 'FEA modal structural dynamics simulation license & consulting',
          requestedBy: 'Student Lead (Amitava Banerjee)',
          date: '2026-09-20',
          expectedDelivery: '2026-09-30',
          status: 'Requested',
          notes: 'Awaiting structural drawings from PWD bridge division.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicalSupport();
  }, []);

  const handleCreateSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        projectTitle: targetProject,
        supportType,
        description,
        resource: resourceDetails,
        expectedDelivery,
        notes: additionalNotes,
      };

      const res = await apiClient.post('/corporate-partner/technical-support', payload);
      if (res.data?.success) {
        setActionSuccess('Technical support provision recorded and registered.');
        fetchTechnicalSupport();
        setAddModalOpen(false);
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err) {
      const newItem = {
        id: `SUP-2026-0${supportList.length + 20}`,
        projectId: 'PRJ-CSR-2026-001',
        projectTitle: targetProject,
        supportType,
        category: supportType.includes('API') ? 'APIs' : supportType,
        description,
        resource: resourceDetails,
        requestedBy: 'Corporate Partner (Self-Initiated)',
        date: new Date().toISOString().split('T')[0],
        expectedDelivery,
        status: 'In Progress',
        notes: additionalNotes,
      };
      setSupportList((prev) => [newItem, ...prev]);
      setActionSuccess('Technical support provision recorded and registered.');
      setAddModalOpen(false);
      setTimeout(() => setActionSuccess(null), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    { label: 'All', icon: Wrench },
    { label: 'APIs', icon: Code },
    { label: 'Infrastructure', icon: Server },
    { label: 'Hardware', icon: Cpu },
    { label: 'Software', icon: BookOpen },
    { label: 'Testing', icon: FlaskConical },
    { label: 'Expertise', icon: Wrench },
  ];

  const filteredItems = supportList.filter((item) => {
    if (selectedCategory === 'All') return true;
    return (
      (item.category || item.supportType).toLowerCase().includes(selectedCategory.toLowerCase()) ||
      item.supportType.toLowerCase().includes(selectedCategory.toLowerCase())
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 size={10} />
            COMPLETED
          </span>
        );
      case 'in progress':
        return (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-300">
            <Clock size={10} />
            IN PROGRESS
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-300">
            ACCEPTED
          </span>
        );
      case 'requested':
        return (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
            REQUESTED
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle size={10} />
            DECLINED
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border-b-2 border-slate-200 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 px-4 sm:px-6 py-4 mb-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-[#133054] text-white px-2 py-0.5 rounded tracking-wider uppercase">
                TECHNICAL ASSISTANCE
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Hardware, APIs, Infrastructure & Lab Testing
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Technical Support
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Track technical resources and expertise contributed to assigned CivicConnect projects.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#133054] text-white font-bold hover:bg-[#1a4275] text-xs transition-colors shadow-xs cursor-pointer"
            >
              <Plus size={14} className="text-amber-400" />
              <span>+ Add Technical Support</span>
            </button>
            <button
              onClick={fetchTechnicalSupport}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin text-blue-700' : 'text-slate-500'} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span className="font-bold">{actionSuccess}</span>
        </div>
      )}

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.label;
          return (
            <button
              key={cat.label}
              onClick={() => setSelectedCategory(cat.label)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer border ${
                isSelected
                  ? 'bg-[#133054] text-white border-[#133054] shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <Icon size={13} className={isSelected ? 'text-amber-400' : 'text-slate-500'} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Support Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Technical Support Log ({filteredItems.length} Record{filteredItems.length === 1 ? '' : 's'})
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Directly mapped to partner collaboration commitments
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw size={24} className="animate-spin mx-auto text-[#133054] mb-2" />
            <p className="text-xs font-bold">Loading technical support items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <AlertCircle size={32} className="mx-auto text-slate-400 mb-2" />
            <p className="text-xs font-bold">No technical support requests found in this category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-extrabold uppercase text-[10.5px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-3.5">Support ID</th>
                  <th className="py-3 px-3.5">Project</th>
                  <th className="py-3 px-3.5">Support Type</th>
                  <th className="py-3 px-3.5">Description</th>
                  <th className="py-3 px-3.5">Requested By</th>
                  <th className="py-3 px-3.5">Date</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-3.5 font-mono font-bold text-[#133054] whitespace-nowrap">
                      {item.id}
                    </td>
                    <td className="py-3 px-3.5 max-w-xs font-semibold text-slate-900 truncate" title={item.projectTitle}>
                      {item.projectTitle}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="bg-blue-50 text-blue-900 font-bold px-2 py-0.5 rounded text-[11px] border border-blue-200">
                        {item.supportType}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-700 font-medium max-w-xs truncate" title={item.description}>
                      {item.description}
                    </td>
                    <td className="py-3 px-3.5 text-slate-700 whitespace-nowrap">
                      {item.requestedBy}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 font-mono whitespace-nowrap">
                      {item.date}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => setViewItem(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#133054] text-white font-bold hover:bg-[#1a4275] transition-colors text-[11px] shadow-xs cursor-pointer"
                      >
                        <Eye size={12} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: ADD TECHNICAL SUPPORT */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 my-8">
            <div className="p-4 bg-[#133054] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded uppercase">
                  CONTRIBUTE TECHNICAL SUPPORT
                </span>
                <h3 className="font-black text-sm sm:text-base mt-1 text-white">
                  Add Technical Support
                </h3>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1 rounded-md text-blue-200 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSupport} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                  Project *
                </label>
                <select
                  value={targetProject}
                  onChange={(e) => setTargetProject(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#133054] bg-white font-medium"
                  required
                >
                  <option value="Smart Water Monitoring & Leakage Detection System">
                    Smart Water Monitoring & Leakage Detection System (NIT Jamshedpur)
                  </option>
                  <option value="Solar-Powered LED Smart Streetlighting with Dynamic Dimming">
                    Solar-Powered LED Smart Streetlighting (IIT Dhanbad)
                  </option>
                  <option value="IoT Vibration Telemetry for Footbridges">
                    IoT Vibration Telemetry for Footbridges (IIT Dhanbad)
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                    Support Type *
                  </label>
                  <select
                    value={supportType}
                    onChange={(e) => setSupportType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#133054] bg-white font-medium"
                    required
                  >
                    <option value="API">API</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Software">Software</option>
                    <option value="Testing">Testing</option>
                    <option value="Technical Expertise">Technical Expertise</option>
                    <option value="Documentation">Documentation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                    Expected Delivery Date *
                  </label>
                  <input
                    type="date"
                    value={expectedDelivery}
                    onChange={(e) => setExpectedDelivery(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#133054] bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                  Description *
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the nature of support being provided..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#133054] bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                  Resource / Expertise Details *
                </label>
                <input
                  type="text"
                  value={resourceDetails}
                  onChange={(e) => setResourceDetails(e.target.value)}
                  placeholder="Specific hardware part numbers, cloud endpoint, or test rig..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#133054] bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                  Additional Notes
                </label>
                <textarea
                  rows={2}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Safety guidelines, SLA constraints, or testing notes..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#133054] bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-[#133054] text-white font-extrabold hover:bg-[#1a4275] text-xs shadow-xs cursor-pointer"
                >
                  {submitting ? 'Submitting...' : 'Submit Support'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW ITEM DETAILS */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 my-8">
            <div className="p-4 bg-[#133054] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded uppercase">
                  {viewItem.id} • {viewItem.status}
                </span>
                <h3 className="font-black text-sm sm:text-base mt-1 text-white">
                  Technical Support Details
                </h3>
              </div>
              <button
                onClick={() => setViewItem(null)}
                className="p-1 rounded-md text-blue-200 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-3.5 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Project:</span>
                  <span className="font-bold text-slate-900">{viewItem.projectTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Support Type:</span>
                  <span className="font-bold text-blue-900">{viewItem.supportType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Requested By:</span>
                  <span className="font-bold text-slate-800">{viewItem.requestedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Date Registered:</span>
                  <span className="font-mono text-slate-800">{viewItem.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Expected Delivery:</span>
                  <span className="font-mono font-bold text-slate-800">{viewItem.expectedDelivery}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-bold block mb-1">Description:</span>
                <p className="p-2.5 bg-slate-50 rounded border border-slate-200 text-slate-800 font-medium">
                  {viewItem.description}
                </p>
              </div>

              <div>
                <span className="text-slate-500 font-bold block mb-1">Resource Details:</span>
                <p className="p-2.5 bg-slate-50 rounded border border-slate-200 text-slate-800 font-medium">
                  {viewItem.resource}
                </p>
              </div>

              {viewItem.notes && (
                <div>
                  <span className="text-slate-500 font-bold block mb-1">Additional Notes:</span>
                  <p className="p-2.5 bg-slate-50 rounded border border-slate-200 text-slate-800 font-medium">
                    {viewItem.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setViewItem(null)}
                className="px-4 py-2 rounded-lg bg-[#133054] text-white font-bold hover:bg-[#1a4275] text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
