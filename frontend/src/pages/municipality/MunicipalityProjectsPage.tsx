import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Eye,
  Check,
  Send,
  X,
  Building,
  GraduationCap,
  Layers,
  ArrowRight,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import { apiClient, getErrorMessage } from '../../api/client';

export default function MunicipalityProjectsPage() {
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Delayed' | 'Completed'>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [delayedProjects, setDelayedProjects] = useState<any[]>([]);
  const [implementationStatus, setImplementationStatus] = useState<any[]>([]);

  // Selected Project Details Modal
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<any | null>(null);
  const [milestoneFeedback, setMilestoneFeedback] = useState('');
  const [markVerified, setMarkVerified] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const loadProjectData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/municipality/projects?status=${activeTab}`);
      if (res.data.success) {
        setProjects(res.data.data.projects || []);
        setDelayedProjects(res.data.data.delayedProjects || []);
        setImplementationStatus(res.data.data.implementationStatus || []);
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [activeTab]);

  const lifecycleStages = [
    'Challenge Verified',
    'University Assigned',
    'Proposal',
    'Project Approved',
    'Team Formation',
    'Prototype',
    'Testing',
    'Field Deployment',
    'Municipal Review',
    'Resolved / Completed',
  ];

  const handleOpenProjectDetails = (prj: any) => {
    setSelectedProject(prj);
    setSelectedMilestone(null);
    setMilestoneFeedback('');
    setFeedbackSuccess(null);
  };

  const handleSaveMilestoneFeedback = async () => {
    if (!selectedProject || !selectedMilestone) return;
    setActionLoading(true);
    try {
      const res = await apiClient.post(`/municipality/projects/${selectedProject.id}/milestone-feedback`, {
        milestoneName: selectedMilestone.name,
        feedback: milestoneFeedback,
        municipalVerification: markVerified,
      });

      if (res.data.success) {
        setFeedbackSuccess('Municipal milestone observation recorded successfully');
        setSelectedProject(res.data.data);
        loadProjectData();
      }
    } catch (err: any) {
      alert(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide bg-blue-900 text-white font-mono">
              PROJECT TELEMETRY
            </span>
            <span className="text-xs text-slate-500 font-semibold">Implementation & Milestone Oversight</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Municipal Project Monitoring
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Monitor engineering milestones, track delays, and record formal municipal verifications across active prototypes.
          </p>
        </div>

        <button
          onClick={loadProjectData}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin text-blue-600' : 'text-slate-500'} />
          <span>Refresh Projects</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={loadProjectData} className="underline font-bold cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* 2. Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-px">
        {(['All', 'Active', 'Delayed', 'Completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
              activeTab === tab
                ? 'border-blue-900 text-blue-900 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            {tab} Projects
          </button>
        ))}
      </div>

      {/* 3. PROJECTS TABLE */}
      <div className="rounded-lg bg-white border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#1E3A8A] text-white font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Project ID</th>
                <th className="py-2.5 px-3">Project Name</th>
                <th className="py-2.5 px-3">Challenge</th>
                <th className="py-2.5 px-3">University</th>
                <th className="py-2.5 px-3">Industry Partner</th>
                <th className="py-2.5 px-3">Ward</th>
                <th className="py-2.5 px-3">Progress</th>
                <th className="py-2.5 px-3">Current Milestone</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500 font-medium text-xs">
                    No projects found under this filter.
                  </td>
                </tr>
              ) : (
                projects.map((item: any, idx: number) => {
                  const isCompleted = item.status === 'Completed';
                  const isDelayed = item.status === 'Delayed';

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-blue-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-950">
                        {item.projectId || item.id}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 max-w-xs truncate" title={item.name}>
                        {item.name}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-blue-900 font-semibold">
                        {item.linkedChallenge}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {item.university}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">
                        {item.industryPartner}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {item.ward}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className={`h-full ${
                                isCompleted ? 'bg-emerald-600' : isDelayed ? 'bg-amber-600' : 'bg-blue-700'
                              }`}
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold text-[10px] text-slate-700">
                            {item.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px] max-w-[160px] truncate" title={item.currentMilestone}>
                        {item.currentMilestone}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : isDelayed
                              ? 'bg-rose-100 text-rose-900 border border-rose-300'
                              : 'bg-blue-100 text-blue-900 border border-blue-300'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleOpenProjectDetails(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded transition-colors cursor-pointer shadow-2xs"
                        >
                          <Eye size={12} />
                          <span>Monitor</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. DELAY MONITORING & ISSUES SECTION */}
      <div className="rounded-lg bg-white border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-rose-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-900 font-extrabold text-sm">
            <AlertTriangle size={16} className="text-rose-600" />
            <span>Project Delays & Critical Issues Requiring Municipal Intervention</span>
          </div>
          <span className="text-[11px] font-mono text-rose-800 bg-rose-100 px-2 py-0.5 rounded font-bold">
            {delayedProjects.length} Flagged Incidents
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <th className="py-2.5 px-3">Project</th>
                <th className="py-2.5 px-3">Delayed Milestone</th>
                <th className="py-2.5 px-3">Expected Date</th>
                <th className="py-2.5 px-3">Delay Duration</th>
                <th className="py-2.5 px-3">Responsible Party</th>
                <th className="py-2.5 px-3">Issue Rationale</th>
                <th className="py-2.5 px-3 text-right">Municipal Intervention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {delayedProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500 font-medium text-xs">
                    No critical delays detected. All project milestones are operating within baseline parameters.
                  </td>
                </tr>
              ) : (
                delayedProjects.map((d: any) => (
                  <tr key={d.id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {d.project}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      {d.milestone}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {d.expectedDate}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-rose-700">
                      {d.delayDuration}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {d.responsibleParty}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px] max-w-xs truncate" title={d.issue}>
                      {d.issue}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        {d.action}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MUNICIPAL IMPLEMENTATION STATUS SECTION */}
      <div className="rounded-lg bg-white border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/80">
          <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers size={16} className="text-blue-900" />
            <span>Field Deployment & Municipal Implementation Health</span>
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Tracks real-world civic impact verification and statutory municipal clearances for deployed solutions.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#1E3A8A] text-white font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Project</th>
                <th className="py-2.5 px-3">Field Deployment Stage</th>
                <th className="py-2.5 px-3">Municipal Approval</th>
                <th className="py-2.5 px-3">Laboratory / Field Testing</th>
                <th className="py-2.5 px-3">Citizen Beneficiary Record</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {implementationStatus.map((item: any, idx: number) => (
                <tr
                  key={item.id}
                  className={`hover:bg-blue-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                >
                  <td className="py-2.5 px-3 font-bold text-slate-900 max-w-xs truncate">
                    {item.project}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-blue-950">
                    {item.fieldDeployment}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    {item.municipalApproval}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                    {item.testing}
                  </td>
                  <td className="py-2.5 px-3 text-emerald-800 font-semibold text-[11px]">
                    {item.citizenImpact}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.currentStatus === 'Completed'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : item.currentStatus === 'Delayed'
                          ? 'bg-rose-100 text-rose-900 border border-rose-300'
                          : 'bg-blue-100 text-blue-900 border border-blue-300'
                      }`}
                    >
                      {item.currentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. PROJECT DETAILS & LIFECYCLE MODAL */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 text-xs text-slate-800">
            {/* Modal Header */}
            <div className="bg-[#133054] text-white p-4 border-b border-[#224d80] flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-400 text-xs">
                    {selectedProject.projectId}
                  </span>
                  <span className="text-white font-extrabold text-sm">
                    {selectedProject.name}
                  </span>
                </div>
                <span className="text-[10px] text-blue-200 block mt-0.5">
                  Anand ULB Project Monitoring Cell • Linked to {selectedProject.linkedChallenge}
                </span>
              </div>
              <button onClick={() => setSelectedProject(null)} className="text-blue-200 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* 10-STAGE PROJECT LIFECYCLE PROGRESS BAR */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-extrabold uppercase text-slate-600 tracking-wider block">
                  Official Project Lifecycle Progress
                </span>

                <div className="overflow-x-auto pb-1">
                  <div className="flex items-center gap-1.5 min-w-[700px]">
                    {lifecycleStages.map((stage, idx) => {
                      const currentIdx = lifecycleStages.indexOf(selectedProject.lifecycleStage);
                      const isPast = idx < currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <React.Fragment key={stage}>
                          <div
                            className={`px-2 py-1 rounded text-[9px] font-bold text-center shrink-0 border transition-all ${
                              isCurrent
                                ? 'bg-blue-900 text-white border-blue-900 ring-2 ring-blue-300 shadow-xs'
                                : isPast
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                : 'bg-slate-200 text-slate-600 border-slate-300'
                            }`}
                          >
                            <span>{stage}</span>
                          </div>
                          {idx < lifecycleStages.length - 1 && (
                            <ArrowRight size={10} className="text-slate-400 shrink-0" />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* PROJECT OVERVIEW */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">University HEI</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedProject.university}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Faculty Mentor</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedProject.facultyMentor}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Student Lead</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedProject.studentLead || 'N/A'}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Industry Partner</span>
                  <p className="font-bold text-blue-950 mt-0.5">{selectedProject.industryPartner}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Municipal Dept & Ward</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedProject.municipalityDepartment} • {selectedProject.ward}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Overall Progress</span>
                  <p className="font-mono font-bold text-blue-900 text-sm mt-0.5">{selectedProject.progress}% Completed</p>
                </div>
              </div>

              {/* MILESTONE MONITORING TABLE */}
              <div className="space-y-2">
                <span className="text-[11px] font-extrabold uppercase text-blue-950 tracking-wider block">
                  Milestone Monitoring & Municipal Clearances
                </span>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-2 px-3">Milestone</th>
                        <th className="py-2 px-3">Due Date</th>
                        <th className="py-2 px-3">Progress</th>
                        <th className="py-2 px-3">Responsible</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedProject.milestones?.map((m: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-semibold text-slate-900">{m.name}</td>
                          <td className="py-2 px-3 font-mono text-slate-600">{m.dueDate}</td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-800">{m.progress}%</td>
                          <td className="py-2 px-3 text-slate-700">{m.responsible}</td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase ${
                                m.status === 'Completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : m.status === 'Delayed'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {m.status}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedMilestone(m);
                                setMilestoneFeedback(m.municipalFeedback || '');
                                setMarkVerified(Boolean(m.municipalVerified));
                                setFeedbackSuccess(null);
                              }}
                              className="px-2 py-0.5 text-[11px] font-bold text-blue-900 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 cursor-pointer"
                            >
                              Feedback
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MILESTONE FEEDBACK FORM */}
              {selectedMilestone && (
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between text-blue-950 font-bold">
                    <span>Municipal Review: {selectedMilestone.name}</span>
                    <button onClick={() => setSelectedMilestone(null)} className="text-slate-400 hover:text-slate-600">
                      <X size={14} />
                    </button>
                  </div>

                  {feedbackSuccess && (
                    <div className="p-2 rounded bg-emerald-100 text-emerald-900 font-bold text-[11px]">
                      {feedbackSuccess}
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                      Municipal Feedback / Inspection Directives
                    </label>
                    <textarea
                      rows={2}
                      value={milestoneFeedback}
                      onChange={(e) => setMilestoneFeedback(e.target.value)}
                      placeholder="Add formal municipal observation on field readiness..."
                      className="w-full p-2 border border-slate-300 rounded text-xs bg-white text-slate-800"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-[11px]">
                      <input
                        type="checkbox"
                        checked={markVerified}
                        onChange={(e) => setMarkVerified(e.target.checked)}
                        className="rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                      />
                      <span>Mark Formal Municipal Verification Passed</span>
                    </label>

                    <button
                      onClick={handleSaveMilestoneFeedback}
                      disabled={actionLoading}
                      className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded shadow-2xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Send size={12} />
                      <span>Save Municipal Review</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-1.5 bg-white border border-slate-300 font-bold text-xs rounded hover:bg-slate-50 cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
