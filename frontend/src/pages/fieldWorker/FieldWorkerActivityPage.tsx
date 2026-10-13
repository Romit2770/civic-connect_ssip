import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  History,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  FileText,
  Search,
  Filter,
  RefreshCw,
  HardHat,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { apiClient } from '../../api/client';

export default function FieldWorkerActivityPage() {
  const { t } = useTranslation();

  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchActivity();
  }, []);

  async function fetchActivity() {
    setLoading(true);
    try {
      const res = await apiClient.get('/field-worker/activity');
      if (res.data.success && res.data.data?.activities) {
        setActivities(res.data.data.activities);
      }
    } catch (err) {
      // Fallback
    } finally {
      setLoading(false);
    }
  }

  const filtered = activities.filter((act) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      act.activity.toLowerCase().includes(q) ||
      act.challengeId.toLowerCase().includes(q) ||
      act.location.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-blue-900 text-white">
            <History size={18} className="text-amber-400" />
          </span>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            My Field Activity History
          </h1>
        </div>
        <p className="text-xs text-slate-600 mt-1">
          Chronological audit trail of your ground site visits, GPS verifications, and report submissions.
        </p>
      </div>

      {/* 2. Search */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search activities by challenge, activity type, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none"
          />
        </div>
      </div>

      {/* 3. Activity Table / Timeline */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
            <RefreshCw size={16} className="animate-spin text-blue-900" />
            <span>Loading activity history...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <History size={32} className="mx-auto text-slate-300" />
            <p className="font-bold text-slate-700">No field activity records found.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Date & Time</th>
                    <th className="py-2.5 px-4">Activity Description</th>
                    <th className="py-2.5 px-4">Challenge / Project</th>
                    <th className="py-2.5 px-4">Site Location</th>
                    <th className="py-2.5 px-4">Result</th>
                    <th className="py-2.5 px-4">Report Ref</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {filtered.map((act) => (
                    <tr key={act.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{act.date}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{act.time}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{act.activity}</td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-900">{act.challengeId}</td>
                      <td className="py-3 px-4 text-slate-600 flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400 shrink-0" />
                        <span>{act.location}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-800">{act.result}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{act.reportId}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-900 text-[10px] font-bold border border-blue-200">
                          {act.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to="/field-worker/reports"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-900 hover:underline"
                        >
                          <Eye size={12} />
                          <span>View Report</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card View */}
            <div className="md:hidden divide-y divide-slate-200">
              {filtered.map((act) => (
                <div key={act.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-blue-900">{act.challengeId}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{act.date} • {act.time}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-xs">{act.activity}</h3>

                  <div className="flex items-center gap-1 text-xs text-slate-600">
                    <MapPin size={12} className="text-slate-400 shrink-0" />
                    <span>{act.location}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>Result: <strong className="text-emerald-800 font-bold">{act.result}</strong></span>
                    <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-900 font-bold text-[10px]">{act.status}</span>
                  </div>

                  <Link
                    to="/field-worker/reports"
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
                  >
                    <Eye size={12} />
                    <span>View Dossier Report</span>
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
