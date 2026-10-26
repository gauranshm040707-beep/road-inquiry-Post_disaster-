import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  ClipboardList,
  KanbanSquare,
  Settings,
  AlertTriangle,
  ShieldAlert,
  Flame,
  Radio,
  X
} from 'lucide-react';

export default function Sidebar({
  currentView,
  setCurrentView,
  reports,
  isOpen,
  setIsOpen
}) {
  const highPriorityCount = reports.filter(r => r.priorityLevel === 'High').length;
  const pendingCount = reports.filter(r => r.status === 'Pending').length;
  const activeInspectionsCount = reports.filter(r => r.status === 'Under Inspection').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'map',
      label: 'Disaster Map',
      icon: MapPin,
      badge: `${highPriorityCount} Critical`,
      badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/40'
    },
    {
      id: 'reports',
      label: 'Road Reports',
      icon: ClipboardList,
      badge: `${reports.length}`,
      badgeColor: 'bg-slate-800 text-slate-300 border border-slate-700'
    },
    {
      id: 'inspections',
      label: 'Inspections & Triage',
      icon: KanbanSquare,
      badge: `${pendingCount} New`,
      badgeColor: pendingCount > 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : null
    },
    {
      id: 'settings',
      label: 'Settings & Data Sync',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900/95 border-r border-slate-800/80 flex flex-col backdrop-blur-xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-orange-600 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-600/30">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                DISASTER ROAD
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  NDMA
                </span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">India National Highway Triage</p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Pill */}
        <div className="px-5 py-3 border-b border-slate-800/60 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold tracking-wide text-emerald-400 uppercase">
                Active Operations
              </span>
            </div>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md border border-slate-700">
              INDIA DISASTER
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Critical Lifelines at Risk:</span>
            <span className="font-bold text-red-400 font-mono">{highPriorityCount} Corridors</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
            Command Center
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500/20 to-red-500/10 text-orange-400 border border-orange-500/40 shadow-md shadow-orange-950/40 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-orange-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Emergency Protocols Guide */}
          <div className="pt-6 px-3">
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-red-950/40 to-slate-900 border border-red-900/40">
              <div className="flex items-center gap-2 text-red-400 text-xs font-bold mb-1">
                <Flame className="w-3.5 h-3.5" />
                <span>TRIAGE DIRECTIVE</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Hospital corridors & evacuation lifelines hold automatic Top Priority (Weight 35+25). Prioritize bridge fractures & complete washouts.
              </p>
            </div>
          </div>
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300">
              EM
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">REOC Incident Command</p>
              <p className="text-[10px] text-slate-400 truncate">Post-Disaster Response Unit</p>
            </div>
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
        </div>
      </aside>
    </>
  );
}
