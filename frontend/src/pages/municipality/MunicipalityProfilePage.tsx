import React, { useState, useEffect } from 'react';
import {
  Landmark,
  ShieldCheck,
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  Users,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Lock,
  Edit3,
  Save,
} from 'lucide-react';
import { apiClient, getErrorMessage } from '../../api/client';

export default function MunicipalityProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  // Editable fields state
  const [officialEmail, setOfficialEmail] = useState('');
  const [officialContact, setOfficialContact] = useState('');
  const [controlRoomHelpline, setControlRoomHelpline] = useState('');
  const [website, setWebsite] = useState('');
  const [authorizedOfficer, setAuthorizedOfficer] = useState('');
  const [officerDesignation, setOfficerDesignation] = useState('');
  const [headquartersAddress, setHeadquartersAddress] = useState('');

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/municipality/profile');
      if (res.data.success) {
        const d = res.data.data;
        setProfile(d);
        setOfficialEmail(d.officialEmail || '');
        setOfficialContact(d.officialContact || '');
        setControlRoomHelpline(d.controlRoomHelpline || '');
        setWebsite(d.website || '');
        setAuthorizedOfficer(d.authorizedOfficer || '');
        setOfficerDesignation(d.officerDesignation || '');
        setHeadquartersAddress(d.headquartersAddress || '');
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await apiClient.put('/municipality/profile', {
        officialEmail,
        officialContact,
        controlRoomHelpline,
        website,
        authorizedOfficer,
        officerDesignation,
        headquartersAddress,
      });

      if (res.data.success) {
        setSuccess('Administrative contact details successfully updated');
        setProfile(res.data.data);
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide bg-blue-900 text-white font-mono">
              ULB REGISTRY
            </span>
            <span className="text-xs text-slate-500 font-semibold">Government Institutional Identity</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Municipality Profile
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Official administrative credentials, verified jurisdictional boundaries, and emergency civic communication endpoints.
          </p>
        </div>

        <button
          onClick={loadProfile}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin text-blue-600' : 'text-slate-500'} />
          <span>Reload Registry</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={loadProfile} className="underline font-bold cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {profile && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: VERIFIED STATUTORY INFORMATION (LOCKED) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-lg bg-white border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-950 font-extrabold text-xs uppercase tracking-wider">
                  <Lock size={14} className="text-slate-500" />
                  <span>Verified Statutory Information</span>
                </div>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[9.5px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  <ShieldCheck size={11} className="text-emerald-700" />
                  <span>State Gazetted Record</span>
                </span>
              </div>

              <div className="p-4 space-y-3.5 text-xs text-slate-800 divide-y divide-slate-100">
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Municipality Name</span>
                  <p className="font-extrabold text-sm text-slate-900 mt-0.5">{profile.municipalityName}</p>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Municipality Type & Classification</span>
                  <p className="font-semibold text-xs text-slate-800 mt-0.5">{profile.municipalityType}</p>
                </div>

                <div className="pt-2 grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">District & State</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{profile.district}, {profile.state}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">PIN Code</span>
                    <p className="font-mono font-semibold text-slate-800 mt-0.5">{profile.pinCode}</p>
                  </div>
                </div>

                <div className="pt-2 grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Administrative Area</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{profile.administrativeArea}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Official Wards Count</span>
                    <p className="font-mono font-bold text-blue-900 mt-0.5">{profile.totalWards} Wards</p>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Registered Census Population</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{profile.registeredPopulation}</p>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Authorized Municipal Civic Departments ({profile.departments?.length || 8})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                    {profile.departments?.map((dept: string) => (
                      <div key={dept} className="p-1.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-700 font-medium">
                        • {dept}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Verification & Audit Status</span>
                  <p className="text-[11px] text-emerald-800 font-bold mt-0.5">{profile.verifiedStatus}</p>
                  <p className="text-[10px] text-slate-500">{profile.auditCycle}</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: EDITABLE ADMINISTRATIVE INFORMATION */}
          <div className="lg:col-span-6 space-y-4">
            <form onSubmit={handleSaveProfile} className="rounded-lg bg-white border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-950 font-extrabold text-xs uppercase tracking-wider">
                  <Edit3 size={14} className="text-blue-900" />
                  <span>Editable Administrative Information</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Operational Desk Updates</span>
              </div>

              <div className="p-5 space-y-3.5 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                    Authorized Officer / Executive Head
                  </label>
                  <input
                    type="text"
                    value={authorizedOfficer}
                    onChange={(e) => setAuthorizedOfficer(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs font-semibold text-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                    Officer Designation
                  </label>
                  <input
                    type="text"
                    value={officerDesignation}
                    onChange={(e) => setOfficerDesignation(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs text-slate-800 bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                      Official E-Governance Email
                    </label>
                    <input
                      type="email"
                      value={officialEmail}
                      onChange={(e) => setOfficialEmail(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded text-xs text-slate-800 bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                      Official Contact Phone
                    </label>
                    <input
                      type="text"
                      value={officialContact}
                      onChange={(e) => setOfficialContact(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded text-xs text-slate-800 bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                      24x7 Control Room Helpline
                    </label>
                    <input
                      type="text"
                      value={controlRoomHelpline}
                      onChange={(e) => setControlRoomHelpline(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded text-xs text-slate-800 bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                      Official Municipal Portal URL
                    </label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded text-xs text-slate-800 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                    Municipal Headquarters Physical Address
                  </label>
                  <textarea
                    rows={3}
                    value={headquartersAddress}
                    onChange={(e) => setHeadquartersAddress(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs text-slate-800 bg-white"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    Modifications will reflect immediately across all public notices and PDF reports.
                  </span>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save size={13} />
                    <span>{saving ? 'Updating...' : 'Save Profile Changes'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
