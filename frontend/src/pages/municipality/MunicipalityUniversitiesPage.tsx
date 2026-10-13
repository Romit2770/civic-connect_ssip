import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Building,
  FileText,
  CheckCircle2,
  Clock,
  Eye,
  RefreshCw,
  AlertTriangle,
  FolderGit2,
  ChevronRight,
  Send,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';
import { apiClient, getErrorMessage } from '../../api/client';

export default function MunicipalityUniversitiesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'universities' | 'proposals' | 'active_projects' | 'completed_projects'>('universities');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [universities, setUniversities] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);

  // Selected Proposal Review Modal
  const [selectedProposal, setSelectedProposal] = useState<any | null>(null);
  const [reviewStatus, setReviewStatus] = useState<string>('Accepted');
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  const loadUniversityData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/municipality/universities');
      if (res.data.success) {
        setUniversities(res.data.data.universities || []);
        setProposals(res.data.data.proposals || []);
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUniversityData();
  }, []);

  const handleOpenProposalModal = (prop: any) => {
    setSelectedProposal(prop);
    setReviewStatus(prop.status === 'Submitted' ? 'Accepted' : prop.status);
    setReviewRemarks(prop.municipalRemarks || '');
    setReviewSuccess(null);
  };

  const handleCloseProposalModal = () => {
    setSelectedProposal(null);
    setReviewSuccess(null);
  };

  const handleSaveProposalReview = async () => {
    if (!selectedProposal) return;
    setReviewLoading(true);
    setReviewSuccess(null);
    try {
      const res = await apiClient.post(`/municipality/proposals/${selectedProposal.id}/review`, {
        status: reviewStatus,
        remarks: reviewRemarks,
      });

      if (res.data.success) {
        setReviewSuccess(`Proposal updated to ${reviewStatus}`);
        setSelectedProposal(res.data.data);
        loadUniversityData();
      }
    } catch (err: any) {
      alert(getErrorMessage(err));
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide bg-blue-900 text-white font-mono">
              ACADEMIC R&D
            </span>
            <span className="text-xs text-slate-500 font-semibold">Higher Education Institution Alliances</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            University Collaboration
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Monitor universities working on civic challenges, review technical proposals, and coordinate field testing within Anand Municipality.
          </p>
        </div>

        <button
          onClick={loadUniversityData}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin text-blue-600' : 'text-slate-500'} />
          <span>Refresh Alliances</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={loadUniversityData} className="underline font-bold cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* 2. Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('universities')}
          className={`px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
            activeTab === 'universities'
              ? 'border-blue-900 text-blue-900 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          Assigned Universities ({universities.length})
        </button>

        <button
          onClick={() => setActiveTab('proposals')}
          className={`px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
            activeTab === 'proposals'
              ? 'border-blue-900 text-blue-900 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          Proposals ({proposals.length})
        </button>

        <button
          onClick={() => setActiveTab('active_projects')}
          className={`px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
            activeTab === 'active_projects'
              ? 'border-blue-900 text-blue-900 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          Active Projects (18)
        </button>

        <button
          onClick={() => setActiveTab('completed_projects')}
          className={`px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
            activeTab === 'completed_projects'
              ? 'border-blue-900 text-blue-900 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          Completed Projects (97)
        </button>
      </div>

      {/* 3. ASSIGNED UNIVERSITIES TAB CONTENT */}
      {activeTab === 'universities' && (
        <div className="rounded-lg bg-white border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/80">
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <GraduationCap size={16} className="text-blue-900" />
              <span>Participating Universities & Academic HEIs</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Engineering colleges and research institutions partnered under the Smart India Hackathon / Urban Innovation Framework.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#1E3A8A] text-white font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">University / Institution</th>
                  <th className="py-2.5 px-3">Participating Department</th>
                  <th className="py-2.5 px-3 text-center">Assigned Challenges</th>
                  <th className="py-2.5 px-3 text-center">Active Projects</th>
                  <th className="py-2.5 px-3 text-center">Completed</th>
                  <th className="py-2.5 px-3">Faculty Mentors</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {universities.map((univ: any, idx: number) => (
                  <tr
                    key={univ.id}
                    className={`hover:bg-blue-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                  >
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-slate-900 block">{univ.name}</span>
                      <span className="text-[10px] text-slate-500">{univ.district}, {univ.state}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">
                      {univ.department}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-950">
                      {univ.assignedChallenges}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-indigo-700">
                      {univ.activeProjects}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">
                      {univ.completedProjects}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                      {univ.facultyMentors?.join(', ') || 'N/A'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        {univ.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => navigate('/municipality-admin/projects')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors cursor-pointer"
                      >
                        <FolderGit2 size={12} />
                        <span>View Projects</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. UNIVERSITY PROPOSALS TAB CONTENT */}
      {activeTab === 'proposals' && (
        <div className="rounded-lg bg-white border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/80">
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <FileText size={16} className="text-blue-900" />
              <span>University Solution Proposals</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Review formal technical and civic engineering proposals submitted by universities for Anand Municipality challenges.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#1E3A8A] text-white font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Proposal ID</th>
                  <th className="py-2.5 px-3">University</th>
                  <th className="py-2.5 px-3">Project Title</th>
                  <th className="py-2.5 px-3">Linked Challenge</th>
                  <th className="py-2.5 px-3">Faculty Mentor</th>
                  <th className="py-2.5 px-3">Budget</th>
                  <th className="py-2.5 px-3">Timeline</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {proposals.map((prop: any, idx: number) => {
                  const isAccepted = prop.status === 'Accepted';
                  const isUnderReview = prop.status === 'Under Review';
                  const isSubmitted = prop.status === 'Submitted';

                  return (
                    <tr
                      key={prop.id}
                      className={`hover:bg-blue-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-950">
                        {prop.proposalId || prop.id}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {prop.university}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 max-w-xs truncate" title={prop.project}>
                        {prop.project}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-blue-900 font-semibold">
                        {prop.linkedChallenge}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                        {prop.facultyMentor}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        {prop.budget}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                        {prop.timeline}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            isAccepted
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : isUnderReview
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : isSubmitted
                              ? 'bg-blue-100 text-blue-900 border border-blue-300'
                              : 'bg-slate-100 text-slate-800 border border-slate-300'
                          }`}
                        >
                          {prop.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleOpenProposalModal(prop)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors cursor-pointer"
                        >
                          <Eye size={12} />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. ACTIVE / COMPLETED PROJECTS REDIRECTION BANNER */}
      {(activeTab === 'active_projects' || activeTab === 'completed_projects') && (
        <div className="p-6 rounded-lg bg-white border border-slate-200 text-center space-y-3 shadow-2xs">
          <FolderGit2 size={32} className="mx-auto text-blue-900" />
          <h3 className="font-extrabold text-sm text-slate-900">
            {activeTab === 'active_projects' ? '18 Projects Under Active Implementation' : '97 Successfully Completed Municipal Projects'}
          </h3>
          <p className="text-xs text-slate-600 max-w-lg mx-auto">
            Full milestone tracking, delay monitoring, and field implementation telemetry are unified in the Project Monitoring module.
          </p>
          <button
            onClick={() => navigate('/municipality-admin/projects')}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-md shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>Open Municipal Project Monitoring</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* 6. PROPOSAL REVIEW MODAL */}
      {selectedProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-3xl w-full p-5 space-y-4 my-auto animate-in fade-in zoom-in-95 duration-150 text-xs text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {selectedProposal.proposalId}
                </span>
                <h3 className="font-extrabold text-base text-slate-900 mt-1">
                  {selectedProposal.project}
                </h3>
              </div>
              <button onClick={handleCloseProposalModal} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {reviewSuccess && (
              <div className="p-2.5 rounded bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>{reviewSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Submitting University</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedProposal.university}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Faculty Mentor</span>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedProposal.facultyMentor}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Linked Civic Challenge</span>
                <p className="font-mono font-bold text-blue-900 mt-0.5">{selectedProposal.linkedChallenge}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Budget & Timeline</span>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedProposal.budget} • {selectedProposal.timeline}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Technology Stack & Methodology</span>
                <p className="text-slate-700 mt-0.5 bg-white p-2 rounded border border-slate-200">{selectedProposal.technology}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Expected Civic Outcome</span>
                <p className="text-slate-700 mt-0.5 bg-white p-2 rounded border border-slate-200">{selectedProposal.expectedOutcome}</p>
              </div>
            </div>

            {/* Municipal Action Desk */}
            <div className="space-y-3 bg-blue-50/50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-extrabold text-blue-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Building size={14} className="text-blue-900" />
                <span>Municipal ULB Participation Decision</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                    Municipal Decision
                  </label>
                  <select
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs bg-white font-semibold"
                  >
                    <option value="Accepted">Accept Municipal Participation</option>
                    <option value="Changes Requested">Request Clarification / Changes</option>
                    <option value="Under Review">Under Inter-departmental Review</option>
                    <option value="Rejected">Reject / Return Proposal</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                    Municipal Field Clearance
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Granted by Chief Officer Shri J. Trivedi"
                    className="w-full p-2 border border-slate-200 bg-slate-100 rounded text-xs text-slate-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                  Municipal Administrative Remarks & Support Commitments
                </label>
                <textarea
                  rows={3}
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  placeholder="Detail municipal site access, required ward permissions, water/electrical hookups, or requested modifications..."
                  className="w-full p-2 border border-slate-300 rounded text-xs bg-white text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-blue-200">
                <button
                  onClick={handleCloseProposalModal}
                  className="px-3 py-1.5 border border-slate-300 text-xs font-bold text-slate-700 rounded hover:bg-slate-100"
                >
                  Close
                </button>
                <button
                  onClick={handleSaveProposalReview}
                  disabled={reviewLoading}
                  className="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Send size={13} />
                  <span>Save Municipal Determination</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
