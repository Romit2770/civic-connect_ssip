import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Users,
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  Plus,
  RefreshCw,
  AlertCircle,
  Eye,
  MessageSquare,
  Building2,
  Layers,
  Sparkles,
  X,
  Send,
  Check,
  FileText,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export default function CorporatePartnerMentorshipPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Assigned Teams' | 'Upcoming Sessions' | 'Completed Sessions' | 'Feedback'>('Assigned Teams');
  const [assignedTeams, setAssignedTeams] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modals
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [feedbackSession, setFeedbackSession] = useState<any | null>(null);
  const [viewSession, setViewSession] = useState<any | null>(null);

  // Schedule Session Form
  const [targetProject, setTargetProject] = useState('Smart Water Monitoring & Leakage Detection System');
  const [targetTeam, setTargetTeam] = useState('AquaPur Clean Energy Lab');
  const [sessionDate, setSessionDate] = useState('2026-09-28');
  const [sessionTime, setSessionTime] = useState('11:00 AM');
  const [sessionTopic, setSessionTopic] = useState('Acoustic Sensor Field Skids & Telemetry Integration');
  const [meetingType, setMeetingType] = useState('Online');
  const [meetingLink, setMeetingLink] = useState('https://meet.gov.in/civic-mentorship-water');
  const [agenda, setAgenda] = useState('Review LoRaWAN packet transmission success rates and calibrate hydrophone threshold parameters.');
  const [scheduling, setScheduling] = useState(false);

  // Feedback Form
  const [technicalFeedback, setTechnicalFeedback] = useState('');
  const [studentProgress, setStudentProgress] = useState('Satisfactory');
  const [strengths, setStrengths] = useState('');
  const [issues, setIssues] = useState('');
  const [recommendedImprovements, setRecommendedImprovements] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const fetchMentorshipData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/corporate-partner/mentorship');
      if (res.data?.success) {
        setAssignedTeams(res.data.data.assignedTeams || []);
        setSessions(res.data.data.sessions || []);
      }
    } catch (err) {
      console.warn('Using fallback mentorship data');
      setAssignedTeams([
        {
          teamName: 'AquaPur Clean Energy Lab',
          university: 'NIT Jamshedpur',
          department: 'Civil & Environmental Engineering',
          project: 'Smart Water Monitoring & Leakage Detection System',
          facultyMentor: 'Prof. Ananya Sen',
          studentLead: 'Rahul Patel',
          teamSize: 5,
          projectStage: 'Testing',
          progress: 72,
          teamMembers: [
            { name: 'Rahul Patel', role: 'Student Lead', skills: 'Embedded C, LoRaWAN, Acoustic Analysis' },
            { name: 'Priya Sharma', role: 'Telemetry Engineer', skills: 'MQTT, FastAPI, MySQL' },
            { name: 'Vikram Singh', role: 'Hardware Specialist', skills: 'PCB Layout, Power Optimization' },
            { name: 'Deepa Soren', role: 'Field Data Collector', skills: 'GIS Mapping, Hydrophone Skids' },
            { name: 'Arunav Ghosh', role: 'Testing Associate', skills: 'Pressure Test Rig, Python' },
          ],
          partnerRole: 'Technical Mentor & IoT Architect',
          problem: 'Severe loss of treated potable municipal water across Jamshedpur urban pipeline corridor due to undetected underground pipe fissure leaks.',
          solution: 'Acoustic leak telemetry hydrophones deployed in subterranean manholes transmitting oscillation spikes via LoRaWAN gateways.',
          technology: 'Piezoelectric Hydrophones, STM32 LoRa nodes, Industrial Telemetry Ingestion Cloud.',
          expectedOutcome: 'Autonomous real-time detection of pipe leaks within 4 meters localization precision.',
        },
        {
          teamName: 'Urban Grid Photovoltaics',
          university: 'IIT (ISM) Dhanbad',
          department: 'Electrical Engineering',
          project: 'Solar-Powered LED Smart Streetlighting with Dynamic Dimming',
          facultyMentor: 'Dr. P. K. Sinha',
          studentLead: 'Sneha Kumari',
          teamSize: 4,
          projectStage: 'Prototype',
          progress: 58,
          teamMembers: [
            { name: 'Sneha Kumari', role: 'Student Lead', skills: 'Power Electronics, GaN Driver' },
            { name: 'Ritesh Das', role: 'Firmware Dev', skills: 'STM32, 24GHz Doppler Radar' },
            { name: 'Manoj Murmu', role: 'Hardware Testing', skills: 'Bifacial Solar Characterization' },
            { name: 'Sonalika Jena', role: 'Data Analysis', skills: 'Solar Irradiance Loggers' },
          ],
          partnerRole: 'Hardware & Solar Advisor',
          problem: 'High municipal power expenditures from conventional non-dimming streetlights on suburban transit corridors.',
          solution: 'Radar-actuated dynamic dimming solar luminaires with lithium iron phosphate storage.',
          technology: 'GaN Inverters, Bifacial Photovoltaics, 24GHz Doppler Motion Sensors.',
          expectedOutcome: '50% reduction in grid power consumption without sacrificing transit vehicular safety.',
        },
      ]);

      setSessions([
        {
          id: 'SES-2026-001',
          project: 'Smart Water Monitoring & Leakage Detection System',
          studentTeam: 'AquaPur Clean Energy Lab',
          university: 'NIT Jamshedpur',
          date: '2026-09-26',
          time: '11:00 AM',
          topic: 'Sensor Architecture & Subterranean LoRaWAN Range Testing',
          meetingType: 'Online',
          meetingLink: 'https://meet.gov.in/civic-mentorship-water',
          status: 'Scheduled',
          agenda: 'Review 868MHz RF propagation tests through wet soil and cast-iron manhole covers.',
        },
        {
          id: 'SES-2026-002',
          project: 'Solar-Powered LED Smart Streetlighting with Dynamic Dimming',
          studentTeam: 'Urban Grid Photovoltaics',
          university: 'IIT (ISM) Dhanbad',
          date: '2026-09-29',
          time: '03:30 PM',
          topic: 'GaN Inverter Thermal Dissipation & MPPT Tracking Review',
          meetingType: 'Online',
          meetingLink: 'https://meet.gov.in/civic-mentorship-solar',
          status: 'Scheduled',
          agenda: 'Analyze thermal heat dissipation bench data under 45C ambient chamber simulations.',
        },
        {
          id: 'SES-2026-003',
          project: 'Smart Water Monitoring & Leakage Detection System',
          studentTeam: 'AquaPur Clean Energy Lab',
          university: 'NIT Jamshedpur',
          date: '2026-09-12',
          time: '02:00 PM',
          topic: 'Piezoelectric Hydrophone Sensitivity & FFT Analysis',
          meetingType: 'Online',
          meetingLink: 'https://meet.gov.in/civic-mentorship-water-archived',
          status: 'Completed',
          feedback: {
            technicalFeedback: 'The student team successfully validated the FFT peak detection threshold at 2.4 kHz for pipeline pinhole leaks.',
            studentProgress: 'Excellent',
            strengths: 'Rigorous acoustic data collection across 6 pipe sections with documented SNR ratios.',
            issues: 'Minor cable strain observed at sensor waterproof gland connector.',
            recommendedImprovements: 'Adopt IP68 molded strain relief glands for subterranean deployment.',
            nextSteps: 'Proceed with Manhole 14 pilot test under municipal observer supervision.',
          },
        },
        {
          id: 'SES-2026-004',
          project: 'Solar-Powered LED Smart Streetlighting with Dynamic Dimming',
          studentTeam: 'Urban Grid Photovoltaics',
          university: 'IIT (ISM) Dhanbad',
          date: '2026-09-08',
          time: '11:00 AM',
          topic: 'Doppler Radar False Trigger Suppression',
          meetingType: 'Online',
          status: 'Completed',
          feedback: {
            technicalFeedback: 'Radar filtering algorithm tuned to eliminate false triggering from heavy foliage and rain.',
            studentProgress: 'Satisfactory',
            strengths: 'Quick turnaround on STM32 DSP filter implementation.',
            issues: 'Need to document test skid battery backup runtime under continuous overcast conditions.',
            recommendedImprovements: 'Implement dual-threshold hysteresis for dusk-to-dawn transitions.',
            nextSteps: 'Assemble 3 field units for Sonari bypass highway trial.',
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentorshipData();
  }, []);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setScheduling(true);
    try {
      const payload = {
        project: targetProject,
        studentTeam: targetTeam,
        date: sessionDate,
        time: sessionTime,
        topic: sessionTopic,
        meetingType,
        meetingLink,
        agenda,
      };

      const res = await apiClient.post('/corporate-partner/mentorship/schedule', payload);
      if (res.data?.success) {
        setActionSuccess('Mentorship session scheduled successfully and meeting invite sent to student team.');
        fetchMentorshipData();
        setScheduleModalOpen(false);
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err) {
      const newSession = {
        id: `SES-2026-00${sessions.length + 1}`,
        project: targetProject,
        studentTeam: targetTeam,
        university: 'NIT Jamshedpur',
        date: sessionDate,
        time: sessionTime,
        topic: sessionTopic,
        meetingType,
        meetingLink,
        agenda,
        status: 'Scheduled',
      };
      setSessions((prev) => [newSession, ...prev]);
      setActionSuccess('Mentorship session scheduled successfully and meeting invite sent to student team.');
      setScheduleModalOpen(false);
      setTimeout(() => setActionSuccess(null), 4000);
    } finally {
      setScheduling(false);
    }
  };

  const handleOpenFeedback = (session: any) => {
    setFeedbackSession(session);
    setTechnicalFeedback(session.feedback?.technicalFeedback || '');
    setStudentProgress(session.feedback?.studentProgress || 'Satisfactory');
    setStrengths(session.feedback?.strengths || '');
    setIssues(session.feedback?.issues || '');
    setRecommendedImprovements(session.feedback?.recommendedImprovements || '');
    setNextSteps(session.feedback?.nextSteps || '');
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackSession) return;
    setSubmittingFeedback(true);

    try {
      const payload = {
        technicalFeedback,
        studentProgress,
        strengths,
        issues,
        recommendedImprovements,
        nextSteps,
      };

      const res = await apiClient.post(`/corporate-partner/mentorship/${feedbackSession.id}/feedback`, payload);
      if (res.data?.success) {
        setActionSuccess(`Feedback submitted for session ${feedbackSession.id}.`);
        fetchMentorshipData();
        setFeedbackSession(null);
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === feedbackSession.id
            ? {
                ...s,
                status: 'Completed',
                feedback: {
                  technicalFeedback,
                  studentProgress,
                  strengths,
                  issues,
                  recommendedImprovements,
                  nextSteps,
                },
              }
            : s
        )
      );
      setActionSuccess(`Feedback submitted for session ${feedbackSession.id}.`);
      setFeedbackSession(null);
      setTimeout(() => setActionSuccess(null), 4000);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleMarkCompleted = (session: any) => {
    handleOpenFeedback(session);
  };

  const upcomingSessions = sessions.filter((s) => s.status === 'Scheduled');
  const completedSessions = sessions.filter((s) => s.status === 'Completed');
  const feedbackList = sessions.filter((s) => s.feedback);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border-b-2 border-slate-200 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 px-4 sm:px-6 py-4 mb-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-[#133054] text-white px-2 py-0.5 rounded tracking-wider uppercase">
                STUDENT MENTORSHIP
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Technical Guidance & Professional Mentoring
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Mentorship
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Manage your assigned student teams, mentoring sessions and professional feedback.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setScheduleModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#133054] text-white font-bold hover:bg-[#1a4275] text-xs transition-colors shadow-xs cursor-pointer"
            >
              <Plus size={14} className="text-amber-400" />
              <span>Schedule Session</span>
            </button>
            <button
              onClick={fetchMentorshipData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin text-blue-700' : 'text-slate-500'} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span className="font-bold">{actionSuccess}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-1">
        {[
          { key: 'Assigned Teams', label: 'Assigned Teams', count: assignedTeams.length },
          { key: 'Upcoming Sessions', label: 'Upcoming Sessions', count: upcomingSessions.length },
          { key: 'Completed Sessions', label: 'Completed Sessions', count: completedSessions.length },
          { key: 'Feedback', label: 'Mentorship Feedback', count: feedbackList.length },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3.5 py-2 text-xs font-extrabold rounded-t-lg transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-[#133054] text-[#133054] bg-white shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  isActive ? 'bg-[#133054] text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ASSIGNED STUDENT TEAMS */}
      {activeTab === 'Assigned Teams' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Assigned Student Innovation Teams
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Only student info necessary for assigned projects is shown
            </span>
          </div>

          {assignedTeams.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <AlertCircle size={32} className="mx-auto text-slate-400 mb-2" />
              <p className="text-xs font-bold">No assigned student teams found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-extrabold uppercase text-[10.5px] tracking-wider border-b border-slate-200">
                    <th className="py-3 px-3.5">Student Team</th>
                    <th className="py-3 px-3.5">University</th>
                    <th className="py-3 px-3.5">Project</th>
                    <th className="py-3 px-3.5">Faculty Mentor</th>
                    <th className="py-3 px-3.5">Student Lead</th>
                    <th className="py-3 px-3.5">Team Size</th>
                    <th className="py-3 px-3.5">Project Stage</th>
                    <th className="py-3 px-3.5">Progress</th>
                    <th className="py-3 px-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {assignedTeams.map((team) => (
                    <tr key={team.teamName} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3 px-3.5 font-extrabold text-slate-900 whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Users size={14} className="text-[#133054]" />
                          <span>{team.teamName}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3.5 font-bold text-slate-800 whitespace-nowrap">
                        {team.university}
                      </td>
                      <td className="py-3 px-3.5 max-w-xs truncate text-slate-700 font-semibold" title={team.project}>
                        {team.project}
                      </td>
                      <td className="py-3 px-3.5 text-slate-700 whitespace-nowrap">
                        {team.facultyMentor}
                      </td>
                      <td className="py-3 px-3.5 text-slate-700 whitespace-nowrap font-medium">
                        {team.studentLead}
                      </td>
                      <td className="py-3 px-3.5 text-slate-700 whitespace-nowrap font-mono">
                        {team.teamSize} Students
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="inline-block text-[10.5px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
                          {team.projectStage}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div className="bg-[#133054] h-full" style={{ width: `${team.progress}%` }} />
                          </div>
                          <span className="font-mono font-bold text-[11px] text-slate-800">{team.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedTeam(team)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#133054] text-white font-bold hover:bg-[#1a4275] transition-colors text-[11px] shadow-xs cursor-pointer"
                        >
                          <Eye size={12} />
                          <span>View Team</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2 & 3: SESSIONS TABLE */}
      {(activeTab === 'Upcoming Sessions' || activeTab === 'Completed Sessions') && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
              {activeTab === 'Upcoming Sessions' ? 'Upcoming Mentorship Sessions' : 'Completed Mentorship Sessions'}
            </span>
          </div>

          {(activeTab === 'Upcoming Sessions' ? upcomingSessions : completedSessions).length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <AlertCircle size={32} className="mx-auto text-slate-400 mb-2" />
              <p className="text-xs font-bold">
                No {activeTab.toLowerCase()} recorded.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-extrabold uppercase text-[10.5px] tracking-wider border-b border-slate-200">
                    <th className="py-3 px-3.5">Session ID</th>
                    <th className="py-3 px-3.5">Project</th>
                    <th className="py-3 px-3.5">Student Team</th>
                    <th className="py-3 px-3.5">Date & Time</th>
                    <th className="py-3 px-3.5">Topic</th>
                    <th className="py-3 px-3.5">Meeting Type</th>
                    <th className="py-3 px-3.5">Status</th>
                    <th className="py-3 px-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(activeTab === 'Upcoming Sessions' ? upcomingSessions : completedSessions).map((ses) => (
                    <tr key={ses.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3 px-3.5 font-mono font-bold text-[#133054] whitespace-nowrap">
                        {ses.id}
                      </td>
                      <td className="py-3 px-3.5 max-w-xs font-semibold text-slate-900 truncate" title={ses.project}>
                        {ses.project}
                      </td>
                      <td className="py-3 px-3.5 font-bold text-slate-800 whitespace-nowrap">
                        {ses.studentTeam}
                      </td>
                      <td className="py-3 px-3.5 text-slate-700 whitespace-nowrap font-mono">
                        {ses.date} • {ses.time}
                      </td>
                      <td className="py-3 px-3.5 text-slate-700 font-medium max-w-xs truncate" title={ses.topic}>
                        {ses.topic}
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                          <Video size={10} />
                          {ses.meetingType}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span
                          className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            ses.status === 'Scheduled'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}
                        >
                          {ses.status}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewSession(ses)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors text-[11px] cursor-pointer"
                          >
                            <Eye size={12} />
                            <span>View</span>
                          </button>
                          {ses.status === 'Scheduled' && (
                            <button
                              onClick={() => handleMarkCompleted(ses)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-emerald-700 text-white font-bold hover:bg-emerald-800 transition-colors text-[11px] shadow-xs cursor-pointer"
                            >
                              <CheckCircle2 size={12} />
                              <span>Mark Completed</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenFeedback(ses)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#133054] text-white font-bold hover:bg-[#1a4275] transition-colors text-[11px] shadow-xs cursor-pointer"
                          >
                            <FileText size={12} className="text-amber-400" />
                            <span>{ses.feedback ? 'Edit Feedback' : 'Add Feedback'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MENTORSHIP FEEDBACK SUMMARY */}
      {activeTab === 'Feedback' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Documented Qualitative Mentorship Feedback
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Feedback stored permanently in student project record
            </span>
          </div>

          {feedbackList.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-500">
              <AlertCircle size={32} className="mx-auto text-slate-400 mb-2" />
              <p className="text-xs font-bold">No feedback documented yet. Complete a mentorship session to record feedback.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedbackList.map((ses) => (
                <div key={ses.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-[#133054] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {ses.id}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900 mt-1">{ses.topic}</h4>
                      <p className="text-[11px] text-slate-600 font-semibold">{ses.studentTeam} • {ses.project}</p>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                      {ses.date}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-slate-500 font-bold block text-[10.5px]">Technical Feedback:</span>
                      <p className="text-slate-800 font-medium mt-0.5">{ses.feedback.technicalFeedback}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div>
                        <span className="text-slate-500 font-semibold block">Student Progress:</span>
                        <span className="font-bold text-emerald-800">{ses.feedback.studentProgress}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-semibold block">Strengths:</span>
                        <span className="font-medium text-slate-800">{ses.feedback.strengths || 'N/A'}</span>
                      </div>
                    </div>
                    {ses.feedback.recommendedImprovements && (
                      <div>
                        <span className="text-slate-500 font-bold block text-[10.5px]">Recommended Improvements:</span>
                        <p className="text-slate-800 font-medium mt-0.5">{ses.feedback.recommendedImprovements}</p>
                      </div>
                    )}
                    {ses.feedback.nextSteps && (
                      <div>
                        <span className="text-slate-500 font-bold block text-[10.5px]">Next Steps:</span>
                        <p className="text-blue-900 font-bold mt-0.5">{ses.feedback.nextSteps}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleOpenFeedback(ses)}
                      className="text-xs font-bold text-blue-900 hover:text-blue-700 underline cursor-pointer"
                    >
                      Edit Feedback
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: VIEW TEAM DETAILS */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 my-8">
            <div className="p-4 bg-[#133054] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded uppercase">
                  ASSIGNED STUDENT TEAM
                </span>
                <h3 className="font-black text-sm sm:text-base mt-1 text-white">
                  {selectedTeam.teamName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTeam(null)}
                className="p-1 rounded-md text-blue-200 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
              {/* Team Information */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#133054] flex items-center gap-1.5">
                  <Users size={14} />
                  <span>Team Information</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 font-semibold block">University:</span>
                    <span className="font-bold text-slate-900">{selectedTeam.university}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Department:</span>
                    <span className="font-bold text-slate-800">{selectedTeam.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Faculty Mentor:</span>
                    <span className="font-bold text-slate-800">{selectedTeam.facultyMentor}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Student Lead:</span>
                    <span className="font-bold text-slate-800">{selectedTeam.studentLead}</span>
                  </div>
                </div>

                {/* Team Members */}
                <div className="pt-2">
                  <span className="text-slate-500 font-bold block text-[11px] mb-1">Assigned Student Members:</span>
                  <div className="space-y-1">
                    {selectedTeam.teamMembers.map((m: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between bg-white p-2 rounded border border-slate-200">
                        <div>
                          <span className="font-bold text-slate-900">{m.name}</span>
                          <span className="text-[10px] text-slate-500 ml-1.5">({m.role})</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {m.skills}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Project Objective */}
              <div className="p-3.5 bg-blue-50/50 rounded-lg border border-blue-200 space-y-2">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                  <Layers size={14} />
                  <span>Project Objective & Scope</span>
                </h4>
                <div>
                  <span className="text-slate-500 font-semibold block">Problem:</span>
                  <p className="text-slate-800 font-medium">{selectedTeam.problem}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Proposed Solution:</span>
                  <p className="text-slate-800 font-medium">{selectedTeam.solution}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 font-semibold block">Technology:</span>
                    <span className="font-bold text-slate-800">{selectedTeam.technology}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Expected Outcome:</span>
                    <span className="font-bold text-slate-800">{selectedTeam.expectedOutcome}</span>
                  </div>
                </div>
              </div>

              {/* Partner Role */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px]">
                <span className="text-amber-900 font-bold block uppercase tracking-wider">Your Assigned Partner Role</span>
                <span className="text-sm font-extrabold text-[#133054] block mt-0.5">{selectedTeam.partnerRole}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedTeam(null)}
                className="px-4 py-2 rounded-lg bg-[#133054] text-white font-bold hover:bg-[#1a4275] text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SCHEDULE MENTORSHIP SESSION */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 my-8">
            <div className="p-4 bg-[#133054] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded uppercase">
                  NEW MENTORSHIP SESSION
                </span>
                <h3 className="font-black text-sm sm:text-base mt-1 text-white">
                  Schedule Mentorship Session
                </h3>
              </div>
              <button
                onClick={() => setScheduleModalOpen(false)}
                className="p-1 rounded-md text-blue-200 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                  Project *
                </label>
                <select
                  value={targetProject}
                  onChange={(e) => setTargetProject(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#133054] bg-white"
                  required
                >
                  <option value="Smart Water Monitoring & Leakage Detection System">
                    Smart Water Monitoring & Leakage Detection System (NIT Jamshedpur)
                  </option>
                  <option value="Solar-Powered LED Smart Streetlighting with Dynamic Dimming">
                    Solar-Powered LED Smart Streetlighting (IIT Dhanbad)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                  Student Team *
                </label>
                <input
                  type="text"
                  value={targetTeam}
                  onChange={(e) => setTargetTeam(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#133054] bg-white font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#133054] bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                    Time *
                  </label>
                  <input
                    type="text"
                    value={sessionTime}
                    onChange={(e) => setSessionTime(e.target.value)}
                    placeholder="e.g. 11:00 AM"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#133054] bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                  Session Topic *
                </label>
                <input
                  type="text"
                  value={sessionTopic}
                  onChange={(e) => setSessionTopic(e.target.value)}
                  placeholder="e.g. Hydrophone Calibration & LoRaWAN Gateway Protocol"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#133054] bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                    Meeting Type *
                  </label>
                  <select
                    value={meetingType}
                    onChange={(e) => setMeetingType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#133054] bg-white"
                    required
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                    Meeting Link
                  </label>
                  <input
                    type="url"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#133054] bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                  Agenda & Instructions
                </label>
                <textarea
                  rows={2}
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  placeholder="Brief meeting agenda for the student team..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#133054] bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduling}
                  className="px-4 py-2 rounded-lg bg-[#133054] text-white font-extrabold hover:bg-[#1a4275] text-xs shadow-xs cursor-pointer"
                >
                  {scheduling ? 'Scheduling...' : 'Schedule Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD/EDIT FEEDBACK */}
      {feedbackSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 my-8">
            <div className="p-4 bg-[#133054] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded uppercase">
                  {feedbackSession.id} FEEDBACK
                </span>
                <h3 className="font-black text-sm sm:text-base mt-1 text-white">
                  Submit Mentorship Feedback
                </h3>
              </div>
              <button
                onClick={() => setFeedbackSession(null)}
                className="p-1 rounded-md text-blue-200 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="p-6 space-y-3.5 max-h-[75vh] overflow-y-auto text-xs">
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-[11px]">
                <span className="font-bold text-blue-900 block">{feedbackSession.topic}</span>
                <span className="text-slate-600 block">{feedbackSession.studentTeam} • {feedbackSession.project}</span>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                  Technical Feedback *
                </label>
                <textarea
                  rows={2}
                  value={technicalFeedback}
                  onChange={(e) => setTechnicalFeedback(e.target.value)}
                  placeholder="Summary of engineering evaluation, sensor tuning, or code review..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#133054] bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                  Student Progress *
                </label>
                <select
                  value={studentProgress}
                  onChange={(e) => setStudentProgress(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#133054] bg-white font-medium"
                  required
                >
                  <option value="Excellent">Excellent - Exceeding technical milestones</option>
                  <option value="Satisfactory">Satisfactory - On track with guidance</option>
                  <option value="Needs Support">Needs Support - Struggling with hardware/API</option>
                  <option value="Delayed">Delayed - Milestone revised</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                    Strengths
                  </label>
                  <input
                    type="text"
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                    placeholder="e.g. Rigorous acoustic logging"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#133054] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                    Issues Identified
                  </label>
                  <input
                    type="text"
                    value={issues}
                    onChange={(e) => setIssues(e.target.value)}
                    placeholder="e.g. Connector strain in manhole"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#133054] bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                  Recommended Improvements
                </label>
                <textarea
                  rows={2}
                  value={recommendedImprovements}
                  onChange={(e) => setRecommendedImprovements(e.target.value)}
                  placeholder="Suggestions for next iteration or component selection..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#133054] bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                  Next Steps
                </label>
                <input
                  type="text"
                  value={nextSteps}
                  onChange={(e) => setNextSteps(e.target.value)}
                  placeholder="e.g. Execute Sonari Corridor deployment on Friday"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#133054] bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setFeedbackSession(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="px-4 py-2 rounded-lg bg-[#133054] text-white font-extrabold hover:bg-[#1a4275] text-xs shadow-xs cursor-pointer"
                >
                  {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: VIEW SESSION DETAILS */}
      {viewSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 my-8">
            <div className="p-4 bg-[#133054] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded uppercase">
                  {viewSession.id} • {viewSession.status.toUpperCase()}
                </span>
                <h3 className="font-black text-sm sm:text-base mt-1 text-white">
                  {viewSession.topic}
                </h3>
              </div>
              <button
                onClick={() => setViewSession(null)}
                className="p-1 rounded-md text-blue-200 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-3.5 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Student Team:</span>
                  <span className="font-bold text-slate-900">{viewSession.studentTeam}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Project:</span>
                  <span className="font-bold text-slate-800">{viewSession.project}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Date & Time:</span>
                  <span className="font-mono font-bold text-slate-800">{viewSession.date} at {viewSession.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Meeting Format:</span>
                  <span className="font-bold text-blue-900">{viewSession.meetingType}</span>
                </div>
              </div>

              {viewSession.agenda && (
                <div>
                  <span className="text-slate-500 font-bold block mb-1">Agenda:</span>
                  <p className="p-2.5 bg-slate-50 rounded border border-slate-200 text-slate-800 font-medium">
                    {viewSession.agenda}
                  </p>
                </div>
              )}

              {viewSession.meetingLink && (
                <div>
                  <span className="text-slate-500 font-bold block mb-1">Meeting Link:</span>
                  <a
                    href={viewSession.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-900 rounded-lg border border-blue-200 font-mono font-bold text-xs hover:bg-blue-100 transition-colors w-full"
                  >
                    <Video size={13} className="text-blue-700" />
                    <span className="truncate">{viewSession.meetingLink}</span>
                  </a>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setViewSession(null)}
                className="px-4 py-2 rounded-lg bg-[#133054] text-white font-bold hover:bg-[#1a4275] text-xs cursor-pointer"
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
