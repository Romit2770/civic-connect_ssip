import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Building,
  Award,
  Globe,
  Mail,
  MapPin,
  CheckCircle2,
  Clock,
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
  Sparkles,
  ExternalLink,
  Shield,
  Layers,
  Cpu,
  Database,
  Code2,
  Radio,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function StudentLeadProfilePage() {
  const { user } = useAuth();
  const [projectData, setProjectData] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [projRes, dashRes] = await Promise.allSettled([
        apiClient.get('/student-lead/project'),
        apiClient.get('/student-lead/dashboard'),
      ]);

      if (projRes.status === 'fulfilled' && projRes.value.data?.success) {
        setProjectData(projRes.value.data.data);
      }
      if (dashRes.status === 'fulfilled' && dashRes.value.data?.success) {
        setDashboardData(dashRes.value.data.data);
      }
    } catch (err) {
      console.warn('Fallback data loaded for Student Lead Profile');
    } finally {
      setLoading(false);
    }
  };

  // Student Identity Defaults & Overrides
  const studentName = user?.name || 'Aarav Sharma';
  const studentId = user?.registrationId || 'CC-STU-2026-7A29C5';
  const institutionName = user?.institutionName || 'Birla Institute of Technology, Mesra';
  const departmentName = 'B.Tech • Computer Science & Engineering';
  const academicYear = '2026–27';
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : 'September 2026';

  const email = user?.email || 'student.lead@university.edu';
  const phone = user?.phone || '+91 XXXXX XXXXX';

  // Project Collaboration Details
  const projectTitle = projectData?.title || 'Smart Urban Water Management';
  const challengeId = projectData?.challengeId || 'CC-CH-2026-1042';
  const facultyMentor = projectData?.mentor?.name || 'Dr. Ramesh Kumar';
  const industryPartner = projectData?.industryPartner?.name || 'CivicTech Solutions';
  const projectStatus = projectData?.status ? projectData.status.toUpperCase().replace('_', ' ') : 'IN PROGRESS';
  const projectProgress = projectData?.progress !== undefined ? projectData.progress : 68;

  // Statistics
  const activeProjectsCount = '02';
  const completedProjectsCount = '01';
  const deliverablesCount = '08';

  const copyStudentId = () => {
    navigator.clipboard.writeText(studentId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintSlip = () => {
    window.print();
  };

  const expertiseTags = [
    'AI / ML',
    'Web Development',
    'GIS & Mapping',
    'Data Analytics',
    'IoT',
    'Civic Technology',
  ];

  return (
    <div className="space-y-6 w-full">
      {/* Top Breadcrumb & Status Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#133054] text-amber-400 flex items-center justify-center font-bold shadow-xs shrink-0">
            <GraduationCap size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                Academic Personnel Record
              </span>
              <span className="text-[10px] font-mono text-blue-900 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {studentId}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Student Lead Profile & Innovation Identity
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Verified academic credentials, university innovation project assignment, and research collaboration record.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyStudentId}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
            title="Copy Student ID"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copied ? 'ID Copied!' : 'Copy Student ID'}</span>
          </button>
          <button
            onClick={handlePrintSlip}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-950 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 shadow-xs transition-colors cursor-pointer"
            title="Print Identity Slip"
          >
            <Printer size={14} />
            <span>Print Slip</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Main Profile Card Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Authentic Government/University Student Identity Card */}
          <div className="gov-card bg-gradient-to-b from-white via-slate-50/40 to-blue-50/20 border-2 border-slate-300 shadow-md rounded-2xl overflow-hidden relative">
            {/* Top Security Tricolor Band */}
            <div className="h-2 w-full bg-gradient-to-r from-[#ff9933] via-white to-[#138808]"></div>

            {/* Official Card Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white border-b-2 border-amber-400">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center p-1 shrink-0">
                    <GraduationCap size={22} className="text-amber-400" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold tracking-widest uppercase text-amber-300">
                      भारत सरकार • GOVERNMENT OF INDIA
                    </div>
                    <div className="text-[10px] font-bold tracking-widest uppercase text-slate-200">
                      CIVICCONNECT • NATIONAL CIVIC GRIEVANCE & INNOVATION PLATFORM
                    </div>
                    <div className="text-xs font-extrabold text-white tracking-wide uppercase mt-0.5">
                      STUDENT INNOVATION PROFILE • UNIVERSITY PROJECT IDENTITY
                    </div>
                  </div>
                </div>

                {/* Top-Right Badges */}
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-amber-400 text-slate-950 rounded uppercase">
                    STUDENT LEAD
                  </span>
                  <span className="text-[9px] font-mono text-emerald-300 mt-0.5 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    ● VERIFIED STUDENT PROFILE
                  </span>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 space-y-4">
              <div className="flex flex-col md:flex-row items-center md:items-stretch gap-6">
                {/* Left: Student Photo & Identification */}
                <div className="w-full max-w-[220px] md:w-52 flex flex-col items-center justify-between shrink-0">
                  {/* Photo / Avatar Box */}
                  <div className="relative w-full h-56 sm:h-60 rounded-xl bg-slate-100 border-2 border-slate-300 shadow-sm overflow-hidden shrink-0 flex items-center justify-center">
                    <img
                      src={user?.avatar || '/assets/student_lead_photo.jpg'}
                      alt={studentName}
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                        const parent = (e.target as HTMLElement).parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-full bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 flex flex-col items-center justify-center text-slate-700 p-4 text-center">
                              <div class="w-20 h-20 rounded-2xl bg-blue-900 text-amber-300 flex items-center justify-center shadow-md mb-2">
                                <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path></svg>
                              </div>
                              <span class="text-xs font-bold text-slate-800">Student Innovation Cell</span>
                              <span class="text-[10px] text-slate-500 font-mono mt-0.5">BIT-MESRA-2026</span>
                            </div>
                          `;
                        }
                      }}
                    />

                    {/* Top Left Corner Accent */}
                    <div className="absolute top-0 left-0 w-7 h-7 bg-gradient-to-br from-blue-900/60 to-transparent"></div>

                    {/* Verified Institutional Seal */}
                    <div
                      className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-400 via-emerald-200 to-emerald-500 border border-emerald-600 shadow-xs flex flex-col items-center justify-center text-[7px] font-black text-slate-950 leading-none p-0.5"
                      title="CivicConnect Verified Student Lead"
                    >
                      <span className="font-extrabold tracking-tighter">CIVIC</span>
                      <span className="font-extrabold tracking-tighter">VERIFIED</span>
                    </div>
                  </div>

                  {/* Student Name & Verification Label */}
                  <div className="w-full pt-1 border-b border-slate-300 pb-1 text-center">
                    <div className="font-serif italic font-bold text-sm text-blue-950 tracking-wide truncate">
                      {studentName}
                    </div>
                    <div className="text-[9px] font-bold uppercase text-blue-900 tracking-wider mt-0.5">
                      STUDENT LEAD
                    </div>
                    <div className="text-[9px] font-bold uppercase text-emerald-800 flex items-center justify-center gap-1 mt-0.5">
                      <Check size={11} strokeWidth={2.5} className="text-emerald-700" />
                      <span>✓ VERIFIED STUDENT</span>
                    </div>
                  </div>

                  {/* Clean Student Identification Barcode */}
                  <div className="w-full p-2 bg-slate-50/90 rounded-lg border border-slate-200 text-center space-y-1">
                    <div className="text-[8px] font-bold uppercase text-slate-600 tracking-wider">
                      CIVICCONNECT STUDENT ID
                    </div>
                    <div className="flex items-center justify-center gap-[2px] h-6 px-1 overflow-hidden" title="Student Barcode">
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
                      *{studentId}*
                    </div>
                    <div className="pt-1 border-t border-slate-200/80 flex items-center justify-between text-[7px] text-slate-500 font-mono">
                      <span>STATUS: ACTIVE</span>
                      <span className="text-emerald-700 font-bold">AUTHENTICATED</span>
                    </div>
                  </div>
                </div>

                {/* Right: Main Information Section & Student Details */}
                <div className="flex-1 w-full space-y-3.5">
                  {/* Name and Verification Badge Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-slate-200 gap-2">
                    <div>
                      <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500">
                        नाम / FULL LEGAL NAME
                      </div>
                      <div className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <span>{studentName}</span>
                        <BadgeCheck size={18} className="text-emerald-600 shrink-0" />
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[9.5px] font-mono font-bold bg-blue-100 text-blue-950 px-2 py-0.5 rounded border border-blue-200 uppercase">
                          STUDENT LEAD
                        </span>
                        <span className="text-[9.5px] text-slate-600 font-medium">
                          CivicConnect Student Innovator
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg shrink-0">
                      <ShieldCheck size={15} className="text-emerald-700" />
                      <span className="text-[9.5px] font-bold text-emerald-900 uppercase tracking-wide">
                        Verified Student Profile
                      </span>
                    </div>
                  </div>

                  {/* 2-Column Student Information Grid (4 Boxes) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {/* CARD 1: Student ID */}
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <div className="text-[8.5px] font-bold uppercase tracking-wider text-slate-500">
                        विद्यार्थी पहचान / STUDENT ID
                      </div>
                      <div className="font-mono font-black text-blue-950 text-xs mt-0.5">
                        {studentId}
                      </div>
                      <div className="text-[9.5px] text-slate-500 font-mono">
                        ROLL: 2023UGC044
                      </div>
                    </div>

                    {/* CARD 2: Academic Year */}
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <div className="text-[8.5px] font-bold uppercase tracking-wider text-slate-500">
                        शैक्षणिक वर्ष / ACADEMIC YEAR
                      </div>
                      <div className="font-bold text-slate-900 text-xs mt-0.5">
                        {academicYear}
                      </div>
                      <div className="text-[9.5px] text-slate-500">
                        4th Year (Term 7 & 8)
                      </div>
                    </div>

                    {/* CARD 3: University / Institution */}
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <div className="text-[8.5px] font-bold uppercase tracking-wider text-slate-500">
                        विश्वविद्यालय / UNIVERSITY / INSTITUTION
                      </div>
                      <div className="font-bold text-slate-900 text-xs mt-0.5 truncate" title={institutionName}>
                        {institutionName}
                      </div>
                      <div className="text-[9.5px] text-slate-500">
                        Higher Education Institution (HEI)
                      </div>
                    </div>

                    {/* CARD 4: Program / Department */}
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <div className="text-[8.5px] font-bold uppercase tracking-wider text-slate-500">
                        विभाग / PROGRAM / DEPARTMENT
                      </div>
                      <div className="font-bold text-slate-900 text-xs mt-0.5 truncate">
                        {departmentName}
                      </div>
                      <div className="text-[9.5px] text-slate-500">
                        School of Engineering & Technology
                      </div>
                    </div>
                  </div>

                  {/* Student Project Activity Section */}
                  <div className="p-3 bg-gradient-to-br from-blue-950/5 via-slate-100/70 to-blue-900/10 rounded-xl border border-blue-200/80 space-y-2">
                    <div className="flex items-center justify-between border-b border-blue-200/60 pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Activity size={13} className="text-blue-900" />
                        <span className="text-[9.5px] font-black text-blue-950 uppercase tracking-wider">
                          STUDENT PROJECT ACTIVITY
                        </span>
                      </div>
                      <span className="text-[8.5px] font-mono text-blue-900 bg-blue-100 px-1.5 py-0.5 rounded font-bold">
                        STUDENT RECORD
                      </span>
                    </div>

                    {/* 3 Metrics Strip */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
                        <span className="text-[8px] font-bold uppercase text-slate-500 block leading-tight">Active</span>
                        <span className="font-black text-xs text-blue-950 mt-0.5 block">02 Projects</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
                        <span className="text-[8px] font-bold uppercase text-emerald-700 block leading-tight">Completed</span>
                        <span className="font-black text-xs text-emerald-950 mt-0.5 block">01 Project</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
                        <span className="text-[8px] font-bold uppercase text-indigo-700 block leading-tight">Deliverables</span>
                        <span className="font-black text-xs text-indigo-950 mt-0.5 block">08 Logged</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact & Verification */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-0.5">
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <div className="text-[8px] font-bold uppercase text-slate-500">
                          EMAIL
                        </div>
                        <div className="font-semibold text-slate-900 text-[10.5px] truncate">
                          {email}
                        </div>
                      </div>
                      <span className="text-[8.5px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                        ✓ Verified
                      </span>
                    </div>

                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <div className="text-[8px] font-bold uppercase text-slate-500">
                          MOBILE
                        </div>
                        <div className="font-semibold text-slate-900 text-[10.5px] truncate">
                          {phone}
                        </div>
                      </div>
                      <span className="text-[8.5px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                        ✓ Verified
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 8: Card Bottom Footer */}
            <div className="px-6 py-3 bg-slate-100 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white p-1 rounded border border-slate-300 shadow-2xs shrink-0 flex items-center justify-center">
                  <QrCode size={26} className="text-slate-900" />
                </div>
                <div>
                  <div className="text-[9px] font-mono text-slate-500 font-bold">
                    OFFICIAL CIVICCONNECT STUDENT RECORD
                  </div>
                  <div className="font-mono text-xs font-black text-slate-800">
                    CC-STU&lt;&lt;7A29C5&lt;&lt;BIT-MESRA&lt;&lt;2026
                  </div>
                </div>
              </div>

              <div className="text-[9px] font-mono text-slate-500 text-center sm:text-right">
                SCAN TO VIEW / STUDENT PROFILE
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Institutional Governance & Technical Dossier (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Section 1: Role-Based Access Control Matrix */}
          <div className="gov-card bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-800">
                <Shield className="w-4 h-4 text-[#133054]" />
                <span>Role Permissions & Security Clearance (RBAC)</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">GOV-RBAC-2026</span>
            </div>

            <div className="p-4 space-y-3.5 text-xs">
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3 space-y-2">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5 pb-1 border-b border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>STUDENT LEAD PERMITTED ACTIONS</span>
                </div>
                <ul className="space-y-1.5 text-emerald-950 text-[11px]">
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-700 font-bold">✓</span> View assigned challenge & project scope
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-700 font-bold">✓</span> Create, assign, and update team tasks
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-700 font-bold">✓</span> Monitor milestone progress & log deliverables
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-700 font-bold">✓</span> Upload and version project technical documents
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-700 font-bold">✓</span> Submit milestone deliverables for Faculty review
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-700 font-bold">✓</span> Communicate via institutional dispatch channels
                  </li>
                </ul>
              </div>

              <div className="bg-rose-50/60 border border-rose-200 rounded-lg p-3 space-y-2">
                <div className="font-bold text-rose-900 flex items-center gap-1.5 pb-1 border-b border-rose-200">
                  <span className="text-rose-700 font-bold">✕</span>
                  <span>RESTRICTED / PROHIBITED ACTIONS</span>
                </div>
                <ul className="space-y-1.5 text-rose-950 text-[11px]">
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-700 font-bold">✕</span> Self-approve milestone submissions
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-700 font-bold">✕</span> Modify faculty-approved project scope or budget
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-rose-700 font-bold">✕</span> Authorize external industry MOU / collaboration
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 2: Technical Competencies */}
          <div className="gov-card bg-white border border-slate-200 rounded-xl shadow-xs p-4 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-2">
              <Award className="w-4 h-4 text-[#133054]" />
              <span>Core Technical Stack & Tools</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {[
                'ESP32 Dual-Core RTOS',
                'Embedded C / C++',
                'LoRaWAN Protocol Stack',
                'Ultrasonic Acoustic Telemetry',
                'Digital Signal Processing (FFT)',
                'Low-Power Solar Harvesting',
                'PostgreSQL / PostGIS',
                'Node.js Edge Telemetry',
                'Git Version Control',
              ].map((skill, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-300 rounded font-medium text-[11px]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
