import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polygon, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Layers,
  Filter,
  Eye,
  RefreshCw,
  Building,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  Compass,
} from 'lucide-react';
import { apiClient, getErrorMessage } from '../../api/client';

// Fix leaflet icon urls in vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Helper component to recenter map when selected ward changes
function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

export default function MunicipalityMapPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapData, setMapData] = useState<any>(null);

  // Filters
  const [selectedLayer, setSelectedLayer] = useState<string>('All Issues');
  const [selectedWardFilter, setSelectedWardFilter] = useState<number | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([22.5645, 72.9289]);

  const loadMapData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/municipality/map');
      if (res.data.success) {
        setMapData(res.data.data);
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMapData();
  }, []);

  const layers = [
    'All Issues',
    'Water Issues',
    'Waste Issues',
    'Road Issues',
    'Environment',
    'Public Infrastructure',
    'Drainage',
    'Street Lighting',
    'Public Health',
  ];

  // Filter markers based on selected layer and ward
  const markers = (mapData?.mapMarkers || []).filter((m: any) => {
    const props = m.properties;
    // Ward filter
    if (selectedWardFilter !== null && props.wardNumber !== selectedWardFilter) {
      return false;
    }

    // Category / Layer filter
    if (selectedLayer === 'All Issues') return true;
    if (selectedLayer === 'Water Issues') return props.category?.toLowerCase().includes('water');
    if (selectedLayer === 'Waste Issues') return props.category?.toLowerCase().includes('waste');
    if (selectedLayer === 'Road Issues') return props.category?.toLowerCase().includes('road');
    if (selectedLayer === 'Environment') return props.category?.toLowerCase().includes('environment');
    if (selectedLayer === 'Public Infrastructure') return props.category?.toLowerCase().includes('infrastructure');
    if (selectedLayer === 'Drainage') return props.category?.toLowerCase().includes('drainage');
    if (selectedLayer === 'Street Lighting') return props.category?.toLowerCase().includes('light');
    if (selectedLayer === 'Public Health') return props.category?.toLowerCase().includes('health');
    return true;
  });

  const wardPolygons = mapData?.wardPolygons || [];
  const wardSummary = mapData?.wardSummary || [];

  const handleWardClick = (wardNumber: number) => {
    if (selectedWardFilter === wardNumber) {
      setSelectedWardFilter(null);
      setMapCenter([22.5645, 72.9289]);
    } else {
      setSelectedWardFilter(wardNumber);
      const ward = wardSummary.find((w: any) => w.wardNumber === wardNumber);
      if (ward) {
        const poly = wardPolygons.find((p: any) => p.properties.wardNumber === wardNumber);
        if (poly && poly.geometry.coordinates[0][0]) {
          const lng = poly.geometry.coordinates[0][0][0];
          const lat = poly.geometry.coordinates[0][0][1];
          setMapCenter([lat, lng]);
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide bg-blue-900 text-white font-mono">
              GIS SURVEILLANCE
            </span>
            <span className="text-xs text-slate-500 font-semibold">Anand Urban Local Body GIS Grid</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Municipality Geographical View
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Visualize civic challenges, projects and resolution status across municipal wards.
          </p>
        </div>

        <button
          onClick={loadMapData}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin text-blue-600' : 'text-slate-500'} />
          <span>Reload GIS Data</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={loadMapData} className="underline font-bold cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* 2. MAP LAYERS BAR */}
      <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-extrabold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
            <Layers size={15} className="text-blue-900" />
            <span>Map Layers:</span>
          </span>

          <div className="flex items-center gap-1.5 flex-wrap">
            {layers.map((layer) => (
              <button
                key={layer}
                onClick={() => setSelectedLayer(layer)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  selectedLayer === layer
                    ? 'bg-blue-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {layer}
              </button>
            ))}
          </div>
        </div>

        {selectedWardFilter !== null && (
          <div className="flex items-center gap-2 text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
            <span>Filtering Ward {selectedWardFilter}</span>
            <button
              onClick={() => setSelectedWardFilter(null)}
              className="text-blue-600 hover:text-blue-950 underline cursor-pointer text-[11px]"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* 3. INTERACTIVE LEAFLET MAP CONTAINER */}
      <div className="rounded-xl border border-slate-300 shadow-md overflow-hidden bg-white">
        <div className="relative h-[480px] w-full z-10">
          <MapContainer
            center={mapCenter}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <MapRecenter center={mapCenter} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Ward Boundary Polygons */}
            {wardPolygons.map((poly: any) => {
              const isSelected = selectedWardFilter === poly.properties.wardNumber;
              // Coordinates are [lng, lat] in GeoJSON, Leaflet expects [lat, lng]
              const leafCoords = poly.geometry.coordinates[0].map((coord: number[]) => [coord[1], coord[0]]);

              return (
                <Polygon
                  key={poly.properties.wardNumber}
                  positions={leafCoords}
                  pathOptions={{
                    color: isSelected ? '#1E3A8A' : '#3B82F6',
                    fillColor: isSelected ? '#1E3A8A' : '#93C5FD',
                    fillOpacity: isSelected ? 0.35 : 0.12,
                    weight: isSelected ? 2.5 : 1.2,
                    dashArray: isSelected ? undefined : '4, 4',
                  }}
                  eventHandlers={{
                    click: () => handleWardClick(poly.properties.wardNumber),
                  }}
                >
                  <Popup>
                    <div className="text-xs space-y-1">
                      <p className="font-extrabold text-blue-950">Ward {poly.properties.wardNumber}</p>
                      <p className="text-slate-700">{poly.properties.name}</p>
                      <p className="text-[10px] text-slate-500">Zone: {poly.properties.zone}</p>
                      <button
                        onClick={() => handleWardClick(poly.properties.wardNumber)}
                        className="text-[10px] font-bold text-blue-900 underline mt-1"
                      >
                        {isSelected ? 'Reset Ward Filter' : 'Filter map to this ward'}
                      </button>
                    </div>
                  </Popup>
                </Polygon>
              );
            })}

            {/* Challenge Real-Coordinate Markers */}
            {markers.map((marker: any) => {
              const props = marker.properties;
              const coords = marker.geometry.coordinates; // [lng, lat]
              const leafPos: [number, number] = [coords[1], coords[0]];

              // Status colors with accessible representation
              let color = '#2563EB'; // Blue
              if (props.validationStatus === 'Pending Validation') color = '#D97706'; // Amber
              if (props.validationStatus === 'Resolved') color = '#059669'; // Emerald
              if (props.validationStatus === 'Outside Jurisdiction' || props.validationStatus === 'Rejected') color = '#DC2626'; // Red
              if (props.projectStatus === 'In Progress') color = '#7C3AED'; // Purple

              return (
                <CircleMarker
                  key={props.id}
                  center={leafPos}
                  radius={7}
                  pathOptions={{
                    color: '#FFFFFF',
                    fillColor: color,
                    fillOpacity: 0.9,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="p-1 text-xs space-y-1.5 max-w-[220px]">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                        <span className="font-mono font-bold text-blue-900 text-[11px]">
                          {props.challengeId || props.id}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[8.5px] font-extrabold uppercase font-mono ${
                            props.priority === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-800'
                              : props.priority === 'HIGH'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {props.priority}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 leading-snug">
                        {props.title}
                      </h4>

                      <div className="text-[10px] text-slate-600 space-y-0.5">
                        <p><strong className="text-slate-800">Category:</strong> {props.category}</p>
                        <p><strong className="text-slate-800">Ward:</strong> {props.ward}</p>
                        <p><strong className="text-slate-800">Validation:</strong> {props.validationStatus}</p>
                        <p><strong className="text-slate-800">Reported:</strong> {new Date(props.reportedDate).toLocaleDateString('en-IN')}</p>
                      </div>

                      <button
                        onClick={() => navigate(`/municipality-admin/challenges?selected=${props.challengeId}`)}
                        className="w-full mt-2 py-1 px-2 text-center text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded transition-colors"
                      >
                        View Challenge
                      </button>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>

          {/* Map Overlay Status Legend */}
          <div className="absolute bottom-3 right-3 z-1000 bg-white/95 backdrop-blur-xs p-2.5 rounded-lg border border-slate-300 shadow-md text-[10px] space-y-1">
            <span className="font-extrabold uppercase text-slate-700 block tracking-wider mb-1">
              Marker Status Legend
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 border border-white"></span>
              <span className="text-slate-700 font-semibold">Verified / New</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600 border border-white"></span>
              <span className="text-slate-700 font-semibold">Pending Validation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 border border-white"></span>
              <span className="text-slate-700 font-semibold">In Progress (Project)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 border border-white"></span>
              <span className="text-slate-700 font-semibold">Resolved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 border border-white"></span>
              <span className="text-slate-700 font-semibold">Outside / Rejected</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. WARD-WISE CHALLENGE SUMMARY TABLE */}
      <div className="rounded-lg bg-white border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-slate-50/80">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Building size={16} className="text-blue-900" />
              <span>Ward-wise Challenge Summary</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Click any ward row to filter the geographical view and zoom into the specific municipal boundary.
            </p>
          </div>
          {selectedWardFilter !== null && (
            <button
              onClick={() => setSelectedWardFilter(null)}
              className="text-xs font-bold text-blue-900 hover:underline cursor-pointer"
            >
              Reset Selection
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#1E3A8A] text-white font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Ward</th>
                <th className="py-2.5 px-3">Ward Name & Zone</th>
                <th className="py-2.5 px-3 text-center">Total Issues</th>
                <th className="py-2.5 px-3 text-center">Pending</th>
                <th className="py-2.5 px-3 text-center">Verified</th>
                <th className="py-2.5 px-3 text-center">In Progress</th>
                <th className="py-2.5 px-3 text-center">Resolved</th>
                <th className="py-2.5 px-3 text-center">High Priority</th>
                <th className="py-2.5 px-3 text-center">Active Projects</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {wardSummary.map((item: any, idx: number) => {
                const isSelected = selectedWardFilter === item.wardNumber;

                return (
                  <tr
                    key={item.wardNumber}
                    onClick={() => handleWardClick(item.wardNumber)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-100/60 font-bold border-l-4 border-l-blue-900'
                        : idx % 2 === 0
                        ? 'bg-white hover:bg-slate-50'
                        : 'bg-slate-50/40 hover:bg-slate-100/60'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-950">
                      {item.ward}
                    </td>
                    <td className="py-2.5 px-3 text-slate-800">
                      <span className="font-semibold block">{item.name}</span>
                      <span className="text-[10px] text-slate-500 font-normal">{item.zone}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">
                      {item.totalIssues}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-700">
                      {item.pending}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-700">
                      {item.verified}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-purple-700">
                      {item.inProgress}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">
                      {item.resolved}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-rose-700">
                      {item.highPriority}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-indigo-700">
                      {item.activeProjects}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
