import React from 'react';
import {
  X,
  Bell,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Flame,
  Trash2
} from 'lucide-react';
import { formatTimeAgo } from '../utils/formatters';

export default function NotificationDrawer({
  isOpen,
  onClose,
  notifications,
  onSelectNotification,
  onClearAll
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Emergency Notifications</h3>
                <p className="text-xs text-slate-400">Critical road events & inspection alerts</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                  title="Clear all notifications"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-16 px-4">
                <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-300">No active alerts</p>
                <p className="text-xs text-slate-400 mt-1">
                  All emergency notifications will stream here in real time.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isCritical = notif.priority === 'High';
                return (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isCritical
                        ? 'bg-red-950/30 border-red-900/50 hover:border-red-500/60'
                        : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                    }`}
                    onClick={() => {
                      onSelectNotification(notif);
                      onClose();
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        {isCritical ? (
                          <span className="flex h-2.5 w-2.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                          </span>
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-sky-400"></span>
                        )}
                        <span
                          className={`text-xs font-bold uppercase tracking-wider ${
                            isCritical ? 'text-red-400' : 'text-sky-400'
                          }`}
                        >
                          {notif.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(notif.timestamp)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-medium leading-relaxed mb-2.5">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                      <span className="text-slate-400 font-mono">{notif.roadName}</span>
                      <span className="text-orange-400 flex items-center gap-1 font-semibold group-hover:underline">
                        View Dossier <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between text-xs text-slate-400">
            <span>Audio & Visual alerts enabled</span>
            <span className="font-mono text-emerald-400">FEED: ONLINE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
