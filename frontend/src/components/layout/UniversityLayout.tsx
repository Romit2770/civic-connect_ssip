import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Target,
  Users,
  FolderGit2,
  FileText,
  Building2,
  FlaskConical,
  BarChart3,
  KeyRound,
  GraduationCap,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  Globe,
  Radio,
  ChevronRight,
  ShieldCheck,
  Building,
  Check,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from '../common/NotificationDropdown';
import GovernmentUtilityBar from '../common/GovernmentUtilityBar';

export default function UniversityLayout() {
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
    { to: '/university', label: 'Operations Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/university/challenges', label: 'Challenge Management', icon: Target },
    { to: '/university/teams', label: 'Team Management', icon: Users },
    { to: '/university/projects', label: 'Project Management', icon: FolderGit2 },
    { to: '/university/proposals', label: 'Solution Proposals', icon: FileText },
    { to: '/university/industry', label: 'Industry Collaboration', icon: Building2 },
    { to: '/university/testing', label: 'Testing & Validation', icon: FlaskConical },
    { to: '/university/analytics', label: 'Innovation Analytics', icon: BarChart3 },
    { to: '/university/credentials', label: 'Credential Management', icon: KeyRound },
    { to: '/university/profile', label: 'University Profile', icon: GraduationCap },
  ];

  const isCurrent = (to: string, exact = false) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to) && location.pathname !== '/university';
  };

  const adminName = user?.name || 'Dr. Ramesh Kumar';
  const adminRole = 'Dean of Research & Consultancy (R&D)';
  const institution = user?.institutionName || 'NIT Jamshedpur • Zone East-04';

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
                    UNIVERSITY ADMIN PORTAL
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

            {/* University Admin Verified Identity Card */}
            <div className="mx-2.5 my-2.5 p-3 rounded-xl bg-gradient-to-br from-[#1b4374] to-[#13355d] border border-[#2b5d99]/80 shadow-md flex items-start gap-3 shrink-0">
              <div className="relative shrink-0 mt-0.5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#275996] to-[#102d54] ring-2 ring-amber-400/90 shadow-sm flex items-center justify-center text-white font-bold text-sm">
                  RK
                </div>
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 border border-[#133054]" title="Verified University Administrator">
                  <Check size={9} className="text-white stroke-[3]" />
                </div>
              </div>

              <div className="overflow-hidden flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] font-extrabold font-mono tracking-wider bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded shadow-2xs uppercase">
                    UNIVERSITY ADMIN
                  </span>
                  <span className="text-[9px] text-emerald-300 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Active
                  </span>
                </div>

                <p className="font-bold text-xs text-white truncate mt-1 leading-snug tracking-tight">
                  {adminName}
                </p>
                <p className="text-[10px] text-blue-100/90 truncate font-medium">
                  {adminRole}
                </p>
                <p className="text-[10px] text-amber-200/90 truncate font-semibold mt-0.5 flex items-center gap-1" title={institution}>
                  <Building size={10} className="shrink-0 text-amber-300/80" />
                  <span className="truncate">{institution}</span>
                </p>
              </div>
            </div>

            {/* Navigation Menu Section Heading */}
            <div className="px-4 pt-2 pb-1 text-[10px] font-extrabold text-blue-200/80 uppercase tracking-widest flex items-center justify-between">
              <span>UNIVERSITY OPERATIONS</span>
              <span className="text-[9px] font-mono text-amber-300/70">ACADEMIC HEI</span>
            </div>

            {/* Navigation Menu Links */}
            <nav className="px-2 py-1 space-y-1 text-xs font-semibold flex-1">
              {navItems.map((item) => {
                const active = isCurrent(item.to, item.exact);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all text-xs ${
                      active
                        ? 'bg-gradient-to-r from-[#215394] via-[#1c477f] to-[#153967] text-white font-bold border-amber-400 border-l-[3.5px] shadow-sm'
                        : 'text-blue-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        size={15}
                        className={`shrink-0 ${active ? 'text-amber-400' : 'text-blue-200/80'}`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {active && <ChevronRight size={13} className="text-amber-400 shrink-0" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* DOCKED OFFICIAL FOOTER (Always Visible, Fits Nicely) */}
          <div className="p-3 border-t border-[#224d80] bg-[#0c223d]/95 space-y-2 text-xs shrink-0">
            {/* Live NIC Telemetry Status Badge */}
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#143763] text-[11px] text-emerald-300 border border-emerald-400/30">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>NIC Telemetry Active</span>
              </span>
              <span className="font-mono text-[10px] font-semibold text-blue-200 bg-[#0e2747] px-1.5 py-0.5 rounded border border-blue-400/20">
                2026–27
              </span>
            </div>

            {/* Exit to Citizen Portal */}
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition-colors text-xs font-semibold"
            >
              <ArrowLeft size={13} className="text-blue-300" />
              <span>Exit to Citizen Portal</span>
            </Link>

            {/* Sign Out (High Visibility Government Red/Crimson Accent) */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-rose-200 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 transition-colors cursor-pointer text-xs font-bold"
            >
              <LogOut size={13} className="text-rose-300" />
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

        {/* 3. MAIN WORKSPACE CONTENT CONTAINER - INDEPENDENT SCROLL */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
          {/* Top Admin Workspace Header */}
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
                    University Innovation & Academic Administration Command Center
                  </h2>
                </div>
              </div>

              {/* Right Actions: Language Switcher, Notifications, User */}
              <div className="flex items-center gap-3 text-xs">
                {/* Academic Term Badge */}
                <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Academic Term 2026–27 • R&D Active
                </span>

                {/* Language Switcher */}
                <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700">
                  <Globe size={13} className="text-slate-500" />
                  <select
                    value={i18n.language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="bg-transparent font-semibold focus:outline-none cursor-pointer text-xs"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="gu">ગુજરાતી (Gujarati)</option>
                  </select>
                </div>

                <div className="h-5 w-px bg-slate-200" />

                <NotificationDropdown />

                <div className="hidden md:flex items-center gap-2 pl-1">
                  <span className="font-bold text-slate-800">{adminName}</span>
                  <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase">
                    Dean / Admin
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Workspace Outlet (Full Width, No Side Gaps) */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
