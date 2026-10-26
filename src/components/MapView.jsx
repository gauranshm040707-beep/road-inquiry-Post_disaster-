import React, { useState, useEffect, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  useMap,
  useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import {
  Crosshair,
  ChevronRight,
  Truck,
  Compass,
  Search,
  Globe,
  MapPin,
  X
} from 'lucide-react';
import { getPriorityBadgeColor, getStatusBadgeColor } from '../utils/priorityEngine';
import { formatCoordinates } from '../utils/formatters';
import { INDIAN_SERVICE_HUBS } from '../data/sampleReports';
import { getTileLayers, searchAddressOrHighway } from '../utils/mapServices';

// Create Search Marker DivIcon
function createSearchPin() {
  const html = `
    <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(59, 130, 246, 0.4); animation: marker-pulse 2s infinite;"></div>
      <div style="
        position: relative;
        width: 28px;
        height: 28px;
        background: #0284c7;
        border: 2px solid #ffffff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-size: 13px;
        box-shadow: 0 4px 14px rgba(0,0,0,0.8);
        z-index: 4;
      ">
        📍
      </div>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'custom-search-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 34],
    popupAnchor: [0, -32]
  });
}

// Create SVG DivIcon for colored severity pins
function createCustomPin(severity, priorityScore, isPulsing = false) {
  let color = '#10b981'; // Green (Low)
  let glowColor = 'rgba(16, 185, 129, 0.4)';

  if (severity === 'High') {
    color = '#ef4444'; // Red (High)
    glowColor = 'rgba(239, 68, 68, 0.6)';
  } else if (severity === 'Medium') {
    color = '#f97316'; // Orange (Medium)
    glowColor = 'rgba(249, 115, 22, 0.5)';
  }

  const html = `
    <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
      ${
        isPulsing
          ? `<div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: ${glowColor}; animation: marker-pulse 2s infinite ease-in-out;"></div>`
          : ''
      }
      <div style="
        position: relative;
        width: 28px;
        height: 28px;
        background: #0f172a;
        border: 2px solid ${color};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px ${glowColor};
        color: #ffffff;
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        font-weight: 700;
        z-index: 2;
      ">
        ${priorityScore}
      </div>
      <div style="
        position: absolute;
        bottom: -4px;
        width: 6px;
        height: 6px;
        background: ${color};
        transform: rotate(45deg);
        z-index: 1;
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-disaster-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 34],
    popupAnchor: [0, -32]
  });
}

