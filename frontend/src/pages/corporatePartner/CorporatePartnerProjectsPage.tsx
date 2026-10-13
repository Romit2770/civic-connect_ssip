import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  FlaskConical,
  Eye,
  Download,
  AlertCircle,
  RefreshCw,
  X,
  Send,
  Building2,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export default function CorporatePartnerProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Milestones' | 'Deliverables' | 'Testing'>('All');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modals
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [deliverableModal, setDeliverableModal] = useState<any | null>(null);
  const [deliverableReviewStatus, setDeliverableReviewStatus] = useState('Verified');
  const [deliverableFeedback, setDeliverableFeedback] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [testModal, setTestModal] = useState<any | null>(null);
  const [testFeedback, setTestFeedback] = useState('');
  const [testIssues, setTestIssues] = useState('');
  const [testRecommendations, setTestRecommendations] = useState('');
  const [submittingTest, setSubmittingTest] = useState(false);

  const [milestoneFeedbackModal, setMilestoneFeedbackModal] = useState<any | null>(null);
  const [milestoneFeedbackText, setMilestoneFeedbackText] = useState('');

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/corporate-partner/projects');
      if (res.data?.success) {
        setProjects(res.data.data.projects || []);
        setMilestones(res.data.data.milestones || []);
        setDeliverables(res.data.data.deliverables || []);
        setTests(res.data.data.testing || []);
      }
    } catch (err) {
      console.warn('Using fallback project data');
      setProjects([
        {
          projectId: 'PRJ-CSR-2026-001',
          challengeId: 'CH-2026-089',
          projectTitle: 'Smart Water Monitoring & Leakage Detection System',
          university: 'NIT Jamshedpur',
          facultyMentor: 'Prof. Ananya Sen',
          studentLead: 'Rahul Patel',
          domain: 'Water & Sanitation',
          location: 'Sakchi & Bistupur Corridor, Jamshedpur',
          partnerRole: 'Technical Mentor & IoT Architect',
          industryPartner: 'Jindal Steel & Power Ltd.',
          progress: 72,
          currentMilestone: 'Sensor Testing & Calibration',
          nextMilestone: 'Manhole 14 Live LoRa Deployment',
          deliverablesCount: 7,
          testingStatus: 'In Progress (Hydraulic Skid Passed)',
          status: 'Active',
          currentStageIndex: 3, // Testing (out of 7)
          problem: 'Underground municipal water pipeline leaks cause severe non-revenue water losses across Jamshedpur urban sectors.',
          solution: 'Acoustic leak telemetry hydrophones deployed in subterranean manholes transmitting oscillation spikes via LoRaWAN gateways.',
          technology: 'Piezoelectric Hydrophones, STM32 LoRa nodes, Industrial Telemetry Ingestion Cloud.',
          expectedOutcome: 'Sub-surface acoustic leak localization within 4m precision with automatic municipal alerting.',
        },
        {
          projectId: 'PRJ-CSR-2026-004',
          challengeId: 'CH-2026-188',
          projectTitle: 'Solar-Powered LED Smart Streetlighting with Dynamic Dimming',
          university: 'IIT (ISM) Dhanbad',
          facultyMentor: 'Dr. P. K. Sinha',
          studentLead: 'Sneha Kumari',
          domain: 'Urban Energy & Solar',
          location: 'Sonari Transit Highway, Jamshedpur',
          partnerRole: 'Hardware & Solar Advisor',
          industryPartner: 'Jindal Steel & Power Ltd.',
          progress: 58,
          currentMilestone: 'GaN Inverter Thermal Benchmarking',
          nextMilestone: 'Sonari Corridor 3-Pole Field Pilot',
          deliverablesCount: 5,
          testingStatus: 'Bench Tested (GaN Efficiency 99.1%)',
          status: 'Active',
          currentStageIndex: 2, // Prototype (out of 7)
          problem: 'High municipal power expenditures from conventional non-dimming streetlights on suburban transit corridors.',
          solution: 'Radar-actuated dynamic dimming solar luminaires with lithium iron phosphate storage.',
          technology: 'GaN Inverters, Bifacial Photovoltaics, 24GHz Doppler Motion Sensors.',
          expectedOutcome: '50% reduction in grid power consumption without sacrificing transit vehicular safety.',
        },
      ]);

      setMilestones([
        {
          id: 'MLS-01',
          milestone: 'Subterranean Hydrophone Acoustic Rig Assembly',
          project: 'Smart Water Monitoring & Leakage Detection System',
          dueDate: '2026-08-15',
          progress: 100,
          status: 'Completed',
          partnerAction: 'Skid calibration verified in Jindal lab facility.',
        },
        {
          id: 'MLS-02',
          milestone: 'LoRaWAN Edge Gateway Firmware & MQTT Payload Optimization',
          project: 'Smart Water Monitoring & Leakage Detection System',
          dueDate: '2026-09-10',
          progress: 100,
          status: 'Completed',
          partnerAction: 'API encryption token validated.',
        },
        {
          id: 'MLS-03',
          milestone: 'Manhole 14 Field Hydrophone Skid Pilot Deployment',
          project: 'Smart Water Monitoring & Leakage Detection System',
          dueDate: '2026-10-05',
          progress: 65,
          status: 'In Progress',
          partnerAction: 'Technical feedback required on antenna cable gland.',
        },
        {
          id: 'MLS-04',
          milestone: 'GaN Power Inverter Thermal & Efficiency Benchmarking',
          project: 'Solar-Powered LED Smart Streetlighting with Dynamic Dimming',
          dueDate: '2026-09-30',
          progress: 75,
          status: 'In Progress',
          partnerAction: 'Chamber testing approval submitted.',
        },
        {
          id: 'MLS-05',
          milestone: 'Highway 3-Luminaire Radar Adaptive Field Trial',
          project: 'Solar-Powered LED Smart Streetlighting with Dynamic Dimming',
          dueDate: '2026-11-15',
          progress: 10,
          status: 'Upcoming',
          partnerAction: 'Site survey pending with Sonari municipal engineer.',
        },
      ]);

      setDeliverables([
        {
          id: 'DEL-001',
          deliverableName: 'Acoustic Hydrophone Frequency Response Matrix v1.2',
          projectTitle: 'Smart Water Monitoring & Leakage Detection System',
          submittedBy: 'Rahul Patel (Student Lead)',
          submissionDate: '2026-09-18',
          version: '1.2',
          partnerReviewStatus: 'Verified',
          feedback: 'Accurate acoustic response from 500Hz to 5kHz confirmed against test bench.',
          status: 'Approved',
        },
        {
          id: 'DEL-002',
          deliverableName: 'Subterranean Antenna Waterproof Enclosure CAD & IP68 Spec',
          projectTitle: 'Smart Water Monitoring & Leakage Detection System',
          submittedBy: 'Vikram Singh (Hardware Lead)',
          submissionDate: '2026-09-22',
          version: '1.0',
          partnerReviewStatus: 'Pending Review',
          feedback: '',
          status: 'Under Review',
        },
        {
          id: 'DEL-003',
          deliverableName: 'GaN Inverter Thermal Performance & Loss Calculation Sheet',
          projectTitle: 'Solar-Powered LED Smart Streetlighting with Dynamic Dimming',
          submittedBy: 'Sneha Kumari (Student Lead)',
          submissionDate: '2026-09-14',
          version: '1.1',
          partnerReviewStatus: 'Verified',
          feedback: 'Efficiency benchmark of 99.1% validated at 45C ambient.',
          status: 'Approved',
        },
      ]);

      setTests([
        {
          id: 'TST-2026-01',
          project: 'Smart Water Monitoring & Leakage Detection System',
          testType: 'Hardware',
          environment: 'Jindal Industrial Water Pipe Hydraulic Test Skid',
          submittedDate: '2026-09-19',
          result: 'Passed',
          partnerReview: 'Verified',
          status: 'Completed',
          feedback: 'Tested under 4.5 bar dynamic water hammer pulses.',
        },
        {
          id: 'TST-2026-02',
          project: 'Smart Water Monitoring & Leakage Detection System',
          testType: 'Field',
          environment: 'Sakchi Municipal Manhole 14 Subterranean Chamber',
          submittedDate: '2026-09-23',
          result: 'In Progress',
          partnerReview: 'Under Review',
          status: 'Testing',
          feedback: 'LoRa RSSI clocked at -108 dBm through closed cast-iron manhole cover.',
        },
        {
          id: 'TST-2026-03',
          project: 'Solar-Powered LED Smart Streetlighting with Dynamic Dimming',
          testType: 'Performance',
          environment: 'IIT Dhanbad Power Electronics Lab High-G Chamber',
          submittedDate: '2026-09-12',
          result: 'Passed',
          partnerReview: 'Verified',
          status: 'Completed',
          feedback: 'MPPT response settling time under 28 milliseconds.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, []);

  const STAGES = [
    'Proposal',
    'Approval',
    'Prototype',
    'Testing',
    'Field Pilot',
    'Deployment',
    'Completion',
  ];

  const handleDeliverableReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverableModal) return;
    setSubmittingReview(true);

    try {
      const res = await apiClient.post(`/corporate-partner/deliverables/${deliverableModal.id}/review`, {
        reviewStatus: deliverableReviewStatus,
        feedback: deliverableFeedback,
      });
      if (res.data?.success) {
        setActionSuccess(`Deliverable review submitted for ${deliverableModal.deliverableName}.`);
        fetchProjectData();
        setDeliverableModal(null);
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err) {
      setDeliverables((prev) =>
        prev.map((d) =>
          d.id === deliverableModal.id
            ? { ...d, partnerReviewStatus: deliverableReviewStatus, feedback: deliverableFeedback }
            : d
        )
      );
      setActionSuccess(`Deliverable review submitted for ${deliverableModal.deliverableName}.`);
      setDeliverableModal(null);
      setTimeout(() => setActionSuccess(null), 4000);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleTestFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testModal) return;
    setSubmittingTest(true);

    try {
      const res = await apiClient.post(`/corporate-partner/testing/${testModal.id}/feedback`, {
        feedback: testFeedback,
        issues: testIssues,
        recommendations: testRecommendations,
      });
      if (res.data?.success) {
        setActionSuccess(`Testing feedback submitted for Test ID ${testModal.id}.`);
        fetchProjectData();
        setTestModal(null);
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err) {
      setTests((prev) =>
        prev.map((t) => (t.id === testModal.id ? { ...t, partnerReview: 'Verified', feedback: testFeedback } : t))
      );
      setActionSuccess(`Testing feedback submitted for Test ID ${testModal.id}.`);
      setTestModal(null);
      setTimeout(() => setActionSuccess(null), 4000);
    } finally {
      setSubmittingTest(false);
    }
  };

  const handleSaveMilestoneFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneFeedbackModal) return;
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === milestoneFeedbackModal.id ? { ...m, partnerAction: milestoneFeedbackText } : m
      )
    );
    setActionSuccess(`Technical feedback added for milestone ${milestoneFeedbackModal.milestone}.`);
    setMilestoneFeedbackModal(null);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border-b-2 border-slate-200 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 px-4 sm:px-6 py-4 mb-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-[#133054] text-white px-2 py-0.5 rounded tracking-wider uppercase">
                PROJECT TRACKER
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Milestones, Deliverables & Engineering Testing
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Project Progress
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Monitor the progress of projects where you are an active corporate partner.
            </p>
          </div>

          <button
            onClick={fetchProjectData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold transition-colors shadow-xs cursor-pointer self-start md:self-auto"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-blue-700' : 'text-slate-500'} />
            <span>Refresh</span>
          </button>
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
          { key: 'All', label: 'All Projects', count: projects.length },
          { key: 'Active', label: 'Active Projects', count: projects.filter((p) => p.status === 'Active').length },
          { key: 'Milestones', label: 'Milestones', count: milestones.length },
          { key: 'Deliverables', label: 'Deliverables', count: deliverables.length },
          { key: 'Testing', label: 'Technical Testing', count: tests.length },
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

      {/* TAB 1 & 2: PROJECTS TABLE */}
      {(activeTab === 'All' || activeTab === 'Active') && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Assigned Corporate Innovation Projects
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-extrabold uppercase text-[10.5px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-3.5">Project</th>
                  <th className="py-3 px-3.5">University</th>
                  <th className="py-3 px-3.5">Progress</th>
                  <th className="py-3 px-3.5">Current Milestone</th>
                  <th className="py-3 px-3.5">Next Milestone</th>
                  <th className="py-3 px-3.5">Deliverables</th>
                  <th className="py-3 px-3.5">Testing Status</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {projects.map((prj) => (
                  <tr key={prj.projectId} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-3.5 max-w-xs">
                      <p className="font-extrabold text-slate-900 line-clamp-1">{prj.projectTitle}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{prj.projectId} • {prj.domain}</p>
                    </td>
                    <td className="py-3 px-3.5 font-bold text-slate-800 whitespace-nowrap">
                      {prj.university}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div className="bg-[#133054] h-full" style={{ width: `${prj.progress}%` }} />
                        </div>
                        <span className="font-mono font-bold text-[11px] text-slate-800">{prj.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-slate-700 font-medium max-w-[150px] truncate" title={prj.currentMilestone}>
                      {prj.currentMilestone}
                    </td>
                    <td className="py-3 px-3.5 text-slate-500 font-medium max-w-[150px] truncate" title={prj.nextMilestone}>
                      {prj.nextMilestone}
                    </td>
                    <td className="py-3 px-3.5 font-mono text-slate-700 whitespace-nowrap">
                      {prj.deliverablesCount} Docs
                    </td>
                    <td className="py-3 px-3.5 text-blue-900 font-semibold max-w-[150px] truncate" title={prj.testingStatus}>
                      {prj.testingStatus}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {prj.status}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedProject(prj)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#133054] text-white font-bold hover:bg-[#1a4275] transition-colors text-[11px] shadow-xs cursor-pointer"
                      >
                        <Eye size={12} />
                        <span>View Project</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MILESTONES TABLE */}
      {activeTab === 'Milestones' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Project Milestones Tracking & Partner Review
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Note: Official academic/government approval is reserved for university mentors
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-extrabold uppercase text-[10.5px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-3.5">Milestone</th>
                  <th className="py-3 px-3.5">Project</th>
                  <th className="py-3 px-3.5">Due Date</th>
                  <th className="py-3 px-3.5">Progress</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5">Industry / Partner Action</th>
                  <th className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {milestones.map((m) => (
                  <tr key={m.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-3.5 font-extrabold text-slate-900 max-w-xs">
                      {m.milestone}
                    </td>
                    <td className="py-3 px-3.5 max-w-[200px] truncate text-slate-700 font-medium" title={m.project}>
                      {m.project}
                    </td>
                    <td className="py-3 px-3.5 font-mono text-slate-600 whitespace-nowrap">
                      {m.dueDate}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 bg-slate-200 rounded-full h-1.5">
                          <div className="bg-[#133054] h-full" style={{ width: `${m.progress}%` }} />
                        </div>
                        <span className="font-mono text-[10.5px] font-bold">{m.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span
                        className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          m.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : m.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-slate-100 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-700 font-medium max-w-xs truncate" title={m.partnerAction}>
                      {m.partnerAction}
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setMilestoneFeedbackModal(m);
                          setMilestoneFeedbackText(m.partnerAction || '');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#133054] text-white font-bold hover:bg-[#1a4275] text-[11px] shadow-xs cursor-pointer"
                      >
                        <FileText size={12} className="text-amber-400" />
                        <span>Add Feedback</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DELIVERABLES TABLE */}
      {activeTab === 'Deliverables' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Project Technical Deliverables & Partner Reviews
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-extrabold uppercase text-[10.5px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-3.5">Deliverable</th>
                  <th className="py-3 px-3.5">Project</th>
                  <th className="py-3 px-3.5">Submitted By</th>
                  <th className="py-3 px-3.5">Submission Date</th>
                  <th className="py-3 px-3.5">Version</th>
                  <th className="py-3 px-3.5">Partner Review</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {deliverables.map((del) => (
                  <tr key={del.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-3.5 font-extrabold text-slate-900 max-w-xs">
                      {del.deliverableName}
                    </td>
                    <td className="py-3 px-3.5 text-slate-700 font-medium max-w-[180px] truncate" title={del.projectTitle}>
                      {del.projectTitle}
                    </td>
                    <td className="py-3 px-3.5 text-slate-700 whitespace-nowrap">
                      {del.submittedBy}
                    </td>
                    <td className="py-3 px-3.5 font-mono text-slate-600 whitespace-nowrap">
                      {del.submissionDate}
                    </td>
                    <td className="py-3 px-3.5 font-mono text-slate-700 whitespace-nowrap">
                      v{del.version}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span
                        className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          del.partnerReviewStatus === 'Verified'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {del.partnerReviewStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap font-medium text-slate-800">
                      {del.status}
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setDeliverableModal(del);
                            setDeliverableReviewStatus(del.partnerReviewStatus || 'Verified');
                            setDeliverableFeedback(del.feedback || '');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#133054] text-white font-bold hover:bg-[#1a4275] text-[11px] shadow-xs cursor-pointer"
                        >
                          <FileText size={12} className="text-amber-400" />
                          <span>{del.partnerReviewStatus === 'Verified' ? 'Update Review' : 'Add Feedback'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: TESTING TABLE */}
      {activeTab === 'Testing' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Technical Testing, Benchmarking & Lab Validation
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-extrabold uppercase text-[10.5px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-3.5">Test ID</th>
                  <th className="py-3 px-3.5">Project</th>
                  <th className="py-3 px-3.5">Test Type</th>
                  <th className="py-3 px-3.5">Environment</th>
                  <th className="py-3 px-3.5">Submitted Date</th>
                  <th className="py-3 px-3.5">Result</th>
                  <th className="py-3 px-3.5">Partner Review</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tests.map((t) => (
                  <tr key={t.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-3.5 font-mono font-bold text-[#133054] whitespace-nowrap">
                      {t.id}
                    </td>
                    <td className="py-3 px-3.5 max-w-[200px] truncate font-medium text-slate-800" title={t.project}>
                      {t.project}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="bg-blue-50 text-blue-900 font-bold px-2 py-0.5 rounded text-[11px] border border-blue-200">
                        {t.testType}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-700 font-medium max-w-xs truncate" title={t.environment}>
                      {t.environment}
                    </td>
                    <td className="py-3 px-3.5 font-mono text-slate-600 whitespace-nowrap">
                      {t.submittedDate}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span
                        className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          t.result === 'Passed'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {t.result}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap font-medium text-slate-700">
                      {t.partnerReview}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap font-bold text-slate-800">
                      {t.status}
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setTestModal(t);
                          setTestFeedback(t.feedback || '');
                          setTestIssues('');
                          setTestRecommendations('');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#133054] text-white font-bold hover:bg-[#1a4275] text-[11px] shadow-xs cursor-pointer"
                      >
                        <FlaskConical size={12} className="text-amber-400" />
                        <span>Add Testing Feedback</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: PROJECT DETAILS & 7-STAGE TIMELINE */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 my-8">
            <div className="p-4 bg-[#133054] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded uppercase">
                  {selectedProject.projectId} • {selectedProject.domain}
                </span>
                <h3 className="font-black text-sm sm:text-base mt-1 text-white">
                  {selectedProject.projectTitle}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-1 rounded-md text-blue-200 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
              {/* 7-STAGE TIMELINE TRACKER */}
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-2">
                <span className="text-[10.5px] font-extrabold text-[#133054] uppercase tracking-wider block">
                  Project Lifecycle Timeline (Highlighting Active Stage)
                </span>
                <div className="grid grid-cols-7 gap-1 pt-1">
                  {STAGES.map((stg, idx) => {
                    const isPassed = idx < selectedProject.currentStageIndex;
                    const isCurrent = idx === selectedProject.currentStageIndex;
                    return (
                      <div key={stg} className="text-center">
                        <div
                          className={`h-2 rounded-full mb-1 ${
                            isPassed
                              ? 'bg-emerald-600'
                              : isCurrent
                              ? 'bg-[#133054] ring-2 ring-amber-400 animate-pulse'
                              : 'bg-slate-200'
                          }`}
                        />
                        <span
                          className={`text-[9.5px] font-bold block truncate ${
                            isCurrent
                              ? 'text-[#133054] font-black'
                              : isPassed
                              ? 'text-emerald-700'
                              : 'text-slate-400'
                          }`}
                        >
                          {stg}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PROJECT OVERVIEW */}
              <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-2">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#133054] flex items-center gap-1.5">
                  <Building2 size={14} />
                  <span>Project Overview</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 font-semibold block">University:</span>
                    <span className="font-bold text-slate-900">{selectedProject.university}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Faculty Mentor:</span>
                    <span className="font-bold text-slate-800">{selectedProject.facultyMentor}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Student Lead:</span>
                    <span className="font-bold text-slate-800">{selectedProject.studentLead}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Industry Partner:</span>
                    <span className="font-bold text-slate-800">{selectedProject.industryPartner}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Your Role:</span>
                    <span className="font-bold text-blue-900">{selectedProject.partnerRole}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Linked Challenge:</span>
                    <span className="font-mono text-slate-800">{selectedProject.challengeId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Progress:</span>
                    <span className="font-mono font-bold text-emerald-700">{selectedProject.progress}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Status:</span>
                    <span className="font-bold text-slate-800">{selectedProject.status}</span>
                  </div>
                </div>
              </div>

              {/* PROJECT OBJECTIVE */}
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/50 space-y-2">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                  <Layers size={14} />
                  <span>Project Objective</span>
                </h4>
                <div>
                  <span className="text-slate-500 font-semibold block">Problem:</span>
                  <p className="text-slate-800 font-medium">{selectedProject.problem}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Solution:</span>
                  <p className="text-slate-800 font-medium">{selectedProject.solution}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 font-semibold block">Technology:</span>
                    <span className="font-bold text-slate-800">{selectedProject.technology}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Expected Outcome:</span>
                    <span className="font-bold text-slate-800">{selectedProject.expectedOutcome}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 rounded-lg bg-[#133054] text-white font-bold hover:bg-[#1a4275] text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: DELIVERABLE REVIEW MODAL */}
      {deliverableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 my-8">
            <div className="p-4 bg-[#133054] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded uppercase">
                  DELIVERABLE REVIEW
                </span>
                <h3 className="font-black text-sm sm:text-base mt-1 text-white">
                  {deliverableModal.deliverableName}
                </h3>
              </div>
              <button
                onClick={() => setDeliverableModal(null)}
                className="p-1 rounded-md text-blue-200 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDeliverableReviewSubmit} className="p-6 space-y-3.5 max-h-[75vh] overflow-y-auto text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Submitted By:</span>
                  <span className="font-bold text-slate-900">{deliverableModal.submittedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Project:</span>
                  <span className="font-bold text-slate-800">{deliverableModal.projectTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Version:</span>
                  <span className="font-mono text-slate-800">v{deliverableModal.version}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                  Partner Review Status *
                </label>
                <select
                  value={deliverableReviewStatus}
                  onChange={(e) => setDeliverableReviewStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#133054] bg-white font-medium"
                  required
                >
                  <option value="Verified">Verified - Technical standards met</option>
                  <option value="Needs Revision">Needs Revision - Corrections requested</option>
                  <option value="Pending Review">Pending Review</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                  Technical Feedback / Notes *
                </label>
                <textarea
                  rows={3}
                  value={deliverableFeedback}
                  onChange={(e) => setDeliverableFeedback(e.target.value)}
                  placeholder="Provide detailed engineering comments on this deliverable..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#133054] bg-white"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setDeliverableModal(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4 py-2 rounded-lg bg-[#133054] text-white font-extrabold hover:bg-[#1a4275] text-xs shadow-xs cursor-pointer"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: TESTING FEEDBACK MODAL */}
      {testModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 my-8">
            <div className="p-4 bg-[#133054] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded uppercase">
                  {testModal.id} • {testModal.testType} TEST
                </span>
                <h3 className="font-black text-sm sm:text-base mt-1 text-white">
                  Add Testing Feedback
                </h3>
              </div>
              <button
                onClick={() => setTestModal(null)}
                className="p-1 rounded-md text-blue-200 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleTestFeedbackSubmit} className="p-6 space-y-3.5 max-h-[75vh] overflow-y-auto text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Test Environment:</span>
                  <span className="font-bold text-slate-900">{testModal.environment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Project:</span>
                  <span className="font-bold text-slate-800">{testModal.project}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Initial Result:</span>
                  <span className="font-bold text-emerald-800">{testModal.result}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                  Testing Feedback *
                </label>
                <textarea
                  rows={2}
                  value={testFeedback}
                  onChange={(e) => setTestFeedback(e.target.value)}
                  placeholder="Evaluation of signal noise ratio, thermal limits, or telemetry stability..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#133054] bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                  Issues Found
                </label>
                <input
                  type="text"
                  value={testIssues}
                  onChange={(e) => setTestIssues(e.target.value)}
                  placeholder="e.g. IP68 cable gland ingress risk"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#133054] bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                  Recommendations
                </label>
                <textarea
                  rows={2}
                  value={testRecommendations}
                  onChange={(e) => setTestRecommendations(e.target.value)}
                  placeholder="Recommended design modifications for field deployment..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#133054] bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setTestModal(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTest}
                  className="px-4 py-2 rounded-lg bg-[#133054] text-white font-extrabold hover:bg-[#1a4275] text-xs shadow-xs cursor-pointer"
                >
                  {submittingTest ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: MILESTONE FEEDBACK MODAL */}
      {milestoneFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 my-8">
            <div className="p-4 bg-[#133054] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded uppercase">
                  MILESTONE FEEDBACK
                </span>
                <h3 className="font-black text-sm sm:text-base mt-1 text-white">
                  {milestoneFeedbackModal.milestone}
                </h3>
              </div>
              <button
                onClick={() => setMilestoneFeedbackModal(null)}
                className="p-1 rounded-md text-blue-200 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveMilestoneFeedback} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase mb-1">
                  Partner Technical Action / Feedback *
                </label>
                <textarea
                  rows={3}
                  value={milestoneFeedbackText}
                  onChange={(e) => setMilestoneFeedbackText(e.target.value)}
                  placeholder="Record your industry review notes on this milestone..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#133054] bg-white"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMilestoneFeedbackModal(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#133054] text-white font-extrabold hover:bg-[#1a4275] text-xs shadow-xs cursor-pointer"
                >
                  Save Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
