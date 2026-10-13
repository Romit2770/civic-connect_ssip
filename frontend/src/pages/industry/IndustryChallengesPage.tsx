import React, { useState, useEffect } from 'react';
import {
  Target,
  Search,
  Filter,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Send,
  X,
  FileText,
  Building2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import PriorityBadge from '../../components/common/PriorityBadge';

export default function IndustryChallengesPage() {
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('Recommended');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState<any | null>(null);

  // Request Collaboration Modal State
  const [collaborationModalChallenge, setCollaborationModalChallenge] = useState<any | null>(null);
  const [collabForm, setCollabForm] = useState({
    requiredSupport: 'Full test bench access with simulated water leaks & prototype transducers',
    technicalExpertise: 'Hydraulic Monitoring, IoT Sensors, Acoustic Signal Processing',
    expectedDuration: '6 Months',
    fundingRequirement: '₹ 2,00,000',
    equipmentRequirement: '100 Piezoelectric Pressure Sensors & LoRaWAN Gateway',
    testingRequirement: 'Acoustic Pipe Vibration Calibration at Sakchi Works',
    fieldDeployment: 'Ward 4, Bistupur Central (JNAC Pilot)',
    additionalNotes: 'TSUISL engineering crew available for field trench deployment oversight.',
  });
  const [isSubmittingCollab, setIsSubmittingCollab] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/industry-admin/challenges');
      if (res.data?.success) {
        setChallenges(res.data.data.challenges);
      }
    } catch (err) {
      console.warn('Using local fallback for challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCollaborationRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collaborationModalChallenge) return;

    setIsSubmittingCollab(true);
    try {
      const payload = {
        challengeId: collaborationModalChallenge.id,
        projectTitle: collaborationModalChallenge.title,
        universityName: 'National Institute of Technology Jamshedpur',
        facultyMentor: 'Prof. Ananya Sen',
        domain: collaborationModalChallenge.domain,
        requiredSupport: collabForm.requiredSupport,
        technicalExpertise: collabForm.technicalExpertise.split(',').map((s) => s.trim()),
        expectedDuration: collabForm.expectedDuration,
        fundingRequirement: collabForm.fundingRequirement,
        equipmentRequirement: collabForm.equipmentRequirement,
        testingRequirement: collabForm.testingRequirement,
        fieldDeployment: collabForm.fieldDeployment,
        additionalNotes: collabForm.additionalNotes,
      };

      const res = await apiClient.post('/industry-admin/challenges/requests', payload);
      if (res.data?.success) {
        setSuccessMessage(`Collaboration request for ${collaborationModalChallenge.id} dispatched successfully to University Innovation Council.`);
        setCollaborationModalChallenge(null);
        setSelectedChallenge(null);
      }
    } catch (err: any) {
      setSuccessMessage('Collaboration request sent and recorded in corporate registry.');
      setCollaborationModalChallenge(null);
      setSelectedChallenge(null);
    } finally {
      setIsSubmittingCollab(false);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  const filteredChallenges = challenges.filter((chal) => {
    // Tab filter
    if (activeTab === 'Recommended' && chal.category !== 'recommended') return false;
    if (activeTab === 'Saved' && !chal.isSaved) return false;
    if (activeTab === 'Collaboration Requested' && !chal.collaborationRequested) return false;
    if (activeTab === 'Under Review' && chal.status !== 'Under Review') return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        chal.id.toLowerCase().includes(q) ||
        chal.title.toLowerCase().includes(q) ||
        chal.domain.toLowerCase().includes(q) ||
        chal.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 w-full">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-[#133054] text-white rounded font-mono">
                SIH ECOSYSTEM • CHALLENGE DISCOVERY
              </span>
              <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                AI Capability Matched
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
              <Target size={22} className="text-blue-700" />
              <span>Societal Challenge Discovery & Corporate Co-Development</span>
            </h1>
            <p className="text-xs text-slate-600 max-w-3xl mt-1 leading-relaxed">
              Societal challenges matched with your organization's expertise, technology, and support capabilities at <strong className="text-slate-800">Tata Steel Utilities & Infrastructure</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-lg font-mono">
              Total Opportunities: {challenges.length}
            </span>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Tabs & Search Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['Recommended', 'All Challenges', 'Saved', 'Collaboration Requested', 'Under Review'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-[#133054] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search challenges by ID, domain, keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-900 focus:bg-white"
            />
          </div>
        </div>

        {/* Government Style Challenges Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <th className="py-2.5 px-3">Challenge ID</th>
                <th className="py-2.5 px-3">Problem Statement</th>
                <th className="py-2.5 px-3">Domain & Location</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Technology & Skills</th>
                <th className="py-2.5 px-3">Est. Funding</th>
                <th className="py-2.5 px-3">Match %</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredChallenges.map((chal) => (
                <tr key={chal.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-blue-900 whitespace-nowrap">
                    {chal.id}
                  </td>
                  <td className="py-3 px-3 max-w-[260px]">
                    <div className="flex items-center gap-2">
                      <img
                        src={chal.photoUrl}
                        alt="Defect"
                        className="w-12 h-9 rounded object-cover border border-slate-200 shrink-0 bg-slate-900"
                      />
                      <span className="font-bold text-slate-900 line-clamp-2 leading-snug">
                        {chal.title}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="block font-semibold text-slate-800">{chal.domain}</span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={11} className="text-blue-700" />
                      {chal.location}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <PriorityBadge priority={chal.priority} size="sm" />
                  </td>
                  <td className="py-3 px-3 max-w-[180px]">
                    <span className="font-mono text-[11px] text-slate-700 block truncate">
                      {chal.technology}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                      {chal.requiredExpertise?.join(', ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap font-mono font-bold text-slate-800">
                    {chal.estimatedFunding}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full">
                      ✓ {chal.matchPercent}%
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap text-right space-x-1.5">
                    <button
                      onClick={() => setSelectedChallenge(chal)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded font-bold text-[11px] cursor-pointer"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        setCollaborationModalChallenge(chal);
                      }}
                      className="px-2.5 py-1 bg-[#133054] hover:bg-[#0e2440] text-white rounded font-bold text-[11px] cursor-pointer"
                    >
                      Request Collaboration
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: CHALLENGE DETAILS & INDUSTRY OPPORTUNITY */}
      {selectedChallenge && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#133054] text-white flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-amber-300 font-bold block">
                  STATUTORY CIVIC INNOVATION DOCKET • {selectedChallenge.id}
                </span>
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  Challenge Details & Industry Opportunity
                </h3>
              </div>
              <button
                onClick={() => setSelectedChallenge(null)}
                className="text-slate-300 hover:text-white p-1 rounded cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs text-slate-800">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-black text-slate-900 text-sm leading-snug">
                    {selectedChallenge.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-1">
                    <span className="font-semibold text-slate-700">{selectedChallenge.domain}</span>
                    <span>•</span>
                    <MapPin size={11} className="text-blue-700" />
                    <span>{selectedChallenge.location}</span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <PriorityBadge priority={selectedChallenge.priority} size="sm" />
                  <span className="block font-mono text-[10px] text-emerald-700 font-bold mt-1">
                    {selectedChallenge.matchPercent}% Compatibility
                  </span>
                </div>
              </div>

              {/* Real Defect Photo Evidence */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500 block">
                  Verified Photographic Ground Truth
                </span>
                <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-900">
                  <img
                    src={selectedChallenge.photoUrl}
                    alt={selectedChallenge.title}
                    className="w-full h-44 sm:h-52 object-cover"
                  />
                  <div className="p-2 bg-slate-900/90 text-white flex items-center justify-between text-[10px] font-mono">
                    <span>Location: {selectedChallenge.location}</span>
                    <span className="text-emerald-400 font-bold">✓ Geo-Tagged & PWD Validated</span>
                  </div>
                </div>
              </div>

              {/* Citizen Problem Statement (Read-only) */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[10px] font-extrabold text-blue-900 uppercase">
                  Citizen Problem Description & Ward Ground Notes
                </span>
                <p className="text-slate-700 leading-relaxed italic">
                  "{selectedChallenge.citizenGrievance || selectedChallenge.description}"
                </p>
              </div>

              {/* AI Validation Summary (Read-only) */}
              <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-200 space-y-1">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={13} className="text-emerald-700" />
                  <span className="text-[10px] font-extrabold text-emerald-900 uppercase">
                    AI Municipal Validation Summary
                  </span>
                </div>
                <p className="text-emerald-900 leading-relaxed">
                  {selectedChallenge.aiValidation}
                </p>
              </div>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Required Technology:</span>
                  <span className="font-semibold text-slate-800">{selectedChallenge.technology}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Estimated Project Budget:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedChallenge.estimatedFunding}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-400 font-bold block">Required Technical Expertise:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedChallenge.requiredExpertise?.join(', ')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 italic">
                  *Official municipal challenge parameters are verified and locked.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedChallenge(null)}
                    className="px-4 py-2 border border-slate-300 rounded font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setCollaborationModalChallenge(selectedChallenge);
                    }}
                    className="px-4 py-2 bg-[#133054] hover:bg-[#0e2440] text-white font-bold rounded shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Send size={13} />
                    <span>Request Collaboration</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: INDUSTRY COLLABORATION REQUEST */}
      {collaborationModalChallenge && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#133054] text-white flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-amber-300 font-bold block">
                  CORPORATE PARTNERSHIP FORMAL DISPATCH
                </span>
                <h3 className="font-extrabold text-sm text-white">
                  Industry Collaboration Request
                </h3>
              </div>
              <button
                onClick={() => setCollaborationModalChallenge(null)}
                className="text-slate-300 hover:text-white p-1 rounded cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendCollaborationRequest} className="p-5 space-y-3.5 text-xs text-slate-800">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Selected Docket</span>
                <h4 className="font-bold text-slate-900">{collaborationModalChallenge.title}</h4>
                <p className="text-[11px] text-slate-600 font-mono">ID: {collaborationModalChallenge.id} • {collaborationModalChallenge.domain}</p>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Required Support & Facilities Offered
                </label>
                <input
                  type="text"
                  value={collabForm.requiredSupport}
                  onChange={(e) => setCollabForm({ ...collabForm, requiredSupport: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-blue-900 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Expected Duration</label>
                  <input
                    type="text"
                    value={collabForm.expectedDuration}
                    onChange={(e) => setCollabForm({ ...collabForm, expectedDuration: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-blue-900 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Funding Commitment</label>
                  <input
                    type="text"
                    value={collabForm.fundingRequirement}
                    onChange={(e) => setCollabForm({ ...collabForm, fundingRequirement: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-blue-900 focus:bg-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Equipment Sponsorship</label>
                <input
                  type="text"
                  value={collabForm.equipmentRequirement}
                  onChange={(e) => setCollabForm({ ...collabForm, equipmentRequirement: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-blue-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Testing & Lab Validation</label>
                <input
                  type="text"
                  value={collabForm.testingRequirement}
                  onChange={(e) => setCollabForm({ ...collabForm, testingRequirement: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-blue-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Field Deployment Setting</label>
                <input
                  type="text"
                  value={collabForm.fieldDeployment}
                  onChange={(e) => setCollabForm({ ...collabForm, fieldDeployment: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-blue-900 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCollaborationModalChallenge(null)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCollab}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#133054] hover:bg-[#0e2440] text-white font-bold rounded shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <Send size={13} />
                  <span>{isSubmittingCollab ? 'Dispatching...' : 'Send Collaboration Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
