import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import MapView from './components/MapView';
import ReportsView from './components/ReportsView';
import KanbanInspectionsView from './components/KanbanInspectionsView';
import SettingsView from './components/SettingsView';
import ReportDamageModal from './components/ReportDamageModal';
import RoadDetailDrawer from './components/RoadDetailDrawer';
import NotificationDrawer from './components/NotificationDrawer';
import {
  loadReports,
  saveReports,
  resetToSampleData,
  createNewReport,
  loadSettings,
  saveSettings,
  exportReportsToCSV,
  exportReportsToJSON
} from './utils/storage';

// Emergency Web Audio synthesizer for alert chimes
function playEmergencyChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3); // A4

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch (e) {
    // AudioContext might be blocked before user gesture
  }
}

export default function App() {
  const [reports, setReports] = useState(() => loadReports());
  const [settings, setSettings] = useState(() => loadSettings());
  const [currentView, setCurrentView] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const v = params.get('view');
      if (['dashboard', 'map', 'reports', 'inspections', 'settings'].includes(v)) return v;
    } catch (e) {}
    return 'dashboard';
  });
  const [selectedRoad, setSelectedRoad] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const roadId = params.get('road');
      if (roadId) {
        const list = loadReports();
        return list.find(r => r.id === roadId) || null;
      }
    } catch (e) {}
    return null;
  });
  const [isReportModalOpen, setIsReportModalOpen] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('modal') === 'report';
    } catch (e) {
      return false;
    }
  });
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');

  // Check URL for specific road dossier deep link
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const roadId = params.get('road');
      if (roadId) {
        const found = reports.find(r => r.id === roadId);
        if (found) setSelectedRoad(found);
      }
    } catch (e) {}
  }, [reports]);

  // Picking location mode for the map
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [pickedLocation, setPickedLocation] = useState(null);

  // Initial Notifications derived from high priority reports
  const [notifications, setNotifications] = useState(() => [
    {
      id: 'N-01',
      title: 'CRITICAL HIMALAYAN ROCKSLIDE',
      message: 'Rishikesh - Badrinath NH-58 blocked by 650 m³ boulders at Chamoli. NDRF & BRO deployed.',
      roadName: 'Rishikesh - Badrinath National Highway (NH-58), Chamoli Pass',
      priority: 'High',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString()
    },
    {
      id: 'N-02',
      title: 'VIADUCT STRUCTURAL DEFLECTION',
      message: 'Mumbai - Pune Expressway Pier 12 shows 18mm crack. Both lanes diverted via Old NH-48.',
      roadName: 'Mumbai - Pune Expressway (Bhor Ghat Section, Km 42)',
      priority: 'High',
      timestamp: new Date(Date.now() - 45 * 60000).toISOString()
    },
    {
      id: 'N-03',
      title: 'KONKAN FLASH FLOOD INUNDATION',
      message: 'NH-66 Vashishti River overflow submerged 1.8km near Chiplun. NDRF rescue rafts operating.',
      roadName: 'NH-66 Mumbai - Goa Highway (Vashishti River Bridge Approach, Chiplun)',
      priority: 'High',
      timestamp: new Date(Date.now() - 90 * 60000).toISOString()
    }
  ]);

  // Persist reports whenever they change
  useEffect(() => {
    saveReports(reports);
  }, [reports]);

  // Unique sectors
  const sectors = useMemo(() => {
    const s = new Set();
    reports.forEach(r => {
      if (r.sector) s.add(r.sector);
    });
    return Array.from(s);
  }, [reports]);

  // Filtered reports by search and sector
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      if (selectedSector !== 'ALL' && r.sector !== selectedSector) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = r.roadName?.toLowerCase().includes(q);
        const matchSector = r.sector?.toLowerCase().includes(q);
        const matchDamage = r.damageType?.toLowerCase().includes(q);
        const matchDesc = r.description?.toLowerCase().includes(q);
        const matchInspector = r.inspector?.toLowerCase().includes(q);
        if (!matchName && !matchSector && !matchDamage && !matchDesc && !matchInspector) return false;
      }
      return true;
    });
  }, [reports, searchQuery, selectedSector]);

  // Add new damage report
  const handleAddReport = useCallback((formData) => {
    const newReport = createNewReport(formData);
    setReports(prev => [newReport, ...prev]);

    // Create notification
    const newNotif = {
      id: `N-${Date.now()}`,
      title: newReport.priorityLevel === 'High' ? 'CRITICAL ROAD REPORT LOGGED' : 'NEW ROAD DAMAGE REPORT',
      message: `${newReport.roadName} recorded with Priority Score ${newReport.priorityScore}/100 (${newReport.damageType}).`,
      roadName: newReport.roadName,
      priority: newReport.priorityLevel,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);

    if (soundAlerts && newReport.priorityLevel === 'High') {
      playEmergencyChime();
    }

    // Auto-select and show newly created report
    setSelectedRoad(newReport);
  }, [soundAlerts]);

  // Update inspection status
  const handleUpdateStatus = useCallback((id, newStatus, user = 'Operator', note = '') => {
    setReports(prev => prev.map(r => {
      if (r.id !== id) return r;
      const historyEntry = {
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user,
        action: `Status Changed to ${newStatus}`,
        note: note || `Road triage status transitioned to ${newStatus}.`
      };
      return {
        ...r,
        status: newStatus,
        inspectionHistory: [historyEntry, ...(r.inspectionHistory || [])]
      };
    }));

    // Update selected road if currently opened
    setSelectedRoad(prev => {
      if (!prev || prev.id !== id) return prev;
      return {
        ...prev,
        status: newStatus,
        inspectionHistory: [
          {
            id: `LOG-${Date.now()}`,
            timestamp: new Date().toISOString(),
            user,
            action: `Status Changed to ${newStatus}`,
            note: note || `Road triage status transitioned to ${newStatus}.`
          },
          ...(prev.inspectionHistory || [])
        ]
      };
    });
  }, []);

  // Add note to a report
  const handleAddNote = useCallback((id, noteText) => {
    const newEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: 'Field Inspection Crew',
      action: 'Field Inspection Note Added',
      note: noteText
    };

    setReports(prev => prev.map(r => {
      if (r.id !== id) return r;
      return {
        ...r,
        inspectionHistory: [newEntry, ...(r.inspectionHistory || [])]
      };
    }));

    setSelectedRoad(prev => {
      if (!prev || prev.id !== id) return prev;
      return {
        ...prev,
        inspectionHistory: [newEntry, ...(prev.inspectionHistory || [])]
      };
    });
  }, []);

  // Reset sample data
  const handleResetSampleData = useCallback(() => {
    const initial = resetToSampleData();
    setReports(initial);
    setSelectedRoad(null);
  }, []);

  // Clear all data
  const handleClearAllData = useCallback(() => {
    setReports([]);
    saveReports([]);
    setSelectedRoad(null);
  }, []);

  // Handle map click location pick
  const handleLocationPicked = useCallback((latlng) => {
    setPickedLocation(latlng);
    setIsPickingLocation(false);
    setIsReportModalOpen(true);
  }, []);

  // Notification click
  const handleSelectNotification = useCallback((notif) => {
    const target = reports.find(r => r.roadName === notif.roadName);
    if (target) {
      setSelectedRoad(target);
    }
  }, [reports]);

  const criticalAlertCount = useMemo(() => {
    return reports.filter(r => r.priorityLevel === 'High' && r.status !== 'Completed').length;
  }, [reports]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Sidebar navigation */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        reports={reports}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex-1 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedSector={selectedSector}
          setSelectedSector={setSelectedSector}
          sectors={sectors}
          onOpenReportModal={() => setIsReportModalOpen(true)}
          onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
          unreadNotificationsCount={notifications.length}
          soundAlerts={soundAlerts}
          setSoundAlerts={setSoundAlerts}
          criticalAlertCount={criticalAlertCount}
        />

        {/* View Switcher */}
        <main className="flex-1 pb-16">
          {currentView === 'dashboard' && (
            <DashboardView
              reports={filteredReports}
              onSelectRoad={(road) => setSelectedRoad(road)}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              onNavigateToMap={() => setCurrentView('map')}
              onNavigateToReports={() => setCurrentView('reports')}
              onNavigateToInspections={() => setCurrentView('inspections')}
              onExportCSV={() => exportReportsToCSV(filteredReports)}
            />
          )}

          {currentView === 'map' && (
            <MapView
              reports={filteredReports}
              onSelectRoad={(road) => setSelectedRoad(road)}
              selectedRoad={selectedRoad}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              isPickingLocation={isPickingLocation}
              onLocationPicked={handleLocationPicked}
              settings={settings}
            />
          )}

          {currentView === 'reports' && (
            <ReportsView
              reports={filteredReports}
              onSelectRoad={(road) => setSelectedRoad(road)}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              onExportCSV={() => exportReportsToCSV(filteredReports)}
              onExportJSON={() => exportReportsToJSON(filteredReports)}
              onUpdateStatus={handleUpdateStatus}
            />
          )}

          {currentView === 'inspections' && (
            <KanbanInspectionsView
              reports={filteredReports}
              onSelectRoad={(road) => setSelectedRoad(road)}
              onUpdateStatus={handleUpdateStatus}
              onOpenReportModal={() => setIsReportModalOpen(true)}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={(s) => {
                setSettings(s);
                saveSettings(s);
              }}
              onResetSampleData={handleResetSampleData}
              onClearAllData={handleClearAllData}
              reports={reports}
              soundAlerts={soundAlerts}
              setSoundAlerts={setSoundAlerts}
            />
          )}
        </main>
      </div>

      {/* Report Damage Modal */}
      <ReportDamageModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleAddReport}
        onPickOnMap={() => {
          setIsReportModalOpen(false);
          setIsPickingLocation(true);
          setCurrentView('map');
        }}
        pickedLocation={pickedLocation}
        settings={settings}
      />

      {/* Affected Area Details Slide-over Drawer */}
      <RoadDetailDrawer
        road={selectedRoad}
        isOpen={Boolean(selectedRoad)}
        onClose={() => setSelectedRoad(null)}
        onUpdateStatus={handleUpdateStatus}
        onAddNote={handleAddNote}
        onAssignInspector={(id, name) => {
          setReports(prev => prev.map(r => r.id === id ? { ...r, inspector: name } : r));
        }}
      />

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        onSelectNotification={handleSelectNotification}
        onClearAll={() => setNotifications([])}
      />
    </div>
  );
}
