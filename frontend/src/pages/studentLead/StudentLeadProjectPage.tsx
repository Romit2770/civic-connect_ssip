import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  Lock,
  Edit3,
  Save,
  CheckCircle2,
  AlertCircle,
  Building,
  Calendar,
  Layers,
  Cpu,
  Globe,
  FileText,
  Activity,
  UserCheck,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export default function StudentLeadProjectPage() {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Student Editable Form State
  const [gitRepositoryUrl, setGitRepositoryUrl] = useState('');
  const [labStationWorkstation, setLabStationWorkstation] = useState('');
  const [studentTechnicalNotes, setStudentTechnicalNotes] = useState('');
  const [hardwareBOMUpdates, setHardwareBOMUpdates] = useState('');
  const [weeklyMeetingSchedule, setWeeklyMeetingSchedule] = useState('');
  const [riskMitigationActions, setRiskMitigationActions] = useState('');

  useEffect(() => {
    fetchProject();
  }, []);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/student-lead/project');
      if (res.data.success) {
        const p = res.data.data;
        setProject(p);
        if (p.studentEditableInfo) {
          setGitRepositoryUrl(p.studentEditableInfo.gitRepositoryUrl || '');
          setLabStationWorkstation(p.studentEditableInfo.labStationWorkstation || '');
          setStudentTechnicalNotes(p.studentEditableInfo.studentTechnicalNotes || '');
          setHardwareBOMUpdates(p.studentEditableInfo.hardwareBOMUpdates || '');
          setWeeklyMeetingSchedule(p.studentEditableInfo.weeklyMeetingSchedule || '');
          setRiskMitigationActions(p.studentEditableInfo.riskMitigationActions || '');
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to load project details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStudentDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg(null);
      setErrorMsg(null);

      const res = await apiClient.patch('/student-lead/project', {
        gitRepositoryUrl,
        labStationWorkstation,
        studentTechnicalNotes,
        hardwareBOMUpdates,
        weeklyMeetingSchedule,
        riskMitigationActions,
      });

      if (res.data.success) {
        setSuccessMsg('Operational project details updated successfully.');
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to update student project parameters.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-3 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-600">Loading Project Dossier...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs">
        <p>Project details could not be found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Identifiers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold bg-blue-900 text-white px-2 py-0.5 rounded">
              PROJECT DOSSIER
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {project.projectId} • {project.challengeId}
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
            MY ASSIGNED INNOVATION PROJECT
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            Review faculty-approved parameters and maintain student execution repositories and work logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold bg-amber-100 text-amber-950 px-2.5 py-1 rounded-lg border border-amber-300">
            Current Stage: {project.currentStage}
          </span>
          <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-300">
            Progress: {project.progress}%
          </span>
        </div>
      </div>

      {/* Alert Notices */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-300 text-red-900 rounded-lg text-xs flex items-center gap-2 font-medium">
          <AlertCircle size={16} className="text-red-700 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. SECTION 1: INSTITUTIONAL & FACULTY-APPROVED PARAMETERS (READ ONLY) */}
      <div className="gov-card p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-blue-900" />
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Faculty-Approved Project Parameters
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-300 text-slate-700 font-mono text-[10px] font-bold">
            <Lock size={12} className="text-slate-500" />
            <span>READ ONLY • INSTITUTIONALLY CONTROLLED</span>
          </span>
        </div>

        <div className="space-y-4 text-xs">
          {/* Project Title */}
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
              Project Title & Theme
            </span>
            <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200 font-extrabold text-slate-900 text-sm">
              {project.title}
            </div>
          </div>

          {/* Core Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Domain</span>
              <span className="font-bold text-slate-900">{project.domain}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Geographic Location</span>
              <span className="font-bold text-slate-900">{project.location}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Budget Allocation</span>
              <span className="font-mono font-bold text-slate-900">{project.budget}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Statutory Timeline</span>
              <span className="font-bold text-slate-900">{project.timeline}</span>
            </div>
          </div>

          {/* Mentors Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-blue-900 uppercase block">
                Faculty Mentor (Academic Authority)
              </span>
              <div className="font-bold text-slate-900 text-sm">{project.facultyMentor}</div>
              <div className="text-slate-600 text-[11px]">{project.facultyMentorDept} • {project.facultyMentorInst}</div>
              <div className="text-slate-500 font-mono text-[10px]">{project.facultyMentorEmail}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-amber-900 uppercase block">
                Industry Partner (Testing & Co-Sponsor)
              </span>
              <div className="font-bold text-slate-900 text-sm">{project.industryPartner}</div>
              <div className="text-slate-600 text-[11px]">{project.industryLead}</div>
              <div className="text-slate-500 font-mono text-[10px]">{project.industryContactEmail}</div>
            </div>
          </div>

          {/* Problem Statement */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">
              1. Verified Civic Problem Statement
            </span>
            <div className="p-3.5 bg-slate-50/80 rounded-lg border border-slate-200 text-slate-800 leading-relaxed font-normal">
              {project.problemStatement}
            </div>
          </div>

          {/* Proposed Solution */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">
              2. Approved Technical Solution
            </span>
            <div className="p-3.5 bg-slate-50/80 rounded-lg border border-slate-200 text-slate-800 leading-relaxed font-normal">
              {project.proposedSolution}
            </div>
          </div>

          {/* Technology Stack & Outcomes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">
                3. Prescribed Technology Stack
              </span>
              <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200 text-slate-800 font-mono text-[11px] leading-relaxed">
                {project.technologyStack}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">
                4. Mandatory Expected Outcomes
              </span>
              <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200 text-slate-800 leading-relaxed">
                {project.expectedOutcomes}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECTION 2: STUDENT LEAD OPERATIONAL MANAGEMENT (EDITABLE) */}
      <form onSubmit={handleSaveStudentDetails} className="gov-card p-6 bg-white border-2 border-blue-200 rounded-xl shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-blue-100">
          <div className="flex items-center gap-2">
            <Edit3 size={18} className="text-amber-600" />
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Student Lead Operational Management
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-300 text-amber-900 font-mono text-[10px] font-bold">
            <span>EDITABLE BY STUDENT LEAD</span>
          </span>
        </div>

        <p className="text-xs text-slate-500 font-medium">
          As Student Lead, maintain your code repository links, laboratory workstation stationing, weekly work schedules, and physical BOM component tracking.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Git Repo URL */}
          <div className="space-y-1 sm:col-span-2">
            <label className="block font-bold text-slate-700">
              Project Git Source Code Repository URL
            </label>
            <input
              type="url"
              value={gitRepositoryUrl}
              onChange={(e) => setGitRepositoryUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none bg-white"
            />
          </div>

          {/* Workstation Location */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">
              Assigned Campus Lab & Workstation
            </label>
            <input
              type="text"
              value={labStationWorkstation}
              onChange={(e) => setLabStationWorkstation(e.target.value)}
              placeholder="e.g. Embedded Systems Lab 3, Workstation E-14"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none bg-white"
            />
          </div>

          {/* Weekly Meeting Schedule */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">
              Weekly Team & Mentor Meeting Schedule
            </label>
            <input
              type="text"
              value={weeklyMeetingSchedule}
              onChange={(e) => setWeeklyMeetingSchedule(e.target.value)}
              placeholder="e.g. Tuesdays 16:30 IST with Prof. Sen"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none bg-white"
            />
          </div>

          {/* Student Technical Notes */}
          <div className="space-y-1 sm:col-span-2">
            <label className="block font-bold text-slate-700">
              Current Sprint Technical Notes & Observations
            </label>
            <textarea
              rows={3}
              value={studentTechnicalNotes}
              onChange={(e) => setStudentTechnicalNotes(e.target.value)}
              placeholder="Record edge filter tuning, signal attenuation, packet loss metrics..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none bg-white"
            />
          </div>

          {/* Hardware BOM Updates */}
          <div className="space-y-1 sm:col-span-2">
            <label className="block font-bold text-slate-700">
              Hardware Component Inventory & BOM Procurement Status
            </label>
            <textarea
              rows={2}
              value={hardwareBOMUpdates}
              onChange={(e) => setHardwareBOMUpdates(e.target.value)}
              placeholder="Note component batch status, solar panel testing, casing supplies..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none bg-white"
            />
          </div>

          {/* Risk Mitigation */}
          <div className="space-y-1 sm:col-span-2">
            <label className="block font-bold text-slate-700">
              Field Execution Risks & Team Mitigation Measures
            </label>
            <input
              type="text"
              value={riskMitigationActions}
              onChange={(e) => setRiskMitigationActions(e.target.value)}
              placeholder="e.g. Rainproofing tests conducted; thermal cut-off calibrated..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none bg-white"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            Saved changes reflect immediately in the student project dossier.
          </span>
          <button
            type="submit"
            disabled={saving}
            className="gov-button-primary text-xs px-4 h-9 font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save size={14} />
            <span>{saving ? 'Saving Updates...' : 'Save Operational Updates'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
