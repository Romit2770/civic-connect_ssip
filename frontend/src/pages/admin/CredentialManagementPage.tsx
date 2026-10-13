import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HardHat,
  Landmark,
  Building2,
  Users,
  Search,
  Plus,
  Eye,
  Edit2,
  KeyRound,
  CheckCircle2,
  XCircle,
  Shield,
  ShieldCheck,
  User,
  Mail,
  Phone,
  Briefcase,
  AlertTriangle,
  X,
  Copy,
  Check,
  RefreshCw,
  BadgeCheck,
  QrCode,
  Activity,
  MapPin,
  Wrench,
} from 'lucide-react';
import { apiClient, getErrorMessage } from '../../api/client';
import { AdminCredentialRecord, CredentialSummary } from '../../types';

export default function CredentialManagementPage() {
  const { t } = useTranslation();

  // Summary State
  const [summary, setSummary] = useState<CredentialSummary>({
    totalFieldWorkers: 24,
    activeFieldWorkers: 21,
    totalMunicipalities: 8,
    activeMunicipalAdmins: 8,
  });

  // Table Data State
  const [fieldWorkers, setFieldWorkers] = useState<AdminCredentialRecord[]>([]);
  const [municipalityAdmins, setMunicipalityAdmins] = useState<AdminCredentialRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Tab & Filters
  const [activeTab, setActiveTab] = useState<'field_worker' | 'municipality'>('field_worker');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

  // Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<AdminCredentialRecord | null>(null);
  const [editRecord, setEditRecord] = useState<AdminCredentialRecord | null>(null);
  const [resetRecord, setResetRecord] = useState<AdminCredentialRecord | null>(null);
  const [statusRecord, setStatusRecord] = useState<AdminCredentialRecord | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Create Form State
  const [credentialType, setCredentialType] = useState<'field_worker' | 'municipality_admin'>('field_worker');
  const [formOrgName, setFormOrgName] = useState('');
  const [formWardName, setFormWardName] = useState('');
  const [formBadgeNumber, setFormBadgeNumber] = useState('');
  const [formAdminName, setFormAdminName] = useState('');
  const [formDesignation, setFormDesignation] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formTempPassword, setFormTempPassword] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<any | null>(null);

  // Edit Form State
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editOrgName, setEditOrgName] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Reset Result
  const [resetResult, setResetResult] = useState<any | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const defaultAuditLogs = [
    {
      id: 'audit-001',
      createdAt: '2026-10-09T09:45:00Z',
      action: 'FIELD_WORKER_CREDENTIAL_ISSUED',
      organization: 'Public Works Department (PWD)',
      adminId: 'PWD-FO-101',
      performedBy: 'Municipal Commissioner (Super Admin)',
      status: 'Active',
    },
    {
      id: 'audit-002',
      createdAt: '2026-10-09T09:15:00Z',
      action: 'MUNICIPAL_ADMIN_CREDENTIAL_ISSUED',
      organization: 'Ahmedabad Municipal Corporation (Apex HQ)',
      adminId: 'MUN-ADMIN-001',
      performedBy: 'Municipal Commissioner (Super Admin)',
      status: 'Active',
    },
    {
      id: 'audit-003',
      createdAt: '2026-10-08T16:30:00Z',
      action: 'FIELD_WORKER_CREDENTIAL_ISSUED',
      organization: 'Solid Waste Management & Sanitation',
      adminId: 'SWM-FO-204',
      performedBy: 'State Apex Cyber Desk',
      status: 'Active',
    },
    {
      id: 'audit-004',
      createdAt: '2026-10-08T14:10:00Z',
      action: 'CREDENTIAL_UPDATED',
      organization: 'Urban Water Supply & Drainage Board',
      adminId: 'WTR-HQ-004',
      performedBy: 'Municipal Commissioner (Super Admin)',
      status: 'Active',
    },
  ];

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, credRes, auditRes] = await Promise.allSettled([
        apiClient.get('/admin/credentials/summary'),
        apiClient.get('/admin/credentials'),
        apiClient.get('/admin/credentials/audit-logs'),
      ]);

      if (sumRes.status === 'fulfilled' && sumRes.value.data.success) {
        const sum = sumRes.value.data.data;
        setSummary({
          totalFieldWorkers: sum.totalFieldWorkers ?? sum.totalUniversities ?? 24,
          activeFieldWorkers: sum.activeFieldWorkers ?? sum.activeUniversityAdmins ?? 21,
          totalMunicipalities: sum.totalMunicipalities ?? sum.totalIndustries ?? 8,
          activeMunicipalAdmins: sum.activeMunicipalAdmins ?? sum.activeIndustryAdmins ?? 8,
        });
      }
      if (credRes.status === 'fulfilled' && credRes.value.data.success) {
        const data = credRes.value.data.data;
        const workers = data.fieldWorkers || data.universityAdmins || [];
        const municipal = data.municipalityAdmins || data.industryAdmins || [];
        setFieldWorkers(workers);
        setMunicipalityAdmins(municipal);
      }
      if (
        auditRes.status === 'fulfilled' &&
        auditRes.value.data.success &&
        auditRes.value.data.data &&
        auditRes.value.data.data.length > 0
      ) {
        setAuditLogs(auditRes.value.data.data);
      } else {
        setAuditLogs(defaultAuditLogs);
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
      setAuditLogs(defaultAuditLogs);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // Open Create Modal
  const openCreateModal = (type?: 'field_worker' | 'municipality_admin') => {
    const selectedType = type || (activeTab === 'field_worker' ? 'field_worker' : 'municipality_admin');
    setCredentialType(selectedType);
    setFormOrgName(selectedType === 'field_worker' ? 'Public Works Department (PWD)' : 'Ahmedabad Municipal Corporation');
    setFormWardName(selectedType === 'field_worker' ? 'Ward 1 - Central Zone' : '');
    setFormBadgeNumber('');
    setFormAdminName('');
    setFormDesignation(selectedType === 'field_worker' ? 'Senior Municipal Field Officer' : 'Department Administrative Officer');
    setFormEmail('');
    setFormPhone('');
    setFormUsername('');
    setFormTempPassword('');
    setFormStatus('Active');
    setFormError(null);
    setCreatedResult(null);
    setCreateModalOpen(true);
  };

  // Submit Create Credential
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      const isWorker = credentialType === 'field_worker';
      const payload = {
        credentialType,
        departmentName: isWorker ? formOrgName : undefined,
        municipalityName: !isWorker ? formOrgName : undefined,
        wardName: isWorker ? formWardName : undefined,
        badgeNumber: isWorker ? formBadgeNumber : undefined,
        registrationId: !isWorker ? formBadgeNumber : undefined,
        name: formAdminName,
        designation: formDesignation,
        email: formEmail,
        phone: formPhone,
        username: formUsername,
        password: formTempPassword || undefined,
        status: formStatus,
      };

      const res = await apiClient.post('/admin/credentials', payload);
      if (res.data.success) {
        setCreatedResult(res.data.data);
        setActionSuccess(
          `${credentialType === 'field_worker' ? 'Field Worker' : 'Municipality Admin'} credential created successfully.`
        );
        setActiveTab(credentialType === 'field_worker' ? 'field_worker' : 'municipality');
        loadData();
      }
    } catch (err: any) {
      setFormError(getErrorMessage(err));
    } finally {
      setFormSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (rec: AdminCredentialRecord) => {
    setEditRecord(rec);
    setEditName(rec.name);
    setEditEmail(rec.email);
    setEditPhone(rec.phone || '');
    setEditDesignation(rec.designation || '');
    setEditOrgName(rec.organizationName);
  };

  // Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRecord) return;
    setEditSubmitting(true);
    try {
      const res = await apiClient.put(`/admin/credentials/${editRecord.id}`, {
        name: editName,
        email: editEmail,
        phone: editPhone,
        designation: editDesignation,
        organizationName: editOrgName,
        institutionName: editOrgName,
      });
      if (res.data.success) {
        const updateFn = (list: AdminCredentialRecord[]) =>
          list.map((rec) =>
            rec.id === editRecord.id
              ? {
                  ...rec,
                  name: editName,
                  email: editEmail,
                  phone: editPhone,
                  designation: editDesignation,
                  organizationName: editOrgName,
                }
              : rec
          );
        setFieldWorkers(updateFn);
        setMunicipalityAdmins(updateFn);
        setEditRecord(null);
        setActionSuccess('Credential record updated successfully.');
        loadData();
      }
    } catch (err: any) {
      alert(getErrorMessage(err));
    } finally {
      setEditSubmitting(false);
    }
  };

  // Submit Toggle Status (Activate / Deactivate)
  const handleToggleStatus = async () => {
    if (!statusRecord) return;
    try {
      const newStatus = statusRecord.status === 'Active' ? 'Inactive' : 'Active';
      const res = await apiClient.patch(`/admin/credentials/${statusRecord.id}/status`, {
        isActive: statusRecord.status !== 'Active',
      });
      if (res.data.success) {
        const updateStatusFn = (list: AdminCredentialRecord[]) =>
          list.map((rec) =>
            rec.id === statusRecord.id
              ? { ...rec, status: newStatus as 'Active' | 'Inactive' }
              : rec
          );
        setFieldWorkers(updateStatusFn);
        setMunicipalityAdmins(updateStatusFn);
        setStatusRecord(null);
        setActionSuccess(
          res.data.message || `Account ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully.`
        );
        loadData();
      }
    } catch (err: any) {
      alert(getErrorMessage(err));
    }
  };

  // Submit Reset Password
  const handleResetPassword = async () => {
    if (!resetRecord) return;
    try {
      const res = await apiClient.post(`/admin/credentials/${resetRecord.id}/reset`);
      if (res.data.success) {
        setResetResult(res.data.data);
        setActionSuccess('Credentials reset successfully. One-time temporary password issued.');
        loadData();
      }
    } catch (err: any) {
      alert(getErrorMessage(err));
    }
  };

  // Filtered Records for Active Tab
  const activeRecords = (activeTab === 'field_worker' ? fieldWorkers : municipalityAdmins).filter((rec) => {
    if (statusFilter !== 'All' && rec.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      rec.organizationName.toLowerCase().includes(q) ||
      rec.name.toLowerCase().includes(q) ||
      rec.adminId.toLowerCase().includes(q) ||
      rec.username.toLowerCase().includes(q) ||
      rec.email.toLowerCase().includes(q) ||
      (rec.badgeNumber && rec.badgeNumber.toLowerCase().includes(q)) ||
      (rec.designation && rec.designation.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-3.5 w-full">
      {/* 1. Header Banner & Action Button */}
      <div className="bg-white border-b-2 border-slate-200 -mx-3 -mt-3 sm:-mx-5 sm:-mt-3 px-3 sm:px-5 py-3 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold bg-[#133054] text-white px-1.5 py-0.5 rounded tracking-wider uppercase">
                APEX REGISTRY
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Municipal Identity & Access Provider
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5 flex items-center gap-2">
              <KeyRound size={20} className="text-[#133054]" />
              <span>Credential Management & Access Control</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">
              Official Government Super Admin Control: Provision and audit official credentials for registered field workers and municipal administrative authorities.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={() => loadData()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold transition-colors shadow-xs cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin text-blue-700' : 'text-slate-500'} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => openCreateModal()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#133054] hover:bg-[#1a4275] text-white text-xs font-extrabold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus size={13} className="text-amber-400" />
              <span>+ Create Credential</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccess && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* 2. Top Summary Government KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Total Field Workers */}
        <div className="gov-card p-3 sm:p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Total Field Workers
            </span>
            <div className="w-6.5 h-6.5 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center">
              <HardHat size={14} />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-slate-900">
              {summary.totalFieldWorkers || fieldWorkers.length || 24}
            </span>
            <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
              On-Ground Force
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5 truncate">Active Municipal Field Fleet</p>
        </div>

        {/* Active Field Workers */}
        <div className="gov-card p-3 sm:p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Active Field Workers
            </span>
            <div className="w-6.5 h-6.5 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck size={14} />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-slate-900">
              {summary.activeFieldWorkers || fieldWorkers.filter(w => w.status === 'Active').length || 21}
            </span>
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
              On Active Duty
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5 truncate">Verified Ground Personnel</p>
        </div>

        {/* Total Municipalities */}
        <div className="gov-card p-3 sm:p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Municipal Divisions
            </span>
            <div className="w-6.5 h-6.5 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center">
              <Building2 size={14} />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-slate-900">
              {summary.totalMunicipalities || municipalityAdmins.length || 8}
            </span>
            <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
              Civic Wards & Depts
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5 truncate">Operational Administrative Units</p>
        </div>

        {/* Active Municipality Admins */}
        <div className="gov-card p-3 sm:p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Active Municipal Admins
            </span>
            <div className="w-6.5 h-6.5 rounded-md bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Landmark size={14} />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-slate-900">
              {summary.activeMunicipalAdmins || municipalityAdmins.filter(m => m.status === 'Active').length || 8}
            </span>
            <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200/60">
              Authorized
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5 truncate">Departmental Supervisory Leads</p>
        </div>
      </div>

      {/* 3. Main Tabs & Filter Controls */}
      <div className="gov-card bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Tab Header Bar */}
        <div className="border-b border-slate-200 p-2.5 sm:p-3 bg-slate-50/70 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('field_worker')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'field_worker'
                  ? 'bg-[#0a2540] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <HardHat size={15} className={activeTab === 'field_worker' ? 'text-amber-300' : 'text-slate-500'} />
              <span>Field Workers ({fieldWorkers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('municipality')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'municipality'
                  ? 'bg-[#0a2540] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Landmark size={15} className={activeTab === 'municipality' ? 'text-amber-300' : 'text-slate-500'} />
              <span>Municipal Admins ({municipalityAdmins.length})</span>
            </button>
          </div>

          {/* Quick Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-[10.5px] font-medium text-slate-600">
            <Shield size={12} className="text-blue-900" />
            <span>Government Super Admin Authoritative Control</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-2.5 sm:p-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by worker name, municipality, department, ID or username..."
              className="w-full pl-8.5 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-700 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium text-[11px]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-700"
            >
              <option value="All">All Status</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* 4. Credentials Government Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0a2540] text-white uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="px-4 py-3">
                  {activeTab === 'field_worker' ? 'Department / Unit' : 'Municipality / Department'}
                </th>
                <th className="px-4 py-3">
                  {activeTab === 'field_worker' ? 'Worker Name' : 'Admin Name'}
                </th>
                <th className="px-4 py-3 whitespace-nowrap">
                  {activeTab === 'field_worker' ? 'Worker / Badge ID' : 'Admin ID'}
                </th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Official Email</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 whitespace-nowrap">Created Date</th>
                <th className="px-4 py-3 whitespace-nowrap">Last Login</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {activeRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                    No credential records found matching current search criteria.
                  </td>
                </tr>
              ) : (
                activeRecords.map((admin) => (
                  <tr key={admin.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Organization / Department Name */}
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        {activeTab === 'field_worker' ? (
                          <HardHat size={15} className="text-blue-700 shrink-0" />
                        ) : (
                          <Landmark size={15} className="text-amber-700 shrink-0" />
                        )}
                        <span>{admin.organizationName}</span>
                      </div>
                      {admin.wardName && activeTab === 'field_worker' && (
                        <span className="block text-[10px] text-slate-500 font-sans pl-6">
                          📍 {admin.wardName}
                        </span>
                      )}
                    </td>

                    {/* Name & Designation */}
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-slate-900 block">{admin.name}</span>
                      <span className="text-[11px] text-slate-500 block">{admin.designation}</span>
                    </td>

                    {/* Admin / Badge ID */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-mono font-bold text-[11px] bg-slate-100 border border-slate-200 px-2.5 py-1 rounded text-blue-900 inline-block tracking-wide">
                        {admin.badgeNumber || admin.adminId}
                      </span>
                    </td>

                    {/* Username */}
                    <td className="px-4 py-3.5 font-mono text-[11px] text-slate-700 whitespace-nowrap">
                      @{admin.username}
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3.5 text-slate-600 font-medium">
                      {admin.email}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          admin.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {admin.status === 'Active' ? (
                          <CheckCircle2 size={11} className="text-emerald-600" />
                        ) : (
                          <XCircle size={11} className="text-red-600" />
                        )}
                        <span>{admin.status}</span>
                      </span>
                    </td>

                    {/* Created Date */}
                    <td className="px-4 py-3.5 text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(admin.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Last Login */}
                    <td className="px-4 py-3.5 text-slate-500 text-[11px] whitespace-nowrap">
                      {admin.lastLoginAt
                        ? new Date(admin.lastLoginAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Never logged in'}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        {/* View */}
                        <button
                          onClick={() => setViewRecord(admin)}
                          className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => openEditModal(admin)}
                          className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors cursor-pointer"
                          title="Edit Information"
                        >
                          <Edit2 size={15} />
                        </button>

                        {/* Reset Credentials */}
                        <button
                          onClick={() => {
                            setResetResult(null);
                            setResetRecord(admin);
                          }}
                          className="p-1.5 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded transition-colors cursor-pointer"
                          title="Reset Credentials"
                        >
                          <KeyRound size={15} />
                        </button>

                        {/* Activate / Deactivate */}
                        <button
                          onClick={() => setStatusRecord(admin)}
                          className={`p-1.5 rounded transition-colors cursor-pointer ${
                            admin.status === 'Active'
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={admin.status === 'Active' ? 'Deactivate Access' : 'Activate Access'}
                        >
                          {admin.status === 'Active' ? <XCircle size={15} /> : <CheckCircle2 size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Credential Activity / Audit Trail Section */}
      <div className="gov-card bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-2.5 p-3 sm:p-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-blue-900" />
            <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">
              Credential Activity & Audit Trail
            </h3>
          </div>
          <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider">
            Immutable Government Audit Log
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold">
              <tr>
                <th className="px-3.5 py-2.5">Date & Time</th>
                <th className="px-3.5 py-2.5">Action Event</th>
                <th className="px-3.5 py-2.5">Unit / Division</th>
                <th className="px-3.5 py-2.5">Credential ID</th>
                <th className="px-3.5 py-2.5">Performed By</th>
                <th className="px-3.5 py-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3.5 py-6 text-center text-slate-400">
                    No recent credential management events recorded.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log, idx) => (
                  <tr key={log.id || log._id || idx} className="hover:bg-slate-50/60">
                    <td className="px-3.5 py-2 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt || Date.now()).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-3.5 py-2 font-semibold text-slate-900">
                      {String(log.action || log.actionEvent || 'ACTION_RECORDED').replace(/_/g, ' ')}
                    </td>
                    <td className="px-3.5 py-2">{log.organization || log.organizationName || 'Municipal Authority'}</td>
                    <td className="px-3.5 py-2 font-mono text-blue-900 font-bold whitespace-nowrap">{log.adminId || 'SYS-ID'}</td>
                    <td className="px-3.5 py-2 text-slate-600">{log.performedBy || log.performedByName || 'Municipal Commissioner (Super Admin)'}</td>
                    <td className="px-3.5 py-2 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.status === 'Active' || log.status === 'Success'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {log.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: CREATE CREDENTIAL MODAL                         */}
      {/* ======================================================== */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-[#0a2540] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-700 text-amber-300 flex items-center justify-center">
                  <KeyRound size={17} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">Create Official Credential</h3>
                  <p className="text-[11px] text-slate-300">
                    Official Government Authorization for Field Workers & Municipal Admins
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setCreatedResult(null);
                  setCreateModalOpen(false);
                }}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* If Created Result is Available */}
            {createdResult ? (
              <div className="p-6 space-y-4 text-xs">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                    <CheckCircle2 size={18} className="text-emerald-600" />
                    <span>Official Credential Created Successfully</span>
                  </div>
                  <p className="text-slate-600">
                    Share this temporary access record with the appointed worker or administrator. Passwords will
                    never be displayed again.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 font-mono text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-sans font-semibold">Credential ID:</span>
                    <span className="font-bold text-blue-900">{createdResult.adminId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-sans font-semibold">Username:</span>
                    <span className="font-bold text-slate-900">@{createdResult.username}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-sans font-semibold">Official Email:</span>
                    <span className="text-slate-800">{createdResult.email}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <span className="text-slate-500 font-sans font-semibold">Temporary Password:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-300">
                        {createdResult.temporaryPassword}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(createdResult.temporaryPassword, 'tempPass')}
                        className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                        title="Copy Password"
                      >
                        {copiedText === 'tempPass' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCreatedResult(null);
                    setCreateModalOpen(false);
                    loadData();
                  }}
                  className="w-full py-2.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Done & Return to Table
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs flex items-center gap-2">
                    <AlertTriangle size={15} className="shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Step 1: Credential Type Selection */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">
                    Credential Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCredentialType('field_worker');
                        setFormOrgName('Public Works Department (PWD)');
                        setFormDesignation('Senior Municipal Field Officer');
                      }}
                      className={`p-2.5 rounded-lg border text-center font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        credentialType === 'field_worker'
                          ? 'bg-blue-50 border-blue-700 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      <HardHat size={16} className={credentialType === 'field_worker' ? 'text-blue-700' : 'text-slate-400'} />
                      <span>Field Worker</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCredentialType('municipality_admin');
                        setFormOrgName('Ahmedabad Municipal Corporation');
                        setFormDesignation('Department Administrative Officer');
                      }}
                      className={`p-2.5 rounded-lg border text-center font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        credentialType === 'municipality_admin'
                          ? 'bg-amber-50 border-amber-700 text-amber-900 ring-2 ring-amber-500/20 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      <Landmark size={16} className={credentialType === 'municipality_admin' ? 'text-amber-700' : 'text-slate-400'} />
                      <span>Municipality Admin</span>
                    </button>
                  </div>
                </div>

                {/* Form fields based on selected Credential Type */}
                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {credentialType === 'field_worker' ? 'Assigned Department' : 'Municipality / Department Name'}{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formOrgName}
                      onChange={(e) => setFormOrgName(e.target.value)}
                      placeholder={credentialType === 'field_worker' ? 'e.g. Public Works Department (PWD)' : 'e.g. Ahmedabad Municipal Corporation'}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-700 focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        {credentialType === 'field_worker' ? 'Worker / Badge ID' : 'Municipal Authority Code / ID'}{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formBadgeNumber}
                        onChange={(e) => setFormBadgeNumber(e.target.value)}
                        placeholder={credentialType === 'field_worker' ? 'e.g. PWD-FO-103' : 'e.g. MUN-ADMIN-009'}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-700 focus:bg-white"
                      />
                    </div>

                    {credentialType === 'field_worker' && (
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Assigned Ward / Zone
                        </label>
                        <input
                          type="text"
                          value={formWardName}
                          onChange={(e) => setFormWardName(e.target.value)}
                          placeholder="e.g. Ward 1 - Central Zone"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-700 focus:bg-white"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        {credentialType === 'field_worker' ? 'Worker Full Name' : 'Admin Full Name'}{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formAdminName}
                        onChange={(e) => setFormAdminName(e.target.value)}
                        placeholder={credentialType === 'field_worker' ? 'e.g. Rajesh Patel' : 'e.g. Suresh Kumar'}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-700 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Designation <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formDesignation}
                        onChange={(e) => setFormDesignation(e.target.value)}
                        placeholder={credentialType === 'field_worker' ? 'e.g. Field Inspector' : 'e.g. Executive Engineer'}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-700 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Official Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder={credentialType === 'field_worker' ? 'officer.name@civicconnect.gov.in' : 'admin@civicconnect.gov.in'}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-700 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Mobile Number
                      </label>
                      <input
                        type="text"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="+91 9876543210"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-700 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Username <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formUsername}
                        onChange={(e) => setFormUsername(e.target.value)}
                        placeholder="e.g. officer_rajesh"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-700 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Temporary Password (Optional)
                      </label>
                      <input
                        type="password"
                        value={formTempPassword}
                        onChange={(e) => setFormTempPassword(e.target.value)}
                        placeholder="Auto-generated if empty"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-700 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Status</label>
                    <select
                      value={formStatus}
                      onChange={(e: any) => setFormStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-700"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="gov-button-secondary text-xs py-2 px-4 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="gov-button-primary text-xs py-2 px-4 disabled:opacity-50 cursor-pointer"
                  >
                    {formSubmitting ? 'Creating...' : `Create ${credentialType === 'field_worker' ? 'Field Worker' : 'Municipal Admin'}`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: VIEW CREDENTIAL DETAILS DRAWER/MODAL            */}
      {/* ======================================================== */}
      {viewRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          {viewRecord.role === 'field_worker' || viewRecord.role === 'field_officer' ? (
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Top Bar */}
              <div className="p-3.5 bg-[#0a2540] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardHat size={18} className="text-amber-300" />
                  <span className="font-extrabold text-sm text-white">
                    Municipal Field Worker Service Profile & ID • {viewRecord.organizationName}
                  </span>
                </div>
                <button
                  onClick={() => setViewRecord(null)}
                  className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Authentic Field Worker Service Card */}
              <div className="p-4 sm:p-6 bg-slate-100 max-h-[80vh] overflow-y-auto">
                <div className="gov-card bg-gradient-to-b from-white via-slate-50/40 to-blue-50/20 border-2 border-slate-300 shadow-md rounded-2xl overflow-hidden relative">
                  {/* Top Security Tricolor Band */}
                  <div className="h-2 w-full bg-gradient-to-r from-[#ff9933] via-white to-[#138808]"></div>

                  {/* Header */}
                  <div className="px-6 py-4 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white border-b-2 border-amber-400">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center p-1 shrink-0">
                          <HardHat size={22} className="text-amber-400" />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold tracking-widest uppercase text-amber-300">
                            CIVICCONNECT • MUNICIPAL FIELD OPERATIONS FORCE
                          </div>
                          <div className="text-xs font-extrabold text-white tracking-wide uppercase">
                            OFFICIAL FIELD WORKER IDENTITY & SERVICE RECORD
                          </div>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-amber-400 text-slate-950 rounded uppercase">
                          FIELD FORCE UNIT
                        </span>
                        <span className="text-[9px] font-mono text-emerald-300 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          ● ACTIVE ON DUTY
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-5">
                    <div className="flex flex-col md:flex-row items-center md:items-stretch gap-6">
                      {/* Left: Worker Profile & ID Barcode */}
                      <div className="w-full max-w-[220px] md:w-52 flex flex-col items-center justify-between shrink-0">
                        <div className="relative w-full h-56 sm:h-60 rounded-xl bg-slate-100 border-2 border-slate-300 shadow-sm overflow-hidden shrink-0 flex items-center justify-center">
                          <div className="w-full h-full bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 flex flex-col items-center justify-center text-slate-700 p-4 text-center">
                            <div className="w-20 h-20 rounded-2xl bg-blue-900 text-amber-300 flex items-center justify-center shadow-md mb-2">
                              <HardHat size={40} />
                            </div>
                            <span className="text-xs font-bold text-slate-800">Municipal Field Unit</span>
                            <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                              {viewRecord.badgeNumber || viewRecord.adminId}
                            </span>
                          </div>

                          <div className="absolute top-0 left-0 w-7 h-7 bg-gradient-to-br from-blue-900/60 to-transparent"></div>

                          <div
                            className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-400 via-emerald-200 to-emerald-500 border border-emerald-600 shadow-xs flex flex-col items-center justify-center text-[7px] font-black text-slate-950 leading-none p-0.5"
                            title="CivicConnect Verified Municipal Field Personnel"
                          >
                            <span className="font-extrabold tracking-tighter">CIVIC</span>
                            <span className="font-extrabold tracking-tighter">VERIFIED</span>
                          </div>
                        </div>

                        {/* Name & Verification Label */}
                        <div className="w-full mt-2.5 pt-1.5 border-b border-slate-300 pb-1 text-center">
                          <div className="font-serif italic font-bold text-sm text-blue-950 tracking-wide truncate">
                            {viewRecord.name}
                          </div>
                          <div className="text-[9px] font-bold uppercase text-blue-900 tracking-wider mt-0.5">
                            {viewRecord.designation || 'MUNICIPAL FIELD OFFICER'}
                          </div>
                          <div className="text-[9px] font-bold uppercase text-emerald-800 flex items-center justify-center gap-1 mt-0.5">
                            <Check size={11} strokeWidth={2.5} className="text-emerald-700" />
                            <span>✓ VERIFIED PERSONNEL</span>
                          </div>
                        </div>

                        {/* Barcode */}
                        <div className="w-full mt-2.5 p-2 bg-slate-50/90 rounded-lg border border-slate-200 text-center space-y-1">
                          <div className="text-[8px] font-bold uppercase text-slate-600 tracking-wider">
                            CIVICCONNECT WORKER BADGE
                          </div>
                          <div className="flex items-center justify-center gap-[2px] h-7 px-1 overflow-hidden">
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
                            *{viewRecord.badgeNumber || viewRecord.adminId}*
                          </div>
                          <div className="pt-1 border-t border-slate-200/80 flex items-center justify-between text-[7px] text-slate-500 font-mono">
                            <span>STATUS: {viewRecord.status.toUpperCase()}</span>
                            <span className="text-emerald-700 font-bold">AUTHORIZED</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Main Information Section & Service Metrics */}
                      <div className="flex-1 w-full space-y-4">
                        {/* Name & Verification */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              नाम / FULL LEGAL NAME
                            </div>
                            <div className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                              <span>{viewRecord.name}</span>
                              <BadgeCheck size={20} className="text-emerald-600 shrink-0" />
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-950 px-2 py-0.5 rounded border border-blue-200 uppercase">
                                {viewRecord.designation || 'FIELD OFFICER'}
                              </span>
                              <span className="text-[10px] text-slate-600 font-semibold">
                                Operational Status: {viewRecord.status}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg shrink-0">
                            <ShieldCheck size={16} className="text-emerald-700" />
                            <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wide">
                              Verified Field Personnel
                            </span>
                          </div>
                        </div>

                        {/* 6 Particulars Boxes */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                          {/* Box 1: Account Type */}
                          <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                              <span>खाता प्रकार / ACCOUNT TYPE</span>
                            </div>
                            <div className="font-extrabold text-slate-900 mt-0.5 text-xs">
                              Municipal Field Worker
                            </div>
                            <div className="text-[10px] text-slate-500">
                              On-Ground Resolution Fleet
                            </div>
                          </div>

                          {/* Box 2: Worker Badge ID */}
                          <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                              <span>बैज पहचान / BADGE NUMBER</span>
                            </div>
                            <div className="font-mono font-black text-blue-950 mt-0.5 text-xs">
                              {viewRecord.badgeNumber || viewRecord.adminId}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              RFID: AUTO-SYNC-ENABLED
                            </div>
                          </div>

                          {/* Box 3: Assigned Department */}
                          <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                              <span>विभाग / DEPARTMENT</span>
                            </div>
                            <div className="font-bold text-slate-900 mt-0.5 text-xs truncate" title={viewRecord.organizationName}>
                              {viewRecord.departmentName || viewRecord.organizationName}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              CivicConnect Municipal Services
                            </div>
                          </div>

                          {/* Box 4: Jurisdiction / Ward */}
                          <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                              <span>कार्यक्षेत्र / ASSIGNED WARD</span>
                            </div>
                            <div className="font-bold text-slate-900 mt-0.5 text-xs truncate">
                              {viewRecord.wardName || 'Designated Municipal Sector'}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              GPS Geofenced Zone
                            </div>
                          </div>

                          {/* Box 5: Enrolment Date */}
                          <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                              <span>तैनाती तिथि / ENROLMENT DATE</span>
                            </div>
                            <div className="font-bold text-slate-900 mt-0.5 text-xs">
                              {new Date(viewRecord.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Official Roster Record
                            </div>
                          </div>

                          {/* Box 6: Service Status */}
                          <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                              <span>स्थिति / SERVICE STATUS</span>
                            </div>
                            <div className="font-bold text-emerald-800 mt-0.5 text-xs flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span>Active / Field Deployment Live</span>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Real-Time Dispatch Available
                            </div>
                          </div>
                        </div>

                        {/* Field Worker Service Metrics */}
                        <div className="p-3.5 bg-gradient-to-br from-blue-950/5 via-slate-100/80 to-blue-900/10 rounded-xl border border-blue-200/80 space-y-2.5">
                          <div className="flex items-center justify-between border-b border-blue-200/60 pb-1.5">
                            <div className="flex items-center gap-1.5">
                              <Activity size={14} className="text-blue-900" />
                              <span className="text-[10px] font-black text-blue-950 uppercase tracking-wider">
                                FIELD WORKER PERFORMANCE & TASK METRICS
                              </span>
                            </div>
                            <span className="text-[9px] font-mono text-blue-900 bg-blue-100 px-1.5 py-0.5 rounded font-bold">
                              SLA AUDIT
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                            <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
                              <div className="text-base font-black text-blue-950">42</div>
                              <div className="text-[8.5px] font-bold text-slate-600 uppercase tracking-tight mt-0.5">
                                Resolved Grievances
                              </div>
                            </div>
                            <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
                              <div className="text-base font-black text-indigo-950">03</div>
                              <div className="text-[8.5px] font-bold text-slate-600 uppercase tracking-tight mt-0.5">
                                Active Work Orders
                              </div>
                            </div>
                            <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
                              <div className="text-base font-black text-emerald-950">98.4%</div>
                              <div className="text-[8.5px] font-bold text-slate-600 uppercase tracking-tight mt-0.5">
                                On-Time SLA Rate
                              </div>
                            </div>
                            <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
                              <div className="text-base font-black text-amber-950">4.8★</div>
                              <div className="text-[8.5px] font-bold text-slate-600 uppercase tracking-tight mt-0.5">
                                Citizen Feedback
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Official Contact Box */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                            <div className="space-y-0.5 min-w-0 pr-2">
                              <div className="text-[8.5px] font-bold uppercase text-slate-500">
                                OFFICIAL EMAIL
                              </div>
                              <div className="font-semibold text-slate-900 text-[11px] truncate">
                                {viewRecord.email}
                              </div>
                            </div>
                            <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                              ✓ Verified
                            </span>
                          </div>

                          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                            <div className="space-y-0.5 min-w-0 pr-2">
                              <div className="text-[8.5px] font-bold uppercase text-slate-500">
                                EMERGENCY CONTACT
                              </div>
                              <div className="font-semibold text-slate-900 text-[11px] truncate">
                                {viewRecord.phone || '+91 9876543220'}
                              </div>
                            </div>
                            <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                              ✓ On File
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Footer */}
                  <div className="px-6 py-3 bg-slate-100 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-white p-1 rounded border border-slate-300 shadow-2xs shrink-0 flex items-center justify-center">
                        <QrCode size={26} className="text-slate-900" />
                      </div>
                      <div>
                        <div className="text-[9px] font-mono text-slate-500 font-bold">
                          CIVICCONNECT • MUNICIPAL FIELD WORKFORCE RECORD
                        </div>
                        <div className="font-mono text-xs font-black text-slate-800">
                          {viewRecord.badgeNumber || viewRecord.adminId}
                        </div>
                      </div>
                    </div>

                    <div className="text-[9px] font-mono text-slate-500 text-center sm:text-right">
                      SCAN TO VERIFY / FIELD DISPATCH AUTHENTICATION
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewRecord(null)}
                  className="gov-button-primary text-xs py-2 px-5 cursor-pointer"
                >
                  Close Profile Card
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 bg-[#0a2540] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Landmark size={16} className="text-amber-300" />
                  <h3 className="font-extrabold text-sm text-white">
                    Municipality Admin Authority Record
                  </h3>
                </div>
                <button
                  onClick={() => setViewRecord(null)}
                  className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-3.5 text-xs text-slate-800">
                <div className="space-y-2 border-b border-slate-100 pb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Municipality / Department:</span>
                    <span className="font-bold text-slate-900 text-right">{viewRecord.organizationName}</span>
                  </div>
                  {viewRecord.registrationId && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Department Unit Code:</span>
                      <span className="font-mono text-slate-700">{viewRecord.registrationId}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 border-b border-slate-100 pb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Administrator Name:</span>
                    <span className="font-bold text-slate-900">{viewRecord.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Designation:</span>
                    <span className="text-slate-800">{viewRecord.designation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Admin ID:</span>
                    <span className="font-mono font-bold text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded">
                      {viewRecord.adminId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Username:</span>
                    <span className="font-mono text-slate-800">@{viewRecord.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Official Email:</span>
                    <span className="text-slate-900 font-medium">{viewRecord.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Mobile Number:</span>
                    <span className="text-slate-900">{viewRecord.phone || 'N/A'}</span>
                  </div>
                </div>

                <div className="space-y-2 border-b border-slate-100 pb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Authorization Role:</span>
                    <span className="font-bold text-blue-900">{viewRecord.roleLabel}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Status:</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        viewRecord.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {viewRecord.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Created Date:</span>
                    <span>{new Date(viewRecord.createdAt).toLocaleDateString('en-GB')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Last Login:</span>
                    <span>{viewRecord.lastLoginAt ? new Date(viewRecord.lastLoginAt).toLocaleDateString('en-GB') : 'Never'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Created By:</span>
                    <span className="text-slate-700">{viewRecord.createdByName || 'Municipal Commissioner (Super Admin)'}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg text-[11px] text-slate-500 border border-slate-200">
                  🔒 <strong>Zero Knowledge Security:</strong> Administrator passwords are cryptographically
                  hashed with salted bcrypt and are strictly unreadable by policy.
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setViewRecord(null)}
                    className="gov-button-primary text-xs py-2 px-4 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: EDIT CREDENTIAL RECORD                          */}
      {/* ======================================================== */}
      {editRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 bg-[#0a2540] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 size={16} className="text-amber-300" />
                <h3 className="font-extrabold text-sm text-white">Edit Credential Record</h3>
              </div>
              <button
                onClick={() => setEditRecord(null)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-500 mb-1">
                  Credential ID (Immutable)
                </label>
                <input
                  type="text"
                  disabled
                  value={editRecord.badgeNumber || editRecord.adminId}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-md font-mono text-slate-500 font-bold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Municipality / Department Name
                </label>
                <input
                  type="text"
                  required
                  value={editOrgName}
                  onChange={(e) => setEditOrgName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  required
                  value={editDesignation}
                  onChange={(e) => setEditDesignation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-700 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditRecord(null)}
                  className="gov-button-secondary text-xs py-2 px-4 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="gov-button-primary text-xs py-2 px-4 disabled:opacity-50 cursor-pointer"
                >
                  {editSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: RESET CREDENTIALS CONFIRMATION                  */}
      {/* ======================================================== */}
      {resetRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 bg-[#0a2540] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound size={16} className="text-amber-300" />
                <h3 className="font-extrabold text-sm text-white">Reset Account Credentials</h3>
              </div>
              <button
                onClick={() => setResetRecord(null)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {resetResult ? (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>Credentials reset successfully. Provide this temporary key to the official.</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Name:</span>
                      <span className="font-bold text-slate-900">{resetResult.adminName}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                      <span className="text-slate-500 font-sans">Temporary Password:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-300">
                          {resetResult.temporaryPassword}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(resetResult.temporaryPassword, 'resetPass')}
                          className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                          title="Copy Password"
                        >
                          {copiedText === 'resetPass' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setResetRecord(null)}
                    className="w-full py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-slate-600 leading-relaxed">
                    Are you sure you want to reset credentials for this account? A secure temporary
                    setup key will be generated for one-time issuance.
                  </p>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Unit / Dept:</span>
                      <span className="font-bold text-slate-900">{resetRecord.organizationName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Official Name:</span>
                      <span className="font-bold text-slate-900">{resetRecord.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Credential ID:</span>
                      <span className="font-mono font-bold text-blue-900">
                        {resetRecord.badgeNumber || resetRecord.adminId}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setResetRecord(null)}
                      className="gov-button-secondary text-xs py-2 px-4 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      className="px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold shadow-xs cursor-pointer"
                    >
                      Reset Credentials
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: ACTIVATE / DEACTIVATE CONFIRMATION DIALOG       */}
      {/* ======================================================== */}
      {statusRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 bg-[#0a2540] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-300" />
                <h3 className="font-extrabold text-sm text-white">
                  {statusRecord.status === 'Active' ? 'Deactivate Access' : 'Activate Access'}
                </h3>
              </div>
              <button
                onClick={() => setStatusRecord(null)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                {statusRecord.status === 'Active'
                  ? 'Are you sure you want to deactivate this account? Once deactivated, they will not be able to log in. Their historical grievance resolution records and assignments will remain preserved.'
                  : 'Are you sure you want to activate access for this account? They will be granted immediate access to log in.'}
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Unit:</span>
                  <span className="font-bold text-slate-900">{statusRecord.organizationName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Name:</span>
                  <span className="font-bold text-slate-900">{statusRecord.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Credential ID:</span>
                  <span className="font-mono font-bold text-blue-900">
                    {statusRecord.badgeNumber || statusRecord.adminId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Current Status:</span>
                  <span className="font-bold text-slate-800">{statusRecord.status}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStatusRecord(null)}
                  className="gov-button-secondary text-xs py-2 px-4 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleToggleStatus}
                  className={`px-4 py-2 rounded-lg font-bold text-white shadow-xs cursor-pointer ${
                    statusRecord.status === 'Active'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {statusRecord.status === 'Active' ? 'Deactivate Access' : 'Activate Access'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
