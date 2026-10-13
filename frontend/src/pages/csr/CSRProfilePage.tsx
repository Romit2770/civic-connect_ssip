import React, { useState, useEffect } from 'react';
import {
  User,
  Building,
  Mail,
  Phone,
  ShieldCheck,
  Edit2,
  Save,
  X,
  Award,
  Layers,
  GraduationCap,
  Calendar,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Hash,
  Briefcase,
  IndianRupee,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export default function CSRProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>({
    name: 'Meera Chawla',
    role: 'CSR & Project Lead',
    organization: 'Tata Steel Utilities & Infrastructure Services Ltd.',
    department: 'CSR & Innovation Division',
    officialEmail: 'csr.lead@tata.com',
    contact: '+91 657 664 2100',
    cinNumber: 'U45200JH1993PLC005396',
    csrRegistrationNumber: 'CSR00018492',
    annualBudgetPool: 25000000,
    csrDomains: [
      'Water & Sanitation',
      'Smart Infrastructure & Road Safety',
      'Waste Management & Circular Economy',
      'Urban Energy & Solar',
    ],
    areasOfExpertise: [
      'CSR Grant Administration & Schedule VII Audit',
      'University-Industry Joint R&D Governance',
      'Public Utility Infrastructure Upgradation',
      'Social Return on Investment (SROI) Measurement',
      'Public-Private Partnership (PPP) Milestone Auditing',
    ],
    industryPartnerships: [
      'National Institute of Technology (NIT), Jamshedpur',
      'Indian Institute of Technology (ISM), Dhanbad',
      'Ministry of Education (MoE) SIH Ecosystem',
      'Jamshedpur Notified Area Committee (JNAC)',
    ],
    activeProjectsCount: 7,
    completedProjectsCount: 5,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editContact, setEditContact] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/csr/profile');
      if (res.data?.success) {
        setProfile(res.data.data.profile);
        setEditContact(res.data.data.profile.contact || '');
      }
    } catch (err) {
      console.error('Error fetching CSR profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const res = await apiClient.patch('/csr/profile', {
        contactNumber: editContact,
      });
      if (res.data?.success) {
        setProfile((prev: any) => ({ ...prev, contact: editContact }));
        setIsEditing(false);
        setSaveSuccess('Contact details successfully updated in official registry.');
        setTimeout(() => setSaveSuccess(''), 4000);
      } else {
        setSaveError(res.data?.error?.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      setSaveError(err.response?.data?.error?.message || 'Error updating profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
              Verified Institutional Signatory
            </span>
            <span className="text-xs text-slate-500 font-medium">MCA CSR Registration # CSR00018492</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">CSR Project Lead Profile</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional credentials, organization hierarchy, statutory compliance records, and university partnership authorizations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchProfile}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {!isEditing ? (
            <button
              onClick={() => {
                setEditContact(profile.contact);
                setIsEditing(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-semibold text-white bg-[#133054] hover:bg-[#0e233e] transition shadow-sm"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Profile
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded text-xs font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm"
              >
                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}
      {saveError && (
        <div className="p-3 bg-red-50 border border-red-300 text-red-900 rounded text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-[#133054] text-white p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 text-[#133054] font-black text-xl flex items-center justify-center border-2 border-white shadow">
                MC
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{profile.name}</h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-200 border border-emerald-400/40">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Official
                  </span>
                </div>
                <div className="text-xs text-blue-200 font-semibold mt-0.5">{profile.role}</div>
                <div className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  <span>{profile.organization}</span>
                  <span>•</span>
                  <span>{profile.department}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/15 text-xs text-right space-y-1">
              <div className="text-blue-200 text-[10px] uppercase font-bold tracking-wider">
                Corporate Identification Number
              </div>
              <div className="font-mono font-bold text-white text-xs">{profile.cinNumber}</div>
              <div className="text-[10px] text-emerald-300 font-medium">MCA Section 135 Compliant</div>
            </div>
          </div>
        </div>

        {/* Core Credentials Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50/50 border-b border-slate-200 text-xs">
          <div>
            <div className="text-slate-500 text-[10px] uppercase font-bold">Official Email</div>
            <div className="font-semibold text-slate-900 mt-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-700" />
              <span>{profile.officialEmail}</span>
            </div>
          </div>

          <div>
            <div className="text-slate-500 text-[10px] uppercase font-bold">Contact Number</div>
            {isEditing ? (
              <input
                type="text"
                value={editContact}
                onChange={(e) => setEditContact(e.target.value)}
                className="mt-1 w-full border border-slate-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-[#133054] focus:outline-none bg-white"
              />
            ) : (
              <div className="font-semibold text-slate-900 mt-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-700" />
                <span>{profile.contact}</span>
              </div>
            )}
          </div>

          <div>
            <div className="text-slate-500 text-[10px] uppercase font-bold">Annual CSR Budget Pool</div>
            <div className="font-bold text-emerald-700 mt-1 flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5" />
              <span>₹ {(profile.annualBudgetPool / 10000000).toFixed(2)} Crores (FY 26-27)</span>
            </div>
          </div>

          <div>
            <div className="text-slate-500 text-[10px] uppercase font-bold">Initiatives Under Oversight</div>
            <div className="font-bold text-slate-900 mt-1">
              <span className="text-blue-900 font-black">{profile.activeProjectsCount} Active</span>
              <span className="text-slate-400 mx-1">|</span>
              <span className="text-emerald-700">{profile.completedProjectsCount} Completed</span>
            </div>
          </div>
        </div>

        {/* Detailed Sections (Section 25) */}
        <div className="p-6 space-y-6 text-xs">
          {/* CSR Domains */}
          <div>
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#133054]" />
              Authorized CSR Mandate Domains (Companies Act Schedule VII)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {profile.csrDomains.map((domain: string, idx: number) => (
                <div
                  key={idx}
                  className="p-3 bg-white border border-slate-200 rounded flex items-center gap-2.5 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="font-semibold text-slate-800">{domain}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Areas of Expertise */}
          <div>
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#133054]" />
              Technical & Administrative Expertise
            </h3>
            <div className="space-y-2">
              {profile.areasOfExpertise.map((exp: string, idx: number) => (
                <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-700" />
                  <span className="text-slate-700 font-medium">{exp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Industry & Academic Partnerships */}
          <div>
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-3 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#133054]" />
              Active University Partnerships & Institutional MoUs
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profile.industryPartnerships.map((partner: string, idx: number) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded flex items-start gap-2.5">
                  <Building className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-slate-900">{partner}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Formal MoU Active • Tier-1 Research Collaboration
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
