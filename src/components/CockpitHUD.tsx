import React, { useState } from 'react';
import type { Driver, CarTelemetryComparisonPoint } from '../types/f1';
import { Gauge, Zap, Wind } from 'lucide-react';

interface CockpitHUDProps {
  driver1: Driver | null;
  driver2: Driver | null;
  currentPoint: CarTelemetryComparisonPoint | null;
}

export const CockpitHUD: React.FC<CockpitHUDProps> = ({
  driver1,
  driver2,
  currentPoint
}) => {
  const [useMph, setUseMph] = useState(false);

  const formatColor = (hex?: string) => {
    if (!hex) return '#e10600';
    return hex.startsWith('#') ? hex : `#${hex}`;
  };

  const c1Color = formatColor(driver1?.team_colour || '3671C6');
  const c2Color = formatColor(driver2?.team_colour || 'FF8000');

  // Values from current point or realistic baseline defaults
  const c1Speed = currentPoint ? currentPoint.c1Speed : 295;
  const c2Speed = currentPoint ? currentPoint.c2Speed : 291;
  const c1Throttle = currentPoint ? currentPoint.c1Throttle : 100;
  const c2Throttle = currentPoint ? currentPoint.c2Throttle : 100;
  const c1Brake = currentPoint ? currentPoint.c1Brake : 0;
  const c2Brake = currentPoint ? currentPoint.c2Brake : 0;
  const c1Rpm = currentPoint ? currentPoint.c1Rpm : 11850;
  const c2Rpm = currentPoint ? currentPoint.c2Rpm : 11720;
  const c1Gear = currentPoint ? currentPoint.c1Gear : 7;
  const c2Gear = currentPoint ? currentPoint.c2Gear : 7;
  const c1Drs = currentPoint ? currentPoint.c1Drs > 0 : true;
  const c2Drs = currentPoint ? currentPoint.c2Drs > 0 : true;
  const timeDelta = currentPoint ? currentPoint.timeDelta : 0.084;

  const toSpeed = (val: number) => (useMph ? Math.round(val * 0.621371) : val);
  const speedUnit = useMph ? 'MPH' : 'KM/H';

  // Render F1 Shift Lights Bar (15 LEDs)
  const renderShiftLights = (rpm: number) => {
    const totalLeds = 15;
    const minRpm = 6000;
    const maxRpm = 12500;
    const activeLeds = Math.min(
      totalLeds,
      Math.max(0, Math.floor(((rpm - minRpm) / (maxRpm - minRpm)) * totalLeds))
    );
    const isRedline = rpm >= 12200;

    return (
      <div className={`flex items-center justify-center gap-1.5 p-2 rounded bg-[#090a0f] border border-[#232735] ${isRedline ? 'animate-pulse' : ''}`}>
        {Array.from({ length: totalLeds }).map((_, i) => {
          let activeColor = '#22c55e'; // Green (1-5)
          if (i >= 5 && i < 10) activeColor = '#ef4444'; // Red (6-10)
          if (i >= 10) activeColor = '#3b82f6'; // Blue (11-15)

          const isActive = i < activeLeds;
          return (
            <div
              key={i}
              className="w-3.5 h-3.5 rounded-full transition-all duration-75"
              style={{
                backgroundColor: isActive ? activeColor : '#1a1d29',
                boxShadow: isActive ? `0 0 8px ${activeColor}` : 'none',
                opacity: isActive ? 1 : 0.3,
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-[#12141c] border border-[#232735] rounded-xl p-5 shadow-2xl mb-6">
      {/* HUD Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1f2331]">
        <div className="flex items-center gap-2">
          <Gauge className="w-5 h-5 text-[#e10600]" />
          <h2 className="text-base font-bold text-white tracking-wide uppercase font-f1">
            Cockpit Telemetry HUD
          </h2>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#1e2230] text-[#9aa2b5]">
            Dual Stream Gauges
          </span>
        </div>

        {/* Speed Unit Toggle */}
        <div className="flex items-center gap-2 bg-[#1a1d29] p-1 rounded-md border border-[#2b3042] text-xs font-mono font-bold">
          <button
            onClick={() => setUseMph(false)}
            className={`px-2.5 py-1 rounded transition-colors ${
              !useMph ? 'bg-[#e10600] text-white shadow-sm' : 'text-[#8f96a8] hover:text-white'
            }`}
          >
            KM/H
          </button>
          <button
            onClick={() => setUseMph(true)}
            className={`px-2.5 py-1 rounded transition-colors ${
              useMph ? 'bg-[#e10600] text-white shadow-sm' : 'text-[#8f96a8] hover:text-white'
            }`}
          >
            MPH
          </button>
        </div>
      </div>

      {/* DUAL COCKPIT HUD DISPLAY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        {/* CAR 1 COCKPIT */}
        <div className="bg-[#171a25] border border-[#282d3e] rounded-xl p-5 relative overflow-hidden shadow-lg">
          <div
            className="absolute top-0 left-0 right-0 h-1.5"
            style={{ backgroundColor: c1Color }}
          />

          {/* Driver Badge */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span
                className="font-mono font-black text-xl px-2 py-0.5 rounded text-white"
                style={{ backgroundColor: c1Color }}
              >
                #{driver1?.driver_number || 1}
              </span>
              <div>
                <h3 className="font-extrabold text-base text-white leading-tight">
                  {driver1?.full_name || 'Driver 1'}
                </h3>
                <p className="text-xs text-[#8f96a8]">{driver1?.team_name || 'Team 1'}</p>
              </div>
            </div>

            {/* DRS Pill */}
            <div
              className={`px-3 py-1 rounded-full text-xs font-mono font-extrabold tracking-wider flex items-center gap-1.5 border transition-all ${
                c1Drs
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/60 shadow-glow-cyan animate-pulse'
                  : 'bg-[#12141c] text-[#555c70] border-[#242837]'
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              <span>{c1Drs ? 'DRS ACTIVE' : 'DRS CLOSED'}</span>
            </div>
          </div>

          {/* Shift Lights */}
          <div className="mb-4">
            {renderShiftLights(c1Rpm)}
            <div className="flex justify-between items-center text-[10px] font-mono text-[#8f96a8] mt-1 px-1">
              <span>6,000 RPM</span>
              <span className="font-bold text-white">{c1Rpm.toLocaleString()} RPM</span>
              <span className="text-red-400">12,500 REV</span>
            </div>
          </div>

          {/* Central Gauges Grid */}
          <div className="grid grid-cols-3 gap-3 items-center">
            {/* Speed Gauge */}
            <div className="col-span-2 bg-[#0d0e14] border border-[#232735] rounded-xl p-4 flex flex-col items-center justify-center relative">
              <span className="text-[11px] font-mono text-[#8f96a8] tracking-widest uppercase">
                VELOCITY
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-mono font-black text-5xl text-white tracking-tighter">
                  {toSpeed(c1Speed)}
                </span>
                <span className="font-mono font-bold text-xs text-[#8f96a8]">{speedUnit}</span>
              </div>

              {/* Speed difference pill */}
              <div className="mt-2 text-[11px] font-mono px-2 py-0.5 rounded bg-[#161822] text-[#9aa2b5] border border-[#252a3b]">
                Delta: {c1Speed - c2Speed >= 0 ? `+${c1Speed - c2Speed}` : c1Speed - c2Speed} km/h
              </div>
            </div>

            {/* Big Gear Display */}
            <div className="bg-[#0d0e14] border border-[#232735] rounded-xl p-4 flex flex-col items-center justify-center">
              <span className="text-[11px] font-mono text-[#8f96a8] tracking-widest uppercase">
                GEAR
              </span>
              <span className="font-mono font-black text-5xl text-amber-400 mt-1">
                {c1Gear > 0 ? c1Gear : 'N'}
              </span>
              <span className="text-[10px] font-mono text-[#8f96a8] mt-2">DOG RING</span>
            </div>
          </div>

          {/* Pedals: Throttle & Brake */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            {/* Throttle */}
            <div className="bg-[#0d0e14] border border-[#232735] rounded-lg p-2.5">
              <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                <span className="text-emerald-400 font-bold">THROTTLE</span>
                <span className="font-bold text-white">{c1Throttle}%</span>
              </div>
              <div className="w-full h-3 bg-[#191c28] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-75"
                  style={{ width: `${c1Throttle}%` }}
                />
              </div>
            </div>

            {/* Brake */}
            <div className="bg-[#0d0e14] border border-[#232735] rounded-lg p-2.5">
              <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                <span className="text-rose-400 font-bold">BRAKE</span>
                <span className="font-bold text-white">{c1Brake}%</span>
              </div>
              <div className="w-full h-3 bg-[#191c28] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-75"
                  style={{ width: `${c1Brake}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CAR 2 COCKPIT */}
        <div className="bg-[#171a25] border border-[#282d3e] rounded-xl p-5 relative overflow-hidden shadow-lg">
          <div
            className="absolute top-0 left-0 right-0 h-1.5"
            style={{ backgroundColor: c2Color }}
          />

          {/* Driver Badge */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span
                className="font-mono font-black text-xl px-2 py-0.5 rounded text-white"
                style={{ backgroundColor: c2Color }}
              >
                #{driver2?.driver_number || 4}
              </span>
              <div>
                <h3 className="font-extrabold text-base text-white leading-tight">
                  {driver2?.full_name || 'Driver 2'}
                </h3>
                <p className="text-xs text-[#8f96a8]">{driver2?.team_name || 'Team 2'}</p>
              </div>
            </div>

            {/* DRS Pill */}
            <div
              className={`px-3 py-1 rounded-full text-xs font-mono font-extrabold tracking-wider flex items-center gap-1.5 border transition-all ${
                c2Drs
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/60 shadow-glow-cyan animate-pulse'
                  : 'bg-[#12141c] text-[#555c70] border-[#242837]'
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              <span>{c2Drs ? 'DRS ACTIVE' : 'DRS CLOSED'}</span>
            </div>
          </div>

          {/* Shift Lights */}
          <div className="mb-4">
            {renderShiftLights(c2Rpm)}
            <div className="flex justify-between items-center text-[10px] font-mono text-[#8f96a8] mt-1 px-1">
              <span>6,000 RPM</span>
              <span className="font-bold text-white">{c2Rpm.toLocaleString()} RPM</span>
              <span className="text-red-400">12,500 REV</span>
            </div>
          </div>

          {/* Central Gauges Grid */}
          <div className="grid grid-cols-3 gap-3 items-center">
            {/* Speed Gauge */}
            <div className="col-span-2 bg-[#0d0e14] border border-[#232735] rounded-xl p-4 flex flex-col items-center justify-center relative">
              <span className="text-[11px] font-mono text-[#8f96a8] tracking-widest uppercase">
                VELOCITY
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-mono font-black text-5xl text-white tracking-tighter">
                  {toSpeed(c2Speed)}
                </span>
                <span className="font-mono font-bold text-xs text-[#8f96a8]">{speedUnit}</span>
              </div>

              {/* Speed difference pill */}
              <div className="mt-2 text-[11px] font-mono px-2 py-0.5 rounded bg-[#161822] text-[#9aa2b5] border border-[#252a3b]">
                Delta: {c2Speed - c1Speed >= 0 ? `+${c2Speed - c1Speed}` : c2Speed - c1Speed} km/h
              </div>
            </div>

            {/* Big Gear Display */}
            <div className="bg-[#0d0e14] border border-[#232735] rounded-xl p-4 flex flex-col items-center justify-center">
              <span className="text-[11px] font-mono text-[#8f96a8] tracking-widest uppercase">
                GEAR
              </span>
              <span className="font-mono font-black text-5xl text-amber-400 mt-1">
                {c2Gear > 0 ? c2Gear : 'N'}
              </span>
              <span className="text-[10px] font-mono text-[#8f96a8] mt-2">DOG RING</span>
            </div>
          </div>

          {/* Pedals: Throttle & Brake */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            {/* Throttle */}
            <div className="bg-[#0d0e14] border border-[#232735] rounded-lg p-2.5">
              <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                <span className="text-emerald-400 font-bold">THROTTLE</span>
                <span className="font-bold text-white">{c2Throttle}%</span>
              </div>
              <div className="w-full h-3 bg-[#191c28] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-75"
                  style={{ width: `${c2Throttle}%` }}
                />
              </div>
            </div>

            {/* Brake */}
            <div className="bg-[#0d0e14] border border-[#232735] rounded-lg p-2.5">
              <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                <span className="text-rose-400 font-bold">BRAKE</span>
                <span className="font-bold text-white">{c2Brake}%</span>
              </div>
              <div className="w-full h-3 bg-[#191c28] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-75"
                  style={{ width: `${c2Brake}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Synchronized Lap Delta Banner */}
      <div className="mt-5 p-3 rounded-lg bg-[#0d0e14] border border-[#202434] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-[#8f96a8]">Live Lap Delta at Current Point:</span>
          <span
            className={`font-black text-sm px-2 py-0.5 rounded ${
              timeDelta > 0
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
            }`}
          >
            {timeDelta > 0 ? `+${timeDelta.toFixed(3)}s` : `${timeDelta.toFixed(3)}s`}
          </span>
          <span className="text-[#71788d]">
            ({timeDelta > 0 ? driver1?.name_acronym : driver2?.name_acronym} ahead)
          </span>
        </div>

        <div className="text-[#71788d]">
          Lap Distance: <span className="text-white font-bold">{currentPoint ? currentPoint.distance : 2400}m</span> / 5,300m
        </div>
      </div>
    </div>
  );
};
