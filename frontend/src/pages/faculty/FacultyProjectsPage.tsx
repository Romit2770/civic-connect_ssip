import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
  Building2,
  CalendarCheck2,
  Sparkles,
  Search,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  X,
  Send,
  Layers,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { apiClient } from '../../api/client';

const LIFECYCLE_STAGES = [
  'Challenge Accepted',
  'Team Formed',
  'Solution Proposal',
  'Industry Collaboration',
  'Prototyping',
  'Testing',
  'Field Pilot',
  'Deployment',
  'Completed',
];

export default function FacultyProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<any | null>(null);
  const [isEditingProposal, setIsEditingProposal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [savingProposal, setSavingProposal] = useState(false);

  // Form state for proposal
  const [propForm, setPropForm] = useState({
    challengeId: 'CH-2026-089',
    challengeTitle: 'Low-Cost IoT Sensor Network for Pipeline Leakage',
    proposedSolution: '',
    objectives: '',
    techStack: '',
    industryPartner: 'Tata Steel Utilities & Infrastructure Services (TSUISL)',
    estimatedCost: '₹ 4,50,000',
    timeline: '6 Months',
    industrySupport: '',
    technicalRequirements: '',
    expectedOutcomes: '',
    status: 'Draft',
  });

  useEffect(() => {
    loadProjectsAndProposals();
  }, []);

  const loadProjectsAndProposals = async () => {
    setLoading(true);
    try {
      const [projRes, propRes] = await Promise.all([
        apiClient.get('/faculty/projects'),
        apiClient.get('/faculty/proposals'),
      ]);
      if (projRes.data.success) setProjects(projRes.data.data);
      if (propRes.data.success) setProposals(propRes.data.data);
    } catch (err) {
      console.warn('Failed to load projects and proposals');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProposal = (project: any) => {
    const existing = proposals.find(
      (p) => p.challengeId === project.challengeId || p.challengeTitle === project.title
    );
    if (existing) {
      setSelectedProposal(existing);
      setPropForm({
        challengeId: existing.challengeId,
        challengeTitle: existing.challengeTitle,
        proposedSolution: existing.proposedSolution || '',
        objectives: existing.objectives || '',
        techStack: existing.techStack || '',
        industryPartner: existing.industryPartner || project.industryPartner || '',
        estimatedCost: existing.estimatedCost || project.budget || '',
        timeline: existing.timeline || '6 Months',
        industrySupport: existing.industrySupport || '',
        technicalRequirements: existing.technicalRequirements || '',
        expectedOutcomes: existing.expectedOutcomes || '',
        status: existing.status || 'Draft',
      });
    } else {
      setSelectedProposal(null);
      setPropForm({
        challengeId: project.challengeId,
        challengeTitle: project.title,
        proposedSolution: '',
        objectives: '',
        techStack: '',
        industryPartner: project.industryPartner || '',
        estimatedCost: project.budget || '₹ 4,50,000',
        timeline: '6 Months',
        industrySupport: '',
        technicalRequirements: '',
        expectedOutcomes: '',
        status: 'Draft',
      });
    }
    setIsEditingProposal(false);
    setSelectedProject(project);
  };

  const handleSaveProposal = async (submitNow = false) => {
    setSavingProposal(true);
    try {
      const payload = {
        ...propForm,
        id: selectedProposal?.id,
        status: submitNow ? 'Submitted' : propForm.status || 'Draft',
      };
      const res = await apiClient.post('/faculty/proposals', payload);
      if (res.data.success) {
        setActionSuccess(`Solution Proposal ${submitNow ? 'submitted' : 'saved'} successfully.`);
        loadProjectsAndProposals();
        setSelectedProposal(res.data.data);
        setIsEditingProposal(false);
      }
    } catch (err) {
      alert('Failed to save proposal');
    } finally {
      setSavingProposal(false);
    }
  };

  const getStageIndex = (stage: string) => {
    const idx = LIFECYCLE_STAGES.indexOf(stage);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0a2540] text-amber-400 flex items-center justify-center font-bold shadow-xs shrink-0">
            <FolderGit2 size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              My Innovation Projects
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Track project execution from accepted challenge to final deployment.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadProjectsAndProposals()}
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

      {/* Projects List */}
      <div className="space-y-5">
        {projects.length === 0 ? (
          <div className="p-12 bg-white rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
            No projects found under current mentorship.
          </div>
        ) : (
          projects.map((proj) => {
            const currentIdx = getStageIndex(proj.currentStage);
            const proposal = proposals.find(
              (p) => p.challengeId === proj.challengeId || p.challengeTitle === proj.title
            );

            return (
              <div
                key={proj.id}
                className="gov-card bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5 hover:border-slate-300 transition-all"
              >
                {/* Project Header */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {proj.id}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">Linked: {proj.challengeId}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {proj.domain}
                      </span>
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                      {proj.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                      Budget: <strong>{proj.budget}</strong>
                    </span>
                    <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {proj.status}
                    </span>
                  </div>
                </div>

                {/* VISUAL LIFECYCLE STEPPER */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                      Project Lifecycle Progress: <span className="text-blue-900 font-bold">{proj.currentStage}</span>
                    </span>
                    <span className="font-mono font-extrabold text-blue-700">{proj.progress}%</span>
                  </div>

                  <div className="hidden md:grid grid-cols-9 gap-1 text-[10px] font-semibold text-center pt-1">
                    {LIFECYCLE_STAGES.map((stage, idx) => {
                      const isPast = idx < currentIdx;
                      const isCurrent = idx === currentIdx;
                      return (
                        <div key={idx} className="flex flex-col items-center gap-1.5">
                          <div
                            className={`w-full h-2 rounded-full transition-all ${
                              isPast
                                ? 'bg-emerald-500'
                                : isCurrent
                                ? 'bg-blue-600 ring-2 ring-blue-300 ring-offset-1'
                                : 'bg-slate-200'
                            }`}
                          />
                          <span
                            className={`line-clamp-2 leading-tight ${
                              isCurrent
                                ? 'text-blue-900 font-bold'
                                : isPast
                                ? 'text-slate-700'
                                : 'text-slate-400'
                            }`}
                          >
                            {stage}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Fallback Mobile Progress bar */}
                  <div className="md:hidden w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${proj.progress}%` }} />
                  </div>
                </div>

                {/* Project Metadata Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Student Team</span>
                    <span className="font-bold text-slate-900">{proj.studentTeam}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Faculty Mentor</span>
                    <span className="font-bold text-slate-900">{proj.facultyMentor}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Industry Partner</span>
                    <span className="font-bold text-slate-900">{proj.industryPartner}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Proposal Status</span>
                    <span
                      className={`inline-block font-mono text-[10px] font-bold uppercase px-2 py-0.2 rounded ${
                        proposal?.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : proposal?.status === 'Under Review'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {proposal?.status || 'Draft'}
                    </span>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenProposal(proj)}
                      className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                      <FileText size={14} />
                      <span>Manage Project Proposal</span>
                    </button>
                    <button
                      onClick={() => navigate('/faculty/milestones')}
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg font-bold shadow-2xs cursor-pointer flex items-center gap-1.5"
                    >
                      <CalendarCheck2 size={14} />
                      <span>Milestones</span>
                    </button>
                  </div>

                  <button
                    onClick={() => navigate('/faculty/industry')}
                    className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Industry Collaboration</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PROPOSAL MANAGEMENT MODAL */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 bg-[#0a2540] text-white flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <FileText size={18} className="text-amber-400" />
                <div>
                  <span className="font-mono text-xs text-amber-300 font-bold block">
                    {selectedProposal?.id || 'NEW PROPOSAL'}
                  </span>
                  <h3 className="text-sm font-extrabold tracking-tight">Solution Proposal Manager</h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-slate-300 hover:text-white p-1 rounded"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5 text-xs text-slate-800">
              {/* Proposal Header Banner */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Linked Innovation Challenge
                  </p>
                  <p className="font-bold text-slate-900 text-sm">{selectedProject.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Status:</span>
                  <span
                    className={`font-mono text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      selectedProposal?.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : selectedProposal?.status === 'Under Review'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : selectedProposal?.status === 'Revision Required'
                        ? 'bg-orange-100 text-orange-800 border border-orange-300'
                        : 'bg-slate-200 text-slate-800 border border-slate-300'
                    }`}
                  >
                    {selectedProposal?.status || 'Draft'}
                  </span>
                </div>
              </div>

              {/* Review Comments Alert if any */}
              {selectedProposal?.reviewComments && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider block">
                    University Admin / Reviewer Evaluation Note
                  </span>
                  <p className="text-xs leading-relaxed">{selectedProposal.reviewComments}</p>
                </div>
              )}

              {/* Form / View Content */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Problem Statement
                  </label>
                  <textarea
                    disabled={!isEditingProposal && selectedProposal}
                    value={propForm.objectives}
                    onChange={(e) => setPropForm({ ...propForm, objectives: e.target.value })}
                    placeholder="Describe specific engineering objectives and quantifiable municipal problem targets..."
                    rows={2}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700 disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Proposed Solution
                  </label>
                  <textarea
                    disabled={!isEditingProposal && selectedProposal}
                    value={propForm.proposedSolution}
                    onChange={(e) => setPropForm({ ...propForm, proposedSolution: e.target.value })}
                    placeholder="Detail the technical architecture, methodology, algorithms, and deployment mechanics..."
                    rows={3}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700 disabled:bg-slate-50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Technology Stack
                    </label>
                    <input
                      type="text"
                      disabled={!isEditingProposal && selectedProposal}
                      value={propForm.techStack}
                      onChange={(e) => setPropForm({ ...propForm, techStack: e.target.value })}
                      placeholder="e.g. LoRaWAN, ESP32-S3, Edge Impulse, AWS IoT Core"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700 disabled:bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Industry Partner / Support
                    </label>
                    <input
                      type="text"
                      disabled={!isEditingProposal && selectedProposal}
                      value={propForm.industrySupport}
                      onChange={(e) => setPropForm({ ...propForm, industrySupport: e.target.value })}
                      placeholder="e.g. TSUISL hardware validation & testbench"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700 disabled:bg-slate-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Estimated Budget
                    </label>
                    <input
                      type="text"
                      disabled={!isEditingProposal && selectedProposal}
                      value={propForm.estimatedCost}
                      onChange={(e) => setPropForm({ ...propForm, estimatedCost: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700 disabled:bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Execution Timeline
                    </label>
                    <input
                      type="text"
                      disabled={!isEditingProposal && selectedProposal}
                      value={propForm.timeline}
                      onChange={(e) => setPropForm({ ...propForm, timeline: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700 disabled:bg-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Technical Requirements & Hardware Specs
                  </label>
                  <textarea
                    disabled={!isEditingProposal && selectedProposal}
                    value={propForm.technicalRequirements}
                    onChange={(e) => setPropForm({ ...propForm, technicalRequirements: e.target.value })}
                    placeholder="Transducers, battery requirements, microcontrollers, environmental ratings..."
                    rows={2}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700 disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Expected Outcomes & Civic Impact
                  </label>
                  <textarea
                    disabled={!isEditingProposal && selectedProposal}
                    value={propForm.expectedOutcomes}
                    onChange={(e) => setPropForm({ ...propForm, expectedOutcomes: e.target.value })}
                    placeholder="Specific quantifiable benefits for citizens and municipal administration..."
                    rows={2}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700 disabled:bg-slate-50"
                  />
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500">
                  Mentor: <strong>{selectedProject.facultyMentor}</strong> • Team: <strong>{selectedProject.studentTeam}</strong>
                </div>

                <div className="flex items-center gap-2">
                  {!isEditingProposal && selectedProposal ? (
                    <button
                      type="button"
                      onClick={() => setIsEditingProposal(true)}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Edit size={13} />
                      <span>Edit Proposal</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSaveProposal(false)}
                        disabled={savingProposal}
                        className="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                      >
                        Save Draft
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveProposal(true)}
                        disabled={savingProposal}
                        className="px-4 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Send size={13} />
                        <span>{savingProposal ? 'Submitting...' : 'Submit Proposal'}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
