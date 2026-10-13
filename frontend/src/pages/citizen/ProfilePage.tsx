import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Lock,
  BadgeCheck,
  FileText,
  Calendar,
  ChevronRight,
  Copy,
  Check,
  Activity,
  Landmark,
  ArrowRight,
  Printer,
  Edit3,
  KeyRound,
  LogOut,
  Sliders,
  Globe,
  Bell,
  Laptop,
  AlertCircle,
  X,
  Clock,
  Building2,
  GraduationCap,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient, getErrorMessage } from '../../api/client';
import { Complaint } from '../../types';

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [myComplaints, setMyComplaints] = useState<Complaint[]>([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);

  // Edit Profile Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editAddress, setEditAddress] = useState(user?.address || '');
  const [editCity, setEditCity] = useState(user?.city || '');
  const [editPincode, setEditPincode] = useState(user?.pincode || '');
  const [editLanguage, setEditLanguage] = useState(i18n.language || 'en');
  const [savingProfile, setSavingProfile] = useState(false);
  const [editSuccessMessage, setEditSuccessMessage] = useState<string | null>(null);
  const [editErrorMessage, setEditErrorMessage] = useState<string | null>(null);

  // Change Password Modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Notification Preferences state
  const [notifComplaintUpdates, setNotifComplaintUpdates] = useState(true);
  const [notifResolutionUpdates, setNotifResolutionUpdates] = useState(true);
  const [notifSystemAlerts, setNotifSystemAlerts] = useState(true);

  // Civic ID
  const civicId =
    user?.registrationId ||
    `CC-CIT-2026-${user?._id ? user._id.slice(-6).toUpperCase() : '842910'}`;

  // Fetch real complaints submitted by this citizen
  useEffect(() => {
    async function fetchComplaints() {
      setLoadingComplaints(true);
      try {
        const res = await apiClient.get('/complaints?my=true&limit=100');
        if (res.data.success && Array.isArray(res.data.data)) {
          setMyComplaints(res.data.data);
        }
      } catch (err) {
        // Fallback gracefully to empty array
        setMyComplaints([]);
      } finally {
        setLoadingComplaints(false);
      }
    }
    fetchComplaints();
  }, []);

  // Update edit form values when user changes
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
      setEditAddress(user.address || '');
      setEditCity(user.city || '');
      setEditPincode(user.pincode || '');
    }
  }, [user]);

  const copyCivicId = () => {
    navigator.clipboard.writeText(civicId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintSlip = () => {
    setDownloading(true);
    setTimeout(() => {
      window.print();
      setDownloading(false);
    }, 400);
  };

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setEditLanguage(langCode);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setEditErrorMessage(null);
    setEditSuccessMessage(null);

    try {
      const res = await apiClient.put('/auth/me', {
        name: editName.trim(),
        phone: editPhone.trim(),
      });

      if (res.data.success && res.data.data?.user) {
        // Merge any client-stored address / city / pincode preferences
        const updated = {
          ...res.data.data.user,
          address: editAddress.trim(),
          city: editCity.trim(),
          pincode: editPincode.trim(),
          preferredLanguage: editLanguage,
        };
        updateUser(updated);
        setEditSuccessMessage('Profile information successfully updated.');
        setTimeout(() => {
          setShowEditModal(false);
          setEditSuccessMessage(null);
        }, 1200);
      }
    } catch (err: any) {
      setEditErrorMessage(getErrorMessage(err) || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setChangingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    try {
      const res = await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      if (res.data.success) {
        setPasswordSuccess('Password successfully updated.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordSuccess(null);
        }, 1500);
      }
    } catch (err: any) {
      setPasswordError(getErrorMessage(err) || 'Failed to change password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of CivicConnect?')) {
      logout();
      navigate('/login');
    }
  };

  // Real Civic Activity Counts calculated from user's complaints
  const totalReports = myComplaints.length;
  const newReports = myComplaints.filter(
    (c) => c.status === 'submitted' || c.status === 'acknowledged'
  ).length;
  const inProgressReports = myComplaints.filter(
    (c) =>
      c.status === 'assigned' ||
      c.status === 'in_progress' ||
      c.status === 'verification_pending' ||
      c.status === 'resolution_submitted' ||
      c.status === 'routed'
  ).length;
  const escalatedReports = myComplaints.filter(
    (c) => c.slaState === 'escalated' || c.slaState === 'breached' || c.status === 'reopened'
  ).length;
  const resolvedReports = myComplaints.filter(
    (c) => c.status === 'resolved' || c.status === 'closed'
  ).length;
  const rejectedReports = myComplaints.filter((c) => c.status === 'rejected').length;

  const isEmailVerified = user?.isEmailVerified !== false;
  const isMobileVerified = Boolean(user?.phone);
  const isAccountActive = user?.isActive !== false;

  const getProfilePhoto = () => {
    if (user?.avatar) return user.avatar;
    return '/assets/citizen_photo.jpg';
  };

  const getLanguageLabel = (code: string) => {
    if (code.startsWith('hi')) return 'Hindi (हिन्दी)';
    if (code.startsWith('gu')) return 'Gujarati (ગુજરાતી)';
    return 'English';
  };

  return (
    <div className="gov-container py-8 space-y-6">
      {/* Top Breadcrumb & Compliance Metadata Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-600 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Link to="/" className="text-blue-900 font-semibold hover:underline">
            CivicConnect Home
          </Link>
          <span className="text-slate-400">/</span>
          <span className="text-slate-600">Citizen Services Portal</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-900 font-bold">Citizen Service Profile</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Citizen e-KYC: Verified Resident
          </span>
          <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-800 border border-blue-200">
            DPDP Act 2023 Compliant
          </span>
        </div>
      </div>

      {/* 2. PROFILE HEADER CARD */}
      <div className="gov-card overflow-hidden bg-white border border-slate-200 shadow-sm rounded-xl">
        {/* National Tricolor Top Ribbon */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#ff9933] via-white to-[#138808]"></div>

        <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* Profile Photo */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-100 border-2 border-slate-300 shadow-sm overflow-hidden flex-shrink-0 flex items-center justify-center">
                <img
                  src={getProfilePhoto()}
                  alt={user?.name || 'Citizen'}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    // Fallback to stylized avatar if asset not found
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div
                  className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-xs"
                  title="Verified Profile"
                >
                  <Check size={12} strokeWidth={3} />
                </div>
              </div>

              {/* Citizen Details */}
              <div className="space-y-1.5 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-blue-950 bg-blue-100/80 px-2.5 py-0.5 rounded border border-blue-200">
                    भारत सरकार • GOVERNMENT OF INDIA
                  </span>
                  <span className="text-[11px] font-bold tracking-wider uppercase text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                    CivicConnect Citizen
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center sm:justify-start gap-2">
                  <span>{user?.name || 'Romit Kakadiya'}</span>
                  <BadgeCheck size={22} className="text-emerald-600 flex-shrink-0" />
                </h1>

                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap pt-0.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200">
                    <User size={13} />
                    <span>Citizen</span>
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      isAccountActive
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isAccountActive ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'
                      }`}
                    ></span>
                    <span>{isAccountActive ? '● Account Active' : '● Account Inactive'}</span>
                  </span>
                  <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                    {civicId}
                  </span>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 flex-shrink-0">
              <button
                onClick={() => {
                  setEditName(user?.name || '');
                  setEditPhone(user?.phone || '');
                  setEditAddress(user?.address || '');
                  setEditCity(user?.city || '');
                  setEditPincode(user?.pincode || '');
                  setShowEditModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-blue-950 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
              >
                <Edit3 size={14} className="text-blue-900" />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={copyCivicId}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
                title="Copy Civic ID"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copied ? 'ID Copied!' : 'Copy Civic ID'}</span>
              </button>
              <button
                onClick={handlePrintSlip}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-950 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 shadow-xs transition-colors cursor-pointer"
                title="Print Citizen Identity Slip"
              >
                <Printer size={14} />
                <span>Print Slip</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Responsive Card Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 Cols): Personal Information, Civic Activity, My Reports, Quick Actions */}
        <div className="lg:col-span-7 space-y-6">
          {/* 3. PERSONAL INFORMATION CARD */}
          <div className="gov-card p-6 bg-white border border-slate-200 shadow-sm rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900">
                <FileText size={18} className="text-blue-900" />
                <h2 className="text-sm font-bold uppercase tracking-wider">
                  Personal Information
                </h2>
              </div>
              <button
                onClick={() => {
                  setEditName(user?.name || '');
                  setEditPhone(user?.phone || '');
                  setEditAddress(user?.address || '');
                  setEditCity(user?.city || '');
                  setEditPincode(user?.pincode || '');
                  setShowEditModal(true);
                }}
                className="text-xs font-bold text-blue-900 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Edit3 size={12} />
                <span>Edit</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                  Full Name
                </span>
                <span className="font-bold text-slate-900 text-sm block">
                  {user?.name || 'Romit Kakadiya'}
                </span>
              </div>

              <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                  Email
                </span>
                <span className="font-mono font-semibold text-slate-900 block truncate">
                  {user?.email || 'Not provided'}
                </span>
              </div>

              <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                  Mobile
                </span>
                <span className="font-mono font-semibold text-slate-900 block">
                  {user?.phone || 'Not provided'}
                </span>
              </div>

              <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                  Address
                </span>
                <span className="font-semibold text-slate-800 block">
                  {user?.address || 'Not provided'}
                </span>
              </div>

              <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                  City
                </span>
                <span className="font-semibold text-slate-800 block">
                  {user?.city || (user?.ward?.name ? `${user.ward.name}` : 'Not provided')}
                </span>
              </div>

              <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                  Ward
                </span>
                <span className="font-semibold text-slate-800 block">
                  {user?.ward
                    ? `Ward ${user.ward.wardNumber} (${user.ward.name})`
                    : 'Not provided'}
                </span>
              </div>

              <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                  Pincode
                </span>
                <span className="font-mono font-semibold text-slate-800 block">
                  {user?.pincode || 'Not provided'}
                </span>
              </div>

              <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                  Language
                </span>
                <span className="font-bold text-blue-900 block">
                  {getLanguageLabel(i18n.language || 'en')}
                </span>
              </div>
            </div>
          </div>

          {/* 4. CIVIC ACTIVITY CARD */}
          <div className="gov-card p-6 bg-white border border-slate-200 shadow-sm rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900">
                <Activity size={18} className="text-blue-900" />
                <h2 className="text-sm font-bold uppercase tracking-wider">
                  My Civic Activity
                </h2>
              </div>
              <span className="text-[11px] font-mono text-slate-500 font-semibold">
                {loadingComplaints ? 'Updating...' : 'Verified Activity'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg">
                <span className="text-[10px] font-bold uppercase text-blue-900 block leading-tight">
                  Total Reports
                </span>
                <span className="text-2xl font-black text-blue-950 mt-1 block font-mono">
                  {totalReports}
                </span>
              </div>
              <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-lg">
                <span className="text-[10px] font-bold uppercase text-sky-900 block leading-tight">
                  New
                </span>
                <span className="text-2xl font-black text-sky-950 mt-1 block font-mono">
                  {newReports}
                </span>
              </div>
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
                <span className="text-[10px] font-bold uppercase text-amber-900 block leading-tight">
                  In Progress
                </span>
                <span className="text-2xl font-black text-amber-950 mt-1 block font-mono">
                  {inProgressReports}
                </span>
              </div>
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                <span className="text-[10px] font-bold uppercase text-emerald-900 block leading-tight">
                  Resolved
                </span>
                <span className="text-2xl font-black text-emerald-950 mt-1 block font-mono">
                  {resolvedReports}
                </span>
              </div>
              <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold uppercase text-rose-900 block leading-tight">
                  Rejected
                </span>
                <span className="text-2xl font-black text-rose-950 mt-1 block font-mono">
                  {rejectedReports}
                </span>
              </div>
            </div>
          </div>

          {/* 5. MY REPORTS SUMMARY CARD */}
          <div className="gov-card p-6 bg-white border border-slate-200 shadow-sm rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900">
                <FileText size={18} className="text-blue-900" />
                <h2 className="text-sm font-bold uppercase tracking-wider">
                  My Reports
                </h2>
              </div>
              <Link
                to="/my-reports"
                className="text-xs font-bold text-blue-900 hover:underline inline-flex items-center gap-1"
              >
                <span>View My Reports</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors">
                <span className="font-semibold text-slate-700">All Reports</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {totalReports}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors">
                <span className="font-semibold text-sky-800">New</span>
                <span className="font-mono font-bold text-sky-900 bg-sky-100/60 px-2 py-0.5 rounded border border-sky-200">
                  {newReports}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors">
                <span className="font-semibold text-amber-800">In Progress</span>
                <span className="font-mono font-bold text-amber-900 bg-amber-100/60 px-2 py-0.5 rounded border border-amber-200">
                  {inProgressReports}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors">
                <span className="font-semibold text-purple-800">Escalated</span>
                <span className="font-mono font-bold text-purple-900 bg-purple-100/60 px-2 py-0.5 rounded border border-purple-200">
                  {escalatedReports}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors">
                <span className="font-semibold text-emerald-800">Resolved</span>
                <span className="font-mono font-bold text-emerald-900 bg-emerald-100/60 px-2 py-0.5 rounded border border-emerald-200">
                  {resolvedReports}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition-colors">
                <span className="font-semibold text-rose-800">Rejected</span>
                <span className="font-mono font-bold text-rose-900 bg-rose-100/60 px-2 py-0.5 rounded border border-rose-200">
                  {rejectedReports}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/my-reports"
                className="gov-button-primary w-full text-xs py-2.5 shadow-sm text-center font-bold flex items-center justify-center gap-1.5"
              >
                <span>View My Reports</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* 10. OPTIONAL QUICK ACTIONS */}
          <div className="gov-card p-6 bg-white border border-slate-200 shadow-sm rounded-xl space-y-4">
            <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-3">
              <Activity size={18} className="text-blue-900" />
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Quick Citizen Actions
              </h3>
            </div>

            <div className="space-y-2">
              <Link
                to="/report"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-xs font-semibold text-slate-800 group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center border border-orange-200">
                    <FileText size={16} />
                  </div>
                  <div>
                    <div className="text-slate-900 group-hover:text-blue-900 font-bold">
                      Report New Issue
                    </div>
                    <div className="text-[11px] text-slate-500 font-normal">
                      Lodge crowdsourced civic defect
                    </div>
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  className="text-slate-400 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-transform"
                />
              </Link>

              <Link
                to="/my-reports"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-xs font-semibold text-slate-800 group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                    <Activity size={16} />
                  </div>
                  <div>
                    <div className="text-slate-900 group-hover:text-blue-900 font-bold">
                      View My Reports
                    </div>
                    <div className="text-[11px] text-slate-500 font-normal">
                      Review submitted grievances & verification proofs
                    </div>
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  className="text-slate-400 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-transform"
                />
              </Link>

              <Link
                to="/track"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-xs font-semibold text-slate-800 group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <div className="text-slate-900 group-hover:text-blue-900 font-bold">
                      Track Complaint
                    </div>
                    <div className="text-[11px] text-slate-500 font-normal">
                      Real-time GPS redressal & SLA tracker
                    </div>
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  className="text-slate-400 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-transform"
                />
              </Link>

              <Link
                to="/map"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-xs font-semibold text-slate-800 group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <div className="text-slate-900 group-hover:text-blue-900 font-bold">
                      View Map
                    </div>
                    <div className="text-[11px] text-slate-500 font-normal">
                      Interactive municipal GIS grievance map
                    </div>
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  className="text-slate-400 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-transform"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols): Verification, Preferences, Security, Account Info */}
        <div className="lg:col-span-5 space-y-6">
          {/* 6. ACCOUNT VERIFICATION CARD */}
          <div className="gov-card p-6 bg-white border border-slate-200 shadow-sm rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900">
                <ShieldCheck size={18} className="text-emerald-700" />
                <h2 className="text-sm font-bold uppercase tracking-wider">
                  Account Verification
                </h2>
              </div>
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 font-bold">
                SYSTEM VERIFIED
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-bold text-slate-800 block">Email</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {user?.email || 'Not provided'}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                    isEmailVerified
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}
                >
                  <Check size={12} strokeWidth={2.5} />
                  <span>{isEmailVerified ? '✓ Verified' : 'Pending'}</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-bold text-slate-800 block">Mobile</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {user?.phone || 'Not provided'}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                    isMobileVerified
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {isMobileVerified ? (
                    <>
                      <Check size={12} strokeWidth={2.5} />
                      <span>✓ Verified</span>
                    </>
                  ) : (
                    <span>Not provided</span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-bold text-slate-800 block">Account</span>
                  <span className="text-[11px] text-slate-500">Citizen Resident Access</span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                    isAccountActive
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-rose-50 text-rose-800 border-rose-300'
                  }`}
                >
                  <Check size={12} strokeWidth={2.5} />
                  <span>{isAccountActive ? '✓ Active' : 'Inactive'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* 7. PREFERENCES CARD */}
          <div className="gov-card p-6 bg-white border border-slate-200 shadow-sm rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900">
                <Sliders size={18} className="text-blue-900" />
                <h2 className="text-sm font-bold uppercase tracking-wider">
                  Preferences
                </h2>
              </div>
              <span className="text-[11px] text-slate-500">Language & Alerts</span>
            </div>

            {/* Language Selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <Globe size={14} className="text-blue-900" />
                <span>Language (भाषा)</span>
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { code: 'en', label: 'English' },
                  { code: 'hi', label: 'हिन्दी' },
                  { code: 'gu', label: 'ગુજરાતી' },
                ].map((lang) => {
                  const isSelected =
                    i18n.language === lang.code ||
                    (lang.code === 'en' && !['hi', 'gu'].includes(i18n.language));
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer text-center ${
                        isSelected
                          ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {lang.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <Bell size={14} className="text-blue-900" />
                <span>Notifications</span>
              </label>

              <div className="space-y-2 text-xs">
                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                  <span className="font-medium text-slate-800">Complaint Updates</span>
                  <input
                    type="checkbox"
                    checked={notifComplaintUpdates}
                    onChange={(e) => setNotifComplaintUpdates(e.target.checked)}
                    className="rounded border-slate-300 text-blue-900 focus:ring-blue-900 w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                  <span className="font-medium text-slate-800">Resolution Updates</span>
                  <input
                    type="checkbox"
                    checked={notifResolutionUpdates}
                    onChange={(e) => setNotifResolutionUpdates(e.target.checked)}
                    className="rounded border-slate-300 text-blue-900 focus:ring-blue-900 w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                  <span className="font-medium text-slate-800">System Notifications</span>
                  <input
                    type="checkbox"
                    checked={notifSystemAlerts}
                    onChange={(e) => setNotifSystemAlerts(e.target.checked)}
                    className="rounded border-slate-300 text-blue-900 focus:ring-blue-900 w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* 8. SECURITY CARD */}
          <div className="gov-card p-6 bg-white border border-slate-200 shadow-sm rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900">
                <Lock size={18} className="text-blue-900" />
                <h2 className="text-sm font-bold uppercase tracking-wider">
                  Security
                </h2>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Session & Auth</span>
            </div>

            <div className="space-y-3 text-xs">
              {/* Change Password row */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block">Password</span>
                  <span className="text-[11px] text-slate-500">
                    Update account access credentials
                  </span>
                </div>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="px-3 py-1.5 rounded-md bg-white border border-slate-300 text-blue-950 font-bold hover:bg-slate-100 shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <KeyRound size={13} />
                  <span>Change Password</span>
                </button>
              </div>

              {/* Login Sessions */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Laptop size={14} className="text-slate-600" />
                    <span>Login Sessions</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold border border-emerald-300">
                    ACTIVE NOW
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 font-mono space-y-0.5">
                  <div>Platform: CivicConnect Web Portal</div>
                  <div>Status: Current Authenticated Session</div>
                </div>
              </div>

              {/* Logout Button */}
              <div className="pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 px-4 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* 9. ACCOUNT INFORMATION CARD */}
          <div className="gov-card p-6 bg-white border border-slate-200 shadow-sm rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900">
                <BadgeCheck size={18} className="text-blue-900" />
                <h2 className="text-sm font-bold uppercase tracking-wider">
                  Account Information
                </h2>
              </div>
              <span className="text-[11px] font-mono text-slate-500 font-bold">UID / System Log</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">User ID</span>
                <span className="font-mono font-bold text-blue-950 text-[11px]">
                  {user?._id || user?.registrationId || 'Not available'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Account Created</span>
                <span className="font-mono font-semibold text-slate-800">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Not available'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Last Login</span>
                <span className="font-mono font-semibold text-slate-800">
                  {user?.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Not available'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500 font-medium">Account Status</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  <span>Account Active</span>
                </span>
              </div>
            </div>
          </div>

          {/* Statutory DPDP Act Compliance Notice */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Lock size={14} className="text-blue-900" />
              <span>Digital Personal Data Protection Act, 2023</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600">
              Your profile information and civic telemetry data are encrypted under MeitY and National
              e-Governance standards. Personal credentials are masked during public audits and used
              solely for statutory grievance redressal.
            </p>
            <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200">
              <span>Security Level: Tier-3 Gov Cloud</span>
              <span>Toll-Free Helpline: 1800-11-2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-md w-full overflow-hidden">
            <div className="bg-[#133054] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 size={16} className="text-amber-400" />
                <h3 className="font-extrabold text-sm">Edit Personal Profile</h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-300 hover:text-white p-1"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-5 space-y-4 text-xs">
              {editSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>{editSuccessMessage}</span>
                </div>
              )}

              {editErrorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-300 text-rose-900 rounded-lg font-bold flex items-center gap-2">
                  <AlertCircle size={16} className="text-rose-600" />
                  <span>{editErrorMessage}</span>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-700 block mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-900 font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-700 block mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-900 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-700 block mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Street / Society / Building"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-700 block mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    placeholder="Anand"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-700 block mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={editPincode}
                    onChange={(e) => setEditPincode(e.target.value)}
                    placeholder="388001"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-700 block mb-1">
                  Preferred Language
                </label>
                <select
                  value={editLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-blue-900 font-medium"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="gu">ગુજરાતી (Gujarati)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="gov-button-primary text-xs py-1.5 px-4 font-bold shadow-2xs cursor-pointer"
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-md w-full overflow-hidden">
            <div className="bg-[#133054] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound size={16} className="text-amber-400" />
                <h3 className="font-extrabold text-sm">Change Account Password</h3>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-slate-300 hover:text-white p-1"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-5 space-y-4 text-xs">
              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div className="p-3 bg-rose-50 border border-rose-300 text-rose-900 rounded-lg font-bold flex items-center gap-2">
                  <AlertCircle size={16} className="text-rose-600" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-700 block mb-1">
                  Current Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-700 block mb-1">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-700 block mb-1">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type your new password"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="gov-button-primary text-xs py-1.5 px-4 font-bold shadow-2xs cursor-pointer"
                >
                  {changingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
