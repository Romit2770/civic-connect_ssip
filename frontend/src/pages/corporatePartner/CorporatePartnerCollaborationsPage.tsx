import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Handshake,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  MessageSquare,
  Building2,
  FolderGit2,
  RefreshCw,
  AlertCircle,
  Calendar,
  X,
  FileText,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export default function CorporatePartnerCollaborationsPage() {
  const navigate = useNavigate();
  const [collaborations, setCollaborations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Active' | 'Completed' | 'Declined'>('All');
  const [selectedCollab, setSelectedCollab] = useState<any | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchCollaborations = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/corporate-partner/collaborations');
      if (res.data?.success) {
        setCollaborations(res.data.data.collaborations || []);
      }
    } catch (err) {
      console.warn('Using fallback collaborations');
      setCollaborations([
        {
          id: 'COL-2026-001',
          projectId: 'PRJ-CSR-2026-001',
          challengeId: 'CH-2026-089',
          projectTitle: 'Smart Water Monitoring & Leakage Detection System',
          university: 'NIT Jamshedpur',
          department: 'Civil & Environmental Engineering',
          facultyMentor: 'Prof. Ananya Sen',
          studentLead: 'Rahul Patel',
          partnerRole: 'Technical Mentor & IoT Architect',
          startDate: '2026-07-15',
          expectedDuration: '12 Months',
          supportType: 'Technical Mentorship + Testing Skids',
          status: 'Active',
          responsibilities: [
            'Provide technical guidance on subterranean acoustic sensor deployment',
            'Conduct bi-weekly reviews with student team on LoRaWAN firmware',
            'Facilitate access to industrial test skid calibration protocols',
          ],
          universityResponsibilities: [
            'Fabricate prototype sensor housings and hydrophones in campus fab lab',
            'Provide weekly milestone progress reports and laboratory test data',
            'Coordinate municipal permissions for physical field deployment',
          ],
          expectedContribution: '4 hours/month mentorship, industrial test skids, and cloud ingestion API sandbox access.',
          timeline: 'Stage 1: Design (Jul-Aug) • Stage 2: Skid Testing (Sep-Oct) • Stage 3: Field Pilot (Nov-Dec)',
        },
        {
          id: 'COL-2026-002',
          projectId: 'PRJ-CSR-2026-004',
          challengeId: 'CH-2026-188',
          projectTitle: 'Solar-Powered LED Smart Streetlighting with Dynamic Dimming',
          university: 'IIT (ISM) Dhanbad',
          department: 'Electrical Engineering',
          facultyMentor: 'Dr. P. K. Sinha',
          studentLead: 'Sneha Kumari',
          partnerRole: 'Hardware & Solar Advisor',
          startDate: '2026-08-01',
          expectedDuration: '8 Months',
          supportType: 'Hardware Support + Testing Equipment',
          status: 'Active',
          responsibilities: [
            'Advise on GaN power inverter thermal dissipation and surge protection',
            'Review solar radiation benchmarks against industrial standards',
          ],
          universityResponsibilities: [
            'Develop adaptive radar dimming logic on STM32 microcontrollers',
            'Test battery charge cycles across high-temperature outdoor profiles',
          ],
          expectedContribution: 'Provision of Kipp & Zonen pyranometer and laboratory power supply skids.',
          timeline: 'Stage 1: PCB Design (Aug-Sep) • Stage 2: Bench Test (Oct) • Stage 3: Highway Pilot (Nov)',
        },
        {
          id: 'COL-2026-003',
          projectId: 'PRJ-CSR-2026-008',
          challengeId: 'CH-2026-302',
          projectTitle: 'IoT Vibration Telemetry for Footbridges',
          university: 'IIT (ISM) Dhanbad',
          department: 'Civil Engineering',
          facultyMentor: 'Dr. Ramesh Kumar',
          studentLead: 'Amitava Banerjee',
          partnerRole: 'Structural Telemetry Advisor',
          startDate: '2026-09-20',
          expectedDuration: '6 Months',
          supportType: 'API & Telemetry Support',
          status: 'Pending',
          responsibilities: ['Configure industrial cloud MQTT broker and acceleration threshold filters.'],
          universityResponsibilities: ['Install MEMS vibration sensors on bridge suspension cable anchor points.'],
          expectedContribution: 'Cloud telemetry pipeline and vibration signal processing algorithms.',
          timeline: 'Stage 1: Calibration (Sep-Oct) • Stage 2: Real-time Telemetry (Nov-Dec)',
        },
        {
          id: 'COL-2026-004',
          projectId: 'PRJ-CSR-2026-012',
          challengeId: 'CH-2026-145',
          projectTitle: 'E-Waste Recovery & Heavy Metal Leaching Automation',
          university: 'BIT Mesra',
          department: 'Chemical Engineering',
          facultyMentor: 'Dr. R. K. Dey',
          studentLead: 'Pooja Verma',
          partnerRole: 'Environmental Process Reviewer',
          startDate: '2026-06-01',
          expectedDuration: '6 Months',
          supportType: 'Technical Review',
          status: 'Completed',
          responsibilities: ['Assessed closed-loop hydrometallurgical safety and statutory PCB compliance.'],
          universityResponsibilities: ['Demonstrated 94.2% copper recovery from discarded smartphone PCBs.'],
          expectedContribution: 'Safety compliance audit and industrial hydrometallurgy standard review.',
          timeline: 'Completed on 2026-09-10 with validated final technical report.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollaborations();
  }, []);

  const handleRespond = async (id: string, action: 'Accept' | 'Decline') => {
    try {
      const res = await apiClient.post(`/corporate-partner/collaborations/${id}/respond`, { action });
      if (res.data?.success) {
        setActionSuccess(`Collaboration ${id} marked as ${action === 'Accept' ? 'Active' : 'Declined'}.`);
        fetchCollaborations();
        if (selectedCollab && selectedCollab.id === id) {
          setSelectedCollab(null);
        }
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err) {
      setActionSuccess(`Collaboration ${id} marked as ${action === 'Accept' ? 'Active' : 'Declined'}.`);
      setCollaborations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: action === 'Accept' ? 'Active' : 'Declined' } : c))
      );
      if (selectedCollab && selectedCollab.id === id) {
        setSelectedCollab(null);
      }
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  const filteredCollabs = collaborations.filter((c) => {
    if (activeTab === 'All') return true;
    return c.status.toLowerCase() === activeTab.toLowerCase();
  });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            ACTIVE
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
            <Clock size={10} />
            PENDING
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-300">
            <CheckCircle2 size={10} />
            COMPLETED
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
        return <span className="text-slate-600">{status}</span>;
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
                PARTNERSHIP REGISTRY
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Official MoE-Industry Collaborations
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              My Collaborations
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Track official project collaboration agreements, scope of contribution, and university partner details.
            </p>
          </div>

          <button
            onClick={fetchCollaborations}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-xs cursor-pointer self-start md:self-auto"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-blue-700' : 'text-slate-500'} />
            <span>Refresh Collaborations</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span className="font-bold">{actionSuccess}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-1">
        {(['All', 'Pending', 'Active', 'Completed', 'Declined'] as const).map((tab) => {
          const count =
            tab === 'All'
              ? collaborations.length
              : collaborations.filter((c) => c.status.toLowerCase() === tab.toLowerCase()).length;
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-2 text-xs font-extrabold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-[#133054] text-[#133054] bg-white shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  isActive ? 'bg-[#133054] text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Collaborations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw size={24} className="animate-spin mx-auto text-[#133054] mb-2" />
            <p className="text-xs font-bold">Loading active collaboration agreements...</p>
          </div>
        ) : filteredCollabs.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle size={32} className="mx-auto text-slate-400 mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No {activeTab !== 'All' ? activeTab : ''} Collaborations Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              There are currently no collaboration agreements matching this status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-extrabold uppercase text-[10.5px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-3.5">Collaboration ID</th>
                  <th className="py-3 px-3.5">Project</th>
                  <th className="py-3 px-3.5">University</th>
                  <th className="py-3 px-3.5">Faculty Mentor</th>
                  <th className="py-3 px-3.5">Student Lead</th>
                  <th className="py-3 px-3.5">Your Role</th>
                  <th className="py-3 px-3.5">Start Date</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCollabs.map((collab) => (
                  <tr key={collab.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-3.5 font-mono font-bold text-[#133054] whitespace-nowrap">
                      {collab.id}
                    </td>
                    <td className="py-3 px-3.5 max-w-xs">
                      <p className="font-extrabold text-slate-900 line-clamp-1">{collab.projectTitle}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{collab.challengeId || 'Civic Innovation'}</p>
                    </td>
                    <td className="py-3 px-3.5 font-bold text-slate-800 whitespace-nowrap">
                      {collab.university}
                    </td>
                    <td className="py-3 px-3.5 text-slate-700 font-medium whitespace-nowrap">
                      {collab.facultyMentor}
                    </td>
                    <td className="py-3 px-3.5 text-slate-700 font-medium whitespace-nowrap">
                      {collab.studentLead}
                    </td>
                    <td className="py-3 px-3.5 text-blue-900 font-semibold whitespace-nowrap">
                      <span className="bg-blue-50 px-2 py-0.5 rounded text-[11px] font-bold border border-blue-200 text-blue-900">
                        {collab.partnerRole}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 font-mono whitespace-nowrap">
                      {collab.startDate}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {getStatusBadge(collab.status)}
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedCollab(collab)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#133054] text-white font-bold hover:bg-[#1a4275] transition-colors text-[11px] shadow-xs cursor-pointer"
                        >
                          <Eye size={12} />
                          <span>View Collaboration</span>
                        </button>
                        <button
                          onClick={() => navigate('/corporate-partner/projects')}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors text-[11px] cursor-pointer"
                          title="Open full project lifecycle"
                        >
                          <FolderGit2 size={12} className="text-slate-500" />
                          <span>View Project</span>
                        </button>
                        <button
                          onClick={() => navigate('/corporate-partner/communication')}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-blue-300 text-blue-800 font-bold hover:bg-blue-50 transition-colors text-[11px] cursor-pointer"
                          title="Open project conversation"
                        >
                          <MessageSquare size={12} className="text-blue-600" />
                          <span>Communication</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: COLLABORATION DETAILS */}
      {selectedCollab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 my-8">
            <div className="p-4 bg-[#133054] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded uppercase">
                  {selectedCollab.id} • {selectedCollab.status.toUpperCase()}
                </span>
                <h3 className="font-black text-sm sm:text-base mt-1 text-white">
                  {selectedCollab.projectTitle}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCollab(null)}
                className="p-1 rounded-md text-blue-200 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px]">
                <div>
                  <span className="text-slate-500 font-semibold block">University:</span>
                  <span className="font-extrabold text-slate-900">{selectedCollab.university}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Department:</span>
                  <span className="font-bold text-slate-800">{selectedCollab.department || 'Engineering Faculty'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Faculty Mentor:</span>
                  <span className="font-bold text-slate-800">{selectedCollab.facultyMentor}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Student Lead:</span>
                  <span className="font-bold text-slate-800">{selectedCollab.studentLead}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Corporate Partner:</span>
                  <span className="font-extrabold text-[#133054]">Rohan Mittal (Jindal Steel)</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Assigned Role:</span>
                  <span className="font-bold text-blue-900">{selectedCollab.partnerRole}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Start Date:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedCollab.startDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Expected Duration:</span>
                  <span className="font-bold text-slate-800">{selectedCollab.expectedDuration || '12 Months'}</span>
                </div>
              </div>

              {/* Your Responsibilities */}
              <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-2">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#133054] flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-blue-800" />
                  <span>Your Responsibilities (Corporate Partner)</span>
                </h4>
                <ul className="space-y-1.5 list-disc list-inside text-slate-700 font-medium">
                  {selectedCollab.responsibilities && selectedCollab.responsibilities.length > 0 ? (
                    selectedCollab.responsibilities.map((r: string, idx: number) => (
                      <li key={idx} className="leading-relaxed">{r}</li>
                    ))
                  ) : (
                    <li>Conduct bi-weekly technical reviews and test skid validation with university students.</li>
                  )}
                </ul>
              </div>

              {/* University Responsibilities */}
              <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-2">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Building2 size={14} className="text-slate-700" />
                  <span>University Responsibilities</span>
                </h4>
                <ul className="space-y-1.5 list-disc list-inside text-slate-700 font-medium">
                  {selectedCollab.universityResponsibilities && selectedCollab.universityResponsibilities.length > 0 ? (
                    selectedCollab.universityResponsibilities.map((ur: string, idx: number) => (
                      <li key={idx} className="leading-relaxed">{ur}</li>
                    ))
                  ) : (
                    <li>Fabricate laboratory prototypes and provide bi-weekly milestone documentation.</li>
                  )}
                </ul>
              </div>

              {/* Expected Contribution */}
              <div className="border border-amber-200 rounded-lg p-4 bg-amber-50/50 space-y-1">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-amber-900">
                  Expected Contribution & Resources
                </h4>
                <p className="text-slate-800 font-medium leading-relaxed">
                  {selectedCollab.expectedContribution}
                </p>
              </div>

              {/* Project Timeline */}
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-1">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-800">
                  Project Timeline & Phasing
                </h4>
                <p className="text-slate-700 font-medium leading-relaxed font-mono text-[11px]">
                  {selectedCollab.timeline}
                </p>
              </div>

              {/* Bottom: Collaboration Status & Action */}
              <div className="p-3.5 bg-slate-100 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-600 uppercase">Current Status:</span>
                  {getStatusBadge(selectedCollab.status)}
                </div>

                {selectedCollab.status === 'Pending' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRespond(selectedCollab.id, 'Decline')}
                      className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-800 hover:bg-rose-50 text-xs font-bold cursor-pointer"
                    >
                      Decline Request
                    </button>
                    <button
                      onClick={() => handleRespond(selectedCollab.id, 'Accept')}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-extrabold cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <Check size={13} />
                      <span>Accept Collaboration</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setSelectedCollab(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-200 transition-colors cursor-pointer text-xs"
              >
                Close
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedCollab(null);
                    navigate('/corporate-partner/communication');
                  }}
                  className="px-4 py-2 rounded-lg bg-[#133054] text-white font-extrabold hover:bg-[#1a4275] transition-colors shadow-xs cursor-pointer text-xs flex items-center gap-1.5"
                >
                  <MessageSquare size={13} className="text-amber-400" />
                  <span>Open Communication</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
