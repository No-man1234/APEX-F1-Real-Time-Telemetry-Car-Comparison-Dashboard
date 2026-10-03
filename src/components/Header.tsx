import React from 'react';
import type { Meeting, Session } from '../types/f1';
import { RefreshCw, Zap } from 'lucide-react';

interface HeaderProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  meetings: Meeting[];
  selectedMeeting: Meeting | null;
  onMeetingChange: (meeting: Meeting) => void;
  sessions: Session[];
  selectedSession: Session | null;
  onSessionChange: (session: Session) => void;
  isLivePolling: boolean;
  onToggleLivePolling: () => void;
  onFetchLatest: () => void;
  isLoading: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedYear,
  onYearChange,
  meetings,
  selectedMeeting,
  onMeetingChange,
  sessions,
  selectedSession,
  onSessionChange,
  isLivePolling,
  onToggleLivePolling,
  onFetchLatest,
  isLoading,
  activeTab,
  onTabChange
}) => {
  return (
    <header className="border-b border-pitwall-border bg-pitwall-panel/95 backdrop-blur sticky top-0 z-50">
      {/* Top Bar: Workbench Branding & Live Feed Status */}
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Purpose */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-6 bg-[#e10600] inline-block rounded-xs" aria-hidden="true" />
            <span className="font-extrabold text-lg tracking-wider text-pitwall-textBright uppercase font-mono">
              APEX
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-pitwall-subpanel text-pitwall-textSecondary border border-pitwall-border font-mono font-medium tracking-wider">
              TELEMETRY WORKBENCH
            </span>
          </div>

          <span className="hidden md:inline-block text-xs text-pitwall-textMuted border-l border-pitwall-border pl-3">
            OpenF1 Vehicle Dynamics & Sector Analysis
          </span>
        </div>

        {/* Live Controls & System State */}
        <div className="flex items-center gap-2 text-xs font-mono">
          {/* Live Feed Status Pill */}
          <button
            onClick={onToggleLivePolling}
            aria-label={`Toggle live telemetry sync. Currently ${isLivePolling ? 'active' : 'paused'}`}
            className={`inline-flex items-center gap-2 px-3 py-1 rounded border transition-colors ${
              isLivePolling
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40 hover:bg-emerald-900/40'
                : 'bg-pitwall-subpanel text-pitwall-textMuted border-pitwall-border hover:text-pitwall-textBright'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isLivePolling ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'
              }`}
              aria-hidden="true"
            />
            <span className="font-bold">{isLivePolling ? 'FEED: STREAMING' : 'FEED: PAUSED'}</span>
          </button>

          {/* Quick Jump to Latest Session */}
          <button
            onClick={onFetchLatest}
            disabled={isLoading}
            aria-label="Jump to latest available Grand Prix session"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-pitwall-subpanel hover:bg-pitwall-card text-pitwall-textSecondary hover:text-white border border-pitwall-border transition-colors disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
            <span>Latest GP</span>
          </button>

          {/* Activity / Sync Indicator */}
          <div
            className="w-7 h-7 rounded bg-pitwall-subpanel border border-pitwall-border flex items-center justify-center text-pitwall-textMuted"
            title={isLoading ? 'Fetching data...' : 'Feed idle'}
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#e10600]' : ''}`}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {/* Control Strip: Season, Meeting, Session Pickers & Primary Navigation */}
      <div className="bg-pitwall-bg border-t border-pitwall-border px-4 sm:px-6 py-2">
        <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Form Selectors */}
          <nav aria-label="Grand Prix Selection" className="flex flex-wrap items-center gap-2 text-xs font-mono">
            {/* Season Selector */}
            <div className="flex items-center bg-pitwall-panel px-2.5 py-1.5 rounded border border-pitwall-border">
              <label htmlFor="season-select" className="text-pitwall-textMuted mr-2 text-[11px]">SEASON</label>
              <select
                id="season-select"
                value={selectedYear}
                onChange={(e) => onYearChange(Number(e.target.value))}
                className="bg-transparent text-pitwall-textBright font-bold outline-none cursor-pointer"
              >
                <option value={2026} className="bg-pitwall-panel text-white">2026</option>
                <option value={2025} className="bg-pitwall-panel text-white">2025</option>
                <option value={2024} className="bg-pitwall-panel text-white">2024</option>
                <option value={2023} className="bg-pitwall-panel text-white">2023</option>
              </select>
            </div>

            {/* Grand Prix Meeting Selector */}
            <div className="flex items-center bg-pitwall-panel px-2.5 py-1.5 rounded border border-pitwall-border max-w-[280px] sm:max-w-[340px]">
              <label htmlFor="meeting-select" className="text-pitwall-textMuted mr-2 text-[11px]">GP</label>
              {selectedMeeting?.country_flag && (
                <img
                  src={selectedMeeting.country_flag}
                  alt=""
                  className="w-4 h-3 object-cover rounded-xs mr-2 shrink-0"
                  aria-hidden="true"
                />
              )}
              <select
                id="meeting-select"
                value={selectedMeeting?.meeting_key || ''}
                onChange={(e) => {
                  const m = meetings.find((item) => item.meeting_key === Number(e.target.value));
                  if (m) onMeetingChange(m);
                }}
                className="bg-transparent text-pitwall-textBright font-semibold outline-none cursor-pointer truncate w-full"
              >
                {meetings.map((m) => (
                  <option key={m.meeting_key} value={m.meeting_key} className="bg-pitwall-panel text-white">
                    {m.meeting_name} ({m.circuit_short_name})
                  </option>
                ))}
              </select>
            </div>

            {/* Session Selector */}
            <div className="flex items-center bg-pitwall-panel px-2.5 py-1.5 rounded border border-pitwall-border">
              <label htmlFor="session-select" className="text-pitwall-textMuted mr-2 text-[11px]">SESSION</label>
              <select
                id="session-select"
                value={selectedSession?.session_key || ''}
                onChange={(e) => {
                  const s = sessions.find((item) => item.session_key === Number(e.target.value));
                  if (s) onSessionChange(s);
                }}
                className="bg-transparent text-pitwall-textBright font-bold outline-none cursor-pointer"
              >
                {sessions.map((s) => (
                  <option key={s.session_key} value={s.session_key} className="bg-pitwall-panel text-white">
                    {s.session_name}
                  </option>
                ))}
              </select>
            </div>
          </nav>

          {/* Navigation Tabs (Functional, High-Density Workbench Tabs) */}
          <nav aria-label="Workbench Views" className="flex items-center gap-1 overflow-x-auto py-0.5 text-xs font-mono">
            {[
              { id: 'telemetry', label: 'Telemetry Traces' },
              { id: 'cockpit', label: 'Cockpit Gauges' },
              { id: 'timing', label: 'Timing & Sectors' },
              { id: 'track', label: 'Circuit GPS' },
              { id: 'radar', label: 'Vehicle Dynamics' },
              { id: 'stints', label: 'Tyre Strategy' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  aria-pressed={isActive}
                  className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-colors border ${
                    isActive
                      ? 'bg-pitwall-card text-white border-pitwall-borderLight font-bold shadow-xs'
                      : 'bg-transparent text-pitwall-textSecondary border-transparent hover:text-white hover:bg-pitwall-panel'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
