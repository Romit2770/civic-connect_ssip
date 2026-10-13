import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FolderGit2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Layers,
  GraduationCap,
  Building,
  User,
  IndianRupee,
  MapPin,
  Calendar,
  X,
  FileText,
  AlertCircle,
  Eye,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export default function CSRProjectsPage() {
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [counts, setCounts] = useState<any>({ all: 0, active: 0, atRisk: 0, delayed: 0, completed: 0 });
  const [activeTab, setActiveTab] = useState('All');
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  useEffect(() => {
    loadProjects();
  }, [activeTab]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/csr/projects', {
        params: { tab: activeTab },
      });
      if (res.data?.success) {
        setProjects(res.data.data.projects || []);
        setCounts(res.data.data.counts || {});

        if (highlightId) {
          const match = res.data.data.projects.find(
            (p: any) => p.projectId === highlightId || p.challengeId === highlightId
          );
          if (match) setSelectedProject(match);
        }
      }
    } catch (err) {
      console.warn('Using local fallback for projects');
    } finally {
      setLoading(false);
    }
  };

  const LIFECYCLE_STAGES = [
    'Proposal',
    'Approved',
    'Funding Released',
    'Prototype',
    'Testing',
    'Field Deployment',
    'Impact Assessment',
    'Completed',
  ];

  const getStageIndex = (stage: string) => {
    const idx = LIFECYCLE_STAGES.indexOf(stage);
    return idx === -1 ? 1 : idx;
  };

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#133054]">CSR Project Monitoring</h1>
            <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
              FIELD SURVEILLANCE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track multi-stage R&D execution, milestone deliverables, and municipal operational risk matrix.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        {[
          { key: 'All', label: 'All Projects', count: counts.all },
          { key: 'Active', label: 'Active', count: counts.active },
          { key: 'At Risk', label: 'At Risk', count: counts.atRisk },
          { key: 'Delayed', label: 'Delayed', count: counts.delayed },
          { key: 'Completed', label: 'Completed', count: counts.completed },
        ].map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors shrink-0 ${
                active
                  ? 'bg-[#133054] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {tab.count || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Projects Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p: any) => (
          <div
            key={p.projectId}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-mono text-[10px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {p.projectId}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    p.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : p.status === 'At Risk'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : p.status === 'Delayed'
                      ? 'bg-rose-50 text-rose-800 border-rose-300'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  {p.status}
                </span>
              </div>

              <h3 className="font-bold text-xs text-slate-900 leading-snug line-clamp-2" title={p.projectTitle}>
                {p.projectTitle}
              </h3>

              <div className="mt-2 space-y-1 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <GraduationCap size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate">{p.university}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate">{p.location}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-slate-400">Team:</span>
                  <span className="font-semibold text-slate-800">{p.studentTeam}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-400">Mentor:</span>
                  <span className="font-medium text-slate-700">{p.facultyMentor}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-700">Stage: {p.stage}</span>
                  <span className="font-bold text-slate-900 font-mono">{p.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#133054] h-full rounded-full" style={{ width: `${p.progress}%` }} />
                </div>
              </div>

              {/* Budget Strip */}
              <div className="mt-3 p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">CSR Grant</span>
                  <span className="font-mono font-bold text-slate-900">
                    ₹ {(p.approvedBudget / 100000).toFixed(2)} L
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">Utilized</span>
                  <span className="font-mono font-bold text-emerald-700">
                    ₹ {(p.utilizedFunding / 100000).toFixed(2)} L
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedProject(p)}
              className="w-full py-1.5 bg-[#133054] hover:bg-[#0f243e] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Eye size={13} className="text-amber-400" />
              <span>Manage Project & Milestones</span>
            </button>
          </div>
        ))}
      </div>

      {/* Project Details Modal (Section 15 & 16) */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl border border-slate-300 overflow-hidden my-6">
            <div className="bg-[#133054] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
                    {selectedProject.projectId}
                  </span>
                  <span className="text-xs text-blue-200 font-mono">
                    Challenge: {selectedProject.challengeId}
                  </span>
                </div>
                <h3 className="font-bold text-base tracking-tight mt-1">{selectedProject.projectTitle}</h3>
              </div>
              <button onClick={() => setSelectedProject(null)} className="text-white/80 hover:text-white font-bold text-xl">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs max-h-[80vh] overflow-y-auto">
              {/* Lifecycle Progress Bar (Section 15) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                  Innovation Lifecycle Progression
                </span>
                <div className="flex items-center justify-between overflow-x-auto gap-1">
                  {LIFECYCLE_STAGES.map((st, idx) => {
                    const currentIdx = getStageIndex(selectedProject.stage);
                    const isPassed = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;
                    return (
                      <div key={st} className="flex-1 text-center min-w-[80px]">
                        <div
                          className={`h-2 rounded-full mb-1.5 transition-all ${
                            isPassed ? 'bg-[#133054]' : 'bg-slate-200'
                          } ${isCurrent ? 'ring-2 ring-amber-400' : ''}`}
                        />
                        <span
                          className={`text-[9.5px] block font-semibold leading-tight ${
                            isCurrent
                              ? 'text-[#133054] font-bold'
                              : isPassed
                              ? 'text-slate-700'
                              : 'text-slate-400'
                          }`}
                        >
                          {st}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Project Information Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-white border border-slate-200 rounded-xl text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">University & Campus</span>
                  <span className="font-bold text-slate-900">{selectedProject.university}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Faculty Mentor</span>
                  <span className="font-semibold text-slate-800">{selectedProject.facultyMentor}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Student Team</span>
                  <span className="font-semibold text-slate-800">{selectedProject.studentTeam}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Industry Mentor</span>
                  <span className="font-semibold text-slate-800">{selectedProject.industryMentor}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">CSR Project Lead</span>
                  <span className="font-semibold text-slate-800">{selectedProject.csrProjectLead}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Location & Wards</span>
                  <span className="font-semibold text-slate-800">{selectedProject.location}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Sanctioned Budget</span>
                  <span className="font-mono font-bold text-[#133054]">
                    ₹ {(selectedProject.approvedBudget / 100000).toFixed(2)} L
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Funding Status</span>
                  <span className="font-semibold text-emerald-700">
                    Released: ₹ {(selectedProject.releasedFunding / 100000).toFixed(2)} L
                  </span>
                </div>
              </div>

              {/* 1. Milestone Monitoring (Section 16) */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs flex items-center gap-1.5">
                    <Clock size={13} className="text-[#133054]" />
                    Milestones & Deadlines
                  </h4>
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2">Milestone</th>
                      <th className="px-3 py-2">Due Date</th>
                      <th className="px-3 py-2">Progress</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {selectedProject.milestones?.map((m: any) => (
                      <tr key={m.id}>
                        <td className="px-3 py-2 font-semibold text-slate-900">{m.title}</td>
                        <td className="px-3 py-2 font-mono text-slate-500 text-[11px]">{m.dueDate}</td>
                        <td className="px-3 py-2">
                          <span className="font-mono font-bold">{m.progress}%</span>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              m.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : m.status === 'In Progress'
                                ? 'bg-blue-50 text-blue-800 border-blue-300'
                                : m.status === 'Delayed'
                                ? 'bg-rose-50 text-rose-800 border-rose-300'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 2. Deliverables (Section 16) */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs flex items-center gap-1.5">
                    <FileText size={13} className="text-[#133054]" />
                    Deliverables & Technical Dossiers
                  </h4>
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2">Deliverable</th>
                      <th className="px-3 py-2">Submitted By</th>
                      <th className="px-3 py-2">Submission Date</th>
                      <th className="px-3 py-2">Review Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {selectedProject.deliverables?.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-slate-500">
                          No deliverables submitted yet for this project phase.
                        </td>
                      </tr>
                    ) : (
                      selectedProject.deliverables?.map((d: any) => (
                        <tr key={d.id}>
                          <td className="px-3 py-2 font-semibold text-slate-900">{d.title}</td>
                          <td className="px-3 py-2 text-slate-700">{d.submittedBy}</td>
                          <td className="px-3 py-2 font-mono text-slate-500 text-[11px]">{d.submissionDate}</td>
                          <td className="px-3 py-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-emerald-50 text-emerald-800 border-emerald-300">
                              {d.reviewStatus}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* 3. Issues & Risks (Section 16) */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs flex items-center gap-1.5">
                    <AlertTriangle size={13} className="text-amber-600" />
                    Issues & Operational Risks
                  </h4>
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2">Issue / Risk</th>
                      <th className="px-3 py-2">Severity</th>
                      <th className="px-3 py-2">Reported Date</th>
                      <th className="px-3 py-2">Responsible</th>
                      <th className="px-3 py-2">Resolution / Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {selectedProject.risks?.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-500">
                          Zero active risks reported. Project is on schedule.
                        </td>
                      </tr>
                    ) : (
                      selectedProject.risks?.map((r: any) => (
                        <tr key={r.id}>
                          <td className="px-3 py-2 font-semibold text-slate-900 max-w-[200px]">{r.title}</td>
                          <td className="px-3 py-2">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                                r.severity === 'Critical'
                                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                                  : r.severity === 'High'
                                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : 'bg-slate-100 text-slate-800 border-slate-200'
                              }`}
                            >
                              {r.severity}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-mono text-slate-500 text-[11px]">{r.reportedDate}</td>
                          <td className="px-3 py-2 text-slate-700">{r.responsiblePerson}</td>
                          <td className="px-3 py-2">
                            <div className="text-slate-700 text-[11px]">{r.resolution || 'Investigation underway'}</div>
                            <span
                              className={`text-[9.5px] font-bold ${
                                r.status === 'Closed' || r.status === 'Mitigated' ? 'text-emerald-700' : 'text-rose-700'
                              }`}
                            >
                              [{r.status}]
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Modal Footer */}
              <div className="pt-2 flex justify-end border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-1.5 bg-[#133054] text-white rounded font-bold hover:bg-[#0f243e]"
                >
                  Close Console
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
