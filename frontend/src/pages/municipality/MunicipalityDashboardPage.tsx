import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  RefreshCw,
  Target,
  Clock,
  FolderGit2,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Eye,
  Shield,
  MapPin,
  ExternalLink,
  FileText,
  Bell,
  AlertOctagon,
  User,
  X,
  Sparkles,
  LayoutGrid,
  List,
  Radio,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { apiClient, getErrorMessage } from '../../api/client';
import { useSocket } from '../../context/SocketContext';

// Helper for human-friendly relative time (e.g., "Just now", "2 minutes ago", "3 hours ago")
function formatRelativeTime(dateString?: string): string {
  if (!dateString) return 'Just now';
  const timestamp = new Date(dateString).getTime();
  if (isNaN(timestamp)) return 'Just now';
  const diffMs = Date.now() - timestamp;
  const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));

  if (diffSeconds < 45) return 'Just now';
  if (diffSeconds < 90) return '1 minute ago';
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

// Helper for remaining SLA time calculation
function formatSlaRemaining(slaDeadline?: string | Date): { text: string; isBreached: boolean } {
  if (!slaDeadline) return { text: 'Within SLA', isBreached: false };
  const deadline = new Date(slaDeadline).getTime();
  if (isNaN(deadline)) return { text: 'Within SLA', isBreached: false };
  const diffMs = deadline - Date.now();
  if (diffMs <= 0) {
    const overdueMs = Math.abs(diffMs);
    const overdueHours = Math.floor(overdueMs / (1000 * 60 * 60));
    return {
      text: overdueHours > 0 ? `Breached by ${overdueHours}h` : 'SLA Breached',
      isBreached: true,
    };
  }
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return { text: `${days}d ${remHours}h remaining`, isBreached: false };
  }
  return {
    text: `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m remaining`,
    isBreached: false,
  };
}

// Canonical sort: Newest first based strictly on canonical creation timestamp
function sortNewestFirst(items: any[]) {
  return [...items].sort((a, b) => {
    const timeA = new Date(a.createdAt || a.submittedDate || 0).getTime();
    const timeB = new Date(b.createdAt || b.submittedDate || 0).getTime();
    return timeB - timeA;
  });
}

// Operational Priority Queue: Critical/SLA Breach -> High -> Medium -> Low (Tie-breaker: newest first)
function sortPriorityQueue(items: any[]) {
  const priorityWeight: Record<string, number> = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  return [...items].sort((a, b) => {
    const slaA =
      a.slaState === 'breached' || (a.slaDeadline && new Date(a.slaDeadline).getTime() < Date.now());
    const slaB =
      b.slaState === 'breached' || (b.slaDeadline && new Date(b.slaDeadline).getTime() < Date.now());

    if (slaA && !slaB) return -1;
    if (!slaA && slaB) return 1;

    const pA = priorityWeight[(a.priority || '').toUpperCase()] || 0;
    const pB = priorityWeight[(b.priority || '').toUpperCase()] || 0;
    if (pB !== pA) return pB - pA;

    const timeA = new Date(a.createdAt || a.submittedDate || 0).getTime();
    const timeB = new Date(b.createdAt || b.submittedDate || 0).getTime();
    return timeB - timeA;
  });
}

