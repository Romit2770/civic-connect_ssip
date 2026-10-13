import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  LogIn,
  Lock,
  Mail,
  AlertTriangle,
  ShieldCheck,
  Shield,
  ArrowRight,
  Sparkles,
  Camera,
  MapPin,
  Clock,
  CheckCircle2,
  User,
  ChevronDown,
} from 'lucide-react';
import { apiClient, getErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import GovernmentCaptcha from '../../components/common/GovernmentCaptcha';

type SectorType = 'citizen' | 'government';

interface RoleOption {
  role: string;
  label: string;
  email: string;
  pass: string;
  badge: string;
}

const SECTOR_ROLES: Record<SectorType, RoleOption[]> = {
  citizen: [
    {
      role: 'citizen',
      label: 'Citizen (Rahul Mehta)',
      email: 'citizen.rahul@example.com',
      pass: 'Citizen@123',
      badge: 'Public Grievance',
    },
  ],
  government: [
    {
      role: 'field_officer',
      label: 'Field Worker (Rajesh Patel)',
      email: 'officer.rajesh@civicconnect.gov.in',
      pass: 'Officer@123',
      badge: 'PWD Inspector',
    },
    {
      role: 'municipal_admin',
      label: 'Municipality Admin',
      email: 'admin@civicconnect.gov.in',
      pass: 'Admin@123',
      badge: 'Operations Desk',
    },
    {
      role: 'super_admin',
      label: 'Super Admin',
      email: 'superadmin@civicconnect.gov.in',
      pass: 'Admin@123',
      badge: 'State Command',
    },
  ],
};

interface StorySlide {
  image: string;
  stepNumber: string;
  title: string;
  subtitle: string;
  alt: string;
}

const CIVIC_STORY_SLIDES: StorySlide[] = [
  {
    image: '/assets/civic/pothole-road.jpg',
    stepNumber: 'Phase 1: Identification',
    title: 'Damaged Roads & Urban Potholes',
    subtitle: 'Citizens identify physical infrastructure defects impacting public transit and safety.',
    alt: 'Real urban asphalt road with surface defects and traffic',
  },
  {
    image: '/assets/civic/citizen-reporting.jpg',
    stepNumber: 'Phase 2: Mobile Reporting',
    title: 'Geotagged Citizen Documentation',
    subtitle: 'Fast 30-second reporting with automatic GPS coordinates, photographic proof, and voice notes.',
    alt: 'Citizen using smartphone to document civic grievance outdoors',
  },
  {
    image: '/assets/civic/sanitation-waste.jpg',
    stepNumber: 'Phase 3: Automated Routing',
    title: 'Departmental Ward Dispatch',
    subtitle: 'Spatial engine routes complaints to Nodal Officers with binding SLA time commitments.',
    alt: 'Municipal solid waste collection and civic sanitation bins',
  },
  {
    image: '/assets/civic/road-repair.jpg',
    stepNumber: 'Phase 4: Field Remediation',
    title: 'On-Site Physical Repairs',
    subtitle: 'Municipal field crews execute asphalt compaction, drainage clearing, and lighting restoration.',
    alt: 'Municipal road maintenance crew executing physical repair work',
  },
  {
    image: '/assets/civic/clean-city.jpg',
    stepNumber: 'Phase 5: Verified Resolution',
    title: 'AI & Citizen Quality Verification',
    subtitle: 'Before/after photographic audit and citizen satisfaction ratings ensure genuine completion.',
    alt: 'Clean urban avenue with restored street infrastructure',
  },
];

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [selectedSector, setSelectedSector] = useState<SectorType>('government');
  const [selectedRole, setSelectedRole] = useState<string>('field_officer');
  const [email, setEmail] = useState('officer.rajesh@civicconnect.gov.in');
  const [password, setPassword] = useState('Officer@123');
  const [captchaInput, setCaptchaInput] = useState('');
  const [isCaptchaValid, setIsCaptchaValid] = useState(true);
  const [captchaError, setCaptchaError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Background Slideshow State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % CIVIC_STORY_SLIDES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (!isCaptchaValid) {
      setCaptchaError('Please enter the correct security captcha characters shown.');
      return;
    }
    setCaptchaError(null);

    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      if (res.data.success) {
        login(res.data.data.token, res.data.data.user);
        const userRole = res.data.data.user.role;
        if (userRole === 'municipal_admin') {
          navigate(redirect !== '/' ? redirect : '/municipality-admin/dashboard');
        } else if (userRole === 'field_worker' || userRole === 'field_officer') {
          navigate(redirect !== '/' ? redirect : '/field-worker/dashboard');
        } else if (
          ['department_officer', 'super_admin'].includes(userRole)
        ) {
          navigate(redirect !== '/' ? redirect : '/admin');
        } else if (userRole === 'faculty_mentor') {
          navigate(redirect !== '/' ? redirect : '/faculty');
        } else if (userRole === 'student_lead') {
          navigate(redirect !== '/' ? redirect : '/student-lead/dashboard');
        } else if (userRole === 'university_admin') {
          navigate(redirect !== '/' ? redirect : '/university');
        } else if (userRole === 'csr_lead') {
          navigate(redirect !== '/' ? redirect : '/csr/dashboard');
        } else if (userRole === 'corporate_partner') {
          navigate(redirect !== '/' ? redirect : '/corporate-partner/dashboard');
        } else if (userRole === 'industry_admin') {
          navigate(redirect !== '/' ? redirect : '/industry-admin/dashboard');
        } else {
          navigate(redirect);
        }
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (
    demoEmail: string,
    demoPass: string,
    roleName?: string,
    sectorName?: SectorType
  ) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    if (roleName) setSelectedRole(roleName);
    if (sectorName) setSelectedSector(sectorName);
    setIsCaptchaValid(true);
    setCaptchaError(null);
    setError(null);
  };

  const handleSectorClick = (sector: SectorType) => {
    setSelectedSector(sector);
    const firstRole = SECTOR_ROLES[sector][0];
    setSelectedRole(firstRole.role);
    setDemoCredentials(firstRole.email, firstRole.pass, firstRole.role, sector);
  };

  const handleRoleSelect = (roleVal: string) => {
    setSelectedRole(roleVal);
    let matched = SECTOR_ROLES[selectedSector].find((r) => r.role === roleVal);
    if (!matched) {
      for (const s of (['government', 'citizen'] as SectorType[])) {
        const found = SECTOR_ROLES[s].find((r) => r.role === roleVal);
        if (found) {
          matched = found;
          setSelectedSector(s);
          break;
        }
      }
    }
    if (matched) {
      setDemoCredentials(matched.email, matched.pass, matched.role);
    }
  };

  const activeSlide = CIVIC_STORY_SLIDES[currentSlideIndex];

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden bg-[#071a2e]">
      {/* 1. REAL-LIFE CIVIC PHOTOGRAPHY BACKGROUND ROTATION */}
      {CIVIC_STORY_SLIDES.map((slide, idx) => (
        <div
          key={slide.image}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentSlideIndex ? 'opacity-100 scale-105' : 'opacity-0 scale-100 pointer-events-none'
          }`}
          style={{
            transition: 'opacity 1.2s ease-in-out, transform 8s ease-out',
          }}
        >
          <img
            src={slide.image}
            alt={slide.alt}
            className="w-full h-full object-cover object-center"
          />
        </div>
      ))}

      {/* 2. GOVERNMENT NAVY CONTRAST OVERLAY (Accessible WCAG AAA) */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#051322]/90 via-[#0a2540]/80 to-[#071a2e]/85 backdrop-blur-[3px] z-10" />

      {/* 3. SUBTLE NATIONAL TRICOLOR TOP ACCENT BAR */}
      <div className="absolute top-0 left-0 right-0 h-1.5 z-30 flex">
        <div className="bg-[#FF9933] flex-1" />
        <div className="bg-white flex-1" />
        <div className="bg-[#138808] flex-1" />
      </div>

      {/* 4. MAIN WORKSPACE CONTAINER */}
      <div className="relative z-20 w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-6">
        {/* Left Col (5 cols): Civic Story & Platform Trust Context */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between text-white space-y-6">
          <div className="space-y-3">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-900 border border-blue-400/40 flex items-center justify-center text-white shadow-md">
                <Building2 size={26} className="text-amber-400" />
              </div>
              <div>
                <span className="font-extrabold text-2xl text-white tracking-tight">
                  {t('nav.brandName')}
                </span>
                <span className="block text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                  {t('nav.brandSubtitle')}
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-300 leading-relaxed pt-2">
              {t('home.heroSubtitle')}
            </p>
          </div>

          {/* Current Story Slide Context Card */}
          <div className="bg-slate-900/80 border border-slate-700/80 p-4 rounded-xl backdrop-blur-md space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-mono font-bold text-amber-400 uppercase tracking-wider">
                {activeSlide.stepNumber}
              </span>
              <span className="text-slate-400">
                Story {currentSlideIndex + 1} of {CIVIC_STORY_SLIDES.length}
              </span>
            </div>
            <h4 className="font-bold text-sm text-white">{activeSlide.title}</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">{activeSlide.subtitle}</p>

            {/* Slide Dots */}
            <div className="flex gap-1.5 pt-2">
              {CIVIC_STORY_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlideIndex(i)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    i === currentSlideIndex ? 'w-6 bg-amber-400' : 'w-2 bg-slate-600'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Trust Badges */}
          <div className="space-y-2 pt-2 text-[11px] text-slate-400 border-t border-slate-700/60">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck size={14} />
              <span>256-Bit SSL Encrypted Public Portal</span>
            </div>
            <p className="text-[10px] text-slate-400">
              SIH-2026 Problem Statement CHA-195 Prototype • Public Redressal Standard
            </p>
          </div>
        </div>

        {/* Right Col (7 cols): Official Login Form Card */}
        <div className="lg:col-span-7 sm:max-w-md lg:max-w-none w-full mx-auto">
          <div className="gov-card p-6 sm:p-8 bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl rounded-2xl space-y-5 text-slate-900">
            {/* Header */}
            <div className="border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <LogIn size={20} className="text-blue-900" />
                  <span>{t('auth.loginTitle')}</span>
                </h2>
                <span className="text-[10px] bg-blue-50 text-blue-900 font-bold px-2 py-0.5 rounded border border-blue-200 uppercase">
                  Official Portal
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {t('auth.loginSubtitle')}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs flex items-center gap-2">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  {t('auth.emailOrPhone')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder={t('auth.emailPlaceholder')}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-700 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  {t('auth.password')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder={t('auth.passwordPlaceholder')}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-700 focus:bg-white"
                  />
                </div>
              </div>

              {/* ROLE OPTION DROPDOWN MENU */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  {t('auth.roleLabel')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select
                    value={selectedRole}
                    onChange={(e) => handleRoleSelect(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-700 focus:bg-white text-xs font-semibold appearance-none cursor-pointer"
                  >
                    {SECTOR_ROLES[selectedSector].map((opt) => (
                      <option key={opt.role} value={opt.role}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                </div>
              </div>

              {/* REALISTIC GOVERNMENT CAPTCHA COMPONENT */}
              <GovernmentCaptcha
                value={captchaInput}
                onChange={setCaptchaInput}
                onValidChange={setIsCaptchaValid}
                error={captchaError}
              />

              <button
                type="submit"
                disabled={loading}
                className="gov-button-primary w-full text-xs py-2.5 bg-blue-900 hover:bg-blue-800 shadow-md font-bold disabled:opacity-50 mt-1 cursor-pointer"
              >
                {loading ? (
                  <span>{t('auth.signingIn')}</span>
                ) : (
                  <>
                    <LogIn size={15} />
                    <span>{t('auth.signInBtn')}</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick 1-Click Role Login Boxes for Evaluators */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 block text-center uppercase tracking-wider">
                ⚡ {t('auth.quickDemoRoles')}
              </span>

              {/* 2 Primary Sector Boxes: Citizen, Government */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSectorClick('citizen')}
                  className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    selectedSector === 'citizen'
                      ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 font-medium'
                  }`}
                >
                  <User size={18} className={selectedSector === 'citizen' ? 'text-blue-700' : 'text-slate-500'} />
                  <span className="text-xs leading-tight font-bold">{t('auth.sectorCitizen')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSectorClick('government')}
                  className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    selectedSector === 'government'
                      ? 'bg-purple-50 border-purple-600 text-purple-900 font-bold ring-2 ring-purple-500/20 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 font-medium'
                  }`}
                >
                  <Building2 size={18} className={selectedSector === 'government' ? 'text-purple-700' : 'text-slate-500'} />
                  <span className="text-xs leading-tight font-bold">{t('auth.sectorGovernment')}</span>
                </button>
              </div>

              {/* Sub-role options for the active sector */}
              {selectedSector !== 'citizen' && (
                <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-200/80 space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold px-0.5">
                    <span>
                      Active Sector: <strong className="text-slate-800 capitalize">{selectedSector}</strong>
                    </span>
                    <span className="text-blue-700 font-bold">1-Click Auto Fill</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                    {SECTOR_ROLES[selectedSector].map((opt) => (
                      <button
                        key={opt.role}
                        type="button"
                        onClick={() => handleRoleSelect(opt.role)}
                        className={`p-1.5 rounded-md border text-center transition-colors cursor-pointer truncate ${
                          selectedRole === opt.role
                            ? 'bg-blue-900 text-white border-blue-900 font-bold shadow-xs'
                            : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800 font-medium'
                        }`}
                        title={opt.label}
                      >
                        {opt.label.split('(')[0].trim()}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="text-center pt-1 text-xs text-slate-600">
              <span>{t('auth.noAccount')} </span>
              <Link to="/register" className="text-blue-700 font-bold hover:underline">
                {t('auth.registerHere')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
