import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Target,
  Users,
  Award,
  Calendar,
  Layers,
  FileText,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export default function UniversityProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStage, setFilterStage] = useState('All');
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/university/projects');
      if (res.data.success) {
        setProjects(res.data.data);
      }
    } catch (err) {
      console.warn('Fallback projects loaded');
    } finally {
      setLoading(false);
    }
  };

  const STAGES = [
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

  const filtered = projects.filter((p) => {
    if (filterStage === 'All') return true;
    return p.stage === filterStage;
  });

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#133054] text-amber-400 flex items-center justify-center font-bold shadow-xs shrink-0">
            <FolderGit2 size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Innovation Project Management
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Track multi-stage engineering execution from Challenge Acceptance to Field Pilot Deployment.
            </p>
          </div>
        </div>

        <button
          onClick={() => loadProjects()}
          className="p-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-xs cursor-pointer"
          title="Refresh Projects"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Stage Flow Bar */}
      <div className="gov-card bg-white p-3 rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-[780px] text-xs">
          <button
            onClick={() => setFilterStage('All')}
            className={`px-3 py-1.5 rounded-md font-bold whitespace-nowrap ${
              filterStage === 'All' ? 'bg-[#133054] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Projects ({projects.length})
          </button>
          {STAGES.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStage(s)}
              className={`px-2.5 py-1.5 rounded-md font-medium text-[11px] whitespace-nowrap ${
                filterStage === s ? 'bg-blue-700 text-white font-bold' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {filtered.map((proj) => (
          <div key={proj.id} className="gov-card bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[11px] bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded">
                  {proj.id}
                </span>
                <span className="text-xs font-bold text-slate-500 font-mono">
                  Linked: {proj.challengeId}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Stage: {proj.stage}
                </span>
              </div>

              {proj.grantAmount && (
                <span className="text-xs font-mono font-bold text-slate-700">
                  Disbursed Grant: <strong className="text-emerald-700">{proj.grantAmount}</strong>
                </span>
              )}
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">{proj.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Domain: {proj.domain}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">Faculty Mentor:</span>
                <span className="font-semibold text-slate-800">{proj.facultyMentor}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Assigned Student Team:</span>
                <span className="font-semibold text-slate-800">{proj.studentTeam}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Overall Execution Progress:</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-900 h-full rounded-full" style={{ width: `${proj.progress}%` }}></div>
                  </div>
                  <span className="font-mono font-bold text-slate-700">{proj.progress}%</span>
                </div>
              </div>
            </div>

            {/* Milestones Timeline */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-900 block mb-2">
                Project Milestone Roadmap:
              </span>
              <div className="space-y-1.5">
                {proj.milestones?.map((m: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 rounded bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${m.status === 'Completed' ? 'bg-emerald-500' : m.status === 'In Progress' ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`} />
                      <span className="font-medium text-slate-800">{m.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-500 font-mono">Due: {m.deadline}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${m.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : m.status === 'In Progress' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'}`}>
                        {m.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
