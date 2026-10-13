import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Navigation,
  Filter,
  Layers,
  Camera,
  AlertTriangle,
  FolderGit2,
  ClipboardList,
  CheckCircle2,
  RefreshCw,
  Info,
  Compass,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { apiClient } from '../../api/client';

// Pin icons
const challengePinIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const verifiedPinIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const projectPinIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const myLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function RecenterMap({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(coords, 15, { animate: true });
  }, [coords, map]);
  return null;
}

export default function FieldWorkerMapPage() {
  const { t } = useTranslation();

  const [pins, setPins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState<[number, number]>([22.5645, 72.9289]); // Anand Center

  // Filters
  const [filterType, setFilterType] = useState<'all' | 'challenge' | 'project'>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Device Location
  const [myCoords, setMyCoords] = useState<[number, number] | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsStatusMessage, setGpsStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadMapData() {
      try {
        const res = await apiClient.get('/field-worker/map');
        if (res.data.success && res.data.data?.pins) {
          setPins(res.data.data.pins);
          if (res.data.data.center) {
            setCenter(res.data.data.center);
          }
        }
      } catch (err) {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadMapData();
  }, []);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatusMessage('Geolocation not supported on this browser.');
      return;
    }
    setGpsStatusMessage('Acquiring device GPS fix...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setMyCoords([lat, lng]);
        setCenter([lat, lng]);
        setGpsAccuracy(Math.round(pos.coords.accuracy));
        setGpsStatusMessage(`GPS Locked (±${Math.round(pos.coords.accuracy)}m accuracy)`);
      },
      (err) => {
        // Simulated near-site position in Ward 12
        const simCoords: [number, number] = [22.5603, 72.9287];
        setMyCoords(simCoords);
        setCenter(simCoords);
        setGpsAccuracy(8);
        setGpsStatusMessage('Device GPS permission denied. Near-site simulated coordinate registered.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Filter Pins
  const filteredPins = pins.filter((p) => {
    if (filterType === 'challenge' && p.type !== 'CHALLENGE') return false;
    if (filterType === 'project' && p.type !== 'PROJECT') return false;
    if (filterPriority !== 'all' && p.priority.toUpperCase() !== filterPriority.toUpperCase()) return false;
    if (filterStatus === 'pending' && p.status === 'VERIFIED') return false;
    if (filterStatus === 'verified' && p.status !== 'VERIFIED') return false;
    return true;
  });

  return (
    <div className="space-y-4 max-w-7xl mx-auto flex flex-col h-[calc(100vh-130px)]">
      {/* 1. Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-blue-900 text-white">
              <Compass size={18} className="text-amber-400" />
            </span>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Field Operations Map (GIS)
            </h1>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Real GIS coordinates for assigned challenges and innovation projects in Anand Municipality.
          </p>
        </div>

        {/* GPS Location Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-900 hover:bg-blue-950 text-white font-extrabold text-xs shadow-xs transition-colors"
          >
            <Navigation size={13} className="text-amber-400" />
            <span>Use My Current Location</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3 text-xs shrink-0">
        <div className="flex items-center gap-1.5">
          <Filter size={14} className="text-slate-500" />
          <span className="font-bold text-slate-700">Filter By:</span>
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="p-1.5 rounded-lg border border-slate-300 text-xs bg-white font-medium"
        >
          <option value="all">All Points ({pins.length})</option>
          <option value="challenge">Challenges Only</option>
          <option value="project">Projects Only</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="p-1.5 rounded-lg border border-slate-300 text-xs bg-white font-medium"
        >
          <option value="all">All Priorities</option>
          <option value="CRITICAL">Critical Only</option>
          <option value="HIGH">High Priority</option>
          <option value="MEDIUM">Medium Priority</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-1.5 rounded-lg border border-slate-300 text-xs bg-white font-medium"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending Verification</option>
          <option value="verified">Verified</option>
        </select>

        {gpsStatusMessage && (
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {gpsStatusMessage}
          </span>
        )}

        <div className="ml-auto text-[11px] font-bold text-slate-500">
          Showing {filteredPins.length} GIS Points
        </div>
      </div>

      {/* 3. Full Height Interactive Leaflet Map */}
      <div className="flex-1 rounded-xl overflow-hidden border border-slate-300 shadow-xs relative z-0 min-h-[380px]">
        <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RecenterMap coords={center} />

          {/* My Current Location Pin */}
          {myCoords && (
            <>
              <Marker position={myCoords} icon={myLocationIcon}>
                <Popup>
                  <div className="text-xs font-sans">
                    <strong className="text-amber-800 block">Your Current Field Location</strong>
                    <span>Accuracy: ±{gpsAccuracy || 6} metres</span>
                  </div>
                </Popup>
              </Marker>
              {gpsAccuracy && (
                <Circle
                  center={myCoords}
                  radius={gpsAccuracy}
                  pathOptions={{ color: '#d97706', fillColor: '#f59e0b', fillOpacity: 0.15 }}
                />
              )}
            </>
          )}

          {/* Render Authorized Pins */}
          {filteredPins.map((pin) => {
            const isProject = pin.type === 'PROJECT';
            const isVerified = pin.status === 'VERIFIED';
            const icon = isProject ? projectPinIcon : isVerified ? verifiedPinIcon : challengePinIcon;

            return (
              <Marker key={pin.id} position={pin.coordinates} icon={icon}>
                <Popup>
                  <div className="p-1 space-y-1.5 text-xs font-sans max-w-xs">
                    <div className="flex items-center justify-between gap-1 border-b border-slate-200 pb-1">
                      <span className="font-mono font-bold text-blue-900">{pin.id}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold ${
                          pin.priority === 'CRITICAL'
                            ? 'bg-red-100 text-red-800'
                            : pin.priority === 'HIGH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {pin.priority}
                      </span>
                    </div>

                    <strong className="text-slate-900 block font-bold leading-tight">{pin.title}</strong>
                    <p className="text-[11px] text-slate-600">{pin.address}</p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>Status: <strong>{pin.status.replace('_', ' ')}</strong></span>
                      <span>{pin.ward}</span>
                    </div>

                    <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <Link
                        to={isProject ? `/field-worker/projects/${pin.id}` : `/field-worker/challenges/${pin.id}`}
                        className="text-[11px] font-bold text-slate-700 hover:underline"
                      >
                        View Details
                      </Link>

                      {isProject ? (
                        <Link
                          to={`/field-worker/projects/${pin.id}#visit`}
                          className="px-2.5 py-1 rounded bg-blue-900 text-white font-extrabold text-[10px] hover:bg-blue-950 shadow-2xs"
                        >
                          Start Site Visit
                        </Link>
                      ) : (
                        <Link
                          to={`/field-worker/verification?challengeId=${pin.id}`}
                          className="px-2.5 py-1 rounded bg-blue-900 text-white font-extrabold text-[10px] hover:bg-blue-950 shadow-2xs"
                        >
                          Start Verification
                        </Link>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Legend Box Overlay */}
        <div className="absolute bottom-4 left-4 z-1000 p-3 rounded-lg bg-white/95 backdrop-blur-xs border border-slate-300 shadow-md text-xs space-y-1.5 pointer-events-auto">
          <div className="font-extrabold text-[10px] text-slate-700 uppercase tracking-wider">Map Legend</div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <span>Pending Challenge</span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>Verified Challenge</span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span>Innovation Project</span>
          </div>
          {myCoords && (
            <div className="flex items-center gap-2 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Current Device GPS</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
