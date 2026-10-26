import React, { useState } from 'react';
import {
  KanbanSquare,
  Clock,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  MapPin,
  Flame,
  PlusCircle,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getPriorityBadgeColor } from '../utils/priorityEngine';
import { formatTimeAgo } from '../utils/formatters';

const COLUMNS = [
  {
    id: 'Pending',
    title: 'Pending Triage',
    subtitle: 'New unverified field reports',
    color: 'border-slate-700 bg-slate-900/50',
    headerBg: 'bg-slate-800 text-slate-300',
    icon: Clock
  },
  {
    id: 'Under Inspection',
    title: 'Under Inspection',
    subtitle: 'Engineers & reconnaissance on site',
    color: 'border-sky-500/40 bg-sky-950/20',
    headerBg: 'bg-sky-500/20 text-sky-400 border border-sky-500/30',
    icon: UserCheck
  },
  {
    id: 'Repair Required',
    title: 'Repair Required',
    subtitle: 'Machinery & civil repairs queued',
    color: 'border-orange-500/40 bg-orange-950/20',
    headerBg: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    icon: Wrench
  },
  {
    id: 'Completed',
    title: 'Completed & Cleared',
    subtitle: 'Structural verification passed',
    color: 'border-emerald-500/40 bg-emerald-950/20',
    headerBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    icon: CheckCircle2
  }
];

export default function KanbanInspectionsView({
  reports,
  onSelectRoad,
  onUpdateStatus,
  onOpenReportModal
}) {
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const filteredReports = reports.filter(r => {
    if (priorityFilter !== 'ALL' && r.priorityLevel !== priorityFilter) return false;
    return true;
  });

  const handleAdvanceStatus = (road, targetStatus) => {
    onUpdateStatus(road.id, targetStatus, 'Kanban Operations', `Status advanced to ${targetStatus}`);
    if (targetStatus === 'Completed') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Road Inspection Workflow & Repair Coordination
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Dispatch inspection teams, monitor engineering repairs, and clear verified corridors
          </p>
        </div>

        {/* Priority Filter chips */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          {['ALL', 'High', 'Medium', 'Low'].map(p => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                priorityFilter === p
                  ? 'bg-orange-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {p === 'ALL' ? 'All Priorities' : `${p} Priority`}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
        {COLUMNS.map(col => {
          const ColIcon = col.icon;
          const colItems = filteredReports.filter(r => r.status === col.id);

          return (
            <div
              key={col.id}
              className={`rounded-2xl border p-4 flex flex-col min-h-[500px] backdrop-blur-xl ${col.color}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`p-1.5 rounded-lg ${col.headerBg}`}>
                    <ColIcon className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-white">{col.title}</h3>
                    <p className="text-[10px] text-slate-400">{col.subtitle}</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                  {colItems.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-18rem)] pr-0.5">
                {colItems.length === 0 ? (
                  <div className="text-center py-10 px-2 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                    No reports in this stage
                  </div>
                ) : (
                  colItems.map(road => {
                    const priorityBadge = getPriorityBadgeColor(road.priorityLevel);
                    return (
                      <div
                        key={road.id}
                        onClick={() => onSelectRoad(road)}
                        className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-md hover:shadow-xl transition-all cursor-pointer group space-y-2.5"
                      >
                        {/* Top Tag & Priority */}
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${priorityBadge.bg} ${priorityBadge.border} ${priorityBadge.text}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${priorityBadge.dot}`}></span>
                            Score {road.priorityScore}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatTimeAgo(road.reportedAt)}
                          </span>
                        </div>

                        {/* Road Title */}
                        <div>
                          <h4 className="font-semibold text-xs text-white group-hover:text-orange-400 transition-colors line-clamp-2">
                            {road.roadName}
                          </h4>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            <span className="truncate">{road.sector}</span>
                          </p>
                        </div>

                        {/* Damage info pill */}
                        <div className="text-[11px] bg-slate-950/60 p-2 rounded-lg border border-slate-800 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Damage:</span>
                            <span className="font-semibold text-slate-200 truncate max-w-[120px]">
                              {road.damageType}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Inspector:</span>
                            <span className="text-slate-300 font-medium truncate max-w-[120px]">
                              {road.inspector}
                            </span>
                          </div>
                        </div>

                        {/* Automated Reason badge snippet */}
                        {road.priorityReasons?.[0] && (
                          <div className="text-[10px] text-red-300/80 bg-red-950/30 border border-red-900/40 p-1.5 rounded-md truncate">
                            {road.priorityReasons[0]}
                          </div>
                        )}

                        {/* Quick Action Transitions */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1 text-[11px]">
                          {col.id === 'Pending' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAdvanceStatus(road, 'Under Inspection');
                              }}
                              className="w-full py-1 rounded-lg bg-sky-600/30 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/40 transition-all font-semibold flex items-center justify-center gap-1"
                            >
                              <span>Dispatch Team</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}

                          {col.id === 'Under Inspection' && (
                            <div className="flex items-center gap-1 w-full">
                              <button
                                onClick={(e) => {
                                e.stopPropagation();
                                handleAdvanceStatus(road, 'Pending');
                              }}
                                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
                                title="Roll back"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAdvanceStatus(road, 'Repair Required');
                                }}
                                className="flex-1 py-1 rounded-lg bg-orange-600/30 hover:bg-orange-600 text-orange-300 hover:text-white border border-orange-500/40 font-semibold flex items-center justify-center gap-1"
                              >
                                <span>Req. Repairs</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}

                          {col.id === 'Repair Required' && (
                            <div className="flex items-center gap-1 w-full">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAdvanceStatus(road, 'Under Inspection');
                                }}
                                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
                                title="Back to Inspection"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAdvanceStatus(road, 'Completed');
                                }}
                                className="flex-1 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 font-semibold flex items-center justify-center gap-1"
                              >
                                <span>Mark Cleared</span>
                                <CheckCircle2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}

                          {col.id === 'Completed' && (
                            <div className="w-full flex items-center justify-between text-emerald-400 font-semibold text-[10px]">
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Road Reopened
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAdvanceStatus(road, 'Repair Required');
                                }}
                                className="text-[10px] text-slate-400 hover:text-slate-200 underline"
                              >
                                Reopen Case
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
