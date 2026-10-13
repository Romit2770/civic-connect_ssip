import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Search,
  CheckCircle2,
  Clock,
  Eye,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  MapPin,
  FileText,
  Sparkles,
  ExternalLink,
  Layers,
  ShieldCheck,
  Users,
  FolderGit2,
  CalendarCheck2,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import KPIStatCard from '../../components/common/KPIStatCard';

export default function FacultyChallengesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'accepted' | 'under_review' | 'assigned'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<any | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadChallenges();
  }, [activeTab]);

  const loadChallenges = async () => {
    setLoading(true);
    try {
      let query = `?status=${activeTab !== 'all' ? activeTab : 'all'}`;
      if (search.trim()) query += `&search=${encodeURIComponent(search)}`;
      const res = await apiClient.get(`/faculty/challenges${query}`);
      if (res.data.success) {
        setChallenges(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load mentor challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptMentorship = async (id: string) => {
    try {
      const res = await apiClient.patch(`/faculty/challenges/${id}/accept`);
      if (res.data.success) {
        setActionSuccess(`Mentorship accepted for challenge ${id}.`);
        loadChallenges();
        if (selectedChallenge?.id === id) {
          setSelectedChallenge(res.data.data);
        }
      }
    } catch (err) {
      alert('Failed to accept mentorship.');
    }
  };

  const filtered = challenges.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.domain.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q)
    );
  });

  const getDomainIcon = (domain: string = '') => {
    const d = domain.toLowerCase();
    if (d.includes('water') || d.includes('sanitation')) return '💧';
    if (d.includes('road') || d.includes('public works')) return '🛣️';
    if (d.includes('waste') || d.includes('compost')) return '🌿';
    if (d.includes('electric') || d.includes('solar') || d.includes('light')) return '⚡';
    return '🏛️';
  };

  return (
    <div className="space-y-6 w-full">
      {/* Official Government Header Banner with Tricolor Ribbon */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
        {/* National Tricolor Government Accent Ribbon */}
        <div className="h-1.5 w-full flex">
          <div className="h-full flex-1 bg-[#ff9933]" />
          <div className="h-full flex-1 bg-white" />
          <div className="h-full flex-1 bg-[#138808]" />
        </div>

        <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* National Insignia / Ashoka Chakra */}
            <div className="hidden sm:flex flex-col items-center justify-center p-2 rounded-lg bg-amber-50/80 border border-amber-200/90 text-[#0a2540] shrink-0 shadow-2xs">
              <svg className="w-8 h-8 text-[#0a2540]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" />
                <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
                <path d="M12 2.5v19M2.5 12h19M5.3 5.3l13.4 13.4M5.3 18.7L18.7 5.3" stroke="currentColor" strokeWidth="1.2" />
                <path d="M8.5 3.5l7 17M3.5 8.5l17 7M3.5 15.5l17-7M8.5 20.5l7-17" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
              </svg>
              <span className="text-[7.5px] font-black tracking-widest text-[#0a2540] uppercase mt-1">सत्यमेव जयते</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold text-[#0a2540] bg-amber-100/90 px-2.5 py-0.5 rounded border border-amber-300 uppercase tracking-widest flex items-center gap-1.5 shadow-2xs">
                  <ShieldCheck size={12} className="text-amber-800" />
                  भारत सरकार • Government of India
                </span>
                <span className="text-xs text-slate-300 hidden sm:inline">•</span>
                <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Ministry of Education & MoHUA • Smart Cities Mission
                </span>
                <span className="text-xs text-slate-300 hidden sm:inline">•</span>
                <span className="text-[10px] font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  SIH-195 Challenge Registry
                </span>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Active Mentorship Mandate
                </span>
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>My Assigned Societal Challenges</span>
                </h1>
                <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                  National Academic R&D Registry • Review, supervise, and audit civic problem statements assigned to Prof. Dr. Arvind Kumar for student innovation guild mentoring and municipal co-pilot development.
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => loadChallenges()}
              className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100 shadow-2xs cursor-pointer transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Refresh Registry"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin text-blue-700' : 'text-slate-600'} />
              <span>Sync Registry</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-[#0a2540] hover:bg-[#12395b] text-white text-xs font-extrabold rounded-lg shadow-sm flex items-center gap-2 transition-colors cursor-pointer border border-blue-950"
            >
              <FileText size={14} className="text-amber-400" />
              <span>Export Registry Dossier</span>
            </button>
          </div>
        </div>

        {/* Nodal Metadata Bar */}
        <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              Institution: NIT Jamshedpur (Zone East-04)
            </span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-slate-600">
              Department: Civil & Urban Environmental Engineering
            </span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-slate-600 font-mono">
              Registry Node: AP-CH-MHRD-2026
            </span>
          </div>
          <div className="font-mono text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
            Total Civic Challenges: {challenges.length} Records
          </div>
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

      {/* 4 Government Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <KPIStatCard
          code="CH-TOTAL"
          title="Assigned Challenges"
          value={challenges.length}
          badge="100% Mentored"
          subtitle="Problem statements in scope"
          footerNote="Zone East-04"
          icon={Target}
          variant="blue"
        />
        <KPIStatCard
          code="R&D-GUILDS"
          title="Student Innovator Teams"
          value={4}
          badge="4 Active"
          subtitle="Guilds actively deployed"
          footerNote="16 Members"
          icon={Users}
          variant="green"
        />
        <KPIStatCard
          code="PWD-VAL"
          title="Municipal Endorsements"
          value={2}
          badge="Verified"
          subtitle="Validated by Municipal PWD"
          footerNote="High Priority"
          icon={ShieldCheck}
          variant="amber"
        />
        <KPIStatCard
          code="FIELD-PILOT"
          title="Field Pilot & Testing"
          value={2}
          badge="In Testing"
          subtitle="Live telemetry validation"
          footerNote="Active Pilots"
          icon={FolderGit2}
          variant="purple"
        />
      </div>

      {/* Tabs & Search Card */}
      <div className="gov-card bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Tab Header Bar with Live Counters */}
        <div className="border-b border-slate-200 p-3 sm:p-4 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All My Challenges', count: challenges.length },
              { id: 'accepted', label: 'Accepted & Active', count: challenges.filter((c) => c.status === 'Accepted').length },
              { id: 'under_review', label: 'Under Review', count: challenges.filter((c) => c.status === 'Under Review').length },
              { id: 'assigned', label: 'Assigned (Pending Accept)', count: challenges.filter((c) => c.status === 'Assigned').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-[#0a2540] text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeTab === tab.id
                      ? 'bg-blue-900/80 text-amber-300'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search challenges by ID, domain or title..."
              className="w-full pl-9 pr-8 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700 shadow-2xs"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Professional Table Layout */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0a2540] text-white uppercase text-[10px] tracking-wider font-extrabold border-b-2 border-amber-500">
              <tr>
                <th className="px-4 py-3.5">Challenge ID</th>
                <th className="px-4 py-3.5">Problem Statement & Domain</th>
                <th className="px-4 py-3.5">Ward / Location</th>
                <th className="px-4 py-3.5 text-center">Civic Priority</th>
                <th className="px-4 py-3.5">Municipal Validation</th>
                <th className="px-4 py-3.5">Assigned Innovator Guild</th>
                <th className="px-4 py-3.5">Project Stage</th>
                <th className="px-4 py-3.5 text-right">Dossier Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 bg-white">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Target size={28} className="mx-auto text-slate-300" />
                      <p className="font-bold text-slate-700 text-xs">No challenges found</p>
                      <p className="text-[11px] text-slate-400">No records matching criteria "{search}"</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isHighPriority = item.priority?.toLowerCase() === 'high' || item.priority?.toLowerCase() === 'critical';
                  const isMediumPriority = item.priority?.toLowerCase() === 'medium';
                  const domainIcon = getDomainIcon(item.domain);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* 1. Challenge ID */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-mono font-extrabold text-blue-900 bg-blue-50/80 px-2.5 py-1 rounded-md border border-blue-200/90 text-[11px] block text-center">
                          {item.id}
                        </span>
                      </td>

                      {/* 2. Problem Title & Domain */}
                      <td className="px-4 py-3.5 max-w-sm">
                        <div className="space-y-1">
                          <span className="font-extrabold text-slate-900 text-xs leading-snug line-clamp-1 group-hover:text-blue-900 transition-colors block">
                            {item.title}
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.2 rounded border border-slate-200/80 flex items-center gap-1">
                              <span>{domainIcon}</span>
                              <span>{item.domain}</span>
                            </span>
                            {item.aiClassification && (
                              <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200 font-medium">
                                {item.aiClassification}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 3. Location */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <MapPin size={13} className="text-rose-500 shrink-0" />
                          <span className="font-medium text-[11px]">{item.location}</span>
                        </div>
                      </td>

                      {/* 4. Priority */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        <span
                          className={`text-[9.5px] font-extrabold uppercase px-2.5 py-0.5 rounded-full inline-block ${
                            isHighPriority
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : isMediumPriority
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {item.priority}
                        </span>
                      </td>

                      {/* 5. Validation Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-emerald-800 bg-emerald-50/80 px-2.5 py-1 rounded-md border border-emerald-200">
                          <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
                          <span>{item.validationStatus}</span>
                        </span>
                      </td>

                      {/* 6. Assigned Innovator Guild */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Users size={13} className="text-blue-700 shrink-0" />
                          <span className="font-bold text-slate-800 text-[11px]">
                            {item.studentTeam || 'Pending Allocation'}
                          </span>
                        </div>
                      </td>

                      {/* 7. Project Stage */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-bold text-[#0a2540] text-[11px] block">
                          {item.currentStage}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-700 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          {item.status}
                        </span>
                      </td>

                      {/* 8. Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedChallenge(item)}
                          className="px-3 py-1.5 bg-[#0a2540] hover:bg-[#12395b] text-white rounded-lg text-xs font-bold shadow-2xs cursor-pointer inline-flex items-center gap-1.5 transition-colors border border-blue-900"
                        >
                          <Eye size={12} className="text-amber-400" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Government Registry Table Footer */}
        <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-700">
              Showing <strong className="text-slate-900">{filtered.length}</strong> of <strong className="text-slate-900">{challenges.length}</strong> assigned challenge dockets
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-500 font-mono text-[10px]">
            <span className="flex items-center gap-1 text-emerald-700 font-bold">
              <CheckCircle2 size={12} className="text-emerald-600" />
              Digitally Endorsed by Municipal PWD & MoHUA
            </span>
            <span className="text-slate-300">|</span>
            <span>SIH-2026 Registry v2.4</span>
          </div>
        </div>
      </div>

      {/* CHALLENGE DETAILS MODAL */}
      {selectedChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 bg-[#0a2540] text-white flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <Target size={18} className="text-amber-400" />
                <div>
                  <span className="font-mono text-xs text-amber-300 font-bold block">
                    {selectedChallenge.id}
                  </span>
                  <h3 className="text-sm font-extrabold tracking-tight">Challenge Details & Evidence Audit</h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedChallenge(null)}
                className="text-slate-300 hover:text-white p-1 rounded"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-6 text-xs text-slate-800">
              {/* Top Summary Banner */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                    PRIORITY: {selectedChallenge.priority}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                    {selectedChallenge.domain}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Submitted: {selectedChallenge.submissionDate || selectedChallenge.assignedDate}
                  </span>
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 leading-snug">
                  {selectedChallenge.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-slate-600 text-xs pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-slate-400" />
                    {selectedChallenge.location}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-emerald-700">
                    <ShieldCheck size={13} className="text-emerald-600" />
                    {selectedChallenge.validationStatus}
                  </span>
                  <span className="text-slate-500 font-mono">
                    Status: <strong className="text-slate-800">{selectedChallenge.status}</strong>
                  </span>
                </div>
              </div>

              {/* SECTION 1: PROBLEM CONTEXT */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                  <FileText size={14} className="text-blue-700" />
                  Problem Context (Citizen Grievance Description)
                </h4>
                <p className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 text-xs leading-relaxed">
                  {selectedChallenge.description || 'No description available for this civic grievance.'}
                </p>
              </div>

              {/* SECTION 2: CITIZEN EVIDENCE */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                  <Eye size={14} className="text-blue-700" />
                  Citizen Evidence
                </h4>

                {selectedChallenge.citizenEvidence?.hasEvidence ? (
                  <div className="space-y-3">
                    {/* Photos */}
                    {selectedChallenge.citizenEvidence.photos?.length > 0 && (
                      <div>
                        <p className="text-[11px] font-bold text-slate-600 mb-1.5">Uploaded Photographs:</p>
                        <div className="grid grid-cols-2 gap-3">
                          {selectedChallenge.citizenEvidence.photos.map((src: string, idx: number) => (
                            <img
                              key={idx}
                              src={src}
                              alt={`Citizen Evidence ${idx + 1}`}
                              className="rounded-lg border border-slate-200 h-40 w-full object-cover shadow-2xs"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Geolocation & GPS */}
                    <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200 space-y-1">
                      <p className="font-bold text-blue-900 text-xs">Geolocation Proof:</p>
                      <p className="text-blue-800 text-[11px]">
                        {selectedChallenge.citizenEvidence.geolocation}
                      </p>
                      {selectedChallenge.citizenEvidence.coordinates && (
                        <p className="font-mono text-[10px] text-blue-600">
                          GPS Coordinates: [{selectedChallenge.citizenEvidence.coordinates[0]}, {selectedChallenge.citizenEvidence.coordinates[1]}]
                        </p>
                      )}
                      {selectedChallenge.citizenEvidence.notes && (
                        <p className="text-[11px] text-slate-600 pt-1 italic">
                          Notes: {selectedChallenge.citizenEvidence.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-slate-500 text-xs font-medium">
                    No evidence uploaded.
                  </div>
                )}
              </div>

              {/* SECTION 3: AI ANALYSIS */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                  <Sparkles size={14} className="text-indigo-600" />
                  AI Analysis & Technical Classification
                </h4>

                {selectedChallenge.aiAnalysis ? (
                  <div className="p-4 bg-indigo-50/40 rounded-lg border border-indigo-200 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">AI Domain</span>
                        <span className="font-bold text-indigo-950">{selectedChallenge.aiAnalysis.domain}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Severity Rating</span>
                        <span className="font-mono font-extrabold text-red-700">
                          {selectedChallenge.aiAnalysis.severity} / 10
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Duplicate Result</span>
                        <span className="font-semibold text-slate-800">
                          {selectedChallenge.aiAnalysis.duplicateDetectionResult}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Location Relevance</span>
                        <span className="text-slate-800">{selectedChallenge.aiAnalysis.locationRelevance}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-indigo-200/60">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Problem Summary</span>
                      <p className="text-slate-700 text-xs mt-0.5">{selectedChallenge.aiAnalysis.problemSummary}</p>
                    </div>

                    <div className="pt-2 border-t border-indigo-200/60">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Evidence Assessment</span>
                      <p className="text-slate-700 text-xs mt-0.5">{selectedChallenge.aiAnalysis.evidenceAssessment}</p>
                    </div>

                    <div className="pt-2 border-t border-indigo-200/60">
                      <span className="text-[10px] text-indigo-900 uppercase font-bold block">
                        Recommended Technical Areas & Academic Focus
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {selectedChallenge.aiAnalysis.recommendedTechnicalAreas?.map((area: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-white text-indigo-800 border border-indigo-300 rounded text-[10px] font-semibold"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No AI analysis stored for this challenge.</p>
                )}
              </div>

              {/* Faculty Mentor Actions */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500">
                  Assigned Team: <strong className="text-slate-800">{selectedChallenge.studentTeam || 'None'}</strong>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {selectedChallenge.status !== 'Accepted' && (
                    <button
                      onClick={() => handleAcceptMentorship(selectedChallenge.id)}
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Check size={14} />
                      <span>Accept Mentorship</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSelectedChallenge(null);
                      navigate('/faculty/teams');
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Users size={14} />
                    <span>View Team</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedChallenge(null);
                      navigate('/faculty/projects');
                    }}
                    className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <FolderGit2 size={14} />
                    <span>Open Project</span>
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
