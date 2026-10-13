import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Users,
  Building,
  RefreshCw,
  AlertTriangle,
  FolderGit2,
  Clock,
  Leaf,
  ShieldCheck,
  Award,
  Layers,
  PieChart as PieIcon,
  Activity,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { apiClient, getErrorMessage } from '../../api/client';

export default function MunicipalityAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [chartViewMode, setChartViewMode] = useState<'comparison' | 'percentage'>('comparison');

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/municipality/analytics');
      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const topMetrics = analytics?.topMetrics || {
    issuesResolved: 97,
    areasImproved: '14 Wards (28 Localities)',
    citizensBenefited: '1,42,500 Verified Residents',
    projectOutcomes: '18 Deployed Civic Innovations',
  };

  const challengeStats = analytics?.challengeAnalytics || {
    totalChallenges: 245,
    verifiedChallenges: 184,
    projectsCreated: 26,
    issuesResolved: 97,
    resolutionRate: '78.4%',
    averageResolutionTime: '4.2 Days',
  };

  // Enriched Category data with reported and resolved numbers
  const categoryChartData = [
    { category: 'Water & Sanitation', shortName: 'Water', reported: 68, resolved: 52, percentage: 28, rate: 76.5 },
    { category: 'Roads & Infrastructure', shortName: 'Roads', reported: 54, resolved: 38, percentage: 22, rate: 70.3 },
    { category: 'Solid Waste Management', shortName: 'Waste', reported: 46, resolved: 36, percentage: 19, rate: 78.2 },
    { category: 'Street Lighting', shortName: 'Lighting', reported: 32, resolved: 28, percentage: 13, rate: 87.5 },
    { category: 'Drainage & Stormwater', shortName: 'Drainage', reported: 25, resolved: 17, percentage: 10, rate: 68.0 },
    { category: 'Environment & Parks', shortName: 'Environment', reported: 12, resolved: 9, percentage: 5, rate: 75.0 },
    { category: 'Public Health', shortName: 'Health', reported: 8, resolved: 6, percentage: 3, rate: 75.0 },
  ];

  // Enriched Priority data with SLA targets and distinct colors
  const priorityChartData = [
    { name: 'Critical Priority', value: 28, percentage: 11, color: '#DC2626', sla: '< 24 Hours', urgency: 'Immediate Emergency Response' },
    { name: 'High Priority', value: 96, percentage: 39, color: '#EA580C', sla: '< 48 Hours', urgency: 'Public Health & Safety Hazard' },
    { name: 'Medium Priority', value: 88, percentage: 36, color: '#2563EB', sla: '< 5 Days', urgency: 'Civic Infrastructure Repair' },
    { name: 'Low Priority', value: 33, percentage: 14, color: '#64748B', sla: '< 10 Days', urgency: 'Routine Maintenance Schedule' },
  ];

  // Ward Resolution Performance Data (14 Wards)
  const wardComparisonData = [
    { ward: 'W-01', name: 'Ward 1', total: 24, resolved: 19, rate: 79 },
    { ward: 'W-02', name: 'Ward 2', total: 22, resolved: 18, rate: 81 },
    { ward: 'W-03', name: 'Ward 3', total: 26, resolved: 21, rate: 80 },
    { ward: 'W-04', name: 'Ward 4', total: 28, resolved: 20, rate: 71 },
    { ward: 'W-05', name: 'Ward 5', total: 25, resolved: 22, rate: 88 },
    { ward: 'W-06', name: 'Ward 6', total: 18, resolved: 15, rate: 83 },
    { ward: 'W-07', name: 'Ward 7', total: 21, resolved: 16, rate: 76 },
    { ward: 'W-08', name: 'Ward 8', total: 27, resolved: 20, rate: 74 },
    { ward: 'W-09', name: 'Ward 9', total: 19, resolved: 16, rate: 84 },
    { ward: 'W-10', name: 'Ward 10', total: 23, resolved: 19, rate: 82 },
    { ward: 'W-11', name: 'Ward 11', total: 17, resolved: 14, rate: 82 },
    { ward: 'W-12', name: 'Ward 12', total: 29, resolved: 21, rate: 72 },
    { ward: 'W-13', name: 'Ward 13', total: 16, resolved: 13, rate: 81 },
    { ward: 'W-14', name: 'Ward 14', total: 20, resolved: 17, rate: 85 },
  ];

  // Weekly Inflow vs Resolution Trend
  const weeklyTrends = [
    { day: 'Mon', submitted: 38, resolved: 34 },
    { day: 'Tue', submitted: 42, resolved: 39 },
    { day: 'Wed', submitted: 35, resolved: 37 },
    { day: 'Thu', submitted: 48, resolved: 44 },
    { day: 'Fri', submitted: 52, resolved: 49 },
    { day: 'Sat', submitted: 20, resolved: 24 },
    { day: 'Sun', submitted: 10, resolved: 18 },
  ];

  const projectOutcomes = analytics?.projectOutcomes || {};

  // Custom tooltips
  const CustomCategoryTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = categoryChartData.find((c) => c.category === label || c.shortName === label);
      return (
        <div className="bg-[#0f172a] text-white p-3 rounded-lg shadow-xl text-xs border border-slate-700 space-y-1.5 min-w-[200px]">
          <p className="font-extrabold text-amber-300 text-xs border-b border-slate-700 pb-1">
            {item?.category || label}
          </p>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-blue-300">● Total Reported:</span>
            <span className="font-mono font-bold">{payload[0]?.value || 0}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-emerald-400">● Successfully Resolved:</span>
            <span className="font-mono font-bold">{payload[1]?.value || 0}</span>
          </div>
          {item && (
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800 text-amber-200 font-bold">
              <span>Resolution Rate:</span>
              <span className="font-mono">{item.rate}%</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-[#0f172a] text-white p-3 rounded-lg shadow-xl text-xs border border-slate-700 min-w-[190px] space-y-1">
          <p className="font-extrabold text-xs" style={{ color: data.payload.color }}>
            {data.name}
          </p>
          <p className="font-mono text-sm font-black text-white">
            {data.value} Issues ({data.payload.percentage}%)
          </p>
          <div className="pt-1 border-t border-slate-800 text-[10px] space-y-0.5 text-slate-300">
            <p><strong className="text-white">SLA Mandate:</strong> {data.payload.sla}</p>
            <p className="text-slate-400">{data.payload.urgency}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide bg-blue-900 text-white font-mono">
              ANALYTICS COMMAND
            </span>
            <span className="text-xs text-slate-500 font-semibold">Anand Urban Local Body Performance Intelligence</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Municipal Impact Analytics
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Measure civic improvements, SLA resolution velocity, category distributions, and verifiable public outcomes across Anand Municipality.
          </p>
        </div>

        <button
          onClick={loadAnalytics}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin text-blue-600' : 'text-slate-500'} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={loadAnalytics} className="underline font-bold cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* 2. TOP 4 IMPACT METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ISSUES RESOLVED */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 border-t-4 border-t-emerald-600 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">ISSUES RESOLVED</span>
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2 font-mono">
            {topMetrics.issuesResolved}
          </div>
          <p className="text-[10px] text-slate-500 mt-1 leading-tight">
            Grievances successfully closed with field certification
          </p>
        </div>

        {/* AREAS IMPROVED */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 border-t-4 border-t-blue-700 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800">AREAS IMPROVED</span>
            <Building size={18} className="text-blue-600" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-2">
            {topMetrics.areasImproved}
          </div>
          <p className="text-[10px] text-slate-500 mt-1 leading-tight">
            Across 14 administrative wards of Anand ULB
          </p>
        </div>

        {/* CITIZENS BENEFITED */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 border-t-4 border-t-purple-600 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-800">CITIZENS BENEFITED</span>
            <Users size={18} className="text-purple-600" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-2">
            {topMetrics.citizensBenefited}
          </div>
          <p className="text-[10px] text-slate-500 mt-1 leading-tight">
            Calculated from verified ward catchment census data
          </p>
        </div>

        {/* PROJECT OUTCOMES */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 border-t-4 border-t-amber-500 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800">PROJECT OUTCOMES</span>
            <Award size={18} className="text-amber-600" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-2">
            {topMetrics.projectOutcomes}
          </div>
          <p className="text-[10px] text-slate-500 mt-1 leading-tight">
            Co-developed via University-Industry collaboration
          </p>
        </div>
      </div>

      {/* 3. OPERATIONAL KPI SUMMARY ROW */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <TrendingUp size={16} className="text-blue-900" />
          <span>Municipal Operational Efficiency & Resolution Velocity</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Challenges</span>
            <span className="text-xl font-black text-slate-900 font-mono mt-0.5 block">{challengeStats.totalChallenges}</span>
            <span className="text-[9px] text-slate-400">Jurisdiction Total</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Verified Challenges</span>
            <span className="text-xl font-black text-blue-900 font-mono mt-0.5 block">{challengeStats.verifiedChallenges}</span>
            <span className="text-[9px] text-blue-600">Passed ULB Triage</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Projects Created</span>
            <span className="text-xl font-black text-indigo-900 font-mono mt-0.5 block">{challengeStats.projectsCreated}</span>
            <span className="text-[9px] text-indigo-600">University Matched</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Issues Resolved</span>
            <span className="text-xl font-black text-emerald-900 font-mono mt-0.5 block">{challengeStats.issuesResolved}</span>
            <span className="text-[9px] text-emerald-600">Field Certified</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Resolution Rate</span>
            <span className="text-xl font-black text-purple-900 font-mono mt-0.5 block">{challengeStats.resolutionRate}</span>
            <span className="text-[9px] text-purple-600">Against Verified Total</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Avg Resolution Time</span>
            <span className="text-xl font-black text-amber-900 font-mono mt-0.5 block">{challengeStats.averageResolutionTime}</span>
            <span className="text-[9px] text-amber-700">From Triage to Close</span>
          </div>
        </div>
      </div>

      {/* 4. PERFECT VISUAL ANALYTICS: CATEGORY BREAKDOWN & SEVERITY DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT (7 cols): INTERACTIVE ISSUE CATEGORY BAR CHART */}
        <div className="lg:col-span-7 p-5 rounded-xl bg-white border border-slate-300 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 size={16} className="text-blue-900" />
                <span>Issue Category Breakdown & Resolution Comparison</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Reported challenge volume vs. successfully resolved count by civic domain.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#1E3A8A]"></span>
                <span>Reported</span>
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#059669]"></span>
                <span>Resolved</span>
              </span>
            </div>
          </div>

          {/* Real Recharts Horizontal Bar Chart */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryChartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" stroke="#64748B" fontSize={11} domain={[0, 75]} />
                <YAxis
                  dataKey="shortName"
                  type="category"
                  stroke="#334155"
                  fontSize={11}
                  fontWeight={600}
                  tickLine={false}
                  width={75}
                />
                <Tooltip content={<CustomCategoryTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }} />
                <Bar dataKey="reported" fill="#1E3A8A" name="Reported" radius={[0, 4, 4, 0]} barSize={11} />
                <Bar dataKey="resolved" fill="#059669" name="Resolved" radius={[0, 4, 4, 0]} barSize={11} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Metrics Footer */}
          <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Highest Volume</span>
              <span className="font-extrabold text-blue-900 mt-0.5 block">Water & Sanitation (68)</span>
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Highest Resolution</span>
              <span className="font-extrabold text-emerald-700 mt-0.5 block">Street Lighting (87.5%)</span>
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Active R&D Focus</span>
              <span className="font-extrabold text-indigo-700 mt-0.5 block">Roads Sub-base (54)</span>
            </div>
          </div>
        </div>

        {/* RIGHT (5 cols): INTERACTIVE SEVERITY DONUT & SLA MATRIX */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-white border border-slate-300 shadow-xs flex flex-col justify-between space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <PieIcon size={16} className="text-blue-900" />
              <span>Severity & Priority Distribution</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Urgency tiering and mandatory SLA redressal windows.
            </p>
          </div>

          {/* Donut Chart with Recharts */}
          <div className="relative h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {priorityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Donut Center Stat Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black font-mono text-slate-900">245</span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Total Triage</span>
            </div>
          </div>

          {/* SLA Structured List */}
          <div className="space-y-1.5 pt-1 border-t border-slate-100 text-xs">
            {priorityChartData.map((item) => (
              <div
                key={item.name}
                className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">{item.name}</span>
                    <span className="text-[10px] text-slate-500">SLA: {item.sla}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900 text-xs block">
                    {item.value} issues
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">
                    {item.percentage}% of total
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. WARD-WISE RESOLUTION PERFORMANCE (14 WARDS BAR CHART) */}
      <div className="p-5 rounded-xl bg-white border border-slate-300 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building size={16} className="text-blue-900" />
              <span>Ward-wise Geospatial Challenge Inflow & Redressal Rate</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Comparative redressal performance across all 14 administrative wards of Anand Municipality.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#1E3A8A]"></span>
              <span>Reported</span>
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#059669]"></span>
              <span>Resolved</span>
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={wardComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="ward" stroke="#64748B" fontSize={11} fontWeight={600} />
              <YAxis stroke="#64748B" fontSize={11} />
              <Tooltip
                content={({ active, payload, label }: any) => {
                  if (active && payload && payload.length) {
                    const wItem = wardComparisonData.find((w) => w.ward === label);
                    return (
                      <div className="bg-[#0f172a] text-white p-2.5 rounded-lg shadow-xl text-xs border border-slate-700 space-y-1">
                        <p className="font-extrabold text-amber-300">{wItem?.name} ({label})</p>
                        <p className="text-[11px] text-blue-300">Reported Issues: {wItem?.total}</p>
                        <p className="text-[11px] text-emerald-400">Resolved Issues: {wItem?.resolved}</p>
                        <p className="text-[11px] text-white font-bold pt-1 border-t border-slate-800">
                          Redressal Rate: {wItem?.rate}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="total" fill="#1E3A8A" name="Total Issues" radius={[3, 3, 0, 0]} barSize={16} />
              <Bar dataKey="resolved" fill="#059669" name="Resolved Issues" radius={[3, 3, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 6. WEEKLY RESOLUTION VELOCITY & VERIFIABLE OUTCOMES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Trend (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-white border border-slate-300 shadow-xs space-y-3">
          <div className="border-b border-slate-200 pb-2">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Activity size={16} className="text-blue-900" />
              <span>Weekly Grievance Inflow vs. Resolution</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Daily dispatch velocity across the current 7-day operational cycle.
            </p>
          </div>

          <div className="h-48 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrends}>
                <defs>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="submitted" stroke="#1e3a8a" fillOpacity={1} fill="url(#colorSub)" name="Submitted" />
                <Area type="monotone" dataKey="resolved" stroke="#059669" fillOpacity={1} fill="url(#colorRes)" name="Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Verifiable Outcomes (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-xl bg-white border border-slate-300 shadow-xs space-y-3">
          <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-700" />
                <span>Verifiable Municipal Project Outcomes & Public Savings</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Physical asset upgrades certified under 2026–27 Statutory Audit.
              </p>
            </div>
            <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
              Audited 2026–27
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-extrabold text-blue-950 uppercase tracking-wide text-[10px] block">
                Physical Infrastructure
              </span>
              <p className="text-slate-800 font-bold">{projectOutcomes.infrastructureImproved || '46 km Road Network & 12 km Drainage Trunk'}</p>
              <p className="text-[10px] text-slate-500">Cold polymer asphalt & outfall flow redirection.</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-extrabold text-blue-950 uppercase tracking-wide text-[10px] block">
                Municipal Services Modernized
              </span>
              <p className="text-slate-800 font-bold">{projectOutcomes.servicesImproved || '24x7 Smart Streetlighting & APMC Automated Compacting'}</p>
              <p className="text-[10px] text-slate-500">Automated LoRaWAN and edge AI compactor telemetry.</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-extrabold text-emerald-950 uppercase tracking-wide text-[10px] block flex items-center gap-1">
                <Leaf size={11} className="text-emerald-600" />
                <span>Environmental Outcomes</span>
              </span>
              <p className="text-emerald-900 font-bold">{projectOutcomes.environmentalOutcomes || '420 MT Landfill Bio-Waste Diverted'}</p>
              <p className="text-[10px] text-slate-500">Anaerobic methane diversion at Ganesh Chokdi yard.</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-extrabold text-purple-950 uppercase tracking-wide text-[10px] block">
                Public Capital Savings
              </span>
              <p className="text-purple-900 font-bold">{projectOutcomes.costSavings || '₹34,50,000 Saved via In-house HEI Innovation'}</p>
              <p className="text-[10px] text-slate-500">{projectOutcomes.timeSavings || 'Incident lifecycle shortened by 38%'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
