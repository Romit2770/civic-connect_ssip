import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  CheckCircle2,
  Lock,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Compass,
  AlertCircle,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';
import { EvidenceRecord, reverseGeocodeCoords, formatAccuracy } from '../../utils/evidenceValidator';

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  address: string;
  onChange: (lat: number, lng: number, address?: string, accuracy?: number) => void;
  evidenceRecords?: EvidenceRecord[];
  onBackToEvidence?: () => void;
}

// Locked GPS Pin Icon
const lockedPinIcon = L.divIcon({
  className: 'locked-gps-pin',
  html: `<div style="position:relative; width:34px; height:34px; display:flex; align-items:center; justify-content:center;">
    <div style="position:absolute; width:34px; height:34px; border-radius:50%; background:rgba(16, 185, 129, 0.25); animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
    <div style="background-color: #059669; width: 26px; height: 26px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; color:white; font-size:13px; font-weight:bold; z-index:2;">📍</div>
  </div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

// Map Controller for smooth flyTo
function LockedMapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center[0] && center[1]) {
      map.flyTo(center, 16, { duration: 1.2 });
    }
  }, [center[0], center[1], map]);
  return null;
}

// Helper to format coordinates as 22.957562°N, 72.823217°E
function formatCoordinatesDMS(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(6)}°${latDir}, ${Math.abs(lng).toFixed(6)}°${lngDir}`;
}

export default function LocationPicker({
  latitude,
  longitude,
  address,
  onChange,
  evidenceRecords = [],
  onBackToEvidence,
}: LocationPickerProps) {
  const primaryEvidence = evidenceRecords[0];

  // Derive authoritative location from confirmed Step 2 evidence or props
  const authoritativeLat = latitude ?? primaryEvidence?.latitude ?? null;
  const authoritativeLng = longitude ?? primaryEvidence?.longitude ?? null;
  const [currentAccuracy, setCurrentAccuracy] = useState<number>(primaryEvidence?.accuracy || 15);
  const authoritativeAccuracy = currentAccuracy || primaryEvidence?.accuracy || 15;
  const authoritativeTimestamp =
    primaryEvidence?.capturedAt || primaryEvidence?.recordedAt || 'Recent Live Capture';

  const [resolvedAddress, setResolvedAddress] = useState<string>(
    address || primaryEvidence?.address || primaryEvidence?.locationName || ''
  );
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [reloadStatus, setReloadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [reloadMessage, setReloadMessage] = useState<string | null>(null);

  // Reload current location with fresh high-accuracy GPS fix
  const handleReloadLocation = () => {
    if (!navigator.geolocation) {
      setReloadStatus('error');
      setReloadMessage('Geolocation is not supported by your browser.');
      return;
    }

    setIsReloading(true);
    setReloadStatus('loading');
    setReloadMessage('Acquiring fresh high-accuracy satellite GPS fix from device sensors...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const freshLat = pos.coords.latitude;
        const freshLng = pos.coords.longitude;
        const freshAccuracy = Math.round(pos.coords.accuracy * 10) / 10;

        setCurrentAccuracy(freshAccuracy);

        let freshAddress = '';
        try {
          setIsGeocoding(true);
          const geo = await reverseGeocodeCoords(freshLat, freshLng);
          if (geo?.address) {
            freshAddress = geo.address;
            setResolvedAddress(geo.address);
          }
        } catch (err) {
          console.warn('Geocoding error during location reload:', err);
        } finally {
          setIsGeocoding(false);
        }

        onChange(freshLat, freshLng, freshAddress || resolvedAddress, freshAccuracy);

        setReloadStatus('success');
        setReloadMessage(`Location refreshed successfully! Accuracy: ±${Math.round(freshAccuracy)}m`);
        setIsReloading(false);

        setTimeout(() => {
          setReloadStatus('idle');
          setReloadMessage(null);
        }, 5000);
      },
      (err) => {
        let msg = 'Failed to reload location.';
        if (err.code === 1) msg = 'Location permission denied. Please allow location access in your browser settings.';
        else if (err.code === 2) msg = 'Location position unavailable. Please ensure device GPS is turned on.';
        else if (err.code === 3) msg = 'Location request timed out. Please click Reload Location again.';
        setReloadStatus('error');
        setReloadMessage(msg);
        setIsReloading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // Sync authoritative coordinates to parent state
  useEffect(() => {
    if (primaryEvidence?.latitude !== undefined && primaryEvidence?.longitude !== undefined) {
      if (latitude !== primaryEvidence.latitude || longitude !== primaryEvidence.longitude) {
        onChange(
          primaryEvidence.latitude,
          primaryEvidence.longitude,
          primaryEvidence.address || primaryEvidence.locationName || address
        );
      }
    }
  }, [primaryEvidence, latitude, longitude, onChange, address]);

  // Reverse geocode if address not yet available
  useEffect(() => {
    if (authoritativeLat !== null && authoritativeLng !== null) {
      if (!resolvedAddress || resolvedAddress.startsWith('Coordinates:')) {
        setIsGeocoding(true);
        reverseGeocodeCoords(authoritativeLat, authoritativeLng)
          .then((geo) => {
            if (geo?.address) {
              setResolvedAddress(geo.address);
              onChange(authoritativeLat, authoritativeLng, geo.address);
            }
          })
          .catch(() => {})
          .finally(() => setIsGeocoding(false));
      }
    }
  }, [authoritativeLat, authoritativeLng]);

  // Check for multi-evidence location discrepancy (>100m)
  const hasMultipleLocations = evidenceRecords.length > 1;
  let hasLocationDiscrepancy = false;
  if (hasMultipleLocations && authoritativeLat !== null && authoritativeLng !== null) {
    for (let i = 1; i < evidenceRecords.length; i++) {
      const rec = evidenceRecords[i];
      if (rec.latitude !== undefined && rec.longitude !== undefined) {
        const dLat = Math.abs(rec.latitude - authoritativeLat);
        const dLng = Math.abs(rec.longitude - authoritativeLng);
        // ~0.001 deg is approx 110m
        if (dLat > 0.001 || dLng > 0.001) {
          hasLocationDiscrepancy = true;
          break;
        }
      }
    }
  }

  // Fallback state if evidence GPS is missing
  if (authoritativeLat === null || authoritativeLng === null) {
    return (
      <div className="p-8 bg-amber-50/70 border border-amber-300 rounded-xl space-y-4 text-center animate-fadeIn">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto border border-amber-300">
          <AlertCircle size={26} />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-slate-900">Verified Evidence GPS Required</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            CivicConnect requires live geotagged evidence to prevent fake or duplicate reports.
            Please return to Step 2 to capture a live photo or live video with verified device GPS.
          </p>
        </div>
        {onBackToEvidence && (
          <button
            type="button"
            onClick={onBackToEvidence}
            className="px-5 py-2.5 bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <RotateCcw size={14} />
            <span>Return to Step 2 Evidence</span>
          </button>
        )}
      </div>
    );
  }

  const accuracyData = formatAccuracy(authoritativeAccuracy);

  return (
    <div className="space-y-4">
      {/* 1. AUTHORITATIVE CAMERA GPS LOCKED PANEL (Matching Requirements) */}
      <div className="p-4 bg-emerald-50/80 border border-emerald-300 rounded-xl space-y-3 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/80 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <h3 className="font-extrabold text-xs sm:text-sm text-emerald-950 uppercase tracking-wide">
              Authoritative Camera GPS Locked
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="reload-location-btn"
              onClick={handleReloadLocation}
              disabled={isReloading}
              className="bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 disabled:opacity-60 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
              title="Acquire fresh live GPS fix from device sensors"
            >
              <RefreshCw size={12} className={isReloading ? 'animate-spin' : ''} />
              <span>{isReloading ? 'Reloading...' : 'Reload Location'}</span>
            </button>
            <span className="bg-emerald-700 text-white font-extrabold text-[9px] px-2 py-1 rounded tracking-wider uppercase flex items-center gap-1 shadow-xs">
              <ShieldCheck size={11} />
              LIVE EVIDENCE VERIFIED
            </span>
          </div>
        </div>

        <p className="text-xs text-emerald-900 leading-relaxed font-medium">
          Coordinates locked directly from verified live evidence captured during Step 2.
          Manual repositioning is disabled to protect grievance evidence integrity.
        </p>

        {/* Real GPS Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {/* Coordinates */}
          <div className="bg-white/90 border border-emerald-200 rounded-lg p-2.5 space-y-0.5 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Locked Coordinates
            </span>
            <div className="font-mono font-extrabold text-xs text-slate-900 flex items-center gap-1">
              <MapPin size={13} className="text-emerald-600 shrink-0" />
              <span>{formatCoordinatesDMS(authoritativeLat, authoritativeLng)}</span>
            </div>
          </div>

          {/* GPS Accuracy */}
          <div className="bg-white/90 border border-emerald-200 rounded-lg p-2.5 space-y-0.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                GPS Accuracy
              </span>
              <button
                type="button"
                onClick={handleReloadLocation}
                disabled={isReloading}
                className="text-[10px] text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-0.5 cursor-pointer underline"
                title="Reload GPS for improved accuracy"
              >
                <RefreshCw size={9} className={isReloading ? 'animate-spin' : ''} />
                <span>Reload</span>
              </button>
            </div>
            <div className="font-bold text-xs text-emerald-800 flex items-center gap-1">
              <Compass size={13} className="text-emerald-600 shrink-0" />
              <span>{accuracyData.text}</span>
            </div>
          </div>

          {/* Location Source */}
          <div className="bg-white/90 border border-emerald-200 rounded-lg p-2.5 space-y-0.5 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Location Source
            </span>
            <div className="font-bold text-xs text-blue-900 flex items-center gap-1">
              <CheckCircle2 size={13} className="text-blue-600 shrink-0" />
              <span>Verified Camera GPS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reload Notification Status Banner */}
      {reloadMessage && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 shadow-xs transition-all ${
            reloadStatus === 'loading'
              ? 'bg-blue-50 border-blue-200 text-blue-900'
              : reloadStatus === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {reloadStatus === 'loading' && <RefreshCw size={15} className="text-blue-600 animate-spin shrink-0" />}
            {reloadStatus === 'success' && <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />}
            {reloadStatus === 'error' && <AlertTriangle size={15} className="text-red-600 shrink-0" />}
            <span className="font-semibold">{reloadMessage}</span>
          </div>
          {reloadStatus === 'error' && (
            <button
              type="button"
              onClick={handleReloadLocation}
              className="text-xs font-bold underline cursor-pointer hover:text-red-950 shrink-0"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Discrepancy Warning if multi-evidence coordinates vary */}
      {hasLocationDiscrepancy && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-xs flex items-center gap-2">
          <AlertTriangle size={15} className="text-amber-600 shrink-0" />
          <span>Evidence files contain slightly different capture coordinates. Locked to primary verified evidence.</span>
        </div>
      )}

      {/* 2. LEAFLET MAP WITH LOCKED MARKER & ACCURACY CIRCLE */}
      <div className="h-72 w-full rounded-xl overflow-hidden border border-slate-300 relative shadow-inner bg-slate-100">
        <MapContainer
          center={[authoritativeLat, authoritativeLng]}
          zoom={16}
          scrollWheelZoom={true}
          touchZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Locked Marker (Not Draggable) */}
          <Marker
            position={[authoritativeLat, authoritativeLng]}
            draggable={false}
            icon={lockedPinIcon}
          />

          {/* Real GPS Accuracy Circle */}
          <Circle
            center={[authoritativeLat, authoritativeLng]}
            radius={authoritativeAccuracy}
            pathOptions={{
              color: '#059669',
              fillColor: '#10b981',
              fillOpacity: 0.18,
              weight: 1.5,
            }}
          />

          {/* Smooth Fly-To Controller */}
          <LockedMapController center={[authoritativeLat, authoritativeLng]} />
        </MapContainer>

        {/* Floating Locked Badge on Map */}
        <div className="absolute top-3 left-3 z-[400] bg-slate-950/85 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-md backdrop-blur-xs flex items-center gap-1.5 border border-emerald-400/40">
          <Lock size={12} className="text-emerald-400" />
          <span>Verified Camera GPS Locked</span>
        </div>

        {/* Floating Reload GPS Button on Map */}
        <button
          type="button"
          onClick={handleReloadLocation}
          disabled={isReloading}
          className="absolute top-3 right-3 z-[400] bg-white/95 hover:bg-white text-slate-800 text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-md border border-slate-300 flex items-center gap-1.5 cursor-pointer transition-all backdrop-blur-xs hover:border-emerald-500"
          title="Reload live GPS coordinates"
        >
          <RefreshCw size={12} className={`text-emerald-600 ${isReloading ? 'animate-spin' : ''}`} />
          <span>{isReloading ? 'Reloading...' : 'Reload GPS'}</span>
        </button>

        {/* Bottom Accuracy Overlay Pill */}
        <div className="absolute bottom-3 right-3 z-[400] bg-white/90 text-slate-800 text-[10px] font-mono px-2.5 py-1 rounded shadow-md backdrop-blur-xs border border-slate-200">
          Accuracy Radius: ±{Math.round(authoritativeAccuracy)}m
        </div>
      </div>

      {/* 3. DETECTED STREET & MUNICIPAL ADDRESS CARD (Read-Only) */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-800">
            Detected Street & Municipal Address
          </label>
          <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
            <CheckCircle2 size={12} /> Auto-detected from verified GPS
          </span>
        </div>

        <div className="p-3 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 font-medium leading-relaxed shadow-2xs">
          {isGeocoding ? (
            <span className="text-slate-400 italic">Resolving municipal street address from GPS...</span>
          ) : resolvedAddress ? (
            resolvedAddress
          ) : (
            <span className="text-slate-500 font-mono">
              Coordinates: {authoritativeLat.toFixed(6)}, {authoritativeLng.toFixed(6)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
          <span>Captured at: {authoritativeTimestamp}</span>
          <span className="font-mono">Lat: {authoritativeLat.toFixed(6)}, Lng: {authoritativeLng.toFixed(6)}</span>
        </div>
      </div>
    </div>
  );
}
