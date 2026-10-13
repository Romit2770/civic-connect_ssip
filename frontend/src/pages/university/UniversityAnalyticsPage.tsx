import React from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Users,
  Target,
  Award,
  Layers,
  Building2,
} from 'lucide-react';
import KPIStatCard from '../../components/common/KPIStatCard';

export default function UniversityAnalyticsPage() {
  const domainBreakdown = [
    { domain: 'Water & Sanitation Infrastructure', count: 5, pct: 36, color: 'bg-blue-600' },
    { domain: 'Public Works, Roads & Bridges', count: 4, pct: 28, color: 'bg-amber-600' },
    { domain: 'Solid Waste & Circular Economy', count: 3, pct: 22, color: 'bg-emerald-600' },
    { domain: 'Electrical & Smart Street Lighting', count: 2, pct: 14, color: 'bg-purple-600' },
  ];

  const departmentParticipation = [
    { dept: 'Computer Science & Engineering', teams: 8, students: 34, faculty: 6 },
    { dept: 'Civil & Environmental Engineering', teams: 6, students: 28, faculty: 5 },
    { dept: 'Electronics & Communication', teams: 5, students: 22, faculty: 4 },
    { dept: 'Mechanical & Automation Engineering', teams: 3, students: 16, faculty: 3 },
  ];

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#133054] text-amber-400 flex items-center justify-center font-bold shadow-xs shrink-0">
            <BarChart3 size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Institutional Innovation Analytics
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Comprehensive analytics on civic problem routing, academic department involvement and CSR co-funding.
            </p>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPIStatCard
          title="TOTAL CIVIC PROBLEMS"
          value="14"
          subtitle="Assigned via AI Router"
          icon={Target}
          variant="blue"
        />
        <KPIStatCard
          title="TOTAL CSR GRANTS"
          value="₹ 28.5 L"
          subtitle="Corporate R&D Sponsorships"
          icon={Award}
          variant="amber"
        />
        <KPIStatCard
          title="ACTIVE RESEARCHERS"
          value="112"
          subtitle="Multidisciplinary students"
          icon={Users}
          variant="green"
        />
        <KPIStatCard
          title="PILOT SUCCESS RATE"
          value="92%"
          subtitle="Validated by Municipal ULB"
          icon={TrendingUp}
          variant="purple"
        />
      </div>

      {/* Two Column Charts / Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain Distribution */}
        <div className="gov-card bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900">
              Assigned Challenges by Civic Domain
            </h3>
            <span className="text-xs font-mono font-bold text-blue-900">14 Total</span>
          </div>

          <div className="space-y-3">
            {domainBreakdown.map((d) => (
              <div key={d.domain} className="space-y-1 text-xs">
                <div className="flex justify-between items-center font-medium">
                  <span className="text-slate-800">{d.domain}</span>
                  <span className="font-mono text-slate-500 font-bold">{d.count} ({d.pct}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className={`${d.color} h-full rounded-full`} style={{ width: `${d.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Academic Department Engagement */}
        <div className="gov-card bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900">
              Departmental Collaboration Matrix
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-800">4 Active Departments</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {departmentParticipation.map((dp) => (
              <div key={dp.dept} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">{dp.dept}</span>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    {dp.faculty} Faculty Mentors • {dp.students} Student Researchers
                  </span>
                </div>
                <span className="font-mono font-bold text-xs bg-blue-100 text-blue-900 px-2 py-1 rounded">
                  {dp.teams} Teams
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
