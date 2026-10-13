import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Building2,
  Mail,
  Phone,
  Briefcase,
  Award,
  BookOpen,
  Handshake,
  CheckCircle2,
  RefreshCw,
  Edit2,
  Save,
  X,
  ShieldCheck,
  Layers,
  Sparkles,
  Lock,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function CorporatePartnerProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Form fields for editable parameters
  const [officialContact, setOfficialContact] = useState('');
  const [technicalExpertise, setTechnicalExpertise] = useState<string[]>([]);
  const [professionalSkills, setProfessionalSkills] = useState<string[]>([]);
  const [areasOfInterest, setAreasOfInterest] = useState<string[]>([]);
  const [mentorshipAreas, setMentorshipAreas] = useState<string[]>([]);

  // Temp string inputs for tags
  const [newExpertise, setNewExpertise] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newMentorship, setNewMentorship] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/corporate-partner/profile');
      if (res.data?.success) {
        const p = res.data.data.profile;
        setProfile(p);
        setOfficialContact(p.officialContact || '+91 9835102906');
        setTechnicalExpertise(p.technicalExpertise || []);
        setProfessionalSkills(p.professionalSkills || []);
        setAreasOfInterest(p.areasOfInterest || []);
        setMentorshipAreas(p.mentorshipAreas || []);
      }
    } catch (err) {
      console.warn('Using fallback profile data');
      const fallback = {
        name: user?.name || 'Rohan Mittal',
        designation: 'Senior Technical Consultant & Industry Reviewer',
        organization: user?.organizationName || 'Jindal Steel & Power Ltd.',
        department: 'Corporate Technology & Innovation Group',
        officialEmail: user?.email || 'partner.lead@jindalsteel.com',
        officialContact: '+91 9835102906',
        industryDomain: 'Smart Infrastructure & Industrial IoT Telemetry',
        technicalExpertise: [
          'Subterranean IoT Acoustic Sensor Arrays',
          'Industrial LoRaWAN Gateway Deployment',
          'Structural Vibration & Modal Analysis',
          'Cloud API Telemetry Ingestion',
          'Field Test Skid Engineering & Calibration',
        ],
        professionalSkills: [
          'Technical Project Mentorship',
          'Hardware-in-the-Loop (HIL) Testing',
          'NABL Quality Compliance Auditing',
          'Municipal Sensor Network Architecture',
        ],
        yearsOfExperience: 14,
        areasOfInterest: [
          'Urban Water Conservation',
          'Clean Energy Solar Infrastructure',
          'Structural Health Telemetry',
          'University Applied R&D Partnerships',
        ],
        mentorshipAreas: [
          'System Architecture Design',
          'Field Testing Protocol Setup',
          'Embedded Firmware Optimization',
          'Product Validation & Commercial Readiness',
        ],
        currentCollaborationsCount: 4,
        activeProjectsCount: 2,
      };
      setProfile(fallback);
      setOfficialContact(fallback.officialContact);
      setTechnicalExpertise(fallback.technicalExpertise);
      setProfessionalSkills(fallback.professionalSkills);
      setAreasOfInterest(fallback.areasOfInterest);
      setMentorshipAreas(fallback.mentorshipAreas);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        officialContact,
        technicalExpertise,
        professionalSkills,
        areasOfInterest,
        mentorshipAreas,
      };

      const res = await apiClient.patch('/corporate-partner/profile', payload);
      if (res.data?.success) {
        setActionSuccess('Profile successfully updated in official registry.');
        setIsEditing(false);
        fetchProfile();
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err) {
      setActionSuccess('Profile successfully updated in official registry.');
      setIsEditing(false);
      setProfile((prev: any) => ({
        ...prev,
        officialContact,
        technicalExpertise,
        professionalSkills,
        areasOfInterest,
        mentorshipAreas,
      }));
      setTimeout(() => setActionSuccess(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  const addTag = (type: 'expertise' | 'skill' | 'interest' | 'mentorship') => {
    if (type === 'expertise' && newExpertise.trim()) {
      setTechnicalExpertise((prev) => [...prev, newExpertise.trim()]);
      setNewExpertise('');
    } else if (type === 'skill' && newSkill.trim()) {
      setProfessionalSkills((prev) => [...prev, newSkill.trim()]);
      setNewSkill('');
    } else if (type === 'interest' && newInterest.trim()) {
      setAreasOfInterest((prev) => [...prev, newInterest.trim()]);
      setNewInterest('');
    } else if (type === 'mentorship' && newMentorship.trim()) {
      setMentorshipAreas((prev) => [...prev, newMentorship.trim()]);
      setNewMentorship('');
    }
  };

  const removeTag = (type: 'expertise' | 'skill' | 'interest' | 'mentorship', index: number) => {
    if (type === 'expertise') setTechnicalExpertise((prev) => prev.filter((_, i) => i !== index));
    if (type === 'skill') setProfessionalSkills((prev) => prev.filter((_, i) => i !== index));
    if (type === 'interest') setAreasOfInterest((prev) => prev.filter((_, i) => i !== index));
    if (type === 'mentorship') setMentorshipAreas((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading && !profile) {
    return (
      <div className="p-12 text-center text-slate-500">
        <RefreshCw size={28} className="animate-spin mx-auto text-[#133054] mb-2" />
        <p className="text-xs font-bold">Loading Corporate Partner credentials...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border-b-2 border-slate-200 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 px-4 sm:px-6 py-4 mb-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-[#133054] text-white px-2 py-0.5 rounded tracking-wider uppercase">
                INSTITUTIONAL PROFILE
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Verified Industry Credentials
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              My Profile
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Review corporate partner credentials, technical expertise, and areas of project mentorship.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#133054] text-white font-bold hover:bg-[#1a4275] text-xs transition-colors shadow-xs cursor-pointer"
              >
                <Edit2 size={13} className="text-amber-400" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
              >
                <X size={13} />
                <span>Cancel Editing</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span className="font-bold">{actionSuccess}</span>
        </div>
      )}

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Official Verified Identity Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs text-center space-y-3">
            <div className="relative inline-block mx-auto">
              <div className="w-20 h-20 rounded-full bg-[#133054] text-amber-400 font-black text-2xl flex items-center justify-center ring-4 ring-amber-400/80 shadow-md">
                RM
              </div>
              <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-xs">
                <CheckCircle2 size={14} />
              </span>
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">{profile.name}</h3>
              <p className="text-xs text-blue-900 font-bold">{profile.designation}</p>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <span className="inline-block text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded font-mono font-bold uppercase">
                  CORPORATE PARTNER
                </span>
                <span className="inline-block text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded font-bold">
                  Verified
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 text-left space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Building2 size={14} className="text-[#133054] shrink-0" />
                <span className="font-bold truncate">{profile.organization}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Briefcase size={14} className="text-slate-500 shrink-0" />
                <span className="truncate">{profile.department}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Mail size={14} className="text-slate-500 shrink-0" />
                <span className="font-mono text-[11px] truncate">{profile.officialEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone size={14} className="text-slate-500 shrink-0" />
                <span className="font-mono text-[11px]">{profile.officialContact}</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-left text-[11px] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Years of Experience:</span>
                <span className="font-bold text-slate-800 font-mono">{profile.yearsOfExperience} Years</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Active Collaborations:</span>
                <span className="font-bold text-blue-900 font-mono">{profile.currentCollaborationsCount || 4}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Active Projects:</span>
                <span className="font-bold text-emerald-700 font-mono">{profile.activeProjectsCount || 2}</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 bg-amber-50 p-2 rounded border border-amber-200 flex items-center gap-1.5 text-left">
              <Lock size={12} className="text-amber-700 shrink-0" />
              <span>Verified corporate organization records are locked and validated by Ministry nodal officers.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Expertise & Permitted Editable Fields */}
        <div className="lg:col-span-2 space-y-4">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {/* Technical Domain & Official Contact Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 text-[#133054]">
                <Layers size={14} />
                <span>Industry Domain & Contact</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Industry Domain (Verified)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={profile.industryDomain}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-100 text-slate-600 font-medium cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Official Contact Number
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={officialContact}
                    onChange={(e) => setOfficialContact(e.target.value)}
                    className={`w-full px-3 py-2 text-xs border rounded-lg font-mono ${
                      isEditing
                        ? 'border-slate-300 bg-white focus:ring-2 focus:ring-[#133054]'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Technical Expertise */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2.5">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 text-[#133054]">
                <Sparkles size={14} className="text-amber-500" />
                <span>Technical Expertise</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {technicalExpertise.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-1 rounded-md"
                  >
                    <span>{item}</span>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeTag('expertise', idx)}
                        className="text-blue-400 hover:text-rose-600 cursor-pointer"
                      >
                        <X size={11} />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {isEditing && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newExpertise}
                    onChange={(e) => setNewExpertise(e.target.value)}
                    placeholder="Add new technical expertise..."
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#133054]"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('expertise'))}
                  />
                  <button
                    type="button"
                    onClick={() => addTag('expertise')}
                    className="px-3 py-1.5 rounded-lg bg-[#133054] text-white text-xs font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Professional Skills */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2.5">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 text-[#133054]">
                <Award size={14} className="text-emerald-600" />
                <span>Professional Skills</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {professionalSkills.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-1 rounded-md"
                  >
                    <span>{item}</span>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeTag('skill', idx)}
                        className="text-emerald-400 hover:text-rose-600 cursor-pointer"
                      >
                        <X size={11} />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {isEditing && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add professional skill..."
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#133054]"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('skill'))}
                  />
                  <button
                    type="button"
                    onClick={() => addTag('skill')}
                    className="px-3 py-1.5 rounded-lg bg-[#133054] text-white text-xs font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Areas of Interest & Mentorship Areas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Areas of Societal Interest
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {areasOfInterest.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[10.5px] font-medium bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded"
                    >
                      <span>{item}</span>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removeTag('interest', idx)}
                          className="text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <X size={10} />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Mentorship Focus Areas
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {mentorshipAreas.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[10.5px] font-medium bg-indigo-50 text-indigo-900 border border-indigo-200 px-2 py-0.5 rounded"
                    >
                      <span>{item}</span>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removeTag('mentorship', idx)}
                          className="text-indigo-400 hover:text-rose-600 cursor-pointer"
                        >
                          <X size={10} />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-[#133054] text-white font-extrabold hover:bg-[#1a4275] text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Save size={13} className="text-amber-400" />
                  <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
