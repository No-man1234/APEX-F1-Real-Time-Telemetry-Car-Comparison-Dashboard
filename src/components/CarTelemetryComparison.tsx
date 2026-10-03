import React, { useRef, useEffect, useState, useMemo } from 'react';
import type { Driver, CarTelemetryComparisonPoint, CarAnalysisStats } from '../types/f1';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { getAeroModeDetails } from '../utils/f1Formatters';

interface CarTelemetryComparisonProps {
  driver1: Driver | null;
  driver2: Driver | null;
  data: CarTelemetryComparisonPoint[];
  currentPointIndex: number;
  onScrub: (action: number | ((prev: number) => number)) => void;
  stats1: CarAnalysisStats;
  stats2: CarAnalysisStats;
  selectedYear: number;
  isComparisonMode: boolean;
  theme: 'dark' | 'light';
}

type SectorFilter = 'all' | 's1' | 's2' | 's3';

export const CarTelemetryComparison: React.FC<CarTelemetryComparisonProps> = ({
  driver1,
  driver2,
  data,
  currentPointIndex,
  onScrub,
  stats1,
  stats2,
  selectedYear,
  isComparisonMode,
  theme,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(2); // Default 2x (~6 seconds full lap)
  const [activeSector, setActiveSector] = useState<SectorFilter>('all');
  const [useMph, setUseMph] = useState<boolean>(false);

  const formatColor = (hex?: string) => {
    if (!hex) return '#e10600';
    return hex.startsWith('#') ? hex : `#${hex}`;
  };

  const c1Color = formatColor(driver1?.team_colour || '3671C6');
  const c2Color = formatColor(driver2?.team_colour || 'FF8000');

  // Sector boundaries in data indices
  const sectorBounds = useMemo(() => {
    const total = data.length || 120;
    return {
      s1: [0, Math.floor(total * 0.33)],
      s2: [Math.floor(total * 0.33), Math.floor(total * 0.68)],
      s3: [Math.floor(total * 0.68), total - 1],
    };
  }, [data.length]);

  const visibleData = useMemo(() => {
    if (!data.length) return [];
    if (activeSector === 'all') return data;
    const [start, end] = sectorBounds[activeSector];
    return data.slice(start, end + 1);
  }, [data, activeSector, sectorBounds]);

  // Calibrated playback pacing (At 1x: 100ms per point -> 120 points = 12s; At 2x: 50ms -> 6s; At 3x: ~4s)
  useEffect(() => {
    if (!isPlaying || !data.length) return;

    // Interval interval in milliseconds based on speed multiplier
    const stepIntervalMs = Math.round(100 / playbackSpeed);

    const interval = setInterval(() => {
      onScrub((prev: number) => {
        const next = prev + 1;
        if (next >= data.length) {
          setIsPlaying(false);
          return 0;
        }
        return next;
      });
    }, stepIntervalMs);

    return () => clearInterval(interval);
  }, [isPlaying, data.length, playbackSpeed, onScrub]);

  // High-density Canvas drawing with theme awareness and optional Car 2
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !visibleData.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    const isDark = theme === 'dark';
    const canvasBg = isDark ? '#0b0c12' : '#ffffff';
    const gridColor = isDark ? '#1a1e2b' : '#e2e7f2';
    const textColor = isDark ? '#6f778c' : '#525b73';
    const titleColor = isDark ? '#23293a' : '#c8cfdf';

    // Clear Background
    ctx.fillStyle = canvasBg;
    ctx.fillRect(0, 0, width, height);

    const padL = 56;
    const padR = 24;
    const padT = 16;
    const padB = 28;
    const plotW = width - padL - padR;

    // In Solo mode, 2 channels (Speed 60%, Throttle/Brake 40%); in Comparison mode, 3 channels (Speed 50%, Delta 25%, Throttle/Brake 25%)
    const ch1H = isComparisonMode ? Math.floor((height - padT - padB) * 0.50) : Math.floor((height - padT - padB) * 0.60);
    const ch2H = isComparisonMode ? Math.floor((height - padT - padB) * 0.22) : 0;
    const ch3H = isComparisonMode ? Math.floor((height - padT - padB) * 0.22) : Math.floor((height - padT - padB) * 0.35);
    const gap = isComparisonMode ? Math.floor((height - padT - padB - ch1H - ch2H - ch3H) / 2) : Math.floor(height - padT - padB - ch1H - ch3H);

    const yCh1 = padT;
    const yCh2 = isComparisonMode ? yCh1 + ch1H + gap : 0;
    const yCh3 = isComparisonMode ? yCh2 + ch2H + gap : yCh1 + ch1H + gap;

    // X-Axis Grid & Distance Markers
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    const xTicks = 8;
    for (let i = 0; i <= xTicks; i++) {
      const x = padL + (i / xTicks) * plotW;
      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, height - padB);
      ctx.stroke();

      const sampleIdx = Math.floor((i / xTicks) * (visibleData.length - 1));
      const dist = visibleData[sampleIdx]?.distance || 0;
      ctx.fillStyle = textColor;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${(dist / 1000).toFixed(2)}km`, x, height - padB + 14);
    }

    // ==========================================
    // CHANNEL 1: SPEED (km/h or mph)
    // ==========================================
    ctx.fillStyle = titleColor;
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(useMph ? 'SPEED (MPH)' : 'SPEED (KM/H)', padL + 6, yCh1 + 14);

    const speedMin = useMph ? 40 : 60;
    const speedMax = useMph ? 225 : 360;
    const speedTicks = 4;
    for (let i = 0; i <= speedTicks; i++) {
      const y = yCh1 + (i / speedTicks) * ch1H;
      ctx.strokeStyle = gridColor;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(width - padR, y);
      ctx.stroke();

      const val = Math.round(speedMax - (i / speedTicks) * (speedMax - speedMin));
      ctx.fillStyle = textColor;
      ctx.textAlign = 'right';
      ctx.fillText(`${val}`, padL - 8, y + 3);
    }

    // Car 1 Speed Line
    ctx.beginPath();
    ctx.strokeStyle = c1Color;
    ctx.lineWidth = 2.2;
    visibleData.forEach((pt, idx) => {
      const x = padL + (idx / (visibleData.length - 1)) * plotW;
      const spd = useMph ? pt.c1Speed * 0.621371 : pt.c1Speed;
      const normY = (spd - speedMin) / (speedMax - speedMin);
      const y = yCh1 + (1 - Math.max(0, Math.min(1, normY))) * ch1H;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Car 2 Speed Line (Only in comparison mode)
    if (isComparisonMode) {
      ctx.beginPath();
      ctx.strokeStyle = c2Color;
      ctx.lineWidth = 2.2;
      visibleData.forEach((pt, idx) => {
        const x = padL + (idx / (visibleData.length - 1)) * plotW;
        const spd = useMph ? pt.c2Speed * 0.621371 : pt.c2Speed;
        const normY = (spd - speedMin) / (speedMax - speedMin);
        const y = yCh1 + (1 - Math.max(0, Math.min(1, normY))) * ch1H;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // ==========================================
    // CHANNEL 2: TIME DELTA (Only in comparison mode)
    // ==========================================
    if (isComparisonMode) {
      ctx.fillStyle = titleColor;
      ctx.fillText('DELTA TIME (Δt SECONDS)', padL + 6, yCh2 + 13);

      const zeroY = yCh2 + ch2H / 2;
      ctx.strokeStyle = isDark ? '#2b3246' : '#cbd3e3';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padL, zeroY);
      ctx.lineTo(width - padR, zeroY);
      ctx.stroke();

      ctx.fillStyle = textColor;
      ctx.textAlign = 'right';
      ctx.fillText('0.0s', padL - 8, zeroY + 3);
      ctx.fillText('+0.5s', padL - 8, yCh2 + 10);
      ctx.fillText('-0.5s', padL - 8, yCh2 + ch2H);

      // Delta Line
      ctx.beginPath();
      ctx.strokeStyle = isDark ? '#ffffff' : '#1e2433';
      ctx.lineWidth = 1.8;
      visibleData.forEach((pt, idx) => {
        const x = padL + (idx / (visibleData.length - 1)) * plotW;
        const clampedDelta = Math.max(-0.5, Math.min(0.5, pt.timeDelta));
        const normY = (clampedDelta - -0.5) / 1.0;
        const y = yCh2 + (1 - normY) * ch2H;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // ==========================================
    // CHANNEL 3: THROTTLE (%) & BRAKE (%)
    // ==========================================
    ctx.fillStyle = titleColor;
    ctx.fillText('THROTTLE & BRAKE INPUTS (%)', padL + 6, yCh3 + 13);

    ctx.fillStyle = textColor;
    ctx.textAlign = 'right';
    ctx.fillText('100%', padL - 8, yCh3 + 10);
    ctx.fillText('0%', padL - 8, yCh3 + ch3H);

    // Throttle Line Car 1 (Green)
    ctx.beginPath();
    ctx.strokeStyle = '#00d26a';
    ctx.lineWidth = 1.8;
    visibleData.forEach((pt, idx) => {
      const x = padL + (idx / (visibleData.length - 1)) * plotW;
      const y = yCh3 + (1 - pt.c1Throttle / 100) * ch3H;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Brake Line Car 1 (Red)
    ctx.beginPath();
    ctx.strokeStyle = '#e10600';
    ctx.lineWidth = 2;
    visibleData.forEach((pt, idx) => {
      const x = padL + (idx / (visibleData.length - 1)) * plotW;
      const y = yCh3 + (1 - pt.c1Brake / 100) * ch3H;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // ==========================================
    // SYNCHRONIZED VERTICAL CROSSHAIR CURSOR
    // ==========================================
    const targetIdx = Math.min(data.length - 1, Math.max(0, currentPointIndex));
    let visibleCursorRatio = -1;
    if (activeSector === 'all') {
      visibleCursorRatio = targetIdx / (data.length - 1 || 1);
    } else {
      const [start, end] = sectorBounds[activeSector];
      if (targetIdx >= start && targetIdx <= end) {
        visibleCursorRatio = (targetIdx - start) / (end - start || 1);
      }
    }

    if (visibleCursorRatio >= 0 && visibleCursorRatio <= 1) {
      const cursorX = padL + visibleCursorRatio * plotW;

      ctx.strokeStyle = isDark ? '#ffffff' : '#0c101c';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(cursorX, padT);
      ctx.lineTo(cursorX, height - padB);
      ctx.stroke();
      ctx.setLineDash([]);

      const pt = data[targetIdx];
      if (pt) {
        const spd1 = useMph ? pt.c1Speed * 0.621371 : pt.c1Speed;
        const yDot1 = yCh1 + (1 - (spd1 - speedMin) / (speedMax - speedMin)) * ch1H;

        ctx.fillStyle = c1Color;
        ctx.beginPath();
        ctx.arc(cursorX, yDot1, 4.5, 0, Math.PI * 2);
        ctx.fill();

        if (isComparisonMode) {
          const spd2 = useMph ? pt.c2Speed * 0.621371 : pt.c2Speed;
          const yDot2 = yCh1 + (1 - (spd2 - speedMin) / (speedMax - speedMin)) * ch1H;

          ctx.fillStyle = c2Color;
          ctx.beginPath();
          ctx.arc(cursorX, yDot2, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }, [visibleData, currentPointIndex, c1Color, c2Color, activeSector, sectorBounds, data, useMph, isComparisonMode, theme]);

  // Scrub click handler
  const handleCanvasInteraction = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const padL = 56;
    const padR = 24;
    const plotW = rect.width - padL - padR;

    const ratio = Math.max(0, Math.min(1, (x - padL) / plotW));

    if (activeSector === 'all') {
      const newIdx = Math.round(ratio * (data.length - 1));
      onScrub(newIdx);
    } else {
      const [start, end] = sectorBounds[activeSector];
      const newIdx = Math.round(start + ratio * (end - start));
      onScrub(newIdx);
    }
  };

  const curPoint = data[currentPointIndex] || data[0];
  const aeroDetails1 = getAeroModeDetails(selectedYear, (curPoint?.c1Drs || 0) > 0);
  const aeroDetails2 = getAeroModeDetails(selectedYear, (curPoint?.c2Drs || 0) > 0);

  return (
    <section aria-label="High Frequency Telemetry Analysis" className="bg-pitwall-panel border border-pitwall-border rounded-lg p-4 mb-5 shadow-xs">
      {/* Workbench Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-pitwall-border">
        <div>
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-pitwall-textBright">
            {isComparisonMode ? 'Synchronized Telemetry Overlay' : 'Vehicle Telemetry Trace'}
          </h2>
          <p className="text-xs text-pitwall-textMuted font-mono">
            {isComparisonMode
              ? `Direct Speed, Delta Time, Throttle & ${selectedYear >= 2026 ? 'Active Aero (X-Mode)' : 'DRS'} Overlay`
              : `High-Frequency Speed, Throttle, Brake & ${selectedYear >= 2026 ? 'Aero Mode' : 'DRS'} Telemetry`}
          </p>
        </div>

        {/* Viewport Zoom & Replay Controls */}
        <div className="flex items-center gap-2 text-xs font-mono">
          {/* Sector Zoom */}
          <div className="inline-flex rounded bg-pitwall-subpanel p-0.5 border border-pitwall-border">
            {(['all', 's1', 's2', 's3'] as const).map((sec) => (
              <button
                key={sec}
                onClick={() => setActiveSector(sec)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase transition-colors ${
                  activeSector === sec
                    ? 'bg-pitwall-card text-pitwall-textBright'
                    : 'text-pitwall-textMuted hover:text-pitwall-textBright'
                }`}
              >
                {sec === 'all' ? 'Full Lap' : sec.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Unit Toggle */}
          <button
            onClick={() => setUseMph(!useMph)}
            aria-label="Toggle speed unit"
            className="px-2 py-1 rounded bg-pitwall-subpanel hover:bg-pitwall-card text-pitwall-textSecondary border border-pitwall-border text-[11px] font-bold"
          >
            {useMph ? 'MPH' : 'KM/H'}
          </button>

          {/* Replay Controls */}
          <div className="inline-flex items-center gap-1 bg-pitwall-subpanel p-0.5 rounded border border-pitwall-border">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? 'Pause replay' : 'Play telemetry replay'}
              className="p-1 rounded bg-[#e10600] text-white hover:bg-[#b00400] transition-colors"
              title={isPlaying ? 'Pause' : 'Play Lap Replay'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => onScrub(0)}
              aria-label="Reset cursor to lap start"
              className="p-1 rounded text-pitwall-textMuted hover:text-pitwall-textBright transition-colors"
              title="Reset to 0.00km"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Calibrated Playback Speeds */}
          <div className="flex items-center gap-1 bg-pitwall-subpanel px-2 py-1 rounded border border-pitwall-border text-[11px]">
            <span className="text-pitwall-textMuted">Pace:</span>
            {[
              { spd: 1, label: '1x (12s)' },
              { spd: 2, label: '2x (6s)' },
              { spd: 3, label: '3x (4s)' },
            ].map(({ spd, label }) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`font-bold px-1 transition-colors ${
                  playbackSpeed === spd ? 'text-amber-400 font-extrabold' : 'text-pitwall-textMuted hover:text-pitwall-textBright'
                }`}
                title={`Playback pace: ${label}`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Synchronized Telemetry Cursor HUD */}
      <div className="bg-pitwall-subpanel border border-pitwall-border rounded-md p-2.5 mb-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs font-mono">
        <div>
          <span className="text-[10px] text-pitwall-textMuted block">TRACK POSITION</span>
          <span className="font-bold text-pitwall-textBright tabular-nums">
            {curPoint?.distance || 0} m ({curPoint?.percentage || 0}%)
          </span>
        </div>

        <div>
          <span className="text-[10px] text-pitwall-textMuted block">
            {isComparisonMode ? 'CAR 1 VELOCITY' : 'VELOCITY'}
          </span>
          <span className="font-bold tabular-nums" style={{ color: c1Color }}>
            {useMph ? Math.round((curPoint?.c1Speed || 0) * 0.621371) : curPoint?.c1Speed || 0} {useMph ? 'mph' : 'km/h'}
          </span>
        </div>

        {isComparisonMode && (
          <div>
            <span className="text-[10px] text-pitwall-textMuted block">CAR 2 VELOCITY</span>
            <span className="font-bold tabular-nums" style={{ color: c2Color }}>
              {useMph ? Math.round((curPoint?.c2Speed || 0) * 0.621371) : curPoint?.c2Speed || 0} {useMph ? 'mph' : 'km/h'}
            </span>
          </div>
        )}

        {isComparisonMode && (
          <div>
            <span className="text-[10px] text-pitwall-textMuted block">VELOCITY DELTA</span>
            <span className={`font-bold tabular-nums ${(curPoint?.speedDelta || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {(curPoint?.speedDelta || 0) >= 0 ? `+${curPoint?.speedDelta}` : curPoint?.speedDelta} km/h
            </span>
          </div>
        )}

        {isComparisonMode && (
          <div>
            <span className="text-[10px] text-pitwall-textMuted block">TIME DELTA (Δt)</span>
            <span className={`font-bold tabular-nums ${(curPoint?.timeDelta || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {(curPoint?.timeDelta || 0) >= 0 ? `+${curPoint?.timeDelta.toFixed(3)}s` : `${curPoint?.timeDelta.toFixed(3)}s`}
            </span>
          </div>
        )}

        <div>
          <span className="text-[10px] text-pitwall-textMuted block">THROTTLE / BRAKE</span>
          <span className="font-bold text-pitwall-textBright tabular-nums">
            T:{curPoint?.c1Throttle || 0}% • B:{curPoint?.c1Brake || 0}%
          </span>
        </div>

        <div>
          <span className="text-[10px] text-pitwall-textMuted block">
            {selectedYear >= 2026 ? 'AERO MODE' : 'DRS STATUS'}
          </span>
          <span className={`font-bold tabular-nums ${(curPoint?.c1Drs || 0) > 0 ? 'text-emerald-400' : 'text-pitwall-textMuted'}`}>
            {aeroDetails1.code}
            {isComparisonMode && ` vs ${aeroDetails2.code}`}
          </span>
        </div>
      </div>

      {/* High-Performance Canvas Oscilloscope */}
      <div className="relative w-full h-[360px] rounded-md border border-pitwall-border overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasInteraction}
          onMouseMove={(e) => {
            if (e.buttons === 1) handleCanvasInteraction(e);
          }}
          className="w-full h-full block"
        />
      </div>

      {/* Interactive Lap Timeline Scrubber */}
      <div className="mt-3 px-1">
        <label htmlFor="telemetry-scrubber" className="sr-only">Lap Distance Scrubber</label>
        <input
          id="telemetry-scrubber"
          type="range"
          min="0"
          max={Math.max(0, data.length - 1)}
          value={currentPointIndex}
          onChange={(e) => onScrub(Number(e.target.value))}
          className="w-full h-2 bg-pitwall-subpanel rounded appearance-none cursor-pointer accent-[#e10600]"
        />
        <div className="flex justify-between items-center text-[10px] font-mono text-pitwall-textMuted mt-1">
          <span>0.00 km (Start)</span>
          <span>Sector 1</span>
          <span>Sector 2</span>
          <span>5.30 km (Finish)</span>
        </div>
      </div>

      {/* Telemetry Metrics Table */}
      <div className={`mt-4 pt-3 border-t border-pitwall-border grid gap-3 text-xs font-mono ${
        isComparisonMode ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3'
      }`}>
        {/* Terminal Velocity */}
        <div className="bg-pitwall-subpanel border border-pitwall-border rounded p-3">
          <span className="text-[10px] text-pitwall-textMuted block uppercase">Terminal Velocity (ST)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-base font-bold text-pitwall-textBright">{stats1.topSpeed} km/h</span>
            {isComparisonMode && (
              <>
                <span className="text-pitwall-textMuted">vs</span>
                <span className="text-base font-bold text-pitwall-textBright">{stats2.topSpeed} km/h</span>
              </>
            )}
          </div>
          {isComparisonMode && (
            <span className="text-[11px] text-emerald-400 mt-1 block">
              Δ {Math.abs(stats1.topSpeed - stats2.topSpeed)} km/h ({stats1.topSpeed >= stats2.topSpeed ? driver1?.name_acronym : driver2?.name_acronym} higher)
            </span>
          )}
        </div>

        {/* Slowest Corner Apex */}
        <div className="bg-pitwall-subpanel border border-pitwall-border rounded p-3">
          <span className="text-[10px] text-pitwall-textMuted block uppercase">Slowest Apex Velocity</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-base font-bold text-pitwall-textBright">{stats1.apexSpeed} km/h</span>
            {isComparisonMode && (
              <>
                <span className="text-pitwall-textMuted">vs</span>
                <span className="text-base font-bold text-pitwall-textBright">{stats2.apexSpeed} km/h</span>
              </>
            )}
          </div>
          {isComparisonMode && (
            <span className="text-[11px] text-cyan-400 mt-1 block">
              Apex delta: {Math.abs(stats1.apexSpeed - stats2.apexSpeed)} km/h
            </span>
          )}
        </div>

        {/* Full Throttle Time */}
        <div className="bg-pitwall-subpanel border border-pitwall-border rounded p-3">
          <span className="text-[10px] text-pitwall-textMuted block uppercase">Full Throttle Usage</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-base font-bold text-pitwall-textBright">{stats1.timeUnderFullThrottle}%</span>
            {isComparisonMode && (
              <>
                <span className="text-pitwall-textMuted">vs</span>
                <span className="text-base font-bold text-pitwall-textBright">{stats2.timeUnderFullThrottle}%</span>
              </>
            )}
          </div>
          <span className="text-[11px] text-pitwall-textSecondary mt-1 block">
            Avg Throttle: {stats1.avgThrottle}%{isComparisonMode && ` / ${stats2.avgThrottle}%`}
          </span>
        </div>

        {/* Heavy Braking Count (In comparison mode) */}
        {isComparisonMode && (
          <div className="bg-pitwall-subpanel border border-pitwall-border rounded p-3">
            <span className="text-[10px] text-pitwall-textMuted block uppercase">Heavy Braking Zones</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-base font-bold text-pitwall-textBright">{stats1.hardBrakingEvents} zones</span>
              <span className="text-pitwall-textMuted">vs</span>
              <span className="text-base font-bold text-pitwall-textBright">{stats2.hardBrakingEvents} zones</span>
            </div>
            <span className="text-[11px] text-rose-400 mt-1 block">
              Braking Commitment: High (&gt;5G decel)
            </span>
          </div>
        )}
      </div>
    </section>
  );
};
