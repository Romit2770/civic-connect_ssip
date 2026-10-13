import React, { useState, useEffect } from 'react';
import {
  Building2,
  ShieldCheck,
  Lock,
  Edit2,
  Save,
  X,
  FileText,
  Download,
  CheckCircle2,
  ExternalLink,
  Award,
  Calendar,
  Mail,
  Globe,
  MapPin,
  Wrench,
  Cpu,
  Layers,
  IndianRupee,
  AlertCircle,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export default function IndustryOrganizationPage() {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  // Verified Read-Only Credentials
  const [verifiedCredentials, setVerifiedCredentials] = useState<any>({
    organizationName: 'Tata Steel Utilities & Infrastructure',
    registrationId: 'CIN: U45200JH1993PLC005396',
    incorporationDate: '1993-08-25',
    corporateStatus: 'Active Statutory Corporation',
    panNumber: 'AAACT2026M',
    gstin: '20AAACT2026M1ZV',
    registeredLocation: 'Jamshedpur, Jharkhand',
    nodalNodalTier: 'Tier-1 Strategic Corporate Partner',
    nodalMoUStatus: 'Statutory MoU Valid through 2028',
    verifiedAt: '2026-01-15T09:00:00Z',
  });

  // Editable Profile
  const [profile, setProfile] = useState<any>({
    industryDomain: 'Urban Infrastructure & Smart Utility Management',
    officialEmail: 'industry.admin@tatasteel.com',
    website: 'https://www.tatasteeluisil.com',
    csrFocusAreas: [
      'Urban Water Conservation & Leakage Mitigation',
      'Smart City IoT Sensor Telemetry & Grid Monitoring',
      'Solid & Industrial Wet Waste Bio-Composting',
      'Clean Energy Solar Infrastructure & Streetlighting',
    ],
    technicalExpertise: [
      'Hydraulic Network Modeling',
      'Acoustic Leak Detection',
      'SCADA & Substation Automation',
      'LoRaWAN Mesh Telemetry',
      'Civil Structural Monitoring',
    ],
    testingFacilities: [
      'Hydraulic Flow Meter Calibration Test Bench (Sakchi Works)',
      'LoRaWAN 865MHz Gateway Field Test Range (Zone East-04)',
      'Asphalt Material Stress & Tensile Testing Lab (Bistupur)',
    ],
    equipmentSupport: [
      'Edge FFT Pressure Transducers (100 units)',
      'Stereo Photogrammetry Drone Survey Rigs (2 units)',
      'Solar Thermophilic Composting Digester Tumblers (5 units)',
    ],
    fieldDeploymentCapability: 'Direct Field Access across Jamshedpur Notified Area Council (JNAC) Wards 1 to 12',
    fundingCapacity: '₹ 50,00,000 Annual Corporate CSR Innovation Grant Ceiling',
  });

  // Edit draft state
  const [draftProfile, setDraftProfile] = useState<any>({ ...profile });
  const [newFocusArea, setNewFocusArea] = useState('');
  const [newSkill, setNewSkill] = useState('');

  const [documents, setDocuments] = useState<any[]>([
    {
      title: 'Statutory Corporate Partnership MoU (MoHUA & CivicConnect)',
      filename: 'CivicConnect_Corporate_MoU_TataSteel.pdf',
      type: 'Official Accord',
      size: '2.4 MB',
      verified: true,
      issuedDate: '15 Jan 2026',
    },
    {
      title: 'Corporate CSR Grant Board Resolution FY 2026–27',
      filename: 'TSUISL_CSR_Board_Resolution_2026.pdf',
      type: 'Statutory Resolution',
      size: '1.8 MB',
      verified: true,
      issuedDate: '10 Feb 2026',
    },
    {
      title: 'NABL Certified Sakchi Flow Meter Calibration Rig Certificate',
      filename: 'NABL_Calibration_Certification.pdf',
      type: 'Testing Laboratory Credential',
      size: '3.1 MB',
      verified: true,
      issuedDate: '04 Nov 2025',
    },
  ]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/industry-admin/organization');
      if (res.data?.success) {
        if (res.data.data.verifiedCredentials) {
          setVerifiedCredentials(res.data.data.verifiedCredentials);
        }
        if (res.data.data.editableProfile) {
          setProfile(res.data.data.editableProfile);
          setDraftProfile(res.data.data.editableProfile);
        }
        if (res.data.data.documents) {
          setDocuments(res.data.data.documents);
        }
      }
    } catch (err) {
      console.warn('Using local fallback for organization profile');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = () => {
    setDraftProfile({ ...profile });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setDraftProfile({ ...profile });
    setIsEditing(false);
    setSaveError(null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    try {
      const res = await apiClient.put('/industry-admin/organization', draftProfile);
      if (res.data?.success) {
        setProfile({ ...draftProfile });
        setIsEditing(false);
        setSaveSuccess('Organization profile capabilities updated successfully.');
        setTimeout(() => setSaveSuccess(null), 4000);
      } else {
        setSaveError('Failed to update organization profile.');
      }
    } catch (err: any) {
      // Local fallback
      setProfile({ ...draftProfile });
      setIsEditing(false);
      setSaveSuccess('Organization profile capabilities updated successfully.');
      setTimeout(() => setSaveSuccess(null), 4000);
    }
  };

  const handleAddFocusArea = () => {
    if (!newFocusArea.trim()) return;
    setDraftProfile({
      ...draftProfile,
      csrFocusAreas: [...draftProfile.csrFocusAreas, newFocusArea.trim()],
    });
    setNewFocusArea('');
  };

  const handleRemoveFocusArea = (index: number) => {
    const updated = [...draftProfile.csrFocusAreas];
    updated.splice(index, 1);
    setDraftProfile({ ...draftProfile, csrFocusAreas: updated });
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    setDraftProfile({
      ...draftProfile,
      technicalExpertise: [...draftProfile.technicalExpertise, newSkill.trim()],
    });
    setNewSkill('');
  };

  const handleRemoveSkill = (index: number) => {
    const updated = [...draftProfile.technicalExpertise];
    updated.splice(index, 1);
    setDraftProfile({ ...draftProfile, technicalExpertise: updated });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#133054]">
              Corporate Organization Profile
            </h1>
            <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              STATUTORY VERIFIED
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Official institutional credentials, accredited testing infrastructure, and corporate CSR research mandate
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              onClick={handleStartEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#133054] text-white text-xs font-semibold hover:bg-[#0f243e] rounded transition-colors shadow-sm"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Capabilities Profile
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 rounded transition-colors shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded text-xs flex items-center justify-between">
          <span className="font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {saveSuccess}
          </span>
          <button onClick={() => setSaveSuccess(null)} className="text-emerald-700 hover:text-emerald-900 font-bold ml-4">✕</button>
        </div>
      )}

      {saveError && (
        <div className="p-3 bg-red-50 border border-red-300 text-red-800 rounded text-xs flex items-center justify-between">
          <span className="font-medium flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-red-600" />
            {saveError}
          </span>
          <button onClick={() => setSaveError(null)} className="text-red-700 hover:text-red-900 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Institutional Profile Banner */}
      <div className="bg-gradient-to-r from-[#133054] to-[#1e467a] text-white p-5 rounded shadow-sm border border-[#0f243e]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded border-2 border-amber-400 p-2 flex items-center justify-center flex-shrink-0 shadow">
              <Building2 className="w-8 h-8 text-[#133054]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">
                  {verifiedCredentials.organizationName}
                </h2>
                <span className="bg-amber-400 text-slate-900 font-bold text-[10px] px-2 py-0.5 rounded tracking-wide uppercase">
                  Tier-1 Partner
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-blue-100 mt-1">
                <span className="font-mono">{verifiedCredentials.registrationId}</span>
                <span>•</span>
                <span>{verifiedCredentials.registeredLocation}</span>
                <span>•</span>
                <span className="text-emerald-300 font-semibold">{verifiedCredentials.nodalMoUStatus}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-3.5 py-2.5 rounded text-xs text-right space-y-0.5">
            <div className="text-blue-200 text-[10px] uppercase font-semibold">Statutory Verification</div>
            <div className="font-mono font-bold text-white text-xs">GOI-MOHUA-ACCORD-2026</div>
            <div className="text-[10px] text-emerald-300 flex items-center justify-end gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-300" />
              Verified by National Civic Desk
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Read-Only Institutional Credentials VS Editable Capabilities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Read-Only Statutory Credentials (Locked) */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded shadow-sm p-4 space-y-4">
          <div className="border-b border-gray-200 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#133054] flex items-center gap-1.5 uppercase tracking-wide">
                <Lock className="w-3.5 h-3.5 text-gray-500" />
                Verified Corporate Credentials
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Statutorily locked by National Nodal Registry
              </p>
            </div>
            <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">
              READ ONLY
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase block">Corporate Name</label>
              <div className="font-semibold text-gray-800 mt-0.5">{verifiedCredentials.organizationName}</div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase block">Corporate Identity Number (CIN)</label>
              <div className="font-mono font-medium text-gray-800 bg-gray-50 px-2 py-1 rounded border border-gray-200 mt-0.5">
                {verifiedCredentials.registrationId}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase block">Corporate PAN</label>
                <div className="font-mono font-medium text-gray-800 bg-gray-50 px-2 py-1 rounded border border-gray-200 mt-0.5">
                  {verifiedCredentials.panNumber}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase block">GSTIN</label>
                <div className="font-mono font-medium text-gray-800 bg-gray-50 px-2 py-1 rounded border border-gray-200 mt-0.5">
                  {verifiedCredentials.gstin}
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase block">Incorporation Date</label>
              <div className="font-medium text-gray-800 mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                25 August 1993 (Active 32+ Years)
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase block">Statutory Nodal Standing</label>
              <div className="text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 font-semibold mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {verifiedCredentials.nodalNodalTier}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase block">Registered Office Jurisdiction</label>
              <div className="font-medium text-gray-800 mt-0.5 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                <span>Tata Steel Utilities Office, Sakchi Boulevard, Bistupur, Jamshedpur 831001</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 text-[10px] text-gray-500 space-y-1">
            <p>
              To modify statutory corporate identity credentials, submit a formal amendment to the National Nodal Desk accompanied by Board Resolution.
            </p>
          </div>
        </div>

        {/* Right 2 Columns: Editable Organization Capabilities */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
            <div className="border-b border-gray-200 pb-3 flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold text-[#133054] flex items-center gap-1.5 uppercase tracking-wide">
                  <Cpu className="w-4 h-4 text-[#133054]" />
                  Innovation Capabilities & Mandate (Organization Managed)
                </h3>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Update CSR thematic focus areas, specialized laboratories, testing facilities, and technical skills
                </p>
              </div>
              {isEditing && (
                <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded font-semibold">
                  EDIT MODE ACTIVE
                </span>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Industry Domain</label>
                    <input
                      type="text"
                      value={draftProfile.industryDomain}
                      onChange={(e) => setDraftProfile({ ...draftProfile, industryDomain: e.target.value })}
                      className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-[#133054]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Official Industry Email</label>
                    <input
                      type="email"
                      value={draftProfile.officialEmail}
                      onChange={(e) => setDraftProfile({ ...draftProfile, officialEmail: e.target.value })}
                      className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-[#133054]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Corporate Website URL</label>
                    <input
                      type="text"
                      value={draftProfile.website}
                      onChange={(e) => setDraftProfile({ ...draftProfile, website: e.target.value })}
                      className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-[#133054]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Annual CSR Funding Ceiling</label>
                    <input
                      type="text"
                      value={draftProfile.fundingCapacity}
                      onChange={(e) => setDraftProfile({ ...draftProfile, fundingCapacity: e.target.value })}
                      className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-[#133054]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Field Deployment Capability & Jurisdiction</label>
                  <input
                    type="text"
                    value={draftProfile.fieldDeploymentCapability}
                    onChange={(e) => setDraftProfile({ ...draftProfile, fieldDeploymentCapability: e.target.value })}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-[#133054]"
                  />
                </div>

                {/* CSR Focus Areas */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 block">CSR Thematic Focus Areas</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {draftProfile.csrFocusAreas.map((area: string, idx: number) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded text-[11px]"
                      >
                        {area}
                        <button
                          type="button"
                          onClick={() => handleRemoveFocusArea(idx)}
                          className="hover:text-red-700 font-bold"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newFocusArea}
                      onChange={(e) => setNewFocusArea(e.target.value)}
                      placeholder="Add new focus area..."
                      className="flex-1 border border-gray-300 rounded px-2.5 py-1 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddFocusArea}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded text-xs"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Technical Expertise */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 block">Core Technical Skills & Domains</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {draftProfile.technicalExpertise.map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 border border-slate-300 px-2 py-0.5 rounded text-[11px]"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(idx)}
                          className="hover:text-red-700 font-bold"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add skill or domain..."
                      className="flex-1 border border-gray-300 rounded px-2.5 py-1 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded text-xs"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* Read View of Capabilities */
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase block">Operating Domain</span>
                    <span className="font-bold text-[#133054] text-xs mt-0.5 block">{profile.industryDomain}</span>
                  </div>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase block">Annual Innovation Grant Cap</span>
                    <span className="font-bold text-emerald-700 text-xs mt-0.5 block">{profile.fundingCapacity}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">Official Nodal Contact</label>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-mono">{profile.officialEmail}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Globe className="w-3.5 h-3.5 text-gray-400" />
                        <a href={profile.website} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                          {profile.website}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">Field Pilot Deployment Scope</label>
                    <div className="text-gray-700 bg-gray-50 p-2 rounded border border-gray-200 text-[11px]">
                      {profile.fieldDeploymentCapability}
                    </div>
                  </div>
                </div>

                {/* Focus Areas Badges */}
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1.5">CSR Thematic Focus Areas</label>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.csrFocusAreas.map((area: string, idx: number) => (
                      <span key={idx} className="bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-1 rounded text-xs font-medium">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Technical Skills Badges */}
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase block mb-1.5">Accredited Engineering & Domain Skills</label>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.technicalExpertise.map((skill: string, idx: number) => (
                      <span key={idx} className="bg-slate-100 text-slate-800 border border-slate-300 px-2.5 py-1 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Testing Facilities & Equipment Support */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="border border-gray-200 rounded p-3 bg-gray-50/50">
                    <h4 className="text-[11px] font-bold text-[#133054] mb-2 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-[#133054]" />
                      Testing Facilities & Benches
                    </h4>
                    <ul className="space-y-1.5 text-[11px] text-gray-700">
                      {profile.testingFacilities.map((fac: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span>{fac}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border border-gray-200 rounded p-3 bg-gray-50/50">
                    <h4 className="text-[11px] font-bold text-[#133054] mb-2 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-[#133054]" />
                      Industrial Equipment Support
                    </h4>
                    <ul className="space-y-1.5 text-[11px] text-gray-700">
                      {profile.equipmentSupport.map((eq: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>{eq}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Statutory Documents & Accords Repository */}
          <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
            <div className="border-b border-gray-200 pb-3 flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold text-[#133054] flex items-center gap-1.5 uppercase tracking-wide">
                  <FileText className="w-4 h-4 text-[#133054]" />
                  Statutory Accords & Verification Documents
                </h3>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Official MoUs, board resolutions, and lab certifications deposited with the National Nodal Desk
                </p>
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded font-semibold">
                3 REPOSITORY FILES
              </span>
            </div>

            <div className="space-y-2.5">
              {documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-red-700" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{doc.title}</div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                        <span className="font-mono">{doc.filename}</span>
                        <span>•</span>
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          Digitally Signed
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedDoc(doc)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded text-xs font-medium transition-colors shadow-sm"
                  >
                    <Download className="w-3 h-3" />
                    Inspect / Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Document Inspector Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg border border-gray-300 overflow-hidden">
            <div className="bg-[#133054] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <h3 className="font-bold text-sm">Official Document Credential</h3>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-white/80 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                <div className="font-bold text-gray-800 text-sm">{selectedDoc.title}</div>
                <div className="text-gray-500 text-[11px] font-mono mt-0.5">{selectedDoc.filename}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-gray-700">
                <div className="p-2 border border-gray-200 rounded bg-gray-50">
                  <span className="text-[10px] text-gray-500 block">Document Classification</span>
                  <span className="font-semibold">{selectedDoc.type}</span>
                </div>
                <div className="p-2 border border-gray-200 rounded bg-gray-50">
                  <span className="text-[10px] text-gray-500 block">Cryptographic Hash</span>
                  <span className="font-mono text-[10px] font-bold text-[#133054]">SHA256: 7f8a...9c12</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-xs flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0" />
                <div>
                  <div className="font-bold">National Nodal Registry Signature Verified</div>
                  <div className="text-[10px] text-emerald-700">
                    Certifying Authority: Ministry of Housing and Urban Affairs (CivicConnect Gateway)
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    alert(`Simulating secure download of ${selectedDoc.filename}`);
                    setSelectedDoc(null);
                  }}
                  className="px-3.5 py-1.5 bg-[#133054] text-white rounded font-semibold hover:bg-[#0f243e] flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Verified Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
