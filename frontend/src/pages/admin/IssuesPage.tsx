import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FileSpreadsheet,
  Search,
  Filter,
  UserCheck,
  Building2,
  Calendar,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import SLAIndicator from '../../components/common/SLAIndicator';
import { Complaint } from '../../types';

export default function IssuesPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [priority, setPriority] = useState(searchParams.get('priority') || '');

  useEffect(() => {
    loadComplaints();
  }, [page, category, status, priority]);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      let query = `?page=${page}&limit=10`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (category) query += `&category=${category}`;
      if (status) query += `&status=${status}`;
      if (priority) query += `&priority=${priority}`;

      const res = await apiClient.get(`/complaints${query}`);
      if (res.data.success) {
        setComplaints(res.data.data || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotalCount(res.data.pagination?.total || 0);
      }
    } catch (e) {
      console.warn('Failed to load complaints registry');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadComplaints();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet size={24} className="text-blue-900" />
            <span>{t('nav.issues')}</span>
          </h1>
          <p className="text-xs text-slate-600">
            Master municipal grievance registry ({totalCount} total cases logged)
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="gov-card p-4 bg-white border border-slate-200 rounded-xl space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-2 text-xs">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, keyword, or street address..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-700"
            />
          </div>

          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 font-semibold focus:outline-none focus:border-blue-700"
          >
            <option value="">{t('admin.filterCategory')}</option>
            <option value="pothole">{t('categories.pothole')}</option>
            <option value="garbage">{t('categories.garbage')}</option>
            <option value="streetlight">{t('categories.streetlight')}</option>
            <option value="water">{t('categories.water')}</option>
            <option value="drainage">{t('categories.drainage')}</option>
            <option value="road_damage">{t('categories.road_damage')}</option>
            <option value="fallen_tree">{t('categories.fallen_tree')}</option>
            <option value="illegal_dumping">{t('categories.illegal_dumping')}</option>
            <option value="public_property">{t('categories.public_property')}</option>
            <option value="traffic">{t('categories.traffic')}</option>
            <option value="other">{t('categories.other')}</option>
          </select>

          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 font-semibold focus:outline-none focus:border-blue-700"
          >
            <option value="">{t('admin.filterStatus')}</option>
            <option value="submitted">{t('status.submitted')}</option>
            <option value="assigned">{t('status.assigned')}</option>
            <option value="in_progress">{t('status.in_progress')}</option>
            <option value="verification_pending">{t('status.verification_pending')}</option>
            <option value="resolved">{t('status.resolved')}</option>
          </select>

          <select
            value={priority}
            onChange={(e) => { setPriority(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 font-semibold focus:outline-none focus:border-blue-700"
          >
            <option value="">{t('admin.filterPriority')}</option>
            <option value="critical">{t('priority.critical')}</option>
            <option value="high">{t('priority.high')}</option>
            <option value="medium">{t('priority.medium')}</option>
            <option value="low">{t('priority.low')}</option>
          </select>

          <button
            type="submit"
            className="gov-button-primary text-xs py-2 px-4 bg-blue-900 shadow-2xs"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Master Data Table */}
      <div className="gov-card bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0a2540] text-white uppercase text-[11px] tracking-wider font-semibold">
              <tr>
                <th className="p-3.5">{t('admin.tableId')}</th>
                <th className="p-3.5">{t('admin.tableCategory')}</th>
                <th className="p-3.5">{t('admin.tablePriority')}</th>
                <th className="p-3.5">{t('admin.tableStatus')}</th>
                <th className="p-3.5">{t('admin.tableSla')}</th>
                <th className="p-3.5">{t('admin.tableOfficer')}</th>
                <th className="p-3.5 text-right">{t('admin.tableActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <Clock className="w-6 h-6 animate-spin mx-auto mb-1 text-blue-700" />
                    <span>Loading grievance records...</span>
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No complaints matching the selected criteria.
                  </td>
                </tr>
              ) : (
                complaints.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-blue-900">
                      <Link to={`/admin/issues/${c.complaintNumber || c._id}`} className="hover:underline">
                        {c.complaintNumber}
                      </Link>
                    </td>
                    <td className="p-3.5 font-semibold capitalize text-slate-900">
                      {t(`categories.${c.category}`)}
                    </td>
                    <td className="p-3.5">
                      <PriorityBadge priority={c.priority} size="sm" />
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="p-3.5">
                      <SLAIndicator slaState={c.slaState} deadline={c.slaDeadline} size="sm" />
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {c.assignedOfficerId?.name || (
                        <span className="text-amber-700 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <Link
                        to={`/admin/issues/${c.complaintNumber || c._id}`}
                        className="text-blue-700 hover:text-blue-900 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <span>Inspect</span>
                        <ExternalLink size={12} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>Page <strong>{page}</strong> of <strong>{totalPages}</strong></span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded bg-white border border-slate-300 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded bg-white border border-slate-300 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
