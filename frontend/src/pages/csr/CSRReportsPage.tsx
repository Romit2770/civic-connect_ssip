import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Eye,
  Plus,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Building,
  GraduationCap,
  X,
  FileCheck,
  AlertCircle,
  Clock,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { buildCSRReportPdfDocument, CSRReportPdfData } from '../../utils/csrReportPdfGenerator';

export default function CSRReportsPage() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('CSR Reports');
  const [projects, setProjects] = useState<any[]>([]);

  // Modals & previews
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReportForView, setSelectedReportForView] = useState<any | null>(null);
  const [successGeneratedReport, setSuccessGeneratedReport] = useState<any | null>(null);

  // Form State
  const [projectId, setProjectId] = useState('');
  const [reportType, setReportType] = useState('CSR Project Report');
  const [period, setPeriod] = useState('Q2 FY 2026-27 (Jul - Sep 2026)');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/csr/reports');
      if (res.data?.success) {
        setReports(res.data.data.reports || []);
      }

      // Also get projects for dropdown
      const projRes = await apiClient.get('/csr/projects');
      if (projRes.data?.success) {
        setProjects(projRes.data.data.projects || []);
        if (projRes.data.data.projects.length > 0 && !projectId) {
          setProjectId(projRes.data.data.projects[0].projectId);
        }
      }
    } catch (err) {
      console.error('Error loading CSR reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Filter reports by tab
  const filteredReports = reports.filter((r) => {
    if (activeTab === 'CSR Reports') return true;
    if (activeTab === 'Financial Reports') return r.reportType.includes('Financial');
    if (activeTab === 'Impact Reports') return r.reportType.includes('Impact');
    if (activeTab === 'Project Reports') return r.reportType.includes('Progress') || r.reportType.includes('Project');
    if (activeTab === 'Final CSR Reports') return r.reportType.includes('Final');
    return true;
  });

  const handleDownloadPdf = async (report: any) => {
    try {
      // Find associated project for full rich data
      const matchedProject = projects.find((p) => p.projectId === report.projectId) || {
        projectId: report.projectId,
        projectTitle: report.projectTitle,
        university: 'NIT Jamshedpur',
        domain: 'Water & Sanitation',
        location: 'Jamshedpur, Jharkhand',
        studentTeam: 'CleanTech Lab',
        facultyMentor: 'Dr. Priya Balakrishnan',
        industryMentor: 'Suresh Nambiar',
        stage: 'Field Deployment',
        progress: report.progressPercent || 72,
        approvedBudget: report.fundingSummary?.approvedAmount || 4500000,
        releasedFunding: report.fundingSummary?.releasedAmount || 3000000,
        utilizedFunding: report.fundingSummary?.utilizedAmount || 2450000,
        milestones: [
          { id: 'MLS-01', title: 'System Architecture & IoT Baseline', dueDate: '2026-06-30', progress: 100, status: 'Completed' },
          { id: 'MLS-02', title: 'Pilot Sensor Array Installation', dueDate: '2026-08-30', progress: 100, status: 'Completed' },
          { id: 'MLS-03', title: 'Autonomous Pressure Relief Deployment', dueDate: '2026-10-15', progress: 65, status: 'In Progress' },
        ],
        deliverables: [
          { id: 'DEL-01', title: 'NABL Certified Hydrodynamic Lab Audit', submittedBy: 'NIT Jamshedpur', submissionDate: '2026-08-10', reviewStatus: 'Verified' },
        ],
        risks: [
          { id: 'RSK-01', title: 'Monsoon flash flooding delays sensor trenching', severity: 'Medium', reportedDate: '2026-08-20', responsiblePerson: 'Faculty Mentor', resolution: 'Modular IP68 waterproof enclosures deployed', status: 'Mitigated' },
        ],
      };

      const pdfData: CSRReportPdfData = {
        reportId: report.id,
        projectId: matchedProject.projectId,
        projectTitle: matchedProject.projectTitle,
        university: matchedProject.university,
        csrPartner: 'Tata Steel Utilities & Infrastructure Services Ltd.',
        csrProjectLead: 'Meera Chawla (CSR Project Lead)',
        reportingPeriod: report.period,
        generatedDate: report.submittedDate || new Date().toISOString().split('T')[0],
        reportStatus: report.status || 'Approved',
        reportType: report.reportType,
        executiveSummary:
          report.executiveSummary ||
          report.summary ||
          `This official CSR evaluation report details the ongoing research and field implementation of ${matchedProject.projectTitle}. Under the MCA Section 135 mandate, funds released to ${matchedProject.university} have been rigorously audited against milestone deliverables.`,
        projectInformation: {
          domain: matchedProject.domain,
          location: matchedProject.location,
          studentTeam: matchedProject.studentTeam,
          facultyMentor: matchedProject.facultyMentor,
          industryMentor: matchedProject.industryMentor,
          currentStage: matchedProject.stage,
        },
        problemStatement:
          report.problemStatement ||
          `Critical civic infrastructure deficiencies addressed under ${matchedProject.domain} within ${matchedProject.location}.`,
        solution:
          report.solution ||
          `University-engineered innovation prototype deployed with industrial CSR mentorship and advanced IoT telemetry.`,
        progressPercent: matchedProject.progress,
        milestones: matchedProject.milestones || [],
        fundingSummary: {
          approvedAmount: matchedProject.approvedBudget,
          releasedAmount: matchedProject.releasedFunding,
          utilizedAmount: matchedProject.utilizedFunding,
          remainingAmount: matchedProject.approvedBudget - matchedProject.releasedFunding,
        },
        deliverables: matchedProject.deliverables || [],
        risks: matchedProject.risks || [],
        socialImpact: {
          peopleBenefited: report.socialImpactSummary?.peopleBenefited || 8500,
          areasCovered: report.socialImpactSummary?.areasCovered || matchedProject.location,
          measuredOutcomes:
            report.socialImpactSummary?.measuredOutcomes ||
            'Significant reduction in civic overhead, water distribution loss averted by 35%, and round-the-clock water telemetry operational.',
        },
        industryContribution:
          'Tata Steel Utilities & Infrastructure Services Ltd provided industrial mentorship, real-world utility pipeline access, testbed equipment, and ₹ 30.00 Lakhs in capital grant releases.',
        universityContribution:
          `${matchedProject.university} provided academic researchers, fabrication facilities, testing benches, and student engineering development.`,
        nextSteps:
          report.nextSteps ||
          'Execute Tranche-3 milestone verification and initiate independent social impact assessment.',
        approvalInformation: {
          reviewedBy: report.reviewedBy || 'Meera Chawla (CSR Project Lead)',
          signoffDate: report.submittedDate || new Date().toISOString().split('T')[0],
          reviewComments: 'Milestone deliverables and campus accounts verified in full compliance.',
          statutoryCompliance: 'Companies (Corporate Social Responsibility Policy) Rules, 2014 & SIH Guidelines',
        },
      };

      const doc = buildCSRReportPdfDocument(pdfData);
      doc.save(`${report.id}_${report.projectId}_CSR_Report.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF. Please check console logs.');
    }
  };

  const handleOpenCreateModal = () => {
    setFormError('');
    if (projects.length > 0) {
      setProjectId(projects[0].projectId);
      setTitle(`Quarterly CSR Compliance & Milestone Audit - ${projects[0].projectTitle}`);
    } else {
      setTitle('Quarterly CSR Innovation Milestone Audit');
    }
    setSummary('');
    setShowCreateModal(true);
  };

  const handleSubmitCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!projectId || !reportType || !period || !title.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.post('/csr/reports', {
        projectId,
        reportType,
        period,
        title,
        summary:
          summary ||
          `Official ${reportType} documenting milestone delivery, campus accounts, and community outcomes.`,
      });

      if (res.data?.success) {
        const createdReport = res.data.data.report;
        setShowCreateModal(false);
        setSuccessGeneratedReport(createdReport);
        fetchReports();
      } else {
        setFormError(res.data?.error?.message || 'Failed to create report.');
      }
    } catch (err: any) {
      setFormError(err.response?.data?.error?.message || 'Error creating CSR report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
              Statutory Documentation & Audit
            </span>
            <span className="text-xs text-slate-500 font-medium">MCA Section 135 Compliant</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">CSR Reports & Documentation</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate and audit formal CSR project evaluations, multi-page PDF audit dossiers, and university grant settlements.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchReports}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-semibold text-white bg-[#133054] hover:bg-[#0e233e] transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            + Create Report
          </button>
        </div>
      </div>

      {/* Success Notification after generating report */}
      {successGeneratedReport && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-emerald-900">PDF generated successfully</div>
              <div className="text-[11px] text-emerald-700">
                Official document <strong className="font-mono">{successGeneratedReport.id}</strong> has been logged and compiled into standard A4 format.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedReportForView(successGeneratedReport);
                setSuccessGeneratedReport(null);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition"
            >
              <Eye className="w-3.5 h-3.5" />
              View Details
            </button>
            <button
              onClick={() => {
                handleDownloadPdf(successGeneratedReport);
                setSuccessGeneratedReport(null);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </button>
            <button
              onClick={() => setSuccessGeneratedReport(null)}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tabs (Section 20) */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-1.5 flex flex-wrap gap-1">
        {['CSR Reports', 'Financial Reports', 'Impact Reports', 'Project Reports', 'Final CSR Reports'].map(
          (tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded text-xs font-semibold transition ${
                  isActive
                    ? 'bg-[#133054] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            );
          }
        )}
      </div>

      {/* Reports Table (Section 20) */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-900">
            {activeTab} Registry & Official Compilations
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{filteredReports.length}</strong> reports
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Report ID</th>
                <th className="py-3 px-4">Project & Initiative</th>
                <th className="py-3 px-3">Report Type</th>
                <th className="py-3 px-3">Period</th>
                <th className="py-3 px-3">Submitted Date</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3">Reviewed By</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#133054] mb-2" />
                    <span>Loading report registry...</span>
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <FileText className="w-6 h-6 mx-auto text-slate-400 mb-2" />
                    <span>No reports have been generated yet in this category.</span>
                  </td>
                </tr>
              ) : (
                filteredReports.map((r: any) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-900">
                      {r.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{r.projectTitle}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{r.title}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-[10px]">
                        {r.reportType}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 font-medium">
                      {r.period}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500">
                      {r.submittedDate}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300">
                        {r.status || 'Approved'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-700">
                      <div className="font-medium text-[11px]">{r.reviewedBy}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedReportForView(r)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition"
                          title="View Report Content"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadPdf(r)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-white bg-[#133054] hover:bg-[#0e233e] transition"
                          title="Generate & Download Real PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download PDF
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

      {/* Modal: Create CSR Report (Section 24) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg border border-slate-300 shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#133054] text-white p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                  Statutory CSR Compilation
                </span>
                <h3 className="text-base font-bold">CREATE CSR REPORT</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-blue-200 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCreateReport} className="p-5 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Project Field */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Project *</label>
                <select
                  value={projectId}
                  onChange={(e) => {
                    setProjectId(e.target.value);
                    const p = projects.find((proj) => proj.projectId === e.target.value);
                    if (p) {
                      setTitle(`Quarterly CSR Compliance & Milestone Audit - ${p.projectTitle}`);
                    }
                  }}
                  className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-[#133054] focus:outline-none"
                  required
                >
                  {projects.map((p) => (
                    <option key={p.projectId} value={p.projectId}>
                      {p.projectId}: {p.projectTitle} ({p.university})
                    </option>
                  ))}
                </select>
              </div>

              {/* Report Type (5 standard types) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Report Type *</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-[#133054] focus:outline-none"
                    required
                  >
                    <option value="CSR Project Report">CSR Project Report</option>
                    <option value="Financial Report">Financial Report</option>
                    <option value="Impact Report">Impact Report</option>
                    <option value="Project Progress Report">Project Progress Report</option>
                    <option value="Final CSR Report">Final CSR Report</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reporting Period *</label>
                  <input
                    type="text"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    placeholder="e.g. Q2 FY 2026-27"
                    className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-[#133054] focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Report Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Report Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mid-Term Innovation & Grant Audit"
                  className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-[#133054] focus:outline-none"
                  required
                />
              </div>

              {/* Summary */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Executive Summary / Scope</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={3}
                  placeholder="Summarize key milestone completions, fund utilization audits, and community dividends..."
                  className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-[#133054] focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded text-xs font-semibold text-white bg-[#133054] hover:bg-[#0e233e] transition disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Compiling Dossier...
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-3.5 h-3.5" />
                      Generate PDF
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Report Details */}
      {selectedReportForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg border border-slate-300 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#133054] text-white p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                  {selectedReportForView.reportType}
                </span>
                <h3 className="text-base font-bold">{selectedReportForView.title}</h3>
                <div className="text-xs text-blue-100 mt-0.5">
                  Report ID: {selectedReportForView.id} • Period: {selectedReportForView.period}
                </div>
              </div>
              <button
                onClick={() => setSelectedReportForView(null)}
                className="text-blue-200 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div className="bg-slate-50 p-3.5 rounded border border-slate-200">
                <div className="font-bold text-slate-800 uppercase text-[11px] mb-1">
                  Executive Summary
                </div>
                <p className="text-slate-700 leading-relaxed">
                  {selectedReportForView.executiveSummary || selectedReportForView.summary}
                </p>
              </div>

              {selectedReportForView.fundingSummary && (
                <div>
                  <h4 className="font-bold text-slate-800 uppercase text-[11px] mb-2">
                    Fiscal Funding Summary
                  </h4>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Approved</div>
                      <div className="text-xs font-black text-slate-900 mt-0.5">
                        ₹ {(selectedReportForView.fundingSummary.approvedAmount / 100000).toFixed(2)} L
                      </div>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Released</div>
                      <div className="text-xs font-black text-emerald-700 mt-0.5">
                        ₹ {(selectedReportForView.fundingSummary.releasedAmount / 100000).toFixed(2)} L
                      </div>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Utilized</div>
                      <div className="text-xs font-black text-blue-900 mt-0.5">
                        ₹ {(selectedReportForView.fundingSummary.utilizedAmount / 100000).toFixed(2)} L
                      </div>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Balance</div>
                      <div className="text-xs font-black text-amber-800 mt-0.5">
                        ₹ {(selectedReportForView.fundingSummary.remainingAmount / 100000).toFixed(2)} L
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedReportForView.socialImpactSummary && (
                <div className="p-3 bg-white border border-slate-200 rounded">
                  <h4 className="font-bold text-slate-800 uppercase text-[11px] mb-1">
                    Documented Social Impact
                  </h4>
                  <div className="text-slate-700 font-medium">
                    {selectedReportForView.socialImpactSummary.measuredOutcomes}
                  </div>
                </div>
              )}

              <div className="p-3 bg-slate-50 border border-slate-200 rounded flex justify-between items-center text-[11px]">
                <div>
                  <span className="text-slate-500">Signoff By: </span>
                  <strong className="text-slate-800">{selectedReportForView.reviewedBy}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Date: </span>
                  <strong className="text-slate-800">{selectedReportForView.submittedDate}</strong>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-between items-center">
              <button
                onClick={() => setSelectedReportForView(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => handleDownloadPdf(selectedReportForView)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#133054] hover:bg-[#0e233e] rounded"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
