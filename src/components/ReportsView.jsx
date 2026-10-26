import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  FileSpreadsheet,
  FileText,
  MapPin,
  Clock,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Eye,
  Grid,
  List,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { getPriorityBadgeColor, getStatusBadgeColor } from '../utils/priorityEngine';
import { formatDate, formatTimeAgo, formatCoordinates } from '../utils/formatters';

export default function ReportsView({
  reports,
  onSelectRoad,
  onOpenReportModal,
  onExportCSV,
  onExportJSON,
  onUpdateStatus
}) {
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [damageTypeFilter, setDamageTypeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('priorityScore'); // 'priorityScore' | 'reportedAt' | 'roadName' | 'repairHours'
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchFilter, setSearchFilter] = useState('');

  // Extract unique damage types
  const damageTypes = useMemo(() => {
    const set = new Set();
    reports.forEach(r => {
      if (r.damageType) set.add(r.damageType);
    });
    return Array.from(set);
  }, [reports]);

  // Filter & Sort
  const processedReports = useMemo(() => {
    return reports
      .filter(r => {
        if (priorityFilter !== 'ALL' && r.priorityLevel !== priorityFilter) return false;
        if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
        if (damageTypeFilter !== 'ALL' && r.damageType !== damageTypeFilter) return false;
        if (searchFilter) {
          const q = searchFilter.toLowerCase();
          const matchName = r.roadName?.toLowerCase().includes(q);
          const matchSector = r.sector?.toLowerCase().includes(q);
          const matchDesc = r.description?.toLowerCase().includes(q);
          const matchInspector = r.inspector?.toLowerCase().includes(q);
          if (!matchName && !matchSector && !matchDesc && !matchInspector) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        if (sortBy === 'reportedAt') {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [reports, priorityFilter, statusFilter, damageTypeFilter, searchFilter, sortBy, sortOrder]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Road Damage Reports & Inspection Inventory
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse, filter, and prioritize disaster-affected road segments across all sectors
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-all"
            title="Download CSV Table"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-all"
            title="Download Raw JSON"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-xs font-bold shadow-lg shadow-orange-950 transition-all"
          >
            <span>+ Log New Road</span>
          </button>
        </div>
      </div>

      {/* Filter and View Mode Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by road name, sector, damage type, or assigned unit..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/70 border border-slate-700 text-xs sm:text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 self-end lg:self-auto bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'table' ? 'bg-orange-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'grid' ? 'bg-orange-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Card Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Dropdowns Strip */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
          {/* Priority filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-medium">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-950/80 border border-slate-700 text-slate-200 py-1.5 px-2.5 rounded-xl text-xs focus:outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="High">High Priority Only</option>
              <option value="Medium">Medium Priority Only</option>
              <option value="Low">Low Priority Only</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950/80 border border-slate-700 text-slate-200 py-1.5 px-2.5 rounded-xl text-xs focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending Triage</option>
              <option value="Under Inspection">Under Inspection</option>
              <option value="Repair Required">Repair Required</option>
              <option value="Completed">Completed / Cleared</option>
            </select>
          </div>

          {/* Damage Type filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-medium">Damage Type:</span>
            <select
              value={damageTypeFilter}
              onChange={(e) => setDamageTypeFilter(e.target.value)}
              className="bg-slate-950/80 border border-slate-700 text-slate-200 py-1.5 px-2.5 rounded-xl text-xs focus:outline-none max-w-xs truncate"
            >
              <option value="ALL">All Damage Types</option>
              {damageTypes.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Sort selector */}
          <div className="ml-auto flex items-center gap-1">
            <span className="text-slate-400 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-950/80 border border-slate-700 text-slate-200 py-1.5 px-2.5 rounded-xl text-xs focus:outline-none"
            >
              <option value="priorityScore">Priority Score (Highest)</option>
              <option value="reportedAt">Report Date</option>
              <option value="roadName">Road Name</option>
              <option value="estimatedRepairHours">Est. Repair Time</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 rounded-xl bg-slate-950/80 border border-slate-700 text-slate-300 hover:text-white"
              title="Toggle Sort Order"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count & Sample Notice */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <span className="font-semibold text-white">{processedReports.length}</span> of {reports.length} road reports
        </span>
        <span className="text-amber-400/90 flex items-center gap-1 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5" />
          Sample incidents clearly identified for training & testing
        </span>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' ? (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/70 text-slate-400 font-semibold border-b border-slate-800">
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-white"
                    onClick={() => toggleSort('priorityScore')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Priority Score</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-white"
                    onClick={() => toggleSort('roadName')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Road Name & Sector</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Damage Type</th>
                  <th className="py-3 px-4">Passage & Risk</th>
                  <th className="py-3 px-4">Assigned Inspector</th>
                  <th className="py-3 px-4">Inspection Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {processedReports.map((road) => {
                  const priorityBadge = getPriorityBadgeColor(road.priorityLevel);
                  const statusBadge = getStatusBadgeColor(road.status);

                  return (
                    <tr
                      key={road.id}
                      className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                      onClick={() => onSelectRoad(road)}
                    >
                      {/* Priority Score */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border font-mono ${priorityBadge.bg} ${priorityBadge.border} ${priorityBadge.text}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${priorityBadge.dot}`}></span>
                          {road.priorityScore} / 100
                        </span>
                      </td>

                      {/* Road Name & Sector */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white group-hover:text-orange-400 transition-colors">
                          {road.roadName}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{road.sector}</span>
                          <span>•</span>
                          <span className="font-mono text-slate-500">
                            {formatCoordinates(road.coordinates)}
                          </span>
                          {road.isSample && (
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                              SAMPLE
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Damage Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-slate-200 font-medium">{road.damageType}</span>
                        <div className="text-[10px] text-slate-400">
                          Severity: <span className="font-semibold text-slate-300">{road.severity}</span>
                        </div>
                      </td>

                      {/* Passage & Safety */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${
                            road.passageStatus?.includes('Blocked')
                              ? 'bg-red-500/10 text-red-400 border-red-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {road.passageStatus ? road.passageStatus.split('(')[0] : 'Unknown'}
                        </span>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {road.roadImportance}
                        </p>
                      </td>

                      {/* Inspector */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-slate-300 font-medium">{road.inspector}</span>
                        <div className="text-[10px] text-slate-400">
                          Reported {formatTimeAgo(road.reportedAt)}
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          value={road.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => onUpdateStatus(road.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer focus:outline-none ${statusBadge.bg} ${statusBadge.border} ${statusBadge.text}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Under Inspection">Under Inspection</option>
                          <option value="Repair Required">Repair Required</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectRoad(road);
                          }}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-orange-600 text-slate-300 hover:text-white border border-slate-700 hover:border-orange-500 transition-all font-semibold"
                        >
                          Dossier
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {processedReports.map((road) => {
            const priorityBadge = getPriorityBadgeColor(road.priorityLevel);
            const statusBadge = getStatusBadgeColor(road.status);

            return (
              <div
                key={road.id}
                onClick={() => onSelectRoad(road)}
                className="rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 overflow-hidden shadow-xl hover:shadow-2xl transition-all cursor-pointer flex flex-col group"
              >
                {/* Image */}
                <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                  <img
                    src={road.photos && road.photos[0] ? road.photos[0] : '/images/landslide.jpg'}
                    alt={road.roadName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />

                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border font-mono backdrop-blur-md ${priorityBadge.bg} ${priorityBadge.border} ${priorityBadge.text}`}
                    >
                      Score: {road.priorityScore} ({road.priorityLevel})
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-md ${statusBadge.bg} ${statusBadge.border} ${statusBadge.text}`}
                    >
                      {statusBadge.label}
                    </span>
                  </div>

                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs text-slate-300">
                    <span className="font-mono text-[11px] text-slate-300">
                      {formatCoordinates(road.coordinates)}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formatTimeAgo(road.reportedAt)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-white text-base group-hover:text-orange-400 transition-colors line-clamp-1">
                      {road.roadName}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{road.sector}</p>

                    <div className="mt-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Damage:</span>
                        <span className="font-semibold text-slate-200">{road.damageType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Passage:</span>
                        <span className="font-semibold text-amber-400 truncate max-w-[160px]">
                          {road.passageStatus?.split('(')[0]}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Inspector:</span>
                        <span className="text-slate-300 truncate max-w-[160px]">{road.inspector}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                      {road.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono">
                      Est. {road.estimatedRepairHours}h repair
                    </span>
                    <span className="text-xs font-bold text-orange-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      View Details <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
