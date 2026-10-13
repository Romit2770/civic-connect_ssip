import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Layers, Flame, Shield, Building2 } from 'lucide-react';
import { apiClient } from '../../api/client';
import ComplaintMap from '../../components/common/ComplaintMap';

export default function LiveMapPage() {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [showWards, setShowWards] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
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

      const [cRes, wRes, hRes] = await Promise.all([
        apiClient.get(complaintUrl),
        apiClient.get('/map/wards'),
        apiClient.get('/map/hotspots'),
      ]);

      if (cRes.data.success) setComplaints(cRes.data.data?.features || []);
      if (wRes.data.success) setWards(wRes.data.data?.features || []);
      if (hRes.data.success) setHotspots(hRes.data.data || []);
    } catch (e) {
      console.warn('Live map load error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <MapPin size={24} className="text-blue-900" />
            <span>GIS Operational Command Map</span>
          </h1>
          <p className="text-xs text-slate-600">
            Real-time geospatial surveillance with automated hotspot clustering and ward boundaries.
          </p>
        </div>

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
            <Building2 size={13} className="inline mr-1" />
            Wards Layer
          </button>

          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className={`px-3 py-2 rounded-md font-semibold border transition-colors cursor-pointer ${
              showHotspots ? 'bg-red-700 text-white border-red-700' : 'bg-white text-slate-700 border-slate-300'
            }`}
          >
            <Flame size={13} className="inline mr-1" />
            Hotspot Heatmap
          </button>
        </div>
      </div>

      <ComplaintMap
        complaints={complaints}
        wards={wards}
        hotspots={hotspots}
        showWards={showWards}
        showHotspots={showHotspots}
        height="640px"
        adminView={true}
      />
    </div>
  );
}
