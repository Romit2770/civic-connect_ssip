import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Target,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MapPin,
  FileText,
  Clock,
  Send,
  Building,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  X,
  Check,
  AlertCircle,
  HardHat,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import { apiClient, getErrorMessage } from '../../api/client';
import { useSocket } from '../../context/SocketContext';

export default function MunicipalityChallengesPage() {
  const { socket } = useSocket();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>('All');
  const [challenges, setChallenges] = useState<any[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  // Selected Challenge Modal state
  const [selectedChallenge, setSelectedChallenge] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [validationRemarks, setValidationRemarks] = useState('');
  const [assignedDepartment, setAssignedDepartment] = useState('');
  const [validationSuccess, setValidationSuccess] = useState<string | null>(null);

  // Field Worker Allocation state
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [workerInstructions, setWorkerInstructions] = useState('');
  const [allocateSuccess, setAllocateSuccess] = useState<string | null>(null);
  const [fieldWorkersList, setFieldWorkersList] = useState<any[]>([]);

  // Inter-authority escalation modal
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [targetAuthority, setTargetAuthority] = useState('Nadiad Nagar Palika / Gujarat Urban Development Authority');
  const [escalationNotes, setEscalationNotes] = useState('');

  const tabs = [
    'All',
    'New',
    'Pending Validation',
    'Verified',
    'Rejected',
    'Assigned',
    'In Progress',
    'Resolved',
  ];

  // Fetch live field workers
  useEffect(() => {
    async function loadWorkers() {
      try {
        const res = await apiClient.get('/municipality/field-workers');
        if (res.data.success && Array.isArray(res.data.data)) {
          setFieldWorkersList(res.data.data);
          if (res.data.data.length > 0) {
            setSelectedWorkerId(res.data.data[0].id || res.data.data[0]._id);
          }
        }
      } catch (err) {
        console.error('Error fetching field workers:', err);
      }
    }
    loadWorkers();
  }, []);

  const fetchChallenges = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `/municipality/challenges?tab=${encodeURIComponent(activeTab)}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (selectedCategory) url += `&category=${encodeURIComponent(selectedCategory)}`;
      if (selectedWard) url += `&ward=${encodeURIComponent(selectedWard)}`;
      if (selectedPriority) url += `&priority=${encodeURIComponent(selectedPriority)}`;
      if (selectedDepartment) url += `&department=${encodeURIComponent(selectedDepartment)}`;

      const res = await apiClient.get(url);
      if (res.data.success) {
        setChallenges(res.data.data.challenges || []);
        if (res.data.data.departments) setDepartments(res.data.data.departments);
        if (res.data.data.wards) setWards(res.data.data.wards);

        // Auto select if query param exists
        const initialSelectedId = searchParams.get('selected');
        if (initialSelectedId) {
          const matched = (res.data.data.challenges || []).find(
            (c: any) => c.challengeId === initialSelectedId || c.id === initialSelectedId || c._id === initialSelectedId
          );
          if (matched) {
            handleOpenModal(matched);
          } else {
            // Direct fetch from API to ensure case file opens regardless of tab
            apiClient.get(`/municipality/challenges/${initialSelectedId}`)
              .then((directRes) => {
                if (directRes.data.success && directRes.data.data) {
                  handleOpenModal(directRes.data.data);
                }
              })
              .catch((err) => console.warn('Could not auto-load selected challenge:', err));
          }
        }
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [activeTab, selectedCategory, selectedWard, selectedPriority, selectedDepartment]);

  // Real-time Socket.IO listener for live updates
  useEffect(() => {
    if (!socket) return;
    const handleLiveEvent = () => {
      fetchChallenges();
    };

    socket.on('complaint:new', handleLiveEvent);
    socket.on('complaint:created', handleLiveEvent);
    socket.on('complaint:status_changed', handleLiveEvent);
    socket.on('complaint:assigned', handleLiveEvent);
    socket.on('complaint:resolution_submitted', handleLiveEvent);

    return () => {
      socket.off('complaint:new', handleLiveEvent);
      socket.off('complaint:created', handleLiveEvent);
      socket.off('complaint:status_changed', handleLiveEvent);
      socket.off('complaint:assigned', handleLiveEvent);
      socket.off('complaint:resolution_submitted', handleLiveEvent);
    };
  }, [socket, activeTab]);

  const handleOpenModal = async (challenge: any) => {
    setSelectedChallenge(challenge);
    setValidationRemarks(challenge.municipalValidation?.remarks || '');
    setAssignedDepartment(
      challenge.department && challenge.department !== 'Not Assigned'
        ? challenge.department
        : (departments[0] || 'Public Works Department')
    );
    setWorkerInstructions(
      challenge.assignment?.instructions ||
      `Urgent resolution mandated for "${challenge.problem || challenge.title}". Conduct on-site inspection and capture live geotagged proof.`
    );
    setValidationSuccess(null);
    setAllocateSuccess(null);

    // Fetch full case file with complete timeline & assignment history
    try {
      const res = await apiClient.get(`/municipality/challenges/${challenge.id}`);
      if (res.data.success && res.data.data) {
        setSelectedChallenge(res.data.data);
        if (res.data.data.department && res.data.data.department !== 'Not Assigned') {
          setAssignedDepartment(res.data.data.department);
        }
      }
    } catch (err) {
      console.warn('Could not fetch full dossier:', err);
    }
  };

  const handleCloseModal = () => {
    setSelectedChallenge(null);
    setValidationSuccess(null);
    setAllocateSuccess(null);
    setShowEscalationModal(false);
  };

  const handleAssignDepartment = async () => {
    if (!selectedChallenge) return;
    if (!assignedDepartment || assignedDepartment === 'Not Assigned') {
      alert('Please select an authorized municipal department to assign.');
      return;
    }

    setActionLoading(true);
    setValidationSuccess(null);
    try {
      const res = await apiClient.post(`/municipality/challenges/${selectedChallenge.id}/validate`, {
        decision: 'Department Assigned',
        department: assignedDepartment,
        remarks: validationRemarks || `Municipal Administration assigned department: ${assignedDepartment}.`,
      });

      if (res.data.success) {
        setValidationSuccess(`Department assigned: ${assignedDepartment}. Status updated to VALIDATED.`);
        try {
          const fresh = await apiClient.get(`/municipality/challenges/${selectedChallenge.id}`);
          if (fresh.data.success && fresh.data.data) {
            setSelectedChallenge(fresh.data.data);
          }
        } catch {
          setSelectedChallenge((prev: any) => ({ ...prev, department: assignedDepartment, status: 'validated' }));
        }
        fetchChallenges();
      }
    } catch (err: any) {
      alert(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleAllocateToFieldWorker = async () => {
    if (!selectedChallenge) return;
    const worker = fieldWorkersList.find((w) => w.id === selectedWorkerId || w._id === selectedWorkerId) || fieldWorkersList[0];
    if (!worker) {
      alert('Please select a field worker from the list.');
      return;
    }

    setActionLoading(true);
    setAllocateSuccess(null);
    try {
      const res = await apiClient.post(`/municipality/challenges/${selectedChallenge.id}/allocate`, {
        workerId: worker.id || worker._id,
        workerName: worker.name,
        department: worker.department || assignedDepartment,
        instructions:
          workerInstructions ||
          `Urgent resolution mandated for "${selectedChallenge.problem || selectedChallenge.title}". Conduct on-site inspection and capture live geotagged proof.`,
      });

      if (res.data.success) {
        setAllocateSuccess(`Assigned to ${worker.name} (${worker.badgeNumber || worker.badge || 'FW'}). Complaint status updated to ASSIGNED.`);
        // Reload fresh case file
        try {
          const fresh = await apiClient.get(`/municipality/challenges/${selectedChallenge.id}`);
          if (fresh.data.success && fresh.data.data) {
            setSelectedChallenge(fresh.data.data);
          }
        } catch (e) {
          setSelectedChallenge(res.data.data);
        }
        fetchChallenges();
      }
    } catch (err: any) {
      alert(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleValidateChallenge = async (decision: string) => {
    if (!selectedChallenge) return;
    if (decision !== 'Department Assigned' && (!validationRemarks || validationRemarks.trim().length < 5)) {
      alert('Formal municipal remarks (minimum 5 characters) are required for audit compliance.');
      return;
    }

    setActionLoading(true);
    setValidationSuccess(null);
    try {
      const res = await apiClient.post(`/municipality/challenges/${selectedChallenge.id}/validate`, {
        decision,
        department: assignedDepartment,
        remarks: validationRemarks || `Administrative decision recorded: ${decision}`,
      });

      if (res.data.success) {
        setValidationSuccess(`Challenge successfully updated with decision: ${decision}`);
        try {
          const fresh = await apiClient.get(`/municipality/challenges/${selectedChallenge.id}`);
          if (fresh.data.success && fresh.data.data) {
            setSelectedChallenge(fresh.data.data);
          }
        } catch {
          setSelectedChallenge(res.data.data);
        }
        // Refresh challenge list in background
        fetchChallenges();
      }
    } catch (err: any) {
      alert(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleForwardOutsideJurisdiction = async () => {
    if (!selectedChallenge) return;
    setActionLoading(true);
    try {
      const res = await apiClient.post(`/municipality/challenges/${selectedChallenge.id}/forward`, {
        targetAuthority,
        escalationNotes,
      });

      if (res.data.success) {
        setValidationSuccess(`Challenge formally forwarded to ${targetAuthority}`);
        setSelectedChallenge(res.data.data);
        setShowEscalationModal(false);
        fetchChallenges();
      }
    } catch (err: any) {
      alert(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const rawStatus = (selectedChallenge?.status || '').toLowerCase();
  const statusDisplay = (
    rawStatus === 'submitted' ? 'New' :
    rawStatus === 'validated' ? 'Validated' :
    rawStatus === 'assigned' ? 'Assigned' :
    rawStatus === 'in_progress' ? 'In Progress' :
    rawStatus === 'resolution_submitted' ? 'Resolution Submitted' :
    rawStatus === 'verification_pending' ? 'Verification Pending' :
    (rawStatus === 'resolved' || rawStatus === 'closed') ? 'Resolved' :
    rawStatus === 'rejected' ? 'Rejected' :
    (selectedChallenge?.validationStatus || 'New')
  );

  const hasDepartment = Boolean(
    selectedChallenge?.department &&
    selectedChallenge.department !== 'Not Assigned' &&
    selectedChallenge.department !== 'null' &&
    selectedChallenge.department !== 'undefined'
  );

  const hasFieldWorker = Boolean(
    selectedChallenge?.assignedOfficer &&
    selectedChallenge.assignedOfficer.name &&
    selectedChallenge.assignedOfficer.name !== 'Not Assigned'
  );

  const isWorkStarted = ['in_progress', 'resolution_submitted', 'verification_pending', 'resolved', 'closed'].includes(rawStatus);

  const resolutionPhotos = (selectedChallenge?.resolutionEvidence?.photos && Array.isArray(selectedChallenge.resolutionEvidence.photos))
    ? selectedChallenge.resolutionEvidence.photos.filter((p: string) => p && typeof p === 'string' && !p.includes('unsplash.com'))
    : (selectedChallenge?.resolutionEvidence?.photo && !selectedChallenge.resolutionEvidence.photo.includes('unsplash.com')
        ? [selectedChallenge.resolutionEvidence.photo]
        : []);

  const resolutionVideos = (selectedChallenge?.resolutionEvidence?.videos && Array.isArray(selectedChallenge.resolutionEvidence.videos))
    ? selectedChallenge.resolutionEvidence.videos.filter((v: string) => v && typeof v === 'string')
    : [];

  const hasRealResolution = Boolean(
    selectedChallenge?.resolutionEvidence &&
    (resolutionPhotos.length > 0 || resolutionVideos.length > 0 || (selectedChallenge.resolutionEvidence.description && selectedChallenge.resolutionEvidence.description.trim().length > 0)) &&
    ['resolution_submitted', 'verification_pending', 'resolved', 'closed'].includes(rawStatus)
  );

  const isResolved = ['resolved', 'closed'].includes(rawStatus) || selectedChallenge?.validationStatus === 'Resolved';

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide bg-blue-900 text-white font-mono">
              CIVIC GRIEVANCES
            </span>
            <span className="text-xs text-slate-500 font-semibold">Triage & Administrative Review</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Challenge Management
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Review and manage civic challenges reported within Anand Municipality jurisdiction.
          </p>
        </div>

        <button
          onClick={fetchChallenges}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin text-blue-600' : 'text-slate-500'} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-px">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
              activeTab === tab
                ? 'border-blue-900 text-blue-900 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3. Filters Toolbar */}
      <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search problem, ID, ward, or street..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchChallenges()}
              className="w-full pl-8 pr-3 py-1.5 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-900 text-xs text-slate-800"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-900 text-xs text-slate-800"
          >
            <option value="">All Categories</option>
            <option value="Water & Sanitation">Water & Sanitation</option>
            <option value="Solid Waste Management">Solid Waste Management</option>
            <option value="Roads & Infrastructure">Roads & Infrastructure</option>
            <option value="Environment">Environment</option>
            <option value="Public Health">Public Health</option>
            <option value="Street Lighting">Street Lighting</option>
            <option value="Drainage">Drainage & Stormwater</option>
          </select>

          {/* Ward Filter */}
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-900 text-xs text-slate-800"
          >
            <option value="">All Wards (1–14)</option>
            {wards.map((w: any) => (
              <option key={w.wardNumber} value={`Ward ${w.wardNumber}`}>
                Ward {w.wardNumber} - {w.name.split('(')[1]?.replace(')', '') || w.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-900 text-xs text-slate-800"
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-900 text-xs text-slate-800"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {(searchQuery || selectedCategory || selectedWard || selectedPriority || selectedDepartment) && (
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
            <span className="text-slate-500 font-medium">Filters active</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
                setSelectedWard('');
                setSelectedPriority('');
                setSelectedDepartment('');
              }}
              className="text-blue-900 hover:underline font-bold cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={fetchChallenges} className="underline font-bold cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* 4. Challenges Table */}
      <div className="rounded-lg bg-white border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#1E3A8A] text-white font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Challenge ID</th>
                <th className="py-2.5 px-3">Problem</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Ward</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Submitted</th>
                <th className="py-2.5 px-3">Validation Status</th>
                <th className="py-2.5 px-3">Assigned Officer</th>
                <th className="py-2.5 px-3">Project Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {challenges.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500 font-medium text-xs">
                    No challenges found matching the criteria in this tab.
                  </td>
                </tr>
              ) : (
                challenges.map((item: any, idx: number) => {
                  const isVerified = item.validationStatus === 'Verified';
                  const isPending = item.validationStatus === 'Pending Validation';
                  const isResolved = item.validationStatus === 'Resolved';
                  const isOutside = item.validationStatus === 'Outside Jurisdiction';

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-blue-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-950">
                        {item.challengeId || item.id}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 max-w-xs truncate" title={item.problem}>
                        {item.problem}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {item.category}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">
                        {item.ward}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 max-w-[140px] truncate" title={item.location}>
                        {item.location}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[9.5px] font-extrabold uppercase font-mono ${
                            item.priority === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : item.priority === 'HIGH'
                              ? 'bg-orange-100 text-orange-800 border border-orange-300'
                              : 'bg-slate-100 text-slate-800 border border-slate-300'
                          }`}
                        >
                          {item.priority}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                        {new Date(item.submittedDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            isVerified
                              ? 'bg-blue-100 text-blue-900 border border-blue-300'
                              : isPending
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : isResolved
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : isOutside
                              ? 'bg-rose-100 text-rose-900 border border-rose-300'
                              : 'bg-slate-100 text-slate-800 border border-slate-300'
                          }`}
                        >
                          {item.validationStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {item.assignedOfficer ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <HardHat size={11} className="text-emerald-700" />
                            <span>{item.assignedOfficer.name || 'Field Officer'}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px] italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700">
                        {item.projectStatus ? (
                          <span className="text-[10px] uppercase font-mono tracking-wider">
                            {item.projectStatus}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors cursor-pointer"
                        >
                          <Eye size={12} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. CHALLENGE DETAILS & MUNICIPAL VALIDATION MODAL */}
      {selectedChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#133054] text-white p-4 border-b border-[#224d80] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-700/60 border border-amber-400/40 flex items-center justify-center text-amber-400 font-mono font-bold text-xs">
                  ULB
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm tracking-tight text-white">
                      Official Challenge Dossier — {selectedChallenge.challengeId}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase font-mono ${
                        rawStatus === 'submitted'
                          ? 'bg-blue-500/30 text-blue-200 border border-blue-400/50'
                          : rawStatus === 'validated'
                          ? 'bg-sky-500/30 text-sky-200 border border-sky-400/50'
                          : rawStatus === 'assigned'
                          ? 'bg-purple-500/30 text-purple-200 border border-purple-400/50'
                          : rawStatus === 'in_progress'
                          ? 'bg-amber-500/30 text-amber-200 border border-amber-400/50'
                          : rawStatus === 'resolution_submitted' || rawStatus === 'verification_pending'
                          ? 'bg-teal-500/30 text-teal-200 border border-teal-400/50'
                          : (rawStatus === 'resolved' || rawStatus === 'closed')
                          ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/50'
                          : 'bg-slate-700 text-slate-300 border border-slate-500'
                      }`}
                    >
                      ● {statusDisplay}
                    </span>
                    <span
                      className={`px-2 py-0.2 rounded text-[9px] font-extrabold uppercase font-mono ${
                        selectedChallenge.isInsideJurisdiction
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
                      }`}
                    >
                      {selectedChallenge.isInsideJurisdiction ? 'Within Jurisdiction' : 'OUTSIDE JURISDICTION'}
                    </span>
                  </div>
                  <span className="text-[10px] text-blue-200 block">
                    Anand Municipality Civic Operations Command Center
                  </span>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                className="p-1 rounded-md text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-800 flex-1">
              {/* Outside Jurisdiction Alert */}
              {!selectedChallenge.isInsideJurisdiction && (
                <div className="p-3.5 rounded-lg bg-rose-50 border-2 border-rose-300 text-rose-900 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert size={18} className="text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-extrabold text-xs uppercase tracking-wider text-rose-950">
                        OUTSIDE MUNICIPAL JURISDICTION
                      </h4>
                      <p className="text-[11px] text-rose-800 mt-0.5">
                        The GPS coordinates of this challenge fall outside the official boundaries of Anand Municipality. Standard municipal resolution workflow actions are disabled to prevent jurisdictional conflict.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowEscalationModal(true)}
                    className="px-3 py-1.5 rounded-md bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <span>Forward / Escalate</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              )}

              {validationSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>{validationSuccess}</span>
                </div>
              )}

              {allocateSuccess && (
                <div className="p-3 rounded-lg bg-teal-50 border border-teal-300 text-teal-900 text-xs font-bold flex items-center gap-2">
                  <HardHat size={16} className="text-teal-700" />
                  <span>{allocateSuccess}</span>
                </div>
              )}

              {/* 1. CHALLENGE INFORMATION & CLASSIFICATION */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-950 uppercase tracking-wider border-b border-slate-200 pb-1">
                  <FileText size={14} className="text-blue-900" />
                  <span>COMPLAINT CLASSIFICATION & DETAILS</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <div className="md:col-span-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Problem Title</span>
                    <p className="font-bold text-sm text-slate-900 mt-0.5">{selectedChallenge.problem}</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Complaint Status</span>
                    <p className="font-bold text-xs text-blue-950 mt-0.5 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      <span>{statusDisplay}</span>
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Detected Category</span>
                    <p className="font-extrabold text-xs text-slate-900 mt-0.5">
                      {selectedChallenge.category}
                    </p>
                    <span className="text-[10px] text-slate-500">
                      Subcategory: {selectedChallenge.subcategory || 'General'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Priority Level</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono font-bold text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-900">
                        {selectedChallenge.priority}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Score: {selectedChallenge.priorityScore || 85}/100
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Severity Level</span>
                    <p className="font-bold text-xs text-amber-900 mt-0.5">
                      {selectedChallenge.severity || selectedChallenge.aiAnalysis?.severity || 'Standard High'}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Municipal Department</span>
                    <p className={`font-bold text-xs mt-0.5 ${hasDepartment ? 'text-slate-900' : 'text-rose-700'}`}>
                      {hasDepartment ? selectedChallenge.department : 'Not Assigned'}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Field Worker</span>
                    <p className={`font-bold text-xs mt-0.5 ${hasFieldWorker ? 'text-teal-900' : 'text-slate-500 italic'}`}>
                      {hasFieldWorker ? selectedChallenge.assignedOfficer.name : 'Not Assigned'}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Reported Timestamp</span>
                    <p className="font-mono text-xs text-slate-700 mt-0.5">
                      {new Date(selectedChallenge.submittedDate).toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="md:col-span-3">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Citizen Problem Description</span>
                    <p className="text-xs text-slate-700 mt-0.5 leading-relaxed bg-white p-2.5 rounded border border-slate-200">
                      {selectedChallenge.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. LOCATION & GEOGRAPHICAL DATA */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-950 uppercase tracking-wider border-b border-slate-200 pb-1">
                  <MapPin size={14} className="text-blue-900" />
                  <span>LOCATION & GEOGRAPHICAL COORDINATES</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Ward / Sector</span>
                    <p className="font-bold text-xs text-slate-900 mt-0.5">{selectedChallenge.ward}</p>
                  </div>

                  <div className="md:col-span-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Physical Address / Landmark</span>
                    <p className="font-semibold text-xs text-slate-800 mt-0.5">{selectedChallenge.address || selectedChallenge.location}</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Latitude & Longitude</span>
                    <p className="font-mono text-xs text-blue-900 font-bold mt-0.5">
                      {selectedChallenge.coordinates ? `${selectedChallenge.coordinates[1]}, ${selectedChallenge.coordinates[0]}` : 'Location unavailable'}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Geofence Evaluation</span>
                    <p className={`font-bold text-xs mt-0.5 ${selectedChallenge.isInsideJurisdiction ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {selectedChallenge.isInsideJurisdiction ? 'Inside Anand ULB (Valid)' : 'Outside Jurisdiction Bounding Box'}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Reporting Citizen</span>
                    <p className="text-xs text-slate-800 font-medium mt-0.5">
                      {selectedChallenge.evidence?.reportedBy || 'Verified Resident'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. CITIZEN EVIDENCE */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-950 uppercase tracking-wider border-b border-slate-200 pb-1">
                  <Eye size={14} className="text-blue-900" />
                  <span>CITIZEN EVIDENCE & UPLOADS</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
                  {selectedChallenge.evidence?.citizenNotes && (
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Citizen Field Observations</span>
                      <p className="text-xs text-slate-700 mt-0.5 italic bg-white p-2 rounded border border-slate-200">
                        "{selectedChallenge.evidence.citizenNotes}"
                      </p>
                    </div>
                  )}

                  {selectedChallenge.evidence?.images && selectedChallenge.evidence.images.length > 0 ? (
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1.5">
                        Uploaded Geo-tagged Images ({selectedChallenge.evidence.images.length})
                      </span>
                      <div className="flex items-center gap-3 overflow-x-auto pb-1">
                        {selectedChallenge.evidence.images.map((imgUrl: string, i: number) => (
                          <div key={i} className="relative group shrink-0 w-36 h-24 rounded-lg overflow-hidden border border-slate-300 shadow-2xs">
                            <img src={imgUrl} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover" />
                            <a
                              href={imgUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold"
                            >
                              Expand
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No photographic attachments provided.</p>
                  )}
                </div>
              </div>

              {/* 4. AI ANALYSIS (CLEARLY LABELLED AS ADVISORY) */}
              {selectedChallenge.aiAnalysis && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-950 uppercase tracking-wider">
                      <Sparkles size={14} className="text-amber-600" />
                      <span>AI ASSISTED ANALYSIS</span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-300 font-bold">
                      ADVISORY ONLY — MUNICIPAL VERIFICATION REQUIRED
                    </span>
                  </div>

                  <div className="bg-amber-50/40 p-3.5 rounded-lg border border-amber-200/80 space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                      <div className="p-2 rounded bg-white border border-amber-200">
                        <span className="text-[9px] text-slate-500 font-bold uppercase block">AI Classification</span>
                        <p className="font-bold text-xs text-slate-900 mt-0.5">{selectedChallenge.aiAnalysis.classification}</p>
                      </div>

                      <div className="p-2 rounded bg-white border border-amber-200">
                        <span className="text-[9px] text-slate-500 font-bold uppercase block">Confidence Score</span>
                        <p className="font-mono font-bold text-xs text-blue-900 mt-0.5">
                          {Math.round((selectedChallenge.aiAnalysis.confidence || 0.9) * 100)}% Match
                        </p>
                      </div>

                      <div className="p-2 rounded bg-white border border-amber-200">
                        <span className="text-[9px] text-slate-500 font-bold uppercase block">Priority Recommendation</span>
                        <p className="font-bold text-xs text-amber-900 mt-0.5">
                          {selectedChallenge.aiAnalysis.priorityRecommendation}
                        </p>
                      </div>

                      <div className="p-2 rounded bg-white border border-amber-200">
                        <span className="text-[9px] text-slate-500 font-bold uppercase block">Duplicate Detection</span>
                        <p className="font-semibold text-xs text-slate-700 mt-0.5">
                          {selectedChallenge.aiAnalysis.duplicateDetection}
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-white border border-amber-200">
                      <span className="text-[9px] text-slate-500 font-bold uppercase block">AI Validation Summary</span>
                      <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
                        {selectedChallenge.aiAnalysis.validationSummary}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. MUNICIPAL DEPARTMENT ASSIGNMENT */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-950 uppercase tracking-wider border-b border-slate-200 pb-1">
                  <CheckCircle2 size={14} className="text-blue-900" />
                  <span>MUNICIPAL DEPARTMENT ASSIGNMENT</span>
                </div>

                {/* STATE 1: No department assigned */}
                {!hasDepartment && (
                  <div className="bg-amber-50/70 p-3.5 rounded-lg border border-amber-300 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Municipal Department</span>
                        <p className="font-extrabold text-sm text-rose-700 mt-0.5">Not Assigned</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                        Awaiting Department Assignment
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Assign an authorized municipal engineering department to establish governance and workflow routing.
                    </p>
                    {selectedChallenge.isInsideJurisdiction && (
                      <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                        <select
                          value={assignedDepartment}
                          onChange={(e) => setAssignedDepartment(e.target.value)}
                          disabled={actionLoading}
                          className="w-full sm:w-auto flex-1 px-2.5 py-1.5 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-900 text-xs bg-white font-medium"
                        >
                          <option value="">Select Municipal Department...</option>
                          {departments.map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                        <button
                          onClick={handleAssignDepartment}
                          disabled={actionLoading || !assignedDepartment}
                          className="w-full sm:w-auto px-4 py-1.5 rounded-md bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
                        >
                          <Check size={14} />
                          <span>Assign Department</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* STATE 2: Department assigned, Field Worker not assigned */}
                {hasDepartment && !hasFieldWorker && (
                  <div className="bg-blue-50/60 p-3.5 rounded-lg border border-blue-200 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Municipal Department</span>
                        <p className="font-extrabold text-sm text-blue-950 mt-0.5">{selectedChallenge.department}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Status</span>
                        <p className="font-bold text-xs text-emerald-800 mt-0.5">Department Assigned</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Field Worker</span>
                        <p className="font-bold text-xs text-amber-800 mt-0.5">Not Assigned</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-blue-200/60 text-xs text-slate-600">
                      <span>Department routing established. Allocate designated field worker below to dispatch task.</span>
                      <button
                        onClick={() => {
                          const el = document.getElementById('field-worker-allocation-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-blue-900 font-bold underline hover:text-blue-700 cursor-pointer"
                      >
                        Assign Field Worker ↓
                      </button>
                    </div>
                  </div>
                )}

                {/* STATE 3: Department + Field Worker assigned */}
                {hasDepartment && hasFieldWorker && (
                  <div className="bg-emerald-50/60 p-3.5 rounded-lg border border-emerald-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Municipal Department</span>
                        <p className="font-extrabold text-sm text-slate-900 mt-0.5">{selectedChallenge.department}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Field Worker</span>
                        <p className="font-bold text-xs text-blue-950 mt-0.5">{selectedChallenge.assignedOfficer.name}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Assignment Status</span>
                        <p className="font-bold text-xs text-emerald-800 mt-0.5">Active</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 6. FIELD WORKER ALLOCATION & DISPATCH */}
              <div id="field-worker-allocation-section" className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-950 uppercase tracking-wider">
                    <HardHat size={14} className="text-teal-700" />
                    <span>FIELD WORKER ALLOCATION & DISPATCH</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border flex items-center gap-1 ${
                    hasFieldWorker ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    {hasFieldWorker ? <><Check size={11} /> Assigned</> : 'Awaiting Assignment'}
                  </span>
                </div>

                {!hasFieldWorker ? (
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                    <div className="p-3 bg-white rounded border border-slate-200 text-xs">
                      <p className="font-bold text-slate-800">No Field Worker has been assigned yet.</p>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        Municipal Admin can assign a designated Field Worker after reviewing the complaint details.
                      </p>
                    </div>

                    {selectedChallenge.isInsideJurisdiction && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-slate-700 font-bold uppercase block mb-1">
                              Select Designated Field Worker <span className="text-rose-500">*</span>
                            </label>
                            <select
                              value={selectedWorkerId}
                              onChange={(e) => setSelectedWorkerId(e.target.value)}
                              disabled={actionLoading}
                              className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-900 text-xs bg-white font-medium"
                            >
                              {fieldWorkersList.map((w) => (
                                <option key={w.id || w._id} value={w.id || w._id}>
                                  {w.name} ({w.badgeNumber || w.badge || 'FW'}) — {w.department} | {w.status} (Active Tasks: {w.activeTasks ?? 0})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-700 font-bold uppercase block mb-1">
                              Field Department Routing
                            </label>
                            <input
                              type="text"
                              disabled
                              value={assignedDepartment || selectedChallenge.department || 'Roads & Buildings / PWD'}
                              className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 bg-slate-100 text-xs text-slate-600 font-medium"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-700 font-bold uppercase block mb-1">
                            Field Worker Directives & Remediation Mandate <span className="text-rose-500">*</span>
                          </label>
                          <textarea
                            rows={2}
                            value={workerInstructions}
                            onChange={(e) => setWorkerInstructions(e.target.value)}
                            disabled={actionLoading}
                            placeholder="Provide ground directions: inspect site, complete repair work, and capture live geotagged proof..."
                            className="w-full p-2.5 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-900 text-xs bg-white text-slate-800"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <p className="text-[11px] text-slate-500 italic">
                            Field worker will receive an instant assignment notification and verification task.
                          </p>
                          <button
                            onClick={handleAllocateToFieldWorker}
                            disabled={actionLoading}
                            className="px-4 py-1.5 rounded-md bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
                          >
                            <UserCheck size={14} />
                            <span>Allocate to Field Worker</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 bg-white p-3 rounded border border-slate-200 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Field Worker</span>
                        <p className="font-extrabold text-xs text-slate-900 mt-0.5">
                          {selectedChallenge.assignedOfficer.name}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Employee ID</span>
                        <p className="font-mono font-bold text-xs text-blue-900 mt-0.5">
                          {selectedChallenge.assignedOfficer.badgeNumber || selectedChallenge.assignedOfficer.badge || `FW-${(selectedChallenge.assignedOfficer.id || '101').slice(-4).toUpperCase()}`}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Department</span>
                        <p className="font-bold text-xs text-slate-800 mt-0.5">
                          {selectedChallenge.assignedOfficer.department || selectedChallenge.department}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Designation</span>
                        <p className="font-semibold text-xs text-slate-700 mt-0.5">
                          {selectedChallenge.assignedOfficer.role === 'field_officer' ? 'Field Operations Officer' : (selectedChallenge.assignedOfficer.designation || 'Field Officer')}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Assigned By</span>
                        <p className="font-medium text-xs text-slate-800 mt-0.5">
                          {selectedChallenge.assignment?.assignedBy?.name || 'Municipal Administration'}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Assigned At</span>
                        <p className="font-mono text-xs text-slate-700 mt-0.5">
                          {selectedChallenge.assignment?.assignedAt
                            ? new Date(selectedChallenge.assignment.assignedAt).toLocaleString('en-IN')
                            : (selectedChallenge.assignmentHistory?.[0]?.createdAt
                                ? new Date(selectedChallenge.assignmentHistory[0].createdAt).toLocaleString('en-IN')
                                : new Date().toLocaleString('en-IN'))}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Assignment Status</span>
                        <p className="font-bold text-xs text-emerald-700 mt-0.5">
                          {selectedChallenge.assignment?.status || 'Assigned'}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Target SLA</span>
                        <p className="font-mono font-bold text-xs text-amber-800 mt-0.5">
                          {selectedChallenge.assignment?.targetResolutionTime
                            ? new Date(selectedChallenge.assignment.targetResolutionTime).toLocaleString('en-IN')
                            : 'Standard ULB SLA (24h)'}
                        </p>
                      </div>
                    </div>

                    {selectedChallenge.assignment?.instructions && (
                      <div className="bg-white p-2.5 rounded border border-slate-200">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Remediation Directives</span>
                        <p className="text-xs text-slate-800 mt-0.5 italic">
                          "{selectedChallenge.assignment.instructions}"
                        </p>
                      </div>
                    )}

                    {/* Option to re-assign if still open */}
                    {!isResolved && selectedChallenge.isInsideJurisdiction && (
                      <details className="text-xs">
                        <summary className="cursor-pointer font-bold text-teal-800 hover:text-teal-950">
                          Re-allocate / Transfer to Another Field Worker
                        </summary>
                        <div className="mt-2 space-y-2 pt-2 border-t border-slate-200">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <select
                              value={selectedWorkerId}
                              onChange={(e) => setSelectedWorkerId(e.target.value)}
                              className="p-1.5 border rounded text-xs bg-white"
                            >
                              {fieldWorkersList.map((w) => (
                                <option key={w.id || w._id} value={w.id || w._id}>
                                  {w.name} ({w.badgeNumber || 'FW'}) — {w.department}
                                </option>
                              ))}
                            </select>
                            <input
                              type="text"
                              placeholder="Re-allocation directives..."
                              value={workerInstructions}
                              onChange={(e) => setWorkerInstructions(e.target.value)}
                              className="p-1.5 border rounded text-xs bg-white"
                            />
                          </div>
                          <button
                            onClick={handleAllocateToFieldWorker}
                            disabled={actionLoading}
                            className="px-3 py-1 bg-teal-800 text-white rounded text-xs font-bold hover:bg-teal-700 cursor-pointer"
                          >
                            Confirm Re-allocation
                          </button>
                        </div>
                      </details>
                    )}
                  </div>
                )}
              </div>

              {/* 7. FIELD WORK STATUS */}
              {hasFieldWorker && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-950 uppercase tracking-wider border-b border-slate-200 pb-1">
                    <Clock size={14} className="text-blue-900" />
                    <span>FIELD WORK STATUS</span>
                  </div>

                  <div className={`p-3.5 rounded-lg border text-xs ${
                    isWorkStarted ? 'bg-amber-50/50 border-amber-300' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Assigned Worker</span>
                        <p className="font-bold text-xs text-slate-900 mt-0.5">
                          {selectedChallenge.assignedOfficer.name}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Execution Status</span>
                        <p className={`font-bold text-xs mt-0.5 ${
                          rawStatus === 'in_progress' ? 'text-amber-800' :
                          (rawStatus === 'resolution_submitted' || rawStatus === 'verification_pending') ? 'text-teal-800' :
                          (rawStatus === 'resolved' || rawStatus === 'closed') ? 'text-emerald-800' : 'text-slate-700'
                        }`}>
                          {rawStatus === 'in_progress' ? '● In Progress' :
                           (rawStatus === 'resolution_submitted' || rawStatus === 'verification_pending') ? '● Resolution Submitted' :
                           (rawStatus === 'resolved' || rawStatus === 'closed') ? '● Resolved' : '● Assigned (Pending Start)'}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">
                          {isWorkStarted ? 'Work Commenced' : 'Assigned At'}
                        </span>
                        <p className="font-mono text-xs text-slate-700 mt-0.5">
                          {selectedChallenge.assignment?.assignedAt
                            ? new Date(selectedChallenge.assignment.assignedAt).toLocaleString('en-IN')
                            : 'Logged in system'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 8. FIELD WORKER RESOLUTION PROOF */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-950 uppercase tracking-wider">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    <span>FIELD WORKER RESOLUTION PROOF</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                    hasRealResolution
                      ? (isResolved ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-teal-100 text-teal-800 border-teal-300')
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {hasRealResolution
                      ? (isResolved ? 'OFFICIALLY VERIFIED & CLOSED' : 'RESOLUTION SUBMITTED FOR REVIEW')
                      : 'AWAITING FIELD RESOLUTION'}
                  </span>
                </div>

                {!hasRealResolution ? (
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-slate-700 font-bold">
                      <Clock size={15} className="text-slate-500" />
                      <span>No resolution evidence submitted yet.</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white p-2.5 rounded border border-slate-200 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Field Worker</span>
                        <p className="font-semibold text-slate-900 mt-0.5">
                          {hasFieldWorker ? selectedChallenge.assignedOfficer.name : 'Not Assigned'}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Status</span>
                        <p className="font-semibold text-amber-800 mt-0.5">
                          {!hasFieldWorker
                            ? 'Waiting for Municipal Admin to assign a Field Worker. No resolution evidence available yet.'
                            : (rawStatus === 'in_progress' ? 'Field Work in Progress' : 'Awaiting Field Work Execution')}
                        </p>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 italic">
                      Live geotagged photographic proof will be recorded and displayed here only after the assigned field worker captures on-site resolution evidence.
                    </p>
                  </div>
                ) : (
                  <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-300 space-y-3">
                    {/* Metadata strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-white p-2.5 rounded border border-emerald-200 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Field Officer</span>
                        <strong className="text-slate-900">
                          {selectedChallenge.resolutionEvidence?.resolvedBy?.name ||
                            selectedChallenge.assignedOfficer?.name ||
                            'Field Officer'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Geotagged Location</span>
                        <strong className="text-blue-900 font-mono">
                          {selectedChallenge.resolutionEvidence?.capturedLocation
                            ? `${Number(selectedChallenge.resolutionEvidence.capturedLocation.latitude).toFixed(4)}° N, ${Number(selectedChallenge.resolutionEvidence.capturedLocation.longitude).toFixed(4)}° E`
                            : (selectedChallenge.coordinates
                                ? `${Number(selectedChallenge.coordinates[1]).toFixed(4)}° N, ${Number(selectedChallenge.coordinates[0]).toFixed(4)}° E`
                                : 'On-site Geotagged')}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Completion Timestamp</span>
                        <strong className="text-slate-700 font-mono">
                          {selectedChallenge.resolutionEvidence?.resolvedAt
                            ? new Date(selectedChallenge.resolutionEvidence.resolvedAt).toLocaleString('en-IN')
                            : new Date().toLocaleString('en-IN')}
                        </strong>
                      </div>
                    </div>

                    {/* Photographic Comparison */}
                    <div>
                      <span className="text-[10px] text-slate-600 font-bold uppercase block mb-1.5">
                        Before vs After Photographic Verification Audit
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                            Before (Citizen Grievance Submission)
                          </span>
                          <div className="h-44 rounded-lg overflow-hidden border border-slate-300 bg-slate-100">
                            {selectedChallenge.evidence?.images?.[0] ? (
                              <img
                                src={selectedChallenge.evidence.images[0]}
                                alt="Before"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                                Defect Photo
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1 w-fit">
                            <ShieldCheck size={11} />
                            After (Field Worker Live Geotagged Proof)
                          </span>
                          <div className="h-44 rounded-lg overflow-hidden border-2 border-emerald-500 bg-slate-100 relative group">
                            {resolutionVideos[0] ? (
                              <div className="w-full h-full bg-black relative flex items-center justify-center">
                                <video src={resolutionVideos[0]} controls className="w-full h-full object-contain" />
                                <div className="absolute top-1 left-1 bg-rose-600 text-white text-[9px] font-mono px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                                  🎥 LIVE VIDEO EVIDENCE
                                </div>
                              </div>
                            ) : resolutionPhotos[0] ? (
                              <>
                                <img
                                  src={resolutionPhotos[0]}
                                  alt="After Resolution Proof"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-1 right-1 bg-emerald-950/80 text-white text-[9px] font-mono px-1.5 py-0.5 rounded font-bold">
                                  LIVE GEOTAG VALIDATED
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs italic">
                                Digital resolution logged (no image attached)
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Field Audit Notes */}
                    {selectedChallenge.resolutionEvidence?.description && (
                      <div className="bg-white p-2.5 rounded border border-emerald-200">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">Field Officer Completion Notes</span>
                        <p className="text-xs text-slate-800 mt-0.5 italic">
                          "{selectedChallenge.resolutionEvidence.description}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 9. MUNICIPAL VERIFICATION DECISION (ONLY AFTER RESOLUTION EVIDENCE IS SUBMITTED) */}
              {hasRealResolution && !isResolved && selectedChallenge.isInsideJurisdiction && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-950 uppercase tracking-wider border-b border-slate-200 pb-1">
                    <CheckCircle2 size={14} className="text-emerald-700" />
                    <span>MUNICIPAL VERIFICATION DECISION</span>
                  </div>

                  <div className="p-4 bg-emerald-50/70 rounded-lg border-2 border-emerald-300 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <p className="font-extrabold text-xs text-slate-900">Review field evidence and confirm satisfactory closure.</p>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Inspect ground geotagged photos and field officer notes before final approval.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleValidateChallenge('Rejected')}
                        disabled={actionLoading}
                        className="px-3.5 py-1.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                      >
                        Reject Resolution
                      </button>
                      <button
                        onClick={() => handleValidateChallenge('Verified')}
                        disabled={actionLoading}
                        className="px-4 py-1.5 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Check size={14} />
                        <span>Verify & Resolve Complaint</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 9B. OFFICIAL CLOSURE BADGE IF RESOLVED */}
              {isResolved && (
                <div className="p-3.5 bg-emerald-50 rounded-lg border border-emerald-300 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                      <CheckCircle2 size={15} className="text-emerald-600" />
                      <span>COMPLAINT VERIFIED & RESOLVED</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-800 font-bold">
                      {selectedChallenge.resolvedAt ? new Date(selectedChallenge.resolvedAt).toLocaleString('en-IN') : 'Verified'}
                    </span>
                  </div>
                  <p className="text-emerald-900 text-[11px]">
                    Verified & closed by Municipal Administration. Formal audit closure entered into civic operations register.
                  </p>
                </div>
              )}

              {/* 9C. ADMINISTRATIVE ACTIONS & REMARKS (WHEN NOT YET RESOLVED) */}
              {!isResolved && selectedChallenge.isInsideJurisdiction && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      ADMINISTRATIVE DIRECTIVES & ACTIONS
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                    <textarea
                      rows={2}
                      value={validationRemarks}
                      onChange={(e) => setValidationRemarks(e.target.value)}
                      disabled={actionLoading}
                      placeholder="Enter formal administrative remarks or technical directives for municipal audit trail..."
                      className="w-full p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-900 text-xs bg-white text-slate-800"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleValidateChallenge('Needs More Information')}
                        disabled={actionLoading}
                        className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer shadow-2xs"
                      >
                        Request More Information
                      </button>
                      <button
                        onClick={() => handleValidateChallenge('Rejected')}
                        disabled={actionLoading}
                        className="px-3 py-1 rounded bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs cursor-pointer shadow-2xs"
                      >
                        Reject Challenge
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 5D. ASSIGNMENT HISTORY */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-950 uppercase tracking-wider border-b border-slate-200 pb-1">
                  <UserCheck size={14} className="text-teal-700" />
                  <span>ASSIGNMENT HISTORY</span>
                </div>
                {selectedChallenge.assignmentHistory && selectedChallenge.assignmentHistory.length > 0 ? (
                  <div className="space-y-2 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    {selectedChallenge.assignmentHistory.map((ah: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded bg-white border border-slate-200 text-xs flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900">
                            {ah.officerId?.name || 'Field Officer'} ({ah.officerId?.badgeNumber || 'FW'})
                          </span>
                          <span className="text-slate-500 text-[11px] block">
                            Department: {ah.departmentId?.name || 'Public Works'} • Assigned By: {ah.assignedBy?.name || 'Municipal Admin'}
                          </span>
                          {ah.assignmentReason && (
                            <span className="text-slate-600 italic text-[10px] block mt-0.5">"{ah.assignmentReason}"</span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ah.isCurrent ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                            {ah.isCurrent ? 'CURRENT' : 'PREVIOUS'}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                            {new Date(ah.createdAt).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded border border-slate-200">
                    {selectedChallenge.assignedOfficer ? `Currently assigned to ${selectedChallenge.assignedOfficer.name}.` : 'No prior assignments recorded.'}
                  </p>
                )}
              </div>

              {/* 5E. COMPLAINT AUDIT TIMELINE */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-950 uppercase tracking-wider border-b border-slate-200 pb-1">
                  <Clock size={14} className="text-blue-900" />
                  <span>COMPLETE CASE TIMELINE & AUDIT HISTORY</span>
                </div>
                {selectedChallenge.statusHistory && selectedChallenge.statusHistory.length > 0 ? (
                  <div className="space-y-2 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    {selectedChallenge.statusHistory.map((sh: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-2 rounded bg-white border border-slate-200 text-xs">
                        <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 uppercase text-[11px]">
                              {sh.toStatus?.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {new Date(sh.createdAt).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px] mt-0.5">{sh.note}</p>
                          {sh.changedBy && (
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Action by: {sh.changedBy.name || 'Staff'} ({sh.changedBy.role || 'Municipal Admin'})
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded border border-slate-200">
                    Initial status logged at submission.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Inter-authority Forwarding Modal */}
      {showEscalationModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-rose-900 font-extrabold text-sm">
                <ShieldAlert size={18} />
                <span>Inter-Authority Forwarding</span>
              </div>
              <button onClick={() => setShowEscalationModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-800">
              <p className="text-slate-600">
                This challenge is outside Anand Municipality's geographical boundary. Select the neighboring jurisdiction to reroute this civic issue.
              </p>

              <div>
                <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                  Target Municipal Authority
                </label>
                <select
                  value={targetAuthority}
                  onChange={(e) => setTargetAuthority(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs"
                >
                  <option value="Nadiad Nagar Palika / Gujarat Urban Development Authority">
                    Nadiad Nagar Palika (Kheda District)
                  </option>
                  <option value="Vadodara Municipal Corporation (VMC)">
                    Vadodara Municipal Corporation (VMC)
                  </option>
                  <option value="Umreth Nagarpalika">Umreth Nagarpalika</option>
                  <option value="Petlad Nagarpalika">Petlad Nagarpalika</option>
                  <option value="Gujarat State Roads & Transport Corporation (GSRTC)">
                    GSRTC Highways Division
                  </option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                  Inter-Authority Escalation Notes
                </label>
                <textarea
                  rows={3}
                  value={escalationNotes}
                  onChange={(e) => setEscalationNotes(e.target.value)}
                  placeholder="Provide rationale for border transfer (e.g. Geofence coordinates placed outside Anand ULB limits)..."
                  className="w-full p-2 border border-slate-300 rounded text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setShowEscalationModal(false)}
                className="px-3 py-1.5 border border-slate-300 text-xs font-bold text-slate-700 rounded hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleForwardOutsideJurisdiction}
                disabled={actionLoading}
                className="px-4 py-1.5 bg-rose-800 hover:bg-rose-900 text-white text-xs font-bold rounded shadow-2xs flex items-center gap-1.5"
              >
                <Send size={13} />
                <span>Confirm Inter-Authority Transfer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
