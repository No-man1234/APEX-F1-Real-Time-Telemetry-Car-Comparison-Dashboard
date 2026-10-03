import React from 'react';
import type { Meeting, Session } from '../types/f1';
import { Activity, RefreshCw, Calendar, MapPin, Zap } from 'lucide-react';

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
    <header className="border-b border-[#232733] bg-[#0d0e14]/95 backdrop-blur-md sticky top-0 z-50">
      {/* Top Bar with Branding & Live Status */}
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#e10600] to-[#990400] text-white shadow-glow-red font-black text-xl italic tracking-tighter">
            F1
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-wider text-white">APEX</span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#e10600]/20 text-[#ff4d4d] border border-[#e10600]/40 font-mono font-bold uppercase tracking-widest">
                TELEMETRY
              </span>
            </div>
            <p className="text-xs text-[#8f96a8] hidden sm:block">
              Real-Time Vehicle Dynamics & Head-to-Head Analysis
            </p>
          </div>
        </div>

        {/* Current Meeting / Circuit Pill */}
        {selectedMeeting && (
          <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#161822] border border-[#2b3042]">
            {selectedMeeting.country_flag && (
              <img
                src={selectedMeeting.country_flag}
                alt={selectedMeeting.country_name}
                className="w-5 h-3.5 object-cover rounded-sm shadow-sm"
              />
            )}
            <div className="text-xs">
              <span className="font-bold text-white mr-1.5">{selectedMeeting.meeting_name}</span>
              <span className="text-[#8f96a8]">({selectedMeeting.circuit_short_name})</span>
            </div>
            {selectedSession && (
              <span className="text-xs px-2 py-0.5 rounded bg-[#e10600]/15 text-[#e10600] font-bold font-mono">
                {selectedSession.session_name}
              </span>
            )}
          </div>
        )}

        {/* Live Controls & Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick Jump to Latest */}
          <button
            onClick={onFetchLatest}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#1a1d29] hover:bg-[#25293a] text-[#c4cadb] border border-[#2e3346] transition-all hover:border-[#404760]"
            title="Auto-detect current or latest Grand Prix"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Latest Session</span>
          </button>

          {/* Auto Live Sync Button */}
          <button
            onClick={onToggleLivePolling}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm ${
              isLivePolling
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/50 shadow-emerald-950/40'
                : 'bg-[#1a1d29] text-[#8f96a8] border border-[#2e3346] hover:text-white'
            }`}
          >
            <span className="relative flex h-2 w-2">
              {isLivePolling && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isLivePolling ? 'bg-emerald-400' : 'bg-gray-500'}`}></span>
            </span>
            <span>{isLivePolling ? 'LIVE SYNC ON' : 'LIVE SYNC OFF'}</span>
          </button>

          {/* Refresh Spinner Indicator */}
          <div className="w-7 h-7 flex items-center justify-center text-[#8f96a8]">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#e10600]' : ''}`} />
          </div>
        </div>
      </div>

      {/* Control Strip: Season, Grand Prix, Session selectors */}
      <div className="bg-[#12141c] border-t border-[#1e222e] px-4 sm:px-6 py-2">
        <div className="max-w-[1700px] mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            {/* Year */}
            <div className="flex items-center gap-1.5 bg-[#191c28] px-2.5 py-1.5 rounded border border-[#2b3042]">
              <Calendar className="w-3.5 h-3.5 text-[#8f96a8]" />
              <select
                value={selectedYear}
                onChange={(e) => onYearChange(Number(e.target.value))}
                className="bg-transparent text-white font-mono font-bold outline-none cursor-pointer"
              >
                <option value={2026} className="bg-[#191c28]">2026 Season</option>
                <option value={2025} className="bg-[#191c28]">2025 Season</option>
                <option value={2024} className="bg-[#191c28]">2024 Season</option>
                <option value={2023} className="bg-[#191c28]">2023 Season</option>
              </select>
            </div>

            {/* Grand Prix / Meeting */}
            <div className="flex items-center gap-1.5 bg-[#191c28] px-2.5 py-1.5 rounded border border-[#2b3042] max-w-[280px]">
              <MapPin className="w-3.5 h-3.5 text-[#e10600]" />
              <select
                value={selectedMeeting?.meeting_key || ''}
                onChange={(e) => {
                  const m = meetings.find((item) => item.meeting_key === Number(e.target.value));
                  if (m) onMeetingChange(m);
                }}
                className="bg-transparent text-white font-semibold outline-none cursor-pointer truncate w-full"
              >
                {meetings.map((m) => (
                  <option key={m.meeting_key} value={m.meeting_key} className="bg-[#191c28]">
                    {m.meeting_name} ({m.circuit_short_name})
                  </option>
                ))}
              </select>
            </div>

            {/* Session */}
            <div className="flex items-center gap-1.5 bg-[#191c28] px-2.5 py-1.5 rounded border border-[#2b3042]">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <select
                value={selectedSession?.session_key || ''}
                onChange={(e) => {
                  const s = sessions.find((item) => item.session_key === Number(e.target.value));
                  if (s) onSessionChange(s);
                }}
                className="bg-transparent text-white font-semibold outline-none cursor-pointer"
              >
                {sessions.map((s) => (
                  <option key={s.session_key} value={s.session_key} className="bg-[#191c28]">
                    {s.session_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 text-xs font-bold">
            {[
              { id: 'telemetry', label: 'Telemetry & Traces' },
              { id: 'cockpit', label: 'Cockpit Gauges' },
              { id: 'timing', label: 'Timing Tower' },
              { id: 'track', label: 'Track Radar GPS' },
              { id: 'radar', label: 'Performance Radar' },
              { id: 'stints', label: 'Stints & Tyres' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#e10600] text-white shadow-glow-red font-bold'
                    : 'text-[#9aa2b5] hover:text-white hover:bg-[#1f2331]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
