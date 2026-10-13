import React, { useState, useEffect } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  Send,
  Eye,
  X,
  RefreshCw,
  Plus,
  ShieldCheck,
  Check,
  AlertCircle,
  FileText,
  Percent,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export default function FacultyIndustryPage() {
  const [activeTab, setActiveTab] = useState<'recommended' | 'requests' | 'active' | 'completed'>('recommended');
  const [recommendedPartners, setRecommendedPartners] = useState<any[]>([]);
  const [collaborationRequests, setCollaborationRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<any | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [sendingRequest, setSendingRequest] = useState(false);

  // Request Form
  const [reqForm, setReqForm] = useState({
    project: 'Low-Cost IoT Sensor Network for Pipeline Leakage',
    industry: 'Tata Steel Utilities & Infrastructure (TSUISL)',
    requiredSupport: 'Testbench Access, Prototype Validation & Municipal Pilot Deployment',
    technicalRequirements: 'High-pressure acoustic pipeline test facility with controllable burst simulation',
    expectedDuration: '4 Months',
    fundingRequirement: '₹ 1,50,000 for field sensor node deployment hardware',
    mentorshipRequirement: 'Bi-weekly consultation with Chief Water Network Engineer',
    testingRequirement: 'Hydrostatic pressure burst test up to 8 bar',
    fieldDeploymentRequirement: 'Co-installation with TSUISL maintenance crew in Ward 4',
    additionalNotes: 'TSUISL agreed to provide testbench access and endorse results to Municipal Corporation.',
  });

  useEffect(() => {
    loadIndustryData();
  }, []);

  const loadIndustryData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/faculty/industry');
      if (res.data.success) {
        setRecommendedPartners(res.data.data.recommendedPartners || []);
        setCollaborationRequests(res.data.data.collaborationRequests || []);
      }
    } catch (err) {
      console.warn('Failed to load industry collaboration data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRequest = (partner: any) => {
    setSelectedPartner(partner);
    setReqForm({
      project: 'Low-Cost IoT Sensor Network for Pipeline Leakage',
      industry: partner.name,
      requiredSupport: partner.availableSupport?.[0] || 'Technical Mentorship & Validation',
      technicalRequirements: 'Hardware validation & high-reliability testing',
      expectedDuration: '6 Months',
      fundingRequirement: 'Equipment and sensor prototype sponsorship',
      mentorshipRequirement: 'Industry technical mentorship for student innovation team',
      testingRequirement: 'Industrial test bench evaluation and certification',
      fieldDeploymentRequirement: 'Direct field pilot access in municipal utility area',
      additionalNotes: `Direct match recommendation: ${partner.reason}`,
    });
    setShowRequestModal(true);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingRequest(true);
    try {
      const res = await apiClient.post('/faculty/industry/requests', reqForm);
      if (res.data.success) {
        setActionSuccess(`Collaboration request sent to ${reqForm.industry} successfully.`);
        setShowRequestModal(false);
        loadIndustryData();
      }
    } catch (err) {
      alert('Failed to send collaboration request');
    } finally {
      setSendingRequest(false);
    }
  };

  const activePartners = recommendedPartners.filter(
    (p) => p.status === 'Accepted' || collaborationRequests.some((r) => r.industry === p.name && r.status === 'Accepted')
  );

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0a2540] text-amber-400 flex items-center justify-center font-bold shadow-xs shrink-0">
            <Building2 size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Industry Collaboration
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Coordinate industry support, technical mentorship, funding and field deployment.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadIndustryData()}
            className="p-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-xs cursor-pointer transition-colors"
            title="Refresh Partners"
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

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'recommended', label: 'Recommended Partners' },
          { id: 'requests', label: `Collaboration Requests (${collaborationRequests.length})` },
          { id: 'active', label: 'Active Partners' },
          { id: 'completed', label: 'Completed Collaborations' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#0a2540] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: RECOMMENDED PARTNERS */}
      {activeTab === 'recommended' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {recommendedPartners.map((partner) => (
            <div
              key={partner.id}
              className="gov-card bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {partner.id}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                      {partner.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">{partner.type}</p>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 font-mono">
                      <Sparkles size={11} className="text-emerald-600" />
                      {partner.matchPercentage}% Compatibility
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <MapPin size={10} />
                      {partner.location}
                    </span>
                  </div>
                </div>

                {/* Domain & Recommendation Reason */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1.5 text-xs">
                  <p className="text-slate-600">
                    <strong className="text-slate-900">Domain:</strong> {partner.domain}
                  </p>
                  <p className="text-slate-700 leading-relaxed text-[11px]">
                    <strong className="text-slate-900">Reason for Recommendation:</strong> {partner.reason}
                  </p>
                </div>

                {/* Capabilities */}
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Relevant Capabilities
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {partner.capabilities?.map((cap: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded text-[10px] font-semibold border border-blue-200"
                      >
                        ✓ {cap}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Available Support */}
                {partner.availableSupport && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Available Support Offerings
                    </span>
                    <ul className="space-y-0.5 text-[11px] text-slate-600 list-disc list-inside">
                      {partner.availableSupport.map((sup: string, idx: number) => (
                        <li key={idx}>{sup}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">
                  Nodal Contact: <strong>{partner.contactPerson}</strong>
                </span>
                <button
                  onClick={() => handleOpenRequest(partner)}
                  className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                >
                  <Send size={13} />
                  <span>Request Collaboration</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: COLLABORATION REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {collaborationRequests.length === 0 ? (
            <div className="p-12 bg-white rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
              No industry collaboration requests sent yet.
            </div>
          ) : (
            collaborationRequests.map((req) => (
              <div
                key={req.id}
                className="gov-card bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {req.id}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">Dispatched: {req.date}</span>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900">{req.industry}</h3>
                    <p className="text-xs text-blue-900 font-medium">Project: {req.project}</p>
                  </div>

                  <span
                    className={`font-mono text-xs font-bold uppercase px-3 py-1 rounded-full ${
                      req.status === 'Accepted'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : req.status === 'Under Review' || req.status === 'Pending' || req.status === 'Sent'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-200 text-slate-800 border border-slate-300'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                  <p className="text-slate-700">
                    <strong className="text-slate-900">Requested Support:</strong> {req.requiredSupport}
                  </p>
                  {req.technicalRequirements && (
                    <p className="text-slate-600 text-[11px]">
                      <strong>Technical Requirements:</strong> {req.technicalRequirements}
                    </p>
                  )}
                  {req.fundingRequirement && (
                    <p className="text-slate-600 text-[11px]">
                      <strong>Funding:</strong> {req.fundingRequirement}
                    </p>
                  )}
                  {req.additionalNotes && (
                    <p className="text-slate-500 text-[11px] italic">
                      Notes: {req.additionalNotes}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: ACTIVE PARTNERS */}
      {activeTab === 'active' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {activePartners.map((partner) => (
            <div
              key={partner.id}
              className="gov-card bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{partner.name}</h3>
                  <p className="text-xs text-slate-500">{partner.domain}</p>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active Collaboration
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{partner.reason}</p>
              <div className="p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-lg text-emerald-900 text-xs">
                ✓ Hardware test loop access granted for Ward 4 municipal sensor network
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: COMPLETED COLLABORATIONS */}
      {activeTab === 'completed' && (
        <div className="p-12 bg-white rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
          No past completed industry collaborations for current cohort.
        </div>
      )}

      {/* COLLABORATION REQUEST FORM MODAL */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#0a2540] text-white flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <Send size={18} className="text-amber-400" />
                <h3 className="text-sm font-extrabold tracking-tight">
                  Industry Collaboration Request Dispatch
                </h3>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-slate-300 hover:text-white p-1 rounded"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="p-5 sm:p-6 space-y-4 text-xs text-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Innovation Project
                  </label>
                  <input
                    type="text"
                    required
                    value={reqForm.project}
                    onChange={(e) => setReqForm({ ...reqForm, project: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Industry Partner
                  </label>
                  <input
                    type="text"
                    required
                    value={reqForm.industry}
                    onChange={(e) => setReqForm({ ...reqForm, industry: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Required Support Overview
                </label>
                <input
                  type="text"
                  required
                  value={reqForm.requiredSupport}
                  onChange={(e) => setReqForm({ ...reqForm, requiredSupport: e.target.value })}
                  placeholder="e.g. Testbench Access, Prototype Validation & Municipal Pilot Deployment"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Expected Duration
                  </label>
                  <input
                    type="text"
                    value={reqForm.expectedDuration}
                    onChange={(e) => setReqForm({ ...reqForm, expectedDuration: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Funding / Equipment Requirement
                  </label>
                  <input
                    type="text"
                    value={reqForm.fundingRequirement}
                    onChange={(e) => setReqForm({ ...reqForm, fundingRequirement: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Technical Requirements & Hardware Test Facilities
                </label>
                <textarea
                  value={reqForm.technicalRequirements}
                  onChange={(e) => setReqForm({ ...reqForm, technicalRequirements: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Testing Requirement
                  </label>
                  <input
                    type="text"
                    value={reqForm.testingRequirement}
                    onChange={(e) => setReqForm({ ...reqForm, testingRequirement: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Field Deployment Requirement
                  </label>
                  <input
                    type="text"
                    value={reqForm.fieldDeploymentRequirement}
                    onChange={(e) => setReqForm({ ...reqForm, fieldDeploymentRequirement: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Additional Notes
                </label>
                <textarea
                  value={reqForm.additionalNotes}
                  onChange={(e) => setReqForm({ ...reqForm, additionalNotes: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingRequest}
                  className="px-4 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Send size={13} />
                  <span>{sendingRequest ? 'Sending...' : 'Send Collaboration Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
