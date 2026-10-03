import React, { useEffect, useState } from 'react';
import type { Driver, CarTelemetryComparisonPoint } from '../types/f1';
import { Play, Pause, RotateCcw, ChevronUp, ChevronDown } from 'lucide-react';
import { getAeroModeDetails, formatLapTime } from '../utils/f1Formatters';

interface FloatingReplayBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentPointIndex: number;
  totalPoints: number;
  onScrub: (action: number | ((prev: number) => number)) => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
  driver1: Driver | null;
  driver2: Driver | null;
  currentPoint: CarTelemetryComparisonPoint | null;
  lapDurationSec: number;
  selectedYear: number;
  isComparisonMode: boolean;
  theme?: 'dark' | 'light';
}

export const FloatingReplayBar: React.FC<FloatingReplayBarProps> = ({
  isPlaying,
  onTogglePlay,
  currentPointIndex,
  totalPoints,
  onScrub,
  playbackSpeed,
  onChangeSpeed,
  driver1,
  driver2,
  currentPoint,
  lapDurationSec,
  selectedYear,
  isComparisonMode,
  theme: _theme,
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Keyboard shortcut: Spacebar to toggle Play/Pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or select
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        onTogglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTogglePlay]);

  const safeTotal = Math.max(1, totalPoints);
  const ratio = Math.max(0, Math.min(1, currentPointIndex / (safeTotal - 1)));
  const progressPct = Math.round(ratio * 100);

  // Calculate elapsed lap time based on selected driver's lap time
  const currentElapsedSec = ratio * lapDurationSec;

  const formatColor = (hex?: string) => {
    if (!hex) return '#e10600';
    return hex.startsWith('#') ? hex : `#${hex}`;
  };

  const c1Color = formatColor(driver1?.team_colour || '3671C6');
  const c2Color = formatColor(driver2?.team_colour || 'FF8000');

  const c1Speed = currentPoint?.c1Speed ?? 0;
  const c2Speed = currentPoint?.c2Speed ?? 0;
  const c1Throttle = Math.min(100, Math.max(0, currentPoint?.c1Throttle ?? 0));
  const c1Brake = Math.min(100, Math.max(0, currentPoint?.c1Brake ?? 0));
  const c1Gear = currentPoint?.c1Gear ?? 1;
  const drsActive = currentPoint ? currentPoint.c1Drs > 0 : false;
  const aero = getAeroModeDetails(selectedYear, drsActive);

  // Determine current sector
  const currentSector = ratio < 0.33 ? 'S1' : ratio < 0.68 ? 'S2' : 'S3';

  // Available speed multipliers
  const speedOptions = [1, 2, 4, 8, 16];

  if (isMinimized) {
    return (
      <aside aria-label="Replay Controls" className="fixed bottom-3 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-pitwall-panel/95 backdrop-blur-md border border-pitwall-border shadow-lg text-pitwall-textBright hover:border-[#e10600] transition-all text-xs font-mono font-bold"
          title="Expand Replay Controller"
        >
          <div className="w-2 h-2 rounded-full bg-[#e10600] animate-pulse" />
          <span>REPLAY: {progressPct}% ({currentSector})</span>
          <ChevronUp className="w-4 h-4 text-pitwall-textMuted" />
        </button>
      </aside>
    );
  }

  return (
    <aside aria-label="Replay Controls" className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-[1100px] pointer-events-auto">
      <div className="bg-pitwall-panel/95 backdrop-blur-md border border-pitwall-border/90 rounded-xl shadow-2xl p-2.5 sm:p-3 text-xs font-mono text-pitwall-textBright transition-all">
        {/* Top Mini-Dashboard Strip */}
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-pitwall-border/60">
          {/* Driver 1 Telemetry Capsule */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: c1Color }}
              aria-hidden="true"
            />
            <span className="font-extrabold text-pitwall-textBright text-xs">
              #{driver1?.driver_number || 1} {driver1?.name_acronym || 'C1'}
            </span>
            <span className="text-[11px] text-pitwall-textMuted hidden md:inline">
              {driver1?.team_name}
            </span>

            {/* Instant Speed & Gear */}
            <div className="flex items-center gap-2 bg-pitwall-bg px-2 py-0.5 rounded border border-pitwall-border">
              <span className="font-extrabold text-pitwall-textBright tabular-nums text-xs sm:text-sm">
                {c1Speed} <span className="text-[10px] text-pitwall-textMuted font-normal">KM/H</span>
              </span>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                G{c1Gear > 0 ? c1Gear : 'N'}
              </span>
            </div>

            {/* Mini Throttle & Brake Bars */}
            <div className="hidden sm:flex items-center gap-1.5 bg-pitwall-bg px-2 py-0.5 rounded border border-pitwall-border">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">T:{c1Throttle}%</span>
              <div className="w-8 h-1.5 bg-pitwall-panel border border-pitwall-border/60 rounded-xs overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${c1Throttle}%` }} />
              </div>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold ml-1">B:{c1Brake}%</span>
              <div className="w-8 h-1.5 bg-pitwall-panel border border-pitwall-border/60 rounded-xs overflow-hidden">
                <div className="h-full bg-rose-500" style={{ width: `${c1Brake}%` }} />
              </div>
            </div>

            {/* Active Aero Badge */}
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded border hidden lg:inline ${
                drsActive
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-500/40'
                  : 'bg-pitwall-bg text-pitwall-textMuted border-pitwall-border'
              }`}
            >
              {aero.badgeLabel}
            </span>
          </div>

          {/* Car 2 comparison delta if enabled */}
          {isComparisonMode && driver2 && (
            <div className="hidden lg:flex items-center gap-2 bg-pitwall-bg px-2 py-0.5 rounded border border-pitwall-border">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c2Color }} />
              <span className="font-bold text-xs" style={{ color: c2Color }}>
                {driver2.name_acronym}
              </span>
              <span className="tabular-nums text-xs">{c2Speed} km/h</span>
              {currentPoint && (
                <span
                  className={`text-[11px] font-bold tabular-nums ${
                    currentPoint.timeDelta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  Δ {currentPoint.timeDelta >= 0 ? `+${currentPoint.timeDelta.toFixed(3)}s` : `${currentPoint.timeDelta.toFixed(3)}s`}
                </span>
              )}
            </div>
          )}

          {/* Elapsed Lap Time & Minimizer */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 bg-pitwall-bg px-2.5 py-0.5 rounded border border-pitwall-border">
              <span className="text-[10px] text-pitwall-textMuted uppercase">{currentSector}</span>
              <span className="font-extrabold text-pitwall-textBright tabular-nums text-xs sm:text-sm">
                {formatLapTime(currentElapsedSec)}
              </span>
              <span className="text-[10px] text-pitwall-textMuted">/ {formatLapTime(lapDurationSec)}</span>
            </div>

            <button
              onClick={() => setIsMinimized(true)}
              aria-label="Minimize Replay Dock"
              className="p-1 rounded text-pitwall-textMuted hover:text-pitwall-textBright hover:bg-pitwall-bg transition-colors"
              title="Minimize Replay Dock"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Controls & Scrubber Strip */}
        <div className="flex items-center gap-2 sm:gap-3 pt-2">
          {/* Play / Pause Primary Button */}
          <button
            onClick={onTogglePlay}
            aria-label={isPlaying ? 'Pause telemetry replay (Space)' : 'Play telemetry replay (Space)'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold text-xs transition-all shadow-sm active:scale-95 shrink-0 ${
              isPlaying
                ? 'bg-amber-500 text-black hover:bg-amber-400'
                : 'bg-[#e10600] text-white hover:bg-[#c30500]'
            }`}
            title={isPlaying ? 'Pause Replay (Space)' : 'Play Lap Replay (Space)'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" aria-hidden="true" />
                <span className="hidden sm:inline">PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5" aria-hidden="true" />
                <span className="hidden sm:inline">PLAY</span>
              </>
            )}
          </button>

          {/* Rewind to Start Button */}
          <button
            onClick={() => onScrub(0)}
            aria-label="Rewind telemetry to start of lap"
            className="p-1.5 rounded bg-pitwall-bg hover:bg-pitwall-subpanel text-pitwall-textSecondary hover:text-pitwall-textBright border border-pitwall-border transition-colors shrink-0"
            title="Rewind to Lap Start"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          </button>

          {/* Interactive Lap Timeline Scrubber */}
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <span className="text-[10px] text-pitwall-textMuted hidden sm:inline tabular-nums">
              0%
            </span>
            <input
              type="range"
              min={0}
              max={safeTotal - 1}
              step="any"
              value={currentPointIndex}
              onChange={(e) => onScrub(Number(e.target.value))}
              aria-label="Scrub telemetry lap timeline"
              className="w-full h-2 bg-pitwall-bg rounded-lg appearance-none cursor-pointer accent-[#e10600]"
            />
            <span className="text-[10px] text-pitwall-textMuted tabular-nums font-bold shrink-0">
              {progressPct}%
            </span>
          </div>

          {/* Speed Multipliers */}
          <div className="flex items-center gap-1 shrink-0 bg-pitwall-bg p-0.5 rounded border border-pitwall-border text-[11px]">
            <span className="text-[10px] text-pitwall-textMuted px-1 hidden md:inline">SPEED:</span>
            {speedOptions.map((spd) => (
              <button
                key={spd}
                onClick={() => onChangeSpeed(spd)}
                className={`px-1.5 py-0.5 rounded font-bold transition-colors ${
                  playbackSpeed === spd
                    ? 'bg-[#e10600] text-white'
                    : 'text-pitwall-textSecondary hover:text-pitwall-textBright hover:bg-pitwall-subpanel'
                }`}
                title={`Playback speed ${spd}x (${(lapDurationSec / spd).toFixed(1)}s total)`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
