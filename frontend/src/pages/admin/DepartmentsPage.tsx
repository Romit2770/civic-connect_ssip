import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  Users,
  Mail,
  Phone,
  Clock,
  Plus,
  Edit2,
  X,
  Check,
  ShieldCheck,
  MapPin,
  Briefcase,
  AlertCircle,
  Sparkles,
  ChevronRight,
  UserPlus,
  ExternalLink,
  Hammer,
  Trash2,
  Lightbulb,
  Droplets,
  Waves,
  Trees,
  Car,
  ShieldAlert,
} from 'lucide-react';
import { apiClient, getErrorMessage } from '../../api/client';
import { Department, DepartmentWorker, Ward } from '../../types';

const ICON_OPTIONS = [
  { value: 'building-2', label: 'Building / Nodal', icon: Building2 },
  { value: 'hammer', label: 'Public Works', icon: Hammer },
  { value: 'trash-2', label: 'Sanitation', icon: Trash2 },
  { value: 'lightbulb', label: 'Street Lighting', icon: Lightbulb },
  { value: 'droplets', label: 'Water Supply', icon: Droplets },
  { value: 'waves', label: 'Drainage & Sewerage', icon: Waves },
  { value: 'trees', label: 'Parks & Gardens', icon: Trees },
  { value: 'car', label: 'Traffic & Roads', icon: Car },
  { value: 'shield-alert', label: 'Public Safety', icon: ShieldAlert },
];

const DEPARTMENT_CODES = [
  'SANITATION',
  'PUBLIC_WORKS',
  'STREET_LIGHTING',
  'WATER_SUPPLY',
  'SEWERAGE',
  'PARKS_AND_GARDENS',
  'TRAFFIC_AND_ROADS',
  'OTHER',
];

function getDepartmentIcon(iconName?: string) {
  switch (iconName?.toLowerCase()) {
    case 'hammer':
      return Hammer;
    case 'trash-2':
    case 'trash':
      return Trash2;
    case 'lightbulb':
      return Lightbulb;
    case 'droplets':
      return Droplets;
    case 'waves':
      return Waves;
    case 'trees':
      return Trees;
    case 'car':
      return Car;
    case 'shield-alert':
      return ShieldAlert;
    default:
      return Building2;
  }
}

