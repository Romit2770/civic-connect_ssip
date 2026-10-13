import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  FileSpreadsheet,
  MapPin,
  Building2,
  Users,
  BarChart3,
  ShieldCheck,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  Globe,
  Bell,
  Clock,
  Radio,
  ChevronRight,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from '../common/NotificationDropdown';
import GovernmentUtilityBar from '../common/GovernmentUtilityBar';

export default function AdminLayout() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/admin', label: 'Operations Command Center', icon: LayoutDashboard, exact: true },
    { to: '/admin/issues', label: 'Complaint Queue & Triage', icon: FileSpreadsheet },
    { to: '/admin/map', label: 'City GIS Spatial Map', icon: MapPin },
    { to: '/admin/departments', label: 'Municipal Departments', icon: Building2 },
    { to: '/admin/officers', label: 'Field Officer Force Roster', icon: Users },
    { to: '/admin/credentials', label: 'Credential Management (Apex Control)', icon: KeyRound },
    { to: '/admin/analytics', label: 'Resolution & SLA Analytics', icon: BarChart3 },
  ];

  const isCurrent = (to: string, exact = false) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to) && location.pathname !== '/admin';
  };

  const adminName = user?.name || 'Municipal Commissioner';

  return (
    <div className="h-screen flex flex-col bg-[#F1F5F9] overflow-hidden">
      {/* 1. Top Government of India Global Utility Bar */}
      <GovernmentUtilityBar />

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* 2. LEFT VERTICAL SIDEBAR NAVIGATION - FIXED ROYAL NAVY */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-[#0f2442] via-[#133054] to-[#0d1e36] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:h-full lg:translate-x-0 border-r border-[#1e4474] shadow-2xl shrink-0 ${
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

            {/* Official Apex Portal Header */}
            <div className="p-3.5 border-b border-[#1e4474] bg-[#0c1f38] flex items-center justify-between shrink-0">
              <Link to="/" className="flex items-center gap-2.5 group" title="Return to CivicConnect National Portal">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-700 to-indigo-900 border border-amber-400/50 flex items-center justify-center text-white shadow-sm group-hover:border-amber-400 transition-colors shrink-0">
                  <ShieldCheck size={20} className="text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm tracking-tight text-white block group-hover:text-amber-300 transition-colors">
                      CivicConnect
                    </span>
                    <span className="text-[8px] font-mono font-bold bg-amber-400/20 text-amber-300 px-1 py-0.5 rounded border border-amber-400/40">
                      GOV.IN
                    </span>
                  </div>
                  <span className="text-[9px] text-amber-400 font-extrabold uppercase tracking-wider block">
                    STATE APEX COMMAND • SUPER ADMIN
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

            {/* Super Admin Verified Authority Identity Card */}
            <div className="mx-2.5 my-2.5 p-3 rounded-xl bg-gradient-to-br from-[#193d6b] to-[#122c4d] border border-[#26538c] shadow-md flex items-start gap-3 shrink-0">
              <div className="relative shrink-0 mt-0.5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0B192C] to-[#1E3E62] ring-2 ring-amber-400/90 flex items-center justify-center text-amber-400 font-black text-sm shadow-xs">
                  MC
                </div>
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#122c4d] flex items-center justify-center text-white shadow-xs"
                  title="State Verified Super Admin Authority"
                >
                  <ShieldCheck size={10} strokeWidth={3} />
                </span>
              </div>
              <div className="overflow-hidden min-w-0 flex-1">
                <p className="font-extrabold text-xs text-white truncate" title={adminName}>
                  {adminName}
                </p>
                <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                  <span className="inline-block text-[8px] bg-red-500/20 text-red-300 border border-red-400/40 px-1.5 py-0.5 rounded font-mono uppercase font-bold tracking-wider">
                    SUPER ADMIN
                  </span>
                  <span className="text-[8.5px] text-emerald-300 font-mono flex items-center gap-1 bg-emerald-950/40 px-1 py-0.5 rounded border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Apex Control
                  </span>
                </div>
                <p className="text-[9.5px] text-blue-200/90 truncate mt-1 font-medium">
                  State Municipal Commissioner Desk
                </p>
                <p className="text-[9px] text-blue-300/80 font-mono truncate">
                  Dept of Housing & Urban Affairs
                </p>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="px-2.5 py-2">
              <span className="px-2 text-[10px] font-extrabold text-blue-200/60 uppercase tracking-widest block mb-1">
                MUNICIPAL APEX GOVERNANCE
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
                          ? 'border-amber-400 bg-gradient-to-r from-[#215394] via-[#1a4478] to-[#143660] text-white font-extrabold shadow-md'
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
          <div className="p-3 border-t border-[#1e4474] bg-[#0c1f38] space-y-1.5 text-xs shrink-0">
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#143763] text-[10.5px] text-emerald-300 border border-emerald-400/30 shadow-xs">
              <span className="flex items-center gap-1.5 font-bold">
                <Radio size={12} className="animate-pulse text-emerald-400" />
                <span>Control Room Live</span>
              </span>
              <span className="font-mono text-[9px] text-amber-300 bg-amber-400/15 px-1.5 py-0.5 rounded border border-amber-400/30">
                24×7 Active
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

        {/* 3. MAIN ADMIN WORKSPACE CONTAINER - INDEPENDENT SCROLL */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
          {/* Top Header */}
          <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
            {/* National Tricolor Accent Ribbon */}
            <div className="h-[2.5px] bg-gradient-to-r from-[#ff9933] via-white to-[#138808] w-full" />

            <div className="px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-1.5 rounded-md text-slate-600 hover:bg-slate-100 cursor-pointer"
                  aria-label="Open sidebar"
                >
                  <Menu size={18} />
                </button>

                <div className="flex items-center gap-2.5">
                  {/* Official Emblem Representation */}
                  <div className="w-8 h-8 rounded-lg bg-[#0f2442] text-amber-400 flex items-center justify-center font-serif font-black text-xs shadow-xs border border-amber-500/30 shrink-0">
                    🏛️
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] font-black text-[#0f2442] uppercase tracking-wider bg-amber-50 text-amber-900 px-1.5 py-0.2 rounded border border-amber-200">
                        सत्यमेव जयते • GOVT. OF INDIA
                      </span>
                      <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 font-mono">
                        APEX-STATE-COMMAND • v2.6
                      </span>
                    </div>
                    <h2 className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 tracking-tight">
                      Municipal Grievance Command & Control System (State Operations)
                    </h2>
                  </div>
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-[10.5px] shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>State Command Live • 48 Wards Online</span>
                </div>

                <NotificationDropdown />

                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="w-7.5 h-7.5 rounded-full bg-[#133054] text-amber-400 flex items-center justify-center font-black text-xs ring-2 ring-amber-400/40 shadow-xs">
                    MC
                  </div>
                  <div className="hidden md:block text-left">
                    <span className="text-xs font-black text-slate-900 block leading-tight">
                      {adminName}
                    </span>
                    <span className="text-[9px] text-red-800 font-black bg-red-50 px-1 py-0.2 rounded border border-red-200 uppercase tracking-wider">
                      SUPER ADMIN
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Body Viewport */}
          <main className="flex-1 px-3 sm:px-5 py-3 w-full">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
