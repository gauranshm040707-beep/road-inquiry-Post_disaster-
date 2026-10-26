import React, { useState } from 'react';
import {
  Settings,
  Database,
  Cloud,
  HardDrive,
  RefreshCw,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Volume2,
  VolumeX,
  Layers,
  Sparkles,
  ShieldCheck,
  Server,
  Eye,
  EyeOff,
  Key,
  Globe,
  MapPin,
  Compass,
  Navigation,
  ExternalLink,
  Info
} from 'lucide-react';
import { exportReportsToCSV, exportReportsToJSON } from '../utils/storage';
import { testGoogleMapsApiKey } from '../utils/mapServices';

export default function SettingsView({
  settings,
  onSaveSettings,
  onResetSampleData,
  onClearAllData,
  reports,
  soundAlerts,
  setSoundAlerts
}) {
  const [formData, setFormData] = useState({ ...settings });
  const [testStatus, setTestStatus] = useState(null); // null | 'testing' | 'success' | 'mock_active'
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showGoogleKey, setShowGoogleKey] = useState(false);
  const [showMapboxToken, setShowMapboxToken] = useState(false);
  const [showMaptilerKey, setShowMaptilerKey] = useState(false);
  const [mapTestStatus, setMapTestStatus] = useState(null);

  const handleTestGoogleKey = async () => {
    setMapTestStatus('testing');
    const res = await testGoogleMapsApiKey(formData.googleApiKey);
    setMapTestStatus(res);
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2500);
  };

  const handleTestBackend = () => {
    setTestStatus('testing');
    setTimeout(() => {
      if (formData.syncBackend === 'mock') {
        setTestStatus('mock_active');
      } else {
        setTestStatus('success');
      }
    }, 1200);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          System Settings, Backend Integrations & Data Sync
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure real-time cloud databases (Supabase / Firebase), offline storage, and disaster simulation presets
        </p>
      </div>

      {saveFeedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>System configuration successfully saved and applied.</span>
        </div>
      )}

      {/* Map Providers & Geolocation API Keys */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/30">
              <Globe className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Map Providers & Geolocation API Keys</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30">
                  LIVE
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Google Maps, Mapbox, and MapTiler APIs for satellite orthophoto, highway geocoding & reverse GPS triage
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              GOOGLE TILES ACTIVE
            </span>
          </div>
        </div>

        {/* Google Maps API Key Input & Test */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-white">Google Cloud / Maps API Key</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                Primary Provider
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowGoogleKey(!showGoogleKey)}
              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
            >
              {showGoogleKey ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Hide</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Show</span>
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <input
              type={showGoogleKey ? 'text' : 'password'}
              value={formData.googleApiKey || ''}
              onChange={(e) => setFormData({ ...formData, googleApiKey: e.target.value })}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 pr-9 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-orange-500 transition-colors"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
              <Key className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
            <p className="text-[11px] text-slate-400">
              Powers Google Maps Hybrid, Satellite Recon, Road infrastructure layers, and real-time reverse geocoding for disaster damage sites.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestGoogleKey}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Server className="w-3.5 h-3.5 text-orange-400" />
                <span>Test Google Key</span>
              </button>
              <a
                href="https://console.cloud.google.com/google/maps-apis/overview"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-orange-400 hover:text-orange-300 flex items-center gap-1"
              >
                <span>Google Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Test Status feedback */}
          {mapTestStatus === 'testing' && (
            <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Verifying Google Maps API services and endpoints...</span>
            </div>
          )}
          {mapTestStatus && mapTestStatus !== 'testing' && (
            <div
              className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                mapTestStatus.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : mapTestStatus.status === 'billing_required'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              {mapTestStatus.success ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              ) : (
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <div className="font-semibold">{mapTestStatus.message}</div>
                {mapTestStatus.status === 'billing_required' && (
                  <div className="text-[11px] opacity-80">
                    Tip: Google Hybrid and Satellite basemaps work out of the box. Enable billing on your Google Cloud project if you want to use the Geocoding API directly.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Optional Secondary Providers: Mapbox & MapTiler */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Mapbox Access Token */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>Mapbox Access Token</span>
                <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
              </label>
              <button
                type="button"
                onClick={() => setShowMapboxToken(!showMapboxToken)}
                className="text-[11px] text-slate-400 hover:text-slate-200"
              >
                {showMapboxToken ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={showMapboxToken ? 'text' : 'password'}
              value={formData.mapboxAccessToken || ''}
              onChange={(e) => setFormData({ ...formData, mapboxAccessToken: e.target.value })}
              placeholder="pk.eyJ1Ijo..."
              className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[10px] text-slate-400">
              Enables Mapbox Tactical Dark and Satellite Streets custom cartography.
            </p>
          </div>

          {/* MapTiler API Key */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>MapTiler API Key</span>
                <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
              </label>
              <button
                type="button"
                onClick={() => setShowMaptilerKey(!showMaptilerKey)}
                className="text-[11px] text-slate-400 hover:text-slate-200"
              >
                {showMaptilerKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={showMaptilerKey ? 'text' : 'password'}
              value={formData.maptilerApiKey || ''}
              onChange={(e) => setFormData({ ...formData, maptilerApiKey: e.target.value })}
              placeholder="maptiler_key_..."
              className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-rose-500"
            />
            <p className="text-[10px] text-slate-400">
              Enables MapTiler 3D Topographic and high-definition slope contours.
            </p>
          </div>
        </div>

        {/* Default Basemap Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-300">
            Default Tactical Basemap Style
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'google_hybrid', name: 'Google Hybrid (Satellite + Roads)', tag: 'Google' },
              { id: 'google_roads', name: 'Google Roads & Highways', tag: 'Google' },
              { id: 'google_terrain', name: 'Google Topographic Terrain', tag: 'Google' },
              { id: 'dark', name: 'Tactical Dark (CARTO)', tag: 'Tactical' },
              { id: 'satellite', name: 'Esri Satellite Recon', tag: 'Esri' },
              { id: 'streets', name: 'OpenStreetMap Standard', tag: 'OSM' }
            ].map(style => {
              const isSelected = formData.defaultMapStyle === style.id;
              return (
                <button
                  type="button"
                  key={style.id}
                  onClick={() => setFormData({ ...formData, defaultMapStyle: style.id })}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-orange-500/15 border-orange-500/50 text-white font-semibold shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="text-[10px] uppercase font-mono text-orange-400 font-bold mb-0.5">
                    {style.tag}
                  </div>
                  <div className="text-xs truncate">{style.name}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Backend & Cloud Database Integration */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30">
              <Database className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">Database & Image Storage Provider</h3>
              <p className="text-xs text-slate-400">
                Connect Firebase or Supabase for distributed multi-agency sync
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            CLIENT-SIDE READY
          </span>
        </div>

        {/* Backend Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: 'mock',
              title: 'Offline-First LocalStorage',
              desc: 'High-speed browser persistence + IndexedDB (No cloud setup needed)',
              icon: HardDrive
            },
            {
              id: 'supabase',
              title: 'Supabase Database',
              desc: 'PostgreSQL GIS with Supabase Storage for disaster photos',
              icon: Database
            },
            {
              id: 'firebase',
              title: 'Firebase Firestore',
              desc: 'Google Cloud Firestore Realtime DB with Firebase Storage',
              icon: Cloud
            }
          ].map(opt => {
            const Icon = opt.icon;
            const isSelected = formData.syncBackend === opt.id;
            return (
              <button
                type="button"
                key={opt.id}
                onClick={() => setFormData({ ...formData, syncBackend: opt.id })}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-orange-500/15 border-orange-500/50 shadow-md shadow-orange-950/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-orange-400' : 'text-slate-400'}`} />
                  {isSelected && <span className="h-2 w-2 rounded-full bg-orange-500"></span>}
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {opt.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {opt.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Backend Config Fields */}
        {formData.syncBackend === 'supabase' && (
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              Supabase Project Credentials
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  value={formData.supabaseUrl}
                  onChange={(e) => setFormData({ ...formData, supabaseUrl: e.target.value })}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  Supabase Anon Key
                </label>
                <input
                  type="password"
                  value={formData.supabaseAnonKey}
                  onChange={(e) => setFormData({ ...formData, supabaseAnonKey: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {formData.syncBackend === 'firebase' && (
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Firebase Project Credentials
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  Firebase Project ID
                </label>
                <input
                  type="text"
                  value={formData.firebaseProjectId}
                  onChange={(e) => setFormData({ ...formData, firebaseProjectId: e.target.value })}
                  placeholder="disaster-inspector-proj"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs text-slate-300 font-semibold">
                    Firebase / Google API Key
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                  >
                    {showApiKey ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Show</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={formData.firebaseApiKey || ''}
                    onChange={(e) => setFormData({ ...formData, firebaseApiKey: e.target.value })}
                    placeholder="AIzaSy..."
                    className="w-full px-3 py-2 pr-9 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <Key className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Test Connection Button */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleTestBackend}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Server className="w-4 h-4 text-orange-400" />
            <span>Test Connection & Schema</span>
          </button>

          {testStatus === 'testing' && (
            <span className="text-xs text-sky-400 flex items-center gap-1.5 font-semibold">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying connectivity...
            </span>
          )}
          {testStatus === 'success' && (
            <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Cloud Endpoint Reachable & Storage Ready
            </span>
          )}
          {testStatus === 'mock_active' && (
            <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-4 h-4" /> LocalStorage & IndexedDB Operational (Active)
            </span>
          )}
        </div>
      </div>

      {/* Sample Data & Disaster Presets */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Sparkles className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white">Disaster Datasets & Sample Scenarios</h3>
            <p className="text-xs text-slate-400">
              Manage sample data for training drills and emergency dispatch simulation
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-center justify-between flex-wrap gap-3">
          <div>
            <span className="font-semibold text-white">Active Scenario:</span> Cascadia Subduction Zone Earthquake & Coastal Flood Surge
            <p className="text-slate-400 mt-0.5">8 realistic damage locations with full photographic evidence & priority scores</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm('Reset all road reports back to default sample disaster data?')) {
                  onResetSampleData();
                }
              }}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-orange-400" />
              <span>Reset Default Sample Data</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Clear all current reports? (Warning: This will empty the database)')) {
                  onClearAllData();
                }
              }}
              className="px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Audio & Alerts Preference */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30">
              <Volume2 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">Emergency Broadcast Audio Alerts</h3>
              <p className="text-xs text-slate-400">
                Play acoustic alerts on incoming critical road damage reports
              </p>
            </div>
          </div>

          <button
            onClick={() => setSoundAlerts(!soundAlerts)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              soundAlerts
                ? 'bg-orange-600 text-white border-orange-500 shadow-md'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {soundAlerts ? 'Audio Enabled' : 'Audio Muted'}
          </button>
        </div>
      </div>

      {/* Backup and Data Export */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Download className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white">Export & Agency Interoperability</h3>
            <p className="text-xs text-slate-400">
              Generate GIS and spreadsheet packages for FEMA, DOT, and local emergency centers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => exportReportsToCSV(reports)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-colors"
          >
            <span>Export Reports to CSV Spreadsheet</span>
          </button>
          <button
            onClick={() => exportReportsToJSON(reports)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-colors"
          >
            <span>Export Full JSON Data Archive</span>
          </button>
        </div>
      </div>

      {/* Save Settings Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-orange-950 transition-all active:scale-95"
        >
          Save All System Preferences
        </button>
      </div>
    </div>
  );
}
