import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Target,
  Users,
  FolderGit2,
  Coins,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  ChevronRight,
  Check,
  MapPin,
  ExternalLink,
  Sparkles,
  Layers,
  Activity,
  FileText,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import KPIStatCard from '../../components/common/KPIStatCard';
import PriorityBadge from '../../components/common/PriorityBadge';
import StatusBadge from '../../components/common/StatusBadge';

export default function IndustryDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/industry-admin/dashboard');
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.warn('Using local fallback for Industry Dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const stats = data?.stats || {
    challengesRecommended: 24,
    collaborationRequests: 8,
    activeProjects: 6,
    industryMentors: 14,
    fundingCommitments: 5,
    completedCollaborations: 9,
    totalCommitted: 1850000,
    totalDisbursed: 1000000,
  };

  const overview = data?.overview || {
    organizationName: 'Tata Steel Utilities & Infrastructure',
    registrationId: 'CIN: U45200JH1993PLC005396',
    industryDomain: 'Urban Infrastructure & Smart Utility Management',
    location: 'Jamshedpur, Jharkhand',
    activePartnerships: 6,
    technicalMentors: 14,
    activeProjects: 6,
    totalFundingCommitted: 1850000,
    completedCollaborations: 9,
  };

  const recommendedChallenges = data?.recommendedChallenges || [
    {
      id: 'CH-2026-089',
      title: 'Low-Cost IoT Sensor Network for Real-Time Pipeline Leakage & Water Pressure',
      domain: 'Water & Sanitation Infrastructure',
      location: 'Ward 4, Bistupur Central',
      priority: 'high',
      matchPercent: 94,
      matchReasons: [
        'Water infrastructure domain match',
        'IoT & acoustic sensor capability available',
        'Sakchi hydraulic test bench presence',
        'Jamshedpur Ward 4 field presence',
      ],
      technology: 'IoT / LoRaWAN / Edge FFT',
      requiredExpertise: ['Hydraulic Monitoring', 'IoT Sensors', 'Acoustic FFT'],
      estimatedFunding: '₹ 4,50,000',
      photoUrl: '/assets/evidence/water_pipeline_leak.jpg',
    },
    {
      id: 'CH-2026-112',
      title: 'Computer Vision Drone Inspection for Asphalt Road Macro-Potholes & Creep Cracks',
      domain: 'Public Works & Roads',
      location: 'Ward 1, Kadma West',
      priority: 'high',
      matchPercent: 91,
      matchReasons: [
        'Municipal road network expertise',
        'Drone photogrammetry testing corridors',
        'Kadma West arterial corridor presence',
      ],
      technology: 'Quadcopter Stereo Vision / GIS',
      requiredExpertise: ['Drone Photogrammetry', 'Computer Vision', 'PWD Standards'],
      estimatedFunding: '₹ 6,00,000',
      photoUrl: '/assets/evidence/road_potholes_drone.jpg',
    },
    {
      id: 'CH-2026-145',
      title: 'Decentralized Micro-Composting Digesters with Microbial Inoculant Acceleration',
      domain: 'Solid Waste Management',
      location: 'Ward 7, Sakchi Market',
      priority: 'medium',
      matchPercent: 88,
      matchReasons: [
        'Solid waste management mandate',
        'Organic wet waste market access',
        'Sakchi daily market waste collection facilities',
      ],
      technology: 'Thermophilic Composting / Bioreactor',
      requiredExpertise: ['Composting Biology', 'Humus Testing', 'Odor Control'],
      estimatedFunding: '₹ 3,20,000',
      photoUrl: '/assets/evidence/market_compost_waste.jpg',
    },
  ];

  const collaborationRequests = data?.collaborationRequests || [
    {
      id: 'REQ-COL-2026-001',
      challengeId: 'CH-2026-089',
      projectTitle: 'Low-Cost IoT Sensor Network for Pipeline Leakage',
      universityName: 'National Institute of Technology Jamshedpur',
      facultyMentor: 'Prof. Ananya Sen',
      domain: 'Water & Sanitation Infrastructure',
      fundingRequirement: '₹ 2,00,000',
      status: 'Pending',
      requestDate: '2026-09-21',
    },
    {
      id: 'REQ-COL-2026-002',
      challengeId: 'CH-2026-112',
      projectTitle: 'Computer Vision Drone Inspection for Asphalt Road Potholes',
      universityName: 'National Institute of Technology Jamshedpur',
      facultyMentor: 'Dr. Ramesh Kumar',
      domain: 'Public Works & Roads',
      fundingRequirement: '₹ 2,50,000',
      status: 'Under Review',
      requestDate: '2026-09-22',
    },
  ];

  const activeProjects = data?.activeProjects || [
    {
      id: 'PRJ-CH-2026-089',
      challengeId: 'CH-2026-089',
      title: 'Low-Cost IoT Sensor Network for Pipeline Leakage',
      university: 'NIT Jamshedpur',
      facultyMentor: 'Prof. Ananya Sen',
      studentTeam: 'Smart Water Guild',
      industryMentor: 'Suresh Nambiar',
      stage: 'Field Pilot',
      progress: 85,
      funding: '₹ 4,50,000',
      nextMilestone: 'MLS-03: Sakchi Test Bench Calibration (30 Sep 2026)',
      photoUrl: '/assets/evidence/water_pipeline_leak.jpg',
    },
    {
      id: 'PRJ-CH-2026-112',
      challengeId: 'CH-2026-112',
      title: 'Computer Vision Drone Inspection for Asphalt Road Macro-Potholes',
      university: 'NIT Jamshedpur',
      facultyMentor: 'Dr. Ramesh Kumar',
      studentTeam: 'Robotics Guild',
      industryMentor: 'Arvind Swaminathan',
      stage: 'Field Pilot',
      progress: 60,
      funding: '₹ 6,00,000',
      nextMilestone: 'MLS-02: Kadma West Stereo Photogrammetry (05 Oct 2026)',
      photoUrl: '/assets/evidence/road_potholes_drone.jpg',
    },
    {
      id: 'PRJ-CH-2026-145',
      challengeId: 'CH-2026-145',
      title: 'Decentralized Micro-Composting Digesters with Microbial Inoculant',
      university: 'BIT Mesra',
      facultyMentor: 'Dr. Sunita Murmu',
      studentTeam: 'EnviroTech Guild',
      industryMentor: 'Dr. Priya Balakrishnan',
      stage: 'Prototyping',
      progress: 35,
      funding: '₹ 3,20,000',
      nextMilestone: 'MLS-02: Sakchi Market Bioreactor Inoculation (12 Oct 2026)',
      photoUrl: '/assets/evidence/market_compost_waste.jpg',
    },
    {
      id: 'PRJ-CH-2026-188',
      challengeId: 'CH-2026-188',
      title: 'Solar-Powered LED Smart Streetlighting with Dynamic Dimming',
      university: 'IIT (ISM) Dhanbad',
      facultyMentor: 'Dr. P. K. Sinha',
      studentTeam: 'Urban Grid Photovoltaics',
      industryMentor: 'Rohan Deshmukh',
      stage: 'Prototyping',
      progress: 45,
      funding: '₹ 4,10,000',
      nextMilestone: 'MLS-02: Sonari Bypass Lux Measurement Test (18 Oct 2026)',
      photoUrl: '/assets/evidence/solar_street_lighting.jpg',
    },
  ];

  const recentActivity = data?.recentActivity || [
    {
      id: 'ACT-01',
      title: 'Proposal accepted: NIT Jamshedpur Water Pipeline IoT Network',
      timestamp: '2 hours ago',
      category: 'Proposal',
    },
    {
      id: 'ACT-02',
      title: 'Industry Mentor Suresh Nambiar verified Sakchi Test Bench setup',
      timestamp: '5 hours ago',
      category: 'Mentorship',
    },
    {
      id: 'ACT-03',
      title: 'Tranche-1 funding voucher released: ₹ 4,00,000 to Drone Pothole Team',
      timestamp: 'Yesterday',
      category: 'Funding',
    },
    {
      id: 'ACT-04',
      title: 'BIT Mesra uploaded Micro-Composting testing report version 1.2',
      timestamp: '2 days ago',
      category: 'Deliverable',
    },
  ];

  return (
    <div className="space-y-6 w-full">
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
                  भारत सरकार • Government of India
                </span>
                <span className="text-xs text-slate-300 hidden sm:inline">•</span>
                <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Ministry of Housing & Urban Affairs • Smart Cities Mission
                </span>
                <span className="text-xs text-slate-300 hidden sm:inline">•</span>
                <span className="text-[10px] font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  SIH-195 Nodal Corporate Gateway
                </span>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  NIC Live Telemetry
                </span>
              </div>

              {/* Title & Institutional Details */}
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Industry Innovation & Collaboration Console</span>
                </h1>
                <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                  Manage industry participation, university partnerships, innovation projects, and CSR support at <strong className="text-slate-800">{overview.organizationName}</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => loadDashboard()}
              className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100 shadow-2xs cursor-pointer transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Refresh Metrics"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin text-blue-700' : 'text-slate-600'} />
              <span>Sync Portal</span>
            </button>
            <Link
              to="/industry-admin/projects"
              className="px-4 py-2 bg-[#0a2540] hover:bg-[#12395b] text-white text-xs font-extrabold rounded-lg shadow-sm flex items-center gap-2 transition-colors cursor-pointer border border-blue-950"
            >
              <Target size={14} className="text-amber-400" />
              <span>Active Projects ({stats.activeProjects})</span>
            </Link>
          </div>
        </div>

        {/* Nodal Metadata Bar */}
        <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              Organization: {overview.organizationName}
            </span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-slate-600">
              Domain: {overview.industryDomain}
            </span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-slate-600">
              Admin: Suresh Nambiar (VP - Urban Infrastructure)
            </span>
          </div>
          <div className="font-mono text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
            Node Timestamp: 24-SEP-2026 • 10:40 IST
          </div>
        </div>
      </div>

      {/* 2. Primary 6 Compact Government-Style KPI Stat Cards (Matching UI from screenshot) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <KPIStatCard
          code="REC-CHAL"
          title="CHALLENGES MATCHED"
          value={stats.challengesRecommended || 24}
          badge="High Match"
          badgeColor="bg-[#fffbeb] text-[#b45309] border-[#fcd34d]"
          subtitle="Matching plant capabilities"
          variant="blue"
        />

        <KPIStatCard
          code="COL-QUEUE"
          title="COLLABORATION QUEUE"
          value={stats.collaborationRequests || 4}
          badge="Action Needed"
          badgeColor="bg-[#fffbeb] text-[#b45309] border-[#fcd34d]"
          subtitle="Proposals awaiting action"
          variant="amber"
          valueColor="text-[#c2410c]"
        />

        <KPIStatCard
          code="PRJ-ACTIVE"
          title="ACTIVE R&D PROJECTS"
          value={stats.activeProjects || 6}
          badge="100% Active"
          badgeColor="bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]"
          subtitle="Supported prototypes"
          variant="green"
        />

        <KPIStatCard
          code="MENTOR-POOL"
          title="INDUSTRY MENTORS"
          value={4}
          badge="Accredited"
          badgeColor="bg-[#eef2ff] text-[#4338ca] border-[#c7d2fe]"
          subtitle="Tata Steel domain experts"
          variant="purple"
        />

        <KPIStatCard
          code="FND-CSR"
          title="CSR COMMITMENTS"
          value={stats.fundingCommitments || 5}
          badge="Committed"
          badgeColor="bg-[#fffbeb] text-[#b45309] border-[#fcd34d]"
          subtitle="₹ 18.50 L Sanctioned"
          variant="orange"
          valueColor="text-[#c2410c]"
        />

        <KPIStatCard
          code="COL-DELIV"
          title="MUNICIPAL HANDOVERS"
          value={stats.completedCollaborations || 9}
          badge="Delivered"
          badgeColor="bg-[#f1f5f9] text-[#334155] border-[#cbd5e1]"
          subtitle="JNAC / MNAC Field pilots"
          variant="slate"
        />
      </div>

      {/* 3. Organization Participation Overview Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-900 rounded-lg border border-blue-200">
              <Building2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800">
                  ORGANIZATION PARTICIPATION OVERVIEW
                </h3>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                  ✓ Verified Corporate Partner
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {overview.organizationName} • {overview.registrationId} • {overview.location}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-medium block">Active Partnerships:</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{overview.activePartnerships} HEIs</span>
            </div>
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <div>
              <span className="text-[10px] text-slate-400 font-medium block">Industry Mentors:</span>
              <span className="font-mono font-bold text-blue-900 text-sm">{overview.technicalMentors} Assigned</span>
            </div>
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <div>
              <span className="text-[10px] text-slate-400 font-medium block">Funding Committed:</span>
              <span className="font-mono font-bold text-emerald-700 text-sm">
                ₹ {overview.totalFundingCommitted.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <div>
              <span className="text-[10px] text-slate-400 font-medium block">Completed Collaborations:</span>
              <span className="font-mono font-bold text-slate-800 text-sm">{overview.completedCollaborations}</span>
            </div>
          </div>
        </div>

        <div className="pt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Domain Focus:</span>
            <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono text-[11px]">
              {overview.industryDomain}
            </span>
          </div>
          <Link
            to="/industry-admin/organization"
            className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 hover:underline text-xs"
          >
            <span>View Full Corporate Docket</span>
            <ChevronRight size={13} />
          </Link>
        </div>
      </div>

      {/* 4. Lower Section: Left (Recommended Challenges) & Right (Collaboration Requests) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recommended Challenges (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <Target size={16} className="text-blue-700" />
                <span>RECOMMENDED CHALLENGES</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Societal problem statements matched with your technical capabilities.
              </p>
            </div>
            <Link
              to="/industry-admin/challenges"
              className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 hover:underline"
            >
              <span>View All Challenges</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          <div className="space-y-3.5">
            {recommendedChallenges.map((chal: any) => (
              <div
                key={chal.id}
                className="p-3.5 rounded-lg border border-slate-200/90 hover:border-slate-300 hover:shadow-xs transition-all space-y-2 bg-slate-50/50"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded">
                      {chal.id}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-600 truncate max-w-[200px]">
                      {chal.domain}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-extrabold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-300">
                      ✓ {chal.matchPercent}% Match
                    </span>
                    <PriorityBadge priority={chal.priority} size="sm" />
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <img
                    src={chal.photoUrl}
                    alt={chal.title}
                    className="w-16 h-12 rounded object-cover border border-slate-200 shrink-0 bg-slate-900"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                      {chal.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin size={11} className="text-blue-700 shrink-0" />
                      <span>{chal.location}</span>
                      <span className="mx-1">•</span>
                      <span className="font-mono font-semibold text-slate-700">Est: {chal.estimatedFunding}</span>
                    </p>
                  </div>
                </div>

                {/* Compatibility reasons pill list */}
                <div className="pt-1.5 border-t border-slate-200/70 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-600">
                  <span className="font-bold text-slate-500">Compatibility:</span>
                  {chal.matchReasons.slice(0, 2).map((r: string, i: number) => (
                    <span key={i} className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                      ✓ {r}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Collaboration Requests Queue (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <Clock size={16} className="text-amber-600" />
                <span>COLLABORATION REQUESTS</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                University requests awaiting corporate action.
              </p>
            </div>
            <Link
              to="/industry-admin/collaborations"
              className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 hover:underline"
            >
              <span>View All</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          <div className="space-y-3">
            {collaborationRequests.map((req: any) => (
              <div
                key={req.id}
                className="p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-slate-500">
                    {req.id}
                  </span>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      req.status === 'Pending'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-blue-100 text-blue-900 border border-blue-300'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-slate-900 line-clamp-1">
                    {req.projectTitle}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {req.universityName} • Lead: <strong>{req.facultyMentor}</strong>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-slate-600 font-bold">Req: {req.fundingRequirement}</span>
                  <Link
                    to="/industry-admin/collaborations"
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-0.5 hover:underline"
                  >
                    <span>Review Docket</span>
                    <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Quick link button */}
          <Link
            to="/industry-admin/collaborations"
            className="block text-center w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 transition-colors"
          >
            Manage All University Proposals & Requests →
          </Link>
        </div>
      </div>

      {/* 5. Active Supported Projects Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <FolderGit2 size={16} className="text-blue-700" />
              <span>ACTIVE INDUSTRY SUPPORTED PROJECTS</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live municipal prototypes co-developed with partner universities.
            </p>
          </div>
          <Link
            to="/industry-admin/projects"
            className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
          >
            <span>View All Projects</span>
            <ChevronRight size={13} />
          </Link>
        </div>

        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeProjects.map((proj: any) => (
            <div
              key={proj.id}
              className="p-4 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-300">
                    {proj.id}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] bg-blue-50 text-blue-900 border border-blue-200 font-bold px-2 py-0.5 rounded-full">
                      {proj.stage}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-emerald-700">
                      {proj.progress}%
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <img
                    src={proj.photoUrl}
                    alt={proj.title}
                    className="w-20 h-14 object-cover rounded border border-slate-200 shrink-0 bg-slate-900"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug">
                      {proj.title}
                    </h3>
                    <p className="text-[11px] text-slate-600 mt-1">
                      {proj.university} • Guide: <strong>{proj.facultyMentor}</strong>
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Industry Mentor:</span>
                    <span className="font-bold text-slate-800">{proj.industryMentor}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Next Target:</span>
                    <span className="font-semibold text-blue-900 truncate max-w-[220px]">
                      {proj.nextMilestone}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-slate-700">Committed: {proj.funding}</span>
                <Link
                  to="/industry-admin/projects"
                  className="inline-flex items-center gap-1 font-bold text-blue-700 hover:text-blue-900 hover:underline"
                >
                  <span>Project Console</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Recent Institutional Activity Feed */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <Activity size={14} className="text-blue-700" />
          <span>RECENT INSTITUTIONAL ACTIVITY</span>
        </h3>
        <div className="divide-y divide-slate-100">
          {recentActivity.map((act: any) => (
            <div key={act.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                <span className="font-semibold text-slate-800">{act.title}</span>
              </div>
              <span className="text-slate-400 font-mono text-[10px] shrink-0">{act.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
