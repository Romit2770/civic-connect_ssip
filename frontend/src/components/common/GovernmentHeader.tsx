import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home,
  FilePlus2,
  Search,
  MapPin,
  LogIn,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Shield,
  Bell,
  Globe,
  HelpCircle,
  Phone,
  BarChart3,
  Users,
  Layers,
  ChevronRight,
  Sparkles,
  ClipboardList,
  ShieldCheck,
  Check,
  Building2,
  AlertCircle,
  FileText,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { apiClient } from '../../api/client';
import { NotificationItem } from '../../types';
import { NationalEmblem, SwachhBharatLogo, DigitalIndiaLogo } from './GovernmentBrandLogos';

export default function GovernmentHeader() {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const { socket } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Load unread notification count
  useEffect(() => {
    if (isAuthenticated) {
      loadUnreadCount();

      if (socket) {
        socket.on('notification:new', () => {
          setUnreadCount((prev) => prev + 1);
        });
      }
    } else {
      setUnreadCount(0);
    }
  }, [isAuthenticated, socket]);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    if (drawerOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const loadUnreadCount = async () => {
    try {
      const res = await apiClient.get('/notifications');
      if (res.data.success) {
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch (e) {
      // Ignore
    }
  };

  const handleLogout = () => {
    logout();
    setDrawerOpen(false);
    navigate('/');
  };

  const isCurrent = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  const renderNavLink = (
    to: string,
    label: string,
    Icon: any,
    badge?: number | string
  ) => {
    const active = isCurrent(to);
    return (
      <Link
        key={to}
        to={to}
        onClick={closeDrawer}
        className={`flex items-center justify-between px-3.5 py-2.5 rounded-md text-xs font-semibold transition-all min-h-[44px] ${
          active
            ? 'bg-blue-900 text-white font-bold border-l-4 border-amber-400 pl-3 shadow-xs'
            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Icon
            size={16}
            className={active ? 'text-amber-300' : 'text-slate-500'}
          />
          <span>{label}</span>
        </div>
        {typeof badge === 'number' && badge > 0 && (
          <span className="bg-red-600 text-white font-bold text-[10px] px-1.5 py-0.5 rounded-full">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </Link>
    );
  };

  const isEnglish = i18n.language === 'en';

  return (
    <>
      {/* 2. MAIN INSTITUTIONAL BRAND HEADER (WHITE BACKGROUND) */}
      <header className="bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between gap-4">
          {/* LEFT: Ashoka Lion Capital Emblem + Ministry Text */}
          <Link
            to="/"
            className="flex items-center gap-3.5 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-lg p-0.5 shrink-0"
          >
            <NationalEmblem className="h-12 sm:h-14 w-auto shrink-0" />
            <div className="flex flex-col">
              <span className="font-extrabold text-xs sm:text-[13px] text-[#0c2340] tracking-wide leading-tight">
                {isEnglish ? (
                  'GOVERNMENT OF INDIA'
                ) : (
                  <>
                    {t('common.govIndiaHindi')}{' '}
                    <span className="font-normal text-slate-400">|</span>{' '}
                    {t('common.govIndia')}
                  </>
                )}
              </span>
              <span className="text-[11px] sm:text-xs text-slate-600 font-medium leading-tight mt-0.5">
                {t('common.ministry')}
              </span>
            </div>
          </Link>

          {/* CENTER: Main CivicConnect Branding with National Tag */}
          <div className="hidden md:flex flex-col items-center text-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl lg:text-3xl font-extrabold text-[#0c2b4d] tracking-tight">
                {t('nav.brandName')}
              </span>
              <span className="bg-[#fef3c7] border border-[#fde68a] text-[#92400e] font-extrabold text-[10px] lg:text-[11px] px-2 py-0.5 rounded shadow-2xs">
                {isEnglish
                  ? 'NATIONAL GRIEVANCE PORTAL'
                  : i18n.language === 'gu'
                  ? 'રાષ્ટ્રીય ફરિયાદ પોર્ટલ'
                  : 'राष्ट्रीय जन शिकायत पोर्टल'}
              </span>
            </div>
            <span className="text-[11px] lg:text-xs text-slate-500 font-medium tracking-normal mt-0.5">
              {t('nav.brandSubtitle')}
            </span>
          </div>

          {/* RIGHT: Swachh Bharat Mission & Digital India Partner Logos */}
          <div className="flex items-center gap-3 lg:gap-4 shrink-0">
            <div className="hidden sm:block">
              <SwachhBharatLogo className="h-8 lg:h-9" />
            </div>
            <div className="h-8 w-px bg-slate-200 hidden lg:block" />
            <div className="hidden lg:block">
              <DigitalIndiaLogo className="h-8 lg:h-9" />
            </div>
          </div>
        </div>
      </header>

      {/* 3. GOVERNMENT PRIMARY NAVIGATION BAR (DEEP NAVY BLUE #0c2b4d) */}
      <nav
        className="bg-[#0c2b4d] text-white sticky top-0 z-40 border-b border-slate-700/80 shadow-md"
        aria-label="Main Navigation"
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 flex items-center justify-between h-12 sm:h-13">
          {/* LEFT: Government Nav Links */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-1">
            {/* Home Tab */}
            <Link
              to="/"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
                location.pathname === '/'
                  ? 'bg-[#07192c] text-amber-300 shadow-inner border border-blue-400/40'
                  : 'text-slate-200 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Home size={15} className={location.pathname === '/' ? 'text-amber-300' : 'text-slate-300'} />
              <span>{t('nav.home')}</span>
            </Link>

            {/* Report an Issue */}
            <Link
              to="/report"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
                location.pathname === '/report'
                  ? 'bg-[#07192c] text-amber-300 shadow-inner border border-blue-400/40'
                  : 'text-slate-200 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <FilePlus2 size={15} className="text-amber-400" />
              <span>{t('nav.reportIssue')}</span>
            </Link>

            {/* Track Grievance */}
            <Link
              to="/track"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
                location.pathname === '/track'
                  ? 'bg-[#07192c] text-amber-300 shadow-inner border border-blue-400/40'
                  : 'text-slate-200 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Search size={15} className="text-cyan-400" />
              <span>{t('nav.track')}</span>
            </Link>

            {/* Ward Map & Heatmap */}
            <Link
              to="/map"
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
                location.pathname === '/map'
                  ? 'bg-[#07192c] text-amber-300 shadow-inner border border-blue-400/40'
                  : 'text-slate-200 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <MapPin size={15} className="text-emerald-400" />
              <span>{t('nav.wardMap')}</span>
            </Link>

            {/* Resolution Analytics */}
            <Link
              to="/admin/analytics"
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
                location.pathname.startsWith('/admin/analytics')
                  ? 'bg-[#07192c] text-amber-300 shadow-inner border border-blue-400/40'
                  : 'text-slate-200 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <BarChart3 size={15} className="text-purple-300" />
              <span>{t('nav.analytics')}</span>
            </Link>

            {/* Municipal Departments */}
            <Link
              to="/admin/departments"
              className={`hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
                location.pathname.startsWith('/admin/departments')
                  ? 'bg-[#07192c] text-amber-300 shadow-inner border border-blue-400/40'
                  : 'text-slate-200 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Layers size={15} className="text-amber-300" />
              <span>{t('nav.departments')}</span>
            </Link>
          </div>

          {/* RIGHT: Official Login CTA & Hamburger Drawer Toggle */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 pl-2">
            {isAuthenticated ? (
              <Link
                to="/profile"
                className="flex items-center gap-2 bg-[#ff9900] hover:bg-[#e68a00] text-slate-950 font-extrabold px-3 sm:px-4 py-1.5 rounded-lg text-xs transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              >
                <div className="w-5 h-5 rounded-full bg-slate-950 text-white flex items-center justify-center font-bold text-[10px]">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="truncate max-w-[100px] sm:max-w-[120px]">
                  {user?.name}
                </span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="bg-[#ff9900] hover:bg-[#e68a00] text-slate-950 font-extrabold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-[13px] transition-all shadow-sm flex items-center gap-1.5 cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-amber-300 shrink-0"
              >
                <LogIn size={15} className="font-bold" />
                <span>{t('nav.login')}</span>
              </Link>
            )}

            {/* Hamburger Menu Button */}
            <button
              ref={menuButtonRef}
              onClick={() => setDrawerOpen(true)}
              aria-label={t('nav.menu')}
              aria-expanded={drawerOpen}
              className="p-1.5 sm:p-2 text-white hover:bg-slate-800/90 rounded-md transition-colors cursor-pointer relative focus:outline-none focus:ring-2 focus:ring-amber-400 shrink-0"
            >
              <Menu size={22} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-[#0c2b4d] animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* 4. MAROON GOVERNMENT NEWS TICKER / NOTIFICATION RIBBON */}
      <div className="bg-[#800000] text-white border-b border-red-950/60 py-1.5 px-3 sm:px-4 overflow-hidden shadow-inner">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          {/* LATEST UPDATES BADGE */}
          <div className="bg-[#f59e0b] text-slate-950 font-extrabold text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded flex items-center gap-1.5 shrink-0 shadow-xs uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping shrink-0" />
            <span>{isEnglish ? 'LATEST UPDATES:' : t('common.latestUpdates')}</span>
          </div>

          {/* Continuous Sliding Marquee News Content */}
          <div className="w-full overflow-hidden">
            <div className="animate-continuous-ticker flex items-center gap-8 text-xs font-semibold text-slate-100 whitespace-nowrap">
              <span className="flex items-center gap-1.5">
                📷 <span>{t('common.aiMarquee')}</span>
              </span>
              <span className="text-amber-400 font-bold">•</span>
              <span className="flex items-center gap-1.5">
                📞 <span>{t('common.helplineText')}</span>
              </span>
              <span className="text-amber-400 font-bold">•</span>
              <span className="flex items-center gap-1.5">
                🏛️ <span>{t('common.smartCitiesMarquee')}</span>
              </span>
              <span className="text-amber-400 font-bold">•</span>
              <span className="flex items-center gap-1.5">
                ⚡ <span>{t('common.slaMarquee')}</span>
              </span>
              {/* Repeated for infinite smooth flow */}
              <span className="text-amber-400 font-bold">•</span>
              <span className="flex items-center gap-1.5">
                📷 <span>{t('common.aiMarquee')}</span>
              </span>
              <span className="text-amber-400 font-bold">•</span>
              <span className="flex items-center gap-1.5">
                📞 <span>{t('common.helplineText')}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. SLIDE-OVER GOVERNMENT SERVICES NAVIGATION DRAWER */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={closeDrawer}
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div
              ref={drawerRef}
              className="w-screen max-w-md bg-white shadow-2xl flex flex-col focus:outline-none"
            >
              {/* Drawer Header */}
              <div className="bg-[#0a2540] text-white p-4 flex items-center justify-between border-b border-blue-900">
                <div className="flex items-center gap-2.5">
                  <NationalEmblem className="h-8 w-auto" />
                  <div>
                    <h2 className="font-extrabold text-sm text-white">
                      {t('nav.brandName')} Portal
                    </h2>
                    <p className="text-[10px] text-slate-300">
                      {t('nav.brandSubtitle')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeDrawer}
                  aria-label={t('nav.closeMenu')}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* User Session Banner (if logged in) */}
                {isAuthenticated ? (
                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-sm">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-900">{user?.name}</p>
                        <p className="text-[10px] text-slate-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title={t('nav.logout')}
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-900 to-indigo-950 text-white space-y-3">
                    <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                      <ShieldCheck size={16} />
                      <span>{t('nav.citizenPortal')}</span>
                    </div>
                    <p className="text-xs text-slate-200">
                      {t('nav.signInPrompt')}
                    </p>
                    <div className="flex gap-2 pt-1">
                      <Link
                        to="/login"
                        onClick={closeDrawer}
                        className="flex-1 bg-[#ff9900] hover:bg-[#e68a00] text-slate-950 font-extrabold py-2 px-3 rounded-lg text-xs text-center transition-colors"
                      >
                        {t('nav.officialSignIn')}
                      </Link>
                      <Link
                        to="/register"
                        onClick={closeDrawer}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-3 rounded-lg text-xs text-center border border-slate-600 transition-colors"
                      >
                        {t('nav.register')}
                      </Link>
                    </div>
                  </div>
                )}

                {/* Section 1: Citizen Services */}
                <div className="space-y-1">
                  <p className="text-[10px] font-extrabold text-slate-400 tracking-wider px-3 uppercase">
                    {t('nav.menuCitizenServices')}
                  </p>
                  {renderNavLink('/', t('nav.home'), Home)}
                  {renderNavLink('/report', t('nav.reportIssue'), FilePlus2)}
                  {renderNavLink('/track', t('nav.track'), Search)}
                  {renderNavLink('/map', t('nav.cityMap'), MapPin)}
                  {isAuthenticated && renderNavLink('/my-reports', t('nav.myReports'), ClipboardList, unreadCount)}
                  {isAuthenticated && renderNavLink('/profile', t('nav.profile'), UserIcon)}
                </div>

                {/* Section 2: Municipal Operations (Admin & Staff) */}
                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <p className="text-[10px] font-extrabold text-slate-400 tracking-wider px-3 uppercase">
                    {t('nav.menuMunicipalOps')}
                  </p>
                  {renderNavLink('/admin', t('nav.commandCenter'), LayoutDashboard)}
                  {renderNavLink('/admin/issues', t('nav.issues'), ClipboardList)}
                  {renderNavLink('/admin/departments', t('nav.departments'), Layers)}
                  {renderNavLink('/admin/officers', t('nav.officers'), Users)}
                  {renderNavLink('/admin/analytics', t('nav.analytics'), BarChart3)}
                </div>

                {/* Section 3: National Helpline Support */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Phone size={14} className="text-amber-600" />
                    <span>{t('footer.helplineTitle')}</span>
                  </p>
                  <p className="text-slate-600 text-[11px]">
                    {t('footer.tollFree')}: <strong className="text-slate-900 font-bold">1800-11-2026</strong>
                  </p>
                  <p className="text-slate-500 text-[10px]">
                    {t('common.helplineText')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
