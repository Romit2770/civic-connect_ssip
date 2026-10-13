import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Building,
  Mail,
  Phone,
  GraduationCap,
  Sparkles,
  BookOpen,
  Award,
  Layers,
  FlaskConical,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Edit,
  Save,
  RefreshCw,
  X,
  FileText,
  BadgeCheck,
  Users,
  Target,
  Check,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import KPIStatCard from '../../components/common/KPIStatCard';

export default function FacultyProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Editable fields form
  const [form, setForm] = useState({
    phone: '',
    designation: '',
    areasOfExpertise: [] as string[],
    researchAreas: [] as string[],
    technicalSkills: [] as string[],
    researchInterests: [] as string[],
  });

  const [expertiseInput, setExpertiseInput] = useState('');
  const [researchInput, setResearchInput] = useState('');
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/faculty/profile');
      if (res.data.success) {
        setProfile(res.data.data);
        setForm({
          phone: res.data.data.phone || '+91 9431102902',
          designation: res.data.data.designation || 'Associate Professor',
          areasOfExpertise: res.data.data.areasOfExpertise || [],
          researchAreas: res.data.data.researchAreas || [],
          technicalSkills: res.data.data.technicalSkills || [],
          researchInterests: res.data.data.researchInterests || [],
        });
      }
    } catch (err) {
      console.warn('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiClient.patch('/faculty/profile', form);
      if (res.data.success) {
        setActionSuccess('Profile updated successfully.');
        setProfile(res.data.data);
        setIsEditing(false);
      }
    } catch (err) {
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = (
    type: 'areasOfExpertise' | 'researchAreas' | 'technicalSkills',
    value: string,
    clearInput: () => void
  ) => {
    if (!value.trim()) return;
    if (!form[type].includes(value.trim())) {
      setForm({ ...form, [type]: [...form[type], value.trim()] });
    }
    clearInput();
  };

  const handleRemoveTag = (
    type: 'areasOfExpertise' | 'researchAreas' | 'technicalSkills',
    tag: string
  ) => {
    setForm({ ...form, [type]: form[type].filter((t) => t !== tag) });
  };

  if (loading && !profile) {
    return (
      <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
        <RefreshCw size={14} className="animate-spin text-blue-700" />
        <span>Loading official faculty dossier...</span>
      </div>
    );
  }

  const facultyName = profile?.facultyName || 'Dr. Ananya Sen';
  const facultyInitial = facultyName.replace(/^(Dr\.|Prof\.)\s*/, '').charAt(0) || 'A';
  const facultyId = profile?.facultyId || 'NITJ-CSE-FAC-2015-08';
  const experienceYears = profile?.yearsOfExperience || 12;

  return (
    <div className="space-y-6 w-full">
      {/* Official Government Header Banner with Tricolor Ribbon */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
        {/* National Tricolor Accent Ribbon */}
        <div className="h-1.5 w-full flex">
          <div className="h-full flex-1 bg-[#ff9933]" />
          <div className="h-full flex-1 bg-white" />
          <div className="h-full flex-1 bg-[#138808]" />
        </div>

        <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* National Insignia Emblem */}
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
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold text-[#0a2540] bg-amber-100/90 px-2.5 py-0.5 rounded border border-amber-300 uppercase tracking-widest flex items-center gap-1.5 shadow-2xs">
                  <ShieldCheck size={12} className="text-amber-800" />
                  भारत सरकार • Government of India
                </span>
                <span className="text-xs text-slate-300 hidden sm:inline">•</span>
                <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Ministry of Education & MoHUA • Smart Cities Mission
                </span>
                <span className="text-xs text-slate-300 hidden sm:inline">•</span>
                <span className="text-[10px] font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Faculty Registry: {facultyId}
                </span>
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Faculty Mentor Profile & Academic Identity</span>
                </h1>
                <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                  National Innovation Ecosystem • Official verified institutional identity dossier, accredited domain expertise, certified laboratory facilities, and active societal R&D assignments.
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Edit size={13} />
                  <span>Edit Research & Skills</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-[#0a2540] hover:bg-[#12395b] text-white text-xs font-extrabold rounded-lg shadow-sm flex items-center gap-2 transition-colors cursor-pointer border border-blue-950"
                  title="Print / Save Official Faculty Identity Dossier"
                >
                  <FileText size={14} className="text-amber-400" />
                  <span>Export Dossier (PDF)</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-lg cursor-pointer hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  disabled={saving}
                  onClick={handleSave}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={13} />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Nodal Metadata Bar */}
        <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              Institutional Hub: NIT Jamshedpur (Zone East-04)
            </span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-slate-600">
              Department: {profile?.department || 'Computer Science & Engineering'}
            </span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <BadgeCheck size={13} className="text-emerald-600" />
              DigiLocker & Institutional Registrar Verified
            </span>
          </div>
          <div className="font-mono text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
            Node Status: Mentorship Mandate Active
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:text-emerald-900 p-1">
            <X size={14} />
          </button>
        </div>
      )}

      {/* 4 Government Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <KPIStatCard
          code="GOV-UID"
          title="Faculty ID Code"
          value={facultyId.split('-').slice(-2).join('-')}
          badge="Verified"
          subtitle={facultyId}
          footerNote="Zone East-04"
          icon={UserCheck}
          variant="blue"
        />
        <KPIStatCard
          code="MENTOR-R&D"
          title="Active Mentorship"
          value="4 Guilds"
          badge="4 Projects"
          subtitle="Student innovation guilds"
          footerNote="16 Members"
          icon={Users}
          variant="green"
        />
        <KPIStatCard
          code="EXP-TIER1"
          title="Academic Experience"
          value={`${experienceYears}+ Yrs`}
          badge="Senior Grade"
          subtitle={profile?.designation || 'Associate Professor'}
          footerNote="AICTE Accredited"
          icon={GraduationCap}
          variant="amber"
        />
        <KPIStatCard
          code="LAB-FACILITIES"
          title="Accredited Labs"
          value={profile?.availableLabs?.length || 3}
          badge="Operational"
          subtitle="Assigned testing facilities"
          footerNote="R&D Block"
          icon={FlaskConical}
          variant="purple"
        />
      </div>

      {/* Main 2-Column Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Official Smart Identity Card (7 Cols) */}
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
                      भारत सरकार • GOVERNMENT OF INDIA
                    </div>
                    <div className="text-xs font-extrabold text-white tracking-wide uppercase">
                      आवासन और शहरी कार्य मंत्रालय • MINISTRY OF HOUSING AND URBAN AFFAIRS
                    </div>
                    <div className="text-[10px] text-blue-200 font-medium">
                      NATIONAL CIVIC GRIEVANCE & RESOLUTION PLATFORM • SMART IDENTITY CARD
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-amber-400 text-slate-950 rounded uppercase">
                    OFFICIAL ID
                  </span>
                  <span className="text-[9px] font-mono text-emerald-300 mt-0.5 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    SECURE CHIP 2.0
                  </span>
                </div>
              </div>
            </div>

            {/* Smart ID Card Main Body */}
            <div className="p-6 space-y-5">
              <div className="flex flex-col md:flex-row items-center md:items-stretch gap-6">
                {/* Left: Faculty Photo & Security Seals */}
                <div className="w-full max-w-[220px] md:w-52 flex flex-col items-center justify-between flex-shrink-0">
                  {/* Portrait Photo Container */}
                  <div className="relative w-full h-56 sm:h-60 rounded-xl bg-slate-100 border-2 border-slate-300 shadow-sm overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <img
                      src="/assets/faculty_photo.jpg"
                      alt={facultyName}
                      className="w-full h-full object-cover object-top"
                    />

                    {/* Corner Accent */}
                    <div className="absolute top-0 left-0 w-7 h-7 bg-gradient-to-br from-blue-900/60 to-transparent"></div>

                    {/* Gold GOV OF INDIA Seal */}
                    <div
                      className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 border border-amber-600 shadow-xs flex flex-col items-center justify-center text-[7px] font-black text-slate-950 leading-none p-0.5"
                      title="Government of India Official Verified Seal"
                    >
                      <span className="font-extrabold tracking-tighter">GOV OF</span>
                      <span className="font-extrabold tracking-tighter">INDIA</span>
                    </div>
                  </div>

                  {/* Faculty Name & Signature */}
                  <div className="w-full mt-2.5 pt-1.5 border-b border-slate-300 pb-1 text-center">
                    <div className="font-serif italic font-bold text-sm text-blue-950 tracking-wide truncate">
                      {facultyName}
                    </div>
                    <div className="text-[9px] font-bold uppercase text-emerald-800 flex items-center justify-center gap-1 mt-0.5">
                      <Check size={11} strokeWidth={2.5} className="text-emerald-700" />
                      <span>✓ ई-हस्ताक्षरित / SIGNED</span>
                    </div>
                  </div>

                  {/* Barcode & Security Card Serial */}
                  <div className="w-full mt-2.5 p-2 bg-slate-50/90 rounded-lg border border-slate-200 text-center space-y-1">
                    <div className="flex items-center justify-center gap-[2px] h-7 px-1 overflow-hidden" title="Faculty Identity Barcode">
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
                      *NIC-IND-72AC95*
                    </div>
                    <div className="pt-1 border-t border-slate-200/80 flex items-center justify-between text-[7px] text-slate-500 font-mono">
                      <span>ISSUE: 2024</span>
                      <span className="text-emerald-700 font-bold">NFC ACTIVE</span>
                    </div>
                  </div>
                </div>

                {/* Right: Faculty Details & Chip */}
                <div className="flex-1 w-full space-y-4">
                  {/* Name, Accreditation, and Chip */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        नाम / FULL LEGAL NAME
                      </div>
                      <div className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <span>{facultyName}</span>
                        <BadgeCheck size={20} className="text-emerald-600 flex-shrink-0" />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-950 px-2 py-0.5 rounded border border-blue-200 uppercase">
                          FACULTY MENTOR
                        </span>
                        <span className="text-[10px] text-slate-600 font-semibold">
                          National Accreditation: Certified
                        </span>
                      </div>
                    </div>

                    {/* Gold Secure Chip Graphic */}
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg flex-shrink-0 shadow-2xs">
                      <div className="w-8 h-6 bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 rounded border border-amber-600 grid grid-cols-2 gap-0.5 p-0.5">
                        <div className="border border-amber-600/40 rounded-2xs"></div>
                        <div className="border border-amber-600/40 rounded-2xs"></div>
                        <div className="border border-amber-600/40 rounded-2xs"></div>
                        <div className="border border-amber-600/40 rounded-2xs"></div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] font-black uppercase text-amber-950 tracking-wider">SECURE CHIP</div>
                        <div className="font-mono text-[9px] text-slate-700 font-bold">FAC-BITM-2024-AC95</div>
                      </div>
                    </div>
                  </div>

                  {/* 2x3 Particulars Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Row 1, Col 1: Designation */}
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="text-[9px] font-bold uppercase text-slate-500 block">
                        पदनाम / DESIGNATION
                      </span>
                      <span className="font-bold text-slate-900 leading-snug">
                        {profile?.designation || 'Associate Professor'}
                      </span>
                    </div>

                    {/* Row 1, Col 2: Unique Gov UID */}
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="text-[9px] font-bold uppercase text-slate-500 block">
                        पहचान संख्या / UNIQUE GOV UID
                      </span>
                      <span className="font-mono font-extrabold text-blue-950">
                        UID-GOV-0172AC95
                      </span>
                    </div>

                    {/* Row 2, Col 1: Institution */}
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="text-[9px] font-bold uppercase text-slate-500 block">
                        संस्थान / INSTITUTION
                      </span>
                      <span className="font-bold text-slate-900 leading-snug">
                        {profile?.university || 'Birla Institute of Technology, Mesra'}
                      </span>
                    </div>

                    {/* Row 2, Col 2: Assigned Jurisdiction */}
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="text-[9px] font-bold uppercase text-slate-500 block">
                        अधिकार क्षेत्र / ASSIGNED JURISDICTION
                      </span>
                      <span className="font-bold text-slate-900 leading-snug">
                        Ward 12 (Central Zone), Ranchi
                      </span>
                    </div>

                    {/* Row 3, Col 1: Department */}
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="text-[9px] font-bold uppercase text-slate-500 block">
                        विभाग / DEPARTMENT
                      </span>
                      <span className="font-bold text-slate-900 leading-snug">
                        {profile?.department || 'Department of Urban Innovation & Engineering'}
                      </span>
                    </div>

                    {/* Row 3, Col 2: Validity Period */}
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="text-[9px] font-bold uppercase text-slate-500 block">
                        वैधता / VALIDITY PERIOD
                      </span>
                      <span className="font-bold text-emerald-800 leading-snug">
                        2024–2029 (PERMANENT ACCREDITATION)
                      </span>
                    </div>
                  </div>

                  {/* Contact Row */}
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail size={15} className="text-blue-700 flex-shrink-0" />
                      <span className="font-mono font-semibold text-slate-800 text-[11px] truncate">
                        {profile?.officialEmail || 'faculty.mentor@bitmesra.ac.in'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Phone size={15} className="text-emerald-700 flex-shrink-0" />
                      <span className="font-mono font-semibold text-slate-800 text-[11px]">
                        {profile?.phone || '+91 9431102902'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Security Bar & QR Strip */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/90 -mx-6 -mb-6 px-6 py-3 rounded-b-xl border-t">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    STATUTORY GOVERNMENT ACCREDITATION RECORD • MINISTRY OF HOUSING & URBAN AFFAIRS
                  </div>
                  <div className="font-mono text-[9px] text-slate-600 tracking-wider">
                    IDIND&lt;&lt;BED94C75&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;02SEN&lt;&lt;ANANYA&lt;&lt;&lt;&lt;&lt;&lt;2026
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="p-1 bg-slate-100 rounded text-slate-800 font-mono text-[10px] font-bold flex items-center gap-1">
                    <FileText size={13} />
                    <span>MOHUA DB</span>
                  </span>
                  <div className="text-left font-mono text-[8px] leading-tight">
                    <div className="font-bold text-slate-900">SCAN TO VERIFY</div>
                    <div className="text-slate-500">CENTRAL ACCREDITATION</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: DigiLocker & Faculty Nodal Summary (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* DigiLocker Official Verification Card */}
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
                    National Digital Document Repository
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
                <span className="font-semibold text-slate-900">Academic Faculty Accreditation</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">DigiLocker Reference:</span>
                <span className="font-mono font-bold text-blue-900">DL-FAC-699FB3</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">AICTE / MoE Status:</span>
                <span className="font-mono font-semibold text-slate-800">XXXX-XXXX-4892 (Masked)</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Issuing Authority:</span>
                <span className="font-semibold text-slate-900">AICTE / Govt. of India</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Verification Timestamp:</span>
                <span className="font-mono text-slate-700">24-Sep-2026, 11:42 IST</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500">Certifying Authority:</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 size={13} />
                  CCA India HSM (Valid)
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500">Official Gov Faculty Record</span>
              <button
                onClick={() => window.print()}
                className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 text-xs cursor-pointer"
              >
                <FileText size={13} />
                <span>Export Dossier (PDF)</span>
              </button>
            </div>
          </div>

          {/* Quick Mentorship & Lab Highlights */}
          <div className="gov-card p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <FlaskConical size={15} className="text-purple-600" />
              <span>Assigned Innovation Mandates</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600 font-medium">Active R&D Mentorship</span>
                <span className="font-bold text-blue-950 font-mono">4 Guilds / 4 Projects</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600 font-medium">Operational Labs</span>
                <span className="font-bold text-emerald-800 font-mono">3 Certified Facilities</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600 font-medium">Domain Focus</span>
                <span className="font-bold text-slate-800">Smart Water & IoT Systems</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Research & Academic Dossier Details Card */}
      <div className="gov-card bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* System Protected Identity Notice */}
        <div className="p-3 bg-amber-50/90 border-b border-amber-200 px-6 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <Lock size={14} className="text-amber-700 shrink-0" />
            <span className="font-medium text-[11px]">
              System-generated institutional credentials (Name, Faculty ID, University, Official Email) are verified and locked against unauthorized edits under MoE / AICTE governance.
            </span>
          </div>
        </div>

        {/* Research & Expertise Body */}
        <div className="p-6 space-y-6 text-xs text-slate-800">
          {/* Areas of Expertise */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
              <Sparkles size={14} className="text-amber-500" />
              Areas of Academic & Engineering Expertise
            </h3>
            <div className="flex flex-wrap gap-2 pt-1">
              {profile?.areasOfExpertise?.map((item: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-blue-50 text-blue-900 font-semibold rounded-lg text-xs border border-blue-200 flex items-center gap-1.5 shadow-2xs"
                >
                  <span>{item}</span>
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveTag('areasOfExpertise', item)}
                      className="hover:text-red-700"
                    >
                      <X size={12} />
                    </button>
                  )}
                </span>
              ))}
            </div>
            {isEditing && (
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={expertiseInput}
                  onChange={(e) => setExpertiseInput(e.target.value)}
                  placeholder="Add expertise tag..."
                  className="p-1.5 border border-slate-300 rounded text-xs w-64 focus:outline-none focus:border-blue-700"
                />
                <button
                  type="button"
                  onClick={() => handleAddTag('areasOfExpertise', expertiseInput, () => setExpertiseInput(''))}
                  className="px-3 py-1.5 bg-blue-700 text-white rounded text-xs font-bold cursor-pointer"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          {/* Research Areas */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
              <BookOpen size={14} className="text-indigo-600" />
              Current Research Areas & Problem Domains
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {profile?.researchAreas?.map((ra: string, idx: number) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 text-xs flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <span className="leading-relaxed font-medium">{ra}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Skills */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
              <Award size={14} className="text-emerald-600" />
              Technical & Laboratory Skills
            </h3>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {profile?.technicalSkills?.map((skill: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md font-mono text-[11px] font-semibold border border-slate-200 shadow-2xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Assigned Domains */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
              <Layers size={14} className="text-blue-700" />
              Assigned Societal Domains for Matching Engine
            </h3>
            <div className="flex flex-wrap gap-2 pt-1">
              {profile?.assignedDomains?.map((d: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-indigo-50 text-indigo-900 rounded-lg text-xs font-bold border border-indigo-200 flex items-center gap-1.5 shadow-2xs"
                >
                  <Target size={12} className="text-indigo-600" />
                  <span>{d}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Available Labs / Facilities */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
              <FlaskConical size={14} className="text-purple-600" />
              Available Testing Labs & Research Facilities
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {profile?.availableLabs?.map((lab: string, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50/80 hover:bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all text-slate-800 font-medium text-xs flex items-center justify-between gap-2 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 border border-purple-200 flex items-center justify-center shrink-0">
                      <FlaskConical size={15} />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">{lab}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Assigned Testing Block • Operational</span>
                    </div>
                  </div>
                  <span className="text-[9.5px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0 font-mono">
                    AVAILABLE
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Security Notice */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck size={13} className="text-blue-800" />
            <span className="font-medium">
              National Academic R&D Portal • Government of India Ministry of Education Registry
            </span>
          </div>
          <div className="font-mono text-[10px] text-slate-500">
            Last Dossier Verification: 23-SEP-2026
          </div>
        </div>
      </div>
    </div>
  );
}
