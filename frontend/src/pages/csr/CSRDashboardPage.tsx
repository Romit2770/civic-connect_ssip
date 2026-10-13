import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  RefreshCw,
  Plus,
  Target,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  IndianRupee,
  Layers,
  MapPin,
  ShieldCheck,
  X,
  FileText,
  Award,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import KPIStatCard from '../../components/common/KPIStatCard';

export default function CSRDashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // New CSR Initiative form state
  const [initiativeForm, setInitiativeForm] = useState({
    title: '',
    domain: 'Water & Sanitation',
    university: 'NIT Jamshedpur',
    budget: '',
    targetCommunity: '',
    description: '',
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/csr/dashboard');
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.warn('Using local fallback for CSR Dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInitiative = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initiativeForm.title || !initiativeForm.budget) return;
    setActionSuccess(`CSR Initiative "${initiativeForm.title}" recorded for evaluation.`);
    setShowCreateModal(false);
    setInitiativeForm({
      title: '',
      domain: 'Water & Sanitation',
      university: 'NIT Jamshedpur',
      budget: '',
      targetCommunity: '',
      description: '',
    });
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const stats = {
    totalInitiatives: data?.stats?.totalInitiatives ?? 12,
    activeProjects: data?.stats?.activeProjects ?? 7,
    fundingAllocatedDisplay: data?.stats?.fundingAllocatedDisplay || '₹ 1.85 Cr',
    fundingUsedDisplay: data?.stats?.fundingUsedDisplay || '₹ 96.40 L',
    projectsCompleted: data?.stats?.projectsCompleted ?? 5,
    communitiesReached: data?.stats?.communitiesReached ?? 24850,
  };

  const fundingOverview = {
    totalAllocatedDisplay: data?.fundingOverview?.totalAllocatedDisplay || '₹ 1.85 Cr',
    releasedDisplay: data?.fundingOverview?.releasedDisplay || '₹ 1.12 Cr',
    utilizedDisplay: data?.fundingOverview?.utilizedDisplay || '₹ 96.40 L',
    remainingDisplay: data?.fundingOverview?.remainingDisplay || '₹ 73.60 L',
    utilizationPercentage: data?.fundingOverview?.utilizationPercentage ?? 52.1,
    releasePercentage: data?.fundingOverview?.releasePercentage ?? 60.5,
  };

  const activeProjects = (data?.activeProjects && data.activeProjects.length > 0) ? data.activeProjects : [
    {
      projectId: 'PRJ-CSR-2026-001',
      projectTitle: 'Smart Water Infrastructure IoT Telemetry',
      university: 'NIT Jamshedpur',
      domain: 'Water & Sanitation',
      location: 'Sakchi & Bistupur',
      progress: 72,
      funding: '₹ 45.00 L',
      status: 'Active',
      stage: 'Field Deployment',
    },
    {
      projectId: 'PRJ-CSR-2026-002',
      projectTitle: 'Computer Vision Drone Inspection for Asphalt Road Macro-Potholes',
      university: 'BIT Mesra',
      domain: 'Roads & Public Works',
      location: 'Dimna Road & Kadma',
      progress: 60,
      funding: '₹ 32.00 L',
      status: 'Active',
      stage: 'Testing',
    },
    {
      projectId: 'PRJ-CSR-2026-003',
      projectTitle: 'Decentralized Micro-Composting Digesters with Microbial Inoculants',
      university: 'BIT Mesra',
      domain: 'Solid Waste Management',
      location: 'Sakchi Mandi & Market',
      progress: 35,
      funding: '₹ 22.00 L',
      status: 'Active',
      stage: 'Prototype',
    },
    {
      projectId: 'PRJ-CSR-2026-004',
      projectTitle: 'Solar-Powered LED Smart Streetlighting with Dynamic Dimming',
      university: 'IIT (ISM) Dhanbad',
      domain: 'Urban Energy & Solar',
      location: 'Sonari Bypass',
      progress: 45,
      funding: '₹ 28.00 L',
      status: 'Active',
      stage: 'Prototype',
    },
    {
      projectId: 'PRJ-CSR-2026-005',
      projectTitle: 'Industrial Wastewater Multi-Stage Coagulation & Heavy Metal Removal',
      university: 'NIT Jamshedpur',
      domain: 'Water & Sanitation',
      location: 'Adityapur Industrial Area',
      progress: 68,
      funding: '₹ 24.00 L',
      status: 'Active',
      stage: 'Field Deployment',
    },
    {
      projectId: 'PRJ-CSR-2026-006',
      projectTitle: 'Hyperlocal Air Quality Telemetry & Dust Suppression',
      university: 'NIT Jamshedpur',
      domain: 'Smart Infrastructure & Road Safety',
      location: 'Jugsalai Goods Shed',
      progress: 30,
      funding: '₹ 18.00 L',
      status: 'At Risk',
      stage: 'Prototype',
    },
    {
      projectId: 'PRJ-CSR-2026-007',
      projectTitle: 'Waste Plastic Asphalt Aggregate Pyrolysis & Pavement Additives',
      university: 'BIT Mesra',
      domain: 'Solid Waste Management',
      location: 'Gamharia Bitumen Works',
      progress: 25,
      funding: '₹ 16.00 L',
      status: 'Active',
      stage: 'Prototype',
    },
  ];

  return (
    <div className="space-y-6 w-full">
      {/* 1. Official Government Header Banner */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
        {/* National Tricolor Government Accent Ribbon */}
        <div className="h-1.5 w-full flex">
          <div className="h-full flex-1 bg-[#ff9933]" />
          <div className="h-full flex-1 bg-white" />
          <div className="h-full flex-1 bg-[#138808]" />
        </div>

        <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex flex-col items-center justify-center p-2 rounded-lg bg-amber-50/80 border border-amber-200/90 text-[#0a2540] shrink-0 shadow-2xs">
              <Building2 className="w-8 h-8 text-[#0a2540]" />
              <span className="text-[7.5px] font-black tracking-widest text-[#0a2540] uppercase mt-1">
                TATA STEEL CSR
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold text-[#0a2540] bg-amber-100/90 px-2.5 py-0.5 rounded border border-amber-300 uppercase tracking-widest flex items-center gap-1.5 shadow-2xs">
                  <ShieldCheck size={12} className="text-amber-800" />
                  Corporate CSR Mandate • Section 135
                </span>
                <span className="text-xs text-slate-300 hidden sm:inline">•</span>
                <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Tata Steel Utilities & Infrastructure
                </span>
                <span className="text-xs text-slate-300 hidden sm:inline">•</span>
                <span className="text-[10px] font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  CSR Registration: CSR00018492
                </span>
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  CSR & Project Management
                </h1>
                <p className="text-xs text-slate-600 mt-0.5 max-w-3xl leading-relaxed">
                  Manage CSR innovation projects, funding commitments, university partnerships and measurable social impact.
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => loadDashboard()}
              className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100 shadow-2xs cursor-pointer transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Refresh Metrics"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin text-blue-700' : 'text-slate-600'} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-[#0a2540] hover:bg-[#12395b] text-white text-xs font-extrabold rounded-lg shadow-sm flex items-center gap-2 transition-colors cursor-pointer border border-blue-950"
            >
              <Plus size={14} className="text-amber-400" />
              <span>+ Create CSR Initiative</span>
            </button>
          </div>
        </div>

        {/* Nodal Metadata Bar */}
        <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              Organization: Tata Steel Utilities & Infrastructure
            </span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-slate-600">Lead: Meera Chawla (CSR & Innovation Division)</span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 size={13} className="text-emerald-600" />
              MCA Statutory CSR Audit Cleared
            </span>
          </div>
          <div className="font-mono text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
            Node Timestamp: 24-SEP-2026 • 13:40 IST
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

      {/* 2. Primary 6 Compact Government-Style KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <KPIStatCard
          code="CSR-INIT"
          title="CSR PROJECTS"
          value={stats.totalInitiatives}
          badge="Total Scope"
          badgeColor="bg-[#fffbeb] text-[#b45309] border-[#fcd34d]"
          subtitle="Total CSR initiatives"
          variant="blue"
        />

        <KPIStatCard
          code="PRJ-ACTIVE"
          title="ACTIVE PROJECTS"
          value={stats.activeProjects}
          badge="100% Active"
          badgeColor="bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]"
          subtitle="Currently under execution"
          variant="green"
        />

        <KPIStatCard
          code="FND-ALLOC"
          title="FUNDING ALLOCATED"
          value={stats.fundingAllocatedDisplay}
          badge="Committed"
          badgeColor="bg-[#fffbeb] text-[#b45309] border-[#fcd34d]"
          subtitle="Approved CSR allocation"
          variant="amber"
          valueColor="text-[#c2410c]"
        />

        <KPIStatCard
          code="FND-USED"
          title="FUNDING USED"
          value={stats.fundingUsedDisplay}
          badge="52.1% Spent"
          badgeColor="bg-[#fffbeb] text-[#b45309] border-[#fcd34d]"
          subtitle="Utilized to date"
          variant="orange"
          valueColor="text-[#c2410c]"
        />

        <KPIStatCard
          code="PRJ-COMPL"
          title="PROJECTS COMPLETED"
          value={stats.projectsCompleted}
          badge="Delivered"
          badgeColor="bg-[#f1f5f9] text-[#334155] border-[#cbd5e1]"
          subtitle="Successfully completed"
          variant="slate"
        />

        <KPIStatCard
          code="CIT-REACH"
          title="COMMUNITIES REACHED"
          value={Number(stats.communitiesReached || 24850).toLocaleString('en-IN')}
          badge="14 Areas"
          badgeColor="bg-[#eef2ff] text-[#4338ca] border-[#c7d2fe]"
          subtitle="People reached through projects"
          variant="purple"
        />
      </div>

      {/* 3. Main Grid: Active CSR Projects Table (Left 8 cols) + Funding Overview (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Section: Active CSR Projects Table */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#133054]" />
                Active CSR Projects
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Current innovation initiatives under active academic mentorship and CSR funding
              </p>
            </div>
            <Link
              to="/csr/projects"
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
            >
              <span>View All Projects</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#133054] text-white font-semibold">
                <tr>
                  <th className="px-3 py-2.5">Project</th>
                  <th className="px-3 py-2.5">University</th>
                  <th className="px-3 py-2.5">Domain</th>
                  <th className="px-3 py-2.5">Location</th>
                  <th className="px-3 py-2.5">Progress</th>
                  <th className="px-3 py-2.5">Funding</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {activeProjects.map((p: any) => (
                  <tr key={p.projectId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2.5 font-bold text-slate-900 max-w-[200px]">
                      <div className="truncate" title={p.projectTitle}>{p.projectTitle}</div>
                      <span className="font-mono text-[10px] text-slate-400 font-normal">{p.projectId}</span>
                    </td>
                    <td className="px-3 py-2.5 font-medium text-slate-800">{p.university}</td>
                    <td className="px-3 py-2.5">
                      <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[10px] font-medium border border-slate-200">
                        {p.domain}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 truncate max-w-[120px]">{p.location}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#133054] h-full rounded-full"
                            style={{ width: `${p.progress}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-800 text-[11px] font-mono">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 font-mono font-bold text-slate-900">{p.funding}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          p.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : p.status === 'At Risk'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <Link
                        to={`/csr/projects?id=${p.projectId}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded text-xs font-semibold shadow-2xs transition-colors"
                      >
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Section: CSR Funding Overview */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl shadow-xs p-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-[#133054]" />
                  CSR Funding Overview
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Financial tracking of corporate allocation and university grant release
                </p>
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded font-bold">
                AUDITED
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg">
                <span className="text-[10px] font-bold text-blue-900 block uppercase">Total Allocated Budget</span>
                <span className="text-xl font-black text-[#133054] block mt-0.5 font-mono">
                  {fundingOverview.totalAllocatedDisplay}
                </span>
                <span className="text-[10px] text-slate-500">Board-sanctioned FY 2026–27 ceiling</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] font-bold text-slate-600 block uppercase">Released</span>
                  <span className="text-sm font-black text-slate-900 block mt-0.5 font-mono">
                    {fundingOverview.releasedDisplay}
                  </span>
                  <span className="text-[10px] text-slate-500">Tranches 1 & 2</span>
                </div>
                <div className="p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-lg">
                  <span className="text-[10px] font-bold text-emerald-800 block uppercase">Utilized</span>
                  <span className="text-sm font-black text-emerald-700 block mt-0.5 font-mono">
                    {fundingOverview.utilizedDisplay}
                  </span>
                  <span className="text-[10px] text-emerald-600">Vouchers cleared</span>
                </div>
              </div>

              <div className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-900 block uppercase">Remaining Unspent</span>
                  <span className="text-[10px] text-slate-500">Available for milestones</span>
                </div>
                <span className="text-base font-black text-[#c2410c] font-mono">
                  {fundingOverview.remainingDisplay}
                </span>
              </div>

              {/* Simple Utilization Progress Bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Budget Utilization Rate</span>
                  <span className="font-bold text-slate-900 font-mono">{fundingOverview.utilizationPercentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#133054] h-full rounded-full transition-all duration-500"
                    style={{ width: `${fundingOverview.utilizationPercentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Released: {fundingOverview.releasePercentage}%</span>
                  <span>Target: Q4 FY27</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/csr/funding"
              className="w-full text-center py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition-colors shadow-2xs"
            >
              Open Funding Management Console
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Quick Navigation Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 flex items-center justify-center shrink-0">
            <Target size={18} />
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-800">CSR Opportunities</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Review 4 newly submitted citizen challenges matching urban infrastructure.
            </p>
            <Link to="/csr/opportunities" className="text-xs font-semibold text-blue-700 hover:underline mt-1.5 inline-block">
              Explore Proposals →
            </Link>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0">
            <Award size={18} />
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-800">Impact & Outcomes</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              24,850 citizens benefited across 14 municipal and peri-urban wards.
            </p>
            <Link to="/csr/impact" className="text-xs font-semibold text-emerald-700 hover:underline mt-1.5 inline-block">
              Inspect Social Impact →
            </Link>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-900 border border-purple-200 flex items-center justify-center shrink-0">
            <FileText size={18} />
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-800">CSR Reports & Audits</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Export official Section 135 PDF compliance reports for MCA filing.
            </p>
            <Link to="/csr/reports" className="text-xs font-semibold text-purple-700 hover:underline mt-1.5 inline-block">
              Generate Official PDFs →
            </Link>
          </div>
        </div>
      </div>

      {/* Create CSR Initiative Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-300 overflow-hidden">
            <div className="bg-[#133054] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm">Create New CSR Initiative</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-white/80 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInitiative} className="p-4 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Initiative Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solar Cold Storage for Peri-Urban Farmers"
                  value={initiativeForm.title}
                  onChange={(e) => setInitiativeForm({ ...initiativeForm, title: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-[#133054]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">CSR Domain</label>
                  <select
                    value={initiativeForm.domain}
                    onChange={(e) => setInitiativeForm({ ...initiativeForm, domain: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-[#133054]"
                  >
                    <option value="Water & Sanitation">Water & Sanitation</option>
                    <option value="Roads & Public Works">Roads & Public Works</option>
                    <option value="Solid Waste Management">Solid Waste Management</option>
                    <option value="Urban Energy & Solar">Urban Energy & Solar</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Partner University</label>
                  <select
                    value={initiativeForm.university}
                    onChange={(e) => setInitiativeForm({ ...initiativeForm, university: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-[#133054]"
                  >
                    <option value="NIT Jamshedpur">NIT Jamshedpur</option>
                    <option value="BIT Mesra">BIT Mesra</option>
                    <option value="IIT (ISM) Dhanbad">IIT (ISM) Dhanbad</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Proposed Budget (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 2500000"
                    value={initiativeForm.budget}
                    onChange={(e) => setInitiativeForm({ ...initiativeForm, budget: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-[#133054]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Community</label>
                  <input
                    type="text"
                    placeholder="e.g. 1,200 Peri-Urban Farmers"
                    value={initiativeForm.targetCommunity}
                    onChange={(e) => setInitiativeForm({ ...initiativeForm, targetCommunity: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-[#133054]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Scope & Social Need Summary</label>
                <textarea
                  rows={3}
                  placeholder="Outline the civic problem and expected social return on investment..."
                  value={initiativeForm.description}
                  onChange={(e) => setInitiativeForm({ ...initiativeForm, description: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-[#133054]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#133054] text-white rounded font-bold hover:bg-[#0f243e] shadow-xs"
                >
                  Record Initiative
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
