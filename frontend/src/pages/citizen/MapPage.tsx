import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Filter, Layers, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../api/client';
import ComplaintMap from '../../components/common/ComplaintMap';
import { ComplaintCategory, ComplaintStatus } from '../../types';

export default function MapPage() {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [category, setCategory] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [showWards, setShowWards] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMapData();
  }, [category, status]);

  const loadMapData = async () => {
    setLoading(true);
    try {
      let complaintUrl = '/map/complaints?';
      if (category) complaintUrl += `category=${category}&`;
      if (status) complaintUrl += `status=${status}&`;

      const [complaintsRes, wardsRes, hotspotsRes] = await Promise.all([
        apiClient.get(complaintUrl),
        apiClient.get('/map/wards'),
        apiClient.get('/map/hotspots'),
      ]);

      if (complaintsRes.data.success) {
        setComplaints(complaintsRes.data.data?.features || []);
      }
      if (wardsRes.data.success) {
        setWards(wardsRes.data.data?.features || []);
      }
      if (hotspotsRes.data.success) {
        setHotspots(hotspotsRes.data.data || []);
      }
    } catch (e) {
      console.warn('Map data loading error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gov-container py-6 space-y-6">
      {/* Header & Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <MapPin size={24} className="text-blue-700" />
            <span>{t('nav.cityMap')}</span>
          </h1>
          <p className="text-xs text-slate-600">
            Public transparency GIS mapping of municipal grievances, ward boundaries, and hotspots.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 font-semibold focus:outline-none focus:border-blue-700"
          >
            <option value="">{t('admin.filterCategory')}</option>
            <option value="pothole">{t('categories.pothole')}</option>
            <option value="garbage">{t('categories.garbage')}</option>
            <option value="streetlight">{t('categories.streetlight')}</option>
            <option value="water">{t('categories.water')}</option>
            <option value="drainage">{t('categories.drainage')}</option>
            <option value="fallen_tree">{t('categories.fallen_tree')}</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 font-semibold focus:outline-none focus:border-blue-700"
          >
            <option value="">{t('admin.filterStatus')}</option>
            <option value="submitted">{t('status.submitted')}</option>
            <option value="in_progress">{t('status.in_progress')}</option>
            <option value="resolved">{t('status.resolved')}</option>
          </select>

          <button
            onClick={() => setShowWards(!showWards)}
            className={`px-3 py-2 rounded-md font-semibold border transition-colors cursor-pointer ${
              showWards ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-slate-700 border-slate-300'
            }`}
          >
            Wards Layer
          </button>

          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className={`px-3 py-2 rounded-md font-semibold border transition-colors cursor-pointer ${
              showHotspots ? 'bg-red-700 text-white border-red-700' : 'bg-white text-slate-700 border-slate-300'
            }`}
          >
            Hotspots Layer
          </button>
        </div>
      </div>

      {/* Main Map */}
      <ComplaintMap
        complaints={complaints}
        wards={wards}
        hotspots={hotspots}
        showWards={showWards}
        showHotspots={showHotspots}
        height="620px"
      />
    </div>
  );
}
