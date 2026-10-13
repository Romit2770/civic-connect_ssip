import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  RefreshCw,
  Handshake,
  FolderGit2,
  Clock,
  GraduationCap,
  FileText,
  CheckCircle2,
  Building2,
  ChevronRight,
  User,
  ShieldCheck,
  Video,
  X,
  Eye,
  Check,
  Calendar,
  Layers,
  Target,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import KPIStatCard from '../../components/common/KPIStatCard';

export default function CorporatePartnerDashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/corporate-partner/dashboard');
      if (res.data?.success) {
        setDashboardData(res.data.data);
      }
    } catch (err) {
      console.warn('Using local fallback for Corporate Partner Dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRespond = async (id: string, action: 'Accept' | 'Decline') => {
    try {
      const res = await apiClient.post(`/corporate-partner/collaborations/${id}/respond`, { action });
      if (res.data?.success) {
        setActionSuccess(`Collaboration request marked as ${action === 'Accept' ? 'Active' : 'Declined'}.`);
        fetchDashboard();
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err) {
      console.error('Error responding to request:', err);
    }
  };

  const summary = dashboardData?.summaryCards || {
    myCollaborations: 4,
    activeProjects: 2,
    pendingRequests: 3,
    mentorshipSessions: 8,
    deliverables: 12,
  };

  const activeProjects = dashboardData?.activeProjects || [
    {
      projectId: 'PRJ-CSR-2026-001',
      projectTitle: 'Smart Water Monitoring & Leakage Detection System',
      university: 'NIT Jamshedpur',
      facultyMentor: 'Prof. Ananya Sen',
      studentLead: 'Rahul Patel',
      domain: 'Water & Sanitation',
      partnerRole: 'Technical Mentor & IoT Architect',
      progress: 72,
      nextMilestone: 'Sensor Testing & Subterranean Validation (15 Oct 2026)',
      status: 'Active',
    },
    {
      projectId: 'PRJ-CSR-2026-004',
      projectTitle: 'Solar-Powered LED Smart Streetlighting with Dynamic Dimming',
      university: 'IIT (ISM) Dhanbad',
      facultyMentor: 'Dr. P. K. Sinha',
      studentLead: 'Sneha Kumari',
      domain: 'Urban Energy & Solar',
      partnerRole: 'Industry Reviewer & Power Electronics Advisor',
      progress: 45,
      nextMilestone: 'Lux Measurement & Grid-Tie Synchronization (18 Oct 2026)',
      status: 'Active',
    },
  ];

  const pendingRequests = dashboardData?.pendingRequests || [
    {
      id: 'COL-2026-004',
      university: 'IIT (ISM) Dhanbad',
      project: 'IoT Vibration & Structural Telemetry for Footbridges',
      challengeId: 'CH-2026-302',
      requestedSupport: 'API & Infrastructure Support',
      requestedDate: '22 Sep 2026',
      status: 'Pending',
    },
    {
      id: 'COL-2026-005',
      university: 'NIT Jamshedpur',
      project: 'Hyperlocal Air Quality Telemetry Network',
      challengeId: 'CH-2026-221',
      requestedSupport: 'Sensor Enclosures & Testing Skids',
      requestedDate: '20 Sep 2026',
      status: 'Pending',
    },
    {
      id: 'COL-2026-006',
      university: 'BIT Mesra',
      project: 'Decentralized Micro-Composting Digesters',
      challengeId: 'CH-2026-118',
      requestedSupport: 'Hardware Prototyping Review',
      requestedDate: '18 Sep 2026',
      status: 'Pending',
    },
  ];

  const upcomingMentorship = dashboardData?.upcomingMentorship || [
    {
      id: 'SES-2026-01',
      date: '26 Sep 2026',
      time: '11:00 AM',
      studentTeam: 'AquaPur Clean Energy Lab',
      university: 'NIT Jamshedpur',
      project: 'Smart Water Monitoring System',
      topic: 'Subterranean Sensor Calibration & Noise Filtering Algorithms',
      meetingType: 'Online',
      meetingLink: 'https://meet.gov.in/civicconnect-nit-water-01',
      status: 'Scheduled',
    },
    {
      id: 'SES-2026-02',
      date: '28 Sep 2026',
      time: '03:00 PM',
      studentTeam: 'Urban Grid Photovoltaics',
      university: 'IIT (ISM) Dhanbad',
      project: 'Solar Smart Streetlighting',
      topic: 'MPPT Dynamic Dimming Firmware Architecture & Doppler Tuning',
      meetingType: 'Hybrid',
      meetingLink: 'https://meet.gov.in/civicconnect-iitism-solar-02',
      status: 'Scheduled',
    },
  ];

  return (
    <div className="space-y-6 w-full">
      {/* 1. Official Government Header Banner */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
        {/* National Tricolor Government Ribbon */}
        <div className="h-1.5 w-full flex">
          <div className="h-full flex-1 bg-[#ff9933]" />
          <div className="h-full flex-1 bg-white" />
          <div className="h-full flex-1 bg-[#138808]" />
        </div>

        <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex flex-col items-center justify-center p-2 rounded-lg bg-blue-50 border border-blue-200 text-[#0a2540] shrink-0 shadow-2xs">
              <Building2 className="w-8 h-8 text-[#0a2540]" />
              <span className="text-[7.5px] font-black tracking-widest text-[#0a2540] uppercase mt-1">
                CORPORATE
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold text-[#0a2540] bg-amber-100 px-2.5 py-0.5 rounded border border-amber-300 uppercase tracking-widest flex items-center gap-1.5 shadow-2xs">
                  <ShieldCheck size={12} className="text-amber-800" />
                  Corporate Industry Partner
                </span>
                <span className="text-xs text-slate-300 hidden sm:inline">•</span>
                <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Jindal Steel & Power Ltd.
                </span>
                <span className="text-xs text-slate-300 hidden sm:inline">•</span>
                <span className="text-[10px] font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Partner ID: IND-PARTNER-003
                </span>
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Corporate Partner Dashboard
                </h1>
                <p className="text-xs text-slate-600 mt-0.5 max-w-3xl leading-relaxed">
                  Manage your project collaborations, mentorship activities and technical contributions.
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => fetchDashboard()}
              className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100 shadow-2xs cursor-pointer transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Refresh Dashboard Metrics"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin text-blue-700' : 'text-slate-600'} />
              <span>Refresh</span>
            </button>
            <Link
              to="/corporate-partner/opportunities"
              className="px-4 py-2 bg-[#0a2540] hover:bg-[#12395b] text-white text-xs font-extrabold rounded-lg shadow-sm flex items-center gap-2 transition-colors cursor-pointer border border-blue-950"
            >
              <Target size={14} className="text-amber-400" />
              <span>Explore Opportunities</span>
            </Link>
          </div>
        </div>

        {/* Nodal Metadata Bar */}
        <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              Organization: Jindal Steel & Power Ltd.
            </span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-slate-600">Designation: Senior Technical Consultant</span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 size={13} className="text-emerald-600" />
              MoU Active with 2 Academic Institutions
            </span>
          </div>
          <div className="font-mono text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
            Active Session: Rohan Mittal
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs flex items-center justify-between shadow-2xs">
          <span className="font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {actionSuccess}
          </span>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:text-emerald-900 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* 2. Primary 5 Compact Government-Style Summary Cards (Section 7) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <KPIStatCard
          code="MY-COLLAB"
          title="MY COLLABORATIONS"
          value={summary.myCollaborations}
          badge="Involved"
          badgeColor="bg-blue-50 text-blue-800 border-blue-200"
          subtitle="Projects where you are participating"
          variant="blue"
        />

        <KPIStatCard
          code="PRJ-ACTIVE"
          title="ACTIVE PROJECTS"
          value={summary.activeProjects}
          badge="Live"
          badgeColor="bg-emerald-50 text-emerald-800 border-emerald-200"
          subtitle="Currently active assignments"
          variant="green"
        />

        <KPIStatCard
          code="REQ-PENDING"
          title="PENDING REQUESTS"
          value={summary.pendingRequests}
          badge="Action Req"
          badgeColor="bg-amber-50 text-amber-800 border-amber-300"
          subtitle="Collaboration requests awaiting action"
          variant="amber"
          valueColor="text-[#c2410c]"
        />

        <KPIStatCard
          code="SES-MENTOR"
          title="MENTORSHIP SESSIONS"
          value={summary.mentorshipSessions}
          badge="Completed & Next"
          badgeColor="bg-indigo-50 text-indigo-800 border-indigo-200"
          subtitle="Completed and scheduled sessions"
          variant="purple"
        />

        <KPIStatCard
          code="DELIV-ASSIGN"
          title="DELIVERABLES"
          value={summary.deliverables}
          badge="Under Review"
          badgeColor="bg-slate-100 text-slate-800 border-slate-300"
          subtitle="Assigned project deliverables"
          variant="slate"
        />
      </div>

      {/* 3. Section: MY ACTIVE PROJECTS (Section 8) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#133054]" />
              MY ACTIVE PROJECTS
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Assigned university innovation projects where you serve as technical mentor or reviewer
            </p>
          </div>
          <Link
            to="/corporate-partner/projects"
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
          >
            <span>View All Assigned Projects</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#133054] text-white font-semibold uppercase text-[10.5px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Project</th>
                <th className="py-2.5 px-3">University</th>
                <th className="py-2.5 px-3">Faculty Mentor</th>
                <th className="py-2.5 px-3">Student Lead</th>
                <th className="py-2.5 px-3">Domain</th>
                <th className="py-2.5 px-3">Your Role</th>
                <th className="py-2.5 px-3">Progress</th>
                <th className="py-2.5 px-3">Next Milestone</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {activeProjects.map((p: any) => (
                <tr key={p.projectId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900 max-w-[200px]">
                    <div className="truncate" title={p.projectTitle}>{p.projectTitle}</div>
                    <span className="font-mono text-[10px] text-slate-400 font-normal">{p.projectId}</span>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-800">{p.university}</td>
                  <td className="py-3 px-3 text-slate-700">{p.facultyMentor}</td>
                  <td className="py-3 px-3 font-medium text-blue-900">{p.studentLead}</td>
                  <td className="py-3 px-3">
                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10.5px] font-medium border border-slate-200">
                      {p.domain}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{p.partnerRole}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#133054] h-full rounded-full"
                          style={{ width: `${p.progress}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] font-bold text-slate-800">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-600 max-w-[220px]">
                    <div className="truncate" title={p.nextMilestone}>{p.nextMilestone}</div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300">
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      to={`/corporate-partner/projects?id=${p.projectId}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded text-xs font-semibold shadow-2xs transition-colors"
                    >
                      <Eye size={12} />
                      <span>View Project</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Two-Column Grid: Pending Requests (Left 6) + Upcoming Mentorship (Right 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Pending Requests (Section 9) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-3.5 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Handshake className="w-4 h-4 text-[#133054]" />
                  PENDING COLLABORATION REQUESTS
                </h3>
                <p className="text-[10.5px] text-slate-500 mt-0.5">
                  Requests sent by university faculties for your technical support
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300">
                {pendingRequests.length} Pending
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2 px-3">University & Project</th>
                    <th className="py-2 px-3">Requested Support</th>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3 text-center">Status</th>
                    <th className="py-2 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {pendingRequests.map((r: any) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{r.university}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[180px]">{r.project}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-slate-800 text-[11px]">{r.requestedSupport}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{r.requestedDate}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                          {r.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleRespond(r.id, 'Accept')}
                            className="inline-flex items-center gap-0.5 px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[10.5px] font-semibold"
                            title="Accept Collaboration Request"
                          >
                            <Check size={11} />
                            Accept
                          </button>
                          <button
                            onClick={() => handleRespond(r.id, 'Decline')}
                            className="inline-flex items-center gap-0.5 px-2 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 rounded text-[10.5px] font-semibold"
                            title="Decline Request"
                          >
                            <X size={11} />
                            Decline
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 text-right">
            <Link
              to="/corporate-partner/collaborations"
              className="text-xs font-semibold text-blue-700 hover:underline"
            >
              Manage all collaborations →
            </Link>
          </div>
        </div>

        {/* Right: Upcoming Mentorship (Section 10) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-3.5 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#133054]" />
                  UPCOMING MENTORSHIP SESSIONS
                </h3>
                <p className="text-[10.5px] text-slate-500 mt-0.5">
                  Scheduled calendar meetings with assigned student innovation teams
                </p>
              </div>
              <Link
                to="/corporate-partner/mentorship"
                className="text-[11px] font-bold text-[#133054] hover:underline"
              >
                + Schedule
              </Link>
            </div>

            <div className="p-3.5 space-y-3">
              {upcomingMentorship.map((m: any) => (
                <div
                  key={m.id}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{m.date}</span>
                      <span className="text-slate-400">•</span>
                      <span className="font-semibold text-blue-900 font-mono">{m.time}</span>
                      <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-semibold">
                        {m.meetingType}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-800">{m.topic}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <span>{m.studentTeam}</span>
                      <span>({m.university})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setSelectedMeeting(m)}
                      className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded text-xs font-semibold"
                    >
                      Details
                    </button>
                    {m.meetingLink && (
                      <a
                        href={m.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 bg-[#133054] hover:bg-[#0e233e] text-white rounded text-xs font-semibold shadow-2xs"
                      >
                        <Video size={12} className="text-amber-400" />
                        <span>Join</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 text-right">
            <Link
              to="/corporate-partner/mentorship"
              className="text-xs font-semibold text-blue-700 hover:underline"
            >
              View complete mentorship logs →
            </Link>
          </div>
        </div>
      </div>

      {/* Meeting Details Modal */}
      {selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg border border-slate-300 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#133054] text-white p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                  Government Innovation Mentorship
                </span>
                <h3 className="text-base font-bold">{selectedMeeting.topic}</h3>
              </div>
              <button
                onClick={() => setSelectedMeeting(null)}
                className="text-blue-200 hover:text-white p-1 rounded"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200">
                <div>
                  <span className="text-slate-500 font-semibold block text-[10.5px]">Date & Time</span>
                  <span className="font-bold text-slate-900">{selectedMeeting.date} at {selectedMeeting.time}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block text-[10.5px]">Meeting Format</span>
                  <span className="font-bold text-slate-900">{selectedMeeting.meetingType}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-semibold block text-[10.5px]">Student Team</span>
                <span className="font-bold text-slate-900">{selectedMeeting.studentTeam} ({selectedMeeting.university})</span>
              </div>

              <div>
                <span className="text-slate-500 font-semibold block text-[10.5px]">Project Context</span>
                <span className="text-slate-700">{selectedMeeting.project}</span>
              </div>

              {selectedMeeting.meetingLink && (
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded">
                  <span className="text-[10.5px] font-bold text-blue-900 block mb-0.5">Official Meeting URL:</span>
                  <a
                    href={selectedMeeting.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 underline break-all font-mono text-[11px]"
                  >
                    {selectedMeeting.meetingLink}
                  </a>
                </div>
              )}
            </div>

            <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedMeeting(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
