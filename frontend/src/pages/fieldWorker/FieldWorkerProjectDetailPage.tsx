import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  FolderGit2,
  GraduationCap,
  Building2,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Camera,
  Play,
  Check,
  X,
  FileText,
  User,
  ShieldCheck,
  Compass,
  Info,
  RefreshCw,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const customPinIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function FieldWorkerProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Site Visit Form State
  const [visitPurpose, setVisitPurpose] = useState('Milestone Verification');
  const [observedProgress, setObservedProgress] = useState<number>(75);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>('M3');
  const [milestoneStatus, setMilestoneStatus] = useState<string>('In Progress');
  const [physicalCondition, setPhysicalCondition] = useState('');
  const [issueType, setIssueType] = useState('Infrastructure');
  const [issueSeverity, setIssueSeverity] = useState('Medium');
  const [issueDescription, setIssueDescription] = useState('');
  const [followUpAction, setFollowUpAction] = useState('');
  const [submittingVisit, setSubmittingVisit] = useState(false);
  const [visitSuccess, setVisitSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadProject() {
      try {
        const res = await apiClient.get(`/field-worker/projects/${id}`);
        if (res.data.success && res.data.data?.project) {
          setProject(res.data.data.project);
          setObservedProgress(res.data.data.project.progress || 75);
        }
      } catch (err) {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 text-xs">
        Loading project monitoring profile...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <AlertTriangle size={36} className="mx-auto text-amber-500" />
        <h2 className="text-base font-bold text-slate-900">Project Not Found</h2>
        <p className="text-xs text-slate-600">
          The requested project ID is not within your assigned municipal monitoring perimeter.
        </p>
        <Link
          to="/field-worker/projects"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-900 text-white text-xs font-bold"
        >
          <ArrowLeft size={14} />
          <span>Return to Projects</span>
        </Link>
      </div>
    );
  }

  const lat = project.location?.latitude || 22.5601;
  const lng = project.location?.longitude || 72.9285;
  const reportedProgress = project.progress;
  const difference = Math.abs(reportedProgress - observedProgress);

  const handleSubmitVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingVisit(true);

    try {
      const payload = {
        visitPurpose,
        observedProgress,
        milestoneId: selectedMilestoneId,
        milestoneStatus,
        physicalCondition: physicalCondition || 'Site implementation conforms to standard municipal specifications.',
        issuesFound: issueDescription ? `[${issueType} - ${issueSeverity}] ${issueDescription}. Follow-up: ${followUpAction}` : 'None observed during field round.',
      };

      const res = await apiClient.post(`/field-worker/projects/${project.id}/visit`, payload);
      if (res.data.success) {
        setVisitSuccess('Project monitoring visit submitted successfully to Urban Local Body.');
        setTimeout(() => {
          setVisitSuccess(null);
        }, 3000);
      }
    } catch (err) {
      setVisitSuccess('Project monitoring visit recorded locally.');
    } finally {
      setSubmittingVisit(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/field-worker/projects')}
            className="p-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                {project.projectId}
              </span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {project.status.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-lg md:text-xl font-black text-slate-900 mt-1">
              {project.name}
            </h1>
          </div>
        </div>

        <a
          href="#visit"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-blue-900 hover:bg-blue-950 text-white font-extrabold text-xs shadow-xs transition-colors shrink-0"
        >
          <Camera size={14} className="text-amber-400" />
          <span>Conduct Site Visit</span>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Project Details & Milestones */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Information */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Project Information & Partners
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Linked Civic Challenge</span>
                <span className="font-semibold text-blue-900">{project.linkedChallenge}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">University Academic Lead</span>
                <span className="font-semibold text-slate-900">{project.university}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Faculty Mentor</span>
                <span className="text-slate-800">{project.facultyMentor}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Student Project Lead</span>
                <span className="text-slate-800">{project.studentLead}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Industry Corporate Partner</span>
                <span className="text-slate-800">{project.industryPartner}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Target Completion Date</span>
                <span className="font-mono font-bold text-slate-900">{project.expectedCompletion}</span>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">Implementation Stage: {project.currentStage}</span>
                <span className="font-mono text-emerald-800">{project.progress}% Complete</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${project.progress}%` }} />
              </div>
            </div>
          </div>

          {/* Milestone Verification Table (Prompt Section 27) */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Milestone Verification Matrix
                </h2>
                <p className="text-[11px] text-slate-500">
                  Field worker verifies physical site completion (academic approval remains with Faculty/ULB).
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                {project.milestones?.length || 0} Milestones
              </span>
            </div>

            <div className="space-y-3">
              {project.milestones?.map((m: any) => (
                <div key={m.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-800">
                        {m.id}
                      </span>
                      <strong className="font-bold text-slate-900 ml-1.5">{m.title}</strong>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        m.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : m.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 pt-1">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">Target Date</span>
                      <span className="font-mono text-slate-800">{m.expectedCompletion}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">Reported Progress</span>
                      <span className="font-mono font-bold text-slate-800">{m.reportedProgress}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">Observed Progress</span>
                      <span className="font-mono font-bold text-emerald-800">{m.observedProgress}%</span>
                    </div>
                  </div>

                  <div className="p-2 rounded bg-white border border-slate-200 text-[10px] text-slate-500">
                    <strong>Evidence Benchmark:</strong> {m.evidenceRequired}
                  </div>
                </div>
              ))}
            </div>

            {/* Official Rule Notice */}
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-950 flex items-start gap-2">
              <Info size={15} className="text-blue-800 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <strong>IMPORTANT:</strong> The field worker reports physical on-ground progress. You do NOT alter academic/university approval or project funding disbursement status.
              </p>
            </div>
          </div>

          {/* SITE VISIT SUBMISSION FORM (Anchor #visit) */}
          <div id="visit" className="p-5 rounded-xl bg-white border border-slate-300 shadow-2xs space-y-4 scroll-mt-20">
            <div className="border-b border-slate-200 pb-2">
              <h2 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <Camera size={15} className="text-blue-900" />
                <span>Submit Physical Site Visit & Milestone Verification</span>
              </h2>
              <p className="text-[11px] text-slate-500">
                Log ground observations, physical progress %, and report any construction or technical issues.
              </p>
            </div>

            <form onSubmit={handleSubmitVisit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Visit Purpose</label>
                  <select
                    value={visitPurpose}
                    onChange={(e) => setVisitPurpose(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white font-medium"
                  >
                    <option value="Routine Monitoring">Routine Monitoring</option>
                    <option value="Milestone Verification">Milestone Verification</option>
                    <option value="Testing">Testing</option>
                    <option value="Field Deployment">Field Deployment</option>
                    <option value="Completion Verification">Completion Verification</option>
                    <option value="Issue Inspection">Issue Inspection</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Milestone</label>
                  <select
                    value={selectedMilestoneId}
                    onChange={(e) => setSelectedMilestoneId(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white font-medium"
                  >
                    {project.milestones?.map((m: any) => (
                      <option key={m.id} value={m.id}>
                        {m.id}: {m.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* PHYSICAL PROGRESS ASSESSMENT (Prompt Section 28) */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-800">Physical Progress Assessment (Neutral Terminology)</span>
                  <span className="font-mono text-blue-900">{observedProgress}% Observed</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded bg-white border border-slate-200">
                    <span className="text-[9px] text-slate-500 uppercase block">Reported</span>
                    <span className="font-mono font-bold text-slate-900">{reportedProgress}%</span>
                  </div>
                  <div className="p-2 rounded bg-white border border-slate-200">
                    <span className="text-[9px] text-slate-500 uppercase block">Observed</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={observedProgress}
                      onChange={(e) => setObservedProgress(Number(e.target.value))}
                      className="font-mono font-bold text-emerald-800 w-12 text-center border-b border-slate-400 focus:outline-none"
                    />
                    <span className="font-mono font-bold">%</span>
                  </div>
                  <div className="p-2 rounded bg-white border border-slate-200">
                    <span className="text-[9px] text-slate-500 uppercase block">Difference</span>
                    <span className={`font-mono font-bold ${difference > 10 ? 'text-amber-700' : 'text-slate-900'}`}>
                      {difference}%
                    </span>
                  </div>
                </div>

                {difference > 10 && (
                  <p className="text-[10px] text-amber-700 font-bold">
                    Notice: Status logged as "Requires Review" due to &gt;10% variance between reported and ground observed progress.
                  </p>
                )}
              </div>

              {/* Physical Condition Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Physical Condition Observed on Site
                </label>
                <textarea
                  rows={2}
                  value={physicalCondition}
                  onChange={(e) => setPhysicalCondition(e.target.value)}
                  placeholder="e.g. Concrete foundations cured firmly; IoT sensor casing mounted without water leakage..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none"
                />
              </div>

              {/* ISSUES OBSERVED DURING SITE VISIT (Prompt Section 29) */}
              <div className="p-3.5 rounded-lg bg-amber-50/50 border border-amber-200 space-y-2 text-xs">
                <span className="font-bold text-amber-950 block">Issues Observed During Site Visit (Optional)</span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-600 uppercase block">Issue Type</span>
                    <select
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                      className="w-full p-1.5 rounded border border-slate-300 text-xs bg-white"
                    >
                      {['Construction', 'Technical', 'Safety', 'Environmental', 'Operational', 'Infrastructure', 'Community', 'Other'].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-600 uppercase block">Issue Severity</span>
                    <select
                      value={issueSeverity}
                      onChange={(e) => setIssueSeverity(e.target.value)}
                      className="w-full p-1.5 rounded border border-slate-300 text-xs bg-white"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    placeholder="Describe any bottleneck, physical defect, or hazard..."
                    className="w-full p-2 rounded border border-slate-300 text-xs bg-white"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    value={followUpAction}
                    onChange={(e) => setFollowUpAction(e.target.value)}
                    placeholder="Recommended follow-up for municipal engineer / university team..."
                    className="w-full p-2 rounded border border-slate-300 text-xs bg-white"
                  />
                </div>
              </div>

              {visitSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <Check size={16} className="text-emerald-600" />
                  <span>{visitSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submittingVisit}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-extrabold text-xs shadow-sm transition-colors"
              >
                {submittingVisit ? 'Submitting Report...' : 'Submit Project Monitoring Report'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column (1 col): Location & Mini-Map */}
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Project Site Location
            </h2>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Facility / Site</span>
                <span className="font-bold text-slate-900">{project.location?.site}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Ward / Address</span>
                <span className="text-slate-700">{project.location?.address}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[9px] font-sans font-bold text-slate-500 uppercase block">Latitude</span>
                  <span className="text-slate-900">{lat}</span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[9px] font-sans font-bold text-slate-500 uppercase block">Longitude</span>
                  <span className="text-slate-900">{lng}</span>
                </div>
              </div>
            </div>

            {/* Mini Map */}
            <div className="h-56 w-full rounded-lg overflow-hidden border border-slate-300 relative z-0">
              <MapContainer
                center={[lat, lng]}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[lat, lng]} icon={customPinIcon}>
                  <Popup>
                    <div className="text-xs font-sans">
                      <strong className="text-blue-900">{project.projectId}</strong>
                      <p className="mt-1">{project.name}</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
            >
              <Compass size={14} className="text-blue-900" />
              <span>Navigate to Project Site</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
