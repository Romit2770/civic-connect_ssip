import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  ClipboardList,
  CheckCircle2,
  FolderGit2,
  MapPin,
  FileText,
  History,
  UserCheck,
  Menu,
  X,
  LogOut,
  Wifi,
  WifiOff,
  HardHat,
  ChevronRight,
  ShieldCheck,
  Compass,
  Camera,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from '../common/NotificationDropdown';
import GovernmentUtilityBar from '../common/GovernmentUtilityBar';

export default function FieldWorkerLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/field-worker/dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { to: '/field-worker/challenges', label: 'Assigned Challenges', icon: ClipboardList, badge: '35' },
    { to: '/field-worker/verification', label: 'Field Verification', icon: CheckCircle2, badge: '10' },
    { to: '/field-worker/before-after', label: 'Before / After', icon: Layers, badge: null },
    { to: '/field-worker/projects', label: 'Project Monitoring', icon: FolderGit2, badge: '8' },
    { to: '/field-worker/map', label: 'Field Map (GIS)', icon: MapPin, badge: null },
    { to: '/field-worker/reports', label: 'Reports', icon: FileText, badge: null },
    { to: '/field-worker/activity', label: 'My Activity', icon: History, badge: null },
    { to: '/field-worker/profile', label: 'Profile', icon: UserCheck, badge: null },
  ];

  // Mobile bottom quick bar items
  const mobileNavItems = [
    { to: '/field-worker/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/field-worker/challenges', label: 'Assignments', icon: ClipboardList },
    { to: '/field-worker/verification', label: 'Verify', icon: CheckCircle2, highlight: true },
    { to: '/field-worker/projects', label: 'Projects', icon: FolderGit2 },
    { to: '/field-worker/map', label: 'Map', icon: MapPin },
    { to: '/field-worker/reports', label: 'Reports', icon: FileText },
  ];

  const isCurrent = (to: string) => {
    if (to === '/field-worker/dashboard') {
      return location.pathname === '/field-worker/dashboard';
    }
    return location.pathname.startsWith(to);
  };

  const workerName = user?.name || 'Er. Rajesh Patel';
  const designation = user?.designation || 'Senior Field Inspection Officer';
  const badgeId = user?.badgeNumber || 'GOV-FO-PWD-101';
  const municipality = 'Anand Municipal Corporation (ULB)';

  return (
    <div className="h-screen flex flex-col bg-[#F8FAFC] overflow-hidden text-slate-800">
      {/* 1. Official Government Top Utility Bar */}
      <GovernmentUtilityBar />

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* 2. DESKTOP SIDEBAR */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-[#133054] via-[#163864] to-[#102747] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:h-full lg:translate-x-0 border-r border-[#224d80] shadow-xl shrink-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col flex-1 overflow-y-auto min-h-0">
            {/* National Tricolor Accent Ribbon */}
            <div className="h-1.5 w-full flex shrink-0 shadow-xs">
              <div className="h-full flex-1 bg-[#ff9933]" />
              <div className="h-full flex-1 bg-white" />
              <div className="h-full flex-1 bg-[#138808]" />
            </div>

            {/* Official Portal Header */}
            <div className="p-3.5 border-b border-[#224d80] bg-[#102a4d]/90 flex items-center justify-between shrink-0">
              <Link to="/field-worker/dashboard" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#1d4b84] to-[#123661] border border-amber-400/40 flex items-center justify-center text-white shadow-sm group-hover:border-amber-400 transition-colors shrink-0">
                  <HardHat size={20} className="text-amber-400" />
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
                    GOVERNMENT FIELD OPERATIONS
                  </span>
                </div>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close Sidebar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Officer Duty Profile Snippet */}
            <div className="mx-3 my-3 p-2.5 rounded-lg bg-[#0e2440]/80 border border-[#224d80] flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center font-bold text-xs shrink-0">
                FP
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-white truncate">{workerName}</p>
                </div>
                <p className="text-[10px] text-slate-300 truncate">{designation}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] font-mono text-emerald-300">{badgeId}</span>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="px-2 py-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isCurrent(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                      active
                        ? 'bg-gradient-to-r from-amber-400/25 to-blue-600/30 text-amber-300 border-l-3 border-amber-400 shadow-sm'
                        : 'text-slate-200 hover:bg-white/8 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={17} className={active ? 'text-amber-400' : 'text-slate-300'} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          active
                            ? 'bg-amber-400 text-slate-900'
                            : 'bg-white/15 text-slate-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer with Logout & Node Info */}
          <div className="p-3 border-t border-[#224d80] bg-[#0d223a] shrink-0 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span>ULB Node:</span>
              <span className="text-amber-300 font-mono font-bold">Anand ULB-14</span>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-red-300 hover:text-white bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 rounded-lg transition-colors"
            >
              <LogOut size={14} />
              <span>Official Sign Out</span>
            </button>
          </div>
        </aside>

        {/* 3. MAIN WORKSPACE AREA */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Header Bar */}
          <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                aria-label="Open Sidebar"
              >
                <Menu size={20} />
              </button>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Urban Local Body:
                </span>
                <span className="text-xs font-extrabold text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                  {municipality}
                </span>
              </div>
            </div>

            {/* Right Status Controls */}
            <div className="flex items-center gap-2.5">
              {/* Network / Offline Mode Indicator */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                  isOnline
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                }`}
                title={isOnline ? 'Network Connected • Real-time Sync Active' : 'Offline Mode • Form Data Preserved in Local Cache'}
              >
                {isOnline ? <Wifi size={13} className="text-emerald-600" /> : <WifiOff size={13} className="text-amber-600" />}
                <span className="hidden md:inline">{isOnline ? 'Online (Real-time)' : 'Offline (Preserving Drafts)'}</span>
              </div>

              {/* Role Badge */}
              <div className="px-2.5 py-0.5 rounded bg-blue-900 text-white font-extrabold text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-xs">
                <HardHat size={12} className="text-amber-400" />
                <span>FIELD WORKER</span>
              </div>

              <NotificationDropdown />
            </div>
          </header>

          {/* Dynamic Page Outlet with Mobile Padding to clear Bottom Bar */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 lg:pb-6 focus:outline-none">
            <Outlet />
          </main>
        </div>
      </div>

      {/* 4. MOBILE-FIRST BOTTOM NAVIGATION DOCK (Sticky on Smartphones) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg flex items-center justify-around">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const active = isCurrent(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-1.5 rounded-lg transition-colors ${
                item.highlight
                  ? 'bg-blue-900 text-white shadow-sm'
                  : active
                  ? 'text-blue-900 font-extrabold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon size={item.highlight ? 18 : 17} className={item.highlight ? 'text-amber-400' : active ? 'text-blue-900' : 'text-slate-500'} />
              <span className={`text-[10px] mt-0.5 tracking-tight ${item.highlight ? 'text-white font-extrabold' : active ? 'font-bold text-blue-900' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
