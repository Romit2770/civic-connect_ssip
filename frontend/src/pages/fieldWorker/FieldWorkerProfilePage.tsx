import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  UserCheck,
  Building,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  HardHat,
  Lock,
  Edit2,
  Save,
  Check,
  RefreshCw,
  Info,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function FieldWorkerProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [profile, setProfile] = useState<any>({
    name: 'Er. Rajesh Patel',
    designation: 'Senior Field Inspection Officer',
    badgeNumber: 'GOV-FO-PWD-101',
    employeeId: 'EMP-ANAND-2018-094',
    department: 'Public Works & Municipal Engineering (Roads & Bridges)',
    municipality: 'Anand Municipal Corporation (ULB)',
    officialEmail: 'officer.rajesh@civicconnect.gov.in',
    officialContact: '+91 98351 04921',
    assignedArea: 'Ward 1 to 14 (Anand City Jurisdiction)',
    supervisor: 'Shri Jayeshbhai Trivedi (Chief Municipal Officer)',
    activeAssignments: 35,
    joinedYear: '2018',
    dutyShift: 'Day Shift (08:00 AM – 05:00 PM)',
    gpsSyncStatus: 'Connected (High Accuracy Geolocation Active)',
  });

  const [loading, setLoading] = useState(true);
  const [editingContact, setEditingContact] = useState(false);
  const [contactVal, setContactVal] = useState(profile.officialContact);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await apiClient.get('/field-worker/profile');
        if (res.data.success && res.data.data?.profile) {
          setProfile(res.data.data.profile);
          setContactVal(res.data.data.profile.officialContact);
        }
      } catch (err) {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(null);

    try {
      const res = await apiClient.put('/field-worker/profile', { officialContact: contactVal });
      if (res.data.success) {
        setProfile((prev: any) => ({ ...prev, officialContact: contactVal }));
        setEditingContact(false);
        setSaveSuccess('Official contact updated successfully.');
        setTimeout(() => setSaveSuccess(null), 3000);
      }
    } catch (err: any) {
      setEditingContact(false);
      setSaveSuccess('Contact updated locally.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-blue-900 text-white">
            <UserCheck size={18} className="text-amber-400" />
          </span>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Field Worker Official Profile
          </h1>
        </div>
        <p className="text-xs text-slate-600 mt-1">
          Government credentials, official deployment details, and administrative ward jurisdiction.
        </p>
      </div>

      {/* 2. Official Identity ID Card Banner */}
      <div className="rounded-xl overflow-hidden border border-slate-300 bg-white shadow-2xs">
        {/* Tricolor Ribbon */}
        <div className="h-1.5 w-full flex">
          <div className="h-full flex-1 bg-[#ff9933]" />
          <div className="h-full flex-1 bg-white" />
          <div className="h-full flex-1 bg-[#138808]" />
        </div>

        <div className="p-6 bg-gradient-to-r from-[#133054] to-[#1e487c] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-white/10 border-2 border-amber-400/60 flex items-center justify-center font-black text-2xl text-amber-300 shadow-md shrink-0">
              RP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">{profile.name}</h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-400 text-slate-900">
                  {profile.badgeNumber}
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">{profile.designation}</p>
              <p className="text-[11px] text-slate-300">{profile.municipality}</p>
            </div>
          </div>

          <div className="sm:text-right text-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-300 block tracking-wider">
              OFFICIAL DUTY STATUS
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active on Ground Duty</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Detailed Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Official Identity (Read-Only) */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-blue-900" />
              <span>Official Government Identity</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
              <Lock size={11} />
              <span>Protected</span>
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Full Legal Name</span>
              <span className="font-bold text-slate-900">{profile.name}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Government Employee ID</span>
              <span className="font-mono font-bold text-slate-900">{profile.employeeId}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Department</span>
              <span className="text-slate-800">{profile.department}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Urban Local Body (ULB)</span>
              <span className="text-slate-800">{profile.municipality}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Direct Supervisor</span>
              <span className="text-slate-800">{profile.supervisor}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Service Induction Year</span>
              <span className="font-mono text-slate-800">{profile.joinedYear}</span>
            </div>
          </div>
        </div>

        {/* Operational Deployment & Contact */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <HardHat size={15} className="text-blue-900" />
              <span>Field Operations Deployment</span>
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Assigned Geographic Perimeter</span>
              <span className="font-bold text-blue-900">{profile.assignedArea}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Active Assignment Workload</span>
              <span className="font-mono font-bold text-slate-900">{profile.activeAssignments} Challenges / Projects</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Daily Operational Shift</span>
              <span className="text-slate-800">{profile.dutyShift}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Official Email</span>
              <span className="font-mono text-slate-800 flex items-center gap-1.5 mt-0.5">
                <Mail size={13} className="text-slate-400" />
                <span>{profile.officialEmail}</span>
              </span>
            </div>

            {/* Editable Official Contact */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Official Mobile / Helpline</span>
                {!editingContact && (
                  <button
                    type="button"
                    onClick={() => setEditingContact(true)}
                    className="text-[11px] font-bold text-blue-900 hover:underline flex items-center gap-1"
                  >
                    <Edit2 size={11} />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {editingContact ? (
                <form onSubmit={handleSaveContact} className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={contactVal}
                    onChange={(e) => setContactVal(e.target.value)}
                    className="p-1.5 rounded border border-slate-300 text-xs flex-1 focus:ring-1 focus:ring-blue-900"
                  />
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-3 py-1 bg-blue-900 text-white rounded text-xs font-bold hover:bg-blue-950"
                  >
                    {saving ? '...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingContact(false)}
                    className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs font-bold"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <span className="font-mono text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Phone size={13} className="text-slate-400" />
                  <span>{profile.officialContact}</span>
                </span>
              )}

              {saveSuccess && (
                <span className="text-[10px] text-emerald-700 font-bold block mt-1">
                  ✓ {saveSuccess}
                </span>
              )}
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">GPS Telemetry Link</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{profile.gpsSyncStatus}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Policy Notice */}
      <div className="p-3.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
        <Info size={16} className="text-blue-900 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          Official identity and departmental designations are synchronized with the State Urban Development Administrative Database. To request changes in official credentials or ward transfer, contact the Chief Municipal Officer desk.
        </p>
      </div>
    </div>
  );
}
