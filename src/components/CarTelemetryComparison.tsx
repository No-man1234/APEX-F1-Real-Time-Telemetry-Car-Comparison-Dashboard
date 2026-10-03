import React, { useRef, useEffect, useState } from 'react';
import type { Driver, CarTelemetryComparisonPoint, CarAnalysisStats } from '../types/f1';
import { Play, Pause, RotateCcw, TrendingUp, Zap, Award, Layers } from 'lucide-react';

interface CarTelemetryComparisonProps {
  driver1: Driver | null;
  driver2: Driver | null;
  data: CarTelemetryComparisonPoint[];
  currentPointIndex: number;
  onScrub: (action: number | ((prev: number) => number)) => void;
  stats1: CarAnalysisStats;
  stats2: CarAnalysisStats;
}

export const CarTelemetryComparison: React.FC<CarTelemetryComparisonProps> = ({
  driver1,
  driver2,
  data,
  currentPointIndex,
  onScrub,
  stats1,
  stats2,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'speed' | 'throttle' | 'brake' | 'delta'>('all');

  const formatColor = (hex?: string) => {
    if (!hex) return '#e10600';
    return hex.startsWith('#') ? hex : `#${hex}`;
  };

  const c1Color = formatColor(driver1?.team_colour || '3671C6');
  const c2Color = formatColor(driver2?.team_colour || 'FF8000');

  // Automatic playback loop
  useEffect(() => {
    if (!isPlaying || !data.length) return;

    const interval = setInterval(() => {
      onScrub((prev: number) => {
        const next = prev + playbackSpeed;
        if (next >= data.length) {
          setIsPlaying(false);
          return 0;
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, data.length, playbackSpeed, onScrub]);

  // Canvas drawing for telemetry traces
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Clear background
    ctx.fillStyle = '#0b0c12';
    ctx.fillRect(0, 0, width, height);

    // Padding
    const padLeft = 55;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 30;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    // Draw grid lines
    const xTicks = 10;
    for (let i = 0; i <= xTicks; i++) {
      const x = padLeft + (i / xTicks) * plotW;
      ctx.strokeStyle = '#1a1d28';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, height - padBottom);
      ctx.stroke();

      // X-axis label (Distance)
      ctx.fillStyle = '#61687d';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      const dist = Math.round((i / xTicks) * 5.3 * 10) / 10;
      ctx.fillText(`${dist}km`, x, height - padBottom + 15);
    }

    const yTicks = 5;
    for (let i = 0; i <= yTicks; i++) {
      const y = padTop + (i / yTicks) * plotH;
      ctx.strokeStyle = '#1a1d28';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();

      // Y-axis label (Speed)
      const speedVal = Math.round(360 - (i / yTicks) * 300);
      ctx.fillStyle = '#61687d';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${speedVal}`, padLeft - 8, y + 3);
    }

    // Draw Speed Trace for Car 1
    ctx.beginPath();
    ctx.strokeStyle = c1Color;
    ctx.lineWidth = 2.5;
    data.forEach((pt, idx) => {
      const x = padLeft + (idx / (data.length - 1)) * plotW;
      const normY = (pt.c1Speed - 60) / 300;
      const y = padTop + (1 - Math.max(0, Math.min(1, normY))) * plotH;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw Speed Trace for Car 2
    ctx.beginPath();
    ctx.strokeStyle = c2Color;
    ctx.lineWidth = 2.5;
    data.forEach((pt, idx) => {
      const x = padLeft + (idx / (data.length - 1)) * plotW;
      const normY = (pt.c2Speed - 60) / 300;
      const y = padTop + (1 - Math.max(0, Math.min(1, normY))) * plotH;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw Throttle under-curve fill if selected
    if (selectedChannel === 'all' || selectedChannel === 'throttle') {
      ctx.fillStyle = `${c1Color}15`;
      ctx.beginPath();
      data.forEach((pt, idx) => {
        const x = padLeft + (idx / (data.length - 1)) * plotW;
        const y = height - padBottom - (pt.c1Throttle / 100) * 40;
        if (idx === 0) ctx.moveTo(x, height - padBottom);
        ctx.lineTo(x, y);
      });
      ctx.lineTo(width - padRight, height - padBottom);
      ctx.closePath();
      ctx.fill();
    }

    // Draw Current Scrubber Vertical Cursor Line
    const safeIndex = Math.min(data.length - 1, Math.max(0, currentPointIndex));
    const cursorX = padLeft + (safeIndex / (data.length - 1)) * plotW;

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cursorX, padTop);
    ctx.lineTo(cursorX, height - padBottom);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw cursor point indicator dots on traces
    const curPt = data[safeIndex];
    if (curPt) {
      // Point 1
      const y1 = padTop + (1 - (curPt.c1Speed - 60) / 300) * plotH;
      ctx.fillStyle = c1Color;
      ctx.beginPath();
      ctx.arc(cursorX, y1, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Point 2
      const y2 = padTop + (1 - (curPt.c2Speed - 60) / 300) * plotH;
      ctx.fillStyle = c2Color;
      ctx.beginPath();
      ctx.arc(cursorX, y2, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [data, currentPointIndex, c1Color, c2Color, selectedChannel]);

  // Handle canvas click/drag for scrubbing
  const handleCanvasInteraction = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const padLeft = 55;
    const padRight = 20;
    const plotW = rect.width - padLeft - padRight;

    const ratio = Math.max(0, Math.min(1, (x - padLeft) / plotW));
    const newIndex = Math.floor(ratio * (data.length - 1));
    onScrub(newIndex);
  };

  const currentPt = data[currentPointIndex] || data[0];

  return (
    <div className="bg-[#12141c] border border-[#232735] rounded-xl p-5 shadow-2xl mb-6">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-[#1f2331]">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#e10600]" />
            <h2 className="text-base font-bold text-white tracking-wide uppercase font-f1">
              Synchronized Telemetry Overlay
            </h2>
          </div>
          <p className="text-xs text-[#8f96a8]">
            Interactive speed traces, throttle/brake telemetry & delta gap analysis
          </p>
        </div>

        {/* Playback & Channel Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Channel selector */}
          <div className="flex items-center gap-1 bg-[#1a1d29] p-1 rounded-md border border-[#2b3042] text-xs font-mono">
            {(['all', 'speed', 'throttle', 'brake', 'delta'] as const).map((chan) => (
              <button
                key={chan}
                onClick={() => setSelectedChannel(chan)}
                className={`px-2.5 py-1 rounded capitalize font-bold transition-colors ${
                  selectedChannel === chan
                    ? 'bg-[#e10600] text-white shadow-sm'
                    : 'text-[#8f96a8] hover:text-white'
                }`}
              >
                {chan}
              </button>
            ))}
          </div>

          {/* Play / Pause */}
          <div className="flex items-center gap-1 bg-[#1a1d29] p-1 rounded-md border border-[#2b3042]">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded bg-[#e10600] text-white hover:bg-[#b00400] transition-colors"
              title={isPlaying ? 'Pause Replay' : 'Play Lap Replay'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onScrub(0)}
              className="p-1.5 rounded text-[#8f96a8] hover:text-white transition-colors"
              title="Reset to Lap Start"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-[#1a1d29] px-2 py-1 rounded-md border border-[#2b3042] text-xs font-mono">
            <span className="text-[#71788d]">Speed:</span>
            {[1, 2, 4].map((s) => (
              <button
                key={s}
                onClick={() => setPlaybackSpeed(s)}
                className={`px-1.5 py-0.5 rounded font-bold ${
                  playbackSpeed === s ? 'text-amber-400' : 'text-[#8f96a8] hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Driver Legend */}
      <div className="flex items-center justify-between mb-3 text-xs font-mono">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm shadow-sm" style={{ backgroundColor: c1Color }} />
            <span className="font-bold text-white">
              #{driver1?.driver_number} {driver1?.full_name} ({driver1?.name_acronym})
            </span>
            <span className="text-xs text-[#8f96a8]">
              Instant: <strong className="text-white">{currentPt?.c1Speed || 0} km/h</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm shadow-sm" style={{ backgroundColor: c2Color }} />
            <span className="font-bold text-white">
              #{driver2?.driver_number} {driver2?.full_name} ({driver2?.name_acronym})
            </span>
            <span className="text-xs text-[#8f96a8]">
              Instant: <strong className="text-white">{currentPt?.c2Speed || 0} km/h</strong>
            </span>
          </div>
        </div>

        <div className="hidden sm:block text-[#71788d]">
          Lap Progress: <span className="text-white font-bold">{currentPt?.percentage || 0}%</span>
        </div>
      </div>

      {/* Main Canvas Graph */}
      <div className="relative w-full h-[320px] bg-[#0b0c12] rounded-xl border border-[#232735] overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasInteraction}
          onMouseMove={(e) => {
            if (e.buttons === 1) handleCanvasInteraction(e);
          }}
          className="w-full h-full block"
        />
      </div>

      {/* Scrubber Range Slider */}
      <div className="mt-4 px-1">
        <input
          type="range"
          min="0"
          max={Math.max(0, data.length - 1)}
          value={currentPointIndex}
          onChange={(e) => onScrub(Number(e.target.value))}
          className="w-full h-2 bg-[#1b1f2e] rounded-lg appearance-none cursor-pointer accent-[#e10600]"
        />
        <div className="flex justify-between items-center text-[10px] font-mono text-[#71788d] mt-1">
          <span>START (0.0km)</span>
          <span>SECTOR 1</span>
          <span>SECTOR 2</span>
          <span>FINISH LINE (5.3km)</span>
        </div>
      </div>

      {/* Statistical Head-to-Head Comparison Cards */}
      <div className="mt-6 pt-5 border-t border-[#1f2331] grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Top Speed Card */}
        <div className="bg-[#171a25] border border-[#282d3e] rounded-lg p-3.5">
          <div className="flex items-center justify-between text-xs text-[#8f96a8] font-mono mb-2">
            <span>MAX VELOCITY</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between font-mono">
            <div>
              <span className="text-lg font-black text-white">{stats1.topSpeed}</span>
              <span className="text-[10px] text-[#71788d] ml-1">km/h</span>
            </div>
            <span className="text-xs text-[#71788d]">vs</span>
            <div>
              <span className="text-lg font-black text-white">{stats2.topSpeed}</span>
              <span className="text-[10px] text-[#71788d] ml-1">km/h</span>
            </div>
          </div>
          <div className="mt-2 text-[11px] font-mono text-emerald-400 font-semibold">
            Delta: {Math.abs(stats1.topSpeed - stats2.topSpeed)} km/h (
            {stats1.topSpeed >= stats2.topSpeed ? driver1?.name_acronym : driver2?.name_acronym} faster)
          </div>
        </div>

        {/* Minimum Apex Speed Card */}
        <div className="bg-[#171a25] border border-[#282d3e] rounded-lg p-3.5">
          <div className="flex items-center justify-between text-xs text-[#8f96a8] font-mono mb-2">
            <span>MIN APEX SPEED</span>
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="flex items-baseline justify-between font-mono">
            <div>
              <span className="text-lg font-black text-white">{stats1.apexSpeed}</span>
              <span className="text-[10px] text-[#71788d] ml-1">km/h</span>
            </div>
            <span className="text-xs text-[#71788d]">vs</span>
            <div>
              <span className="text-lg font-black text-white">{stats2.apexSpeed}</span>
              <span className="text-[10px] text-[#71788d] ml-1">km/h</span>
            </div>
          </div>
          <div className="mt-2 text-[11px] font-mono text-cyan-400 font-semibold">
            Corner Entry Delta: {Math.abs(stats1.apexSpeed - stats2.apexSpeed)} km/h
          </div>
        </div>

        {/* Full Throttle % */}
        <div className="bg-[#171a25] border border-[#282d3e] rounded-lg p-3.5">
          <div className="flex items-center justify-between text-xs text-[#8f96a8] font-mono mb-2">
            <span>FULL THROTTLE %</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between font-mono">
            <div>
              <span className="text-lg font-black text-white">{stats1.timeUnderFullThrottle}%</span>
            </div>
            <span className="text-xs text-[#71788d]">vs</span>
            <div>
              <span className="text-lg font-black text-white">{stats2.timeUnderFullThrottle}%</span>
            </div>
          </div>
          <div className="mt-2 text-[11px] font-mono text-white font-semibold">
            Avg Throttle: {stats1.avgThrottle}% / {stats2.avgThrottle}%
          </div>
        </div>

        {/* Heavy Braking Zones */}
        <div className="bg-[#171a25] border border-[#282d3e] rounded-lg p-3.5">
          <div className="flex items-center justify-between text-xs text-[#8f96a8] font-mono mb-2">
            <span>HARD BRAKING EVENTS</span>
            <Award className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="flex items-baseline justify-between font-mono">
            <div>
              <span className="text-lg font-black text-white">{stats1.hardBrakingEvents}</span>
              <span className="text-[10px] text-[#71788d] ml-1">zones</span>
            </div>
            <span className="text-xs text-[#71788d]">vs</span>
            <div>
              <span className="text-lg font-black text-white">{stats2.hardBrakingEvents}</span>
              <span className="text-[10px] text-[#71788d] ml-1">zones</span>
            </div>
          </div>
          <div className="mt-2 text-[11px] font-mono text-rose-400 font-semibold">
            Aggressive Trail Braking Zone: Turn 1
          </div>
        </div>
      </div>
    </div>
  );
};
