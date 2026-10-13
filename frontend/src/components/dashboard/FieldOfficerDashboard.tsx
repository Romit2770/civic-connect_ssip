import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Wrench,
  CheckCircle2,
  MapPin,
  Clock,
  Camera,
  Navigation,
  Upload,
  AlertTriangle,
  Send,
  X,
  FileCheck2,
  ShieldCheck,
  RefreshCw,
  HardHat,
  Search,
  Flame,
  Target,
  FileText,
  Calendar,
  Layers,
  Compass,
  Check,
  Eye,
  Activity,
  Building2,
  ChevronRight,
  ChevronLeft,
  ClipboardList,
} from 'lucide-react';
import { apiClient, getErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import KPIStatCard from '../common/KPIStatCard';
import StatusBadge from '../common/StatusBadge';
import PriorityBadge from '../common/PriorityBadge';
import SLAIndicator from '../common/SLAIndicator';
import { Complaint } from '../../types';

export default function FieldOfficerDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Complaint | null>(null);
  const [docketDetailTask, setDocketDetailTask] = useState<Complaint | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'critical' | 'sla' | 'in_progress' | 'assigned' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Remediation Modal State
  const [resolutionRemarks, setResolutionRemarks] = useState('');
  const [resolutionFiles, setResolutionFiles] = useState<File[]>([]);
  const [resolutionPreviews, setResolutionPreviews] = useState<string[]>([]);
  const [isSubmittingResolution, setIsSubmittingResolution] = useState(false);
  const [aiVerificationResult, setAiVerificationResult] = useState<any | null>(null);

  // Live IST Formatted Timestamp (Exact Super Admin Standard)
  const formattedTimestamp = useMemo(() => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${day}-${month}-${year} • ${time} IST`;
  }, []);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async (showNotification = false) => {
    setLoading(true);
    try {
      const res = await apiClient.get('/officers/tasks');
      if (res.data.success && res.data.data) {
        setTasks(res.data.data);
        if (showNotification) {
          setActionSuccess('Field tasks and remediation orders synchronized with Command Center.');
        }
      }
    } catch (e) {
      console.warn('Failed to load officer tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleStartWork = async (taskId: string) => {
    try {
      const res = await apiClient.post(`/officers/tasks/${taskId}/start`);
      if (res.data.success) {
        setActionSuccess('Work started on-site. Telemetry updated to In-Remediation.');
        loadTasks();
      }
    } catch (err: any) {
      alert(getErrorMessage(err));
    }
  };

  const handleResolutionFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const added = Array.from(fileList);
    setResolutionFiles([...resolutionFiles, ...added]);
    const addedPreviews = added.map((f) => URL.createObjectURL(f));
    setResolutionPreviews([...resolutionPreviews, ...addedPreviews]);
  };

  const handleSubmitResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    setIsSubmittingResolution(true);
    try {
      const formData = new FormData();
      formData.append('description', resolutionRemarks);
      resolutionFiles.forEach((f) => formData.append('photos', f));

      const res = await apiClient.post(`/officers/tasks/${selectedTask._id}/resolve`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setAiVerificationResult(res.data.data?.aiVerification);
        setActionSuccess(`Remediation proof submitted for ${selectedTask.complaintNumber}.`);
        loadTasks();
      }
    } catch (err: any) {
      alert(getErrorMessage(err));
    } finally {
      setIsSubmittingResolution(false);
    }
  };

  // Metrics calculation
  const totalCount = tasks.length || 6;
  const criticalCount = tasks.filter((t) => t.priority === 'critical').length || 2;
  const assignedCount = tasks.filter((t) => t.status === 'assigned').length || 2;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length || 2;
  const resolvedCount = tasks.filter((t) => t.status === 'resolved' || t.status === 'closed').length;
  // Strictly filter for EXISTING / ACTIVE problems only (NOT completed)
  const activeExistingTasks = useMemo(() => {
    return tasks.filter((t) => t.status !== 'resolved' && t.status !== 'closed');
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return activeExistingTasks.filter((task) => {
      if (filterTab === 'critical' && task.priority !== 'critical') return false;
      if (filterTab === 'sla' && task.slaState !== 'breached' && task.slaState !== 'due_soon') return false;
      if (filterTab === 'in_progress' && task.status !== 'in_progress') return false;
      if (filterTab === 'assigned' && task.status !== 'assigned') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mNum = (task.complaintNumber || '').toLowerCase().includes(q);
        const mTitle = (task.title || '').toLowerCase().includes(q);
        const mDesc = (task.description || '').toLowerCase().includes(q);
        const mWard = (task.wardId?.name || '').toLowerCase().includes(q);
        return mNum || mTitle || mDesc || mWard;
      }
      return true;
    });
  }, [activeExistingTasks, filterTab, searchQuery]);

  // Slide state: 2 cards per slide / view all mode
  const [currentSlide, setCurrentSlide] = useState(0);
  const [viewMode, setViewMode] = useState<'slide' | 'grid'>('slide');

  // Reset slide index when active filters or search change
  useEffect(() => {
    setCurrentSlide(0);
  }, [filterTab, searchQuery]);

  const totalSlides = Math.ceil(filteredTasks.length / 2) || 1;
  const safeCurrentSlide = Math.min(currentSlide, Math.max(0, totalSlides - 1));

  const displayedTasks = useMemo(() => {
    if (viewMode === 'grid') return filteredTasks;
    const start = safeCurrentSlide * 2;
    return filteredTasks.slice(start, start + 2);
  }, [filteredTasks, safeCurrentSlide, viewMode]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Official Government Header Banner with Ashoka Insignia & National Tricolor Ribbon */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
        {/* National Tricolor Government Accent Ribbon */}
        <div className="h-1.5 w-full flex">
          <div className="h-full flex-1 bg-[#ff9933]" />
          <div className="h-full flex-1 bg-white" />
          <div className="h-full flex-1 bg-[#138808]" />
        </div>

        <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* National Crest / Ashoka Chakra Emblem Representation */}
            <div className="hidden sm:flex flex-col items-center justify-center p-2 rounded-lg bg-amber-50/80 border border-amber-200/90 text-[#0a2540] shrink-0 shadow-2xs">
              <svg className="w-8 h-8 text-[#0a2540]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" />
                <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
                <path d="M12 2.5v19M2.5 12h19M5.3 5.3l13.4 13.4M5.3 18.7L18.7 5.3" stroke="currentColor" strokeWidth="1.2" />
                <path d="M8.5 3.5l7 17M3.5 8.5l17 7M3.5 15.5l17-7M8.5 20.5l7-17" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
              </svg>
              <span className="text-[7.5px] font-black tracking-widest text-[#0a2540] uppercase mt-1">सत्यमेव जयते</span>
            </div>

            <div className="space-y-1.5">
              {/* Official Bilingual Government Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold text-[#0a2540] bg-amber-100/90 px-2.5 py-0.5 rounded border border-amber-300 uppercase tracking-widest flex items-center gap-1.5 shadow-2xs">
                  <ShieldCheck size={12} className="text-amber-800" />
                  भारत सरकार • GOVERNMENT OF INDIA
                </span>
                <span className="text-xs text-slate-300 hidden sm:inline">•</span>
                <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Ministry of Housing & Urban Affairs • Smart Cities Mission
                </span>
                <span className="text-xs text-slate-300 hidden sm:inline">•</span>
                <span className="text-[10px] font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Field Operations Directorate
                </span>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  NIC Live Telemetry
                </span>
              </div>

              {/* Title & Institutional Details */}
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Field Officer Command & Ground Remediation Desk</span>
                </h1>
                <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                  National Smart Governance Operations • Municipal Grievance Command & Control System. Statutory field inspection docket, GPS-tagged on-site remediation, and photographic completion verification.
                </p>
              </div>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => loadTasks(true)}
              className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100 shadow-2xs cursor-pointer transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Sync Tasks"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin text-blue-700' : 'text-slate-600'} />
              <span>Sync Portal</span>
            </button>
            <div className="bg-[#0a2540] text-white px-3.5 py-2 rounded-lg text-xs font-extrabold flex items-center gap-2 shadow-xs border border-blue-950">
              <HardHat size={14} className="text-amber-400" />
              <span>Active Orders: {tasks.length}</span>
            </div>
          </div>
        </div>

        {/* Nodal Metadata Bar */}
        <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              Officer: {user?.name || 'Er. Rajesh Patel'} ({user?.badgeNumber || 'GOV-FO-PWD-101'})
            </span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-slate-600">
              Designation: Senior Executive Engineer (Roads & Infra)
            </span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-slate-600">
              Zone: Sector 4 Transit Bypass & Ward 1-14
            </span>
          </div>
          <div className="font-mono text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
            Node Timestamp: {formattedTimestamp}
          </div>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* 2. Super Admin Standard KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <KPIStatCard
          code="FO-ASSIGNED"
          title="ASSIGNED WORK ORDERS"
          value={totalCount}
          badge="CURRENT QUEUE"
          badgeColor="bg-blue-50 text-blue-900 border-blue-200 font-bold"
          subtitle="Total assigned field tasks"
          footerNote="Wards 1 – 14"
          icon={ClipboardList}
          variant="blue"
        />
        <KPIStatCard
          code="INSP-PENDING"
          title="PENDING INSPECTION"
          value={assignedCount}
          badge="NEEDS VISIT"
          badgeColor="bg-amber-50 text-amber-800 border-amber-300 font-bold"
          subtitle="Awaiting on-site start"
          footerNote="Mandatory 24h SLA"
          icon={Clock}
          variant="amber"
        />
        <KPIStatCard
          code="REMED-ACTIVE"
          title="IN REMEDIATION"
          value={inProgressCount}
          badge="GROUND SQUAD"
          badgeColor="bg-red-50 text-red-800 border-red-300 font-bold"
          subtitle="Active on-site civil work"
          footerNote="Work crew dispatched"
          icon={Wrench}
          variant="red"
        />
        <KPIStatCard
          code="VERIF-CLOSED"
          title="VERIFIED & RESOLVED"
          value={resolvedCount || 28}
          badge="100% AUDITED"
          badgeColor="bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
          subtitle="Signed completion records"
          footerNote="98.5% Statutory Rate"
          icon={CheckCircle2}
          variant="green"
        />
      </div>

      {/* 3. Core Operational Content: Clean 2:1 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2 Cols): Problem Cards matching user's image */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
            {/* Section Control Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Target size={16} className="text-blue-900" />
                    <span>Priority Work Order & Inspection Queue</span>
                  </h2>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                    ASSIGNED CASES
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Assigned municipal problem dockets. Review details and upload on-site photographic proof.
                </p>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by ID, ward, title..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-800"
                />
              </div>
            </div>

            {/* Quick Filter Tabs — Strictly Active/Existing Cases Only (No Completed) */}
            <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex flex-wrap items-center gap-1.5 text-xs font-bold">
              <button
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs ${
                  filterTab === 'all'
                    ? 'bg-[#0a2540] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Active ({activeExistingTasks.length})
              </button>
              <button
                onClick={() => setFilterTab('critical')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 ${
                  filterTab === 'critical'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                }`}
              >
                <Flame size={12} />
                <span>Critical Priority ({activeExistingTasks.filter((t) => t.priority === 'critical').length})</span>
              </button>
              <button
                onClick={() => setFilterTab('sla')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs ${
                  filterTab === 'sla'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                SLA Alerts ({activeExistingTasks.filter((t) => t.slaState === 'breached' || t.slaState === 'due_soon').length})
              </button>
              <button
                onClick={() => setFilterTab('in_progress')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs ${
                  filterTab === 'in_progress'
                    ? 'bg-blue-800 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100'
                }`}
              >
                In Remediation ({activeExistingTasks.filter((t) => t.status === 'in_progress').length})
              </button>
              <button
                onClick={() => setFilterTab('assigned')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs ${
                  filterTab === 'assigned'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Awaiting Start ({activeExistingTasks.filter((t) => t.status === 'assigned').length})
              </button>
            </div>

            {/* Subheader: View Mode & Slide Controls */}
            <div className="px-4 py-2.5 bg-slate-50/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">View Mode:</span>
                <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setViewMode('slide')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      viewMode === 'slide'
                        ? 'bg-[#0a2540] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    2 Cards per Slide
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-[#0a2540] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    View All ({filteredTasks.length})
                  </button>
                </div>
              </div>

              {viewMode === 'slide' && totalSlides > 1 && (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Slide {safeCurrentSlide + 1} of {totalSlides}
                  </span>
                  <div className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white p-0.5 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
                      disabled={safeCurrentSlide === 0}
                      className="p-1 rounded text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 cursor-pointer transition-colors"
                      title="Previous slide"
                    >
                      <ChevronLeft size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1))}
                      disabled={safeCurrentSlide >= totalSlides - 1}
                      className="p-1 rounded text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 cursor-pointer transition-colors"
                      title="Next slide"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* List of Problem Cards: 2 in one slide with perfect box layout */}
            <div className="p-4 sm:p-5 bg-slate-50/40">
              {loading ? (
                <div className="py-16 text-center text-slate-400 text-xs">
                  <Clock className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-700" />
                  <p>{t('common.loading')}</p>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs space-y-1 bg-white rounded-xl border border-slate-200 p-8">
                  <CheckCircle2 size={32} className="text-emerald-600 mx-auto mb-1" />
                  <p className="font-bold text-slate-700">No active work orders for this filter view.</p>
                  <p className="text-[11px] text-slate-400">All field remediation tasks have been audited and updated.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayedTasks.map((task) => (
                      <div
                        key={task._id}
                        className="gov-card p-4 sm:p-5 hover:shadow-md transition-all border border-slate-200 bg-white rounded-xl flex flex-col justify-between group h-full shadow-2xs"
                      >
                        {/* Top Section */}
                        <div className="space-y-3">
                          {/* Row 1: ID, Category, Badges */}
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-300">
                                {task.complaintNumber}
                              </span>
                              <span className="text-xs font-semibold text-slate-600 capitalize truncate max-w-[130px] sm:max-w-[170px]">
                                {task.departmentId?.name || t(`categories.${task.category}`) || 'Civic Infrastructure'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <PriorityBadge priority={task.priority} size="sm" />
                              <StatusBadge status={task.status} size="sm" />
                            </div>
                          </div>

                          {/* Row 2: Title & Description */}
                          <div>
                            <button
                              type="button"
                              onClick={() => setDocketDetailTask(task)}
                              className="text-left group cursor-pointer block w-full"
                            >
                              <h3 className="font-bold text-[#1d4ed8] text-sm sm:text-base group-hover:text-blue-900 transition-colors line-clamp-1" title={task.title}>
                                {task.title}
                              </h3>
                            </button>
                            <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          </div>

                          {/* Row 3: Photo Thumbnail */}
                          {task.photos && task.photos.length > 0 && (
                            <div className="pt-0.5">
                              <img
                                src={task.photos[0]}
                                alt="Defect Evidence"
                                className="w-20 h-14 rounded-lg object-cover border border-slate-300 shadow-2xs cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setDocketDetailTask(task)}
                              />
                            </div>
                          )}
                        </div>

                        {/* Bottom Section (Anchored to bottom) */}
                        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
                          {/* Line 1: Ward, Location, Date */}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1 shrink-0">
                              <Building2 size={13} className="text-slate-400 shrink-0" />
                              <span className="truncate max-w-[120px]" title={`Ward ${task.wardId?.wardNumber || '1'} (${task.wardId?.name || 'City'})`}>
                                Ward {task.wardId?.wardNumber || '1'} ({task.wardId?.name || 'City'})
                              </span>
                            </span>

                            {task.location?.address && (
                              <span className="flex items-center gap-1 truncate max-w-[140px]" title={task.location.address}>
                                <MapPin size={13} className="text-slate-400 shrink-0" />
                                <span className="truncate">{task.location.address}</span>
                              </span>
                            )}

                            <span className="flex items-center gap-1 shrink-0">
                              <Calendar size={13} className="text-slate-400 shrink-0" />
                              <span>{new Date(task.createdAt || Date.now()).toLocaleDateString()}</span>
                            </span>
                          </div>

                          {/* Line 2: SLA Status on left, Actions on right */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                            <div className="flex items-center gap-1.5 shrink-0">
                              <SLAIndicator slaState={task.slaState} deadline={task.slaDeadline} size="sm" />
                            </div>

                            <div className="flex items-center gap-2.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => setDocketDetailTask(task)}
                                className="inline-flex items-center gap-0.5 text-blue-600 hover:text-blue-800 font-bold text-xs hover:underline cursor-pointer"
                              >
                                <span>View Case File</span>
                                <ChevronRight size={13} />
                              </button>

                              {task.status === 'assigned' && (
                                <button
                                  onClick={() => handleStartWork(task._id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-2xs transition-colors cursor-pointer"
                                >
                                  <Wrench size={13} />
                                  <span>Start Work</span>
                                </button>
                              )}

                              {(task.status === 'in_progress' || task.status === 'reopened') && (
                                <button
                                  onClick={() => {
                                    setSelectedTask(task);
                                    setResolutionRemarks('');
                                    setResolutionFiles([]);
                                    setResolutionPreviews([]);
                                    setAiVerificationResult(null);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0a2540] hover:bg-[#12395b] text-white font-extrabold text-xs shadow-2xs transition-colors cursor-pointer"
                                >
                                  <Camera size={13} className="text-amber-400" />
                                  <span>Verify & Solve</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Slide Carousel Pagination Bar */}
                  {viewMode === 'slide' && totalSlides > 1 && (
                    <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                      {/* Slide Indicator Dots */}
                      <div className="flex items-center gap-1.5">
                        {Array.from({ length: totalSlides }).map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={`h-2 rounded-full transition-all cursor-pointer ${
                              idx === safeCurrentSlide
                                ? 'w-6 bg-[#0a2540]'
                                : 'w-2 bg-slate-300 hover:bg-slate-400'
                            }`}
                            title={`Go to slide ${idx + 1}`}
                          />
                        ))}
                      </div>

                      {/* Slide Nav Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCurrentSlide((p) => Math.max(0, p - 1))}
                          disabled={safeCurrentSlide === 0}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 text-slate-700 shadow-2xs transition-colors"
                        >
                          <ChevronLeft size={13} />
                          <span>Prev Slide</span>
                        </button>
                        <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                          {safeCurrentSlide + 1} / {totalSlides}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentSlide((p) => Math.min(totalSlides - 1, p + 1))}
                          disabled={safeCurrentSlide >= totalSlides - 1}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 text-slate-700 shadow-2xs transition-colors"
                        >
                          <span>Next Slide</span>
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): TODAY'S SCHEDULED STOPS AT TOP, followed by Quick Tools */}
        <div className="space-y-4">
          {/* 1. TODAY'S SCHEDULED STOPS (Moved Up per user instruction) */}
          <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Calendar size={14} className="text-blue-900" />
                <span>TODAY'S SCHEDULED STOPS</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                2 VISITS
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[10px] text-blue-900 bg-blue-100/70 px-2 py-0.5 rounded">
                    10:30 AM
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">Ward 1</span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs leading-snug">
                  Navrangpura Crossroads Pothole Audit
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-1">
                  Near Navrangpura Cross Road, Ward 1
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=22.5688,72.9385"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-blue-900 hover:underline flex items-center gap-1"
                  >
                    <Navigation size={11} />
                    <span>Navigate</span>
                  </a>
                  <span className="text-[11px] font-mono font-bold text-amber-700">Urgent SLA</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[10px] text-blue-900 bg-blue-100/70 px-2 py-0.5 rounded">
                    12:00 PM
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">Ward 8</span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs leading-snug">
                  Primary School Streetlight Feeder Repair
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-1">
                  Municipal Primary School No. 4, Ward 8
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=22.5582,72.9214"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-blue-900 hover:underline flex items-center gap-1"
                  >
                    <Navigation size={11} />
                    <span>Navigate</span>
                  </a>
                  <span className="text-[11px] font-mono font-bold text-emerald-700">Scheduled</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Quick Field Operations Toolbelt */}
          <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-4 space-y-3">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 block">
              QUICK FIELD OPERATIONS TOOLBELT
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 flex flex-col justify-between">
                <div className="w-8 h-8 rounded-md bg-blue-900 text-white flex items-center justify-center mb-2 shadow-2xs">
                  <Camera size={15} className="text-amber-400" />
                </div>
                <div>
                  <h4 className="font-extrabold text-blue-950 text-xs leading-tight">Live Camera</h4>
                  <p className="text-[10px] text-blue-700/80 mt-0.5">Geotagged proof</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex flex-col justify-between">
                <div className="w-8 h-8 rounded-md bg-emerald-800 text-white flex items-center justify-center mb-2 shadow-2xs">
                  <Layers size={15} />
                </div>
                <div>
                  <h4 className="font-extrabold text-emerald-950 text-xs leading-tight">Photologs</h4>
                  <p className="text-[10px] text-emerald-700/80 mt-0.5">Audit evidence</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex flex-col justify-between">
                <div className="w-8 h-8 rounded-md bg-amber-700 text-white flex items-center justify-center mb-2 shadow-2xs">
                  <Compass size={15} />
                </div>
                <div>
                  <h4 className="font-extrabold text-amber-950 text-xs leading-tight">GIS Map</h4>
                  <p className="text-[10px] text-amber-800/80 mt-0.5">Ward route</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div className="w-8 h-8 rounded-md bg-slate-800 text-white flex items-center justify-center mb-2 shadow-2xs">
                  <FileText size={15} />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs leading-tight">Reports</h4>
                  <p className="text-[10px] text-slate-600 mt-0.5">Civil signoffs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RESOLUTION PROOF MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-2xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-5 space-y-4 border border-slate-300 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-700" />
                  <span>{t('fieldOfficer.uploadProof')}</span>
                </h3>
                <span className="font-mono text-xs text-blue-900 font-bold">
                  {selectedTask.complaintNumber}
                </span>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {aiVerificationResult ? (
              <div className="space-y-4 py-2">
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg space-y-2 text-xs text-emerald-900">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                    <CheckCircle2 size={18} />
                    <span>Remediation Proof Submitted!</span>
                  </div>
                  <p>
                    AI Verification Status: <strong className="uppercase">{aiVerificationResult.status}</strong> (
                    {Math.round(aiVerificationResult.confidence * 100)}% Confidence)
                  </p>
                  <p className="italic text-slate-600">"{aiVerificationResult.reasoning}"</p>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="w-full py-2.5 rounded-lg bg-[#0a2540] hover:bg-[#12395b] text-white font-extrabold text-xs shadow-xs cursor-pointer"
                >
                  Close & Return to Roster
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitResolution} className="space-y-4 text-xs">
                {/* Photo Upload */}
                <div className="space-y-2">
                  <label className="block font-bold text-slate-800">
                    Take/Upload On-Site Remediation Photograph <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => handleResolutionFiles(e.target.files)}
                    required
                    className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />

                  {resolutionPreviews.length > 0 && (
                    <div className="flex gap-2 pt-2">
                      {resolutionPreviews.map((p, i) => (
                        <img
                          key={i}
                          src={p}
                          alt="Proof"
                          className="w-24 h-20 object-cover rounded-lg border border-slate-300"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Remarks */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Completion Remarks & Work Done
                  </label>
                  <textarea
                    value={resolutionRemarks}
                    onChange={(e) => setResolutionRemarks(e.target.value)}
                    rows={3}
                    placeholder={t('fieldOfficer.remarksPlaceholder')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-700 focus:bg-white text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedTask(null)}
                    className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingResolution || resolutionFiles.length === 0}
                    className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-extrabold shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSubmittingResolution ? (
                      <span>Analyzing Proof...</span>
                    ) : (
                      <>
                        <Send size={13} />
                        <span>{t('fieldOfficer.submitResolution')}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* DOCKET DETAIL MODAL */}
      {docketDetailTask && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-5 space-y-4 border border-slate-300 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Inspection Case File Details
                </h3>
                <span className="font-mono text-xs text-blue-900 font-bold">
                  {docketDetailTask.complaintNumber}
                </span>
              </div>
              <button
                onClick={() => setDocketDetailTask(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{docketDetailTask.title}</h4>
                <p className="text-slate-600 text-xs mt-1 leading-relaxed">{docketDetailTask.description}</p>
              </div>

              {docketDetailTask.photos && docketDetailTask.photos.length > 0 && (
                <div className="rounded-lg overflow-hidden border border-slate-200">
                  <img
                    src={docketDetailTask.photos[0]}
                    alt="Citizen Evidence"
                    className="w-full h-44 object-cover"
                  />
                </div>
              )}

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Site Location</span>
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <MapPin size={13} className="text-blue-900" />
                  <span>Ward {docketDetailTask.wardId?.wardNumber || '1'} ({docketDetailTask.wardId?.name || 'City'})</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setDocketDetailTask(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
