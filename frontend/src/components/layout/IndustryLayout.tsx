import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Target,
  GraduationCap,
  Users,
  FolderGit2,
  Coins,
  BarChart3,
  Building,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  ShieldCheck,
  Check,
  Globe,
  Radio,
  Building2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from '../common/NotificationDropdown';
import GovernmentUtilityBar from '../common/GovernmentUtilityBar';

export default function IndustryLayout() {
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
    { to: '/industry-admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/industry-admin/challenges', label: 'Challenge Discovery', icon: Target },
    { to: '/industry-admin/collaborations', label: 'University Collaboration', icon: GraduationCap },
    { to: '/industry-admin/team', label: 'Industry Team', icon: Users },
    { to: '/industry-admin/projects', label: 'Projects', icon: FolderGit2 },
    { to: '/industry-admin/funding', label: 'Funding', icon: Coins },
    { to: '/industry-admin/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/industry-admin/organization', label: 'My Organization', icon: Building },
  ];

  const isCurrent = (to: string, exact = false) => {
    if (exact) {
      return location.pathname === to || (to === '/industry-admin/dashboard' && location.pathname === '/industry-admin');
    }
    return location.pathname.startsWith(to) && location.pathname !== '/industry-admin';
  };

  const orgName = user?.organizationName || 'Tata Steel Utilities & Infrastructure';
  const adminName = user?.name || 'Suresh Nambiar';
  const industryDomain = 'Urban Infrastructure & Smart Utilities';
  const orgLocation = 'Jamshedpur';

  return (
    <div className="h-screen flex flex-col bg-[#F1F5F9] overflow-hidden">
      {/* 1. Top Government of India Global Bar */}
      <GovernmentUtilityBar />

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* 2. LEFT VERTICAL SIDEBAR NAVIGATION - FIXED STATIONARY IN PLACE */}
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
                  <Building2 size={19} className="text-amber-400" />
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
                    INDUSTRY PARTNER PORTAL
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

            {/* Organization Profile Verified Identity Card */}
            <div className="mx-2.5 my-2.5 p-3 rounded-xl bg-gradient-to-br from-[#1b4374] to-[#13355d] border border-[#2b5d99]/80 shadow-md flex items-start gap-3 shrink-0">
              <div className="relative shrink-0 mt-0.5">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0B192C] to-[#1E3E62] border border-amber-400/60 flex items-center justify-center text-amber-400 font-black text-sm shadow-xs">
                  TS
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#13355d] flex items-center justify-center text-white shadow-xs" title="Official Verified Industry Partner">
                  <Check size={9} strokeWidth={3.5} />
                </span>
              </div>
              <div className="overflow-hidden min-w-0 flex-1">
                <p className="font-extrabold text-xs text-white truncate" title={orgName}>
                  {orgName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="inline-block text-[8px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.2 rounded font-mono uppercase font-bold tracking-wider">
                    INDUSTRY ADMIN
                  </span>
                  <span className="text-[8.5px] text-emerald-300 font-mono flex items-center gap-1 bg-emerald-950/40 px-1 py-0.2 rounded border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                  </span>
                </div>
                <p className="text-[10px] text-blue-200/90 truncate mt-1">
                  {industryDomain}
                </p>
                <p className="text-[9.5px] text-blue-300/80 font-mono">
                  {orgLocation}
                </p>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="px-2.5 py-2">
              <span className="px-2 text-[10px] font-extrabold text-blue-200/60 uppercase tracking-widest block mb-1">
                INDUSTRY OPERATIONS
              </span>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const active = isCurrent(item.to, item.exact);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all relative ${
                        active
                          ? 'bg-[#1b487e] text-white shadow-xs border border-[#3b74b6] font-bold'
                          : 'text-blue-100 hover:bg-[#183d6a] hover:text-white'
                      }`}
                    >
                      {active && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-amber-400 rounded-r-full" />
                      )}
                      <Icon
                        size={16}
                        className={active ? 'text-amber-400 shrink-0' : 'text-blue-300 shrink-0'}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Sidebar Footer Controls */}
          <div className="p-3 border-t border-[#224d80] bg-[#0e2442]/90 space-y-2 shrink-0">
            <div className="flex items-center justify-between text-[11px] text-blue-200/90 bg-[#163864]/80 p-2 rounded-lg border border-[#2b588c]/60">
              <span className="font-mono text-[10px] text-amber-300 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Partnership Active
              </span>
              <span className="text-[10px] font-bold text-white bg-blue-900/60 px-1.5 py-0.5 rounded border border-blue-400/30">
                2026–27
              </span>
            </div>

            <div className="flex items-center gap-1.5 pt-1">
              <Link
                to="/"
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md bg-[#183b66] hover:bg-[#1e477a] text-[11px] text-blue-100 hover:text-white transition-colors border border-[#28578c]"
                title="Exit to Citizen Portal"
              >
                <ArrowLeft size={13} />
                <span>Exit Portal</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center p-1.5 rounded-md bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-100 transition-colors border border-rose-800/40 cursor-pointer"
                title="Sign Out"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </aside>

        {/* 3. RIGHT MAIN CONTENT AREA - INDEPENDENT SCROLLING */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#F1F5F9]">
          {/* Top Secondary Header Bar */}
          <header className="bg-white border-b border-slate-200/90 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 shadow-2xs z-10">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <Menu size={18} />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">
                    MINISTRY OF EDUCATION & SMART INDIA HACKATHON INNOVATION ECOSYSTEM
                  </span>
                </div>
                <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight truncate">
                  Industry Innovation & Academic Partnership Console
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>Academic Term 2026–27 • Industry Co-Dev Active</span>
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5">
                <Globe size={12} className="text-slate-500" />
                <select
                  aria-label="Language selection"
                  value={i18n.language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-transparent text-[11px] text-slate-700 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी</option>
                </select>
              </div>

              {/* Real Notifications Dropdown */}
              <NotificationDropdown />

              {/* Profile Pill */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-7 h-7 rounded-md bg-[#133054] text-amber-300 font-black text-xs flex items-center justify-center border border-slate-300">
                  TS
                </div>
                <div className="hidden md:block text-left">
                  <span className="text-xs font-bold text-slate-900 block leading-tight">
                    {adminName}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 uppercase font-bold">
                    INDUSTRY ADMIN
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Scrollable Workspace Container */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 min-h-0 bg-[#F1F5F9]">
            <div className="max-w-7xl mx-auto space-y-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
