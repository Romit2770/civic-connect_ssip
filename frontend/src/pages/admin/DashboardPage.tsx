import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  FileSpreadsheet,
  AlertTriangle,
  Flame,
  Clock,
  CheckCircle2,
  Users,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  ShieldCheck,
  RefreshCw,
  Target,
  X,
  MapPin,
  Wrench,
  TreePine,
  Zap,
  Waves,
  Droplets,
  Truck,
  Send,
  Eye,
  CheckCircle,
  ExternalLink,
  Shield,
  Radio,
  UserCheck,
  SlidersHorizontal,
  FileText,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import KPIStatCard from '../../components/common/KPIStatCard';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import SLAIndicator from '../../components/common/SLAIndicator';
import FieldOfficerDashboard from '../../components/dashboard/FieldOfficerDashboard';
import { Complaint } from '../../types';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  // If logged in as Field Officer, render dedicated mobile-first field tasks view
  if (user?.role === 'field_officer') {
    return <FieldOfficerDashboard />;
  }

  const [overview, setOverview] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [queueFilter, setQueueFilter] = useState<'all' | 'critical' | 'sla' | 'remediation'>('all');
  const [selectedGrievance, setSelectedGrievance] = useState<any | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [escalationPriority, setEscalationPriority] = useState('critical');
  const [grievanceState, setGrievanceState] = useState('in_progress');
  const [dispatchNote, setDispatchNote] = useState('');

  // 18 Baseline Field Force Officers for dropdown dispatch
  const fullRosterOfficers = [
    { _id: 'fo-pwd-101', name: 'Er. Rajesh Patel', badgeNumber: 'GOV-FO-PWD-101', department: 'Public Works Dept', ward: 'Ward 1' },
    { _id: 'fo-pwd-102', name: 'Er. Amitav Ganguly', badgeNumber: 'GOV-FO-PWD-102', department: 'Public Works Dept', ward: 'Ward 2' },
    { _id: 'fo-pwd-103', name: 'Er. Harishanker Tiwari', badgeNumber: 'GOV-FO-PWD-103', department: 'Public Works Dept', ward: 'Ward 9' },
    { _id: 'fo-swm-201', name: 'Smt. Priya Sharma', badgeNumber: 'GOV-FO-SWM-201', department: 'Solid Waste & Sanitation', ward: 'Ward 8' },
    { _id: 'fo-swm-202', name: 'Shri Ramesh Soren', badgeNumber: 'GOV-FO-SWM-202', department: 'Solid Waste & Sanitation', ward: 'Ward 15' },
    { _id: 'fo-swm-203', name: 'Er. Md. Tariq Anwar', badgeNumber: 'GOV-FO-SWM-203', department: 'Solid Waste & Sanitation', ward: 'Ward 4' },
    { _id: 'fo-ele-301', name: 'Er. Vikramaditya Rao', badgeNumber: 'GOV-FO-ELE-301', department: 'Electrical & Lighting', ward: 'Ward 11' },
    { _id: 'fo-ele-302', name: 'Shri Sandeep Murmu', badgeNumber: 'GOV-FO-ELE-302', department: 'Electrical & Lighting', ward: 'Ward 19' },
    { _id: 'fo-ele-303', name: 'Er. Neha Kulkarni', badgeNumber: 'GOV-FO-ELE-303', department: 'Electrical & Lighting', ward: 'Ward 6' },
    { _id: 'fo-wtr-401', name: 'Er. Alok Ranjan', badgeNumber: 'GOV-FO-WTR-401', department: 'Water Supply Board', ward: 'Ward 14' },
    { _id: 'fo-wtr-402', name: 'Shri Deepak Mahato', badgeNumber: 'GOV-FO-WTR-402', department: 'Water Supply Board', ward: 'Ward 21' },
    { _id: 'fo-wtr-403', name: 'Er. Sunita Hembrom', badgeNumber: 'GOV-FO-WTR-403', department: 'Water Supply Board', ward: 'Ward 3' },
    { _id: 'fo-drn-501', name: 'Er. Arvind Kispotta', badgeNumber: 'GOV-FO-DRN-501', department: 'Urban Drainage & Sewer', ward: 'Ward 1' },
    { _id: 'fo-drn-502', name: 'Shri Manoj Hansda', badgeNumber: 'GOV-FO-DRN-502', department: 'Urban Drainage & Sewer', ward: 'Ward 17' },
    { _id: 'fo-drn-503', name: 'Er. Tanmay Chakraborty', badgeNumber: 'GOV-FO-DRN-503', department: 'Urban Drainage & Sewer', ward: 'Ward 13' },
    { _id: 'fo-env-601', name: 'Er. Gautam Roy', badgeNumber: 'GOV-FO-ENV-601', department: 'Parks & Forestry', ward: 'Ward 7' },
    { _id: 'fo-env-602', name: 'Smt. Anjali Besra', badgeNumber: 'GOV-FO-ENV-602', department: 'Parks & Forestry', ward: 'Ward 23' },
    { _id: 'fo-env-603', name: 'Er. Bhupendra Singh', badgeNumber: 'GOV-FO-ENV-603', department: 'Parks & Forestry', ward: 'Ward 10' },
  ];

  const formattedTimestamp = React.useMemo(() => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${day}-${month}-${year} • ${time} IST`;
  }, []);

  const fallbackDepartmentStats = [
    { departmentId: 'dept-pwd', name: 'Public Works Department', code: 'PWD-01', active: 3, total: 5, percentage: 60, officers: 4, health: 'Optimal' },
    { departmentId: 'dept-swm', name: 'Solid Waste Management & Sanitation', code: 'SWM-02', active: 6, total: 8, percentage: 75, officers: 5, health: 'Optimal' },
    { departmentId: 'dept-elec', name: 'Electrical & Street Lighting', code: 'ELE-03', active: 2, total: 4, percentage: 50, officers: 3, health: 'Optimal' },
    { departmentId: 'dept-water', name: 'Water Supply Department', code: 'WTR-04', active: 4, total: 5, percentage: 80, officers: 3, health: 'Normal' },
    { departmentId: 'dept-drain', name: 'Drainage & Sewerage Department', code: 'DRN-05', active: 3, total: 4, percentage: 75, officers: 3, health: 'Normal' },
    { departmentId: 'dept-parks', name: 'Parks, Gardens & Environment', code: 'ENV-06', active: 1, total: 3, percentage: 33, officers: 2, health: 'Optimal' },
  ];

  const fallbackPriorityQueue = [
    {
      _id: 'CC-2026-000101',
      complaintNumber: 'CC-2026-000101',
      title: 'Road Pothole: Deep crater near Navrangpura crossroads',
      category: 'pothole',
      department: 'Public Works Department',
      priority: 'high',
      status: 'in_progress',
      slaState: 'due_soon',
      location: { address: 'Near Navrangpura Cross Road, Ward 1' },
      ward: 'Ward 1 (Navrangpura)',
      assignedOfficer: 'Rajesh Patel (Lead Unit PWD-12)',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      description: 'Severe 45cm diameter asphalt depression causing motorcycle skid risks at the peak traffic intersection. Requires cold mix asphalt compaction and barricade deployment.',
    },
    {
      _id: 'CC-2026-000106',
      complaintNumber: 'CC-2026-000106',
      title: 'Fallen Tree: Heavy neem tree branch blocking lane',
      category: 'tree',
      department: 'Parks, Gardens & Environment',
      priority: 'critical',
      status: 'reopened',
      slaState: 'within_sla',
      location: { address: 'Near Ellisbridge Gymkhana, Ward 8' },
      ward: 'Ward 8 (Ellisbridge)',
      assignedOfficer: 'Suresh Verma (Unit ENV-04)',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      description: 'Storm winds caused heavy 8-meter trunk collapse spanning both arterial carriage ways. Emergency woodcutter chainsaw crews dispatched for lane clearing.',
    },
    {
      _id: 'CC-2026-000103',
      complaintNumber: 'CC-2026-000103',
      title: 'Defective Streetlight: Cluster of 4 poles dark on main lane',
      category: 'streetlight',
      department: 'Electrical & Street Lighting',
      priority: 'high',
      status: 'assigned',
      slaState: 'due_soon',
      location: { address: 'Sabarmati Riverfront Link Road, Ward 3' },
      ward: 'Ward 3 (Riverfront West)',
      assignedOfficer: 'Amit Sharma (Unit ELE-08)',
      createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      description: 'Sub-distribution feeder line tripped, rendering consecutive 120W LED fixtures inoperable along pedestrian jogging track.',
    },
    {
      _id: 'CC-2026-000105',
      complaintNumber: 'CC-2026-000105',
      title: 'Blocked Drainage: Manhole overflowing on commercial walkway',
      category: 'drainage',
      department: 'Drainage & Sewerage Department',
      priority: 'high',
      status: 'submitted',
      slaState: 'breached',
      location: { address: 'Maninagar Railway Station Approach, Ward 4' },
      ward: 'Ward 4 (Maninagar Central)',
      assignedOfficer: 'Vikram Singh (Unit DRN-02)',
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      description: 'Silt blockage in 450mm primary storm conduit resulting in foul water backflow across railway commuter entrance. Suction jetting machine requested.',
    },
  ];

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async (showNotification: boolean = false) => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/overview');
      if (res.data?.success) {
        setOverview(res.data.data);
        if (showNotification) {
          setActionSuccess('Municipal Operations telemetry synchronized with NIC Nodal Gateway.');
        }
      }
    } catch (e) {
      console.warn('Failed to load admin overview');
    } finally {
      setLoading(false);
    }
  };

  const priorityList =
    overview?.criticalGrievancesList && overview.criticalGrievancesList.length > 0
      ? overview.criticalGrievancesList
      : fallbackPriorityQueue;

  const departmentStats =
    overview?.departmentStats && overview.departmentStats.length > 0
      ? overview.departmentStats
      : fallbackDepartmentStats;

  const getCategoryDetails = (category: string = '', title: string = '') => {
    const cat = (category || '').toLowerCase();
    const tit = (title || '').toLowerCase();
    if (cat.includes('pothole') || tit.includes('pothole') || tit.includes('road')) {
      return { name: 'PWD • Roads & Infra', icon: Wrench, color: 'text-amber-700 bg-amber-50 border-amber-200' };
    }
    if (cat.includes('tree') || tit.includes('tree') || cat.includes('garden') || tit.includes('branch')) {
      return { name: 'Parks & Forestry', icon: TreePine, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    }
    if (cat.includes('streetlight') || cat.includes('electrical') || tit.includes('street') || tit.includes('light') || tit.includes('pole')) {
      return { name: 'Electrical & Lighting', icon: Zap, color: 'text-blue-700 bg-blue-50 border-blue-200' };
    }
    if (cat.includes('drainage') || cat.includes('sewer') || tit.includes('drain') || tit.includes('manhole')) {
      return { name: 'Urban Drainage & Sewer', icon: Waves, color: 'text-cyan-700 bg-cyan-50 border-cyan-200' };
    }
    if (cat.includes('water') || tit.includes('water') || tit.includes('pipe')) {
      return { name: 'Water Supply Board', icon: Droplets, color: 'text-sky-700 bg-sky-50 border-sky-200' };
    }
    return { name: 'Solid Waste & Sanitation', icon: Truck, color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  const getDeptIcon = (name: string = '') => {
    const n = name.toLowerCase();
    if (n.includes('road') || n.includes('public works') || n.includes('pwd')) return Wrench;
    if (n.includes('waste') || n.includes('sanitation')) return Truck;
    if (n.includes('light') || n.includes('elec')) return Zap;
    if (n.includes('water')) return Droplets;
    if (n.includes('drain') || n.includes('sewer')) return Waves;
    if (n.includes('park') || n.includes('garden') || n.includes('tree')) return TreePine;
    return Activity;
  };

  const filteredPriorityList = priorityList.filter((item: any) => {
    if (queueFilter === 'critical') return item.priority === 'critical';
    if (queueFilter === 'sla') return item.slaState === 'breached' || item.slaState === 'due_soon';
    if (queueFilter === 'remediation') return item.status === 'in_progress' || item.status === 'assigned';
    return true;
  });

  const openTriageModal = (item: any) => {
    setSelectedGrievance(item);
    setEscalationPriority(item.priority === 'critical' ? 'critical' : 'high');
    setGrievanceState(item.status || 'in_progress');
    setDispatchNote('Provide urgent instructions to the on-site officer (e.g. Expedite asphalt machine before morning peak hours)...');
    setSelectedOfficer('');
  };

  const handleConfirmDispatch = () => {
    setIsDispatching(true);
    setTimeout(() => {
      setIsDispatching(false);
      const officerObj = fullRosterOfficers.find((o) => o._id === selectedOfficer);
      const officerLabel = officerObj ? `${officerObj.name} (${officerObj.badgeNumber})` : 'On-Site Field Officer';
      setActionSuccess(`Work Order successfully dispatched for ${selectedGrievance?.complaintNumber || selectedGrievance?._id}. Assigned to ${officerLabel}. Encrypted telemetry alert broadcasted.`);
      setSelectedGrievance(null);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Official Government Header Banner with Ashoka Insignia & National Tricolor Ribbon */}
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
                  MGCC-State Apex Gateway
                </span>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  NIC Live Telemetry
                </span>
              </div>

              {/* Title & Institutional Details */}
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Municipal Operations Command Center</span>
                </h1>
                <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                  National Smart Governance Operations • Municipal Grievance Command & Control System (MGCC). Overseeing real-time city grievance surveillance, inter-departmental dispatching, and statutory SLA compliance monitoring.
                </p>
              </div>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => loadOverview(true)}
              className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100 shadow-2xs cursor-pointer transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Sync Telemetry"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin text-blue-700' : 'text-slate-600'} />
              <span>Sync Portal</span>
            </button>
            <Link
              to="/admin/issues"
              className="px-4 py-2 bg-[#0a2540] hover:bg-[#12395b] text-white text-xs font-extrabold rounded-lg shadow-sm flex items-center gap-2 transition-colors cursor-pointer border border-blue-950"
            >
              <Target size={14} className="text-amber-400" />
              <span>Complaint Queue & Triage ({overview?.total ?? 6})</span>
            </Link>
          </div>
        </div>

        {/* Nodal Metadata Bar */}
        <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              Apex Command Hub: State Operations (Zone HQ-01)
            </span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-slate-600">
              Directorate: Municipal Administration (MoHUA)
            </span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-slate-600">
              Admin: Municipal Commissioner (Super Admin)
            </span>
          </div>
          <div className="font-mono text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
            Node Timestamp: {formattedTimestamp}
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* 5 Real Municipal Command KPI Stat Cards - Exact Institutional Grid Format */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <KPIStatCard
          code="GRV-ACTIVE"
          title="TOTAL GRIEVANCES"
          value={overview?.total ?? 6}
          badge="100% ACTIVE"
          badgeColor="bg-amber-50 text-amber-800 border-amber-200 font-bold"
          subtitle="Cumulative city complaints"
          footerNote="48 Wards"
          icon={FileSpreadsheet}
          variant="amber"
        />
        <KPIStatCard
          code="REMED-OPS"
          title="IN REMEDIATION"
          value={overview?.inProgress ?? 3}
          badge="3 ACTIVE"
          badgeColor="bg-emerald-50 text-emerald-700 border-emerald-300 font-bold"
          subtitle="On-site active work units"
          footerNote="Wards 1, 4 & 8"
          icon={Activity}
          variant="green"
        />
        <KPIStatCard
          code="EVAL-QUEUE"
          title="PENDING REVIEWS"
          value={overview?.pendingReviews ?? 2}
          badge="ACTION NEEDED"
          badgeColor="bg-amber-50 text-amber-800 border border-amber-200 font-bold"
          subtitle="Submissions awaiting sign-off"
          footerNote="2 Queued"
          icon={Clock}
          variant="amber"
        />
        <KPIStatCard
          code="CRIT-ESCL"
          title="CRITICAL ESCALATIONS"
          value={overview?.critical ?? 1}
          badge="ON SCHEDULE"
          badgeColor="bg-rose-50 text-rose-800 border-rose-200 font-bold"
          subtitle="Level-1 high hazard alerts"
          footerNote="1 Alert"
          icon={Flame}
          variant="red"
        />
        <KPIStatCard
          code="FORCE-CORPS"
          title="FIELD OFFICERS"
          value={18}
          badge="18 ACTIVE"
          badgeColor="bg-indigo-50 text-indigo-700 border-indigo-200 font-bold"
          subtitle="Active patrol & GPS synced"
          footerNote="100% Online"
          icon={Users}
          variant="purple"
        />
      </div>

      {/* 4. REDESIGNED HIGH-CLARITY SECTION: PRIORITY OPERATIONAL QUEUE & DEPARTMENT FORCE CAPACITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Priority Operational Queue & Rapid Triage */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden flex flex-col">
          {/* Card Header & Filter Tab Strip */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 text-sm tracking-tight flex items-center gap-2">
                    <span>Priority Operational Queue & Rapid Triage</span>
                    <span className="text-[10px] font-extrabold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-300">
                      {filteredPriorityList.length} Active
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Immediate field dispatch, statutory SLA escalation & civil safety oversight
                  </p>
                </div>
              </div>

              <Link
                to="/admin/issues?priority=critical"
                className="text-xs font-bold text-[#133054] hover:text-blue-900 flex items-center gap-1.5 bg-white border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg shadow-2xs transition-colors"
              >
                <span>View Full Registry</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Quick Filter Segmented Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
              <button
                onClick={() => setQueueFilter('all')}
                className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  queueFilter === 'all'
                    ? 'bg-[#133054] text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                All Incidents ({priorityList.length})
              </button>
              <button
                onClick={() => setQueueFilter('critical')}
                className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  queueFilter === 'critical'
                    ? 'bg-rose-700 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Flame size={12} className={queueFilter === 'critical' ? 'text-amber-300' : 'text-rose-600'} />
                <span>Critical Priority ({priorityList.filter((p: any) => p.priority === 'critical').length})</span>
              </button>
              <button
                onClick={() => setQueueFilter('sla')}
                className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  queueFilter === 'sla'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Clock size={12} className={queueFilter === 'sla' ? 'text-white' : 'text-amber-600'} />
                <span>SLA Alerts ({priorityList.filter((p: any) => p.slaState === 'breached' || p.slaState === 'due_soon').length})</span>
              </button>
              <button
                onClick={() => setQueueFilter('remediation')}
                className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  queueFilter === 'remediation'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Wrench size={12} className={queueFilter === 'remediation' ? 'text-emerald-200' : 'text-emerald-600'} />
                <span>In Remediation ({priorityList.filter((p: any) => p.status === 'in_progress' || p.status === 'assigned').length})</span>
              </button>
            </div>
          </div>

          {/* Incident Rows */}
          <div className="divide-y divide-slate-100 flex-1">
            {filteredPriorityList.map((item: any) => {
              const catDetails = getCategoryDetails(item.category, item.title);
              const CatIcon = catDetails.icon;
              const isBreached = item.slaState === 'breached';
              const isDueSoon = item.slaState === 'due_soon';

              return (
                <div
                  key={item._id || item.complaintNumber}
                  className="p-4 hover:bg-slate-50/90 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  {/* Left Info Column */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Category Icon Badge */}
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs mt-0.5 ${catDetails.color}`}
                    >
                      <CatIcon size={20} />
                    </div>

                    <div className="space-y-1.5 min-w-0 flex-1">
                      {/* Tracking ID & Badges Row */}
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="font-mono font-bold text-[11px] bg-slate-100 text-[#133054] px-2 py-0.5 rounded border border-slate-200">
                          {item.complaintNumber}
                        </span>
                        <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {catDetails.name}
                        </span>
                        <PriorityBadge priority={item.priority} size="sm" />
                        <StatusBadge status={item.status} size="sm" />
                        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Main Title */}
                      <button
                        onClick={() => setSelectedGrievance(item)}
                        className="text-left font-black text-slate-900 text-sm hover:text-blue-800 transition-colors block line-clamp-1 cursor-pointer"
                      >
                        {item.title}
                      </button>

                      {/* Location & Assigned Officer Row */}
                      <div className="flex flex-wrap items-center gap-3 text-[11.5px] text-slate-500">
                        <span className="flex items-center gap-1 truncate">
                          <MapPin size={12} className="text-rose-600 shrink-0" />
                          <span className="truncate">{item.location?.address || 'Municipal Zone, Ward 1'}</span>
                        </span>
                        <span className="text-slate-300 hidden sm:inline">•</span>
                        <span className="flex items-center gap-1 text-slate-700 font-semibold bg-blue-50/80 px-2 py-0.5 rounded border border-blue-200/80">
                          <UserCheck size={12} className="text-blue-700 shrink-0" />
                          <span>{item.assignedOfficer || 'Patrol Unit Assigned'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Action Column: Details & Triage */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => openTriageModal(item)}
                      className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText size={13} className="text-slate-500" />
                      <span>Details</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openTriageModal(item)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#0a2540] hover:bg-[#12395b] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Triage</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredPriorityList.length === 0 && (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <CheckCircle2 size={32} className="mx-auto text-emerald-600" />
                <p className="text-sm font-bold text-slate-800">No matching priority escalations in this filter.</p>
                <p className="text-xs text-slate-500">All municipal incidents are compliant with statutory SLA guidelines.</p>
              </div>
            )}
          </div>

          {/* Queue Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              State Apex Triage Connected • Instant Dispatch Enabled
            </span>
            <Link to="/admin/issues" className="text-[#133054] font-bold hover:underline">
              Advanced Filters →
            </Link>
          </div>
        </div>

        {/* Right 1 Col: Department Readiness & Force Capacity */}
        <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#133054]">
                <Layers size={16} />
              </div>
              <div>
                <h2 className="font-black text-slate-900 text-xs sm:text-sm uppercase tracking-wider">
                  Department Capacity
                </h2>
                <p className="text-[10px] text-slate-500 font-medium">Real-time municipal squad deployment</p>
              </div>
            </div>
            <Link
              to="/admin/officers"
              className="text-[11px] font-bold text-blue-900 bg-white border border-slate-200 hover:border-slate-300 px-2.5 py-1 rounded-md shadow-2xs"
            >
              Force Roster →
            </Link>
          </div>

          {/* Department Workload List */}
          <div className="p-4 space-y-4 text-xs flex-1">
            {departmentStats.map((d: any) => {
              const DeptIcon = getDeptIcon(d.name);
              const activeCount = d.active ?? 2;
              const totalCount = d.total ?? 5;
              const percentage = d.percentage ?? Math.min(100, Math.round((activeCount / Math.max(1, totalCount)) * 100));
              const officers = d.officers ?? 3;

              // Color determination
              let barColor = 'bg-blue-600';
              let healthText = 'Optimal';
              let healthBadge = 'bg-emerald-50 text-emerald-800 border-emerald-200';

              if (percentage > 85) {
                barColor = 'bg-rose-600';
                healthText = 'High Load';
                healthBadge = 'bg-rose-50 text-rose-800 border-rose-200';
              } else if (percentage > 70) {
                barColor = 'bg-amber-500';
                healthText = 'Heavy Load';
                healthBadge = 'bg-amber-50 text-amber-800 border-amber-200';
              } else if (percentage < 45) {
                barColor = 'bg-emerald-600';
                healthText = 'Normal';
                healthBadge = 'bg-emerald-50 text-emerald-800 border-emerald-200';
              }

              return (
                <div key={d.departmentId || d.name} className="space-y-1.5 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-center font-bold text-slate-800">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <DeptIcon size={14} className="text-slate-600 shrink-0" />
                      <span className="truncate text-xs font-bold text-slate-900">{d.name}</span>
                    </div>
                    <span className="font-mono text-[#133054] text-[11px] shrink-0 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-extrabold">
                      {activeCount} Active
                    </span>
                  </div>

                  {/* Progress Meter Bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/60">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${Math.max(10, percentage)}%` }}
                    />
                  </div>

                  {/* Bottom Stats */}
                  <div className="flex justify-between text-[10.5px] text-slate-500 font-medium">
                    <span>
                      Workload Ratio: <strong className="text-slate-700">{percentage}%</strong> ({activeCount}/{totalCount} Squads)
                    </span>
                    <span className={`px-1.5 py-0.2 rounded border text-[9.5px] font-bold ${healthBadge}`}>
                      {healthText} • {officers} Units
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Department Bottom Summary */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Users size={13} className="text-blue-700" />
                <span>18 Field Officers Mobilized</span>
              </span>
              <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                100% TELEMETRY
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              12 Active In-Field • 4 Standby Reserves • 2 Rapid Response
            </p>
          </div>
        </div>
      </div>

      {/* 5. INTERACTIVE GOVERNMENT INCIDENT DOSSIER & RAPID TRIAGE MODAL */}
      {selectedGrievance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Top Header with Tricolor Ribbon */}
            <div className="h-1.5 w-full flex">
              <div className="h-full flex-1 bg-[#ff9933]" />
              <div className="h-full flex-1 bg-white" />
              <div className="h-full flex-1 bg-[#138808]" />
            </div>

            {/* Dark Navy Command Header Matching Image 3 */}
            <div className="p-4 sm:p-5 bg-[#0a2540] text-white flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center shrink-0">
                  <SlidersHorizontal size={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30 uppercase tracking-wider">
                      RAPID APEX TRIAGE
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-300">
                      {selectedGrievance.complaintNumber}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white mt-1 leading-snug line-clamp-1">
                    {selectedGrievance.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedGrievance(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Matching Image 3 */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Jurisdiction Location & Active SLA Status Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Jurisdiction Location:</span>
                  <span className="text-slate-900 font-bold">{selectedGrievance.location?.address || 'Sakchi Main Roundabout, Ward 14'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Active SLA Status:</span>
                  {selectedGrievance.slaState === 'breached' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-extrabold bg-rose-50 text-rose-800 border border-rose-300 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                      SLA Breached
                    </span>
                  ) : selectedGrievance.slaState === 'due_soon' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                      <Clock size={12} className="text-amber-700" />
                      Due Soon (&lt;6h)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 size={12} className="text-emerald-700" />
                      Within SLA
                    </span>
                  )}
                </div>
              </div>

              {/* Assign / Dispatch Field Force Officer */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Users size={14} className="text-[#0a2540]" />
                  <span>ASSIGN / DISPATCH FIELD FORCE OFFICER</span>
                </label>
                <select
                  value={selectedOfficer}
                  onChange={(e) => setSelectedOfficer(e.target.value)}
                  className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Select Field Officer from Force Roster --</option>
                  {fullRosterOfficers.map((off) => (
                    <option key={off._id} value={off._id}>
                      {off.name} (Badge: {off.badgeNumber} | {off.department} | {off.ward})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 font-medium">
                  Officer will receive encrypted mobile dispatch alert and on-site task allocation.
                </p>
              </div>

              {/* Priority Escalation & Grievance State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider block">
                    PRIORITY ESCALATION
                  </label>
                  <select
                    value={escalationPriority}
                    onChange={(e) => setEscalationPriority(e.target.value)}
                    className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="critical">Critical Emergency</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Routine Scheduled</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider block">
                    GRIEVANCE STATE
                  </label>
                  <select
                    value={grievanceState}
                    onChange={(e) => setGrievanceState(e.target.value)}
                    className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="in_progress">In Field Remediation</option>
                    <option value="assigned">Officer Assigned</option>
                    <option value="submitted">Submitted / Acknowledged</option>
                    <option value="resolved">Resolved &amp; Verified</option>
                  </select>
                </div>
              </div>

              {/* Super Admin Operational Directive (Dispatch Note) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider block">
                  SUPER ADMIN OPERATIONAL DIRECTIVE (DISPATCH NOTE)
                </label>
                <textarea
                  rows={3}
                  value={dispatchNote}
                  onChange={(e) => setDispatchNote(e.target.value)}
                  placeholder="Provide urgent instructions to the on-site officer (e.g. Expedite asphalt machine before morning peak hours)..."
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <Link
                to={`/admin/issues/${selectedGrievance.complaintNumber || selectedGrievance._id}`}
                className="text-xs font-bold text-[#133054] hover:underline flex items-center gap-1.5"
              >
                <ExternalLink size={13} />
                <span>Open Full Incident Dossier</span>
              </Link>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedGrievance(null)}
                  className="px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDispatching}
                  onClick={handleConfirmDispatch}
                  className="px-4 py-2 rounded-lg bg-[#0a2540] hover:bg-[#12395b] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Send size={13} className={isDispatching ? 'animate-pulse text-amber-400' : 'text-amber-400'} />
                  <span>{isDispatching ? 'Dispatching...' : 'Confirm & Dispatch Work Order'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
