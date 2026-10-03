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
  lapDurationSec?: number;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  playbackSpeed?: number;
  onChangeSpeed?: (speed: number) => void;
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
  lapDurationSec = 90,
  isPlaying: controlledIsPlaying,
  onTogglePlay: controlledOnTogglePlay,
  playbackSpeed: controlledPlaybackSpeed,
  onChangeSpeed: controlledOnChangeSpeed,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Local fallback playback state
  const [localIsPlaying, setLocalIsPlaying] = useState<boolean>(false);
  const [localPlaybackSpeed, setLocalPlaybackSpeed] = useState<number>(1); // Default strictly 1x

  const isPlaying = controlledIsPlaying !== undefined ? controlledIsPlaying : localIsPlaying;
  const onTogglePlay = controlledOnTogglePlay || (() => setLocalIsPlaying((p) => !p));
  const playbackSpeed = controlledPlaybackSpeed !== undefined ? controlledPlaybackSpeed : localPlaybackSpeed;
  const onChangeSpeed = controlledOnChangeSpeed || setLocalPlaybackSpeed;

  const [activeSector, setActiveSector] = useState<SectorFilter>('all');
  const [useMph, setUseMph] = useState<boolean>(false);

  // Interactive Checklist to include/exclude telemetry curves
  const [channels, setChannels] = useState<{
    speed: boolean;
    throttle: boolean;
    brake: boolean;
    gear: boolean;
    rpm: boolean;
    delta: boolean;
  }>({
    speed: true,
    throttle: true,
    brake: true,
    gear: false,
    rpm: false,
    delta: isComparisonMode,
  });

  // Sync delta with comparison mode
  useEffect(() => {
    if (!isComparisonMode && channels.delta) {
      setChannels((prev) => ({ ...prev, delta: false }));
    }
  }, [isComparisonMode, channels.delta]);

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

  // Calibrated playback pacing: If controlled globally by App, skip local timer to avoid double-speed
  useEffect(() => {
    if (controlledIsPlaying !== undefined) return;
    if (!isPlaying || !data.length) return;

    const baseDuration = lapDurationSec > 0 ? lapDurationSec : 90;
    const stepIntervalMs = Math.max(
      16,
      Math.round((baseDuration / data.length) * (1000 / playbackSpeed))
    );

    const interval = setInterval(() => {
      onScrub((prev: number) => {
        const next = prev + 1;
        if (next >= data.length) {
          onTogglePlay();
          return 0;
        }
        return next;
      });
    }, stepIntervalMs);

    return () => clearInterval(interval);
  }, [isPlaying, data.length, playbackSpeed, lapDurationSec, onScrub, onTogglePlay]);

  // High-density Canvas drawing with modular tracks based on user checklist
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
    const gridColor = isDark ? '#1a1e2b' : '#e2e8f0';
    const textColor = isDark ? '#7b859e' : '#475569';
    const titleColor = isDark ? '#2e3549' : '#64748b';

    // Clear Background
    ctx.fillStyle = canvasBg;
    ctx.fillRect(0, 0, width, height);

    const padL = 56;
    const padR = 24;
    const padT = 16;
    const padB = 28;
    const plotW = width - padL - padR;
    const plotH = height - padT - padB;

    // Determine active tracks
    type TrackType = 'speed' | 'delta' | 'pedals' | 'gear' | 'rpm';
    const activeTracks: TrackType[] = [];

    if (channels.speed) activeTracks.push('speed');
    if (isComparisonMode && channels.delta) activeTracks.push('delta');
    if (channels.throttle || channels.brake) activeTracks.push('pedals');
    if (channels.gear) activeTracks.push('gear');
    if (channels.rpm) activeTracks.push('rpm');

    // If all unchecked, fall back to speed
    if (activeTracks.length === 0) activeTracks.push('speed');

    // Calculate layout heights for each active track
    const gap = 14;
    const totalGaps = (activeTracks.length - 1) * gap;
    const netHeight = Math.max(100, plotH - totalGaps);

    const trackWeights: Record<TrackType, number> = {
      speed: 1.6,
      delta: 0.9,
      pedals: 1.1,
      gear: 0.8,
      rpm: 1.0,
    };

    const sumWeights = activeTracks.reduce((acc, t) => acc + trackWeights[t], 0);

    const trackLayouts = new Map<TrackType, { y: number; h: number }>();
    let currentY = padT;

    activeTracks.forEach((t) => {
      const h = Math.floor((trackWeights[t] / sumWeights) * netHeight);
      trackLayouts.set(t, { y: currentY, h });
      currentY += h + gap;
    });

    // Draw X-Axis Distance Grid
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
    // TRACK: SPEED
    // ==========================================
    if (trackLayouts.has('speed')) {
      const { y: yTrack, h: hTrack } = trackLayouts.get('speed')!;

      ctx.fillStyle = titleColor;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(useMph ? 'SPEED (MPH)' : 'SPEED (KM/H)', padL + 6, yTrack + 13);

      const speedMin = useMph ? 40 : 60;
      const speedMax = useMph ? 225 : 360;
      const speedTicks = Math.max(2, Math.floor(hTrack / 45));

      for (let i = 0; i <= speedTicks; i++) {
        const y = yTrack + (i / speedTicks) * hTrack;
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
        const y = yTrack + (1 - Math.max(0, Math.min(1, normY))) * hTrack;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Car 2 Speed Line
      if (isComparisonMode) {
        ctx.beginPath();
        ctx.strokeStyle = c2Color;
        ctx.lineWidth = 2.2;
        visibleData.forEach((pt, idx) => {
          const x = padL + (idx / (visibleData.length - 1)) * plotW;
          const spd = useMph ? pt.c2Speed * 0.621371 : pt.c2Speed;
          const normY = (spd - speedMin) / (speedMax - speedMin);
          const y = yTrack + (1 - Math.max(0, Math.min(1, normY))) * hTrack;
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      }
    }

    // ==========================================
    // TRACK: DELTA TIME (Only in comparison mode)
    // ==========================================
    if (trackLayouts.has('delta') && isComparisonMode) {
      const { y: yTrack, h: hTrack } = trackLayouts.get('delta')!;

      ctx.fillStyle = titleColor;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('DELTA TIME (Δt SECONDS)', padL + 6, yTrack + 13);

      const zeroY = yTrack + hTrack / 2;
      ctx.strokeStyle = isDark ? '#2b3246' : '#cbd3e3';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padL, zeroY);
      ctx.lineTo(width - padR, zeroY);
      ctx.stroke();

      ctx.fillStyle = textColor;
      ctx.textAlign = 'right';
      ctx.fillText('0.0s', padL - 8, zeroY + 3);
      ctx.fillText('+0.5s', padL - 8, yTrack + 10);
      ctx.fillText('-0.5s', padL - 8, yTrack + hTrack);

      // Delta Line
      ctx.beginPath();
      ctx.strokeStyle = isDark ? '#ffffff' : '#1e2433';
      ctx.lineWidth = 1.8;
      visibleData.forEach((pt, idx) => {
        const x = padL + (idx / (visibleData.length - 1)) * plotW;
        const clampedDelta = Math.max(-0.5, Math.min(0.5, pt.timeDelta));
        const normY = (clampedDelta - -0.5) / 1.0;
        const y = yTrack + (1 - normY) * hTrack;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // ==========================================
    // TRACK: PEDAL INPUTS (THROTTLE & BRAKE)
    // ==========================================
    if (trackLayouts.has('pedals')) {
      const { y: yTrack, h: hTrack } = trackLayouts.get('pedals')!;

      ctx.fillStyle = titleColor;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('THROTTLE & BRAKE INPUTS (%)', padL + 6, yTrack + 13);

      ctx.fillStyle = textColor;
      ctx.textAlign = 'right';
      ctx.fillText('100%', padL - 8, yTrack + 10);
      ctx.fillText('0%', padL - 8, yTrack + hTrack);

      // Throttle Line (Green)
      if (channels.throttle) {
        ctx.beginPath();
        ctx.strokeStyle = '#00d26a';
        ctx.lineWidth = 1.8;
        visibleData.forEach((pt, idx) => {
          const x = padL + (idx / (visibleData.length - 1)) * plotW;
          const thr = Math.min(100, Math.max(0, pt.c1Throttle));
          const y = yTrack + (1 - thr / 100) * hTrack;
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      }

      // Brake Line (Red)
      if (channels.brake) {
        ctx.beginPath();
        ctx.strokeStyle = '#e10600';
        ctx.lineWidth = 2;
        visibleData.forEach((pt, idx) => {
          const x = padL + (idx / (visibleData.length - 1)) * plotW;
          const brk = Math.min(100, Math.max(0, pt.c1Brake));
          const y = yTrack + (1 - brk / 100) * hTrack;
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      }
    }

    // ==========================================
    // TRACK: GEAR (1 - 8)
    // ==========================================
    if (trackLayouts.has('gear')) {
      const { y: yTrack, h: hTrack } = trackLayouts.get('gear')!;

      ctx.fillStyle = titleColor;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('GEAR SELECTION', padL + 6, yTrack + 13);

      ctx.fillStyle = textColor;
      ctx.textAlign = 'right';
      ctx.fillText('8', padL - 8, yTrack + 10);
      ctx.fillText('1', padL - 8, yTrack + hTrack);

      // Stepped Gear Line Car 1
      ctx.beginPath();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      visibleData.forEach((pt, idx) => {
        const x = padL + (idx / (visibleData.length - 1)) * plotW;
        const g = Math.max(1, Math.min(8, pt.c1Gear || 1));
        const normY = (g - 1) / 7;
        const y = yTrack + (1 - normY) * hTrack;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // ==========================================
    // TRACK: ENGINE RPM
    // ==========================================
    if (trackLayouts.has('rpm')) {
      const { y: yTrack, h: hTrack } = trackLayouts.get('rpm')!;

      ctx.fillStyle = titleColor;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('ENGINE RPM (REV LIMIT 12.5K)', padL + 6, yTrack + 13);

      ctx.fillStyle = textColor;
      ctx.textAlign = 'right';
      ctx.fillText('12.5k', padL - 8, yTrack + 10);
      ctx.fillText('6.0k', padL - 8, yTrack + hTrack);

      // RPM Line Car 1
      ctx.beginPath();
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.8;
      visibleData.forEach((pt, idx) => {
        const x = padL + (idx / (visibleData.length - 1)) * plotW;
        const rpm = Math.max(6000, Math.min(12500, pt.c1Rpm || 10000));
        const normY = (rpm - 6000) / 6500;
        const y = yTrack + (1 - normY) * hTrack;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

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
        if (trackLayouts.has('speed')) {
          const { y: yTrack, h: hTrack } = trackLayouts.get('speed')!;
          const spd = useMph ? pt.c1Speed * 0.621371 : pt.c1Speed;
          const speedMin = useMph ? 40 : 60;
          const speedMax = useMph ? 225 : 360;
          const normY = (spd - speedMin) / (speedMax - speedMin);
          const dotY = yTrack + (1 - Math.max(0, Math.min(1, normY))) * hTrack;

          ctx.fillStyle = c1Color;
          ctx.beginPath();
          ctx.arc(cursorX, dotY, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
    }
  }, [
    visibleData,
    currentPointIndex,
    c1Color,
    c2Color,
    activeSector,
    sectorBounds,
    data,
    useMph,
    isComparisonMode,
    theme,
    channels,
  ]);

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
              onClick={onTogglePlay}
              aria-label={isPlaying ? 'Pause replay' : 'Play telemetry replay'}
              className="p-1 rounded bg-[#e10600] text-white hover:bg-[#b00400] transition-colors"
              title={isPlaying ? 'Pause Replay' : 'Play Lap Replay'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => onScrub(0)}
              aria-label="Reset cursor to lap start"
              className="p-1 rounded text-pitwall-textMuted hover:text-pitwall-textBright transition-colors"
              title="Reset to Lap Start"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Calibrated Playback Speeds with Lap-Time Scale */}
          <div className="flex items-center gap-1 bg-pitwall-subpanel px-2 py-1 rounded border border-pitwall-border text-[11px]">
            <span className="text-pitwall-textMuted">Pace:</span>
            {[1, 2, 4, 8, 16].map((spd) => (
              <button
                key={spd}
                onClick={() => onChangeSpeed(spd)}
                className={`font-bold px-1 transition-colors ${
                  playbackSpeed === spd
                    ? 'text-amber-600 dark:text-amber-400 font-extrabold'
                    : 'text-pitwall-textMuted hover:text-pitwall-textBright'
                }`}
                title={`${spd}x playback pace (${(lapDurationSec / spd).toFixed(1)}s total)`}
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
            <span className={`font-bold tabular-nums ${(curPoint?.speedDelta || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {(curPoint?.speedDelta || 0) >= 0 ? `+${curPoint?.speedDelta}` : curPoint?.speedDelta} km/h
            </span>
          </div>
        )}

        {isComparisonMode && (
          <div>
            <span className="text-[10px] text-pitwall-textMuted block">TIME DELTA (Δt)</span>
            <span className={`font-bold tabular-nums ${(curPoint?.timeDelta || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {(curPoint?.timeDelta || 0) >= 0 ? `+${curPoint?.timeDelta.toFixed(3)}s` : `${curPoint?.timeDelta.toFixed(3)}s`}
            </span>
          </div>
        )}

        <div>
          <span className="text-[10px] text-pitwall-textMuted block">THROTTLE / BRAKE</span>
          <span className="font-bold text-pitwall-textBright tabular-nums">
            T:{Math.min(100, Math.max(0, curPoint?.c1Throttle || 0))}% • B:{Math.min(100, Math.max(0, curPoint?.c1Brake || 0))}%
          </span>
        </div>

        <div>
          <span className="text-[10px] text-pitwall-textMuted block">
            {selectedYear >= 2026 ? 'AERO MODE' : 'DRS STATUS'}
          </span>
          <span className={`font-bold tabular-nums ${(curPoint?.c1Drs || 0) > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-pitwall-textMuted'}`}>
            {aeroDetails1.code}
            {isComparisonMode && ` vs ${aeroDetails2.code}`}
          </span>
        </div>
      </div>

      {/* SERIES CHECKLIST: Include / Exclude Telemetry Curves */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-pitwall-subpanel border border-pitwall-border rounded-md text-xs font-mono mb-3">
        <span className="font-bold text-pitwall-textMuted uppercase text-[10px] sm:text-[11px] mr-1">
          CHANNELS:
        </span>
        <button
          onClick={() => setChannels((c) => ({ ...c, speed: !c.speed }))}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-bold transition-all cursor-pointer ${
            channels.speed
              ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/40'
              : 'bg-pitwall-bg text-pitwall-textMuted border-pitwall-border opacity-50'
          }`}
          title="Toggle Speed / Velocity curve"
        >
          <span className={`w-2 h-2 rounded-xs ${channels.speed ? 'bg-blue-600 dark:bg-blue-400' : 'bg-slate-400'}`} />
          <span>Velocity (Speed)</span>
        </button>

        <button
          onClick={() => setChannels((c) => ({ ...c, throttle: !c.throttle }))}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-bold transition-all cursor-pointer ${
            channels.throttle
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/40'
              : 'bg-pitwall-bg text-pitwall-textMuted border-pitwall-border opacity-50'
          }`}
          title="Toggle Throttle Input curve"
        >
          <span className={`w-2 h-2 rounded-xs ${channels.throttle ? 'bg-emerald-600 dark:bg-emerald-400' : 'bg-slate-400'}`} />
          <span>Throttle (%)</span>
        </button>

        <button
          onClick={() => setChannels((c) => ({ ...c, brake: !c.brake }))}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-bold transition-all cursor-pointer ${
            channels.brake
              ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/40'
              : 'bg-pitwall-bg text-pitwall-textMuted border-pitwall-border opacity-50'
          }`}
          title="Toggle Brake Pressure curve"
        >
          <span className={`w-2 h-2 rounded-xs ${channels.brake ? 'bg-rose-600 dark:bg-rose-400' : 'bg-slate-400'}`} />
          <span>Brake (%)</span>
        </button>

        <button
          onClick={() => setChannels((c) => ({ ...c, gear: !c.gear }))}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-bold transition-all cursor-pointer ${
            channels.gear
              ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/40'
              : 'bg-pitwall-bg text-pitwall-textMuted border-pitwall-border opacity-50'
          }`}
          title="Toggle Gear Selection curve"
        >
          <span className={`w-2 h-2 rounded-xs ${channels.gear ? 'bg-amber-600 dark:bg-amber-400' : 'bg-slate-400'}`} />
          <span>Gear (1-8)</span>
        </button>

        <button
          onClick={() => setChannels((c) => ({ ...c, rpm: !c.rpm }))}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-bold transition-all cursor-pointer ${
            channels.rpm
              ? 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-500/15 dark:text-purple-400 dark:border-purple-500/40'
              : 'bg-pitwall-bg text-pitwall-textMuted border-pitwall-border opacity-50'
          }`}
          title="Toggle Engine RPM curve"
        >
          <span className={`w-2 h-2 rounded-xs ${channels.rpm ? 'bg-purple-600 dark:bg-purple-400' : 'bg-slate-400'}`} />
          <span>Engine RPM</span>
        </button>

        {isComparisonMode && (
          <button
            onClick={() => setChannels((c) => ({ ...c, delta: !c.delta }))}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-bold transition-all cursor-pointer ${
              channels.delta
                ? 'bg-cyan-50 text-cyan-700 border-cyan-300 dark:bg-cyan-500/15 dark:text-cyan-400 dark:border-cyan-500/40'
                : 'bg-pitwall-bg text-pitwall-textMuted border-pitwall-border opacity-50'
            }`}
            title="Toggle Delta Time curve"
          >
            <span className={`w-2 h-2 rounded-xs ${channels.delta ? 'bg-cyan-600 dark:bg-cyan-400' : 'bg-slate-400'}`} />
            <span>Time Delta (Δt)</span>
          </button>
        )}
      </div>

      {/* High-Performance Canvas Oscilloscope */}
      <div className="relative w-full h-[380px] rounded-md border border-pitwall-border overflow-hidden cursor-crosshair">
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

      {/* Telemetry Metrics Summary */}
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
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block font-semibold">
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
            <span className="text-[11px] text-cyan-600 dark:text-cyan-400 mt-1 block font-semibold">
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
            <span className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 block font-semibold">
              Braking Commitment: High (&gt;5G decel)
            </span>
          </div>
        )}
      </div>
    </section>
  );
};
