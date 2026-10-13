import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ClipboardList,
  Search,
  Filter,
  Eye,
  Camera,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Building2,
  RefreshCw,
  Calendar,
  X,
  Navigation,
  Flame,
  LayoutGrid,
  List,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { useSocket } from '../../context/SocketContext';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import SLAIndicator from '../../components/common/SLAIndicator';
import { ComplaintPriority, ComplaintStatus, SLAState } from '../../types';
type Priority = ComplaintPriority;

interface ChallengeItem {
  id: string;
  complaintNumber: string;
  title: string;
  description: string;
  category: string;
  ward: string;
  wardNumber?: number;
  location: { address?: string; latitude?: number; longitude?: number } | string;
  priority: string;
  status: string;
  assignedDate: string;
  dueDate: string;
  reportedDate?: string;
  reportedBy?: string;
  citizenEvidence?: Array<{ type: string; url: string; caption?: string; timestamp?: string }>;
  citizenPhoto?: string;
  slaState?: SLAState;
  slaDeadline?: string;
}

// Fallback baseline challenges matching Image 1 & 2
const BASELINE_CHALLENGES: ChallengeItem[] = [
  {
    id: 'CC-2026-000101',
    complaintNumber: 'CC-2026-000101',
    title: 'Road Pothole: Deep crater near Navrangpura crossroads',
    description: 'Large and deep pothole causing severe traffic slowdown and severe risk to two-wheelers during evening rush hours.',
    category: 'Road / Pothole Damage',
    ward: 'Ward 1 (Ward 1 (Navrangpura))',
    wardNumber: 1,
    location: { address: 'Near Navrangpura Cross Road, Ward 1', latitude: 22.5688, longitude: 72.9385 },
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    assignedDate: '2026-10-08',
    dueDate: '2026-10-07',
    reportedDate: '10/7/2026',
    reportedBy: 'Citizen (Rahul Mehta) • Resident Welfare Society',
    citizenPhoto: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
    slaState: 'breached',
    slaDeadline: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'CC-2026-000103',
    complaintNumber: 'CC-2026-000103',
    title: 'Defective Streetlight: Cluster of 4 poles dark on main lane',
    description: 'Sub-distribution feeder line tripped and pole base plate open with naked 440V distribution wires outside primary school gate.',
    category: 'Street Lighting',
    ward: 'Ward 3 (Ward 3 (Riverfront))',
    wardNumber: 3,
    location: { address: 'Sabarmati Riverfront Link Road, Ward 3', latitude: 22.5582, longitude: 72.9214 },
    priority: 'HIGH',
    status: 'PENDING_VERIFICATION',
    assignedDate: '2026-10-08',
    dueDate: '2026-10-07',
    reportedDate: '10/7/2026',
    reportedBy: 'Primary School Principal & Parents Association',
    citizenPhoto: 'https://images.unsplash.com/photo-1508873696983-2df57046475a?w=600&auto=format&fit=crop&q=80',
    slaState: 'due_soon',
    slaDeadline: new Date(Date.now() + 3600000 * 4).toISOString(),
  },
  {
    id: 'CC-2026-000104',
    complaintNumber: 'CC-2026-000104',
    title: 'Water Supply: Underground potable main pipe burst with road cavity',
    description: '150mm DI high pressure municipal potable water pipeline joint split under carriage lane, creating deep cavity beneath bitumen.',
    category: 'Water & Sanitation',
    ward: 'Ward 4 (Ward 4 (Station Area))',
    wardNumber: 4,
    location: { address: 'Vastrapur Lake Outer Circle & Station Junction, Ward 4', latitude: 22.5645, longitude: 72.9341 },
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    assignedDate: '2026-10-07',
    dueDate: '2026-10-07',
    reportedDate: '10/6/2026',
    reportedBy: 'Ward 4 Councillor Helpline',
    citizenPhoto: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600&auto=format&fit=crop&q=80',
    slaState: 'breached',
    slaDeadline: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'CC-2026-000102',
    complaintNumber: 'CC-2026-000102',
    title: 'Garbage Overflow: Large commercial dumpster spilling onto road',
    description: 'Secondary municipal waste bin cleared by mechanical compactor crew, sanitized with bleaching powder and perimeter deodorized.',
    category: 'Solid Waste Management',
    ward: 'Ward 7 (Ward 7 (Paldi Corridor))',
    wardNumber: 7,
    location: { address: 'Vegetable Market Lane, Paldi Ward 7', latitude: 22.5651, longitude: 72.9421 },
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    assignedDate: '2026-10-07',
    dueDate: '2026-10-07',
    reportedDate: '10/5/2026',
    reportedBy: 'Vegetable Market Merchants Committee',
    citizenPhoto: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80',
    slaState: 'within_sla',
    slaDeadline: new Date(Date.now() + 3600000 * 18).toISOString(),
  },
  {
    id: 'CH-2026-089',
    complaintNumber: 'CH-2026-089',
    title: 'Severe Stormwater Drain Clogging & Road Overflow',
    description: 'During moderate rainfall, main culvert gets backed up with silt and plastic debris, flooding market street.',
    category: 'Drainage & Stormwater',
    ward: 'Ward 12 (Ward 12 (Anand East))',
    wardNumber: 12,
    location: { address: 'Main Market Road, Near Vegetable Market, Ward 12', latitude: 22.5601, longitude: 72.9285 },
    priority: 'HIGH',
    status: 'PENDING_VERIFICATION',
    assignedDate: '2026-09-22',
    dueDate: '2026-09-26',
    reportedDate: '10/6/2026',
    reportedBy: 'Market Traders & Community Residents',
    citizenPhoto: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=600&auto=format&fit=crop&q=80',
    slaState: 'due_soon',
    slaDeadline: new Date(Date.now() + 3600000 * 8).toISOString(),
  },
  {
    id: 'CC-2026-000106',
    complaintNumber: 'CC-2026-000106',
    title: 'Fallen Tree: Heavy neem tree branch blocking hospital lane',
    description: 'Storm winds caused heavy 8-meter trunk collapse spanning both arterial carriage ways and ambulance entrance.',
    category: 'Parks & Forestry',
    ward: 'Ward 8 (Ward 8 (Ellisbridge))',
    wardNumber: 8,
    location: { address: 'Near Ellisbridge Gymkhana & Civil Hospital, Ward 8', latitude: 22.5524, longitude: 72.9198 },
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    assignedDate: '2026-10-07',
    dueDate: '2026-10-08',
    reportedDate: '10/7/2026',
    reportedBy: 'Medical Officer In-Charge (Civil Hospital)',
    citizenPhoto: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&auto=format&fit=crop&q=80',
    slaState: 'within_sla',
    slaDeadline: new Date(Date.now() + 3600000 * 22).toISOString(),
  },
];

