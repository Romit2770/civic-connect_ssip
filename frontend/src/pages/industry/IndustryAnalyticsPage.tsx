import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Building2,
  GraduationCap,
  Users,
  IndianRupee,
  Layers,
  MapPin,
  CheckCircle2,
  Calendar,
  Wrench,
  Activity,
  FileSpreadsheet,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import KPIStatCard from '../../components/common/KPIStatCard';

export default function IndustryAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>({
    projectsOverview: {
      total: 15,
      active: 6,
      completed: 9,
      growthPercent: '+25%',
    },
    universitiesPartnered: {
      total: 3,
      active: 3,
      academicLabsUtilized: 8,
    },
    funding: {
      totalCommitted: 1850000,
      totalDisbursed: 1000000,
      pendingTranches: 850000,
      projectsFunded: 6,
      disbursalRatio: '54.05%',
    },
    socialImpact: {
      challengesSupported: 15,
      citizensImpacted: 240000,
      fieldDeploymentsCompleted: 7,
      ulbMunicipalPartnerships: 3,
    },
    technicalContribution: {
      technicalMentors: 8,
      mentorshipHoursLogged: 420,
      testingFacilitiesActive: 3,
      hardwareRigsDeployed: 107,
    },
    domainDistribution: [
      { domain: 'Water & Sanitation', projects: 5, budget: '₹ 6,50,000', percent: 35 },
      { domain: 'Roads & Public Works', projects: 4, budget: '₹ 6,00,000', percent: 32 },
      { domain: 'Solid Waste Management', projects: 3, budget: '₹ 3,20,000', percent: 17 },
      { domain: 'Urban Energy & Solar', projects: 3, budget: '₹ 4,10,000', percent: 16 },
    ],
  });

  const [quarterFilter, setQuarterFilter] = useState('FY 2026–27 (All)');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/industry-admin/analytics');
      if (res.data?.success) {
        setAnalytics(res.data.data.analytics);
      }
    } catch (err) {
      console.warn('Using local fallback for analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = 'Domain,Projects Supported,Committed Budget,Budget Share %\n';
    const rows = analytics.domainDistribution
      .map((d: any) => `"${d.domain}",${d.projects},"${d.budget}","${d.percent}%"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CivicConnect_CSR_Analytics_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('Auditor CSV Report successfully downloaded.');
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleExportPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#133054]">
              Institutional Innovation & CSR Analytics
            </h1>
            <span className="text-[11px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
              AUDITED TELEMETRY
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Official CSR innovation metrics, public municipal impact reach, and university collaboration telemetry for Tata Steel Utilities & Infrastructure
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={quarterFilter}
            onChange={(e) => setQuarterFilter(e.target.value)}
            className="text-xs bg-white border border-gray-300 rounded px-2.5 py-1.5 font-medium text-gray-700 focus:outline-none focus:border-[#133054]"
          >
            <option value="FY 2026–27 (All)">FY 2026–27 (Full Year)</option>
            <option value="Q1 (Apr–Jun 2026)">Q1 (Apr–Jun 2026)</option>
            <option value="Q2 (Jul–Sep 2026)">Q2 (Jul–Sep 2026)</option>
            <option value="Q3 (Oct–Dec 2026)">Q3 (Oct–Dec 2026)</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            Export CSV
          </button>

          <button
            onClick={handleExportPrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#133054] text-white text-xs font-semibold hover:bg-[#0f243e] rounded transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Print / PDF Report
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded text-xs flex items-center justify-between">
          <span className="font-medium">{exportNotice}</span>
          <button onClick={() => setExportNotice(null)} className="text-emerald-700 hover:text-emerald-900 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPIStatCard
          code="PRJ-SUPP"
          title="PROJECTS SUPPORTED"
          value={analytics.projectsOverview.total.toString()}
          badge="+25% YoY"
          subtitle={`${analytics.projectsOverview.active} Active | ${analytics.projectsOverview.completed} Completed`}
          variant="blue"
        />
        <KPIStatCard
          code="ACAD-PART"
          title="PARTNER UNIVERSITIES"
          value={analytics.universitiesPartnered.total.toString()}
          badge="3 Campuses"
          subtitle={`${analytics.universitiesPartnered.academicLabsUtilized} Academic Labs`}
          variant="purple"
        />
        <KPIStatCard
          code="CSR-COMM"
          title="CSR COMMITTED"
          value="₹ 18.50 L"
          badge="54% Disbursed"
          subtitle={`Disbursed: ₹ 10.00 L (${analytics.funding.disbursalRatio})`}
          variant="amber"
          valueColor="text-[#c2410c]"
        />
        <KPIStatCard
          code="CIT-IMPACT"
          title="CITIZEN BENEFICIARIES"
          value="2,40,000+"
          badge="Verified Reach"
          subtitle="Across 12 Municipal Wards"
          variant="green"
        />
        <KPIStatCard
          code="EXP-HOURS"
          title="MENTORSHIP LOGGED"
          value={`${analytics.technicalContribution.mentorshipHoursLogged} hrs`}
          badge="8 Mentors"
          subtitle="Industry technical guidance"
          variant="slate"
        />
        <KPIStatCard
          code="PLT-SITES"
          title="FIELD PILOTS DEPLOYED"
          value={`${analytics.socialImpact.fieldDeploymentsCompleted} Sites`}
          badge="3 ULB Accords"
          subtitle="Municipal testbed corridors"
          variant="orange"
          valueColor="text-[#c2410c]"
        />
      </div>

      {/* Main Grid: Domain Distribution + CSR Financial Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain Distribution Breakdown */}
        <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#133054] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#133054]" />
                Domain-Wise Project & Capital Distribution
              </h2>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Proportion of CSR commitment and project allocations by municipal domain
              </p>
            </div>
            <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
              4 Domains Active
            </span>
          </div>

          <div className="space-y-4">
            {analytics.domainDistribution.map((item: any) => (
              <div key={item.domain} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="font-semibold text-gray-800">{item.domain}</div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <span className="bg-blue-50 text-blue-800 font-mono px-1.5 py-0.5 rounded border border-blue-200 text-[10px]">
                      {item.projects} {item.projects === 1 ? 'Project' : 'Projects'}
                    </span>
                    <span className="font-bold text-[#133054]">{item.budget}</span>
                    <span className="font-bold text-gray-800 w-10 text-right">{item.percent}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#133054] h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-gray-50 rounded border border-gray-200">
              <div className="text-[10px] text-gray-500">Highest Domain</div>
              <div className="font-bold text-[#133054] text-xs mt-0.5">Water & Sanitation</div>
            </div>
            <div className="p-2 bg-gray-50 rounded border border-gray-200">
              <div className="text-[10px] text-gray-500">Avg. Project Grant</div>
              <div className="font-bold text-emerald-700 text-xs mt-0.5">₹ 1,23,333</div>
            </div>
            <div className="p-2 bg-gray-50 rounded border border-gray-200">
              <div className="text-[10px] text-gray-500">Target Disbursal</div>
              <div className="font-bold text-amber-700 text-xs mt-0.5">Q4 FY27 (100%)</div>
            </div>
          </div>
        </div>

        {/* CSR Financial & Disbursal Telemetry */}
        <div className="bg-white border border-gray-200 rounded shadow-sm p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div>
                <h2 className="text-sm font-bold text-[#133054] flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-[#133054]" />
                  CSR Financial Commitment & Disbursal Telemetry
                </h2>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Statutory audit tracking of sanctioned and disbursed research funding
                </p>
              </div>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                AUDIT COMPLIANT
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded">
                <span className="text-[10px] font-semibold text-blue-900 block uppercase">Total Sanctioned Grant</span>
                <span className="text-lg font-bold text-[#133054] mt-0.5 block">₹ 18,50,000</span>
                <span className="text-[10px] text-gray-500">Allocated to 6 active university MoUs</span>
              </div>
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded">
                <span className="text-[10px] font-semibold text-emerald-900 block uppercase">Disbursed to Universities</span>
                <span className="text-lg font-bold text-emerald-700 mt-0.5 block">₹ 10,00,000</span>
                <span className="text-[10px] text-emerald-600">Tranche-1 milestone verifications passed</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-gray-700">Cumulative Disbursal Ratio</span>
                  <span className="font-bold text-[#133054]">{analytics.funding.disbursalRatio}</span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: analytics.funding.disbursalRatio }}
                  />
                </div>
              </div>

              <div className="p-3 bg-gray-50 border border-gray-200 rounded text-xs space-y-1.5">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Pending Tranche-2 Disbursal:</span>
                  <span className="font-mono font-bold text-amber-700">₹ 8,50,000</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Statutory Corporate Audit Cycle:</span>
                  <span className="font-medium text-gray-800">Semi-Annual (External Comptroller)</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Tax Exemption Expiry:</span>
                  <span className="font-medium text-gray-800">Section 80G Valid (31 Mar 2028)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
            <span>Corporate PAN: <strong className="font-mono text-gray-700">AAACT2026M</strong></span>
            <span>CSR Reg: <strong className="font-mono text-gray-700">CSR00018492</strong></span>
          </div>
        </div>
      </div>

      {/* University Innovation Performance Matrix */}
      <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-[#133054] flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#133054]" />
              University Innovation Partnership Performance Matrix
            </h2>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Breakdown of academic collaboration health, project milestones, and laboratory utilization
            </p>
          </div>
          <span className="text-[11px] font-semibold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
            3 INSTITUTES PARTNERED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-gray-200">
            <thead className="bg-[#133054] text-white font-semibold">
              <tr>
                <th className="px-3 py-2.5">Institution & Campus</th>
                <th className="px-3 py-2.5">Active Projects</th>
                <th className="px-3 py-2.5">Committed CSR Grant</th>
                <th className="px-3 py-2.5">Disbursed (Tranche 1)</th>
                <th className="px-3 py-2.5">Academic Labs Engaged</th>
                <th className="px-3 py-2.5">Innovation Status</th>
                <th className="px-3 py-2.5">Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2.5 font-bold text-[#133054]">
                  National Institute of Technology (NIT) Jamshedpur
                  <span className="block text-[10px] text-gray-400 font-normal">Department of Civil & Computer Engineering</span>
                </td>
                <td className="px-3 py-2.5 font-semibold">2 Projects</td>
                <td className="px-3 py-2.5 font-mono font-bold text-gray-800">₹ 7,50,000</td>
                <td className="px-3 py-2.5 font-mono text-emerald-700 font-semibold">₹ 4,00,000</td>
                <td className="px-3 py-2.5">
                  <span className="font-medium text-gray-800">2 Labs</span>
                  <span className="block text-[10px] text-gray-400">Hydraulics, IoT Sensor Lab</span>
                </td>
                <td className="px-3 py-2.5">
                  <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded border border-amber-200 font-semibold">
                    Field Pilot Underway
                  </span>
                </td>
                <td className="px-3 py-2.5 text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  100% On Schedule
                </td>
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2.5 font-bold text-[#133054]">
                  Birla Institute of Technology (BIT) Mesra
                  <span className="block text-[10px] text-gray-400 font-normal">Environmental Science & Bio-Engineering Center</span>
                </td>
                <td className="px-3 py-2.5 font-semibold">2 Projects</td>
                <td className="px-3 py-2.5 font-mono font-bold text-gray-800">₹ 5,50,000</td>
                <td className="px-3 py-2.5 font-mono text-emerald-700 font-semibold">₹ 3,00,000</td>
                <td className="px-3 py-2.5">
                  <span className="font-medium text-gray-800">3 Labs</span>
                  <span className="block text-[10px] text-gray-400">Microbiology, Waste Analysis</span>
                </td>
                <td className="px-3 py-2.5">
                  <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded border border-blue-200 font-semibold">
                    Testing Lab Verified
                  </span>
                </td>
                <td className="px-3 py-2.5 text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Audit Cleared
                </td>
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2.5 font-bold text-[#133054]">
                  Indian Institute of Technology (IIT ISM) Dhanbad
                  <span className="block text-[10px] text-gray-400 font-normal">Mining & Geospatial Geotechnical Engineering</span>
                </td>
                <td className="px-3 py-2.5 font-semibold">2 Projects</td>
                <td className="px-3 py-2.5 font-mono font-bold text-gray-800">₹ 5,50,000</td>
                <td className="px-3 py-2.5 font-mono text-emerald-700 font-semibold">₹ 3,00,000</td>
                <td className="px-3 py-2.5">
                  <span className="font-medium text-gray-800">3 Labs</span>
                  <span className="block text-[10px] text-gray-400">GIS, Drone Photogrammetry</span>
                </td>
                <td className="px-3 py-2.5">
                  <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded border border-purple-200 font-semibold">
                    Algorithm Validation
                  </span>
                </td>
                <td className="px-3 py-2.5 text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  On Schedule
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Municipal ULB Deployments & Field Impact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#133054] mb-2">
            <Building2 className="w-4 h-4 text-[#133054]" />
            Jamshedpur Notified Area Council (JNAC)
          </div>
          <p className="text-[11px] text-gray-600 mb-3">
            Primary field testbed across Wards 1 to 8. Direct telemetry linkage with JNAC municipal utility dashboard.
          </p>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Active Deployments:</span>
              <strong className="text-gray-800">4 Pilot Sites</strong>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Citizen Reach:</span>
              <strong className="text-emerald-700 font-bold">1,60,000 Citizens</strong>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Status:</span>
              <span className="text-emerald-700 font-semibold">Active SCADA Link</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#133054] mb-2">
            <Building2 className="w-4 h-4 text-[#133054]" />
            Mango Municipal Corporation (MNAC)
          </div>
          <p className="text-[11px] text-gray-600 mb-3">
            Focus on arterial road structural safety and drone-assisted pothole depth telemetry along Dimna Road corridor.
          </p>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Active Deployments:</span>
              <strong className="text-gray-800">2 Pilot Corridors</strong>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Citizen Reach:</span>
              <strong className="text-emerald-700 font-bold">55,000 Citizens</strong>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Status:</span>
              <span className="text-blue-700 font-semibold">Sensor Calibrated</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#133054] mb-2">
            <Building2 className="w-4 h-4 text-[#133054]" />
            Adityapur Municipal Corporation (AMC)
          </div>
          <p className="text-[11px] text-gray-600 mb-3">
            Industrial wet waste composting and microbial tumbler installations near vegetable and grain mandis.
          </p>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Active Deployments:</span>
              <strong className="text-gray-800">1 Central Pilot Hub</strong>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Citizen Reach:</span>
              <strong className="text-emerald-700 font-bold">25,000 Citizens</strong>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Status:</span>
              <span className="text-purple-700 font-semibold">Bio-Digestion Testing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
