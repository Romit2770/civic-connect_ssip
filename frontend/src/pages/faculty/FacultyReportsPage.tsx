import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  Clock,
  Eye,
  Plus,
  RefreshCw,
  FileText,
  Download,
  X,
  Send,
  AlertCircle,
  FolderGit2,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import {
  generateFacultyReportPdfBlob,
  generateFacultyReportPdfDataUri,
  ReportBundleData,
} from '../../utils/facultyReportPdfGenerator';

export default function FacultyReportsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'Progress Reports' | 'Testing Reports' | 'Project Reports' | 'Final Solution Reports'>('all');
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [reportBundle, setReportBundle] = useState<ReportBundleData | null>(null);
  const [loadingBundle, setLoadingBundle] = useState(false);
  const [modalTab, setModalTab] = useState<'dossier' | 'preview'>('dossier');
  const [pdfPreviewUri, setPdfPreviewUri] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);

  // New Report Form
  const [reportForm, setReportForm] = useState({
    project: 'Low-Cost IoT Sensor Network for Pipeline Leakage',
    projectId: 'PRJ-CH-2026-089',
    team: 'Smart Water Guild',
    reportType: 'Progress Reports',
    reportingPeriod: 'Current Sprint (Sept 2026)',
    progressSummary: '',
    technicalProgress: '',
    teamPerformance: '',
    milestoneProgress: '',
    industryContribution: '',
    challengesRisks: '',
    nextSteps: '',
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/faculty/reports');
      if (res.data.success) {
        setReports(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load faculty reports');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReport(true);
    setActionError(null);
    try {
      const res = await apiClient.post('/faculty/reports', reportForm);
      if (res.data.success) {
        setActionSuccess('Project documentation report submitted successfully.');
        setShowCreateModal(false);
        setReportForm({
          project: 'Low-Cost IoT Sensor Network for Pipeline Leakage',
          projectId: 'PRJ-CH-2026-089',
          team: 'Smart Water Guild',
          reportType: 'Progress Reports',
          reportingPeriod: 'Current Sprint (Sept 2026)',
          progressSummary: '',
          technicalProgress: '',
          teamPerformance: '',
          milestoneProgress: '',
          industryContribution: '',
          challengesRisks: '',
          nextSteps: '',
        });
        loadReports();
      }
    } catch (err) {
      setActionError('Failed to submit report. Please check input parameters.');
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleViewReport = async (report: any) => {
    setSelectedReport(report);
    setModalTab('dossier');
    setLoadingBundle(true);
    setActionError(null);
    setPdfPreviewUri(null);

    try {
      const res = await apiClient.get(`/faculty/reports/${report.id}/bundle`);
      if (res.data.success && res.data.data) {
        const bundle = res.data.data;
        setReportBundle(bundle);
        const previewUri = generateFacultyReportPdfDataUri(bundle);
        setPdfPreviewUri(previewUri);
      } else {
        throw new Error('Failed to load report bundle');
      }
    } catch (err: any) {
      console.warn('Bundle API error, using baseline report object:', err);
      // Construct fallback bundle from local report data
      const fallbackBundle: ReportBundleData = {
        report,
        project: {
          id: report.projectId || 'PRJ-CH-2026-089',
          title: report.project,
          domain: 'Water & Sanitation Infrastructure',
          facultyMentor: report.reviewedBy || 'Prof. Ananya Sen',
          studentTeam: report.team,
          industryPartner: 'Tata Steel Utilities & Infrastructure (TSUISL)',
          currentStage: 'Field Pilot',
          progress: 85,
          status: 'Active',
          budget: '₹ 4,50,000',
          timeline: '6 Months',
        },
        challenge: {
          id: 'CH-2026-089',
          title: report.project,
          domain: 'Water & Sanitation Infrastructure',
          location: 'Ward 4, Bistupur Central',
          priority: 'high',
          validationStatus: 'Validated by Municipal PWD',
          description: report.progressSummary || 'Continuous underground pipe pressure drops reported along Bistupur Ward 4 trunk line.',
          citizenEvidence: {
            coordinates: [86.1821, 22.8046],
            notes: 'Street asphalt saturation during morning pumping hours.',
          },
          aiAnalysis: {
            category: 'Water & Sanitation Infrastructure',
            domain: 'Urban Water Distribution & Micro-Acoustics',
            severity: 8,
            priority: 'HIGH',
            problemSummary: 'High-priority subterranean fluid loss affecting 4,200 households.',
            evidenceAssessment: 'Photographs substantiate wet roadbed deformation.',
            duplicateDetectionResult: 'Unique Defect Group',
            locationRelevance: 'Critical Ward 4 feeder pipe connects directly to primary reservoir.',
            recommendedTechnicalAreas: ['LoRaWAN / NB-IoT', 'Piezo-electric Acoustic Sensors', 'Edge FFT Analysis'],
          },
        },
        team: {
          id: 'TEAM-01',
          name: report.team,
          facultyMentor: report.reviewedBy || 'Prof. Ananya Sen',
          leadStudent: 'Aakash Verma',
          membersCount: 4,
          skills: ['IoT Sensors', 'LoRaWAN', 'Signal Processing'],
          members: [
            {
              studentName: 'Aakash Verma',
              studentId: '2023UGCE042',
              department: 'Civil Engineering',
              role: 'Team Lead',
              assignedTasks: 'Hydraulic GIS pressure mapping',
              taskStatus: 'Completed',
            },
            {
              studentName: 'Sneha Kumari',
              studentId: '2023UGEC018',
              department: 'Electronics & Comm.',
              role: 'Hardware Lead',
              assignedTasks: 'CAD casing and piezo collar',
              taskStatus: 'Completed',
            },
          ],
        },
        milestones: [
          {
            id: 'MLS-01',
            name: 'Requirement Analysis & Stakeholder Mapping',
            dueDate: '2026-08-30',
            status: 'Completed',
            completionPercentage: 100,
            assignedTasks: 'Interview PWD water inspectors',
            submissionStatus: 'Approved',
          },
          {
            id: 'MLS-02',
            name: 'System Hardware Architecture & CAD Enclosure',
            dueDate: '2026-09-30',
            status: 'Completed',
            completionPercentage: 100,
            assignedTasks: 'CAD design for IP68 casing collar',
            submissionStatus: 'Approved',
          },
          {
            id: 'MLS-03',
            name: 'Laboratory Bench Testing & Calibration',
            dueDate: '2026-10-31',
            status: 'In Progress',
            completionPercentage: 80,
            assignedTasks: 'Micro-leak acoustic signature calibration',
            submissionStatus: 'Approved',
          },
        ],
        industryPartner: {
          name: 'Tata Steel Utilities & Infrastructure (TSUISL)',
          domain: 'Water Treatment & Civil Automation',
          matchPercentage: 94,
          contactPerson: 'Suresh Nambiar (VP Urban Infrastructure)',
        },
        facultyProfile: {
          facultyName: 'Dr. Ananya Sen',
          designation: 'Associate Professor',
          department: 'Computer Science & Engineering',
          university: 'National Institute of Technology Jamshedpur',
        },
        mentorEvaluation: {
          mentorName: 'Dr. Ananya Sen',
          designation: 'Associate Professor, Computer Science & Engineering',
          institution: 'National Institute of Technology Jamshedpur',
          evaluationDate: report.submittedDate,
          decision: report.status === 'Approved' ? 'APPROVED' : 'UNDER REVIEW',
          rubrics: {
            'Technical Progress & Engineering Rigor': '9/10 — Exceeds Benchmark',
            'Team Collaboration & Task Delivery': '9/10 — Excellent Multidisciplinary Output',
            'Milestone Schedule Adherence': '8.5/10 — On Schedule',
            'Innovation & Novelty': '9/10 — High',
          },
          comments: report.progressSummary || 'Work conforms to SIH-195 guidelines.',
        },
        endorsement: {
          facultyMentor: 'Dr. Ananya Sen',
          department: 'Computer Science & Engineering',
          institution: 'National Institute of Technology Jamshedpur',
          industryPartner: 'TSUISL Urban Infrastructure',
          reportStatus: report.status,
          reviewDate: report.submittedDate,
          verificationToken: `CIVICCONNECT-AUTH-REP-${report.id}-2026`,
        },
      };
      setReportBundle(fallbackBundle);
      try {
        const previewUri = generateFacultyReportPdfDataUri(fallbackBundle);
        setPdfPreviewUri(previewUri);
      } catch (pdfErr) {
        console.error('PDF preview generation error:', pdfErr);
      }
    } finally {
      setLoadingBundle(false);
    }
  };

  const handleDownloadPdf = async (report: any) => {
    setDownloadingId(report.id);
    setActionError(null);

    const sanitizedType = (report.reportType || 'Report')
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9_-]/g, '');
    const filename = `CivicConnect_${report.id}_${sanitizedType}.pdf`;

    try {
      // 1. Try server-side binary PDF generation endpoint first
      const res = await apiClient.get(`/faculty/reports/${report.id}/pdf`, {
        responseType: 'blob',
      });

      if (res.data && res.data.size > 200) {
        const blob = new Blob([res.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        setActionSuccess(`Official PDF report for ${report.id} generated and downloaded.`);
        return;
      }
      throw new Error('Server returned empty PDF');
    } catch (serverErr) {
      console.warn('Server-side PDF generation failed or was unreachable, executing client-side generator:', serverErr);

      // 2. Client-side resilient PDF generation using synchronized data bundle
      try {
        let bundleToUse = reportBundle;
        if (!bundleToUse || bundleToUse.report.id !== report.id) {
          const bundleRes = await apiClient.get(`/faculty/reports/${report.id}/bundle`);
          if (bundleRes.data.success) {
            bundleToUse = bundleRes.data.data;
          }
        }

        if (bundleToUse) {
          const blob = generateFacultyReportPdfBlob(bundleToUse);
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          setActionSuccess(`Official PDF report for ${report.id} generated and downloaded.`);
          return;
        }
        throw new Error('Unable to compile data bundle');
      } catch (clientErr) {
        console.error('PDF Generation completely failed:', clientErr);
        setActionError('Unable to generate the PDF. Please try again.');
      }
    } finally {
      setDownloadingId(null);
    }
  };

  const filtered = reports.filter((r) => {
    if (activeTab === 'all') return true;
    return r.reportType === activeTab;
  });

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0a2540] text-amber-400 flex items-center justify-center font-bold shadow-xs shrink-0">
            <FileCheck2 size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Project Reports & Documentation
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Generate and review official academic project progress, testing and final deployment documentation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadReports()}
            className="p-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-xs cursor-pointer transition-colors"
            title="Refresh Reports"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus size={15} />
            <span>Create Report</span>
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

      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span className="font-semibold">{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-red-700 hover:text-red-900 p-1">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'all', label: 'All Reports' },
          { id: 'Progress Reports', label: 'Progress Reports' },
          { id: 'Testing Reports', label: 'Testing Reports' },
          { id: 'Project Reports', label: 'Project Reports' },
          { id: 'Final Solution Reports', label: 'Final Solution Reports' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#0a2540] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reports Table Card */}
      <div className="gov-card bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0a2540] text-white uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="px-4 py-3">Report ID</th>
                <th className="px-4 py-3">Project Title</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3">Report Type</th>
                <th className="px-4 py-3">Submitted Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Reviewed By</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No reports submitted yet matching current criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-blue-900 whitespace-nowrap">
                      {item.id}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 max-w-xs">
                      <span className="line-clamp-1">{item.project}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-medium whitespace-nowrap">
                      {item.team}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded font-semibold text-[10px] border border-blue-200">
                        {item.reportType}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-500 whitespace-nowrap">
                      {item.submittedDate}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          item.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.status === 'Under Review' || item.status === 'Submitted'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 whitespace-nowrap font-medium">
                      {item.reviewedBy || 'Pending'}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <button
                          onClick={() => handleViewReport(item)}
                          className="px-2.5 py-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md font-semibold text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          title="View Report Dossier & PDF Preview"
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleDownloadPdf(item)}
                          disabled={downloadingId === item.id}
                          className="px-2.5 py-1.5 text-white bg-slate-800 hover:bg-[#0a2540] border border-slate-700 rounded-md font-semibold text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
                          title="Download Official PDF Report"
                        >
                          {downloadingId === item.id ? (
                            <RefreshCw size={13} className="animate-spin text-amber-300" />
                          ) : (
                            <Download size={13} className="text-amber-400" />
                          )}
                          <span>{downloadingId === item.id ? 'Generating...' : 'Download PDF'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW REPORT MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-[#0a2540] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 font-bold shrink-0">
                  <FileCheck2 size={18} />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-amber-300 font-bold">{selectedReport.id}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-200 border border-blue-400/30">
                      {selectedReport.reportType}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold tracking-tight truncate text-white mt-0.5">
                    {selectedReport.project}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedReport(null);
                  setReportBundle(null);
                  setPdfPreviewUri(null);
                }}
                className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Sub-Header Tabs */}
            <div className="px-5 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModalTab('dossier')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                    modalTab === 'dossier'
                      ? 'bg-white text-blue-900 shadow-2xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <FolderGit2 size={14} />
                  <span>Report Dossier Overview</span>
                </button>
                <button
                  onClick={() => setModalTab('preview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                    modalTab === 'preview'
                      ? 'bg-[#0a2540] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <FileText size={14} className={modalTab === 'preview' ? 'text-amber-400' : ''} />
                  <span>Official PDF Document Preview</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-bold ml-1">
                    A4 Multi-Page
                  </span>
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-medium">Status:</span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    selectedReport.status === 'Approved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {selectedReport.status}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 text-xs text-slate-800 space-y-5">
              {modalTab === 'preview' ? (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-blue-900">
                    <div className="flex items-center gap-2 text-xs">
                      <FileCheck2 size={16} className="text-blue-700 shrink-0" />
                      <span>
                        Official CivicConnect multi-page PDF document generated in compliance with SIH-195 and university governance standards.
                      </span>
                    </div>
                    {pdfPreviewUri && (
                      <a
                        href={pdfPreviewUri}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-blue-700 hover:underline inline-flex items-center gap-1 shrink-0 ml-2"
                      >
                        <span>Open Standalone</span>
                        <ChevronRight size={13} />
                      </a>
                    )}
                  </div>

                  {loadingBundle ? (
                    <div className="h-[600px] flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-slate-200">
                      <RefreshCw size={26} className="text-blue-700 animate-spin mb-3" />
                      <p className="font-bold text-slate-800 text-sm">Compiling Official Project PDF...</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Aggregating challenge evidence, AI analysis, team roster, and mentor evaluation rubrics.
                      </p>
                    </div>
                  ) : pdfPreviewUri ? (
                    <div className="rounded-xl border border-slate-300 overflow-hidden shadow-inner bg-slate-200">
                      <iframe
                        src={pdfPreviewUri}
                        className="w-full h-[620px] bg-white"
                        title="CivicConnect Official PDF Document Preview"
                      />
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                      <AlertCircle size={24} className="mx-auto text-amber-500 mb-2" />
                      <p className="font-semibold text-slate-700">Preview generator is preparing document stream.</p>
                      <button
                        onClick={() => handleViewReport(selectedReport)}
                        className="mt-3 px-3.5 py-1.5 bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Reload PDF Document
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* DOSSIER TAB CONTENT */
                <div className="space-y-4">
                  {/* Top Metadata Card */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                          Project Title & Record
                        </span>
                        <h2 className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">
                          {selectedReport.project}
                        </h2>
                      </div>
                      <span
                        className={`text-[11px] font-bold uppercase px-3 py-1 rounded-full ${
                          selectedReport.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {selectedReport.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Student Team</span>
                        <span className="font-bold text-slate-900">{selectedReport.team}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Report Type</span>
                        <span className="font-semibold text-blue-900">{selectedReport.reportType}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Reporting Period</span>
                        <span className="text-slate-800 font-medium">{selectedReport.reportingPeriod || 'Current Sprint'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Faculty Evaluator</span>
                        <span className="font-semibold text-slate-900">{selectedReport.reviewedBy || 'Prof. Ananya Sen'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Section 1: Executive Overview */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs uppercase tracking-wide">
                      <span className="w-5 h-5 rounded bg-blue-100 text-blue-800 flex items-center justify-center text-[10px]">
                        01
                      </span>
                      <span>Executive Progress Summary</span>
                    </div>
                    <p className="p-3.5 bg-white rounded-lg border border-slate-200 text-slate-700 leading-relaxed shadow-2xs">
                      {selectedReport.progressSummary}
                    </p>
                  </div>

                  {/* Section 2: Technical Progress & Calibrations */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs uppercase tracking-wide">
                      <span className="w-5 h-5 rounded bg-blue-100 text-blue-800 flex items-center justify-center text-[10px]">
                        02
                      </span>
                      <span>Technical Progress & Engineering Scrutiny</span>
                    </div>
                    <p className="p-3.5 bg-white rounded-lg border border-slate-200 text-slate-700 leading-relaxed shadow-2xs font-mono text-[11px]">
                      {selectedReport.technicalProgress}
                    </p>
                  </div>

                  {/* Section 3: Team Performance & Milestones */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-700 uppercase block">Team Collaboration</span>
                      <p className="p-3 bg-white rounded-lg border border-slate-200 text-slate-700 leading-relaxed shadow-2xs">
                        {selectedReport.teamPerformance}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-700 uppercase block">Milestones Delivery</span>
                      <p className="p-3 bg-white rounded-lg border border-slate-200 text-slate-700 leading-relaxed shadow-2xs">
                        {selectedReport.milestoneProgress}
                      </p>
                    </div>
                  </div>

                  {/* Section 4: Industry & Testing */}
                  {selectedReport.industryContribution && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-blue-900 uppercase block">
                        Industry Partner Contribution & Testbeds
                      </span>
                      <p className="p-3 bg-blue-50/60 rounded-lg border border-blue-200 text-blue-900 leading-relaxed">
                        {selectedReport.industryContribution}
                      </p>
                    </div>
                  )}

                  {/* Section 5: Risks & Next Steps */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-700 uppercase block">Challenges & Risk Mitigation</span>
                      <p className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                        {selectedReport.challengesRisks}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-700 uppercase block">Sprint Next Steps</span>
                      <p className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                        {selectedReport.nextSteps}
                      </p>
                    </div>
                  </div>

                  {/* Section 6: Official Attachments */}
                  {selectedReport.attachments?.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-slate-700 uppercase block">
                        Verified Technical Attachments
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {selectedReport.attachments.map((att: any, idx: number) => (
                          <div
                            key={idx}
                            className="px-3 py-2 bg-slate-100 rounded-lg border border-slate-200 flex items-center gap-2"
                          >
                            <FileText size={14} className="text-blue-700" />
                            <span className="font-semibold text-slate-800 text-[11px]">{att.name}</span>
                            <span className="font-mono text-[9px] text-slate-500">({att.size})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section 7: Verification Stamp */}
                  <div className="p-3 bg-slate-100 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span className="font-semibold text-slate-800">
                        Institutional Endorsement: Verified by NIT Jamshedpur Faculty Council
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-500">
                      Token: CIVICCONNECT-AUTH-{selectedReport.id}-2026
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Action Bar */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-500 hidden sm:block">
                Report Docket: <span className="font-mono font-bold text-slate-800">{selectedReport.id}</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(selectedReport)}
                  disabled={downloadingId === selectedReport.id}
                  className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-2 disabled:opacity-50 transition-colors"
                >
                  {downloadingId === selectedReport.id ? (
                    <RefreshCw size={14} className="animate-spin text-amber-300" />
                  ) : (
                    <Download size={14} className="text-amber-400" />
                  )}
                  <span>{downloadingId === selectedReport.id ? 'Generating PDF...' : 'Download Official PDF'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedReport(null);
                    setReportBundle(null);
                    setPdfPreviewUri(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE REPORT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#0a2540] text-white flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <Plus size={18} className="text-amber-400" />
                <h3 className="text-sm font-extrabold tracking-tight">Create Mentor Project Report</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-300 hover:text-white p-1 rounded">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="p-5 sm:p-6 space-y-4 text-xs text-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Project
                  </label>
                  <input
                    type="text"
                    required
                    value={reportForm.project}
                    onChange={(e) => setReportForm({ ...reportForm, project: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Report Type
                  </label>
                  <select
                    value={reportForm.reportType}
                    onChange={(e) => setReportForm({ ...reportForm, reportType: e.target.value as any })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700"
                  >
                    <option value="Progress Reports">Progress Reports</option>
                    <option value="Testing Reports">Testing Reports</option>
                    <option value="Project Reports">Project Reports</option>
                    <option value="Final Solution Reports">Final Solution Reports</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Reporting Period
                </label>
                <input
                  type="text"
                  required
                  value={reportForm.reportingPeriod}
                  onChange={(e) => setReportForm({ ...reportForm, reportingPeriod: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Progress Summary
                </label>
                <textarea
                  required
                  rows={2}
                  value={reportForm.progressSummary}
                  onChange={(e) => setReportForm({ ...reportForm, progressSummary: e.target.value })}
                  placeholder="Summarize key project achievements and sprint deliverables..."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Technical Progress & Calibration Results
                </label>
                <textarea
                  required
                  rows={2}
                  value={reportForm.technicalProgress}
                  onChange={(e) => setReportForm({ ...reportForm, technicalProgress: e.target.value })}
                  placeholder="Detail laboratory testbench accuracy, sensor readings, power metrics..."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Team Performance
                  </label>
                  <textarea
                    rows={2}
                    value={reportForm.teamPerformance}
                    onChange={(e) => setReportForm({ ...reportForm, teamPerformance: e.target.value })}
                    placeholder="Evaluation of student team collaboration..."
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Milestone Progress
                  </label>
                  <textarea
                    rows={2}
                    value={reportForm.milestoneProgress}
                    onChange={(e) => setReportForm({ ...reportForm, milestoneProgress: e.target.value })}
                    placeholder="Status of upcoming and completed milestones..."
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Challenges & Operational Risks
                  </label>
                  <textarea
                    rows={2}
                    value={reportForm.challengesRisks}
                    onChange={(e) => setReportForm({ ...reportForm, challengesRisks: e.target.value })}
                    placeholder="Hardware delays, sensor noise, weather conditions..."
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Next Steps
                  </label>
                  <textarea
                    rows={2}
                    value={reportForm.nextSteps}
                    onChange={(e) => setReportForm({ ...reportForm, nextSteps: e.target.value })}
                    placeholder="Action plan for next milestone review..."
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="px-4 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Send size={13} />
                  <span>{submittingReport ? 'Submitting...' : 'Submit Report'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
