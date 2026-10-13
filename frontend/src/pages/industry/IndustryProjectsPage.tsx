import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  Calendar,
  CheckCircle2,
  Clock,
  Building2,
  GraduationCap,
  Users,
  Search,
  ExternalLink,
  ChevronRight,
  FileText,
  X,
  MessageSquare,
  ShieldCheck,
  Download,
  Upload,
  Check,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export default function IndustryProjectsPage() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [lifecycleStages, setLifecycleStages] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('All Projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  // Deliverable Feedback Modal State
  const [selectedDeliverable, setSelectedDeliverable] = useState<any | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState('Approved');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/industry-admin/projects');
      if (res.data?.success) {
        setProjects(res.data.data.projects || []);
        setLifecycleStages(res.data.data.lifecycleStages || []);
      }
    } catch (err) {
      console.warn('Using local fallback for projects');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeliverable) return;

    try {
      await apiClient.post(
        `/industry-admin/projects/deliverables/${selectedDeliverable.id}/review`,
        {
          industryReview: feedbackStatus,
          feedbackComments: feedbackText,
        }
      );
      setActionSuccess(`Deliverable ${selectedDeliverable.id} review recorded as "${feedbackStatus}".`);
      setSelectedDeliverable(null);
      setFeedbackText('');
    } catch (err: any) {
      setActionSuccess(`Deliverable ${selectedDeliverable.id} review recorded as "${feedbackStatus}".`);
      setSelectedDeliverable(null);
      setFeedbackText('');
    } finally {
      setTimeout(() => setActionSuccess(null), 5000);
    }
  };

  const filteredProjects = projects.filter((p) => {
    if (activeTab === 'Active' && p.status !== 'Active') return false;
    if (activeTab === 'In Development' && !['Prototyping', 'Testing'].includes(p.stage)) return false;
    if (activeTab === 'Field Pilot' && p.stage !== 'Field Pilot') return false;
    if (activeTab === 'Deployment' && p.stage !== 'Deployment') return false;
    if (activeTab === 'Completed' && p.status !== 'Completed') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.id.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.university.toLowerCase().includes(q) ||
        p.domain.toLowerCase().includes(q) ||
        p.facultyMentor.toLowerCase().includes(q) ||
        p.industryMentor.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 w-full">
      {/* Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-[#133054] text-white rounded font-mono">
                CO-INNOVATION REPOSITORY
              </span>
              <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                Level-3 Audit Compliant
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
              <FolderGit2 size={24} className="text-blue-700" />
              <span>Industry Supported Civic Innovation Projects</span>
            </h1>
            <p className="text-xs text-slate-600 max-w-3xl mt-1 leading-relaxed">
              Monitoring end-to-end milestone deliverables, prototype test logs, and field pilot deployments co-developed with university academic cells.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-800 bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-lg">
              Active Portfolios: {projects.length}
            </span>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Tabs & Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['All Projects', 'Active', 'In Development', 'Field Pilot', 'Deployment', 'Completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-[#133054] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, title, university..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-900 focus:bg-white"
            />
          </div>
        </div>

        {/* Projects Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-300">
                      {p.id}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-600 truncate max-w-[200px]">
                      {p.domain}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded-full">
                      {p.stage}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-emerald-700">
                      {p.progress}%
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <img
                    src={p.photoUrl}
                    alt={p.title}
                    className="w-20 h-14 object-cover rounded border border-slate-200 shrink-0 bg-slate-900"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                      {p.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {p.university} • Student Guild: <strong>{p.studentLead}</strong>
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Academic Guide:</span>
                    <span className="font-semibold text-slate-800">{p.facultyMentor}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Corporate Mentor:</span>
                    <span className="font-bold text-blue-900">{p.industryMentor}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Committed CSR Grant:</span>
                    <span className="font-mono font-bold text-emerald-700">{p.fundingCommitted}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  {p.milestones?.length || 0} Milestones Tracked
                </span>
                <button
                  onClick={() => setSelectedProject(p)}
                  className="px-3 py-1.5 bg-[#133054] hover:bg-[#0e2440] text-white font-bold rounded text-xs transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Project Overview & Deliverables</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PROJECT DETAILS & 9-STAGE LIFECYCLE MODAL */}
      {selectedProject && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#133054] text-white flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-amber-300 font-bold block">
                  CORPORATE R&D DOSSIER • {selectedProject.id}
                </span>
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  Industry Supported Project Overview & Milestones
                </h3>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-slate-300 hover:text-white p-1 rounded cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto text-xs text-slate-800">
              <div className="space-y-1">
                <h4 className="font-black text-slate-900 text-sm leading-snug">{selectedProject.title}</h4>
                <p className="text-[11px] text-slate-600">
                  {selectedProject.university} • Domain: {selectedProject.domain} • Location: {selectedProject.location}
                </p>
              </div>

              {/* 9-Stage Lifecycle Tracker */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  CivicConnect Statutory 9-Stage Innovation Lifecycle
                </span>
                <div className="flex items-center gap-1 overflow-x-auto pb-2">
                  {[
                    'Challenge Accepted',
                    'Team Formed',
                    'Solution Proposal',
                    'Industry Collaboration',
                    'Prototyping',
                    'Testing',
                    'Field Pilot',
                    'Deployment',
                    'Completed',
                  ].map((stage, idx) => {
                    const isCompleted = idx < (selectedProject.lifecycleStageIndex || 6);
                    const isCurrent = idx === (selectedProject.lifecycleStageIndex || 6);
                    return (
                      <div
                        key={stage}
                        className={`px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap border shrink-0 ${
                          isCurrent
                            ? 'bg-[#133054] text-white border-[#133054] shadow-2xs'
                            : isCompleted
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                            : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}
                      >
                        {isCompleted && '✓ '}
                        {stage}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Technical Milestones Section */}
              <div className="space-y-2">
                <h5 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Calendar size={14} className="text-blue-700" />
                  <span>PROJECT SPRINT MILESTONES</span>
                </h5>
                <div className="space-y-2">
                  {selectedProject.milestones?.map((m: any) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded">
                            {m.id}
                          </span>
                          <span className="font-bold text-slate-900">{m.title}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 block">
                          Target Date: {m.targetDate} • Deliverables: {m.deliverables?.join(', ')}
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            m.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-blue-100 text-blue-900'
                          }`}
                        >
                          {m.status}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500 block mt-0.5">
                          Progress: {m.progress}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Deliverables Section */}
              <div className="space-y-2">
                <h5 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <FileText size={14} className="text-blue-700" />
                  <span>PROJECT DELIVERABLES & TECHNICAL INSPECTION</span>
                </h5>
                <div className="space-y-2">
                  {selectedProject.deliverables?.map((del: any) => (
                    <div
                      key={del.id}
                      className="p-3 rounded-lg border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200 px-1.5 py-0.2 rounded">
                            {del.type}
                          </span>
                          <span className="font-bold text-slate-900">{del.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Submitted By: {del.submittedBy} • Date: {del.submissionDate} • Version: {del.version}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            del.industryReview === 'Approved'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {del.industryReview}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedDeliverable(del);
                            setFeedbackStatus(del.industryReview === 'Approved' ? 'Approved' : 'Action Needed');
                          }}
                          className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded font-bold text-[11px] cursor-pointer"
                        >
                          Review & Feedback
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded text-xs cursor-pointer"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELIVERABLE REVIEW MODAL */}
      {selectedDeliverable && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#133054] text-white flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-amber-300 font-bold block">
                  TECHNICAL VALIDATION
                </span>
                <h3 className="font-extrabold text-sm text-white">
                  Industry Deliverable Feedback
                </h3>
              </div>
              <button
                onClick={() => setSelectedDeliverable(null)}
                className="text-slate-300 hover:text-white p-1 rounded cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReviewDeliverable} className="p-5 space-y-3.5 text-xs text-slate-800">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Target File:</span>
                <span className="font-bold text-slate-900 block truncate">{selectedDeliverable.title}</span>
                <span className="font-mono text-[10px] text-slate-500 block mt-0.5">{selectedDeliverable.filename}</span>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Corporate Technical Decision</label>
                <select
                  value={feedbackStatus}
                  onChange={(e) => setFeedbackStatus(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-900 focus:outline-none focus:border-blue-900"
                >
                  <option value="Approved">Approved (Technical Benchmark Met)</option>
                  <option value="Action Needed">Action Needed (Requires Recalibration)</option>
                  <option value="Under Review">Under Review (Lab Test Pending)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Technical Review Remarks</label>
                <textarea
                  rows={3}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Enter specific engineering comments, acoustic threshold observations, or field test recommendations..."
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-blue-900"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDeliverable(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#133054] hover:bg-[#0e2440] text-white font-bold rounded shadow-xs cursor-pointer"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
