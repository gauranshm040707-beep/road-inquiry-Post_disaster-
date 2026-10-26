import React, { useState } from 'react';
import {
  X,
  MapPin,
  ExternalLink,
  Clock,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Share2,
  Printer,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  UserCheck,
  Send,
  Truck,
  HardHat,
  Compass,
  FileCheck2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getPriorityBadgeColor, getStatusBadgeColor } from '../utils/priorityEngine';
import { formatDate, formatTimeAgo, formatCoordinates } from '../utils/formatters';

export default function RoadDetailDrawer({
  road,
  isOpen,
  onClose,
  onUpdateStatus,
  onAddNote,
  onAssignInspector
}) {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [newNote, setNewNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [assignedInspector, setAssignedInspector] = useState(road?.inspector || 'Unassigned');

  if (!isOpen || !road) return null;

  const priorityBadge = getPriorityBadgeColor(road.priorityLevel);
  const statusBadge = getStatusBadgeColor(road.status);

  const handleStatusChange = (newStatus) => {
    onUpdateStatus(road.id, newStatus, 'Incident Command', `Status updated to ${newStatus}`);
    if (newStatus === 'Completed') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleNoteSubmit = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onAddNote(road.id, newNote);
    setNewNote('');
  };

  const handlePrint = () => {
    window.print();
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${road.coordinates.lat},${road.coordinates.lng}`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8 sm:pl-16">
        <div className="w-screen max-w-2xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/80 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border font-mono ${priorityBadge.bg} ${priorityBadge.border} ${priorityBadge.text}`}
                >
                  <span className={`w-2 h-2 rounded-full ${priorityBadge.dot}`}></span>
                  Priority Score: {road.priorityScore} / 100 ({road.priorityLevel})
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge.bg} ${statusBadge.border} ${statusBadge.text}`}
                >
                  {statusBadge.label}
                </span>
                {road.isSample && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    SAMPLE INCIDENT
                  </span>
                )}
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">
                {road.roadName}
              </h2>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{road.sector}</span>
                <span>•</span>
                <span className="font-mono text-slate-400">{road.id}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                title="Print Inspection Clearance Dossier"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* Photo Gallery & Preview */}
            {road.photos && road.photos.length > 0 && (
              <div className="space-y-2">
                <div className="relative h-60 sm:h-72 w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-lg">
                  <img
                    src={road.photos[activePhotoIdx] || road.photos[0]}
                    alt={road.roadName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-[11px] text-white font-mono border border-slate-700">
                    Photo {activePhotoIdx + 1} of {road.photos.length}
                  </div>
                </div>

                {road.photos.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {road.photos.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActivePhotoIdx(idx)}
                        className={`relative h-16 w-24 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                          activePhotoIdx === idx ? 'border-orange-500 scale-95' : 'border-slate-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick Status Action Switcher */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-orange-400" />
                  Update Triage & Inspection State
                </span>
                <span className="text-slate-400">Current: {road.status}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'Pending', label: 'Pending', color: 'hover:border-slate-500 active:bg-slate-700' },
                  { id: 'Under Inspection', label: 'Inspecting', color: 'hover:border-sky-500 active:bg-sky-700' },
                  { id: 'Repair Required', label: 'Repairs Queued', color: 'hover:border-orange-500 active:bg-orange-700' },
                  { id: 'Completed', label: 'Road Cleared', color: 'hover:border-emerald-500 active:bg-emerald-700' }
                ].map(st => {
                  const isCurrent = road.status === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => handleStatusChange(st.id)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border ${
                        isCurrent
                          ? 'bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-950'
                          : `bg-slate-900 text-slate-300 border-slate-800 ${st.color}`
                      }`}
                    >
                      {st.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Automated Priority Reasoning Dossier */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-red-950/30 to-slate-950 border border-red-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Automated Priority Reasoning Engine
                  </h4>
                </div>
                <span className="text-xs font-mono font-bold text-red-400">
                  {road.priorityScore} / 100 POINTS
                </span>
              </div>

              <div className="space-y-2">
                {road.priorityReasons?.map((reason, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 flex items-start gap-2">
                    <span className="text-red-400 font-bold">•</span>
                    <span className="leading-relaxed">{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Specifications Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Damage & Road Conditions */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                  Structural & Road Conditions
                </h4>
                <div className="text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Damage Classification:</span>
                    <span className="font-semibold text-slate-200">{road.damageType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Damage Severity:</span>
                    <span className="font-semibold text-red-400">{road.severity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Passage Status:</span>
                    <span className="font-semibold text-amber-400">{road.passageStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Road Lifeline:</span>
                    <span className="font-semibold text-slate-200">{road.roadImportance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Public Safety Risk:</span>
                    <span className="font-semibold text-slate-200">{road.publicSafetyRisk}</span>
                  </div>
                </div>
              </div>

              {/* Geographic & Dispatch Details */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-sky-400" />
                  GIS & Dispatch Info
                </h4>
                <div className="text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Coordinates:</span>
                    <span className="font-mono text-slate-200">{formatCoordinates(road.coordinates)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sector:</span>
                    <span className="font-medium text-slate-200">{road.sector}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned Inspector:</span>
                    <span className="font-semibold text-sky-400">{road.inspector}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Reported At:</span>
                    <span className="text-slate-300">{formatDate(road.reportedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Est. Repair Time:</span>
                    <span className="font-mono text-slate-200">{road.estimatedRepairHours} Hours</span>
                  </div>
                </div>

                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-700 flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Open in External GIS Navigation</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>

            {/* Detailed Description */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Damage Description & Observations
              </h4>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {road.description}
              </p>
            </div>

            {/* Emergency Services Required */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-950/30 to-slate-950 border border-orange-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Disaster Response Services Required
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold">
                  {road.requiredServices?.length || 2} TEAMS TAGGED
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(road.requiredServices || ['Heavy Excavators (BRO/NHAI)', '108 Trauma Ambulances']).map((svc, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-slate-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                      {svc}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      REQUISITIONED
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipment Requisition Required */}
            {road.requiredEquipment && road.requiredEquipment.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-amber-400" />
                  Machinery & Heavy Equipment Requisitions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {road.requiredEquipment.map((eq, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5"
                    >
                      <HardHat className="w-3 h-3 text-orange-400" />
                      {eq}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Inspection History & Timeline */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  Inspection History & Field Activity Log
                </h4>
                <span className="text-[11px] text-slate-500 font-mono">
                  {road.inspectionHistory?.length || 0} events
                </span>
              </div>

              {/* Add Field Note Input */}
              <form onSubmit={handleNoteSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add inspector field observation or status note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-orange-950 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Log Note</span>
                </button>
              </form>

              {/* Timeline Items */}
              <div className="space-y-3 pl-2 border-l-2 border-slate-800 mt-4">
                {road.inspectionHistory?.map((log) => (
                  <div key={log.id} className="relative pl-4 space-y-1">
                    <span className="absolute -left-[1.3rem] top-1 h-2.5 w-2.5 rounded-full bg-orange-500 border-2 border-slate-900"></span>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{log.action}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {formatTimeAgo(log.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{log.note}</p>
                    <p className="text-[10px] text-slate-400 font-medium">Logged by: {log.user}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold transition-colors"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span>Print Official Clearance Certificate</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
            >
              Close Dossier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