export default function DepartmentsPage() {
  const { t } = useTranslation();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Selected Department for Worker Details Modal
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [deptWorkers, setDeptWorkers] = useState<DepartmentWorker[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(false);

  // Add / Edit Department Modal State
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptForm, setDeptForm] = useState({
    name: '',
    code: 'PUBLIC_WORKS',
    slug: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    icon: 'building-2',
    categories: '',
    active: true,
  });
  const [savingDept, setSavingDept] = useState(false);

  // Add Worker Sub-Modal State
  const [isAddWorkerModalOpen, setIsAddWorkerModalOpen] = useState(false);
  const [workerForm, setWorkerForm] = useState({
    name: '',
    email: '',
    password: 'Officer@123',
    phone: '',
    role: 'field_officer',
    badgeNumber: '',
    wardId: '',
  });
  const [savingWorker, setSavingWorker] = useState(false);

  useEffect(() => {
    loadDepartments();
    loadWards();
  }, []);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/departments');
      if (res.data.success) {
        setDepartments(res.data.data || []);
      }
    } catch (e) {
      console.warn('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const loadWards = async () => {
    try {
      const res = await apiClient.get('/map/wards');
      if (res.data.success) {
        setWards(res.data.data || []);
      }
    } catch (e) {
      // ignore
    }
  };

  // Open Workers Details
  const handleViewWorkers = async (dept: Department) => {
    setSelectedDept(dept);
    setLoadingWorkers(true);
    try {
      const res = await apiClient.get(`/departments/${dept._id}/workers`);
      if (res.data.success) {
        setDeptWorkers(res.data.data.workers || []);
      }
    } catch (err: any) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setLoadingWorkers(false);
    }
  };

  // Open Add Department Modal
  const handleOpenAddDept = () => {
    setEditingDept(null);
    setDeptForm({
      name: '',
      code: 'PUBLIC_WORKS',
      slug: '',
      description: '',
      contactEmail: '',
      contactPhone: '',
      icon: 'building-2',
      categories: '',
      active: true,
    });
    setIsDeptModalOpen(true);
  };

  // Open Edit Department Modal
  const handleOpenEditDept = (dept: Department, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingDept(dept);
    setDeptForm({
      name: dept.name,
      code: dept.code || 'PUBLIC_WORKS',
      slug: dept.slug,
      description: dept.description,
      contactEmail: dept.contactEmail || '',
      contactPhone: dept.contactPhone || '',
      icon: dept.icon || 'building-2',
      categories: Array.isArray(dept.categories) ? dept.categories.join(', ') : '',
      active: dept.active !== false && dept.isActive !== false,
    });
    setIsDeptModalOpen(true);
  };

  // Save Department (Add or Edit)
  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name.trim()) return;

    setSavingDept(true);
    setErrorMsg(null);

    try {
      const payload = {
        name: deptForm.name,
        code: deptForm.code,
        slug: deptForm.slug || deptForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        description: deptForm.description,
        contactEmail: deptForm.contactEmail,
        contactPhone: deptForm.contactPhone,
        icon: deptForm.icon,
        categories: deptForm.categories
          ? deptForm.categories.split(',').map((c) => c.trim()).filter(Boolean)
          : [],
        active: deptForm.active,
      };

      if (editingDept) {
        const res = await apiClient.put(`/departments/${editingDept._id}`, payload);
        if (res.data.success) {
          setSuccessMsg(`Department '${deptForm.name}' updated successfully.`);
        }
      } else {
        const res = await apiClient.post('/departments', payload);
        if (res.data.success) {
          setSuccessMsg(`Department '${deptForm.name}' created successfully.`);
        }
      }

      setIsDeptModalOpen(false);
      await loadDepartments();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setSavingDept(false);
    }
  };

  // Save New Worker to Department
  const handleSaveWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept || !workerForm.name.trim() || !workerForm.email.trim()) return;

    setSavingWorker(true);
    setErrorMsg(null);

    try {
      const res = await apiClient.post(`/departments/${selectedDept._id}/workers`, workerForm);
      if (res.data.success) {
        setSuccessMsg(`Worker '${workerForm.name}' added successfully to ${selectedDept.name}.`);
        setIsAddWorkerModalOpen(false);
        setWorkerForm({
          name: '',
          email: '',
          password: 'Officer@123',
          phone: '',
          role: 'field_officer',
          badgeNumber: '',
          wardId: '',
        });
        // Reload workers list & departments count
        await handleViewWorkers(selectedDept);
        await loadDepartments();
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setSavingWorker(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <Building2 size={26} className="text-blue-900" />
            <span>{t('nav.departments')}</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Nodal municipal departments, grievance auto-routing rules, and dedicated field officers.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddDept}
          className="gov-button-primary text-xs py-2.5 px-4 shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Add New Department</span>
        </button>
      </div>

      {/* Alert Notifications */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 flex items-center justify-between animate-fade-in shadow-2xs">
          <div className="flex items-center gap-2">
            <Check size={16} className="text-emerald-700 font-bold shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button type="button" onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-950">
            <X size={14} />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-xs text-red-900 flex items-center justify-between animate-fade-in shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-700 font-bold shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button type="button" onClick={() => setErrorMsg(null)} className="text-red-700 hover:text-red-950">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Departments Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-700" />
          <p>{t('common.loading')}</p>
        </div>
      ) : departments.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-300 rounded-xl space-y-3">
          <Building2 size={36} className="mx-auto text-slate-400" />
          <h3 className="font-bold text-slate-800 text-sm">No Departments Configured</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Add municipal departments to enable automated classification and field officer routing.
          </p>
          <button type="button" onClick={handleOpenAddDept} className="gov-button-primary text-xs py-2 px-4">
            + Add First Department
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((d) => {
            const DeptIcon = getDepartmentIcon(d.icon);
            return (
              <div
                key={d._id}
                onClick={() => handleViewWorkers(d)}
                className="gov-card p-5 bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all rounded-xl space-y-4 cursor-pointer relative group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar: Icon + Code Badge + Edit Button */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                        <DeptIcon size={22} />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm leading-tight group-hover:text-blue-900 transition-colors">
                          {d.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                            {d.code || d.slug}
                          </span>
                          {d.active === false || d.isActive === false ? (
                            <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 rounded">
                              Inactive
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 rounded">
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      title="Edit Department"
                      onClick={(e) => handleOpenEditDept(d, e)}
                      className="p-1.5 text-slate-400 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={15} />
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {d.description}
                  </p>

                  {/* Contact Info */}
                  <div className="space-y-1 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    {d.contactEmail && (
                      <div className="flex items-center gap-2">
                        <Mail size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate">{d.contactEmail}</span>
                      </div>
                    )}
                    {d.contactPhone && (
                      <div className="flex items-center gap-2">
                        <Phone size={12} className="text-slate-400 shrink-0" />
                        <span>{d.contactPhone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Bar: Worker & Grievance Stats + View Action */}
                <div className="pt-3 border-t border-slate-100 mt-2">
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px] mb-3 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Staff</span>
                      <strong className="text-slate-900 font-bold">{d.workerCount ?? 0}</strong>
                    </div>
                    <div>
                      <span className="text-amber-600 text-[10px] block">Active</span>
                      <strong className="text-amber-900 font-bold">{d.activeComplaintsCount ?? 0}</strong>
                    </div>
                    <div>
                      <span className="text-emerald-600 text-[10px] block">Resolved</span>
                      <strong className="text-emerald-900 font-bold">{d.resolvedComplaintsCount ?? 0}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-blue-800 font-bold pt-1">
                    <span className="flex items-center gap-1.5 group-hover:underline">
                      <Users size={13} />
                      <span>View Workers & Tasks</span>
                    </span>
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* DEPARTMENT WORKERS & STAFF DETAILS MODAL / DRAWER */}
      {/* ========================================================================= */}
      {selectedDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-amber-400 border border-white/20">
                  {React.createElement(getDepartmentIcon(selectedDept.icon), { size: 22 })}
                </div>
                <div>
                  <h2 className="text-base font-extrabold flex items-center gap-2">
                    <span>{selectedDept.name}</span>
                    <span className="text-[10px] font-mono font-bold bg-white/20 text-white px-2 py-0.5 rounded uppercase">
                      {selectedDept.code || selectedDept.slug}
                    </span>
                  </h2>
                  <p className="text-xs text-blue-200 mt-0.5">
                    Field Officers, Line Staff & Municipal Task Assignments
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddWorkerModalOpen(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <UserPlus size={13} />
                  <span>+ Add Officer</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDept(null);
                    setDeptWorkers([]);
                  }}
                  className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
              {/* Department Overview Banner */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="space-y-1 max-w-md">
                  <span className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider block">Department Overview</span>
                  <p className="text-slate-700 leading-relaxed">{selectedDept.description}</p>
                </div>
                <div className="flex items-center gap-4 border-l border-slate-200 pl-4">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Contact Email</span>
                    <strong className="text-slate-900">{selectedDept.contactEmail || 'Not specified'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Emergency Phone</span>
                    <strong className="text-slate-900">{selectedDept.contactPhone || 'Not specified'}</strong>
                  </div>
                </div>
              </div>

              {/* Workers List Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <Users size={16} className="text-blue-900" />
                    <span>Assigned Officers & Workers ({deptWorkers.length})</span>
                  </h3>
                  <span className="text-xs text-slate-500">
                    Showing all active line engineers & inspectors
                  </span>
                </div>

                {loadingWorkers ? (
                  <div className="py-12 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
                    <Clock className="w-7 h-7 animate-spin mx-auto mb-2 text-blue-700" />
                    <p>Loading assigned officers...</p>
                  </div>
                ) : deptWorkers.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 space-y-3">
                    <Users size={32} className="mx-auto text-slate-400" />
                    <h4 className="font-bold text-slate-800 text-sm">No Officers Assigned Yet</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Add field officers to {selectedDept.name} so complaints can be auto-assigned.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsAddWorkerModalOpen(true)}
                      className="gov-button-primary text-xs py-2 px-4 shadow-sm"
                    >
                      + Add First Officer
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {deptWorkers.map((worker) => (
                      <div
                        key={worker._id}
                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 hover:border-blue-300 transition-colors"
                      >
                        {/* Worker Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-900 to-indigo-800 text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-2xs">
                              {worker.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .substring(0, 2)
                                .toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-xs">{worker.name}</h4>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 uppercase">
                                  {worker.role.replace('_', ' ')}
                                </span>
                                {worker.badgeNumber && (
                                  <span className="font-mono text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                                    {worker.badgeNumber}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              {worker.activeTasksCount} Active Tasks
                            </span>
                          </div>
                        </div>

                        {/* Contact & Ward Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <Mail size={12} className="text-slate-400 shrink-0" />
                            <span className="truncate">{worker.email}</span>
                          </div>
                          {worker.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone size={12} className="text-slate-400 shrink-0" />
                              <span>{worker.phone}</span>
                            </div>
                          )}
                          {worker.wardId && (
                            <div className="flex items-center gap-1.5 sm:col-span-2 text-blue-900 font-medium">
                              <MapPin size={12} className="text-blue-700 shrink-0" />
                              <span>
                                Ward {worker.wardId.wardNumber}: {worker.wardId.name} ({worker.wardId.zone})
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Recent Tasks List */}
                        {worker.recentTasks && worker.recentTasks.length > 0 && (
                          <div className="pt-2 border-t border-slate-100 space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                              Recent Assigned Tasks:
                            </span>
                            <div className="space-y-1">
                              {worker.recentTasks.map((task) => (
                                <div
                                  key={task._id}
                                  className="flex items-center justify-between text-[11px] bg-slate-50 px-2 py-1 rounded border border-slate-100"
                                >
                                  <span className="font-mono font-bold text-blue-950 truncate max-w-[150px]">
                                    {task.complaintNumber}
                                  </span>
                                  <span
                                    className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                                      task.status === 'resolved' || task.status === 'closed'
                                        ? 'bg-emerald-100 text-emerald-900'
                                        : 'bg-amber-100 text-amber-900'
                                    }`}
                                  >
                                    {task.status.replace('_', ' ')}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setSelectedDept(null);
                  setDeptWorkers([]);
                }}
                className="gov-button-secondary text-xs py-2 px-5 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT DEPARTMENT MODAL */}
      {/* ========================================================================= */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-scale-up">
            <div className="p-5 bg-blue-950 text-white flex items-center justify-between">
              <h2 className="text-base font-extrabold flex items-center gap-2">
                <Building2 size={20} className="text-amber-400" />
                <span>{editingDept ? `Edit Department: ${editingDept.name}` : 'Add New Municipal Department'}</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsDeptModalOpen(false)}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDepartment} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-bold text-slate-800">
                    Department Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={deptForm.name}
                    onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                    placeholder="e.g. Public Works Department"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-700 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800">Department Code</label>
                  <select
                    value={deptForm.code}
                    onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-700 outline-none uppercase font-mono"
                  >
                    {DEPARTMENT_CODES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800">Department Icon</label>
                  <select
                    value={deptForm.icon}
                    onChange={(e) => setDeptForm({ ...deptForm, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-700 outline-none"
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-bold text-slate-800">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={deptForm.description}
                    onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                    placeholder="Responsibilities, scope of municipal works, and SLA oversight..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-700 outline-none resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800">Contact Email</label>
                  <input
                    type="email"
                    value={deptForm.contactEmail}
                    onChange={(e) => setDeptForm({ ...deptForm, contactEmail: e.target.value })}
                    placeholder="dept@civicconnect.gov.in"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-700 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800">Contact Phone / Helpline</label>
                  <input
                    type="text"
                    value={deptForm.contactPhone}
                    onChange={(e) => setDeptForm({ ...deptForm, contactPhone: e.target.value })}
                    placeholder="079-25350001"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-700 outline-none"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-bold text-slate-800">Handled Issue Categories (Comma-separated)</label>
                  <input
                    type="text"
                    value={deptForm.categories}
                    onChange={(e) => setDeptForm({ ...deptForm, categories: e.target.value })}
                    placeholder="pothole, broken road, damaged footpath, road_damage"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-700 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <input
                  type="checkbox"
                  id="activeToggle"
                  checked={deptForm.active}
                  onChange={(e) => setDeptForm({ ...deptForm, active: e.target.checked })}
                  className="rounded border-slate-300 text-blue-700 focus:ring-blue-700"
                />
                <label htmlFor="activeToggle" className="font-bold text-slate-800 cursor-pointer">
                  Department Active for Auto-Routing
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="gov-button-secondary text-xs py-2 px-4 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingDept}
                  className="gov-button-primary text-xs py-2 px-6 shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  {savingDept ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Check size={14} />}
                  <span>{editingDept ? 'Update Department' : 'Save Department'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD WORKER SUB-MODAL */}
      {/* ========================================================================= */}
      {isAddWorkerModalOpen && selectedDept && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-scale-up">
            <div className="p-5 bg-blue-950 text-white flex items-center justify-between">
              <h2 className="text-base font-extrabold flex items-center gap-2">
                <UserPlus size={20} className="text-amber-400" />
                <span>Add Officer to {selectedDept.name}</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsAddWorkerModalOpen(false)}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveWorker} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800">
                  Officer Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={workerForm.name}
                  onChange={(e) => setWorkerForm({ ...workerForm, name: e.target.value })}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-700 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={workerForm.email}
                    onChange={(e) => setWorkerForm({ ...workerForm, email: e.target.value })}
                    placeholder="officer@civicconnect.gov.in"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-700 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800">Phone Number</label>
                  <input
                    type="text"
                    value={workerForm.phone}
                    onChange={(e) => setWorkerForm({ ...workerForm, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-700 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800">Role</label>
                  <select
                    value={workerForm.role}
                    onChange={(e) => setWorkerForm({ ...workerForm, role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-700 outline-none"
                  >
                    <option value="field_officer">Field Officer / Inspector</option>
                    <option value="department_officer">Department Admin / Head</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800">Badge / Employee Number</label>
                  <input
                    type="text"
                    value={workerForm.badgeNumber}
                    onChange={(e) => setWorkerForm({ ...workerForm, badgeNumber: e.target.value })}
                    placeholder="e.g. PWD-FO-105"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-700 outline-none font-mono uppercase"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-bold text-slate-800">Assigned Municipal Ward</label>
                  <select
                    value={workerForm.wardId}
                    onChange={(e) => setWorkerForm({ ...workerForm, wardId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-700 outline-none"
                  >
                    <option value="">-- Central Zone (All Wards) --</option>
                    {wards.map((w) => (
                      <option key={w._id} value={w._id}>
                        Ward {w.wardNumber}: {w.name} ({w.zone})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddWorkerModalOpen(false)}
                  className="gov-button-secondary text-xs py-2 px-4 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingWorker}
                  className="gov-button-primary text-xs py-2 px-6 shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  {savingWorker ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Check size={14} />}
                  <span>Save Officer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
