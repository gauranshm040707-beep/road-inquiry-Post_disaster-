import React, { useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  PlusCircle,
  Bell,
  Volume2,
  VolumeX,
  AlertCircle,
  Filter,
  CheckCircle2
} from 'lucide-react';

export default function Navbar({
  onToggleSidebar,
  searchQuery,
  setSearchQuery,
  selectedSector,
  setSelectedSector,
  sectors,
  onOpenReportModal,
  onOpenNotifications,
  unreadNotificationsCount,
  soundAlerts,
  setSoundAlerts,
  criticalAlertCount
}) {
  const searchInputRef = useRef(null);

  // Global keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800">
      {/* Top Hazard Marquee Alert */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-b border-red-900/40 px-4 py-1.5 text-xs flex items-center justify-between text-slate-300 overflow-hidden">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-2 w-2 relative flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="font-bold text-red-400 uppercase tracking-wider text-[10px] flex-shrink-0">
            EMERGENCY BROADCAST:
          </span>
          <span className="truncate text-slate-300 text-[11px]">
            {criticalAlertCount > 0
              ? `${criticalAlertCount} High-Priority Road Lifelines severing emergency access. Immediate structural inspections required.`
              : 'All vital emergency road lifelines currently passable under active monitoring.'}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400 flex-shrink-0">
          <span className="font-mono text-orange-400">SECTOR STATUS: LEVEL 2 DISASTER</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="hidden md:block">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Disaster Road Inspector
            </h2>
          </div>
        </div>

        {/* Center: Search Bar & Sector Filter */}
        <div className="flex-1 max-w-xl flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search roads, damage types, sectors, or notes (Press '/' to focus)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-12 py-2 rounded-xl bg-slate-950/70 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
            />
            <kbd className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
              /
            </kbd>
          </div>

          {/* Sector Filter */}
          <div className="hidden sm:flex items-center relative">
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="appearance-none bg-slate-800/80 border border-slate-700 text-xs text-slate-200 py-2.5 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 cursor-pointer"
            >
              <option value="ALL">All Sectors</option>
              {sectors.map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Alert Toggle */}
          <button
            onClick={() => setSoundAlerts(!soundAlerts)}
            className={`p-2.5 rounded-xl border transition-all ${
              soundAlerts
                ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:text-slate-300'
            }`}
            title={soundAlerts ? 'Emergency Audio Alerts On' : 'Audio Alerts Muted'}
          >
            {soundAlerts ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 text-[9px] font-bold text-white items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              </span>
            )}
          </button>

          {/* Primary Action: Report Road Damage */}
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-orange-900/40 hover:shadow-orange-900/60 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            <span className="hidden xs:inline">Report Affected Road</span>
            <span className="xs:hidden">Report</span>
          </button>
        </div>
      </div>
    </header>
  );
}