export default function FieldWorkerChallengesPage() {
  const { t } = useTranslation();
  const { socket } = useSocket();

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'in_progress' | 'verified' | 'requires_followup'>('all');
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [wardFilter, setWardFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [selectedDocket, setSelectedDocket] = useState<ChallengeItem | null>(null);

  useEffect(() => {
    fetchChallenges();
  }, [activeTab, domainFilter, priorityFilter, wardFilter]);

  // Real-time socket event listener
  useEffect(() => {
    if (!socket) return;
    const onLiveUpdate = () => {
      fetchChallenges();
    };
    socket.on('complaint:assigned', onLiveUpdate);
    socket.on('notification:new', onLiveUpdate);
    socket.on('complaint:status_changed', onLiveUpdate);

    return () => {
      socket.off('complaint:assigned', onLiveUpdate);
      socket.off('notification:new', onLiveUpdate);
      socket.off('complaint:status_changed', onLiveUpdate);
    };
  }, [socket]);

  async function fetchChallenges() {
    setLoading(true);
    try {
      const params: any = { tab: activeTab };
      if (search) params.search = search;
      if (domainFilter !== 'all') params.domain = domainFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      if (wardFilter !== 'all') params.ward = wardFilter;

      const res = await apiClient.get('/field-worker/challenges', { params });
      if (res.data?.success && Array.isArray(res.data.data?.challenges)) {
        const apiList = res.data.data.challenges.map((c: any) => ({
          ...c,
          id: c.id || c._id || c.complaintNumber,
          complaintNumber: c.complaintNumber || c.id,
          priority: (c.priority || 'HIGH').toUpperCase(),
          status: (c.status || 'PENDING_VERIFICATION').toUpperCase(),
          citizenPhoto: c.citizenPhoto || c.citizenEvidence?.[0]?.url || (c.photos && c.photos[0]) || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600',
        }));
        setChallenges(apiList);
      } else {
        setChallenges([]);
      }
    } catch (err) {
      console.error('Failed to load challenges:', err);
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchChallenges();
  };

  const tabs = [
    { key: 'all', label: 'All Assignments' },
    { key: 'pending', label: 'Pending Verification' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'verified', label: 'Verified' },
    { key: 'requires_followup', label: 'Requires Follow-up' },
  ];

  // Helper to safely get location address string
  const getLocationAddress = (loc: any): string => {
    if (!loc) return 'Anand Municipal Ward Sector';
    if (typeof loc === 'string') return loc;
    if (typeof loc === 'object' && loc.address) return loc.address;
    return 'Anand Ward Sector';
  };

  // Helper to safely get coordinates
  const getCoordinates = (loc: any): { lat: number; lng: number } => {
    if (typeof loc === 'object' && loc !== null) {
      const lat = loc.latitude || loc.lat || 22.5601;
      const lng = loc.longitude || loc.lng || 72.9285;
      return { lat, lng };
    }
    return { lat: 22.5601, lng: 72.9285 };
  };

  // Filtered challenges list for UI
  const filteredChallenges = useMemo(() => {
    return challenges.filter((c) => {
      // Tab filter
      const st = (c.status || '').toUpperCase();
      if (activeTab === 'pending' && st !== 'PENDING_VERIFICATION' && st !== 'PENDING') return false;
      if (activeTab === 'in_progress' && st !== 'IN_PROGRESS' && st !== 'ASSIGNED') return false;
      if (activeTab === 'verified' && st !== 'VERIFIED' && st !== 'RESOLVED') return false;
      if (activeTab === 'requires_followup' && st !== 'REQUIRES_FOLLOWUP') return false;

      // Domain filter
      if (domainFilter !== 'all') {
        const cat = (c.category || '').toLowerCase();
        if (!cat.includes(domainFilter.toLowerCase())) return false;
      }

      // Priority filter
      if (priorityFilter !== 'all') {
        const pr = (c.priority || '').toUpperCase();
        if (pr !== priorityFilter.toUpperCase()) return false;
      }

      // Ward filter
      if (wardFilter !== 'all') {
        const w = (c.ward || '').toLowerCase();
        if (!w.includes(wardFilter.toLowerCase())) return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const mTitle = (c.title || '').toLowerCase().includes(q);
        const mDesc = (c.description || '').toLowerCase().includes(q);
        const mId = (c.complaintNumber || c.id || '').toLowerCase().includes(q);
        const mLoc = getLocationAddress(c.location).toLowerCase().includes(q);
        return mTitle || mDesc || mId || mLoc;
      }

      return true;
    });
  }, [challenges, activeTab, domainFilter, priorityFilter, wardFilter, search]);

  // Slide state: 2 cards per slide / view all mode
  const [currentSlide, setCurrentSlide] = useState(0);
  const [viewMode, setViewMode] = useState<'slide' | 'grid'>('slide');

  // Reset slide index when active filters or search change
  useEffect(() => {
    setCurrentSlide(0);
  }, [activeTab, domainFilter, priorityFilter, wardFilter, search]);

  const totalSlides = Math.ceil(filteredChallenges.length / 2) || 1;
  const safeCurrentSlide = Math.min(currentSlide, Math.max(0, totalSlides - 1));

  const displayedChallenges = useMemo(() => {
    if (viewMode === 'grid') return filteredChallenges;
    const start = safeCurrentSlide * 2;
    return filteredChallenges.slice(start, start + 2);
  }, [filteredChallenges, safeCurrentSlide, viewMode]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-blue-900 text-white shadow-2xs">
            <ClipboardList size={20} className="text-amber-400" />
          </span>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Assigned Challenges
          </h1>
        </div>
        <p className="text-xs text-slate-600 mt-1">
          Civic challenges assigned to you for field verification across Anand Municipality wards.
        </p>
      </div>

      {/* 2. Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === tab.key
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Search & Filters */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by challenge ID, problem description, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="py-2 px-2.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none cursor-pointer"
            >
              <option value="all">All Domains</option>
              <option value="drainage">Drainage</option>
              <option value="water">Water & Sanitation</option>
              <option value="road">Roads & Infra</option>
              <option value="lighting">Street Lighting</option>
              <option value="waste">Solid Waste</option>
              <option value="tree">Parks & Forestry</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="py-2 px-2.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="py-2 px-2.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none cursor-pointer"
            >
              <option value="all">All Wards</option>
              <option value="Ward 1">Ward 1</option>
              <option value="Ward 3">Ward 3</option>
              <option value="Ward 4">Ward 4</option>
              <option value="Ward 7">Ward 7</option>
              <option value="Ward 8">Ward 8</option>
              <option value="Ward 12">Ward 12</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Apply Filters
          </button>
        </form>
      </div>

      {/* 4. Challenges Rendered as Rich Visual Problem Cards Matching Second Image */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2 bg-white rounded-xl border border-slate-200">
            <RefreshCw size={16} className="animate-spin text-blue-900" />
            <span>Loading assigned challenges...</span>
          </div>
        ) : filteredChallenges.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2 bg-white rounded-xl border border-slate-200">
            <ClipboardList size={32} className="mx-auto text-slate-300" />
            <p className="font-bold text-slate-700">No assignments match your filter criteria.</p>
            <p className="text-[11px] text-slate-400">All current challenges under this view are cleared.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* View Mode & Slide Controls Header */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2.5 text-xs">
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
                    View All ({filteredChallenges.length})
                  </button>
                </div>
              </div>

              {viewMode === 'slide' && totalSlides > 1 && (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
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

            {/* Problem Cards: 2 in one slide with perfect box layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedChallenges.map((c) => {
                const photo = c.citizenPhoto || c.citizenEvidence?.[0]?.url || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600';
                const locationStr = getLocationAddress(c.location);
                const pr = (c.priority || 'HIGH').toLowerCase() as Priority;
                const st = (c.status || 'IN_PROGRESS').toLowerCase() as ComplaintStatus;
                const slaStateVal: SLAState = (c.slaState || (pr === 'critical' ? 'breached' : 'due_soon')) as SLAState;

                return (
                  <div
                    key={c.id || c.complaintNumber}
                    className="gov-card p-4 sm:p-5 hover:shadow-md transition-all border border-slate-200 bg-white rounded-xl flex flex-col justify-between group h-full shadow-2xs"
                  >
                    {/* Top Section */}
                    <div className="space-y-3">
                      {/* Row 1: ID, Category, Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-300">
                            {c.complaintNumber || c.id}
                          </span>
                          <span className="text-xs font-semibold text-slate-600 truncate max-w-[130px] sm:max-w-[170px]" title={c.category}>
                            {c.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <PriorityBadge priority={pr} size="sm" />
                          <StatusBadge status={st} size="sm" />
                        </div>
                      </div>

                      {/* Row 2: Title & Description */}
                      <div>
                        <button
                          type="button"
                          onClick={() => setSelectedDocket(c)}
                          className="text-left group cursor-pointer block w-full"
                        >
                          <h3 className="font-bold text-[#1d4ed8] text-sm sm:text-base group-hover:text-blue-900 transition-colors line-clamp-1" title={c.title}>
                            {c.title}
                          </h3>
                        </button>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                          {c.description}
                        </p>
                      </div>

                      {/* Row 3: Photo Thumbnail */}
                      {photo && (
                        <div className="pt-0.5">
                          <img
                            src={photo}
                            alt="Evidence"
                            className="w-20 h-14 rounded-lg object-cover border border-slate-300 shadow-2xs cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setSelectedDocket(c)}
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
                          <span className="truncate max-w-[120px]" title={c.ward || 'Ward 1'}>{c.ward || 'Ward 1'}</span>
                        </span>

                        <span className="flex items-center gap-1 truncate max-w-[140px]" title={locationStr}>
                          <MapPin size={13} className="text-slate-400 shrink-0" />
                          <span className="truncate">{locationStr}</span>
                        </span>

                        <span className="flex items-center gap-1 shrink-0">
                          <Calendar size={13} className="text-slate-400 shrink-0" />
                          <span>{c.reportedDate || c.assignedDate || '10/7/2026'}</span>
                        </span>
                      </div>

                      {/* Line 2: SLA Status on left, Actions on right */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                        <div className="flex items-center gap-1.5 shrink-0">
                          <SLAIndicator slaState={slaStateVal} deadline={c.slaDeadline || c.dueDate} size="sm" />
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setSelectedDocket(c)}
                            className="inline-flex items-center gap-0.5 text-blue-600 hover:text-blue-800 font-bold text-xs hover:underline cursor-pointer"
                          >
                            <span>View Case File</span>
                            <ChevronRight size={13} />
                          </button>

                          <Link
                            to={`/field-worker/verification?challengeId=${c.id || c.complaintNumber}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0a2540] hover:bg-[#12395b] text-white font-extrabold text-xs shadow-2xs transition-colors cursor-pointer"
                            title="Navigate to Solution & Field Verification Desk"
                          >
                            <Camera size={13} className="text-amber-400" />
                            <span>Verify & Solve</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Slide Carousel Pagination Bar */}
            {viewMode === 'slide' && totalSlides > 1 && (
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
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
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
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
          </div>
        )}
      </div>

      {/* 5. Official Inspection Docket Details Modal */}
      {selectedDocket && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-300 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 bg-[#0a2540] text-white flex items-center justify-between shrink-0 border-b border-blue-950">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center">
                  <ClipboardList size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-white/10 text-amber-300 border border-white/20">
                      {selectedDocket.complaintNumber || selectedDocket.id}
                    </span>
                    <PriorityBadge priority={(selectedDocket.priority || 'HIGH').toLowerCase() as any} size="sm" />
                    <StatusBadge status={(selectedDocket.status || 'IN_PROGRESS').toLowerCase() as any} size="sm" />
                  </div>
                  <h3 className="font-black text-sm text-white mt-1">
                    Grievance Case File & Inspection Docket
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDocket(null)}
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
                    {selectedDocket.category}
                  </span>
                  <SLAIndicator slaState={selectedDocket.slaState || 'breached'} deadline={selectedDocket.slaDeadline || selectedDocket.dueDate} size="sm" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm leading-snug pt-1">
                  {selectedDocket.title}
                </h4>
                <p className="text-slate-600 leading-relaxed text-xs pt-1">
                  {selectedDocket.description}
                </p>
              </div>

              {/* Citizen Photo Preview (Evidence) */}
              {(selectedDocket.citizenPhoto || selectedDocket.citizenEvidence?.[0]?.url) && (
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 space-y-1">
                  <div className="px-3 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck size={13} className="text-blue-900" />
                      <span>CITIZEN EVIDENCE PHOTOGRAPH</span>
                    </span>
                    <span className="text-[9px] font-mono font-bold text-slate-500">
                      Logged: {selectedDocket.reportedDate || selectedDocket.assignedDate || '10/7/2026'}
                    </span>
                  </div>
                  <div className="h-48 w-full overflow-hidden bg-slate-200 relative">
                    <img
                      src={selectedDocket.citizenPhoto || selectedDocket.citizenEvidence?.[0]?.url}
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
                    {selectedDocket.ward}
                  </span>
                </div>
                <div className="flex items-start gap-1.5 text-slate-800 font-semibold text-xs">
                  <MapPin size={14} className="text-blue-900 shrink-0 mt-0.5" />
                  <span>{getLocationAddress(selectedDocket.location)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1 text-slate-600">
                  <div className="p-2 rounded bg-white border border-slate-200">
                    <span className="text-[9px] font-sans text-slate-400 uppercase block">Latitude</span>
                    <span>{getCoordinates(selectedDocket.location).lat}° N</span>
                  </div>
                  <div className="p-2 rounded bg-white border border-slate-200">
                    <span className="text-[9px] font-sans text-slate-400 uppercase block">Longitude</span>
                    <span>{getCoordinates(selectedDocket.location).lng}° E</span>
                  </div>
                </div>
              </div>

              {/* Reporter Info */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Reported By</span>
                <span className="font-semibold text-slate-800 block">
                  {selectedDocket.reportedBy || 'Citizen / Community Resident'}
                </span>
                <span className="text-[10px] text-slate-400">Authenticated via Public Grievance Verification</span>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedDocket(null)}
                className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${getCoordinates(selectedDocket.location).lat},${getCoordinates(selectedDocket.location).lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
                >
                  <Navigation size={13} className="text-blue-900" />
                  <span>Navigate</span>
                </a>

                {/* Direct button to Solution Dashboard / Verification */}
                <Link
                  to={`/field-worker/verification?challengeId=${selectedDocket.id || selectedDocket.complaintNumber}`}
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
    </div>
  );
}