export default function MunicipalityDashboardPage() {
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  // Live state for complaints & KPI metrics
  const [complaints, setComplaints] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);

  // Queue View mode & presentation layout
  const [queueMode, setQueueMode] = useState<'latest' | 'priority'>('latest');
  const [viewLayout, setViewLayout] = useState<'cards' | 'table'>('cards');

  // Real-time toast alert state (Only triggered for live incoming Socket.IO events)
  const [toastNotification, setToastNotification] = useState<any | null>(null);
  const [newlyArrivedIds, setNewlyArrivedIds] = useState<Set<string>>(new Set());
  const [lastSyncedTime, setLastSyncedTime] = useState<string>(
    new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  );

  // Case dossier modal state
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [caseModalLoading, setCaseModalLoading] = useState(false);

  // Initial & manual data fetcher
  const fetchDashboardData = async (showLoadingState = true) => {
    if (showLoadingState) setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/municipality/dashboard');
      if (res.data.success && res.data.data) {
        setData(res.data.data);
        setStats(res.data.data.stats || null);
        const serverComplaints = res.data.data.recentChallenges || [];
        setComplaints(sortNewestFirst(serverComplaints));
        setLastSyncedTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      if (showLoadingState) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(true);
  }, []);

  // Socket.IO real-time intake listener
  useEffect(() => {
    if (!socket) return;

    const handleNewComplaint = (complaintData: any) => {
      if (!complaintData) return;
      const canonicalId =
        complaintData.challengeId ||
        complaintData.complaintNumber ||
        complaintData.id ||
        complaintData._id;
      if (!canonicalId) return;

      // 1. Trigger non-blocking visual toast notification (ONLY for live real-time creation!)
      setToastNotification({
        id: canonicalId,
        complaintNumber: complaintData.complaintNumber || complaintData.challengeId || canonicalId,
        category: complaintData.category || 'Civic Issue',
        ward: complaintData.ward || 'Anand Municipality',
        location: complaintData.location || '',
        problem: complaintData.problem || complaintData.title || 'New Citizen Grievance',
        priority: (complaintData.priority || 'MEDIUM').toUpperCase(),
        timestamp: new Date(),
        raw: complaintData,
      });

      // 2. Mark canonical ID as newly arrived for subtle highlight badge
      setNewlyArrivedIds((prev) => new Set(prev).add(canonicalId));

      // Auto remove highlight badge after 60 seconds
      setTimeout(() => {
        setNewlyArrivedIds((prev) => {
          const next = new Set(prev);
          next.delete(canonicalId);
          return next;
        });
      }, 60000);

      // 3. Prepend & update complaints array with strict duplicate prevention & createdAt sorting
      setComplaints((prev) => {
        const alreadyExists = prev.some(
          (c) => (c.challengeId || c.complaintNumber || c.id || c._id) === canonicalId
        );
        if (alreadyExists) return prev;

        const updated = [complaintData, ...prev];
        return sortNewestFirst(updated);
      });

      // 4. Increment live KPI counters immediately
      setStats((prevStats: any) => {
        if (!prevStats) return prevStats;
        return {
          ...prevStats,
          totalComplaints: (prevStats.totalComplaints || prevStats.totalChallenges || 0) + 1,
          totalChallenges: (prevStats.totalChallenges || prevStats.totalComplaints || 0) + 1,
          new: (prevStats.new || 0) + 1,
          pendingValidation: (prevStats.pendingValidation || 0) + 1,
        };
      });

      setLastSyncedTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));

      // 5. Background silent synchronization to ensure DB parity
      fetchDashboardData(false);
    };

    const handleGeneralUpdate = () => {
      fetchDashboardData(false);
    };

    socket.on('complaint:new', handleNewComplaint);
    socket.on('complaint:created', handleNewComplaint);
    socket.on('complaint:status_changed', handleGeneralUpdate);
    socket.on('complaint:assigned', handleGeneralUpdate);
    socket.on('complaint:resolution_submitted', handleGeneralUpdate);
    socket.on('complaint:resolved', handleGeneralUpdate);

    return () => {
      socket.off('complaint:new', handleNewComplaint);
      socket.off('complaint:created', handleNewComplaint);
      socket.off('complaint:status_changed', handleGeneralUpdate);
      socket.off('complaint:assigned', handleGeneralUpdate);
      socket.off('complaint:resolution_submitted', handleGeneralUpdate);
      socket.off('complaint:resolved', handleGeneralUpdate);
    };
  }, [socket]);

  // Auto-dismiss toast notification after 10 seconds
  useEffect(() => {
    if (!toastNotification) return;
    const timer = setTimeout(() => {
      setToastNotification(null);
    }, 10000);
    return () => clearTimeout(timer);
  }, [toastNotification]);

  // Open Case File Dossier modal for any complaint card/row
  const handleOpenCase = async (item: any) => {
    setSelectedCase(item);
    setCaseModalLoading(true);
    const identifier = item.challengeId || item.complaintNumber || item.id || item._id;
    try {
      const res = await apiClient.get(`/municipality/challenges/${identifier}`);
      if (res.data.success && res.data.data) {
        setSelectedCase(res.data.data);
      }
    } catch (err) {
      console.warn('Could not load full case file dossier:', err);
    } finally {
      setCaseModalLoading(false);
    }
  };

  // Processed list according to active view mode
  const displayedComplaints = useMemo(() => {
    if (queueMode === 'latest') {
      return sortNewestFirst(complaints);
    } else {
      return sortPriorityQueue(complaints);
    }
  }, [complaints, queueMode]);

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. NON-BLOCKING REAL-TIME TOAST ALERT (Appears ONLY on live new complaint) */}
      {/* ========================================================================= */}
      {toastNotification && (
        <aside
          role="status"
          aria-live="polite"
          aria-label="New citizen complaint alert"
          className="fixed top-20 right-6 z-50 max-w-sm w-full bg-white border-2 border-blue-900 rounded-xl shadow-2xl p-4 animate-in slide-in-from-top-4 duration-200"
        >
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-900 text-amber-400 flex items-center justify-center shadow-xs">
                <Bell size={15} />
              </span>
              <div>
                <h4 className="text-xs font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                  <span>New Citizen Complaint</span>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                  </span>
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">Reported just now</span>
              </div>
            </div>
            <button
              onClick={() => setToastNotification(null)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Dismiss alert"
            >
              <X size={15} />
            </button>
          </div>

          <div className="mt-2.5 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-black text-blue-950 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                {toastNotification.complaintNumber}
              </span>
              <span className="text-[10px] font-extrabold uppercase font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
                {toastNotification.priority}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900 line-clamp-1">{toastNotification.problem}</p>
            <p className="text-[11px] text-slate-600">
              <span className="font-semibold text-slate-800">{toastNotification.category}</span> •{' '}
              <span>{toastNotification.ward}</span>
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
            <span className="text-[10px] text-slate-400">Added to intake queue</span>
            <button
              onClick={() => {
                const item = toastNotification.raw || toastNotification;
                setToastNotification(null);
                handleOpenCase(item);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-md transition-colors shadow-xs cursor-pointer"
            >
              <Eye size={12} />
              <span>View Complaint</span>
            </button>
          </div>
        </aside>
      )}

      {/* ========================================================================= */}
      {/* 2. HEADER WITH REAL-TIME STREAM STATUS & ACTION CONTROLS */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide bg-blue-900 text-white font-mono">
              ANAND ULB
            </span>
            <span className="text-xs text-slate-500 font-semibold">Jurisdiction: 14 Wards (22.7 sq.km)</span>

            {/* Real-time Connection Status Indicator */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 border border-slate-200">
              {isConnected ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                  </span>
                  <span className="text-emerald-800 font-medium">Real-time Stream Connected</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  <span className="text-amber-800 font-medium">Sync: {lastSyncedTime}</span>
                </>
              )}
            </div>
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Municipality Civic Operations
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Real-time citizen grievance intake, field force triage, and infrastructure resolution monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title="Refresh database records"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-blue-600' : 'text-slate-500'} />
            <span>Refresh</span>
          </button>
          <Link
            to="/municipality-admin/challenges"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-md transition-colors shadow-2xs"
          >
            <span>Full Triage Desk</span>
            <ChevronRight size={13} />
          </Link>
        </div>
      </div>

      {/* Error Banner with Retry */}
      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-rose-600 shrink-0" />
            <span>Unable to load complaints from backend: {error}</span>
          </div>
          <button onClick={() => fetchDashboardData(true)} className="underline font-bold cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. REAL-TIME ACCURATE KPI METRIC CARDS (Direct MongoDB Data) */}
      {/* ========================================================================= */}
      {loading && !stats ? (
        // Loading Skeleton for KPI Cards
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-slate-200 border border-slate-300"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* 1. TOTAL COMPLAINTS */}
          <div className="p-3.5 rounded-lg bg-white border border-slate-200 border-t-4 border-t-slate-800 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">
                  TOTAL COMPLAINTS
                </span>
                <Target size={15} className="text-slate-700" />
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                  {stats?.totalComplaints || stats?.totalChallenges || 0}
                </span>
                <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                  14 WARDS
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 pt-1.5 border-t border-slate-100 leading-tight">
              Total citizen grievances logged
            </p>
          </div>

          {/* 2. NEW COMPLAINTS */}
          <div className="p-3.5 rounded-lg bg-white border border-slate-200 border-t-4 border-t-amber-500 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-amber-700">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900">
                  NEW
                </span>
                <Clock size={15} className="text-amber-600" />
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-amber-950 font-mono tracking-tight">
                  {stats?.new || 0}
                </span>
                <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded border border-amber-300">
                  ACTION REQ.
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 pt-1.5 border-t border-slate-100 leading-tight">
              Awaiting municipal allocation
            </p>
          </div>

          {/* 3. IN PROGRESS */}
          <div className="p-3.5 rounded-lg bg-white border border-slate-200 border-t-4 border-t-indigo-600 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-indigo-700">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-900">
                  IN PROGRESS
                </span>
                <FolderGit2 size={15} className="text-indigo-600" />
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-indigo-950 font-mono tracking-tight">
                  {stats?.inProgress || 0}
                </span>
                <span className="text-[9px] font-mono font-bold bg-indigo-100 text-indigo-900 px-1.5 py-0.5 rounded border border-indigo-200">
                  FIELD DISPATCH
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 pt-1.5 border-t border-slate-100 leading-tight">
              Under on-ground field execution
            </p>
          </div>

          {/* 4. RESOLVED */}
          <div className="p-3.5 rounded-lg bg-white border border-slate-200 border-t-4 border-t-emerald-600 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-emerald-700">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900">
                  RESOLVED
                </span>
                <CheckCircle2 size={15} className="text-emerald-600" />
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-emerald-950 font-mono tracking-tight">
                  {stats?.resolved || 0}
                </span>
                <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded border border-emerald-300">
                  VERIFIED
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 pt-1.5 border-t border-slate-100 leading-tight">
              Audit-verified & closed
            </p>
          </div>

          {/* 5. SLA BREACHED */}
          <div className="p-3.5 rounded-lg bg-white border border-slate-200 border-t-4 border-t-rose-600 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between col-span-2 sm:col-span-1">
            <div>
              <div className="flex items-center justify-between text-rose-700">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-900">
                  SLA BREACHED
                </span>
                <AlertOctagon size={15} className="text-rose-600" />
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-rose-950 font-mono tracking-tight">
                  {stats?.slaBreached || 0}
                </span>
                <span className="text-[9px] font-mono font-bold bg-rose-100 text-rose-900 px-1.5 py-0.5 rounded border border-rose-300">
                  CRITICAL
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 pt-1.5 border-t border-slate-100 leading-tight">
              Exceeded statutory deadline
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. REAL-TIME CITIZEN COMPLAINT INTAKE FEED & OPERATIONAL QUEUE */}
      {/* ========================================================================= */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
        {/* Header Controls: Queue Mode Switcher & View Toggle */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Target size={16} className="text-blue-900" />
                <span>Citizen Grievance Intake & Queue</span>
              </h2>
              <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-900 px-2 py-0.2 rounded border border-blue-200">
                {displayedComplaints.length} Live in Queue
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Live citizen-reported grievances in Anand Municipality with real-time intake updates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Queue Mode Switcher: Newest-First vs Priority Queue */}
            <div className="inline-flex rounded-lg bg-slate-200/80 p-0.5 text-xs font-bold border border-slate-300">
              <button
                onClick={() => setQueueMode('latest')}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                  queueMode === 'latest'
                    ? 'bg-blue-900 text-white shadow-xs font-black'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <span>⚡ Latest Reports</span>
                <span className="text-[9px] opacity-80 font-mono">(Newest First)</span>
              </button>
              <button
                onClick={() => setQueueMode('priority')}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                  queueMode === 'priority'
                    ? 'bg-blue-900 text-white shadow-xs font-black'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <span>🚨 Priority Queue</span>
                <span className="text-[9px] opacity-80 font-mono">(SLA / Severity)</span>
              </button>
            </div>

            {/* Presentation View Toggle: Cards vs Table */}
            <div className="inline-flex rounded-md bg-white border border-slate-300 p-0.5">
              <button
                onClick={() => setViewLayout('cards')}
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  viewLayout === 'cards' ? 'bg-blue-50 text-blue-900 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Card View"
                aria-label="Switch to Card View"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewLayout('table')}
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  viewLayout === 'table' ? 'bg-blue-50 text-blue-900 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Table View"
                aria-label="Switch to Table View"
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Body: Loading, Empty, or Complaint Items */}
        {loading && complaints.length === 0 ? (
          // Loading State (Skeleton Cards)
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 py-4">
              <RefreshCw size={14} className="animate-spin text-blue-600" />
              <span>Loading citizen complaints from database...</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-44 rounded-xl bg-slate-100 border border-slate-200"></div>
              ))}
            </div>
          </div>
        ) : displayedComplaints.length === 0 ? (
          // Empty State
          <div className="p-12 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Target size={24} />
            </div>
            <h3 className="text-sm font-extrabold text-slate-800">No complaints reported yet.</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Citizen-reported civic issues submitted via the portal will automatically appear here in real-time.
            </p>
          </div>
        ) : viewLayout === 'cards' ? (
          // =========================================================================
          // CARD VIEW: High-Clarity Operational Cards
          // =========================================================================
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {displayedComplaints.map((item: any) => {
              const canonicalId = item.challengeId || item.complaintNumber || item.id || item._id;
              const isNewlyArrived = newlyArrivedIds.has(canonicalId);
              const relativeTime = formatRelativeTime(item.createdAt || item.submittedDate);
              const slaInfo = formatSlaRemaining(item.slaDeadline);

              const rawStatus = (item.status || item.validationStatus || 'submitted').toLowerCase();
              const isResolved = ['resolved', 'closed'].includes(rawStatus);
              const isAssigned = ['assigned', 'in_progress', 'resolution_submitted'].includes(rawStatus);
              const isCritical = (item.priority || '').toUpperCase() === 'CRITICAL';
              const isHigh = (item.priority || '').toUpperCase() === 'HIGH';

              const citizenDisplayName =
                item.citizen?.name || item.citizenName || item.reportedByCitizen || item.reportedBy?.name || 'Citizen';

              return (
                <div
                  key={canonicalId}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 relative group ${
                    isNewlyArrived
                      ? 'bg-blue-50/50 border-blue-400 shadow-md ring-2 ring-blue-300/60 animate-in fade-in duration-300'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs'
                  }`}
                >
                  {/* Top Bar: Complaint ID, Newly Arrived badge, Priority & Status badges */}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-xs text-blue-950 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {item.complaintNumber || item.challengeId || canonicalId}
                        </span>

                        {/* Subtle NEW badge for recently arrived Socket.IO complaints */}
                        {isNewlyArrived && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9.5px] font-extrabold uppercase font-mono bg-blue-600 text-white shadow-2xs animate-pulse">
                            <Sparkles size={10} />
                            <span>NEW</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Priority Badge */}
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9.5px] font-extrabold uppercase font-mono ${
                            isCritical
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : isHigh
                              ? 'bg-orange-100 text-orange-800 border border-orange-300'
                              : 'bg-slate-100 text-slate-800 border border-slate-300'
                          }`}
                        >
                          {item.priority || 'MEDIUM'}
                        </span>

                        {/* Status Badge */}
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9.5px] font-extrabold uppercase ${
                            isResolved
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : isAssigned
                              ? 'bg-purple-100 text-purple-900 border border-purple-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {item.validationStatus || item.status || 'NEW'}
                        </span>
                      </div>
                    </div>

                    {/* Problem Title */}
                    <h3
                      className="font-extrabold text-sm text-slate-900 mt-2 line-clamp-1 group-hover:text-blue-950 transition-colors"
                      title={item.problem || item.title}
                    >
                      {item.problem || item.title}
                    </h3>

                    {/* Visible Category */}
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                      <span className="font-semibold text-slate-500 text-[11px]">Category:</span>
                      <span className="font-bold text-slate-800 bg-slate-100 px-1.5 py-0.2 rounded text-[11px] border border-slate-200">
                        {item.category || 'General Civic'}
                      </span>
                    </div>
                  </div>

                  {/* Metadata Dossier Rows: Citizen, Ward, Time, SLA, Field Worker */}
                  <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    {/* Reported by Citizen */}
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1">
                        <User size={12} className="text-slate-400" />
                        <span>Reported by:</span>
                      </span>
                      <span className="font-bold text-slate-900 truncate max-w-[170px]" title={citizenDisplayName}>
                        {citizenDisplayName}
                      </span>
                    </div>

                    {/* Ward & Location */}
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400" />
                        <span>Location:</span>
                      </span>
                      <span
                        className="font-semibold text-slate-800 truncate max-w-[170px]"
                        title={item.location || item.ward}
                      >
                        {item.ward || item.location}
                      </span>
                    </div>

                    {/* Reported Time (Relative) */}
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock size={12} className="text-slate-400" />
                        <span>Reported:</span>
                      </span>
                      <span className="font-medium text-slate-700 font-mono text-[10.5px]">
                        {relativeTime}
                      </span>
                    </div>

                    {/* SLA Status */}
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">SLA:</span>
                      <span
                        className={`font-mono font-bold text-[10.5px] ${
                          slaInfo.isBreached ? 'text-rose-600 font-black' : 'text-emerald-700'
                        }`}
                      >
                        {slaInfo.text}
                      </span>
                    </div>

                    {/* Assigned Worker */}
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Field Worker:</span>
                      <span
                        className={`font-semibold ${
                          item.assignedOfficer?.name ? 'text-blue-900 font-bold' : 'text-slate-400'
                        }`}
                      >
                        {item.assignedOfficer?.name || 'Not Assigned'}
                      </span>
                    </div>
                  </div>

                  {/* Card Action Button */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(item.createdAt || item.submittedDate).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    <button
                      onClick={() => handleOpenCase(item)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors cursor-pointer shadow-2xs"
                    >
                      <Eye size={13} />
                      <span>View Case</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // =========================================================================
          // TABLE VIEW: High-Density Table Layout
          // =========================================================================
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#1E3A8A] text-white font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Complaint ID</th>
                  <th className="py-2.5 px-3">Citizen Report</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Ward / Location</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Reported Time</th>
                  <th className="py-2.5 px-3">SLA</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {displayedComplaints.map((item: any, idx: number) => {
                  const canonicalId = item.challengeId || item.complaintNumber || item.id || item._id;
                  const isNewlyArrived = newlyArrivedIds.has(canonicalId);
                  const isCritical = (item.priority || '').toUpperCase() === 'CRITICAL';
                  const isHigh = (item.priority || '').toUpperCase() === 'HIGH';
                  const citizenDisplayName =
                    item.citizen?.name || item.citizenName || item.reportedByCitizen || 'Citizen';
                  const slaInfo = formatSlaRemaining(item.slaDeadline);

                  return (
                    <tr
                      key={canonicalId}
                      className={`hover:bg-blue-50/40 transition-colors ${
                        isNewlyArrived
                          ? 'bg-blue-50/60 font-semibold'
                          : idx % 2 === 0
                          ? 'bg-white'
                          : 'bg-slate-50/30'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-950">
                        <div className="flex items-center gap-1.5">
                          <span>{item.complaintNumber || item.challengeId || canonicalId}</span>
                          {isNewlyArrived && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-600 text-white">
                              NEW
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 max-w-xs">
                        <div className="font-bold text-slate-900 truncate" title={item.problem || item.title}>
                          {item.problem || item.title}
                        </div>
                        <div className="text-[10.5px] text-slate-500">Reported by {citizenDisplayName}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">{item.category || 'General'}</td>
                      <td className="py-2.5 px-3 text-slate-600 max-w-[160px] truncate" title={item.location || item.ward}>
                        {item.ward || item.location}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[9.5px] font-extrabold uppercase font-mono ${
                            isCritical
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : isHigh
                              ? 'bg-orange-100 text-orange-800 border border-orange-300'
                              : 'bg-slate-100 text-slate-800 border border-slate-300'
                          }`}
                        >
                          {item.priority || 'MEDIUM'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {item.validationStatus || item.status || 'NEW'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                        {formatRelativeTime(item.createdAt || item.submittedDate)}
                      </td>
                      <td
                        className={`py-2.5 px-3 font-mono text-[10.5px] ${
                          slaInfo.isBreached ? 'text-rose-600 font-bold' : 'text-slate-600'
                        }`}
                      >
                        {slaInfo.text}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleOpenCase(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors cursor-pointer"
                        >
                          <Eye size={12} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. OFFICIAL COMPLAINT CASE FILE MODAL (Direct In-Place Inspection) */}
      {/* ========================================================================= */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#133054] text-white p-4 border-b border-[#224d80] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-700/60 border border-amber-400/40 flex items-center justify-center text-amber-400 font-mono font-bold text-xs">
                  ULB
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm tracking-tight text-white">
                      Official Complaint Dossier — {selectedCase.complaintNumber || selectedCase.challengeId}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase font-mono bg-blue-500/30 text-blue-200 border border-blue-400/50">
                      ● {selectedCase.status || selectedCase.validationStatus || 'SUBMITTED'}
                    </span>
                  </div>
                  <span className="text-[10px] text-blue-200 block">
                    Anand Municipality Civic Operations Command Center
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedCase(null)}
                className="p-1 rounded-md text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-800 flex-1">
              {caseModalLoading ? (
                <div className="py-8 text-center space-y-2">
                  <RefreshCw size={20} className="animate-spin text-blue-600 mx-auto" />
                  <p className="text-slate-500">Loading full case dossier details...</p>
                </div>
              ) : (
                <>
                  {/* Citizen Report Dossier Box */}
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <User size={14} className="text-blue-900" />
                        <span>Citizen Grievance Report</span>
                      </span>
                      <span className="font-mono text-[10.5px] text-slate-500">
                        {formatRelativeTime(selectedCase.createdAt || selectedCase.submittedDate)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Reported by Citizen:</span>
                        <span className="font-bold text-slate-900">
                          {selectedCase.citizen?.name ||
                            selectedCase.citizenName ||
                            selectedCase.reportedByCitizen ||
                            selectedCase.reportedBy?.name ||
                            'Verified Citizen'}
                        </span>
                        {selectedCase.citizen?.phone && (
                          <span className="text-slate-500 text-[10px] block font-mono">
                            Ph: {selectedCase.citizen.phone}
                          </span>
                        )}
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[10px]">Category & Urgency:</span>
                        <span className="font-bold text-slate-900">{selectedCase.category}</span>
                        <span className="text-[10px] text-slate-500 block font-mono">
                          Priority: {selectedCase.priority || 'MEDIUM'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-slate-500 block text-[10px]">Problem Summary:</span>
                      <p className="font-bold text-slate-900 text-xs mt-0.5">
                        {selectedCase.problem || selectedCase.title}
                      </p>
                      {selectedCase.description && selectedCase.description !== selectedCase.problem && (
                        <p className="text-slate-700 text-xs mt-1 bg-white p-2.5 rounded border border-slate-200 leading-relaxed">
                          {selectedCase.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Location & Jurisdiction Box */}
                  <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-1.5">
                    <span className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <MapPin size={14} className="text-blue-900" />
                      <span>Jurisdiction & Geotag</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Ward & Zone:</span>
                        <span className="font-bold text-slate-900">{selectedCase.ward}</span>
                        <span className="text-slate-600 block text-[11px]">{selectedCase.location}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">SLA Timeline:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {formatSlaRemaining(selectedCase.slaDeadline).text}
                        </span>
                        {selectedCase.slaDeadline && (
                          <span className="text-slate-500 block text-[10px]">
                            Deadline: {new Date(selectedCase.slaDeadline).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Citizen Photographic Evidence */}
                  {selectedCase.evidence?.photos?.length > 0 || selectedCase.photos?.length > 0 ? (
                    <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                      <span className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                        Citizen Evidence Photo(s)
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {(selectedCase.evidence?.photos || selectedCase.photos || []).map(
                          (photoUrl: string, pIdx: number) => (
                            <a
                              key={pIdx}
                              href={photoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="block relative rounded-lg overflow-hidden border border-slate-300 hover:opacity-90 transition-opacity"
                            >
                              <img
                                src={photoUrl}
                                alt={`Evidence ${pIdx + 1}`}
                                className="w-28 h-20 object-cover"
                              />
                            </a>
                          )
                        )}
                      </div>
                    </div>
                  ) : null}

                  {/* Administrative Assignment Status */}
                  <div className="p-3.5 rounded-lg bg-blue-50/50 border border-blue-200 text-xs">
                    <span className="font-bold text-blue-950 block text-[11px] uppercase tracking-wider">
                      Municipal Field Force Status
                    </span>
                    <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-slate-700">
                      <div>
                        <span className="text-slate-500">Department: </span>
                        <span className="font-bold text-slate-900">
                          {selectedCase.department && selectedCase.department !== 'Not Assigned'
                            ? selectedCase.department
                            : 'Pending Allocation'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Assigned Officer: </span>
                        <span className="font-bold text-blue-900">
                          {selectedCase.assignedOfficer?.name || 'Not Allocated'}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer with Direct Link to Full Triage Desk */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
              <span className="text-[11px] text-slate-500 font-mono">
                ID: {selectedCase.complaintNumber || selectedCase.challengeId}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedCase(null)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const id = selectedCase.challengeId || selectedCase.complaintNumber || selectedCase.id;
                    setSelectedCase(null);
                    navigate(`/municipality-admin/challenges?selected=${id}`);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded shadow-xs transition-colors cursor-pointer"
                >
                  <span>Open in Triage Desk</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. FIELD FORCE & WORKLOAD STATUS (Preserved Live Operations Panel) */}
      {/* ========================================================================= */}
      {data?.fieldForce && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Field Force Operations & Workload</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                  {data.fieldForce.totalWorkers} Officers Active
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Real-time active grievance allocations across municipal wards
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                Available: {data.fieldForce.available}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-900 border border-blue-200 font-bold">
                On Task: {data.fieldForce.onTask}
              </span>
              {data.fieldForce.offline > 0 && (
                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200 font-bold">
                  Offline: {data.fieldForce.offline}
                </span>
              )}
            </div>
          </div>

          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {data.fieldForce.workers?.map((worker: any) => (
              <div
                key={worker.id}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">{worker.name}</h3>
                    <span className="text-[10px] text-slate-500 font-mono block">{worker.badgeNumber}</span>
                    <span className="text-[10px] text-slate-600 font-medium block truncate max-w-[140px]">
                      {worker.department}
                    </span>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      worker.status === 'On Task'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : worker.status === 'Offline'
                        ? 'bg-slate-200 text-slate-600'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {worker.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Active Tasks:</span>
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {worker.activeTasks}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. QUICK ADMINISTRATIVE SHORTCUTS GRID */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/municipality-admin/map"
          className="p-4 rounded-lg bg-white border border-slate-200 shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all flex items-start gap-3 group"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-900 group-hover:bg-blue-900 group-hover:text-white transition-colors shrink-0">
            <MapPin size={20} />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 group-hover:text-blue-900 transition-colors">
              GIS Geographical View
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Visualize real coordinates, 14 ward boundaries, and category hotspot clusters.
            </p>
          </div>
        </Link>

        <Link
          to="/municipality-admin/projects"
          className="p-4 rounded-lg bg-white border border-slate-200 shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all flex items-start gap-3 group"
        >
          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-900 group-hover:bg-indigo-900 group-hover:text-white transition-colors shrink-0">
            <FolderGit2 size={20} />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 group-hover:text-indigo-900 transition-colors">
              Project Monitoring
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Track real-time progress, milestones, and on-ground field deployment status.
            </p>
          </div>
        </Link>

        <Link
          to="/municipality-admin/reports"
          className="p-4 rounded-lg bg-white border border-slate-200 shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all flex items-start gap-3 group"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-900 group-hover:bg-emerald-900 group-hover:text-white transition-colors shrink-0">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 group-hover:text-emerald-900 transition-colors">
              Statutory Official Reports
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Generate and download authentic multi-page PDFs with official Government headers and audit logs.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
