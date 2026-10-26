import { getInitialReports } from '../data/sampleReports';
import { calculatePriority } from './priorityEngine';

const STORAGE_KEY = 'disaster_road_inspector_india_v3_reports';
const SETTINGS_KEY = 'disaster_road_inspector_india_v3_settings';
const NOTIFICATIONS_KEY = 'disaster_road_inspector_india_v3_notifications';

export const DEFAULT_SETTINGS = {
  syncBackend: 'mock', // 'mock' | 'supabase' | 'firebase'
  supabaseUrl: 'https://ndma-disaster-resilience.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  firebaseApiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDHVciPXDydjJuc0BSYCAYrnh0H-d2x3ts',
  googleApiKey: import.meta.env.VITE_GOOGLE_API_KEY || 'AIzaSyDHVciPXDydjJuc0BSYCAYrnh0H-d2x3ts',
  mapboxAccessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '',
  maptilerApiKey: import.meta.env.VITE_MAPTILER_API_KEY || '',
  firebaseProjectId: 'ndma-road-triage-india',
  soundAlerts: true,
  autoRefreshInterval: 30, // seconds
  defaultMapStyle: 'google_hybrid', // 'google_hybrid' | 'google_roads' | 'google_terrain' | 'dark' | 'satellite' | 'streets'
  agencyName: 'National Disaster Management Authority (NDMA) & NHAI',
  commanderName: 'Chief Controller - Operations Center'
};

export function loadReports() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialReports();
      saveReports(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load reports from storage, resetting to default:', err);
  }
  const fallback = getInitialReports();
  saveReports(fallback);
  return fallback;
}

export function saveReports(reports) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch (err) {
    console.error('Failed to save reports to localStorage:', err);
  }
}

export function resetToSampleData() {
  const initial = getInitialReports();
  saveReports(initial);
  return initial;
}

export function createNewReport(formData) {
  const priority = calculatePriority({
    severity: formData.severity,
    passageStatus: formData.passageStatus,
    roadImportance: formData.roadImportance,
    publicSafetyRisk: formData.publicSafetyRisk,
    damageType: formData.damageType
  });

  const reportId = `RPT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  const newReport = {
    id: reportId,
    roadName: formData.roadName.trim(),
    sector: formData.sector || 'Uttarakhand - Garhwal Himalayan Sector',
    coordinates: {
      lat: Number(formData.latitude) || 30.3753,
      lng: Number(formData.longitude) || 79.3312
    },
    damageType: formData.damageType,
    severity: formData.severity,
    roadImportance: formData.roadImportance,
    passageStatus: formData.passageStatus,
    publicSafetyRisk: formData.publicSafetyRisk,
    reportedAt: now,
    inspector: formData.inspector || 'Unassigned (Pending NDRF/BRO Dispatch)',
    status: 'Pending',
    photos: formData.photos && formData.photos.length > 0 ? formData.photos : ['/images/landslide.jpg'],
    description: formData.description || 'Field emergency report submitted via Disaster Road Inspector system.',
    estimatedRepairHours: Number(formData.estimatedRepairHours) || 24,
    requiredServices: formData.requiredServices && formData.requiredServices.length > 0
      ? formData.requiredServices
      : ['Heavy Excavators (BRO/NHAI)', '108 Trauma Ambulances'],
    requiredEquipment: formData.requiredEquipment || ['Basic Survey Kit', 'Traffic Barricades'],
    priorityScore: priority.score,
    priorityLevel: priority.level,
    priorityReasons: priority.reasons,
    isSample: false, // User reports are live entries
    inspectionHistory: [
      {
        id: `LOG-${Date.now()}`,
        timestamp: now,
        user: formData.reporterName || 'Field Reporter',
        action: 'Initial Damage Report Submitted',
        note: `Damage registered with automated priority score of ${priority.score}/100 (${priority.level} Priority).`
      }
    ]
  };

  return newReport;
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.firebaseApiKey || parsed.firebaseApiKey.includes('AIzaSyA8B9cDEfg')) {
        parsed.firebaseApiKey = DEFAULT_SETTINGS.firebaseApiKey;
      }
      if (!parsed.googleApiKey) {
        parsed.googleApiKey = DEFAULT_SETTINGS.googleApiKey;
      }
      if (parsed.mapboxAccessToken === undefined) {
        parsed.mapboxAccessToken = DEFAULT_SETTINGS.mapboxAccessToken;
      }
      if (parsed.maptilerApiKey === undefined) {
        parsed.maptilerApiKey = DEFAULT_SETTINGS.maptilerApiKey;
      }
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.warn('Failed loading settings, using defaults', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function exportReportsToJSON(reports) {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reports, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `disaster_road_inspection_export_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportReportsToCSV(reports) {
  const headers = [
    'Report ID',
    'Road Name',
    'Sector',
    'Latitude',
    'Longitude',
    'Damage Type',
    'Severity',
    'Priority Level',
    'Priority Score',
    'Passage Status',
    'Road Importance',
    'Inspection Status',
    'Assigned Inspector',
    'Reported At',
    'Est Repair Hours'
  ];

  const rows = reports.map(r => [
    `"${r.id}"`,
    `"${r.roadName.replace(/"/g, '""')}"`,
    `"${r.sector.replace(/"/g, '""')}"`,
    r.coordinates.lat,
    r.coordinates.lng,
    `"${r.damageType}"`,
    `"${r.severity}"`,
    `"${r.priorityLevel}"`,
    r.priorityScore,
    `"${r.passageStatus}"`,
    `"${r.roadImportance}"`,
    `"${r.status}"`,
    `"${r.inspector}"`,
    `"${r.reportedAt}"`,
    r.estimatedRepairHours
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', encodeURI(csvContent));
  downloadAnchor.setAttribute('download', `disaster_roads_table_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
