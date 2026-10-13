import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Target,
  Users,
  FolderGit2,
  CalendarCheck2,
  Building2,
  FileCheck2,
  UserCheck,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  Globe,
  Radio,
  ChevronRight,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Check,
  Building,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from '../common/NotificationDropdown';
import GovernmentUtilityBar from '../common/GovernmentUtilityBar';

export default function FacultyLayout() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('civic_lang', lang);
  };

  const navItems = [
    { to: '/faculty/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/faculty/challenges', label: 'My Challenges', icon: Target },
    { to: '/faculty/teams', label: 'My Teams', icon: Users },
    { to: '/faculty/projects', label: 'My Projects', icon: FolderGit2 },
    { to: '/faculty/milestones', label: 'Milestones', icon: CalendarCheck2 },
    { to: '/faculty/industry', label: 'Industry Collaboration', icon: Building2 },
    { to: '/faculty/reports', label: 'Reports', icon: FileCheck2 },
    { to: '/faculty/profile', label: 'My Profile', icon: UserCheck },
  ];

  const isCurrent = (to: string, exact = false) => {
    if (exact) {
      return location.pathname === to || (to === '/faculty/dashboard' && location.pathname === '/faculty');
    }
    return location.pathname.startsWith(to) && location.pathname !== '/faculty';
  };

  const facultyName = user?.name || 'Dr. Ananya Sen';
  const facultyDept = 'Computer Science & Engineering';
  const facultyInstitution = user?.institutionName || 'NIT Jamshedpur • Zone East-04';

  return (
    <div className="h-screen flex flex-col bg-[#F1F5F9] overflow-hidden">
      {/* 1. Top Government of India Global Bar */}
      <GovernmentUtilityBar />

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* 2. LEFT VERTICAL SIDEBAR NAVIGATION - FIXED IN PLACE */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-[#133054] via-[#163864] to-[#102747] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:h-full lg:translate-x-0 border-r border-[#224d80] shadow-xl shrink-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col flex-1 overflow-y-auto min-h-0">
            {/* National Tricolor Ribbon with Saffron-White-Green */}
            <div className="h-1.5 w-full flex shrink-0 shadow-xs">
              <div className="h-full flex-1 bg-[#ff9933]" />
              <div className="h-full flex-1 bg-white" />
              <div className="h-full flex-1 bg-[#138808]" />
            </div>

            {/* Official Portal Header */}
            <div className="p-3.5 border-b border-[#224d80] bg-[#102a4d]/90 flex items-center justify-between shrink-0">
              <Link to="/" className="flex items-center gap-2.5 group" title="Return to CivicConnect National Portal">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#1d4b84] to-[#123661] border border-amber-400/40 flex items-center justify-center text-white shadow-sm group-hover:border-amber-400 transition-colors shrink-0">
                  <GraduationCap size={19} className="text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm tracking-tight text-white block group-hover:text-amber-300 transition-colors">
                      CivicConnect
                    </span>
                    <span className="text-[8px] font-mono font-bold bg-amber-400/15 text-amber-300 px-1 py-0.2 rounded border border-amber-400/30">
                      GOV.IN
                    </span>
                  </div>
                  <span className="text-[9px] text-amber-400 font-extrabold uppercase tracking-wider block">
                    FACULTY MENTOR PORTAL
                  </span>
                </div>
              </Link>

              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1.5 text-blue-200 hover:text-white rounded-md cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Faculty Mentor Verified Identity Card */}
            <div className="mx-2.5 my-2.5 p-3 rounded-xl bg-gradient-to-br from-[#1b4374] to-[#13355d] border border-[#2b5d99]/80 shadow-md flex items-start gap-3 shrink-0">
              <div className="relative shrink-0 mt-0.5">
                <img
                  src="/assets/faculty_photo.jpg"
                  alt={facultyName}
                  className="w-10 h-10 rounded-full object-cover object-top ring-2 ring-amber-400/90 shadow-sm"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#13355d] flex items-center justify-center text-white shadow-xs" title="Official Verified Identity">
                  <Check size={9} strokeWidth={3.5} />
                </span>
              </div>
              <div className="overflow-hidden min-w-0 flex-1">
                <p className="font-extrabold text-xs text-white truncate" title={facultyName}>
                  {facultyName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-block text-[8px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.2 rounded font-mono uppercase font-bold tracking-wider">
                    FACULTY MENTOR
                  </span>
                  <span className="text-[8.5px] text-emerald-300 font-mono flex items-center gap-1 bg-emerald-950/40 px-1 py-0.2 rounded border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                  </span>
                </div>
                <p className="text-[10px] text-blue-100 truncate mt-1 font-medium" title={facultyDept}>
                  {facultyDept}
                </p>
                <p className="text-[10px] text-amber-200/90 truncate mt-0.5 flex items-center gap-1 font-medium" title={facultyInstitution}>
                  <Building size={10} className="text-amber-400 shrink-0" />
                  <span className="truncate">{facultyInstitution}</span>
                </p>
              </div>
            </div>

            {/* Navigation Menu Links */}
            <nav className="p-2 space-y-1 text-xs font-semibold">
              <div className="px-3 py-1.5 text-[9.5px] font-extrabold text-blue-200/80 uppercase tracking-wider flex items-center justify-between">
                <span>Faculty Operations</span>
                <span className="text-[8.5px] font-mono text-amber-300 bg-amber-400/15 px-1.5 py-0.2 rounded border border-amber-400/30">
                  SIH-195
                </span>
              </div>

              {navItems.map((item) => {
                const active = isCurrent(item.to, item.exact);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all border-l-[3.5px] group ${
                      active
                        ? 'border-amber-400 bg-gradient-to-r from-[#215394] via-[#1c477f] to-[#153967] text-white font-extrabold shadow-md'
                        : 'border-transparent text-blue-100/90 hover:bg-white/10 hover:text-white font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon size={16} className={active ? 'text-amber-400 shrink-0' : 'text-blue-200/70 group-hover:text-amber-300 shrink-0'} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {active && <ChevronRight size={13} className="text-amber-400" />}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer Controls - Always in Frame */}
          <div className="p-3 border-t border-[#224d80] bg-[#0d233e] space-y-1.5 text-xs shrink-0">
            {/* Live Academic Mentorship Pulse */}
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#143763] text-[10.5px] text-emerald-300 border border-emerald-400/30 shadow-xs">
              <span className="flex items-center gap-1.5 font-bold">
                <Radio size={12} className="animate-pulse text-emerald-400" />
                <span>NIC Telemetry Active</span>
              </span>
              <span className="font-mono text-[9px] text-amber-300 bg-amber-400/15 px-1.5 py-0.2 rounded border border-amber-400/30">
                2026–27
              </span>
            </div>

            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition-colors font-medium text-xs"
            >
              <ArrowLeft size={14} className="text-blue-200" />
              <span>Exit to Citizen Portal</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-rose-200 hover:text-white hover:bg-rose-900/50 transition-colors cursor-pointer font-bold text-xs border border-rose-400/30"
            >
              <LogOut size={14} className="text-rose-300" />
              <span>{t('nav.logout')}</span>
            </button>
          </div>
        </aside>

        {/* Sidebar Overlay on Mobile */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/60 z-40 lg:hidden backdrop-blur-xs"
          />
        )}

        {/* 3. MAIN WORKSPACE CONTAINER - INDEPENDENT SCROLL */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
          {/* Top Faculty Workspace Header */}
          <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
            <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100 cursor-pointer"
                  aria-label="Open sidebar"
                >
                  <Menu size={20} />
                </button>

                <div className="hidden sm:block">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Ministry of Education & Smart India Hackathon Innovation Ecosystem
                  </span>
                  <h2 className="text-sm font-extrabold text-slate-900">
                    Faculty Mentorship & Project Execution Console
                  </h2>
                </div>
              </div>

              {/* Right Controls: Academic Term, Notifications, and Compact Faculty Profile Pill */}
              <div className="flex items-center gap-2.5">
                {/* Academic Term Badge */}
                <div className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 text-slate-700 font-semibold border border-slate-200 text-[11px] shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Academic Term 2026–27 • R&D Cohort</span>
                </div>

                {/* Notifications Dropdown */}
                <NotificationDropdown />

                <div className="h-5 w-[1px] bg-slate-200 mx-0.5" />

                {/* Compact Faculty Profile Pill */}
                <Link
                  to="/faculty/profile"
                  className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 shadow-2xs transition-all group"
                  title="View Faculty Mentor Profile"
                >
                  {/* Photo Avatar with Subtle Ring and Live Dot */}
                  <div className="relative shrink-0">
                    <img
                      src="/assets/faculty_photo.jpg"
                      alt={facultyName}
                      className="w-7 h-7 rounded-full object-cover object-top ring-1.5 ring-amber-400 shadow-2xs"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
                  </div>

                  {/* Faculty Name */}
                  <span className="font-extrabold text-slate-800 group-hover:text-blue-900 text-xs truncate max-w-[140px]">
                    {facultyName}
                  </span>

                  {/* Compact Role Tag */}
                  <span className="text-[8.5px] font-mono font-extrabold bg-amber-100 text-amber-950 px-1.5 py-0.2 rounded border border-amber-300 uppercase shrink-0">
                    MENTOR
                  </span>
                </Link>
              </div>
            </div>
          </header>

          {/* Main Content Workspace Outlet */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
