import React, { useMemo } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  ClipboardList,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Wrench,
  Radio,
  ExternalLink,
  ChevronRight,
  PlusCircle,
  FileSpreadsheet,
  Flame,
  Zap,
  Activity
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { getPriorityBadgeColor, getStatusBadgeColor } from '../utils/priorityEngine';
import { formatTimeAgo } from '../utils/formatters';

const PIE_COLORS = ['#ef4444', '#f97316', '#3b82f6', '#8b5cf6', '#10b981', '#06b6d4', '#ec4899'];

export default function DashboardView({
  reports,
  onSelectRoad,
  onOpenReportModal,
  onNavigateToMap,
  onNavigateToReports,
  onNavigateToInspections,
  onExportCSV
}) {
  // Metric Calculations
  const metrics = useMemo(() => {
    const total = reports.length;
    const high = reports.filter(r => r.priorityLevel === 'High').length;
    const medium = reports.filter(r => r.priorityLevel === 'Medium').length;
    const low = reports.filter(r => r.priorityLevel === 'Low').length;

    const pending = reports.filter(r => r.status === 'Pending').length;
    const underInspection = reports.filter(r => r.status === 'Under Inspection').length;
    const repairRequired = reports.filter(r => r.status === 'Repair Required').length;
    const completed = reports.filter(r => r.status === 'Completed').length;

    const completelyBlocked = reports.filter(r => r.passageStatus?.includes('Completely Blocked')).length;
    const lifelineAtRisk = reports.filter(r => r.roadImportance?.includes('Lifeline') && r.status !== 'Completed').length;

    const clearanceRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      high,
      medium,
      low,
      pending,
      underInspection,
      repairRequired,
      completed,
      completelyBlocked,
      lifelineAtRisk,
      clearanceRate
    };
  }, [reports]);

  // Chart Data: Damage Type Distribution
  const damageTypeData = useMemo(() => {
    const countMap = {};
    reports.forEach(r => {
      const type = r.damageType ? r.damageType.split('/')[0].trim() : 'Other';
      countMap[type] = (countMap[type] || 0) + 1;
    });
    return Object.entries(countMap).map(([name, value]) => ({ name, value }));
  }, [reports]);

  // Chart Data: Status by Priority
  const statusPriorityData = useMemo(() => {
    const statuses = ['Pending', 'Under Inspection', 'Repair Required', 'Completed'];
    return statuses.map(st => {
      const items = reports.filter(r => r.status === st);
      return {
        status: st === 'Under Inspection' ? 'Inspecting' : st === 'Repair Required' ? 'Repair' : st,
        High: items.filter(r => r.priorityLevel === 'High').length,
        Medium: items.filter(r => r.priorityLevel === 'Medium').length,
        Low: items.filter(r => r.priorityLevel === 'Low').length
      };
    });
  }, [reports]);

  // Chart Data: Hourly Incident Velocity (Simulated timeline data)
  const timelineData = useMemo(() => [
    { time: '06:00', reported: 1, inspected: 0, cleared: 0 },
    { time: '08:00', reported: 3, inspected: 1, cleared: 0 },
    { time: '10:00', reported: 6, inspected: 3, cleared: 1 },
    { time: '12:00', reported: 8, inspected: 5, cleared: 1 },
    { time: 'Now', reported: reports.length, inspected: metrics.underInspection + metrics.repairRequired + metrics.completed, cleared: metrics.completed }
  ], [reports, metrics]);

  // Top Critical Roads requiring urgent inspection
  const criticalUrgentRoads = useMemo(() => {
    return [...reports]
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 5);
  }, [reports]);

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Hazard Status Alert Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-red-950/70 via-slate-900 to-amber-950/70 border border-red-500/30 p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 flex-shrink-0">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold font-mono tracking-wider px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                  NATIONAL EMERGENCY LEVEL 2
                </span>
                <span className="text-xs text-slate-400">Indian Monsoon & Himalayan Landslide Surge Event</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                National Highway Disaster Triage & Emergency Services Coordination (NHAI / NDRF)
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Automated algorithm has triaged <span className="font-semibold text-red-400">{metrics.high} critical lifelines</span> across NH-58 (Chamoli), NH-66 (Konkan), and Mumbai-Pune corridor. Active NDRF and BRO heavy excavator requisitions in progress.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
            <button
              onClick={onOpenReportModal}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-semibold text-xs shadow-lg shadow-orange-900/40 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Damage</span>
            </button>
            <button
              onClick={onNavigateToMap}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-xs transition-all"
            >
              <MapPin className="w-4 h-4 text-orange-400" />
              <span>Open GIS Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Damaged Roads */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Affected Roads</span>
            <span className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
              <ClipboardList className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {metrics.total}
            </span>
            <span className="text-xs text-slate-400">sites logged</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total Impassable:</span>
            <span className="font-semibold text-red-400 font-mono">{metrics.completelyBlocked} Roads</span>
          </div>
        </div>

        {/* High / Critical Priority */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-red-950/40 to-slate-900/80 border border-red-500/30 backdrop-blur-xl relative overflow-hidden group hover:border-red-500/50 transition-all">
          <div className="flex items-center justify-between text-red-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
              High Priority
            </span>
            <span className="p-1.5 rounded-lg bg-red-500/20 text-red-400">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-red-400 font-mono">
              {metrics.high}
            </span>
            <span className="text-xs text-red-300/80">urgent triage</span>
          </div>
          <div className="mt-3 pt-3 border-t border-red-900/40 flex items-center justify-between text-xs">
            <span className="text-slate-400">Lifelines at Risk:</span>
            <span className="font-bold text-red-400 font-mono">{metrics.lifelineAtRisk} Routes</span>
          </div>
        </div>

        {/* Pending Inspections */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Pending Inspections</span>
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {metrics.pending}
            </span>
            <span className="text-xs text-sky-400">awaiting field unit</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Under Inspection:</span>
            <span className="font-semibold text-sky-400 font-mono">{metrics.underInspection} Units</span>
          </div>
        </div>

        {/* Completed Repairs */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Cleared & Repaired</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
              {metrics.completed}
            </span>
            <span className="text-xs text-slate-400">roads reopened</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Network Clearance:</span>
            <span className="font-semibold text-emerald-400 font-mono">{metrics.clearanceRate}% Safe</span>
          </div>
        </div>
      </div>

      {/* Priority Level Breakdown Strip */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-400" />
              Automated Severity & Priority Distribution
            </h3>
            <p className="text-xs text-slate-400">
              Based on algorithmic weighting of damage severity, passage status, and lifeline criticality
            </p>
          </div>
          <button
            onClick={onNavigateToReports}
            className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1"
          >
            View All Reports <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="h-3 rounded-full bg-slate-800 overflow-hidden flex gap-1 p-0.5">
          <div
            style={{ width: `${metrics.total > 0 ? (metrics.high / metrics.total) * 100 : 0}%` }}
            className="h-full bg-red-500 rounded-full transition-all duration-500"
            title={`High: ${metrics.high}`}
          />
          <div
            style={{ width: `${metrics.total > 0 ? (metrics.medium / metrics.total) * 100 : 0}%` }}
            className="h-full bg-amber-500 rounded-full transition-all duration-500"
            title={`Medium: ${metrics.medium}`}
          />
          <div
            style={{ width: `${metrics.total > 0 ? (metrics.low / metrics.total) * 100 : 0}%` }}
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            title={`Low: ${metrics.low}`}
          />
        </div>

        {/* Priority Legend Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <div>
                <p className="text-xs font-bold text-red-400">High Priority (Score 70-100)</p>
                <p className="text-[11px] text-slate-400">Immediate hazard / Lifeline cut</p>
              </div>
            </div>
            <span className="text-lg font-mono font-bold text-red-400">{metrics.high}</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <div>
                <p className="text-xs font-bold text-amber-400">Medium Priority (Score 40-69)</p>
                <p className="text-[11px] text-slate-400">Arterial delay / Single lane</p>
              </div>
            </div>
            <span className="text-lg font-mono font-bold text-amber-400">{metrics.medium}</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <div>
                <p className="text-xs font-bold text-emerald-400">Low Priority (Score 0-39)</p>
                <p className="text-[11px] text-slate-400">Passable / Local road surface</p>
              </div>
            </div>
            <span className="text-lg font-mono font-bold text-emerald-400">{metrics.low}</span>
          </div>
        </div>
      </div>

      {/* Interactive Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Damage Type Distribution */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Damage Type Breakdown</h3>
              <p className="text-xs text-slate-400">Distribution across structural and geotechnical failures</p>
            </div>
            <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">
              {damageTypeData.length} Types
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={damageTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {damageTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Inspection Pipeline by Priority */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Inspection Status by Priority Tier</h3>
              <p className="text-xs text-slate-400">Operational triage workflow progress</p>
            </div>
            <button
              onClick={onNavigateToInspections}
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
            >
              Open Kanban <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={statusPriorityData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="status" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
                />
                <Bar dataKey="High" fill="#ef4444" stackId="a" isAnimationActive={false} />
                <Bar dataKey="Medium" fill="#f97316" stackId="a" isAnimationActive={false} />
                <Bar dataKey="Low" fill="#10b981" stackId="a" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Critical Urgent Attention Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-red-500/20 text-red-400">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-white">Top Critical Roads Requiring Urgent Inspection</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked dynamically by automated algorithmic priority score
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition-all"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onNavigateToReports}
              className="text-xs font-semibold text-orange-400 hover:text-orange-300 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30"
            >
              View Full Table
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
                <th className="py-3 px-4">Priority Score</th>
                <th className="py-3 px-4">Road Name & Sector</th>
                <th className="py-3 px-4">Damage Type</th>
                <th className="py-3 px-4">Passage Status</th>
                <th className="py-3 px-4">Key Priority Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {criticalUrgentRoads.map((road) => {
                const priorityBadge = getPriorityBadgeColor(road.priorityLevel);
                const statusBadge = getStatusBadgeColor(road.status);

                return (
                  <tr
                    key={road.id}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    onClick={() => onSelectRoad(road)}
                  >
                    {/* Priority Score */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border font-mono ${priorityBadge.bg} ${priorityBadge.border} ${priorityBadge.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${priorityBadge.dot}`}></span>
                          {road.priorityScore} / 100
                        </span>
                      </div>
                    </td>

                    {/* Road Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-100 group-hover:text-orange-400 transition-colors">
                        {road.roadName}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{road.sector}</span>
                        {road.isSample && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            SAMPLE DATA
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Damage Type */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-slate-300 font-medium">{road.damageType}</span>
                    </td>

                    {/* Passage Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${
                          road.passageStatus?.includes('Blocked')
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : road.passageStatus?.includes('Emergency')
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {road.passageStatus ? road.passageStatus.split('(')[0] : 'Unknown'}
                      </span>
                    </td>

                    {/* Key Priority Reason */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-[11px] text-slate-300 truncate" title={road.priorityReasons?.[0]}>
                        {road.priorityReasons?.[0] || 'High severity hazard'}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusBadge.bg} ${statusBadge.border} ${statusBadge.text}`}
                      >
                        {statusBadge.label}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRoad(road);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-orange-600 text-slate-300 hover:text-white border border-slate-700 hover:border-orange-500 transition-all text-xs font-semibold"
                      >
                        Inspect Dossier
                      </button>
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
