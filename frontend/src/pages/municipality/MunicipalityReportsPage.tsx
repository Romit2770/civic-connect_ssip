import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Eye,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  Building,
  Calendar,
  X,
} from 'lucide-react';
import { apiClient, getErrorMessage } from '../../api/client';
import { generateMunicipalityPdfReport, MunicipalityReportData } from '../../utils/municipalityReportPdfGenerator';

export default function MunicipalityReportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Preview Modal
  const [previewReport, setPreviewReport] = useState<any | null>(null);

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/municipality/reports');
      if (res.data.success) {
        setReports(res.data.data || []);
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleDownloadPdf = async (report: any) => {
    setDownloadingId(report.id);
    try {
      // Build full report bundle
      const reportData: MunicipalityReportData = {
        reportId: report.reportId || report.id,
        reportType: report.reportType,
        period: report.period,
        generatedDate: report.generatedDate,
        preparedBy: report.preparedBy,
        municipalityName: 'Anand Municipality (Urban Local Body)',
        district: 'Anand',
        state: 'Gujarat',
        summary: {
          totalChallenges: 245,
          verifiedChallenges: 184,
          pendingValidation: 32,
          activeProjects: 18,
          completedProjects: 97,
          participatingUniversities: 8,
          industryPartners: 6,
          citizensBenefited: '1,42,500 Verified Residents',
        },
        challenges: [
          { id: 'CH-2026-089', problem: 'Overflowing Drainage Network & Surcharge', category: 'Water & Sanitation', ward: 'Ward 12', priority: 'HIGH', status: 'Verified', projectStatus: 'Assigned' },
          { id: 'CH-2026-092', problem: 'Commercial Solid Waste Spillover at APMC', category: 'Solid Waste Management', ward: 'Ward 8', priority: 'HIGH', status: 'In Progress', projectStatus: 'In Progress' },
          { id: 'CH-2026-104', problem: 'Arterial Road Sub-base Failure & Potholes', category: 'Roads & Infrastructure', ward: 'Ward 4', priority: 'CRITICAL', status: 'Verified', projectStatus: 'In Progress' },
          { id: 'CH-2026-042', problem: 'Smart Streetlight Grid Phase Imbalance', category: 'Street Lighting', ward: 'Ward 5', priority: 'MEDIUM', status: 'Resolved', projectStatus: 'Completed' },
          { id: 'CH-2026-115', problem: 'Potable Water Contamination & Odor', category: 'Public Health', ward: 'Ward 2', priority: 'CRITICAL', status: 'Pending', projectStatus: 'Unassigned' },
        ],
        projects: [
          { id: 'PRJ-ANAND-014', name: 'Smart Ultrasonic Trunk Sewer Flow Warning', university: 'BVM Engineering College', industry: 'Elecon Engineering Ltd.', ward: 'Ward 12', progress: 68, status: 'Active' },
          { id: 'PRJ-ANAND-018', name: 'Smart Waste Compactor & Bio-Digestion Station', university: 'Charusat University (DEPSTAR)', industry: 'Amul (GCMMF)', ward: 'Ward 8', progress: 42, status: 'Delayed' },
          { id: 'PRJ-ANAND-021', name: 'Polymer Cold Mix Bituminous Wet Pothole Patching', university: 'GCET Engineering College', industry: 'Larsen & Toubro Ltd.', ward: 'Ward 4', progress: 55, status: 'Active' },
          { id: 'PRJ-ANAND-008', name: 'Automated Streetlight Grid Phase Balancer', university: 'BVM Engineering College', industry: 'Tata Consultancy Services', ward: 'Ward 5', progress: 100, status: 'Completed' },
        ],
      };

      const doc = generateMunicipalityPdfReport(reportData);
      doc.save(`${report.reportId}_Anand_Municipality_Official.pdf`);
    } catch (err: any) {
      alert(`Failed to generate PDF: ${err.message}`);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide bg-blue-900 text-white font-mono">
              STATUTORY AUDIT
            </span>
            <span className="text-xs text-slate-500 font-semibold">Official ULB Documentation & Reports</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Municipality Reports
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Download certified multi-page PDF operational reports, university R&D audits, and CSR financial reconciliation filings.
          </p>
        </div>

        <button
          onClick={loadReports}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin text-blue-600' : 'text-slate-500'} />
          <span>Refresh Reports</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={loadReports} className="underline font-bold cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* 2. Statutory PDF Guarantee Notice */}
      <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-200 flex items-start gap-3 text-xs text-blue-950">
        <FileCheck size={20} className="text-blue-900 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-extrabold text-blue-950 text-xs">
            Authentic Multi-Page PDF Document Generation Engine
          </h3>
          <p className="text-blue-800 text-[11px] mt-0.5">
            All generated reports comply with Government of India electronic governance formatting guidelines. Reports feature National Tricolor accenting, official Urban Local Body headers, tabular challenge & project breakdowns, executive summaries, and formal administrative sign-offs.
          </p>
        </div>
      </div>

      {/* 3. REPORTS TABLE */}
      <div className="rounded-lg bg-white border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/80">
          <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText size={16} className="text-blue-900" />
            <span>Published Municipal Operational Reports</span>
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Select any official statutory report to inspect in the browser viewer or download as a standalone .pdf document.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#1E3A8A] text-white font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Report ID</th>
                <th className="py-2.5 px-3">Report Type</th>
                <th className="py-2.5 px-3">Report Title</th>
                <th className="py-2.5 px-3">Period</th>
                <th className="py-2.5 px-3">Generated Date</th>
                <th className="py-2.5 px-3">Prepared By</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {reports.map((r: any, idx: number) => (
                <tr
                  key={r.id}
                  className={`hover:bg-blue-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-950">
                    {r.reportId || r.id}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      {r.reportType}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 max-w-xs truncate" title={r.title}>
                    {r.title}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                    {r.period}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                    {new Date(r.generatedDate).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 text-[11px] max-w-[150px] truncate" title={r.preparedBy}>
                    {r.preparedBy}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                      {r.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => setPreviewReport(r)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors cursor-pointer"
                    >
                      <Eye size={12} />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => handleDownloadPdf(r)}
                      disabled={downloadingId === r.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded transition-colors cursor-pointer shadow-2xs"
                    >
                      <Download size={12} className={downloadingId === r.id ? 'animate-bounce' : ''} />
                      <span>{downloadingId === r.id ? 'Generating...' : 'Download PDF'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. IN-APP REPORT PREVIEW DRAWER */}
      {previewReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-3xl w-full p-6 space-y-4 my-auto animate-in fade-in zoom-in-95 duration-150 text-xs text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {previewReport.reportId}
                </span>
                <h3 className="font-extrabold text-base text-slate-900 mt-1">
                  {previewReport.title}
                </h3>
              </div>
              <button onClick={() => setPreviewReport(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Report Category</span>
                <p className="font-bold text-slate-900 mt-0.5">{previewReport.reportType}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Reporting Period</span>
                <p className="font-semibold text-slate-800 mt-0.5">{previewReport.period}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Prepared By</span>
                <p className="font-semibold text-slate-800 mt-0.5">{previewReport.preparedBy}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Publication Timestamp</span>
                <p className="font-mono text-slate-700 mt-0.5">{new Date(previewReport.generatedDate).toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-100 border border-slate-200 space-y-2 text-xs text-slate-700">
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                Report Executive Abstract
              </h4>
              <p className="leading-relaxed">
                This official statutory dossier includes complete operational metrics for Anand Municipality, covering 245 logged challenges, 18 active R&D pilot implementations, partnership reconciliations across 8 engineering universities (BVM, Charusat, GCET, SPU) and 6 corporate CSR sponsors.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setPreviewReport(null)}
                className="px-3.5 py-1.5 border border-slate-300 font-bold text-xs text-slate-700 rounded hover:bg-slate-50 cursor-pointer"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  handleDownloadPdf(previewReport);
                  setPreviewReport(null);
                }}
                className="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={13} />
                <span>Generate Official PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
