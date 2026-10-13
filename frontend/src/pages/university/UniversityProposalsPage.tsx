import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  Send,
  X,
  Target,
  Users,
  Building,
  RefreshCw,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export default function UniversityProposalsPage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Form states
  const [challengeId, setChallengeId] = useState('CH-2026-145');
  const [challengeTitle, setChallengeTitle] = useState('Decentralized Micro-Composting Digesters');
  const [proposedSolution, setProposedSolution] = useState('');
  const [objectives, setObjectives] = useState('');
  const [techStack, setTechStack] = useState('');
  const [facultyMentor, setFacultyMentor] = useState('Dr. Sunita Murmu');
  const [studentTeam, setStudentTeam] = useState('EnviroTech (BioTech + Chemical)');
  const [estimatedCost, setEstimatedCost] = useState('₹ 3,20,000');
  const [timeline, setTimeline] = useState('6 Months');
  const [industrySupport, setIndustrySupport] = useState('Jindal Steel & Power CSR Wing');

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/university/proposals');
      if (res.data.success) {
        setProposals(res.data.data);
      }
    } catch (err) {
      console.warn('Fallback proposals loaded');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/university/proposals', {
        challengeId,
        challengeTitle,
        proposedSolution,
        objectives,
        techStack,
        facultyMentor,
        studentTeam,
        estimatedCost,
        timeline,
        industrySupport,
      });
      if (res.data.success) {
        setActionSuccess('Solution proposal submitted to Municipal Innovation Review Panel.');
        setCreateModalOpen(false);
        setProposedSolution('');
        setObjectives('');
        setTechStack('');
        loadProposals();
      }
    } catch (err: any) {
      alert('Failed to submit proposal');
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#133054] text-amber-400 flex items-center justify-center font-bold shadow-xs shrink-0">
            <FileText size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Solution Proposals Repository
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Draft, submit and manage technical solution proposals for routed municipal challenges.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadProposals()}
            className="p-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-xs cursor-pointer"
            title="Refresh Proposals"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="gov-button-primary text-xs py-2 px-4 shadow-sm"
          >
            <Plus size={15} />
            <span>Create Solution Proposal</span>
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

      {/* Proposals List */}
      <div className="space-y-4">
        {proposals.map((prop) => (
          <div key={prop.id} className="gov-card bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs bg-slate-100 text-blue-900 px-2 py-0.5 rounded border border-slate-200">
                  {prop.id}
                </span>
                <span className="text-xs font-semibold text-slate-500 font-mono">
                  Challenge: {prop.challengeId}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    prop.status === 'Approved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {prop.status}
                </span>
              </div>
              <span className="text-xs text-slate-500">Submitted: {prop.submittedAt}</span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">{prop.proposedSolution}</h3>
              <p className="text-xs text-slate-600 mt-1">
                <strong>Objectives: </strong>
                {prop.objectives}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Technology Stack:</span>
                <span className="font-mono font-semibold text-slate-800">{prop.techStack}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Academic Mentorship:</span>
                <span className="font-semibold text-slate-800">{prop.facultyMentor}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Estimated Budget:</span>
                <span className="font-mono font-bold text-emerald-700">{prop.estimatedCost}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Execution Timeline:</span>
                <span className="font-semibold text-slate-800">{prop.timeline}</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 pt-1">
              <span className="font-semibold text-slate-800">Industry Partnership: </span>
              {prop.industrySupport}
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create Solution Proposal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 bg-[#133054] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={17} className="text-amber-300" />
                <h3 className="font-extrabold text-sm text-white">Draft Solution Proposal</h3>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="p-1 rounded-lg text-slate-300 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitProposal} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Societal Challenge</label>
                <input
                  type="text"
                  required
                  value={challengeTitle}
                  onChange={(e) => setChallengeTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Proposed Solution Name *</label>
                <input
                  type="text"
                  required
                  value={proposedSolution}
                  onChange={(e) => setProposedSolution(e.target.value)}
                  placeholder="e.g. AI-Assisted Sensor Node Telemetry Network"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Specific Measurable Objectives *</label>
                <textarea
                  rows={2}
                  required
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  placeholder="What will this system achieve in the municipal ward?"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Technology & Architecture Stack *</label>
                <input
                  type="text"
                  required
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  placeholder="e.g. LoRaWAN, ESP32, Python, TensorFlow, PostGIS"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Faculty Mentor</label>
                  <input
                    type="text"
                    value={facultyMentor}
                    onChange={(e) => setFacultyMentor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Student Team</label>
                  <input
                    type="text"
                    value={studentTeam}
                    onChange={(e) => setStudentTeam(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimated Budget</label>
                  <input
                    type="text"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Execution Timeline</label>
                  <input
                    type="text"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Industry Partner / Support Needed</label>
                <input
                  type="text"
                  value={industrySupport}
                  onChange={(e) => setIndustrySupport(e.target.value)}
                  placeholder="e.g. Tata Steel / L&T Smart World"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="gov-button-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gov-button-primary text-xs py-2 px-4"
                >
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
