import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Target,
  Handshake,
  GraduationCap,
  Wrench,
  FolderGit2,
  MessageSquare,
  UserCheck,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  ShieldCheck,
  Check,
  Radio,
  Building2,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from '../common/NotificationDropdown';
import GovernmentUtilityBar from '../common/GovernmentUtilityBar';

export default function CorporatePartnerLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/corporate-partner/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/corporate-partner/opportunities', label: 'Recommended Opportunities', icon: Target },
    { to: '/corporate-partner/collaborations', label: 'My Collaborations', icon: Handshake },
    { to: '/corporate-partner/mentorship', label: 'Mentorship', icon: GraduationCap },
    { to: '/corporate-partner/technical-support', label: 'Technical Support', icon: Wrench },
    { to: '/corporate-partner/projects', label: 'Project Progress', icon: FolderGit2 },
    { to: '/corporate-partner/communication', label: 'Communication', icon: MessageSquare },
    { to: '/corporate-partner/profile', label: 'My Profile', icon: UserCheck },
  ];

  const isCurrent = (to: string, exact = false) => {
    if (exact) {
      return (
        location.pathname === to ||
        (to === '/corporate-partner/dashboard' && location.pathname === '/corporate-partner')
      );
    }
    return location.pathname.startsWith(to) && location.pathname !== '/corporate-partner';
  };

  const partnerName = user?.name || 'Rohan Mittal';
  const designation = 'Senior Technical Consultant';
  const orgName = user?.organizationName || 'Jindal Steel & Power Ltd.';
  const departmentName = 'Corporate Technology & Innovation Group';

  return (
    <div className="h-screen flex flex-col bg-[#F1F5F9] overflow-hidden">
      {/* 1. Top Government of India Global Utility Bar */}
      <GovernmentUtilityBar />

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* 2. LEFT VERTICAL SIDEBAR NAVIGATION - FIXED ROYAL NAVY */}
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
                    <span className="text-[8px] font-mono font-bold bg-amber-400/15 text-amber-300 px-1 py-0.5 rounded border border-amber-400/30">
                      GOV.IN
                    </span>
                  </div>
                  <span className="text-[9px] text-amber-400 font-extrabold uppercase tracking-wider block">
                    CORPORATE PARTNER PORTAL
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

            {/* Corporate Partner Verified Identity Card */}
            <div className="mx-2.5 my-2.5 p-3 rounded-xl bg-gradient-to-br from-[#1b4374] to-[#13355d] border border-[#2b5d99]/80 shadow-md flex items-start gap-3 shrink-0">
              <div className="relative shrink-0 mt-0.5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0B192C] to-[#1E3E62] ring-2 ring-amber-400/90 flex items-center justify-center text-amber-400 font-black text-sm shadow-xs">
                  RM
                </div>
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#13355d] flex items-center justify-center text-white shadow-xs"
                  title="Verified Corporate Industry Partner"
                >
                  <Check size={9} strokeWidth={3.5} />
                </span>
              </div>
              <div className="overflow-hidden min-w-0 flex-1">
                <p className="font-extrabold text-xs text-white truncate" title={partnerName}>
                  {partnerName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="inline-block text-[8px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded font-mono uppercase font-bold tracking-wider">
                    CORPORATE PARTNER
                  </span>
                  <span className="text-[8.5px] text-emerald-300 font-mono flex items-center gap-1 bg-emerald-950/40 px-1 py-0.5 rounded border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Active
                  </span>
                </div>
                <p className="text-[10px] text-blue-200/90 truncate mt-1 font-medium">
                  {designation}
                </p>
                <p className="text-[9.5px] text-blue-300/80 font-mono truncate">
                  {orgName}
                </p>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="px-2.5 py-2">
              <span className="px-2 text-[10px] font-extrabold text-blue-200/60 uppercase tracking-widest block mb-1">
                PARTNER PARTICIPATION
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
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all border-l-[3.5px] group ${
                        active
                          ? 'border-amber-400 bg-gradient-to-r from-[#215394] via-[#1c477f] to-[#153967] text-white font-extrabold shadow-md'
                          : 'border-transparent text-blue-100/90 hover:bg-white/10 hover:text-white font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          size={16}
                          className={
                            active
                              ? 'text-amber-400 shrink-0'
                              : 'text-blue-200/70 group-hover:text-amber-300 shrink-0'
                          }
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {active && <ChevronRight size={13} className="text-amber-400 shrink-0" />}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Sidebar Footer Controls */}
          <div className="p-3 border-t border-[#224d80] bg-[#0d233e] space-y-1.5 text-xs shrink-0">
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#143763] text-[10.5px] text-emerald-300 border border-emerald-400/30 shadow-xs">
              <span className="flex items-center gap-1.5 font-bold">
                <Radio size={12} className="animate-pulse text-emerald-400" />
                <span>Partnership Active</span>
              </span>
              <span className="font-mono text-[9px] text-amber-300 bg-amber-400/15 px-1.5 py-0.5 rounded border border-amber-400/30">
                2026–27
              </span>
            </div>

            <Link
              to="/industry-admin/dashboard"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition-colors font-medium text-xs"
            >
              <ArrowLeft size={14} className="text-blue-200" />
              <span>Exit to Industry Portal</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-rose-200 hover:text-white hover:bg-rose-900/50 transition-colors cursor-pointer font-bold text-xs border border-rose-400/30"
            >
              <LogOut size={14} className="text-rose-300" />
              <span>{t('nav.logout') || 'Sign Out'}</span>
            </button>
          </div>
        </aside>

        {/* Sidebar Overlay on Mobile */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/60 z-40 lg:hidden backdrop-blur-sm"
          />
        )}

        {/* 3. MAIN WORKSPACE CONTAINER - INDEPENDENT SCROLL */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
          {/* Top Header */}
          <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
            <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100 cursor-pointer"
                  aria-label="Open sidebar"
                >
                  <Menu size={20} />
                </button>

                <div className="hidden sm:block">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Ministry of Education & Industry Collaboration • Innovation Ecosystem
                  </span>
                  <h2 className="text-sm font-extrabold text-slate-900">
                    Corporate Partner Mentorship & Technical Contributions
                  </h2>
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-2.5">
                <div className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 text-slate-700 font-semibold border border-slate-200 text-[11px] shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Corporate Mentorship Active</span>
                </div>

                <NotificationDropdown />

                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-[#133054] text-white flex items-center justify-center font-bold text-xs ring-1 ring-slate-300">
                    RM
                  </div>
                  <div className="hidden md:block text-left">
                    <span className="text-xs font-bold text-slate-800 block leading-tight">
                      {partnerName}
                    </span>
                    <span className="text-[10px] text-blue-900 font-bold bg-blue-50 px-1 py-0.5 rounded border border-blue-200">
                      CORPORATE PARTNER
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Body Viewport */}
          <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
