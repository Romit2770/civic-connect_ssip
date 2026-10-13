import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  UserPlus,
  Lock,
  Mail,
  User,
  Phone,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  RotateCw,
  X,
  Loader2,
  KeyRound,
} from 'lucide-react';
import { apiClient, getErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import GovernmentCaptcha from '../../components/common/GovernmentCaptcha';
import GovernmentUtilityBar from '../../components/common/GovernmentUtilityBar';
import { NationalEmblem, DigitalIndiaLogo, SwachhBharatLogo } from '../../components/common/GovernmentBrandLogos';

export default function RegisterPage() {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const { login } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);
  const [captchaError, setCaptchaError] = useState<string | null>(null);

  // Email verification state
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccessMessage, setOtpSuccessMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpExpirySeconds, setOtpExpirySeconds] = useState(300); // 5 minutes

  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);

  // Countdown timer for Resend Cooldown and OTP Expiry
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showOtpModal) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
        setOtpExpirySeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showOtpModal]);

  // Focus OTP input when modal opens
  useEffect(() => {
    if (showOtpModal) {
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 100);
    }
  }, [showOtpModal]);

  // Reset verification if citizen edits email address
  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    if (isEmailVerified) {
      setIsEmailVerified(false);
    }
    setError(null);
  };

  // Helper to mask email for privacy display
  const maskEmail = (val: string) => {
    if (!val || !val.includes('@')) return val;
    const [local, domain] = val.split('@');
    if (local.length <= 2) return `${local[0]}***@${domain}`;
    return `${local[0]}***${local[local.length - 1]}@${domain}`;
  };

  // Send OTP
  const handleSendOtp = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address before requesting verification.');
      return;
    }

    setError(null);
    setOtpError(null);
    setOtpSuccessMessage(null);
    setIsOtpSending(true);

    try {
      const res = await apiClient.post('/auth/email/send-otp', {
        email: trimmedEmail,
        name: name.trim() || undefined,
      });

      if (res.data.success) {
        setShowOtpModal(true);
        setOtpInput('');
        setResendCooldown(60);
        setOtpExpirySeconds(300);
        setOtpSuccessMessage(res.data.message || 'OTP sent successfully.');
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setIsOtpSending(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isOtpSending) return;
    setOtpError(null);
    setOtpSuccessMessage(null);
    setIsOtpSending(true);

    try {
      const res = await apiClient.post('/auth/email/send-otp', {
        email: email.trim().toLowerCase(),
        name: name.trim() || undefined,
      });

      if (res.data.success) {
        setResendCooldown(60);
        setOtpExpirySeconds(300);
        setOtpSuccessMessage('A fresh 6-digit OTP has been sent to your email.');
      }
    } catch (err: any) {
      setOtpError(getErrorMessage(err));
    } finally {
      setIsOtpSending(false);
    }
  };

  // Verify OTP handler
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otpInput.trim();

    if (!cleanOtp || cleanOtp.length !== 6) {
      setOtpError('Please enter the complete 6-digit OTP code.');
      return;
    }

    setOtpError(null);
    setIsOtpVerifying(true);

    try {
      const res = await apiClient.post('/auth/email/verify-otp', {
        email: email.trim().toLowerCase(),
        otp: cleanOtp,
      });

      if (res.data.success && res.data.verified) {
        setIsEmailVerified(true);
        setShowOtpModal(false);
        setError(null);
      } else {
        setOtpError(res.data.message || 'Invalid or expired OTP.');
      }
    } catch (err: any) {
      setOtpError(getErrorMessage(err));
    } finally {
      setIsOtpVerifying(false);
    }
  };

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    if (!isEmailVerified) {
      setError('Please verify your email address with OTP before creating your account.');
      return;
    }

    if (!isCaptchaValid) {
      setCaptchaError('Please enter the correct security captcha characters shown.');
      return;
    }
    setCaptchaError(null);

    if (!agreedToTerms) {
      setError('Please accept the official citizen statutory declaration to proceed.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.post('/auth/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        role: 'citizen',
      });

      if (res.data.success) {
        login(res.data.data.token, res.data.data.user);
        navigate('/');
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col bg-[#071a2e] text-slate-100">
      {/* 1. Official Government Top Utility Bar */}
      <div className="relative z-40">
        <GovernmentUtilityBar showSkipLink={false} />
      </div>

      {/* 2. MAIN INSTITUTIONAL BRAND HEADER (WHITE BACKGROUND - IDENTICAL TO LANDING PAGE) */}
      <header className="bg-white border-b border-slate-200 shadow-xs relative z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between gap-4">
          {/* LEFT: Ashoka Lion Capital Emblem + Ministry Text */}
          <Link
            to="/"
            className="flex items-center gap-3.5 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-lg p-0.5 shrink-0"
          >
            <NationalEmblem className="h-12 sm:h-14 w-auto shrink-0" />
            <div className="flex flex-col">
              <span className="font-extrabold text-xs sm:text-[13px] text-[#0c2340] tracking-wide leading-tight">
                {isEnglish ? (
                  'GOVERNMENT OF INDIA'
                ) : (
                  <>
                    {t('common.govIndiaHindi')}{' '}
                    <span className="font-normal text-slate-400">|</span>{' '}
                    {t('common.govIndia')}
                  </>
                )}
              </span>
              <span className="text-[11px] sm:text-xs text-slate-600 font-medium leading-tight mt-0.5">
                {t('common.ministry')}
              </span>
            </div>
          </Link>

          {/* CENTER: Main CivicConnect Branding with National Tag */}
          <div className="hidden md:flex flex-col items-center text-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl lg:text-3xl font-extrabold text-[#0c2b4d] tracking-tight">
                {t('nav.brandName')}
              </span>
              <span className="bg-[#fef3c7] border border-[#fde68a] text-[#92400e] font-extrabold text-[10px] lg:text-[11px] px-2 py-0.5 rounded shadow-2xs">
                {isEnglish
                  ? 'CITIZEN REGISTRATION PORTAL'
                  : i18n.language === 'gu'
                  ? 'નાગરિક નોંધણી પોર્ટલ'
                  : 'नागरिक पंजीकरण पोर्टल'}
              </span>
            </div>
            <span className="text-[11px] lg:text-xs text-slate-500 font-medium tracking-normal mt-0.5">
              {t('nav.brandSubtitle')}
            </span>
          </div>

          {/* RIGHT: Swachh Bharat Mission & Digital India Partner Logos */}
          <div className="flex items-center gap-3 lg:gap-4 shrink-0">
            <div className="hidden sm:block">
              <SwachhBharatLogo className="h-8 lg:h-9" />
            </div>
            <div className="h-8 w-px bg-slate-200 hidden lg:block" />
            <div className="hidden lg:block">
              <DigitalIndiaLogo className="h-8 lg:h-9" />
            </div>
          </div>
        </div>
      </header>

      {/* 3. NATIONAL TRICOLOR ACCENT LINE */}
      <div className="relative h-1.5 w-full z-30 flex shadow-2xs">
        <div className="bg-[#FF9933] flex-1" />
        <div className="bg-white flex-1" />
        <div className="bg-[#138808] flex-1" />
      </div>

      {/* 4. Background Photography & Government Contrast Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <img
          src="/assets/civic/clean-city.jpg"
          alt="Clean urban street infrastructure"
          className="w-full h-full object-cover object-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#051322]/95 via-[#0a2540]/90 to-[#071a2e]/90 backdrop-blur-[2px]" />
      </div>

      {/* 5. Main Form Container */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">

        <div className="w-full max-w-lg lg:max-w-xl mx-auto">
          {/* Official Government Form Card */}
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            {/* Top Tricolor Ribbon on Card */}
            <div className="h-1.5 w-full flex">
              <div className="bg-[#FF9933] flex-1" />
              <div className="bg-white flex-1" />
              <div className="bg-[#138808] flex-1" />
            </div>

            <div className="p-6 sm:p-8 space-y-5">
              {/* Card Header */}
              <div className="border-b border-slate-200 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 inline-block" />
                      <span>Government of India • e-Governance Services</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <UserPlus size={22} className="text-blue-900 shrink-0" />
                      <span>{t('auth.registerTitle', 'Citizen Registration Portal')}</span>
                    </h1>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {t('auth.registerSubtitle', 'Official public account to file, track, and verify municipal civic infrastructure grievances.')}
                    </p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <span className="text-[10px] bg-blue-50 text-blue-900 font-extrabold px-2.5 py-1 rounded-full border border-blue-200 uppercase flex items-center gap-1.5 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Citizen Account
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">Digital India</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs flex items-center gap-2">
                  <AlertTriangle size={16} className="shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* 1. Full Legal Name */}
                <div>
                  <label htmlFor="fullName" className="block font-bold text-slate-800 mb-1">
                    {t('auth.fullName', 'Full Legal Name')}{' '}
                    <span className="text-slate-500 font-normal text-[11px]">(as per Govt ID / Aadhaar / Voter ID)</span>{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      id="fullName"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="e.g. Rahul Mehta"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-700 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                {/* 2. Email Address + Verification Action */}
                <div>
                  <label htmlFor="email" className="block font-bold text-slate-800 mb-1">
                    {t('auth.email', 'Email Address')}{' '}
                    <span className="text-slate-500 font-normal text-[11px]">(for grievance notifications)</span>{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={16} />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      required
                      placeholder="e.g. rahul.mehta@example.com"
                      className={`w-full pl-10 pr-32 py-2.5 bg-slate-50 border rounded-md text-slate-900 focus:outline-none focus:bg-white transition-colors ${
                        isEmailVerified
                          ? 'border-emerald-500 bg-emerald-50/30'
                          : 'border-slate-300 focus:border-blue-700'
                      }`}
                    />
                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                      {isEmailVerified ? (
                        <span className="flex items-center gap-1 text-emerald-800 bg-emerald-100 border border-emerald-300 font-bold px-2.5 py-1 rounded text-[11px]">
                          <CheckCircle2 size={13} className="text-emerald-600" />
                          Govt Verified
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={!email || isOtpSending}
                          className="px-3 py-1 bg-blue-900 hover:bg-blue-800 text-white rounded text-[11px] font-bold disabled:opacity-50 transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                        >
                          {isOtpSending ? (
                            <>
                              <Loader2 size={11} className="animate-spin" />
                              <span>Sending...</span>
                            </>
                          ) : (
                            <span>Verify with OTP</span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  {!isEmailVerified && (
                    <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                      <ShieldCheck size={12} className="text-blue-900 shrink-0" />
                      <span>Click <strong>Verify with OTP</strong> to validate via official email gateway.</span>
                    </p>
                  )}
                </div>

                {/* 3. Mobile Number with +91 Country Code & explicit autoComplete to prevent email autofill */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="phone" className="block font-bold text-slate-800">
                      {t('auth.phone', 'Mobile Number (for SMS & Resolution Alerts)')}{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-medium">10-Digit Mobile</span>
                  </div>
                  <div className="relative flex items-center">
                    <div className="absolute left-0 top-0 bottom-0 px-3 bg-slate-100 border-r border-slate-300 flex items-center gap-1.5 rounded-l-md text-slate-700 text-xs font-bold select-none z-10">
                      <span>🇮🇳</span>
                      <span>+91</span>
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="98250 12345"
                      className="w-full pl-20 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-700 focus:bg-white transition-colors"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Official grievance ticket ID, resolution OTP, and field visits will be sent to this number.
                  </p>
                </div>

                {/* 4. Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="password" className="block font-bold text-slate-800">
                      {t('auth.password', 'Account Password')} <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-500">Min. 6 characters</span>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      id="password"
                      name="new-password"
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-700 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                {/* 5. Government Security Captcha */}
                <GovernmentCaptcha
                  value={captchaInput}
                  onChange={setCaptchaInput}
                  onValidChange={setIsCaptchaValid}
                  error={captchaError}
                />

                {/* 6. Statutory Citizen Declaration */}
                <label className={`flex items-start gap-2.5 p-3 rounded-lg cursor-pointer text-[11px] leading-relaxed transition-all select-none border ${
                  agreedToTerms
                    ? 'bg-blue-50/60 border-blue-300 text-slate-800'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70'
                }`}>
                  <input
                    type="checkbox"
                    id="declarationCheckbox"
                    name="declarationCheckbox"
                    checked={agreedToTerms}
                    onChange={(e) => {
                      setAgreedToTerms(e.target.checked);
                      if (error) setError(null);
                    }}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-900 cursor-pointer shrink-0"
                  />
                  <span>
                    I declare that I am an Indian citizen/resident and details provided are accurate for lodging municipal grievances under the Information Technology Act & Digital Personal Data Protection Act, 2023. <span className="text-red-500 font-bold">*</span>
                  </span>
                </label>

                {/* 7. Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !agreedToTerms}
                  className="w-full py-3 bg-[#0a2540] hover:bg-[#071a2e] text-white rounded-lg font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 tracking-wide cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>{t('common.loading', 'Processing Registration...')}</span>
                  ) : (
                    <>
                      <ShieldCheck size={16} className="text-amber-400" />
                      <span>REGISTER CITIZEN ACCOUNT • नागरिक खाता बनाएं</span>
                    </>
                  )}
                </button>
              </form>

              {/* Already have an account */}
              <div className="text-center pt-1 text-xs text-slate-600 border-t border-slate-100">
                <span>{t('auth.alreadyHaveAccount', 'Already have an account?')} </span>
                <Link to="/login" className="text-blue-900 font-bold hover:underline">
                  {t('auth.signInHere', 'Sign In to Citizen Portal →')}
                </Link>
              </div>

              {/* Government Portal Trust Indicators */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-500 font-medium">
                <div className="flex items-center justify-center gap-1">
                  <Lock size={11} className="text-emerald-600" />
                  <span>256-Bit SSL Encrypted</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <ShieldCheck size={11} className="text-blue-900" />
                  <span>MoHUA / CPGRAMS</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <span>🇮🇳</span>
                  <span>DPDP Act 2023</span>
                </div>
              </div>
            </div>
          </div>

          {/* Official Government Footer Credit */}
          <div className="text-center mt-5 text-[11px] text-slate-400 space-y-1">
            <p>
              Designed & Hosted by National Civic Redressal Division • Ministry of Housing and Urban Affairs, Government of India
            </p>
            <p className="text-[10px] text-slate-500">
              Compliant with Guidelines for Indian Government Websites (GIGW) • Digital India Initiative
            </p>
          </div>
        </div>
      </main>

      {/* Government-Style OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-sm overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#0a2540] text-white px-5 py-4 flex items-center justify-between border-b-2 border-blue-900">
              <div className="flex items-center gap-2">
                <KeyRound size={18} className="text-blue-300" />
                <h3 className="font-bold text-sm">Verify Email Address</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="text-slate-300 hover:text-white p-1 rounded transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div className="text-center">
                <p className="text-xs text-slate-600">
                  A 6-digit verification code has been sent to:
                </p>
                <p className="text-xs font-bold text-blue-950 mt-0.5">
                  {maskEmail(email)}
                </p>
              </div>

              {otpSuccessMessage && (
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-800 text-center font-medium">
                  {otpSuccessMessage}
                </div>
              )}

              {otpError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded text-[11px] text-red-800 flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0 text-red-600" />
                  <span>{otpError}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-center font-bold text-xs text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">
                    Enter 6-Digit OTP Code
                  </label>
                  <input
                    ref={otpInputRef}
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full text-center tracking-[0.4em] font-mono font-extrabold text-xl py-2.5 bg-slate-50 border-2 border-blue-800 rounded-md focus:outline-none focus:bg-white text-slate-900 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isOtpVerifying || otpInput.length !== 6}
                  className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-md shadow disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isOtpVerifying ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={15} />
                      <span>Verify OTP</span>
                    </>
                  )}
                </button>
              </form>

              {/* Expiry & Resend Section */}
              <div className="border-t border-slate-100 pt-3 space-y-2 text-center text-xs">
                <div className="flex items-center justify-center gap-1.5 text-slate-500 text-[11px]">
                  <Clock size={13} className="text-slate-400" />
                  <span>
                    OTP expires in{' '}
                    <strong className={otpExpirySeconds < 60 ? 'text-red-600' : 'text-slate-800'}>
                      {formatTime(otpExpirySeconds)}
                    </strong>
                  </span>
                </div>

                <div className="text-[11px] text-slate-600">
                  <span>Didn't receive the code? </span>
                  {resendCooldown > 0 ? (
                    <span className="text-slate-400 font-medium">
                      Resend in {resendCooldown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isOtpSending}
                      className="text-blue-900 font-bold hover:underline cursor-pointer inline-flex items-center gap-1"
                    >
                      <RotateCw size={11} className={isOtpSending ? 'animate-spin' : ''} />
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