// Create Custom Pin for Emergency Service Base Stations
function createServiceHubPin(serviceKey) {
  let color = '#06b6d4';
  let symbol = '⚡';
  if (serviceKey === 'NDRF') {
    color = '#ef4444';
    symbol = '🚒';
  } else if (serviceKey === 'BRO_NHAI') {
    color = '#f59e0b';
    symbol = '🚜';
  } else if (serviceKey === 'EMS_108') {
    color = '#10b981';
    symbol = '🚑';
  } else if (serviceKey === 'AIR_RECON') {
    color = '#38bdf8';
    symbol = '🚁';
  }

  const html = `
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: ${color}25; animation: marker-pulse 3s infinite;"></div>
      <div style="
        position: relative;
        width: 28px;
        height: 28px;
        background: #090d16;
        border: 2px solid ${color};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.8);
        z-index: 3;
      ">
        ${symbol}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-service-hub-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
}

// Map helper to center on a selected coordinate
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 6, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

// Interactive Map Click listener
function MapClickHandler({ onMapClick, isPickingLocation }) {
  useMapEvents({
    click(e) {
      if (isPickingLocation && onMapClick) {
        onMapClick(e.latlng);
      }
    }
  });
  return null;
}

// Indian Strategic Disaster Sectors Quick Jump
const INDIA_REGIONS = [
  { name: '🇮🇳 Pan-India', center: [23.5937, 78.9629], zoom: 5 },
  { name: '⛰️ Uttarakhand (NH-58)', center: [30.2500, 78.8500], zoom: 8 },
  { name: '🌊 Konkan / Chiplun (NH-66)', center: [17.7500, 73.4500], zoom: 8 },
  { name: '🛣️ Mumbai-Pune Ghat', center: [18.7562, 73.3421], zoom: 10 },
  { name: '🌴 Kerala Wayanad (NH-766)', center: [11.5034, 76.0245], zoom: 9 },
  { name: '🏙️ Delhi-NCR Expressways', center: [28.6692, 77.4538], zoom: 10 },
  { name: '🏞️ Kullu-Manali (NH-3)', center: [32.0596, 77.1487], zoom: 9 }
];

export default function MapView({
  reports,
  onSelectRoad,
  selectedRoad,
  onOpenReportModal,
  isPickingLocation = false,
  onLocationPicked,
  settings = {}
}) {
  const tileLayers = useMemo(() => getTileLayers(settings), [settings]);
  const [selectedTileKey, setSelectedTileKey] = useState(null);
  const tileKey = selectedTileKey || settings?.defaultMapStyle || 'google_hybrid';
  const setTileKey = setSelectedTileKey;

  // Address & Highway Geocoding Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMarker, setSearchMarker] = useState(null);
  const [searchFeedback, setSearchFeedback] = useState(null);

  const handleExecuteSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchFeedback(null);
    try {
      const results = await searchAddressOrHighway(searchQuery, settings?.googleApiKey);
      if (results && results.length > 0) {
        setSearchResults(results);
      } else {
        setSearchFeedback('No matching highway, corridor or location found.');
      }
    } catch (err) {
      setSearchFeedback('Search service temporarily unavailable.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (result) => {
    setMapCenter([result.lat, result.lng]);
    setMapZoom(14);
    setSearchMarker(result);
    setSearchResults([]);
    setSearchQuery(result.name);
  };

  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [showHazardZones, setShowHazardZones] = useState(true);
  const [showServiceHubs, setShowServiceHubs] = useState(true);
  const [showDispatchLines, setShowDispatchLines] = useState(true);

  // Default: Centered on India with focus on active Himalayan & Coastal corridors
  const defaultCenter = [24.0, 78.5];
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(5);

  // Focus map when selectedRoad changes
  useEffect(() => {
    if (selectedRoad && selectedRoad.coordinates) {
      setMapCenter([selectedRoad.coordinates.lat, selectedRoad.coordinates.lng]);
      setMapZoom(13);
    }
  }, [selectedRoad]);

  // Filter reports
  const filteredReports = reports.filter(r => {
    if (priorityFilter !== 'ALL' && r.priorityLevel !== priorityFilter) return false;
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (serviceFilter !== 'ALL') {
      const services = r.requiredServices || [];
      if (!services.some(s => s.toLowerCase().includes(serviceFilter.toLowerCase()))) {
        return false;
      }
    }
    return true;
  });

  // Critical Char Dham / Army Strategic Lifeline Corridor
  const himalayanLifelineRoute = [
    [30.0758, 78.2880], // Rishikesh Base
    [30.1500, 78.3500], // Shivpuri
    [30.2800, 78.5900], // Devprayag
    [30.3753, 79.3312]  // Chamoli Damaged Pass
  ];

  // Western Ghats Mumbai-Pune Relief Route
  const westernGhatsLifelineRoute = [
    [19.0760, 72.8777], // Mumbai Command
    [18.7562, 73.3421], // Bhor Ghat
    [18.5204, 73.8567]  // Pune Trauma Center
  ];

  return (
    <div className="relative w-full h-[calc(100vh-6.5rem)] flex flex-col bg-slate-950 overflow-hidden">
      {/* Top Map Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Filters Pill */}
        <div className="pointer-events-auto flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/95 border border-slate-800 backdrop-blur-xl shadow-2xl flex-wrap">
          {/* Priority filter buttons */}
          <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            {['ALL', 'High', 'Medium', 'Low'].map(p => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  priorityFilter === p
                    ? p === 'High'
                      ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
                      : p === 'Medium'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                      : p === 'Low'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                      : 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {p === 'ALL' ? 'All Priority' : p}
              </button>
            ))}
          </div>

          {/* Service Required Filter Dropdown */}
          <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            <span className="text-[11px] text-orange-400 font-bold px-1.5 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" /> Services:
            </span>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="bg-slate-900 border-none text-slate-200 text-xs py-1 px-2 rounded-lg focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Emergency Services</option>
              <option value="NDRF">NDRF Life Rescue</option>
              <option value="Excavators">Heavy Excavators (BRO/NHAI)</option>
              <option value="108">108 Trauma Ambulances</option>
              <option value="Drone">Aerial Heli & Drone Recon</option>
              <option value="Power">Power Grid Utility</option>
              <option value="Rations">Relief Rations & Water</option>
            </select>
          </div>

          {/* Toggle Service Hubs */}
          <button
            onClick={() => setShowServiceHubs(!showServiceHubs)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              showServiceHubs
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm'
                : 'bg-slate-950/60 text-slate-400 border-slate-800'
            }`}
            title="Toggle Indian Response Base Stations"
          >
            <span>Service Hubs</span>
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
          </button>

          {/* Toggle Hazard Zones */}
          <button
            onClick={() => setShowHazardZones(!showHazardZones)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              showHazardZones
                ? 'bg-red-500/20 text-red-300 border-red-500/40'
                : 'bg-slate-950/60 text-slate-400 border-slate-800'
            }`}
          >
            Hazard Zones {showHazardZones ? '✓' : ''}
          </button>
        </div>

        {/* Center: Highway & Location Search Bar */}
        <div className="pointer-events-auto relative z-30">
          <form
            onSubmit={handleExecuteSearch}
            className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/95 border border-slate-800 backdrop-blur-xl shadow-2xl"
          >
            <div className="flex items-center gap-2 pl-3 pr-1 py-1">
              <Search className="w-4 h-4 text-orange-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Highway, City or Landmark (e.g. NH-58, Chamoli)..."
                className="w-48 sm:w-64 md:w-80 bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setSearchFeedback(null);
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1 transition-all shadow-md shadow-orange-950"
            >
              {isSearching ? 'Finding...' : 'Locate'}
            </button>
          </form>

          {/* Autocomplete / Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/98 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden divide-y divide-slate-800/80 z-40 max-h-72 overflow-y-auto">
              <div className="p-2 bg-slate-950/70 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <span>GEOCODING RESULTS</span>
                <span className="text-orange-400 font-semibold">{searchResults[0]?.provider}</span>
              </div>
              {searchResults.map((res, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectResult(res)}
                  className="w-full text-left p-3 hover:bg-slate-800/70 transition-colors flex items-start gap-2.5"
                >
                  <MapPin className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-white truncate">{res.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{res.displayName}</div>
                    <div className="text-[10px] font-mono text-orange-400/90 mt-0.5">
                      {res.lat.toFixed(4)}° N, {res.lng.toFixed(4)}° E
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchFeedback && (
            <div className="absolute top-full left-0 right-0 mt-2 p-2.5 rounded-xl bg-slate-900/95 border border-slate-800 text-xs text-amber-300 shadow-xl backdrop-blur-xl">
              {searchFeedback}
            </div>
          )}
        </div>

        {/* Right: Region Jump & Basemap Selector */}
        <div className="pointer-events-auto flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/95 border border-slate-800 backdrop-blur-xl shadow-2xl flex-wrap">
          {/* Quick Region Switcher */}
          <select
            onChange={(e) => {
              const reg = INDIA_REGIONS.find(r => r.name === e.target.value);
              if (reg) {
                setMapCenter(reg.center);
                setMapZoom(reg.zoom);
              }
            }}
            className="bg-slate-950/80 border border-slate-800 text-orange-400 font-semibold text-xs py-1.5 px-3 rounded-xl focus:outline-none cursor-pointer"
          >
            {INDIA_REGIONS.map(reg => (
              <option key={reg.name} value={reg.name}>{reg.name}</option>
            ))}
          </select>

          {/* Dynamic Basemap Dropdown Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 px-2 py-1 rounded-xl border border-slate-800">
            <Globe className="w-3.5 h-3.5 text-orange-400" />
            <select
              value={tileKey}
              onChange={(e) => setTileKey(e.target.value)}
              className="bg-transparent border-none text-white text-xs font-semibold py-0.5 pr-2 focus:outline-none cursor-pointer"
            >
              {Object.entries(tileLayers).map(([key, layer]) => (
                <option key={key} value={key} className="bg-slate-900 text-white">
                  {layer.name} {layer.badge ? `[${layer.badge}]` : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setMapCenter([23.5937, 78.9629]);
              setMapZoom(5);
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
            title="Center All-India View"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Layer Watermark Badge */}
      <div className="absolute top-20 right-4 z-10 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono backdrop-blur-md pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="text-slate-400">LAYER:</span>
        <span className="text-white font-bold">{tileLayers[tileKey]?.name || 'Tactical Dark'}</span>
        {tileLayers[tileKey]?.badge && (
          <span className="px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 text-[10px] font-bold">
            {tileLayers[tileKey].badge}
          </span>
        )}
      </div>

      {/* Picking Location Notice Bar */}
      {isPickingLocation && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-orange-600 text-white px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-orange-400 animate-bounce">
          <Crosshair className="w-5 h-5 animate-spin" />
          <span className="text-xs sm:text-sm font-bold">
            CLICK ON ANY INDIAN ROAD OR REGION TO PINPOINT GPS COORDINATES
          </span>
        </div>
      )}

      {/* Leaflet Map Container */}
      <MapContainer
        center={defaultCenter}
        zoom={5}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          key={tileKey}
          url={tileLayers[tileKey]?.url || tileLayers.google_hybrid?.url || 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'}
          attribution={tileLayers[tileKey]?.attribution || '&copy; Google Maps'}
          maxZoom={tileLayers[tileKey]?.maxZoom || 20}
        />

        <MapController center={mapCenter} zoom={mapZoom} />
        <MapClickHandler onMapClick={onLocationPicked} isPickingLocation={isPickingLocation} />

        {/* Search Result Pin */}
        {searchMarker && (
          <Marker position={[searchMarker.lat, searchMarker.lng]} icon={createSearchPin()}>
            <Popup className="disaster-custom-popup">
              <div className="p-3 bg-slate-900 text-slate-100 rounded-xl space-y-2 min-w-[220px]">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <MapPin className="w-4 h-4 text-sky-400 flex-shrink-0" />
                  <span>{searchMarker.name}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  {searchMarker.displayName}
                </p>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                  <span className="font-mono text-sky-400">
                    {searchMarker.lat.toFixed(4)}°, {searchMarker.lng.toFixed(4)}°
                  </span>
                  <span className="text-slate-400 font-medium">{searchMarker.provider}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (onLocationPicked) {
                      onLocationPicked({ lat: searchMarker.lat, lng: searchMarker.lng });
                    }
                  }}
                  className="w-full mt-2 py-1.5 px-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-950 transition-colors"
                >
                  <span>+ Report Road Damage Here</span>
                </button>
              </div>
            </Popup>
          </Marker>
        )}

        <MapController center={mapCenter} zoom={mapZoom} />
        <MapClickHandler onMapClick={onLocationPicked} isPickingLocation={isPickingLocation} />

        {/* Hazard Zones in India (Himalayan Landslide Zone & Konkan Flood Plain) */}
        {showHazardZones && (
          <>
            {/* Himalayan Active Landslide & Cloudburst Perimeter */}
            <Circle
              center={[30.3753, 79.1]}
              radius={35000}
              pathOptions={{
                color: '#ef4444',
                fillColor: '#ef4444',
                fillOpacity: 0.08,
                weight: 1.5,
                dashArray: '4, 8'
              }}
            />

            {/* Konkan Chiplun River Surge Inundation Zone */}
            <Circle
              center={[17.5323, 73.5182]}
              radius={22000}
              pathOptions={{
                color: '#0284c7',
                fillColor: '#0284c7',
                fillOpacity: 0.12,
                weight: 1.5
              }}
            />

            {/* Wayanad Slope Collapse Warning Perimeter */}
            <Circle
              center={[11.5034, 76.0245]}
              radius={18000}
              pathOptions={{
                color: '#f97316',
                fillColor: '#f97316',
                fillOpacity: 0.1,
                weight: 1.5,
                dashArray: '3, 6'
              }}
            />
          </>
        )}

        {/* Lifeline Corridors */}
        <Polyline
          positions={himalayanLifelineRoute}
          pathOptions={{
            color: '#f97316',
            weight: 3.5,
            opacity: 0.8,
            dashArray: '6, 6'
          }}
        />

        <Polyline
          positions={westernGhatsLifelineRoute}
          pathOptions={{
            color: '#38bdf8',
            weight: 3,
            opacity: 0.7,
            dashArray: '4, 6'
          }}
        />

        {/* Strategic Indian Emergency Service Base Stations */}
        {showServiceHubs && INDIAN_SERVICE_HUBS.map(hub => {
          const hubIcon = createServiceHubPin(hub.serviceKey);
          return (
            <Marker
              key={hub.id}
              position={[hub.coordinates.lat, hub.coordinates.lng]}
              icon={hubIcon}
            >
              <Popup className="disaster-custom-popup">
                <div className="w-72 bg-slate-900 text-slate-100 p-3.5 space-y-2 rounded-xl font-sans">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                      DISASTER SERVICE HUB
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold font-mono">
                      {hub.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-white leading-snug">
                    {hub.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-slate-500" />
                    <span>{hub.locationName}</span>
                  </p>

                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] space-y-1.5">
                    <div>
                      <span className="text-slate-400 block font-semibold">Available Units & Assets:</span>
                      <span className="text-slate-200">{hub.availableUnits}</span>
                    </div>
                    <div className="pt-1 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">Emergency Line:</span>
                      <span className="text-amber-400 font-bold font-mono">{hub.contact}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Road Damage Markers with Services Required */}
        {filteredReports.map((road) => {
          const isHigh = road.priorityLevel === 'High';
          const icon = createCustomPin(road.severity, road.priorityScore, isHigh);
          const priorityBadge = getPriorityBadgeColor(road.priorityLevel);
          const statusBadge = getStatusBadgeColor(road.status);
          const services = road.requiredServices || ['Heavy Excavators (BRO/NHAI)', '108 Trauma Ambulances'];

          return (
            <Marker
              key={road.id}
              position={[road.coordinates.lat, road.coordinates.lng]}
              icon={icon}
            >
              <Popup className="disaster-custom-popup">
                <div className="w-80 bg-slate-900 text-slate-100 p-0 rounded-xl overflow-hidden font-sans">
                  {/* Photo thumbnail */}
                  {road.photos && road.photos[0] && (
                    <div className="relative h-28 w-full overflow-hidden bg-slate-950">
                      <img
                        src={road.photos[0]}
                        alt={road.roadName}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 flex gap-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${priorityBadge.bg} ${priorityBadge.border} ${priorityBadge.text}`}
                        >
                          {road.priorityLevel} Priority ({road.priorityScore})
                        </span>
                      </div>
                      <div className="absolute bottom-2 right-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge.bg} ${statusBadge.border} ${statusBadge.text}`}
                        >
                          {statusBadge.label}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-3.5 space-y-2.5">
                    <div>
                      <h4 className="font-bold text-sm text-white leading-snug">
                        {road.roadName}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{road.sector}</p>
                    </div>

                    {/* KEY FEATURE: Required Services Display */}
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-orange-400">
                        <span className="flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5" /> Emergency Services Required:
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                          {services.length} ACTIVE
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {services.map((svc, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-200 text-[10px] font-semibold flex items-center gap-1 shadow-sm"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                            {svc}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-[11px] space-y-1 pt-1 border-t border-slate-800">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Damage:</span>
                        <span className="font-semibold text-slate-200">{road.damageType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Passage Status:</span>
                        <span className="font-semibold text-amber-400">
                          {road.passageStatus?.split('(')[0]}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Coordinates:</span>
                        <span className="font-mono text-slate-300">
                          {formatCoordinates(road.coordinates)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectRoad(road)}
                      className="w-full mt-2 py-1.5 px-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-orange-950"
                    >
                      <span>Open Full Inspection Dossier</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Bottom Map Legend */}
      <div className="absolute bottom-4 left-4 z-20 p-3 rounded-2xl bg-slate-900/95 border border-slate-800 backdrop-blur-xl shadow-2xl text-xs space-y-2 pointer-events-auto max-w-sm">
        <div className="font-bold text-white flex items-center justify-between">
          <span>India Disaster Road Map Legend</span>
          <span className="text-[10px] font-mono text-slate-400">{filteredReports.length} incidents</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 border border-red-400 shadow-sm shadow-red-500/50"></span>
            <span className="text-slate-300">Red: High Priority (Score 70-100)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-400 shadow-sm shadow-amber-500/50"></span>
            <span className="text-slate-300">Orange: Medium Priority (Score 40-69)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-400 shadow-sm shadow-emerald-500/50"></span>
            <span className="text-slate-300">Green: Low Priority (Score &lt;40)</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-800 text-[11px]">
            <span className="text-base">🚒 🚜 🚑 🚁</span>
            <span className="text-sky-300 font-semibold">Service Hubs (NDRF, BRO, 108, IAF)</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="w-3 h-1 bg-orange-500 border-dashed"></span>
            <span>Dashed Line: Char Dham & Western Lifeline Corridors</span>
          </div>
        </div>
      </div>
    </div>
  );
}
