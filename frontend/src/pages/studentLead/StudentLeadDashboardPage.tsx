import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderGit2,
  Users,
  CheckSquare,
  Clock,
  Target,
  FileText,
  Activity,
  ArrowRight,
  Building,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Send,
  Sparkles,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import KPIStatCard from '../../components/common/KPIStatCard';

export default function StudentLeadDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/student-lead/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load dashboard telemetry.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-3 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-600">Loading Student Lead Project Console...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs">
        <div className="flex items-center gap-2 font-bold mb-1">
          <AlertCircle size={16} />
          <span>Error Loading Dashboard</span>
        </div>
        <p>{error || 'Unable to retrieve project telemetry.'}</p>
        <button
          onClick={fetchDashboard}
          className="mt-3 px-3 py-1.5 bg-red-800 text-white rounded font-bold hover:bg-red-900 cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  const { stats, activeProject, progressBreakdown, upcomingDeadlines, recentTeamActivity } = data;

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold bg-blue-900 text-white px-2 py-0.5 rounded">
              SIH-2026-RNC
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              National Innovation Project
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
            STUDENT LEAD DASHBOARD
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            Monitor project execution, team activity, milestones and pending deliverables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/student-lead/tasks"
            className="gov-button-secondary text-xs h-9 px-3 flex items-center gap-1.5 font-bold"
          >
            <CheckSquare size={14} />
            <span>Manage Tasks</span>
          </Link>
          <Link
            to="/student-lead/project"
            className="gov-button-primary text-xs h-9 px-3.5 flex items-center gap-1.5 font-bold"
          >
            <span>View Full Project</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* 2. Compact Government-Style KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPIStatCard
          title="MY PROJECT"
          value={stats.myProject}
          subtitle="Assigned Challenge"
          icon={FolderGit2}
          badge="Active"
        />

        <KPIStatCard
          title="PROJECT PROGRESS"
          value={`${stats.projectProgress}%`}
          subtitle="Overall Execution"
          icon={Activity}
          badge="Field Pilot"
        />

        <KPIStatCard
          title="TEAM MEMBERS"
          value={stats.teamMembers}
          subtitle="Smart Water Guild"
          icon={Users}
        />

        <KPIStatCard
          title="TASKS"
          value={stats.tasks}
          subtitle="12 Completed"
          icon={CheckSquare}
        />

        <KPIStatCard
          title="PENDING TASKS"
          value={stats.pendingTasks}
          subtitle="4 In Progress"
          icon={Clock}
          badge="Sprint Cycle"
        />

        <KPIStatCard
          title="MILESTONES"
          value={stats.milestones}
          subtitle="5 Completed / 8"
          icon={Target}
          badge="MLS-03 Review"
        />
      </div>

      {/* 3. Project Overview Section */}
      <div className="gov-card p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 flex items-center justify-center font-bold">
              <FolderGit2 size={18} />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase">
                MY ACTIVE PROJECT
              </h2>
              <span className="text-[11px] font-mono text-slate-500 font-semibold">
                {activeProject.projectId} • Challenge ID: {activeProject.challengeId}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold bg-amber-100 text-amber-950 px-2 py-0.5 rounded border border-amber-300">
              Stage: {activeProject.currentStage}
            </span>
            <span className="text-[11px] font-mono font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300">
              Progress: {activeProject.progress}%
            </span>
          </div>
        </div>

        {/* Project Title & Core Attributes Grid */}
        <div className="space-y-3">
          <h3 className="text-base font-extrabold text-slate-900 leading-snug">
            {activeProject.title}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Domain</span>
              <span className="font-bold text-slate-900">{activeProject.domain}</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Location</span>
              <span className="font-bold text-slate-900">{activeProject.location}</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Faculty Mentor</span>
              <span className="font-bold text-blue-900">{activeProject.facultyMentor}</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Industry Partner</span>
              <span className="font-bold text-slate-900">{activeProject.industryPartner}</span>
            </div>
          </div>

          {/* Problem Statement Snippet */}
          <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-xs space-y-1">
            <span className="text-[10px] font-extrabold text-blue-900 uppercase tracking-wide block">
              Validated Civic Problem Statement
            </span>
            <p className="text-slate-700 leading-relaxed">
              {activeProject.problemStatement}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Horizontal Project Lifecycle Stages */}
      <div className="gov-card p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-blue-900" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Project Execution Lifecycle
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Current Active Phase: <strong className="text-blue-900">Field Pilot (68%)</strong>
          </span>
        </div>

        {/* Clean, Non-Exaggerated Horizontal Stages */}
        <div className="overflow-x-auto pb-2">
          <div className="flex items-center justify-between min-w-[760px] gap-2 pt-2">
            {activeProject.lifecycleStages.map((st: any, idx: number) => {
              const isDone = st.status === 'Completed';
              const isCurrent = st.stage === activeProject.currentStage;

              return (
                <div key={st.stage} className="flex-1 relative flex flex-col items-center text-center">
                  {/* Step Connector Line */}
                  {idx > 0 && (
                    <div
                      className={`absolute top-3.5 -left-1/2 w-full h-[2px] -z-0 ${
                        isDone || isCurrent ? 'bg-blue-900' : 'bg-slate-200'
                      }`}
                    />
                  )}

                  {/* Node Circle */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] z-10 border-2 transition-all ${
                      isDone
                        ? 'bg-blue-900 text-white border-blue-900'
                        : isCurrent
                        ? 'bg-amber-400 text-slate-950 border-amber-500 ring-2 ring-amber-200 font-extrabold'
                        : 'bg-white text-slate-400 border-slate-300'
                    }`}
                  >
                    {isDone ? <CheckCircle2 size={14} /> : idx + 1}
                  </div>

                  {/* Stage Label & Status */}
                  <div className="mt-2 space-y-0.5 max-w-[90px]">
                    <span
                      className={`block text-[11px] font-bold leading-tight ${
                        isCurrent
                          ? 'text-blue-900 font-extrabold'
                          : isDone
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {st.stage}
                    </span>
                    <span
                      className={`block font-mono text-[9px] ${
                        isCurrent ? 'text-amber-800 font-bold' : 'text-slate-500'
                      }`}
                    >
                      {st.completion}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Dashboard Lower Section: Progress Breakdown, Deadlines & Team Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Project Progress Breakdown (5 Cols) */}
        <div className="lg:col-span-5 gov-card p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Activity size={16} className="text-blue-900" />
              <span>Project Deliverable Progress</span>
            </h3>
            <span className="font-mono text-xs font-extrabold text-blue-900">
              {progressBreakdown.overallProgress}% Overall
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Task Completion Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-slate-700">Team Tasks Completed:</span>
                <span className="font-mono font-bold text-slate-900">
                  {progressBreakdown.taskCompletionText}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-blue-900 rounded-full transition-all"
                  style={{ width: `${progressBreakdown.taskCompletionPercent}%` }}
                />
              </div>
            </div>

            {/* Milestone Completion Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-slate-700">Milestones Validated:</span>
                <span className="font-mono font-bold text-slate-900">
                  {progressBreakdown.milestoneCompletionText}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all"
                  style={{ width: `${progressBreakdown.milestoneCompletionPercent}%` }}
                />
              </div>
            </div>

            {/* Document Completion Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-slate-700">Technical Documents Uploaded:</span>
                <span className="font-mono font-bold text-slate-900">
                  {progressBreakdown.documentCompletionText}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${progressBreakdown.documentCompletionPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">Academic Cohort 2026–27</span>
            <Link
              to="/student-lead/milestones"
              className="text-blue-900 font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>View Milestone Matrix</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Right Column: Upcoming Deadlines (7 Cols) */}
        <div className="lg:col-span-7 gov-card p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Clock size={16} className="text-amber-700" />
              <span>Upcoming Project Deadlines</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-500">Scheduled Sprint Review</span>
          </div>

          <div className="space-y-2 text-xs">
            {upcomingDeadlines.map((dl: any) => (
              <div
                key={dl.title}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      dl.priority === 'critical'
                        ? 'bg-rose-600'
                        : dl.priority === 'high'
                        ? 'bg-amber-500'
                        : 'bg-blue-600'
                    }`}
                  />
                  <div className="truncate">
                    <span className="font-bold text-slate-900 block truncate">{dl.title}</span>
                    <span className="text-[11px] text-slate-500">
                      Assigned: {dl.assignee} • {dl.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {dl.dueDate}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">Strict SLA adherence required</span>
            <Link
              to="/student-lead/tasks"
              className="text-blue-900 font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>View All 18 Tasks</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* 6. Recent Team Activity Feed */}
      <div className="gov-card p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-blue-900" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Recent Team Execution Activity
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">Smart Water Guild</span>
        </div>

        <div className="space-y-2 text-xs">
          {recentTeamActivity.map((act: any, idx: number) => (
            <div
              key={idx}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50/80 border border-slate-200/70"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-900 shrink-0" />
                <span className="text-slate-800">
                  <strong className="text-blue-950 font-bold">{act.studentName}</strong> {act.action}
                </span>
              </div>
              <span className="font-mono text-[11px] text-slate-500 shrink-0">{act.timeAgo}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
