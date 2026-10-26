import React, { useState, useMemo } from 'react';
import {
  X,
  Upload,
  Camera,
  MapPin,
  Crosshair,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  Info,
  CheckCircle2,
  Trash2,
  Image as ImageIcon,
  Globe,
  RefreshCw
} from 'lucide-react';
import {
  calculatePriority,
  DAMAGE_TYPES,
  ROAD_IMPORTANCE_LEVELS,
  PASSAGE_STATUS_LEVELS,
  SAFETY_RISK_LEVELS,
  getPriorityBadgeColor
} from '../utils/priorityEngine';
import { reverseGeocodeCoordinates } from '../utils/mapServices';

const PRESET_PHOTOS = [
  { label: 'Landslide', path: '/images/landslide.jpg' },
  { label: 'Bridge Crack', path: '/images/bridge.jpg' },
  { label: 'Flooded Road', path: '/images/flood.jpg' },
  { label: 'Sinkhole Void', path: '/images/sinkhole.jpg' }
];

export default function ReportDamageModal({
  isOpen,
  onClose,
  onSubmit,
  onPickOnMap,
  pickedLocation,
  settings = {}
}) {
  const [roadName, setRoadName] = useState('');
  const [sector, setSector] = useState('Uttarakhand - Garhwal Himalayan Sector');
  const [latitude, setLatitude] = useState('30.3753');
  const [longitude, setLongitude] = useState('79.3312');
  const [damageType, setDamageType] = useState(DAMAGE_TYPES[0]);
  const [severity, setSeverity] = useState('High');
  const [roadImportance, setRoadImportance] = useState(ROAD_IMPORTANCE_LEVELS.LIFELINE);
  const [passageStatus, setPassageStatus] = useState(PASSAGE_STATUS_LEVELS.BLOCKED);
  const [publicSafetyRisk, setPublicSafetyRisk] = useState(SAFETY_RISK_LEVELS.IMMINENT);
  const [description, setDescription] = useState('');
  const [estimatedRepairHours, setEstimatedRepairHours] = useState('36');
  const [reporterName, setReporterName] = useState('NDRF Unit Officer / BRO Engineer');
  const [photos, setPhotos] = useState(['/images/landslide.jpg']);
  const [requiredServices, setRequiredServices] = useState([
    'Heavy Excavators (BRO/NHAI)',
    '108 Trauma Ambulances'
  ]);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [resolvedLocation, setResolvedLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Reverse geocode coordinates to Road & Sector
  const handleResolveAddress = async (lat = latitude, lng = longitude) => {
    if (!lat || !lng) return;
    setIsResolvingAddress(true);
    try {
      const res = await reverseGeocodeCoordinates(lat, lng, settings?.googleApiKey);
      if (res) {
        setResolvedLocation(res);
        if (!roadName.trim()) {
          setRoadName(res.roadName);
        }
      }
    } catch (err) {
      console.warn('Reverse geocode failed:', err);
    } finally {
      setIsResolvingAddress(false);
    }
  };

  // Update coords if user picked on map
  React.useEffect(() => {
    if (pickedLocation) {
      const latStr = pickedLocation.lat.toFixed(4);
      const lngStr = pickedLocation.lng.toFixed(4);
      setLatitude(latStr);
      setLongitude(lngStr);
      handleResolveAddress(latStr, lngStr);
    }
  }, [pickedLocation]);

  // Real-time Automated Priority Preview
  const livePriority = useMemo(() => {
    return calculatePriority({
      severity,
      passageStatus,
      roadImportance,
      publicSafetyRisk,
      damageType
    });
  }, [severity, passageStatus, roadImportance, publicSafetyRisk, damageType]);

  const priorityBadge = getPriorityBadgeColor(livePriority.level);

  // Auto-detect GPS location
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latStr = pos.coords.latitude.toFixed(4);
        const lngStr = pos.coords.longitude.toFixed(4);
        setLatitude(latStr);
        setLongitude(lngStr);
        setIsDetectingLocation(false);
        handleResolveAddress(latStr, lngStr);
      },
      (err) => {
        console.warn('Geolocation failed, keeping default coordinates', err);
        setErrorMsg('Unable to retrieve current location. Used regional emergency default.');
        setIsDetectingLocation(false);
      },
      { timeout: 7000 }
    );
  };

  // Image Upload handler (Base64)
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [reader.result, ...prev]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPresetPhoto = (path) => {
    if (!photos.includes(path)) {
      setPhotos([path, ...photos]);
    }
  };

  const handleRemovePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!roadName.trim()) {
      setErrorMsg('Road name is required.');
      return;
    }
    if (!latitude || !longitude) {
      setErrorMsg('Valid GPS coordinates are required.');
      return;
    }

    onSubmit({
      roadName,
      sector,
      latitude,
      longitude,
      damageType,
      severity,
      roadImportance,
      passageStatus,
      publicSafetyRisk,
      description,
      estimatedRepairHours,
      reporterName,
      photos,
      requiredServices
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg sm:text-xl">
                Report Affected Road Damage
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated triage engine assigns priority & dispatch queue in real-time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 max-h-[calc(88vh-8rem)] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Real-time Priority Preview Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Automated Priority Calculation Engine Preview
                </span>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border font-mono ${priorityBadge.bg} ${priorityBadge.border} ${priorityBadge.text}`}
              >
                <span className={`w-2 h-2 rounded-full ${priorityBadge.dot}`}></span>
                Priority: {livePriority.level} ({livePriority.score} / 100)
              </span>
            </div>

            {/* Score Reason Breakdown */}
            <div className="space-y-1 mt-2.5">
              {livePriority.reasons.map((reason, idx) => (
                <div key={idx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                  <span className="text-orange-400 font-bold">•</span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 1: Road Identification & Location */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-400" />
              1. Road Location & Identification
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Road / Highway Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rishikesh - Badrinath National Highway (NH-58), Km 94"
                  value={roadName}
                  onChange={(e) => setRoadName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Sector / Zone (India)
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  <option value="Uttarakhand - Garhwal Himalayan Sector">Uttarakhand - Garhwal Himalayan Sector</option>
                  <option value="Maharashtra - Western Ghats Transit Zone">Maharashtra - Western Ghats Transit Zone</option>
                  <option value="Konkan - Coastal River Basin">Konkan - Coastal River Basin</option>
                  <option value="Kerala - Western Ghats Sector">Kerala - Western Ghats Sector</option>
                  <option value="Himachal Pradesh - Beas Valley Sector">Himachal Pradesh - Beas Valley Sector</option>
                  <option value="Delhi NCR - Eastern Medical Corridor">Delhi NCR - Eastern Medical Corridor</option>
                  <option value="Punjab / Haryana - GT Road Corridor">Punjab / Haryana - GT Road Corridor</option>
                  <option value="North East - Assam / Meghalaya Corridor">North East - Assam / Meghalaya Corridor</option>
                </select>
              </div>
            </div>

            {/* GPS Coordinates with Picker Buttons */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  GPS Coordinates (Latitude, Longitude) *
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isDetectingLocation}
                    className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 font-semibold"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>{isDetectingLocation ? 'Locating...' : 'Use My GPS'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onPickOnMap();
                      onClose();
                    }}
                    className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Pick on Map</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="Latitude (e.g. 47.6062)"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="Longitude (e.g. -122.3321)"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>

              {/* Reverse Geocoding Map API Assistant */}
              <div className="mt-2.5 flex items-center justify-between flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleResolveAddress()}
                  disabled={isResolvingAddress || !latitude || !longitude}
                  className="text-xs text-sky-400 hover:text-sky-300 disabled:opacity-50 flex items-center gap-1.5 font-semibold py-1 px-2.5 rounded-lg bg-sky-950/40 border border-sky-800/60 transition-colors"
                >
                  <Globe className={`w-3.5 h-3.5 ${isResolvingAddress ? 'animate-spin' : ''}`} />
                  <span>{isResolvingAddress ? 'Resolving via Map API...' : 'Auto-Identify Road via Map API'}</span>
                </button>

                {resolvedLocation && (
                  <span className="text-[10px] text-slate-400">
                    Engine: <span className="text-orange-400 font-semibold">{resolvedLocation.provider}</span>
                  </span>
                )}
              </div>

              {resolvedLocation && (
                <div className="mt-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2 text-xs">
                  <div className="overflow-hidden">
                    <span className="text-slate-400">Detected: </span>
                    <span className="text-white font-bold">{resolvedLocation.roadName}</span>
                    <span className="text-slate-400 text-[11px] block truncate">{resolvedLocation.sector}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRoadName(resolvedLocation.roadName);
                      const matchingSector = [
                        "Uttarakhand - Garhwal Himalayan Sector",
                        "Maharashtra - Western Ghats Transit Zone",
                        "Konkan - Coastal River Basin",
                        "Kerala - Western Ghats Sector",
                        "Himachal Pradesh - Beas Valley Sector",
                        "Delhi NCR - Eastern Medical Corridor",
                        "Punjab / Haryana - GT Road Corridor",
                        "North East - Assam / Meghalaya Corridor"
                      ].find(s => resolvedLocation.sector.toLowerCase().includes(s.split(' - ')[0].toLowerCase()));
                      if (matchingSector) setSector(matchingSector);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-[11px] font-bold flex-shrink-0 transition-colors shadow-sm"
                  >
                    Apply to Form
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Damage Severity & Triage Factors */}
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              2. Damage Evaluation & Critical Risk Factors
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Damage Type
                </label>
                <select
                  value={damageType}
                  onChange={(e) => setDamageType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none"
                >
                  {DAMAGE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Severity Radios */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Damage Severity (Weight: 35%)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'High', color: 'peer-checked:bg-red-600 peer-checked:text-white border-red-500/40' },
                    { label: 'Medium', color: 'peer-checked:bg-amber-600 peer-checked:text-white border-amber-500/40' },
                    { label: 'Low', color: 'peer-checked:bg-emerald-600 peer-checked:text-white border-emerald-500/40' }
                  ].map(item => (
                    <label
                      key={item.label}
                      className="cursor-pointer text-center text-xs font-bold"
                    >
                      <input
                        type="radio"
                        name="severity"
                        value={item.label}
                        checked={severity === item.label}
                        onChange={(e) => setSeverity(e.target.value)}
                        className="hidden peer"
                      />
                      <div className={`py-2 px-3 rounded-xl border bg-slate-950 text-slate-300 transition-all ${item.color}`}>
                        {item.label}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Road Lifeline / Importance (Weight: 25%)
                </label>
                <select
                  value={roadImportance}
                  onChange={(e) => setRoadImportance(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none"
                >
                  {Object.values(ROAD_IMPORTANCE_LEVELS).map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Passage Status & Accessibility (Weight: 25%)
                </label>
                <select
                  value={passageStatus}
                  onChange={(e) => setPassageStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none"
                >
                  {Object.values(PASSAGE_STATUS_LEVELS).map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Public Safety / Structural Risk (Weight: 15%)
                </label>
                <select
                  value={publicSafetyRisk}
                  onChange={(e) => setPublicSafetyRisk(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none"
                >
                  {Object.values(SAFETY_RISK_LEVELS).map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Estimated Repair Time (Hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={estimatedRepairHours}
                  onChange={(e) => setEstimatedRepairHours(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Emergency Services Required Multi-Select */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  Emergency Response Services Required
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {requiredServices.length} selected
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Tag disaster response wings and equipment needed immediately at this site:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {[
                  { name: 'NDRF Rescue', desc: 'Life rescue & collapsed structure search' },
                  { name: 'Heavy Excavators (BRO/NHAI)', desc: 'Rock breakers, bulldozers & earthmovers' },
                  { name: '108 Trauma Ambulances', desc: 'Medical corps & advanced life support' },
                  { name: 'Aerial Heli & Drone Recon', desc: 'Thermal surveillance & air-drop' },
                  { name: 'Power Grid Restoration', desc: 'High-tension cable & pole repair' },
                  { name: 'Relief Rations & Water', desc: 'Drinking water tankers & food supply' }
                ].map((svc) => {
                  const isChecked = requiredServices.includes(svc.name);
                  return (
                    <button
                      type="button"
                      key={svc.name}
                      onClick={() => {
                        if (isChecked) {
                          setRequiredServices(requiredServices.filter(s => s !== svc.name));
                        } else {
                          setRequiredServices([...requiredServices, svc.name]);
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isChecked
                          ? 'bg-orange-500/20 text-orange-300 border-orange-500/50 shadow-md shadow-orange-950/40'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{svc.name}</span>
                        <span className={`text-xs font-bold ${isChecked ? 'text-orange-400' : 'text-slate-600'}`}>
                          {isChecked ? '✓' : '+'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 leading-snug">
                        {svc.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Photo Upload and Evidence */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-orange-400" />
                3. Photographic Evidence & Damage Photos
              </h4>
              <span className="text-[11px] text-slate-400">
                {photos.length} photo(s) attached
              </span>
            </div>

            {/* Quick Presets Selection */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400">Select Preset Photo:</span>
              {PRESET_PHOTOS.map(preset => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => handleSelectPresetPhoto(preset.path)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                >
                  + {preset.label}
                </button>
              ))}
            </div>

            {/* Upload Box & Previews */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Custom Upload Button */}
              <label className="border-2 border-dashed border-slate-700 hover:border-orange-500 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-950/40 min-h-[90px]">
                <Upload className="w-5 h-5 text-slate-400 mb-1" />
                <span className="text-[11px] font-semibold text-slate-300">Upload Photo</span>
                <span className="text-[9px] text-slate-500">JPG, PNG, WebP</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {/* Photo Thumbnails */}
              {photos.map((src, index) => (
                <div key={index} className="relative rounded-xl overflow-hidden group border border-slate-800 bg-slate-950 min-h-[90px]">
                  <img
                    src={src}
                    alt={`Evidence ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute top-1 right-1 p-1 rounded-lg bg-black/70 text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Field Description Notes */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-300">
              Damage Description & Structural Observations
            </label>
            <textarea
              rows={3}
              placeholder="Describe physical damage, blocked lanes, bridge cracks, power lines, and observed civilian hazards..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 leading-relaxed"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-orange-950 active:scale-95 transition-all"
            >
              Submit & Register Priority
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
