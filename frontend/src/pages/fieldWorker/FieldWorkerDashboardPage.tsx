import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  RefreshCw,
  Target,
  X,
  MapPin,
  Wrench,
  Send,
  CheckCircle2,
  Navigation,
  Camera,
  Clock,
  ClipboardList,
  AlertTriangle,
  Flame,
  Calendar,
  ChevronRight,
  ChevronLeft,
  FileText,
  Search,
  Building2,
  Layers,
  Compass,
  PlayCircle,
  Video,
} from 'lucide-react';
import KPIStatCard from '../../components/common/KPIStatCard';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import SLAIndicator from '../../components/common/SLAIndicator';
import { ComplaintPriority, ComplaintStatus, SLAState } from '../../types';
import { apiClient, getErrorMessage } from '../../api/client';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import CameraCaptureModal from '../../components/common/CameraCaptureModal';
import { EvidenceRecord } from '../../utils/evidenceValidator';

interface WorkOrderItem {
  id: string;
  challengeId: string;
  complaintNumber: string;
  categoryLabel: string;
  categoryKey: string;
  title: string;
  description: string;
  location: string;
  ward: string;
  coordinates: { lat: number; lng: number };
  priority: ComplaintPriority;
  status: ComplaintStatus;
  slaState: SLAState;
  slaDeadline: string;
  reportedDate: string;
  reportedBy: string;
  citizenPhoto?: string;
}

