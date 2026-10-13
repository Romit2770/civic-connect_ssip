import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, ShieldAlert, FileText, ArrowRight } from 'lucide-react';
import { apiClient, getErrorMessage } from '../../api/client';
import ComplaintCard from '../../components/common/ComplaintCard';

export default function TrackReportPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [complaint, setComplaint] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setComplaint(null);

    try {
      const cleanId = query.trim().toUpperCase();
      const res = await apiClient.get(`/complaints/${cleanId}`);
      if (res.data.success && res.data.data) {
        setComplaint(res.data.data);
      }
    } catch (err: any) {
      setError(t('track.notFoundDesc'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gov-container max-w-2xl py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {t('track.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          {t('track.subtitle')}
        </p>
      </div>

      {/* Search Input Card */}
      <form onSubmit={handleSearch} className="gov-card p-4 sm:p-6 bg-white border border-slate-200 shadow-sm rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('track.placeholder')}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm font-mono uppercase tracking-wider text-slate-900 focus:outline-none focus:border-blue-700 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="gov-button-primary text-xs py-3 px-6 shadow-sm disabled:opacity-50"
          >
            {loading ? <span>{t('track.searching')}</span> : <span>{t('track.searchBtn')}</span>}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-center gap-2">
          <ShieldAlert size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {complaint && (
        <div className="space-y-4 animate-fadeIn">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            {t('detail.caseRecord')}
          </h2>
          <ComplaintCard complaint={complaint} />
        </div>
      )}
    </div>
  );
}
