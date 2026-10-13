import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ComplaintCategory, ComplaintPriority, ComplaintStatus, SLAState } from '../../types';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import SLAIndicator from './SLAIndicator';

// Fix Leaflet default icon path issues in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapComplaintFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    id: string;
    complaintNumber: string;
    title: string;
    category: ComplaintCategory;
    status: ComplaintStatus;
    priority: ComplaintPriority;
    slaState: SLAState;
    department?: string;
    ward?: string;
    wardNumber?: number;
    photo?: string;
    createdAt: string;
  };
}

interface HotspotItem {
  coordinates: [number, number]; // [lng, lat]
  count: number;
  criticalCount: number;
  densityLevel: 'low' | 'medium' | 'high' | 'critical';
  topCategories: string[];
}

interface WardFeature {
  type: 'Feature';
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: any;
  };
  properties: {
    id: string;
    wardNumber: number;
    name: string;
    zone: string;
    activeComplaints: number;
  };
}

interface ComplaintMapProps {
  complaints?: MapComplaintFeature[];
  hotspots?: HotspotItem[];
  wards?: WardFeature[];
  center?: [number, number];
  zoom?: number;
  showHotspots?: boolean;
  showWards?: boolean;
  height?: string;
  adminView?: boolean;
}

function RecenterMap({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom || map.getZoom());
  }, [center, zoom, map]);
  return null;
}

function createCustomPin(priority: ComplaintPriority, status: ComplaintStatus) {
  let color = '#2563eb'; // blue
  if (status === 'resolved' || status === 'closed') color = '#16a34a'; // green
  else if (status === 'in_progress') color = '#d97706'; // amber
  else if (priority === 'critical') color = '#dc2626'; // red

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export default function ComplaintMap({
  complaints = [],
  hotspots = [],
  wards = [],
  center = [23.0225, 72.5714], // [lat, lng]
  zoom = 12,
  showHotspots = false,
  showWards = false,
  height = '500px',
  adminView = false,
}: ComplaintMapProps) {
  const { t } = useTranslation();

  return (
    <div style={{ height }} className="w-full relative rounded-lg overflow-hidden border border-slate-300 shadow-xs">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <RecenterMap center={center} zoom={zoom} />

        {/* High-Performance OpenStreetMap Tile Server */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors • CivicConnect GIS'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Ward Boundary Polygon Layers */}
        {showWards &&
          wards.map((ward) => {
            const coords = ward.geometry.coordinates[0].map(
              (pt: [number, number]) => [pt[1], pt[0]] as [number, number]
            );
            return (
              <Polygon
                key={ward.properties.id}
                positions={coords}
                pathOptions={{
                  color: '#1e40af',
                  weight: 1.5,
                  fillColor: '#3b82f6',
                  fillOpacity: 0.08,
                }}
              >
                <Popup>
                  <div className="text-xs space-y-1 p-1">
                    <p className="font-bold text-slate-900">
                      Ward {ward.properties.wardNumber}: {ward.properties.name}
                    </p>
                    <p className="text-slate-600">Zone: {ward.properties.zone}</p>
                    <p className="text-blue-700 font-semibold">
                      Active Grievances: {ward.properties.activeComplaints}
                    </p>
                  </div>
                </Popup>
              </Polygon>
            );
          })}

        {/* Hotspot Density Circles */}
        {showHotspots &&
          hotspots.map((h, i) => {
            let color = '#3b82f6';
            if (h.densityLevel === 'critical') color = '#dc2626';
            else if (h.densityLevel === 'high') color = '#ea580c';
            else if (h.densityLevel === 'medium') color = '#f59e0b';

            return (
              <CircleMarker
                key={i}
                center={[h.coordinates[1], h.coordinates[0]]}
                radius={h.count * 6 + 10}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: 0.25,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="text-xs p-1 space-y-1">
                    <p className="font-bold text-slate-900 uppercase">
                      {h.densityLevel} Density Civic Hotspot
                    </p>
                    <p className="text-slate-700">
                      <strong>{h.count}</strong> Active complaints in this 200m zone.
                    </p>
                    {h.criticalCount > 0 && (
                      <p className="text-red-600 font-semibold">
                        🚨 {h.criticalCount} Critical priority cases
                      </p>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

        {/* Complaint Markers */}
        {complaints.map((c) => {
          const lat = c.geometry.coordinates[1];
          const lng = c.geometry.coordinates[0];
          if (!lat || !lng) return null;

          const detailLink = adminView
            ? `/admin/issues/${c.properties.complaintNumber || c.properties.id}`
            : `/issues/${c.properties.complaintNumber || c.properties.id}`;

          return (
            <Marker
              key={c.properties.id}
              position={[lat, lng]}
              icon={createCustomPin(c.properties.priority, c.properties.status)}
            >
              <Popup>
                <div className="text-xs p-1 space-y-2 min-w-[200px] text-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1 gap-2">
                    <span className="font-mono font-bold text-[11px] text-slate-900">
                      {c.properties.complaintNumber}
                    </span>
                    <PriorityBadge priority={c.properties.priority} size="sm" />
                  </div>

                  <p className="font-bold text-slate-900 line-clamp-1">{c.properties.title}</p>

                  <div className="flex flex-wrap gap-1">
                    <StatusBadge status={c.properties.status} size="sm" />
                    <SLAIndicator slaState={c.properties.slaState} size="sm" />
                  </div>

                  {c.properties.ward && (
                    <p className="text-[11px] text-slate-500">Ward: {c.properties.ward}</p>
                  )}

                  {c.properties.photo && (
                    <img
                      src={c.properties.photo}
                      alt="Evidence"
                      className="w-full h-20 object-cover rounded border border-slate-200 mt-1"
                    />
                  )}

                  <div className="pt-1.5 border-t border-slate-100">
                    <Link
                      to={detailLink}
                      className="text-blue-700 hover:text-blue-900 font-bold text-xs hover:underline block text-center"
                    >
                      {t('common.viewDetails')} →
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