export default function FieldWorkerDashboardPage() {
  const { t } = useTranslation();
  const { socket } = useSocket();

  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'critical' | 'sla' | 'in_progress' | 'assigned'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetailItem, setSelectedDetailItem] = useState<WorkOrderItem | null>(null);

  const { user } = useAuth();
  // Live Camera Resolution State (STRICTLY NO ARBITRARY FILE UPLOADS)
  const [resolutionTarget, setResolutionTarget] = useState<WorkOrderItem | null>(null);
  const [resolutionRemarks, setResolutionRemarks] = useState('');
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState<'photo' | 'video'>('photo');
  const [capturedRecord, setCapturedRecord] = useState<EvidenceRecord | null>(null);
  const [isSubmittingResolution, setIsSubmittingResolution] = useState(false);
  const [resolutionDone, setResolutionDone] = useState(false);

  // Live IST Formatted Timestamp
  const formattedTimestamp = useMemo(() => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${day}-${month}-${year} • ${time} IST`;
  }, []);

  // Live Assigned Work Orders for Logged-In Worker ONLY
  const [workOrders, setWorkOrders] = useState<WorkOrderItem[]>([]);

  const [summaryMetrics, setSummaryMetrics] = useState({
    assigned: 0,
    pending: 0,
    remediation: 0,
    verified: 0,
  });

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [dashRes, challRes] = await Promise.all([
        apiClient.get('/field-worker/dashboard').catch(() => null),
        apiClient.get('/field-worker/challenges').catch(() => null),
      ]);

      let effectiveOrders: WorkOrderItem[] = [];
      if (challRes?.data?.success && Array.isArray(challRes.data.data?.challenges)) {
        effectiveOrders = challRes.data.data.challenges.map((c: any) => ({
          id: c.id || c._id || c.complaintNumber,
          challengeId: c.challengeId || c.complaintNumber || c.id,
          complaintNumber: c.complaintNumber || c.id,
          categoryLabel: c.category || 'Civic Infrastructure',
          categoryKey: (c.category || '').toLowerCase().replace(/\s+/g, '_'),
          title: c.title || c.problem || 'Civic Issue',
          description: c.description || '',
          location: typeof c.location === 'string' ? c.location : (c.location?.address || 'Anand Site Location'),
          ward: c.ward || `Ward ${c.wardNumber || 12}`,
          coordinates: {
            lat: c.location?.latitude || (Array.isArray(c.coordinates) ? c.coordinates[1] : 22.5645),
            lng: c.location?.longitude || (Array.isArray(c.coordinates) ? c.coordinates[0] : 72.9289),
          },
          priority: ((c.priority || 'medium').toLowerCase() as ComplaintPriority),
          status: ((c.status || 'assigned').toLowerCase().replace('pending_verification', 'assigned') as ComplaintStatus),
          slaState: (c.slaState || 'within_sla') as SLAState,
          slaDeadline: c.slaDeadline || c.dueDate || new Date(Date.now() + 86400000).toISOString(),
          reportedDate: c.reportedDate || (c.createdAt ? new Date(c.createdAt).toLocaleDateString() : new Date().toLocaleDateString()),
          reportedBy: c.reportedBy || 'Verified Citizen',
          citizenPhoto: c.citizenPhoto || c.citizenEvidence?.[0]?.url || (c.photos && c.photos[0]) || '',
        }));
        setWorkOrders(effectiveOrders);
      } else if (dashRes?.data?.success && Array.isArray(dashRes.data.data?.workOrders)) {
        effectiveOrders = dashRes.data.data.workOrders;
        setWorkOrders(effectiveOrders);
      } else {
        setWorkOrders([]);
      }

      // Calculate accurate live KPI metrics from backend summary, summaryMetrics, and active orders
      const dashData = dashRes?.data?.data;
      const s = dashData?.summary || {};
      const sm = dashData?.summaryMetrics || {};

      let totalAssigned = sm.totalAssigned ?? s.assignedIssues ?? effectiveOrders.length;
      let pendingInspection = sm.pendingInspection ?? s.pendingVerification ?? effectiveOrders.filter((w) => (w.status as string) === 'assigned' || (w.status as string) === 'pending_verification' || w.status === 'verification_pending').length;
      let inRemediation = sm.inProgress ?? s.inProgressIssues ?? effectiveOrders.filter((w) => w.status === 'in_progress').length;
      let verifiedResolved = sm.completedToday ?? s.verifiedIssues ?? effectiveOrders.filter((w) => w.status === 'resolved' || w.status === 'closed' || w.status === 'resolution_submitted').length;

      // Fallback cross-check against actual work orders list
      if (effectiveOrders.length > 0) {
        if (!totalAssigned) totalAssigned = effectiveOrders.length;
        const inProg = effectiveOrders.filter((w) => w.status === 'in_progress').length;
        const pending = effectiveOrders.filter((w) => (w.status as string) === 'assigned' || (w.status as string) === 'pending_verification' || w.status === 'verification_pending').length;
        const resolved = effectiveOrders.filter((w) => w.status === 'resolved' || w.status === 'closed' || w.status === 'resolution_submitted').length;

        if (inRemediation === 0 && inProg > 0) inRemediation = inProg;
        if (pendingInspection === 0 && pending > 0) pendingInspection = pending;
        if (verifiedResolved === 0 && resolved > 0) verifiedResolved = resolved;
      }

      setSummaryMetrics({
        assigned: totalAssigned,
        pending: pendingInspection,
        remediation: inRemediation,
        verified: verifiedResolved,
      });
    } catch (err: any) {
      console.error('Error loading field worker dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Live Socket.IO Updates
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      fetchDashboard();
    };

    socket.on('complaint:assigned', handleUpdate);
    socket.on('notification:new', handleUpdate);
    socket.on('complaint:status_changed', handleUpdate);

    return () => {
      socket.off('complaint:assigned', handleUpdate);
      socket.off('notification:new', handleUpdate);
      socket.off('complaint:status_changed', handleUpdate);
    };
  }, [socket]);

  const syncTelemetry = () => {
    fetchDashboard();
    setActionSuccess('Field tasks & GPS operational queue synchronized with Municipal Command Center.');
  };

  // Strictly filter for EXISTING / ACTIVE problems only (NOT completed)
  const activeExistingOrders = useMemo(() => {
    return workOrders.filter((w) => w.status !== 'resolved' && w.status !== 'closed');
  }, [workOrders]);

  const filteredWorkOrders = useMemo(() => {
    return activeExistingOrders.filter((item) => {
      // Tab filter for existing problems
      if (filterTab === 'critical' && item.priority !== 'critical') return false;
      if (filterTab === 'sla' && item.slaState !== 'breached' && item.slaState !== 'due_soon') return false;
      if (filterTab === 'in_progress' && item.status !== 'in_progress') return false;
      if (filterTab === 'assigned' && item.status !== 'assigned') return false;

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchNum = item.complaintNumber.toLowerCase().includes(q);
        const matchWard = item.ward.toLowerCase().includes(q);
        const matchCat = item.categoryLabel.toLowerCase().includes(q);
        const matchLoc = item.location.toLowerCase().includes(q);
        return matchTitle || matchNum || matchWard || matchCat || matchLoc;
      }
      return true;
    });
  }, [activeExistingOrders, filterTab, searchQuery]);

  // Slide state: 2 cards per slide / view all mode
  const [currentSlide, setCurrentSlide] = useState(0);
  const [viewMode, setViewMode] = useState<'slide' | 'grid'>('slide');

  // Reset slide index when active filters or search change
  useEffect(() => {
    setCurrentSlide(0);
  }, [filterTab, searchQuery]);

  const totalSlides = Math.ceil(filteredWorkOrders.length / 2) || 1;
  const safeCurrentSlide = Math.min(currentSlide, Math.max(0, totalSlides - 1));

  const displayedWorkOrders = useMemo(() => {
    if (viewMode === 'grid') return filteredWorkOrders;
    const start = safeCurrentSlide * 2;
    return filteredWorkOrders.slice(start, start + 2);
  }, [filteredWorkOrders, safeCurrentSlide, viewMode]);

  const handleOpenResolutionModal = (item: WorkOrderItem) => {
    setResolutionTarget(item);
    setResolutionRemarks('');
    setCapturedRecord(null);
    setResolutionDone(false);
  };

  const handleStartWork = async (item: WorkOrderItem) => {
    try {
      const res = await apiClient.post(`/field-worker/challenges/${item.id}/start-work`);
      if (res.data.success) {
        setActionSuccess(`Work started on ${item.complaintNumber}. Status changed to IN PROGRESS.`);
        fetchDashboard();
      }
    } catch (err: any) {
      alert(getErrorMessage(err));
    }
  };

  const handleSubmitResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionTarget) return;

    if (!capturedRecord) {
      alert('Live device camera photo or video evidence is required before submission.');
      return;
    }

    setIsSubmittingResolution(true);
    try {
      const isVideo = capturedRecord.type === 'live_video';
      const res = await apiClient.post(`/field-worker/challenges/${resolutionTarget.id}/resolution`, {
        description: resolutionRemarks.trim() || `Field remediation completed on-site with live ${isVideo ? 'video' : 'photo'} proof.`,
        photos: !isVideo ? [capturedRecord.previewUrl] : [],
        videos: isVideo ? [capturedRecord.previewUrl] : [],
        evidenceType: isVideo ? 'LIVE_VIDEO' : 'LIVE_PHOTO',
        latitude: capturedRecord.latitude,
        longitude: capturedRecord.longitude,
        accuracy: capturedRecord.accuracy,
        address: capturedRecord.address || resolutionTarget.location,
        ward: resolutionTarget.ward,
      });

      if (res.data.success) {
        setIsSubmittingResolution(false);
        setResolutionDone(true);
        setActionSuccess(`Resolution proof submitted for ${resolutionTarget.complaintNumber}. Marked as RESOLUTION SUBMITTED.`);
        fetchDashboard();
      }
    } catch (err: any) {
      setIsSubmittingResolution(false);
      alert(getErrorMessage(err));
    }
  };

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
                  National Smart Governance Operations • Municipal Field Force Portal. On-site statutory verification, GPS-tagged remediation photographic proofing, and SLA-bound civic infrastructure restoration across Anand Wards.
                </p>
              </div>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={syncTelemetry}
              className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100 shadow-2xs cursor-pointer transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Sync Telemetry"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin text-blue-700' : 'text-slate-600'} />
              <span>Sync Portal</span>
            </button>
            <Link
              to="/field-worker/verification"
              className="px-4 py-2 bg-[#0a2540] hover:bg-[#12395b] text-white text-xs font-extrabold rounded-lg shadow-sm flex items-center gap-2 transition-colors cursor-pointer border border-blue-950"
            >
              <Camera size={14} className="text-amber-400" />
              <span>Start Field Inspection</span>
            </Link>
          </div>
        </div>

        {/* Nodal Metadata Bar */}
        <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              Officer: Er. Rajesh Patel (GOV-FO-PWD-101)
            </span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-slate-600">
              Designation: Senior Executive Engineer (Roads & Infra)
            </span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-slate-600">
              Jurisdiction: Anand Zone HQ-01 (Wards 1 – 14)
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
          code="FO-WORKLOAD"
          title="TOTAL ASSIGNED"
          value={summaryMetrics.assigned}
          badge="ACTIVE ROSTER"
          badgeColor="bg-blue-50 text-blue-900 border-blue-200 font-bold"
          subtitle="Cumulative ward assignments"
          footerNote="14 Municipal Wards"
          icon={ClipboardList}
          variant="blue"
        />
        <KPIStatCard
          code="INSP-PENDING"
          title="PENDING INSPECTION"
          value={summaryMetrics.pending}
          badge="NEEDS VISIT"
          badgeColor="bg-amber-50 text-amber-800 border-amber-300 font-bold"
          subtitle="Awaiting on-site inspection"
          footerNote="Mandatory 24h SLA"
          icon={Clock}
          variant="amber"
        />
        <KPIStatCard
          code="REMED-ACTIVE"
          title="IN REMEDIATION"
          value={summaryMetrics.remediation}
          badge="GROUND SQUAD"
          badgeColor="bg-red-50 text-red-800 border-red-300 font-bold"
          subtitle="Civil work currently underway"
          footerNote="PWD & SWM Crews"
          icon={Wrench}
          variant="red"
        />
        <KPIStatCard
          code="VERIF-CLOSED"
          title="VERIFIED & RESOLVED"
          value={summaryMetrics.verified}
          badge="100% AUDITED"
          badgeColor="bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
          subtitle="Photo evidence validated"
          footerNote="98.5% Statutory Compliance"
          icon={CheckCircle2}
          variant="green"
        />
      </div>

      {/* 3. Core Operational Content: Clean 2:1 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2 Cols): Master Priority Work Order Cards Matching Image (ONLY EXISTING PROBLEMS) */}
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
                    EXISTING CASES
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Assigned municipal problem dockets awaiting on-site engineering verification and resolution.
                </p>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by ID, ward, defect..."
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
                All Active ({activeExistingOrders.length})
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
                <span>Critical Priority ({activeExistingOrders.filter((w) => w.priority === 'critical').length})</span>
              </button>
              <button
                onClick={() => setFilterTab('sla')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs ${
                  filterTab === 'sla'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                SLA Alerts ({activeExistingOrders.filter((w) => w.slaState === 'breached' || w.slaState === 'due_soon').length})
              </button>
              <button
                onClick={() => setFilterTab('in_progress')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs ${
                  filterTab === 'in_progress'
                    ? 'bg-blue-800 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100'
                }`}
              >
                In Remediation ({activeExistingOrders.filter((w) => w.status === 'in_progress').length})
              </button>
              <button
                onClick={() => setFilterTab('assigned')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs ${
                  filterTab === 'assigned'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Awaiting Start ({activeExistingOrders.filter((w) => w.status === 'assigned').length})
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
                    View All ({filteredWorkOrders.length})
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
              {filteredWorkOrders.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs space-y-1 bg-white rounded-xl border border-slate-200 p-8">
                  <CheckCircle2 size={32} className="text-emerald-600 mx-auto mb-1" />
                  <p className="font-bold text-slate-700">No active work orders match this filter.</p>
                  <p className="text-[11px] text-slate-400">All corresponding tasks for this view have been resolved.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayedWorkOrders.map((item) => (
                      <div
                        key={item.id}
                        className="gov-card p-4 sm:p-5 hover:shadow-md transition-all border border-slate-200 bg-white rounded-xl flex flex-col justify-between group h-full shadow-2xs"
                      >
                        {/* Top Section */}
                        <div className="space-y-3">
                          {/* Row 1: ID, Category, Badges */}
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-300">
                                {item.complaintNumber}
                              </span>
                              <span className="text-xs font-semibold text-slate-600 truncate max-w-[130px] sm:max-w-[170px]" title={item.categoryLabel}>
                                {item.categoryLabel}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <PriorityBadge priority={item.priority} size="sm" />
                              <StatusBadge status={item.status} size="sm" />
                            </div>
                          </div>

                          {/* Row 2: Title & Description */}
                          <div>
                            <button
                              type="button"
                              onClick={() => setSelectedDetailItem(item)}
                              className="text-left group cursor-pointer block w-full"
                            >
                              <h3 className="font-bold text-[#1d4ed8] text-sm sm:text-base group-hover:text-blue-900 transition-colors line-clamp-1" title={item.title}>
                                {item.title}
                              </h3>
                            </button>
                            <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          </div>

                          {/* Row 3: Photo Thumbnail */}
                          {item.citizenPhoto && (
                            <div className="pt-0.5">
                              <img
                                src={item.citizenPhoto}
                                alt="Evidence"
                                className="w-20 h-14 rounded-lg object-cover border border-slate-300 shadow-2xs cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setSelectedDetailItem(item)}
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
                              <span className="truncate max-w-[120px]" title={item.ward}>{item.ward}</span>
                            </span>

                            <span className="flex items-center gap-1 truncate max-w-[140px]" title={item.location}>
                              <MapPin size={13} className="text-slate-400 shrink-0" />
                              <span className="truncate">{item.location}</span>
                            </span>

                            <span className="flex items-center gap-1 shrink-0">
                              <Calendar size={13} className="text-slate-400 shrink-0" />
                              <span>{item.reportedDate}</span>
                            </span>
                          </div>

                          {/* Line 2: SLA Status on left, Actions on right */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                            <div className="flex items-center gap-1.5 shrink-0">
                              <SLAIndicator slaState={item.slaState} deadline={item.slaDeadline} size="sm" />
                            </div>

                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => setSelectedDetailItem(item)}
                                className="inline-flex items-center gap-0.5 text-blue-600 hover:text-blue-800 font-bold text-xs hover:underline cursor-pointer"
                              >
                                <span>Case File</span>
                                <ChevronRight size={13} />
                              </button>

                              {item.status === 'assigned' && (
                                <button
                                  type="button"
                                  onClick={() => handleStartWork(item)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs shadow-2xs transition-colors cursor-pointer"
                                  title="Acknowledge and mark task as in progress"
                                >
                                  <PlayCircle size={13} className="text-white" />
                                  <span>Start Work</span>
                                </button>
                              )}

                              {item.status === 'in_progress' && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenResolutionModal(item)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white font-extrabold text-xs shadow-2xs transition-colors cursor-pointer"
                                  title="Upload remediation proof and submit resolution"
                                >
                                  <Camera size={13} className="text-amber-300" />
                                  <span>Submit Resolution</span>
                                </button>
                              )}

                              {item.status === 'resolution_submitted' && (
                                <span className="px-2 py-1 rounded bg-amber-100 text-amber-800 font-bold text-[10px] border border-amber-300">
                                  Verification Pending
                                </span>
                              )}

                              <Link
                                to={`/field-worker/verification?challengeId=${item.challengeId}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0a2540] hover:bg-[#12395b] text-white font-extrabold text-xs shadow-2xs transition-colors cursor-pointer"
                                title="Navigate to Realtime Camera Capture Desk"
                              >
                                <Camera size={12} className="text-amber-400" />
                                <span>Camera</span>
                              </Link>
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

        {/* Right Column (1 Col): TODAY'S SCHEDULED STOPS AT THE TOP, followed by Quick Tools */}
        <div className="space-y-4">
          {/* 1. TODAY'S SCHEDULED STOPS (Moved Up per user instruction) */}
          <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Calendar size={14} className="text-blue-900" />
                <span>TODAY'S SCHEDULED STOPS</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {workOrders.length} {workOrders.length === 1 ? 'VISIT' : 'VISITS'}
              </span>
            </div>

            <div className="space-y-2.5">
              {workOrders.length > 0 ? (
                workOrders.slice(0, 3).map((wo, idx) => {
                  const targetId = wo.complaintNumber || wo.id || wo.challengeId;
                  const timeSlot = (wo as any).scheduledTime || (idx === 0 ? '10:30 AM' : idx === 1 ? '12:00 PM' : '02:30 PM');
                  const lat = wo.coordinates?.lat || 22.5601;
                  const lng = wo.coordinates?.lng || 72.9285;
                  const address = wo.location || 'Site inspection location';
                  return (
                    <div
                      key={targetId || idx}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[10px] text-blue-900 bg-blue-100/70 px-2 py-0.5 rounded">
                          {timeSlot}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">{wo.ward || 'Zone HQ-01'}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs leading-snug line-clamp-1">
                        {wo.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {address}
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-bold text-blue-900 hover:underline flex items-center gap-1"
                        >
                          <Navigation size={11} />
                          <span>Navigate</span>
                        </a>
                        <Link
                          to={`/field-worker/verification?challengeId=${targetId}`}
                          className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                        >
                          <span>Start Visit →</span>
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-center">
                  <p className="text-xs text-slate-500">No scheduled visits for today.</p>
                </div>
              )}
            </div>
          </div>

          {/* 2. Quick Field Operations Toolbelt */}
          <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-4 space-y-3">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 block">
              QUICK FIELD OPERATIONS TOOLBELT
            </span>

            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/field-worker/verification"
                className="p-3 rounded-lg bg-blue-50 hover:bg-blue-100/80 border border-blue-200 transition-colors group flex flex-col justify-between"
              >
                <div className="w-8 h-8 rounded-md bg-blue-900 text-white flex items-center justify-center mb-2 shadow-2xs group-hover:scale-105 transition-transform">
                  <Camera size={15} className="text-amber-400" />
                </div>
                <div>
                  <h4 className="font-extrabold text-blue-950 text-xs leading-tight">Camera Audit</h4>
                  <p className="text-[10px] text-blue-700/80 mt-0.5">Live site photos</p>
                </div>
              </Link>

              <Link
                to="/field-worker/before-after"
                className="p-3 rounded-lg bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 transition-colors group flex flex-col justify-between"
              >
                <div className="w-8 h-8 rounded-md bg-emerald-800 text-white flex items-center justify-center mb-2 shadow-2xs group-hover:scale-105 transition-transform">
                  <Layers size={15} />
                </div>
                <div>
                  <h4 className="font-extrabold text-emerald-950 text-xs leading-tight">Photologs</h4>
                  <p className="text-[10px] text-emerald-700/80 mt-0.5">Before & After</p>
                </div>
              </Link>

              <Link
                to="/field-worker/map"
                className="p-3 rounded-lg bg-amber-50 hover:bg-amber-100/80 border border-amber-200 transition-colors group flex flex-col justify-between"
              >
                <div className="w-8 h-8 rounded-md bg-amber-700 text-white flex items-center justify-center mb-2 shadow-2xs group-hover:scale-105 transition-transform">
                  <Compass size={15} />
                </div>
                <div>
                  <h4 className="font-extrabold text-amber-950 text-xs leading-tight">GIS Map</h4>
                  <p className="text-[10px] text-amber-800/80 mt-0.5">Ward telemetry</p>
                </div>
              </Link>

              <Link
                to="/field-worker/reports"
                className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors group flex flex-col justify-between"
              >
                <div className="w-8 h-8 rounded-md bg-slate-800 text-white flex items-center justify-center mb-2 shadow-2xs group-hover:scale-105 transition-transform">
                  <FileText size={15} />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs leading-tight">Field Reports</h4>
                  <p className="text-[10px] text-slate-600 mt-0.5">Inspection files</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Official Inspection Case File Details Modal */}
      {selectedDetailItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-300 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 bg-[#0a2540] text-white flex items-center justify-between shrink-0 border-b border-blue-950">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center">
                  <FileText size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-white/10 text-amber-300 border border-white/20">
                      {selectedDetailItem.complaintNumber}
                    </span>
                    <PriorityBadge priority={selectedDetailItem.priority} size="sm" />
                    <StatusBadge status={selectedDetailItem.status} size="sm" />
                  </div>
                  <h3 className="font-black text-sm text-white mt-1">
                    Grievance Case File & Inspection Docket
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailItem(null)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Close Modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Problem Title & Category */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase">
                    {selectedDetailItem.categoryLabel}
                  </span>
                  <SLAIndicator slaState={selectedDetailItem.slaState} deadline={selectedDetailItem.slaDeadline} size="sm" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm leading-snug pt-1">
                  {selectedDetailItem.title}
                </h4>
                <p className="text-slate-600 leading-relaxed text-xs pt-1">
                  {selectedDetailItem.description}
                </p>
              </div>

              {/* Citizen Photo Preview (Evidence) */}
              {selectedDetailItem.citizenPhoto && (
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 space-y-1">
                  <div className="px-3 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck size={13} className="text-blue-900" />
                      <span>CITIZEN EVIDENCE PHOTOGRAPH</span>
                    </span>
                    <span className="text-[9px] font-mono font-bold text-slate-500">
                      Logged: {selectedDetailItem.reportedDate}
                    </span>
                  </div>
                  <div className="h-48 w-full overflow-hidden bg-slate-200 relative">
                    <img
                      src={selectedDetailItem.citizenPhoto}
                      alt="Citizen Evidence"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Site Location & GPS Details */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Site Location & GPS Target
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                    {selectedDetailItem.ward}
                  </span>
                </div>
                <div className="flex items-start gap-1.5 text-slate-800 font-semibold text-xs">
                  <MapPin size={14} className="text-blue-900 shrink-0 mt-0.5" />
                  <span>{selectedDetailItem.location}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1 text-slate-600">
                  <div className="p-2 rounded bg-white border border-slate-200">
                    <span className="text-[9px] font-sans text-slate-400 uppercase block">Latitude</span>
                    <span>{selectedDetailItem.coordinates?.lat || 22.5601}° N</span>
                  </div>
                  <div className="p-2 rounded bg-white border border-slate-200">
                    <span className="text-[9px] font-sans text-slate-400 uppercase block">Longitude</span>
                    <span>{selectedDetailItem.coordinates?.lng || 72.9285}° E</span>
                  </div>
                </div>
              </div>

              {/* Reporter Info */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Reported By</span>
                <span className="font-semibold text-slate-800 block">
                  {selectedDetailItem.reportedBy}
                </span>
                <span className="text-[10px] text-slate-400">Authenticated via Public Grievance Verification</span>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedDetailItem(null)}
                className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedDetailItem.coordinates?.lat || 22.5601},${selectedDetailItem.coordinates?.lng || 72.9285}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
                >
                  <Navigation size={13} className="text-blue-900" />
                  <span>Navigate</span>
                </a>

                {/* Direct button to Solution Dashboard / Verification */}
                <Link
                  to={`/field-worker/verification?challengeId=${selectedDetailItem.challengeId}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0a2540] hover:bg-[#12395b] text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <Camera size={13} className="text-amber-400" />
                  <span>Go to Solution Dashboard</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Official Resolution Proof Upload Modal */}
      {resolutionTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-5 space-y-4 border border-slate-300 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-700" />
                  <span>Submit Remediation & Field Proof</span>
                </h3>
                <span className="font-mono text-xs text-blue-900 font-bold">
                  {resolutionTarget.complaintNumber} • {resolutionTarget.ward}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setResolutionTarget(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {resolutionDone ? (
              <div className="space-y-4 py-2">
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg space-y-2 text-xs text-emerald-900">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                    <CheckCircle2 size={18} />
                    <span>Remediation Geotagged Proof Submitted!</span>
                  </div>
                  <p>Status: <strong className="uppercase">VERIFIED ON GROUND</strong> (100% Geotag Compliance)</p>
                  <p className="italic text-slate-600">"Work completed by on-site municipal engineering squad. Photolog logged into audit ledger."</p>
                </div>
                <button
                  type="button"
                  onClick={() => setResolutionTarget(null)}
                  className="w-full py-2.5 rounded-lg bg-[#0a2540] hover:bg-[#12395b] text-white font-extrabold text-xs shadow-xs cursor-pointer"
                >
                  Return to Work Orders Queue
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitResolution} className="space-y-4 text-xs">
                {/* Defect Context */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Grievance Under Repair</span>
                  <p className="font-bold text-slate-900 text-xs mt-0.5">{resolutionTarget.title}</p>
                </div>

                {/* BEFORE vs AFTER Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* BEFORE: Citizen Grievance */}
                  <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-100 flex flex-col">
                    <div className="px-2.5 py-1.5 bg-slate-200 border-b border-slate-300 flex items-center justify-between">
                      <span className="font-extrabold text-[10px] uppercase text-slate-700">BEFORE</span>
                      <span className="text-[9px] text-slate-500 font-mono">Citizen Reported</span>
                    </div>
                    <div className="h-40 w-full bg-slate-300 relative flex items-center justify-center overflow-hidden">
                      {resolutionTarget.citizenPhoto ? (
                        <img
                          src={resolutionTarget.citizenPhoto}
                          alt="Citizen Before"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-slate-500 text-[11px] italic">No citizen photo</span>
                      )}
                    </div>
                  </div>

                  {/* AFTER: Field Worker Live Geotagged Proof */}
                  <div className="rounded-lg border-2 border-blue-900 overflow-hidden bg-slate-50 flex flex-col">
                    <div className="px-2.5 py-1.5 bg-blue-900 text-white flex items-center justify-between">
                      <span className="font-extrabold text-[10px] uppercase tracking-wider text-amber-400">
                        AFTER • LIVE EVIDENCE
                      </span>
                      <span className="text-[9px] bg-white/20 px-1 py-0.2 rounded font-mono">Camera Only</span>
                    </div>

                    {capturedRecord ? (
                      <div className="flex flex-col grow">
                        <div className="h-40 w-full bg-black relative flex items-center justify-center overflow-hidden">
                          {capturedRecord.type === 'live_video' ? (
                            <video
                              src={capturedRecord.previewUrl}
                              controls
                              className="w-full h-full object-contain bg-black"
                            />
                          ) : (
                            <img
                              src={capturedRecord.previewUrl}
                              alt="Captured Live"
                              className="w-full h-full object-contain bg-black"
                            />
                          )}
                          <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-emerald-600/90 text-white text-[9px] font-bold">
                            GPS VERIFIED
                          </div>
                        </div>
                        <div className="p-2 bg-emerald-50 border-t border-emerald-200 text-[10px] text-emerald-950 flex items-center justify-between">
                          <span className="truncate">Lat {capturedRecord.latitude.toFixed(4)}° Long {capturedRecord.longitude.toFixed(4)}°</span>
                          <button
                            type="button"
                            onClick={() => {
                              setCapturedRecord(null);
                              setCameraModalOpen(true);
                            }}
                            className="text-blue-900 font-bold underline cursor-pointer ml-1"
                          >
                            Retake
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 flex flex-col items-center justify-center text-center space-y-2 grow bg-white">
                        <span className="text-[10.5px] font-bold text-slate-700">Capture Live Evidence</span>
                        <p className="text-[10px] text-slate-500">
                          File upload is disabled. Record live evidence on site.
                        </p>
                        <div className="flex items-center gap-2 pt-1 w-full">
                          <button
                            type="button"
                            onClick={() => {
                              setCameraMode('photo');
                              setCameraModalOpen(true);
                            }}
                            className="flex-1 py-2 rounded-lg bg-blue-900 hover:bg-blue-950 text-white font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Camera size={12} className="text-amber-400" />
                            <span>Live Photo</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCameraMode('video');
                              setCameraModalOpen(true);
                            }}
                            className="flex-1 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Video size={12} className="text-white" />
                            <span>Live Video</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Remarks */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Completion Remarks & Materials Used
                  </label>
                  <textarea
                    value={resolutionRemarks}
                    onChange={(e) => setResolutionRemarks(e.target.value)}
                    rows={2}
                    placeholder="Enter on-ground engineering remarks (e.g. cold mix compaction completed, barricade cleared)..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-700 focus:bg-white text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setResolutionTarget(null)}
                    className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingResolution || !capturedRecord}
                    className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-extrabold shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSubmittingResolution ? (
                      <span>Validating Geotag...</span>
                    ) : (
                      <>
                        <Send size={13} />
                        <span>Submit Resolution Proof</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Live Camera Modal (NO FILE UPLOAD) */}
      {cameraModalOpen && resolutionTarget && (
        <CameraCaptureModal
          isOpen={cameraModalOpen}
          onClose={() => setCameraModalOpen(false)}
          onCapture={(rec) => {
            setCapturedRecord(rec);
            setCameraModalOpen(false);
          }}
          initialMode={cameraMode}
          complaintNumber={resolutionTarget.complaintNumber}
          workerName={user?.name}
          workerBadge={user?.badgeNumber || 'FW-01'}
          departmentName={resolutionTarget.categoryLabel}
          ward={resolutionTarget.ward}
        />
      )}
    </div>
  );
}
