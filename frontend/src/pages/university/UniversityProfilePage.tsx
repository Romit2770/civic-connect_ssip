import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Building,
  Award,
  Globe,
  Mail,
  MapPin,
  CheckCircle2,
  FlaskConical,
  BookOpen,
  RefreshCw,
  ShieldCheck,
  Check,
  QrCode,
  Download,
  Phone,
  BadgeCheck,
  Landmark,
  Activity,
  FileText,
  Copy,
  Printer,
  Users,
  Target,
  FolderGit2,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function UniversityProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [profileRes, dashRes] = await Promise.allSettled([
        apiClient.get('/university/profile'),
        apiClient.get('/university/dashboard'),
      ]);

      if (profileRes.status === 'fulfilled' && profileRes.value.data?.success) {
        setProfile(profileRes.value.data.data);
      }
      if (dashRes.status === 'fulfilled' && dashRes.value.data?.success) {
        setDashboardData(dashRes.value.data.data);
      }
    } catch (err) {
      console.warn('Fallback data loaded for University Admin Profile');
    } finally {
      setLoading(false);
    }
  };

  const p = profile || {
    name: user?.institutionName || 'National Institute of Technology Jamshedpur',
    institutionId: 'AISHE-U-0142',
    state: 'Jharkhand',
    district: 'East Singhbhum (Jamshedpur)',
    website: 'https://www.nitjsr.ac.in',
    contactEmail: user?.email || 'univ.admin@nitjsr.ac.in',
    nodalDean: 'Dr. Ramesh Kumar (Dean of Academic & R&D)',
    departments: [
      'Computer Science & Engineering',
      'Electronics & Communication Engineering',
      'Civil & Environmental Engineering',
      'Mechanical Engineering',
      'Electrical Engineering',
      'Metallurgical & Materials Engineering',
    ],
    incubationCenters: ['NIT Jamshedpur Innovation & Incubation Council (NIIC)', 'MSME Nodal Incubator Center'],
    researchLabs: [
      'IoT & Smart Sensor Calibration Lab',
      'Environmental Wastewater & Composting Testing Unit',
      'Autonomous Aerial Robotics Testing Range',
      'Renewable Solar & Smart Microgrid Testbed',
    ],
    patentsPublished: 14,
    activeStartups: 8,
  };

  const adminName = user?.name || (p.nodalDean ? p.nodalDean.split(' (')[0] : 'Dr. Ramesh Kumar');
  const adminId = user?.adminId || 'UNI-ADMIN-002';
  const universityId = `UA-UNI-2026-${adminId.replace('UNI-ADMIN-', '')}`;
  const digilockerId = `DL-UNI-${user?._id ? user._id.slice(-6).toUpperCase() : '014295'}`;

  // University Activity Real Stats from Dashboard Data
  const stats = dashboardData?.stats || {
    totalChallenges: 14,
    facultyMentors: 18,
    studentTeams: 24,
    completedProjects: 5,
  };

  const activeChallengesStr = stats.totalChallenges !== undefined ? String(stats.totalChallenges).padStart(2, '0') : 'N/A';
  const facultyMentorsStr = stats.facultyMentors !== undefined ? String(stats.facultyMentors).padStart(2, '0') : 'N/A';
  const studentTeamsStr = stats.studentTeams !== undefined ? String(stats.studentTeams).padStart(2, '0') : 'N/A';
  const completedProjectsStr = stats.completedProjects !== undefined ? String(stats.completedProjects).padStart(2, '0') : 'N/A';

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : 'September 2026';

  const copyUniversityId = () => {
    navigator.clipboard.writeText(universityId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Top Breadcrumb & Status Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#133054] text-amber-400 flex items-center justify-center font-bold shadow-xs shrink-0">
            <GraduationCap size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                Institutional Administration
              </span>
              <span className="text-[10px] font-mono text-blue-900 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {universityId}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              University Administration Profile & Institutional Record
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Verified university leadership credentials, accredited nodal infrastructure, and active innovation project management.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyUniversityId}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
            title="Copy University ID"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy ID'}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-950 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 shadow-xs transition-colors cursor-pointer"
            title="Print Record"
          >
            <Printer size={14} />
            <span>Print Record</span>
          </button>
          <button
            onClick={() => loadAllData()}
            className="p-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-xs cursor-pointer"
            title="Refresh Profile"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-blue-700' : ''} />
          </button>
        </div>
      </div>

      {/* Main 2-Column Content Layout matching standard CivicConnect Card proportions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Official University Admin Profile Card (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="gov-card bg-gradient-to-b from-white via-slate-50/40 to-blue-50/20 border-2 border-slate-300 shadow-md rounded-2xl overflow-hidden relative">
            {/* Top Security Tricolor Band */}
            <div className="h-2 w-full bg-gradient-to-r from-[#ff9933] via-white to-[#138808]"></div>

            {/* Smart ID Card Official Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white border-b-2 border-amber-400">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center p-1 flex-shrink-0">
                    <Building size={22} className="text-amber-400" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold tracking-widest uppercase text-amber-300">
                      CIVICCONNECT • NATIONAL CIVIC GRIEVANCE & INNOVATION PLATFORM
                    </div>
                    <div className="text-xs font-extrabold text-white tracking-wide uppercase">
                      UNIVERSITY ADMINISTRATION PROFILE • INSTITUTIONAL RECORD
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-amber-400 text-slate-950 rounded uppercase">
                    UNIVERSITY ADMIN
                  </span>
                  <span className="text-[9px] font-mono text-emerald-300 mt-0.5 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    ● VERIFIED PROFILE
                  </span>
                </div>
              </div>
            </div>

            {/* Smart ID Card Main Body */}
            <div className="p-6 space-y-5">
              <div className="flex flex-col md:flex-row items-center md:items-stretch gap-6">
                {/* Left: Admin Photo & Verification Area */}
                <div className="w-full max-w-[220px] md:w-52 flex flex-col items-center justify-between flex-shrink-0">
                  {/* Photo / Avatar Box */}
                  <div className="relative w-full h-56 sm:h-60 rounded-xl bg-slate-100 border-2 border-slate-300 shadow-sm overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={adminName}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 flex flex-col items-center justify-center text-slate-700 p-4 text-center">
                        <div className="w-20 h-20 rounded-2xl bg-blue-900 text-amber-300 flex items-center justify-center shadow-md mb-2">
                          <GraduationCap size={40} />
                        </div>
                        <span className="text-xs font-bold text-slate-800">Institutional Nodal Desk</span>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5">{p.institutionId}</span>
                      </div>
                    )}

                    {/* Corner Accent */}
                    <div className="absolute top-0 left-0 w-7 h-7 bg-gradient-to-br from-blue-900/60 to-transparent"></div>

                    {/* Verified Institutional Seal */}
                    <div
                      className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-400 via-emerald-200 to-emerald-500 border border-emerald-600 shadow-xs flex flex-col items-center justify-center text-[7px] font-black text-slate-950 leading-none p-0.5"
                      title="CivicConnect Verified Institutional Administrator"
                    >
                      <span className="font-extrabold tracking-tighter">CIVIC</span>
                      <span className="font-extrabold tracking-tighter">VERIFIED</span>
                    </div>
                  </div>

                  {/* Admin Name & Verification Label */}
                  <div className="w-full mt-2.5 pt-1.5 border-b border-slate-300 pb-1 text-center">
                    <div className="font-serif italic font-bold text-sm text-blue-950 tracking-wide truncate">
                      {adminName}
                    </div>
                    <div className="text-[9px] font-bold uppercase text-blue-900 tracking-wider mt-0.5">
                      UNIVERSITY ADMIN
                    </div>
                    <div className="text-[9px] font-bold uppercase text-emerald-800 flex items-center justify-center gap-1 mt-0.5">
                      <Check size={11} strokeWidth={2.5} className="text-emerald-700" />
                      <span>✓ VERIFIED</span>
                    </div>
                  </div>

                  {/* Barcode & Security Card Serial */}
                  <div className="w-full mt-2.5 p-2 bg-slate-50/90 rounded-lg border border-slate-200 text-center space-y-1">
                    <div className="text-[8px] font-bold uppercase text-slate-600 tracking-wider">
                      CIVICCONNECT UNIVERSITY ID
                    </div>
                    <div className="flex items-center justify-center gap-[2px] h-7 px-1 overflow-hidden" title="University Registry Barcode">
                      <div className="w-[2px] h-full bg-slate-900"></div>
                      <div className="w-[1px] h-full bg-slate-900"></div>
                      <div className="w-[3px] h-full bg-slate-900"></div>
                      <div className="w-[1px] h-full bg-slate-900"></div>
                      <div className="w-[2px] h-full bg-slate-900"></div>
                      <div className="w-[4px] h-full bg-slate-900"></div>
                      <div className="w-[1px] h-full bg-slate-900"></div>
                      <div className="w-[2px] h-full bg-slate-900"></div>
                      <div className="w-[3px] h-full bg-slate-900"></div>
                      <div className="w-[1px] h-full bg-slate-900"></div>
                      <div className="w-[2px] h-full bg-slate-900"></div>
                      <div className="w-[1px] h-full bg-slate-900"></div>
                      <div className="w-[3px] h-full bg-slate-900"></div>
                      <div className="w-[2px] h-full bg-slate-900"></div>
                      <div className="w-[1px] h-full bg-slate-900"></div>
                      <div className="w-[4px] h-full bg-slate-900"></div>
                      <div className="w-[1px] h-full bg-slate-900"></div>
                      <div className="w-[2px] h-full bg-slate-900"></div>
                      <div className="w-[3px] h-full bg-slate-900"></div>
                      <div className="w-[1px] h-full bg-slate-900"></div>
                      <div className="w-[2px] h-full bg-slate-900"></div>
                      <div className="w-[3px] h-full bg-slate-900"></div>
                    </div>
                    <div className="font-mono text-[8px] font-bold text-slate-700 tracking-widest">
                      *{universityId}*
                    </div>
                    <div className="pt-1 border-t border-slate-200/80 flex items-center justify-between text-[7px] text-slate-500 font-mono">
                      <span>STATUS: ACTIVE</span>
                      <span className="text-emerald-700 font-bold">AUTHORIZED</span>
                    </div>
                  </div>
                </div>

                {/* Right: Main Information Section & Activity */}
                <div className="flex-1 w-full space-y-4">
                  {/* Name and Verification Badge Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        नाम / FULL LEGAL NAME
                      </div>
                      <div className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <span>{adminName}</span>
                        <BadgeCheck size={20} className="text-emerald-600 flex-shrink-0" />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-950 px-2 py-0.5 rounded border border-blue-200 uppercase">
                          UNIVERSITY ADMIN
                        </span>
                        <span className="text-[10px] text-slate-600 font-semibold">
                          Institutional Record: Active
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex-shrink-0">
                      <ShieldCheck size={16} className="text-emerald-700" />
                      <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wide">
                        Verified Profile
                      </span>
                    </div>
                  </div>

                  {/* 2-Column Information Grid (6 Boxes) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Box 1: Account Type */}
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="text-[9px] font-bold uppercase text-slate-500 block">
                        ACCOUNT TYPE
                      </span>
                      <span className="font-bold text-slate-900 leading-snug">
                        University Admin
                      </span>
                    </div>

                    {/* Box 2: University Admin ID */}
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="text-[9px] font-bold uppercase text-slate-500 block">
                        UNIVERSITY ADMIN ID
                      </span>
                      <span className="font-mono font-extrabold text-blue-950">
                        {adminId}
                      </span>
                    </div>

                    {/* Box 3: Institution */}
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="text-[9px] font-bold uppercase text-slate-500 block">
                        INSTITUTION
                      </span>
                      <span className="font-bold text-slate-900 leading-snug">
                        {p.name}
                      </span>
                    </div>

                    {/* Box 4: Administrative Unit */}
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="text-[9px] font-bold uppercase text-slate-500 block">
                        ADMINISTRATIVE UNIT
                      </span>
                      <span className="font-bold text-slate-900 leading-snug">
                        {user?.designation || 'Research & Innovation Centre'}
                      </span>
                    </div>

                    {/* Box 5: Member Since */}
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="text-[9px] font-bold uppercase text-slate-500 block">
                        MEMBER SINCE
                      </span>
                      <span className="font-bold text-slate-900 leading-snug">
                        {memberSince}
                      </span>
                    </div>

                    {/* Box 6: University Status */}
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="text-[9px] font-bold uppercase text-slate-500 block">
                        UNIVERSITY STATUS
                      </span>
                      <span className="font-bold text-emerald-700 leading-snug">
                        Active / Verified / Authorized
                      </span>
                    </div>
                  </div>

                  {/* University Activity Section */}
                  <div className="p-3 bg-slate-50/90 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Activity size={13} className="text-blue-900" />
                        <span>UNIVERSITY ACTIVITY</span>
                      </span>
                      <span className="text-[9px] font-mono text-slate-500 font-semibold uppercase">
                        INSTITUTIONAL RECORD
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="p-2 bg-white rounded-md border border-slate-200 shadow-2xs">
                        <span className="text-[9px] font-bold uppercase text-slate-600 block leading-tight">
                          Active Challenges
                        </span>
                        <span className="font-mono font-extrabold text-base text-blue-950 mt-0.5 block">
                          {activeChallengesStr}
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded-md border border-slate-200 shadow-2xs">
                        <span className="text-[9px] font-bold uppercase text-indigo-800 block leading-tight">
                          Faculty Mentors
                        </span>
                        <span className="font-mono font-extrabold text-base text-indigo-900 mt-0.5 block">
                          {facultyMentorsStr}
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded-md border border-slate-200 shadow-2xs">
                        <span className="text-[9px] font-bold uppercase text-amber-800 block leading-tight">
                          Student Teams
                        </span>
                        <span className="font-mono font-extrabold text-base text-amber-900 mt-0.5 block">
                          {studentTeamsStr}
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded-md border border-slate-200 shadow-2xs">
                        <span className="text-[9px] font-bold uppercase text-emerald-800 block leading-tight">
                          Completed Projects
                        </span>
                        <span className="font-mono font-extrabold text-base text-emerald-900 mt-0.5 block">
                          {completedProjectsStr}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Section */}
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail size={15} className="text-blue-700 flex-shrink-0" />
                      <span className="font-mono font-semibold text-slate-800 text-[11px] truncate">
                        {user?.email || p.contactEmail || 'univ.admin@nitjsr.ac.in'}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                        ✓ Verified
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Phone size={15} className="text-emerald-700 flex-shrink-0" />
                      <span className="font-mono font-semibold text-slate-800 text-[11px]">
                        {user?.phone || '+91 9431102901'}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                        ✓ Verified
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Security Bar & QR Strip */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/90 -mx-6 -mb-6 px-6 py-3 rounded-b-xl border-t">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    CIVICCONNECT • UNIVERSITY ADMINISTRATION RECORD
                  </div>
                  <div className="font-mono text-[9px] text-slate-600 tracking-wider">
                    {universityId}
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                  <QrCode size={22} className="text-slate-800" />
                  <div className="text-left font-mono text-[8px] leading-tight">
                    <div className="font-bold text-slate-900">SCAN TO VIEW</div>
                    <div className="text-slate-500">UNIVERSITY PROFILE</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Institutional Verification & Quick Actions (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* DigiLocker Institutional Verification Card */}
          <div className="gov-card p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>डिजिलॉकर • DigiLocker</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Institutional Accreditation Registry
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded text-[10px] font-bold">
                VERIFIED
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Document Type:</span>
                <span className="font-semibold text-slate-900">University Administrative Mandate</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">DigiLocker Reference:</span>
                <span className="font-mono font-bold text-blue-900">{digilockerId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">AISHE Institutional Code:</span>
                <span className="font-mono font-semibold text-slate-800">{p.institutionId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">State / District:</span>
                <span className="font-semibold text-slate-900">{p.state}, {p.district}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500">Official Web Portal:</span>
                <a href={p.website} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline font-mono text-[11px] truncate max-w-[200px]">
                  {p.website}
                </a>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500">Official Institutional Record</span>
              <button
                onClick={() => window.print()}
                className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 text-xs cursor-pointer"
              >
                <FileText size={13} />
                <span>Export Dossier</span>
              </button>
            </div>
          </div>

          {/* Incubation & IP metrics */}
          <div className="gov-card p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Award size={15} className="text-amber-600" />
              <span>Incubation & Intellectual Property</span>
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-lg font-black text-blue-900 font-mono block">{p.patentsPublished}</span>
                <span className="text-[10px] text-slate-500 font-medium leading-tight block mt-0.5">Patents</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-lg font-black text-emerald-700 font-mono block">{p.activeStartups}</span>
                <span className="text-[10px] text-slate-500 font-medium leading-tight block mt-0.5">Startups</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-lg font-black text-amber-700 font-mono block">{p.incubationCenters?.length || 2}</span>
                <span className="text-[10px] text-slate-500 font-medium leading-tight block mt-0.5">Incubators</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Certified Laboratories & Participating Academic Departments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Innovation Labs */}
        <div className="gov-card bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <FlaskConical size={18} className="text-blue-900" />
              <h3 className="font-extrabold text-sm text-slate-900">
                Certified Research & Calibration Laboratories
              </h3>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">
              {p.researchLabs?.length || 4} R&D Facilities
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {p.researchLabs?.map((lab: string) => (
              <div key={lab} className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-medium text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                <span>{lab}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Academic Departments */}
        <div className="gov-card bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-blue-900" />
              <h3 className="font-extrabold text-sm text-slate-900">
                Participating Academic Departments
              </h3>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">
              {p.departments?.length || 6} Disciplines
            </span>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {p.departments?.map((d: string) => (
              <span key={d} className="px-3 py-1.5 bg-slate-100 text-slate-800 font-semibold rounded-lg border border-slate-200">
                {d}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
