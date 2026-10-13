import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FilePlus2,
  FileText,
  Filter,
  CheckCircle2,
  Clock,
  Wrench,
  AlertCircle,
  WifiOff,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { useOffline } from '../../context/OfflineContext';
import ComplaintCard from '../../components/common/ComplaintCard';
import EmptyState from '../../components/common/EmptyState';
import { Complaint, ComplaintStatus } from '../../types';

export default function MyReportsPage() {
  const { t } = useTranslation();
  const { isOnline, drafts, deleteDraft } = useOffline();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadMyComplaints();
  }, [statusFilter]);

  const loadMyComplaints = async () => {
    setLoading(true);
    try {
      let url = '/complaints?my=true';
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }
      const res = await apiClient.get(url);
      if (res.data.success) {
        setComplaints(res.data.data || []);
      }
    } catch (e) {
      console.warn('Failed to load citizen complaints');
    } finally {
      setLoading(false);
    }
  };

  const filterTabs = [
    { key: 'all', label: t('myReports.tabAll') },
    { key: 'submitted', label: t('status.submitted') },
    { key: 'in_progress', label: t('status.in_progress') },
    { key: 'verification_pending', label: t('status.verification_pending') },
    { key: 'resolved', label: t('status.resolved') },
  ];

  return (
    <div className="gov-container py-8 space-y-8">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {t('myReports.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            {t('myReports.subtitle')}
          </p>
        </div>

        <Link
          to="/report"
          className="gov-button-primary text-xs py-2.5 px-5 shadow-sm flex items-center gap-1.5"
        >
          <FilePlus2 size={16} />
          <span>{t('home.ctaReport')}</span>
        </Link>
      </div>

      {/* Offline Drafts Alert Section */}
      {drafts.length > 0 && (
        <div className="gov-card p-4 bg-amber-50/80 border border-amber-300 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
              <WifiOff size={18} />
              <span>{t('myReports.tabDrafts')} ({drafts.length})</span>
            </div>
            <span className="text-[11px] text-amber-700">
              {isOnline ? t('common.online') : t('common.offline')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="p-3 bg-white rounded-lg border border-amber-200 text-xs space-y-2"
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-900 capitalize">
                    {t(`categories.${draft.category}`)}
                  </span>
                  <button
                    onClick={() => deleteDraft(draft.id)}
                    className="text-red-600 hover:text-red-800 p-1 cursor-pointer"
                    title="Delete Draft"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-slate-600 line-clamp-2">{draft.description}</p>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {t('common.createdOn')}: {new Date(draft.savedAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-slate-200 text-xs font-semibold">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-t-lg transition-colors cursor-pointer border-b-2 ${
              statusFilter === tab.key
                ? 'border-blue-700 text-blue-900 font-bold bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grievances List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-700" />
          <p>{t('common.loading')}</p>
        </div>
      ) : complaints.length === 0 ? (
        <EmptyState
          title={t('myReports.emptyTitle')}
          description={t('myReports.emptyDesc')}
          actionText={t('myReports.fileFirstBtn')}
          actionHref="/report"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complaints.map((c) => (
            <ComplaintCard key={c._id} complaint={c} />
          ))}
        </div>
      )}
    </div>
  );
}
